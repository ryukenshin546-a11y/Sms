import React, { useState, useEffect } from 'react';
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
import { Loader2, User, Mail, Phone, Eye, EyeOff, Copy, CheckCircle, XCircle, AlertCircle, Bot, Shield, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { generateSMSAccount } from '@/services/smsBotService';
import { edgeFunctionOTPService } from '@/services/edgeFunctionOTPService';
import EmailVerification from '@/components/EmailVerification';
import type { GeneratedAccount } from '@/services/smsBotService';

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
    status: 'not-generated' | 'generating' | 'generated' | 'error';
    credentials?: GeneratedAccount;
    error?: string;
    progress?: number;
    currentStep?: string;
  }>({ status: 'not-generated' });

  const [showPassword, setShowPassword] = useState(false);
  
  // Personal Info Edit State
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    username: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

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

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
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
        can_use_autobot: (data?.phone_verified || false) && (data?.email_verified || false)
      };

      setProfile(profileData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
          error: null
        }));
        alert(`OTP ส่งไปยัง ${otpState.phone} แล้ว (Ref: ${result.referenceCode || 'N/A'})`);
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
        alert('กรุณาใส่ชื่อและนามสกุล');
        return;
      }

      // Basic phone validation if phone is provided
      if (editData.phone.trim()) {
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = editData.phone.replace(/[-\s]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          alert('กรุณาใส่เบอร์โทรศัพท์ที่ถูกต้อง (10 หลัก)');
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
        .eq('id', user.id);

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
      await fetchProfile();
      setEditMode(false);
      alert('บันทึกข้อมูลเรียบร้อย');
      
    } catch (error) {
      console.error('Save profile error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
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
              .eq('id', user.id);
              
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
          isVerifying: false,
          isOpen: false 
        }));

        // Refresh profile data
        await fetchProfile();
        
        alert('ยืนยันเบอร์โทรศัพท์สำเร็จ!');
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

  const generateSMSAccountReal = async () => {
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
        }
      );

      setSmsAccount({
        status: 'generated',
        credentials,
        progress: 100,
        currentStep: 'สำเร็จ!'
      });

    } catch (error) {
      console.error('SMS Account Generation Error:', error);
      setSmsAccount({
        status: 'error',
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        progress: 0,
        currentStep: 'ล้มเหลว'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอกแล้ว!');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
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
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-gray-600">@{profile.username}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{profile.account_type === 'personal' ? 'บุคคล' : 'นิติบุคคล'}</Badge>
                      {profile.phone && (
                        <Badge variant="outline" className="text-xs">
                          📱 {profile.phone}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">✉️ {user.email}</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="text-right">
                  <div className="space-y-2">
                    {profile.can_use_autobot ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Bot className="h-3 w-3 mr-1" />
                        สามารถใช้ Auto-Bot ได้
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <Shield className="h-3 w-3 mr-1" />
                        ต้องยืนยันตัวตนก่อน
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information - Left Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>ข้อมูลส่วนตัว</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editMode ? handleCancelEdit() : setEditMode(true)}
                    disabled={isSaving}
                  >
                    {editMode ? 'ยกเลิก' : 'แก้ไข'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="first_name">ชื่อ</Label>
                  <Input
                    id="first_name"
                    value={editMode ? editData.first_name : (profile.first_name || '')}
                    onChange={(e) => editMode && setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="ชื่อ"
                    disabled={!editMode || isSaving}
                  />
                </div>
                
                <div>
                  <Label htmlFor="last_name">นามสกุล</Label>
                  <Input
                    id="last_name"
                    value={editMode ? editData.last_name : (profile.last_name || '')}
                    onChange={(e) => editMode && setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="นามสกุล"
                    disabled={!editMode || isSaving}
                  />
                </div>

                <div>
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input
                    id="username"
                    value={editMode ? editData.username : (profile.username || '')}
                    onChange={(e) => editMode && setEditData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                    disabled={!editMode || isSaving}
                  />
                </div>

                <div>
                  <Label htmlFor="profile_phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="profile_phone"
                    value={editMode ? editData.phone : (profile.phone || '')}
                    onChange={(e) => editMode && setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0812345678"
                    disabled={!editMode || isSaving}
                  />
                  {profile.phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      สถานะ: {profile.phone_verified ? 'ยืนยันแล้ว ✅' : 'ยังไม่ยืนยัน ❌'}
                    </p>
                  )}
                </div>

                <div>
                  <Label>อีเมล</Label>
                  <Input
                    value={user.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    สถานะ: {profile.email_verified ? 'ยืนยันแล้ว ✅' : 'ยังไม่ยืนยัน ❌'}
                  </p>
                </div>

                {editMode && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      บันทึก
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      ยกเลิก
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification Status - Middle Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>สถานะการยืนยันตัวตน</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone Verification */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">เบอร์โทรศัพท์</p>
                      <p className="text-sm text-gray-600">{profile.phone || 'ยังไม่ได้ระบุ'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.phone_verified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        ยืนยันแล้ว
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          ยังไม่ยืนยัน
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => setOtpState(prev => ({ ...prev, isOpen: true, phone: profile.phone || '' }))}
                        >
                          ยืนยัน
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Email Verification */}
                <EmailVerification
                  email={user.email || ''}
                  isVerified={profile.email_verified || false}
                  onVerificationStatusChange={(verified) => {
                    setProfile(prev => prev ? { ...prev, email_verified: verified } : null);
                    // Also update the fetchProfile to refresh data
                    if (verified) {
                      fetchProfile();
                    }
                  }}
                />

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>ความคืบหน้าการยืนยัน</span>
                    <span>{Number(profile.phone_verified) + Number(profile.email_verified)}/2</span>
                  </div>
                  <Progress 
                    value={(Number(profile.phone_verified) + Number(profile.email_verified)) * 50} 
                    className="h-2"
                  />
                </div>

                {!profile.can_use_autobot && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      คุณต้องยืนยันทั้งเบอร์โทรศัพท์และอีเมลก่อนจึงจะสามารถใช้งาน Auto-Bot ได้
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* OTP Verification Modal */}
            {otpState.isOpen && (
              <Card>
                <CardHeader>
                  <CardTitle>ยืนยันเบอร์โทรศัพท์ด้วย OTP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={otpState.phone}
                      onChange={(e) => setOtpState(prev => ({ ...prev, phone: e.target.value, error: null }))}
                      placeholder="0812345678"
                      disabled={otpState.isSending || otpState.isVerifying}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSendOTP}
                      disabled={otpState.isSending || otpState.isVerifying}
                      className="flex-1"
                    >
                      {otpState.isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      ส่ง OTP
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setOtpState(prev => ({ ...prev, isOpen: false, error: null }))}
                      disabled={otpState.isSending || otpState.isVerifying}
                    >
                      ยกเลิก
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="otp">รหัส OTP</Label>
                    <Input
                      id="otp"
                      value={otpState.otp}
                      onChange={(e) => setOtpState(prev => ({ ...prev, otp: e.target.value, error: null }))}
                      placeholder="ใส่รหัส 6 หลัก"
                      maxLength={6}
                      disabled={otpState.isSending || otpState.isVerifying}
                    />
                  </div>

                  <Button 
                    onClick={handleVerifyOTP}
                    disabled={otpState.isVerifying || otpState.isSending || !otpState.otp.trim()}
                    className="w-full"
                  >
                    {otpState.isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    ยืนยัน OTP
                  </Button>

                  {otpState.error && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{otpState.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Auto-Bot Section - Right Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>SMS Auto-Bot</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!profile.can_use_autobot ? (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      คุณต้องยืนยันเบอร์โทรศัพท์และอีเมลก่อนจึงจะสามารถใช้งาน Auto-Bot ได้
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {smsAccount.status === 'not-generated' && (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">คลิกปุ่มด้านล่างเพื่อสร้างบัญชี SMS ใหม่</p>
                        <Button onClick={generateSMSAccountReal} size="lg">
                          <Bot className="h-4 w-4 mr-2" />
                          สร้างบัญชี SMS
                        </Button>
                      </div>
                    )}

                    {smsAccount.status === 'generating' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>กำลังสร้างบัญชี SMS...</span>
                        </div>
                        <Progress value={smsAccount.progress} />
                        <p className="text-sm text-gray-600">{smsAccount.currentStep}</p>
                      </div>
                    )}

                    {smsAccount.status === 'generated' && smsAccount.credentials && (
                      <div className="space-y-4">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            สร้างบัญชี SMS สำเร็จ! กรุณาเก็บข้อมูลนี้ไว้อย่างปลอดภัย
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <div>
                            <Label>Email</Label>
                            <div className="flex">
                              <Input value={smsAccount.credentials.email} readOnly />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyToClipboard(smsAccount.credentials!.email)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label>Password</Label>
                            <div className="flex">
                              <Input 
                                value={smsAccount.credentials.password} 
                                type={showPassword ? 'text' : 'password'}
                                readOnly 
                              />
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyToClipboard(smsAccount.credentials!.password)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => setSmsAccount({ status: 'not-generated' })}
                          variant="outline" 
                          className="w-full"
                        >
                          สร้างบัญชีใหม่
                        </Button>
                      </div>
                    )}

                    {smsAccount.status === 'error' && (
                      <div className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            เกิดข้อผิดพลาด: {smsAccount.error}
                          </AlertDescription>
                        </Alert>
                        <Button 
                          onClick={() => setSmsAccount({ status: 'not-generated' })}
                          variant="outline" 
                          className="w-full"
                        >
                          ลองใหม่
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile_Enhanced;