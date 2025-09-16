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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Avatar className="h-20 w-20 ring-2 ring-slate-100 shadow-sm">
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-slate-900">{profile.first_name} {profile.last_name}</h1>
                      <span className="text-sm text-slate-500">@{profile.username}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-slate-100 text-slate-800">{profile.account_type === 'personal' ? 'บุคคล' : 'นิติบุคคล'}</Badge>
                      {profile.phone && <Badge className="bg-slate-50 text-slate-700">📱 {profile.phone}</Badge>}
                    </div>
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <Button variant="outline" size="sm" className="hidden sm:inline">Upload new picture</Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hidden sm:inline">Remove</Button>
                  {profile.can_use_autobot ? (
                    <Badge className="bg-green-100 text-green-800">สามารถใช้ Auto-Bot ได้</Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-800">ต้องยืนยันตัวตนก่อน</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Combined Content Card: Personal Info | Verification | Auto-Bot */}
        <div className="mb-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Personal Info */}
                <div className="p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">ข้อมูลส่วนตัว</h3>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => editMode ? handleCancelEdit() : setEditMode(true)}>{editMode ? 'ยกเลิก' : 'แก้ไข'}</Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">ชื่อ</Label>
                      <Input value={editMode ? editData.first_name : (profile.first_name || '')} onChange={(e) => editMode && setEditData(prev => ({ ...prev, first_name: e.target.value }))} disabled={!editMode || isSaving} className="mt-2" />
                    </div>

                    <div>
                      <Label className="text-sm">นามสกุล</Label>
                      <Input value={editMode ? editData.last_name : (profile.last_name || '')} onChange={(e) => editMode && setEditData(prev => ({ ...prev, last_name: e.target.value }))} disabled={!editMode || isSaving} className="mt-2" />
                    </div>

                    <div>
                      <Label className="text-sm">ชื่อผู้ใช้</Label>
                      <Input value={editMode ? editData.username : (profile.username || '')} onChange={(e) => editMode && setEditData(prev => ({ ...prev, username: e.target.value }))} disabled={!editMode || isSaving} className="mt-2" />
                    </div>

                    <div>
                      <Label className="text-sm">เบอร์โทรศัพท์</Label>
                      <Input value={editMode ? editData.phone : (profile.phone || '')} onChange={(e) => editMode && setEditData(prev => ({ ...prev, phone: e.target.value }))} disabled={!editMode || isSaving} className="mt-2" />
                      {profile.phone && <p className="text-xs text-slate-500 mt-1">สถานะ: {profile.phone_verified ? 'ยืนยันแล้ว ✅' : 'ยังไม่ยืนยัน ❌'}</p>}
                    </div>

                    <div>
                      <Label className="text-sm">อีเมล</Label>
                      <Input value={user.email || ''} disabled className="mt-2 bg-slate-50" />
                      <p className="text-xs text-slate-500 mt-1">สถานะ: {profile.email_verified ? 'ยืนยันแล้ว ✅' : 'ยังไม่ยืนยัน ❌'}</p>
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex items-center gap-2 pt-3">
                      <Button onClick={handleSaveProfile} className="flex-1">{isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'บันทึก'}</Button>
                      <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>ยกเลิก</Button>
                    </div>
                  )}
                </div>

                {/* Column 2: Verification */}
                <div className="p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">สถานะการยืนยันตัวตน</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">เบอร์โทรศัพท์</p>
                          <p className="text-sm text-slate-600">{profile.phone || 'ยังไม่ได้ระบุ'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.phone_verified ? (
                          <Badge className="bg-green-100 text-green-800">ยืนยันแล้ว</Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-50 text-red-700">ยังไม่ยืนยัน</Badge>
                            <Button size="sm" onClick={() => setOtpState(prev => ({ ...prev, isOpen: true, phone: profile.phone || '' }))}>ยืนยัน</Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <EmailVerification email={user.email || ''} isVerified={profile.email_verified || false} onVerificationStatusChange={(verified) => { setProfile(prev => prev ? { ...prev, email_verified: verified } : null); if (verified) fetchProfile(); }} />

                    <div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>ความคืบหน้าการยืนยัน</span>
                        <span>{Number(profile.phone_verified) + Number(profile.email_verified)}/2</span>
                      </div>
                      <Progress value={(Number(profile.phone_verified) + Number(profile.email_verified)) * 50} className="h-2" />
                    </div>

                    {!profile.can_use_autobot && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>คุณต้องยืนยันทั้งเบอร์โทรศัพท์และอีเมลก่อนจึงจะสามารถใช้งาน Auto-Bot ได้</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {otpState.isOpen && (
                    <div className="mt-4">
                      <div className="p-3 rounded-lg border bg-white">
                        <h4 className="font-semibold mb-2">ยืนยันเบอร์โทรศัพท์ด้วย OTP</h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                            <Input id="phone" value={otpState.phone} onChange={(e) => setOtpState(prev => ({ ...prev, phone: e.target.value, error: null }))} placeholder="0812345678" disabled={otpState.isSending || otpState.isVerifying} />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleSendOTP} disabled={otpState.isSending || otpState.isVerifying} className="flex-1">{otpState.isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'ส่ง OTP'}</Button>
                            <Button variant="outline" onClick={() => setOtpState(prev => ({ ...prev, isOpen: false, error: null }))}>ยกเลิก</Button>
                          </div>

                          <div>
                            <Label htmlFor="otp">รหัส OTP</Label>
                            <Input id="otp" value={otpState.otp} onChange={(e) => setOtpState(prev => ({ ...prev, otp: e.target.value, error: null }))} placeholder="ใส่รหัส 6 หลัก" maxLength={6} disabled={otpState.isSending || otpState.isVerifying} />
                          </div>

                          <Button onClick={handleVerifyOTP} disabled={otpState.isVerifying || otpState.isSending || !otpState.otp.trim()} className="w-full">{otpState.isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'ยืนยัน OTP'}</Button>

                          {otpState.error && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{otpState.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 3: Auto-Bot */}
                <div className="p-4 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">SMS Auto-Bot</h3>
                    </div>
                  </div>

                  <div>
                    {!profile.can_use_autobot ? (
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>คุณต้องยืนยันเบอร์โทรศัพท์และอีเมลก่อนจึงจะสามารถใช้งาน Auto-Bot ได้</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {smsAccount.status === 'not-generated' && (
                          <div className="text-center">
                            <p className="text-sm text-slate-600 mb-4">คลิกปุ่มด้านล่างเพื่อสร้างบัญชี SMS ใหม่</p>
                            <Button onClick={generateSMSAccountReal} size="lg" className="w-full">
                              <Bot className="h-4 w-4 mr-2" /> สร้างบัญชี SMS
                            </Button>
                          </div>
                        )}

                        {smsAccount.status === 'generating' && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>กำลังสร้างบัญชี SMS...</span>
                            </div>
                            <Progress value={smsAccount.progress} className="h-2" />
                            <p className="text-sm text-slate-600">{smsAccount.currentStep}</p>
                          </div>
                        )}

                        {smsAccount.status === 'generated' && smsAccount.credentials && (
                          <div className="space-y-3">
                            <Alert>
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>สร้างบัญชี SMS สำเร็จ! เก็บข้อมูลไว้ปลอดภัย</AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                              <div>
                                <Label>Email</Label>
                                <div className="flex gap-2 mt-2">
                                  <Input value={smsAccount.credentials.email} readOnly />
                                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(smsAccount.credentials!.email)}><Copy className="h-3 w-3" /></Button>
                                </div>
                              </div>

                              <div>
                                <Label>Password</Label>
                                <div className="flex gap-2 mt-2">
                                  <Input value={smsAccount.credentials.password} type={showPassword ? 'text' : 'password'} readOnly />
                                  <Button variant="outline" size="sm" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</Button>
                                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(smsAccount.credentials!.password)}><Copy className="h-3 w-3" /></Button>
                                </div>
                              </div>
                            </div>

                            <Button variant="outline" className="w-full" onClick={() => setSmsAccount({ status: 'not-generated' })}>สร้างบัญชีใหม่</Button>
                          </div>
                        )}

                        {smsAccount.status === 'error' && (
                          <div className="space-y-3">
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>เกิดข้อผิดพลาด: {smsAccount.error}</AlertDescription>
                            </Alert>
                            <Button variant="outline" className="w-full" onClick={() => setSmsAccount({ status: 'not-generated' })}>ลองใหม่</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile_Enhanced;