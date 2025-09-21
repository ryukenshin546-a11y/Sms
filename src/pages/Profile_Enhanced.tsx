import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, User, Mail, Phone, Eye, EyeOff, Copy, CheckCircle, XCircle, AlertCircle, Bot, Shield, Edit3, Edit, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { generateSMSAccount } from '@/services/smsAccountApiService';
import { edgeFunctionOTPService } from '@/services/edgeFunctionOTPService';
import { UserProfileService } from '@/services/userProfileService';
import CreditBalanceDisplay from '@/components/CreditBalanceDisplay';
import EmailVerification from '@/components/EmailVerification';
import type { GeneratedAccount } from '@/services/smsAccountApiService';

interface UserProfile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  account_type?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  can_use_autobot?: boolean;
  credit_balance?: number;
}

interface OTPVerificationState {
  isOpen: boolean;
  phone: string;
  otp: string;
  isVerifying: boolean;
  isSending: boolean;
  error: string | null;
  success: boolean;
  sessionToken?: string;
  referenceCode?: string;
}

const Profile_Enhanced = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpState, setOtpState] = useState<OTPVerificationState>({
    isOpen: false,
    phone: '',
    otp: '',
    isVerifying: false,
    isSending: false,
    error: null,
    success: false,
    sessionToken: '',
    referenceCode: ''
  });

  // SMS Account Generation State
  const [smsAccount, setSmsAccount] = useState<{
    status: 'not-generated' | 'generating' | 'generated' | 'error' | 'username-required';
    credentials?: GeneratedAccount;
    error?: string;
    progress?: number;
    currentStep?: string;
    duplicateUsername?: string;
  }>({ status: 'not-generated' });

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto dismiss after 3 seconds
  };
  // States
  
  // Personal Info Edit State
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    username: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // เพิ่ม visibility state เพื่อป้องกันการ fetch เมื่อ tab ไม่ active
  const [isVisible, setIsVisible] = useState(!document.hidden); // Initialize with current visibility
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);

  // ใช้ ref เพื่อเก็บ user ID ที่ไม่ trigger re-render
  const currentUserIdRef = useRef<string | null>(null);
  const hasInitialized = useRef(false);
  
  // เช็คว่า user เปลี่ยนจริงๆ โดยไม่ trigger re-render ไม่จำเป็น
  useEffect(() => {
    const newUserId = user?.id;
    if (newUserId && newUserId !== currentUserIdRef.current) {
      currentUserIdRef.current = newUserId;
      setHasFetchedProfile(false);
      setProfile(null);
    }
  }, [user?.id]); // ใช้แค่ครั้งเดียวเพื่อตรวจจับการเปลี่ยนแปลงจริง

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      const newVisibility = !document.hidden;
      
      // Debounce visibility changes เพื่อลด re-render
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setIsVisible(newVisibility);
      }, 100);
    };

    const handleFocus = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
    };

    const handleBlur = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []); // No dependencies - set up once only

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      return; // Skip silently
    }
    
    // เช็คว่า tab ยัง active อยู่หรือไม่
    if (document.hidden) {
      return; // Skip silently if not visible
    }
    
    // ป้องกันการ fetch ซ้ำถ้าเคยโหลดแล้ว (เว้นแต่ force refresh)
    if (hasFetchedProfile && !forceRefresh) {
      return; // Skip without logging
    }
    
    console.log('Fetching profile for user:', user.id, forceRefresh ? '(force refresh)' : '');
    setLoading(true);
    
    try {
      // Get profile data from user_profiles table
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      // Get credit balance using the service
      let creditBalance = 0;
      try {
        const creditData = await UserProfileService.getCreditBalance(user.id);
        creditBalance = creditData.credit_balance;
      } catch (creditError) {
        console.warn('Could not fetch credit balance:', creditError);
        // Use default from profile data if available
        creditBalance = data?.credit_balance || 0;
      }

      // Combine auth user data with profile data
      const profileData: UserProfile = {
        id: user.id,
        username: data?.username || user.user_metadata?.username || `user_${user.id.substring(0, 8)}`,
        first_name: data?.first_name || user.user_metadata?.first_name || '',
        last_name: data?.last_name || user.user_metadata?.last_name || '',
        phone: data?.phone || user.user_metadata?.phone || '',
        account_type: data?.account_type || user.user_metadata?.account_type || 'personal',
        phone_verified: data?.phone_verified || false,
        email_verified: data?.email_verified || false, // Use ONLY database value, no fallback
        can_use_autobot: (data?.phone_verified || false) && (data?.email_verified || false),
        credit_balance: creditBalance
      };

      setProfile(profileData);
      setHasFetchedProfile(true); // Mark as fetched
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, hasFetchedProfile]); // Only depend on user ID and fetch status

  useEffect(() => {
    // Only fetch if all conditions are met
    if (user?.id && !authLoading && isVisible && !hasFetchedProfile && user.id === currentUserIdRef.current) {
      fetchProfile();
    }
  }, [user?.id, authLoading, isVisible, hasFetchedProfile]); // Removed fetchProfile from dependencies

  useEffect(() => {
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        username: profile.username || ''
      });
    }
  }, [profile]);

  const handleSendOTP = async () => {
    if (!otpState.phone.trim()) {
      setOtpState(prev => ({ ...prev, error: 'กรุณาใส่เบอร์โทรศัพท์' }));
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = otpState.phone.replace(/[-\s]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setOtpState(prev => ({ ...prev, error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (10 หลัก)' }));
      return;
    }

    setOtpState(prev => ({ ...prev, isSending: true, error: null }));

    try {
      const result = await edgeFunctionOTPService.sendOTP({
        phoneNumber: cleanPhone,
        userId: user?.id
      });

      if (result.success && result.otpId) {
        setOtpState(prev => ({ 
          ...prev, 
          isSending: false,
          sessionToken: result.otpId,
          referenceCode: result.referenceCode || '',
          error: null,
          success: false // Reset success state when sending new OTP
        }));
        // ไม่แสดง alert แต่ให้ UI แสดงข้อมูล OTP ใน modal
        console.log(`✅ OTP ส่งไปยัง ${otpState.phone} แล้ว (Ref: ${result.referenceCode || 'N/A'})`);
      } else {
        setOtpState(prev => ({ 
          ...prev, 
          error: result.message, 
          isSending: false 
        }));
      }
    } catch (error) {
      setOtpState(prev => ({ 
        ...prev, 
        error: 'เกิดข้อผิดพลาดในการส่ง OTP', 
        isSending: false 
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Validate required fields
      if (!editData.first_name.trim() || !editData.last_name.trim()) {
        showToast('กรุณาใส่ชื่อและนามสกุล', 'error');
        return;
      }

      // Basic phone validation if phone is provided
      if (editData.phone.trim()) {
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = editData.phone.replace(/[-\s]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          showToast('กรุณาใส่เบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก)', 'error');
          return;
        }
      }

      // Update user_profiles table
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .update({
          first_name: editData.first_name.trim(),
          last_name: editData.last_name.trim(),
          phone: editData.phone.replace(/[-\s]/g, ''),
          username: editData.username.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Update user metadata as well
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: editData.first_name.trim(),
          last_name: editData.last_name.trim(),
          phone: editData.phone.replace(/[-\s]/g, ''),
          username: editData.username.trim()
        }
      });

      if (authError) {
        console.warn('Failed to update user metadata:', authError);
      }

      // Refresh profile data
      await fetchProfile(true); // Force refresh after update
      setEditMode(false);
      showToast('บันทึกข้อมูลเรียบร้อย', 'success');
      
    } catch (error) {
      console.error('Save profile error:', error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset edit data to original profile data
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        username: profile.username || ''
      });
    }
    setEditMode(false);
  };

  const handleVerifyOTP = async () => {
    if (!otpState.otp.trim()) {
      setOtpState(prev => ({ ...prev, error: 'กรุณาใส่รหัส OTP' }));
      return;
    }

    if (!otpState.sessionToken) {
      setOtpState(prev => ({ ...prev, error: 'กรุณาส่ง OTP ก่อน' }));
      return;
    }

    setOtpState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const result = await edgeFunctionOTPService.verifyOTP({
        otpId: otpState.sessionToken,
        referenceCode: otpState.referenceCode || '',
        otpCode: otpState.otp
      });

      if (result.success) {
        // Update user metadata to mark phone as verified
        const { error } = await supabase.auth.updateUser({
          data: {
            phone_verified: true,
            phone: otpState.phone,
            phone_verified_at: new Date().toISOString()
          }
        });

        if (error) {
          console.error('Auth update error:', error);
        }

        // อัพเดต user_profiles table ด้วย
        if (user) {
          try {
            const { error: profileError } = await (supabase as any)
              .from('user_profiles')
              .update({
                phone: otpState.phone,
                phone_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
              
            if (profileError) {
              console.warn('⚠️ Failed to update profile table:', profileError);
            } else {
              console.log('✅ Profile table updated with phone verification');
            }
          } catch (profileError) {
            console.error('Error updating profile table:', profileError);
          }
        }

        setOtpState(prev => ({ 
          ...prev, 
          success: true, 
          isVerifying: false 
          // ไม่ปิด modal ทันที เพื่อให้ user เห็นข้อความสำเร็จ
        }));

        // Refresh profile data
        await fetchProfile(true); // Force refresh after phone verification
        
        // ไม่ใช้ alert แต่ให้ UI แสดงข้อความสำเร็จใน modal
        console.log('✅ ยืนยันเบอร์โทรศัพท์สำเร็จ!');
      } else {
        setOtpState(prev => ({ 
          ...prev, 
          error: result.message, 
          isVerifying: false 
        }));
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      setOtpState(prev => ({ 
        ...prev, 
        error: 'เกิดข้อผิดพลาดในการยืนยัน OTP', 
        isVerifying: false 
      }));
    }
  };

  const generateSMSAccountReal = async (username?: string) => {
    setSmsAccount({ 
      status: 'generating', 
      progress: 0,
      currentStep: 'เริ่มต้นกระบวนการ...' 
    });

    try {
      const credentials = await generateSMSAccount(
        (step: string, progress: number) => {
          setSmsAccount(prev => ({
            ...prev,
            progress,
            currentStep: step
          }));
        },
        username // ส่ง username ที่ผู้ใช้กำหนด
      );

      setSmsAccount({
        status: 'generated',
        credentials,
        progress: 100,
        currentStep: 'สำเร็จ!'
      });

    } catch (error) {
      console.error('SMS Account Generation Error:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      
      // ตรวจสอบว่าเป็น error เรื่อง username ซ้ำไหม 
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // วิธีตรวจสอบที่แม่นยำ: 
      // 1. เช็ค explicit username duplicate messages
      // 2. หรือเช็ค non-2xx code ร่วมกับการที่มี username (แสดงว่าไม่ใช่ปัญหาอื่น)
      const isUsernameExists = 
        errorMessage.includes('USERNAME_ALREADY_EXISTS') ||
        errorMessage.includes('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว') ||
        errorMessage.includes('มีอยู่ในระบบแล้ว') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('Duplicate') ||
        errorMessage.includes('409') ||
        errorMessage.includes('Conflict') ||
        // สำหรับ case ที่ Supabase Functions client ไม่ส่ง detailed error
        // แต่ปกติ non-2xx จะเป็น username duplicate เมื่อมี username
        (errorMessage.includes('non-2xx status code') && (username || profile?.username));
      
      console.log('🔍 Error analysis:', {
        errorMessage,
        username: username || profile?.username,
        isUsernameExists
      });
      
      if (isUsernameExists) {
        console.log('📝 Detected username duplicate error, switching to username-required state');
        setSmsAccount({
          status: 'username-required',
          error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น',
          duplicateUsername: username || profile?.username,
          progress: 0,
          currentStep: 'ชื่อผู้ใช้ซ้ำ'
        });
      } else {
        setSmsAccount({
          status: 'error',
          error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
          progress: 0,
          currentStep: 'ล้มเหลว'
        });
      }
    }
  };

  const handleStartOver = () => {
    setSmsAccount({ status: 'not-generated' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('คัดลอกแล้ว!', 'success');
    }).catch(() => {
      showToast('ไม่สามารถคัดลอกได้ กรุณาเลือกและคัดลอกด้วยตนเอง', 'error');
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Loading Skeleton */}
          <div className="mb-6">
            <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
                      <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div className="h-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-slate-600 dark:text-gray-400">กำลังโหลดข้อมูลโปรไฟล์...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Avatar className="h-16 w-16 ring-2 ring-slate-200 dark:ring-gray-600">
                    <AvatarFallback className="text-lg font-semibold bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-gray-300">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-slate-900 dark:text-white">{profile.first_name} {profile.last_name}</h1>
                      <span className="text-sm text-slate-500 dark:text-gray-400">@{profile.username}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs">
                        {profile.account_type === 'personal' ? 'บุคคล' : 'นิติบุคคล'}
                      </Badge>
                      {profile.phone && (
                        <Badge className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs">
                          📱 {profile.phone}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-auto">
                  <CreditBalanceDisplay 
                    userId={user.id}
                    autoSync={true}
                    showSyncButton={true}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Combined Content Card: User Information | Actions */}
        <div className="mb-6">
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-8">
                {/* Column 1: User Information (Personal Details + Security + SMS Auto-Bot) */}
                <div className="space-y-6">

                  {/* Personal Details */}
                  <div id="profile-edit-section" className="p-6 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">ข้อมูลส่วนตัว</h3>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => editMode ? handleCancelEdit() : setEditMode(true)}
                        className="hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                      >
                        {editMode ? 'ยกเลิก' : 'แก้ไข'}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">ชื่อ</Label>
                          <Input 
                            value={editMode ? editData.first_name : (profile.first_name || '')} 
                            onChange={(e) => editMode && setEditData(prev => ({ ...prev, first_name: e.target.value }))} 
                            disabled={!editMode || isSaving} 
                            className={`mt-2 ${editMode ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' : 'bg-slate-50 dark:bg-gray-700'}`}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">นามสกุล</Label>
                          <Input 
                            value={editMode ? editData.last_name : (profile.last_name || '')} 
                            onChange={(e) => editMode && setEditData(prev => ({ ...prev, last_name: e.target.value }))} 
                            disabled={!editMode || isSaving} 
                            className={`mt-2 ${editMode ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' : 'bg-slate-50 dark:bg-gray-700'}`}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">ชื่อผู้ใช้</Label>
                        <Input 
                          value={editMode ? editData.username : (profile.username || '')} 
                          onChange={(e) => editMode && setEditData(prev => ({ ...prev, username: e.target.value }))} 
                          disabled={!editMode || isSaving} 
                          className={`mt-2 ${editMode ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' : 'bg-slate-50 dark:bg-gray-700'}`}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">เบอร์โทรศัพท์</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input 
                            value={editMode ? editData.phone : (profile.phone || '')} 
                            onChange={(e) => editMode && setEditData(prev => ({ ...prev, phone: e.target.value }))} 
                            disabled={!editMode || isSaving} 
                            className={`flex-1 ${editMode ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' : 'bg-slate-50 dark:bg-gray-700'}`}
                          />
                          {profile.phone_verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-500" />
                              {!editMode && profile.phone && (
                                <Button
                                  size="sm"
                                  onClick={() => setOtpState(prev => ({ ...prev, isOpen: true, phone: profile.phone || '' }))}
                                  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  ยืนยัน
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                          สถานะ: {profile.phone_verified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">อีเมล</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input 
                            value={user.email || ''} 
                            disabled 
                            className="flex-1 bg-slate-50 dark:bg-gray-700"
                          />
                          {profile.email_verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                          สถานะ: {profile.email_verified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                        </p>
                      </div>

                      
                    </div>

                    {editMode && (
                      <div className="flex items-center gap-3 pt-6 border-t border-slate-200 dark:border-gray-700 mt-6">
                        <Button 
                          onClick={handleSaveProfile} 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'บันทึก'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancelEdit} 
                          disabled={isSaving}
                          className="hover:bg-slate-50 dark:hover:bg-gray-700"
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* SMS Auto-Bot */}
                  <div className="p-6 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                      <Bot className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">SMS Auto-Bot</h3>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                        ✨ <strong>ระบบใหม่!</strong> สร้างบัญชี SMS อัตโนมัติด้วย Edge Function API 
                        ที่รวดเร็วกว่าและเสถียรกว่าระบบเก่า เพื่อเชื่อมต่อกับลูกค้าของคุณ
                        และเพิ่มประสิทธิภาพในการส่ง SMS แบบครบครัน
                      </p>
                    </div>

                    <div>
                      {!profile.can_use_autobot ? (
                        <Alert className="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 mb-4">
                          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <AlertDescription className="text-amber-800 dark:text-amber-200">
                            คุณต้องยืนยันเบอร์โทรศัพท์และอีเมลก่อนจึงจะสามารถใช้งาน SMS Auto-Bot ได้
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {smsAccount.status === 'not-generated' && (
                            <div className="text-center">
                              <Button 
                                onClick={() => generateSMSAccountReal()} 
                                size="lg" 
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                              >
                                <Bot className="h-5 w-5 mr-2" /> สร้างบัญชี SMS (API)
                              </Button>
                            </div>
                          )}

                          {smsAccount.status === 'username-required' && (
                            <div className="space-y-4">
                              {/* Popup สำหรับแจ้งเตือน Username ซ้ำ */}
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
                                  <div className="text-center space-y-4">
                                    <div className="flex justify-center">
                                      <AlertCircle className="h-12 w-12 text-orange-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                      ชื่อผู้ใช้ซ้ำ
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                      <p>ชื่อผู้ใช้ "<strong className="text-orange-600">{smsAccount.duplicateUsername}</strong>" มีอยู่ในระบบแล้ว</p>
                                      <p>กรุณาแก้ไขชื่อผู้ใช้ในส่วนโปรไฟล์ของคุณก่อน<br />แล้วจึงลองสร้างบัญชี SMS อีกครั้ง</p>
                                    </div>
                                    <div className="flex gap-3">
                                      <Button 
                                        onClick={() => {
                                          // เลื่อนไปยังส่วนแก้ไขโปรไฟล์
                                          const editSection = document.getElementById('profile-edit-section');
                                          if (editSection) {
                                            editSection.scrollIntoView({ behavior: 'smooth' });
                                          }
                                          // Reset SMS account status
                                          setSmsAccount({
                                            status: 'not-generated',
                                            error: null,
                                            progress: 0,
                                            currentStep: ''
                                          });
                                        }}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        แก้ไขโปรไฟล์
                                      </Button>
                                      <Button 
                                        onClick={handleStartOver}
                                        variant="outline" 
                                        className="flex-1"
                                      >
                                        ปิด
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {smsAccount.status === 'generating' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-center space-x-3">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                <span className="text-slate-700 dark:text-gray-300 font-medium">กำลังสร้างบัญชี SMS...</span>
                              </div>
                              <Progress value={smsAccount.progress} className="h-3 bg-slate-200 dark:bg-gray-700" />
                              <p className="text-sm text-slate-600 dark:text-gray-400 text-center">{smsAccount.currentStep}</p>
                            </div>
                          )}

                          {smsAccount.status === 'generated' && smsAccount.credentials && (
                            <div className="space-y-4">
                              <Alert className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <AlertDescription className="text-green-800 dark:text-green-200">
                                  <div className="space-y-1">
                                    <p className="font-semibold">✅ สร้างบัญชี SMS สำเร็จ!</p>
                                    <p className="text-sm">นำ <strong>Username</strong> และ <strong>Password</strong> ด้านล่างไป Login ในระบบ SMS</p>
                                    <p className="text-xs text-green-700 dark:text-green-300">
                                      💾 กรุณาเก็บข้อมูลนี้ไว้ปลอดภัย เพราะจะต้องใช้ในการเข้าสู่ระบบ
                                    </p>
                                  </div>
                                </AlertDescription>
                              </Alert>

                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">ชื่อผู้ใช้ (Username)</Label>
                                  <div className="flex gap-2 mt-2">
                                    <Input 
                                      value={smsAccount.credentials.username} 
                                      readOnly 
                                      className="bg-slate-50 dark:bg-gray-700 font-mono text-center"
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => copyToClipboard(smsAccount.credentials!.username)}
                                      className="hover:bg-blue-50 dark:hover:bg-gray-700"
                                      title="คัดลอก Username"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                    ใช้สำหรับ Login เข้าระบบ SMS
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">รหัสผ่าน (Password)</Label>
                                  <div className="flex gap-2 mt-2">
                                    <Input 
                                      value={smsAccount.credentials.password} 
                                      type={showPassword ? 'text' : 'password'} 
                                      readOnly 
                                      className="bg-slate-50 dark:bg-gray-700 font-mono"
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="hover:bg-blue-50 dark:hover:bg-gray-700"
                                      title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                                    >
                                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => copyToClipboard(smsAccount.credentials!.password)}
                                      className="hover:bg-blue-50 dark:hover:bg-gray-700"
                                      title="คัดลอกรหัสผ่าน"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                    ใช้คู่กับ Username สำหรับ Login เข้าระบบ SMS
                                  </p>
                                </div>

                                {smsAccount.credentials.sender && (
                                  <div>
                                    <Label className="text-sm font-medium text-slate-700 dark:text-gray-300">ชื่อผู้ส่ง (Sender)</Label>
                                    <div className="flex gap-2 mt-2">
                                      <Input 
                                        value={smsAccount.credentials.sender} 
                                        readOnly 
                                        className="bg-slate-50 dark:bg-gray-700 text-center font-semibold"
                                      />
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => copyToClipboard(smsAccount.credentials!.sender || '')}
                                        className="hover:bg-blue-50 dark:hover:bg-gray-700"
                                        title="คัดลอกชื่อผู้ส่ง"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                      ชื่อที่จะแสดงเมื่อส่ง SMS
                                    </p>
                                  </div>
                                )}
                              </div>

                              <Button 
                                variant="outline" 
                                className="w-full hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500" 
                                onClick={() => setSmsAccount({ status: 'not-generated' })}
                              >
                                สร้างบัญชีใหม่
                              </Button>
                            </div>
                          )}

                          {smsAccount.status === 'error' && (
                            <div className="space-y-4">
                              <Alert className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                <AlertDescription className="text-red-800 dark:text-red-200">
                                  เกิดข้อผิดพลาด: {smsAccount.error}
                                </AlertDescription>
                              </Alert>
                              <Button 
                                variant="outline" 
                                className="w-full hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500" 
                                onClick={() => setSmsAccount({ status: 'not-generated' })}
                              >
                                ลองใหม่
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </div>
              
              {/* OTP Verification Dialog */}
              {otpState.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                      ยืนยันเบอร์โทรศัพท์
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">เบอร์โทรศัพท์</Label>
                        <Input
                          value={otpState.phone}
                          onChange={(e) => setOtpState(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="0812345678"
                          className="mt-1"
                        />
                      </div>
                      
                      {/* แสดงสถานะการส่ง OTP */}
                      {otpState.sessionToken && !otpState.success && (
                        <div className="text-blue-600 text-sm bg-blue-50 p-2 rounded">
                          📱 OTP ส่งไปยัง {otpState.phone} แล้ว
                          {otpState.referenceCode && ` (Ref: ${otpState.referenceCode})`}
                          <br />กรุณากรอกรหัส OTP ที่ได้รับใน SMS
                        </div>
                      )}
                      
                      {otpState.sessionToken && (
                        <div>
                          <Label className="text-sm font-medium">รหัส OTP</Label>
                          <Input
                            value={otpState.otp}
                            onChange={(e) => setOtpState(prev => ({ ...prev, otp: e.target.value }))}
                            placeholder="123456"
                            className="mt-1"
                            maxLength={6}
                            disabled={otpState.success} // ปิดการแก้ไขเมื่อยืนยันสำเร็จแล้ว
                          />
                          {otpState.referenceCode && (
                            <p className="text-xs text-gray-500 mt-1">
                              รหัสอ้างอิง: {otpState.referenceCode}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {otpState.error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                          ❌ {otpState.error}
                        </div>
                      )}
                      
                      {otpState.success && (
                        <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200">
                          ✅ ยืนยันเบอร์โทรศัพท์สำเร็จ!
                          <br />สามารถปิดหน้าต่างนี้ได้แล้ว
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-4">
                        {!otpState.sessionToken ? (
                          <Button
                            onClick={handleSendOTP}
                            disabled={otpState.isSending}
                            className="flex-1"
                          >
                            {otpState.isSending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                กำลังส่ง...
                              </>
                            ) : (
                              'ส่ง OTP'
                            )}
                          </Button>
                        ) : otpState.success ? (
                          // แสดงปุ่มปิดเมื่อยืนยันสำเร็จแล้ว
                          <Button
                            onClick={() => setOtpState({
                              isOpen: false,
                              phone: '',
                              otp: '',
                              isVerifying: false,
                              isSending: false,
                              sessionToken: '',
                              referenceCode: '',
                              error: null,
                              success: false
                            })}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            ✅ เสร็จสิ้น
                          </Button>
                        ) : (
                          // แสดงปุ่มยืนยันเมื่อส่ง OTP แล้วแต่ยังไม่สำเร็จ
                          <Button
                            onClick={handleVerifyOTP}
                            disabled={otpState.isVerifying || !otpState.otp.trim()}
                            className="flex-1"
                          >
                            {otpState.isVerifying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                กำลังยืนยัน...
                              </>
                            ) : (
                              'ยืนยัน OTP'
                            )}
                          </Button>
                        )}
                        
                        {!otpState.success && (
                          <Button
                            variant="outline"
                            onClick={() => setOtpState({
                              isOpen: false,
                              phone: '',
                              otp: '',
                              isVerifying: false,
                              isSending: false,
                              sessionToken: '',
                              referenceCode: '',
                              error: null,
                              success: false
                            })}
                            className="flex-1"
                          >
                            ยกเลิก
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Alert className={`max-w-md ${
            toast.type === 'success' 
              ? 'border-green-200 bg-green-50 text-green-800' 
              : toast.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : toast.type === 'error' ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{toast.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile_Enhanced;