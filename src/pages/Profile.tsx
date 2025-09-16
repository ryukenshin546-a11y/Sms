import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, User, Mail, Phone, Building, Eye, EyeOff, Copy, ExternalLink, Settings, Activity, AlertCircle, Bot, CheckCircle, XCircle } from 'lucide-react';
import { generateSMSAccount } from '@/services/smsBotService';
import type { GeneratedAccount } from '@/services/smsBotService';

const Profile = () => {
  // Mock user data - ในโปรดักชั่นจะดึงจาก API หรือ context
  const [userData] = useState({
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: 'somchai@example.com',
    phone: '0812345678',
    company: 'บริษัท ABC จำกัด',
    businessType: 'ค้าปลีก',
    creditBalance: 100,
    avatar: null
  });

  // SMS Account state with real Auto-Bot integration
  const [smsAccount, setSmsAccount] = useState<{
    status: 'not-generated' | 'generating' | 'generated' | 'error';
    credentials?: GeneratedAccount;
    error?: string;
    progress?: number;
    currentStep?: string;
  }>({ status: 'not-generated' });

  const [showPassword, setShowPassword] = useState(false);
  // Local editable form state for personal information and password
  const [personalForm, setPersonalForm] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });

  // Real Auto-Bot Process สำหรับ generate SMS account
  const generateSMSAccountReal = async () => {
    setSmsAccount({ 
      status: 'generating', 
      progress: 0,
      currentStep: 'เริ่มต้นกระบวนการ...' 
    });

    try {
      // ส่งข้อมูลผู้ใช้จริงไปกับ API call
      const credentials = await generateSMSAccount(
        (step: string, progress: number) => {
          setSmsAccount(prev => ({
            ...prev,
            progress,
            currentStep: step
          }));
        },
        {
          username: 'user_' + Math.floor(Math.random() * 10000), // ใช้ภาษาอังกฤษเพื่อความปลอดภัย
          email: userData.email,
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
  };

  const retryGeneration = () => {
    setSmsAccount({ status: 'not-generated' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Header Section (with avatar actions) */}
        <div className="mb-8 sm:mb-12">
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Avatar className="h-24 w-24 ring-2 ring-slate-100 shadow">
                    <AvatarImage src={userData.avatar || undefined} />
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {userData.firstName[0]}{userData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Upload new picture</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                    </div>
                    <div className="text-sm text-slate-600">Profile picture should be a clear headshot</div>
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                    {personalForm.firstName} {personalForm.lastName}
                  </h1>
                  <p className="text-sm text-slate-500">Account Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Balance Card */}
        <div className="mb-8 sm:mb-12">
          <Card className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-8 text-white relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Activity className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold leading-tight">
                      เครดิตคงเหลือ
                    </h2>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black leading-none">
                      {userData.creditBalance.toLocaleString()}
                    </span>
                    <span className="text-xl font-medium opacity-90">เครดิต</span>
                  </div>
                  <p className="text-sm opacity-80">พร้อมใช้งานสำหรับส่ง SMS</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-white text-emerald-600 hover:bg-white/90 font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      เติมเครดิต
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-medium transition-all duration-200"
                  >
                    ประวัติการใช้งาน
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information Section (form layout) */}
        <div className="mb-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Update your personal information</p>
            </CardHeader>
            <CardContent className="pt-2">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input id="firstName" value={personalForm.firstName} onChange={(e) => setPersonalForm(prev => ({ ...prev, firstName: e.target.value }))} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input id="lastName" value={personalForm.lastName} onChange={(e) => setPersonalForm(prev => ({ ...prev, lastName: e.target.value }))} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input id="email" type="email" value={personalForm.email} onChange={(e) => setPersonalForm(prev => ({ ...prev, email: e.target.value }))} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input id="phone" value={personalForm.phone} onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))} className="mt-2" />
                </div>

                <div className="md:col-span-2 flex items-center justify-start gap-3 mt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Save changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Change Password - dedicated card */}
        <div className="mb-8 sm:mb-12">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Your new password must be different from previous used passwords</p>
            </CardHeader>
            <CardContent className="pt-2">
              <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                  <Input id="currentPassword" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))} className="mt-2" placeholder="Enter current password" />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                  <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))} className="mt-2" />
                </div>

                <div className="md:col-span-3 flex items-center justify-start mt-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Update Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* SMS Account Management Section - Real Auto-Bot Integration */}
        <div className="mb-8 sm:mb-12">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                SMS Account Management (Auto-Bot)
              </CardTitle>
              <p className="text-slate-600 mt-2">สร้างบัญชี SMS อัตโนมัติด้วยระบบ Auto-Bot ที่เชื่อมต่อกับ smsup-plus.com</p>
            </CardHeader>
            <CardContent className="pt-0">
              {smsAccount.status === 'not-generated' && (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Bot className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mb-4">
                      <Badge variant="secondary" className="text-blue-700 bg-blue-100 text-sm px-4 py-1 font-semibold">
                        ยังไม่ได้สร้างบัญชี SMS
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">เริ่มต้นใช้งาน Auto-Bot</h3>
                    <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
                      สร้างบัญชี SMS อัตโนมัติด้วยระบบ Auto-Bot ที่จะเชื่อมต่อกับ smsup-plus.com และจัดการทุกอย่างให้คุณ
                    </p>
                  </div>
                  <Button
                    onClick={generateSMSAccountReal}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] px-8 py-3"
                  >
                    🚀 เริ่ม Auto-Bot Generation
                  </Button>
                </div>
              )}

              {smsAccount.status === 'generating' && (
                <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">🤖 Auto-Bot กำลังทำงาน...</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {smsAccount.currentStep}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto mb-8">
                    <div className="bg-white rounded-full p-1 shadow-sm">
                      <Progress value={smsAccount.progress || 0} className="w-full h-3" />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm font-medium text-slate-600">ความคืบหน้า</span>
                      <span className="text-sm font-bold text-purple-600">{smsAccount.progress}%</span>
                    </div>
                  </div>

                  {/* Process Steps */}
                  <div className="max-w-lg mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        (smsAccount.progress || 0) >= 10 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          (smsAccount.progress || 0) >= 10 ? 'bg-green-500' : 'bg-slate-300'
                        }`}></div>
                        <span className="font-medium">เชื่อมต่อระบบ SMS</span>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        (smsAccount.progress || 0) >= 30 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          (smsAccount.progress || 0) >= 30 ? 'bg-green-500' : (smsAccount.progress || 0) >= 10 ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'
                        }`}></div>
                        <span className="font-medium">เข้าสู่ระบบ SMS</span>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        (smsAccount.progress || 0) >= 50 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          (smsAccount.progress || 0) >= 50 ? 'bg-green-500' : (smsAccount.progress || 0) >= 30 ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'
                        }`}></div>
                        <span className="font-medium">เข้าถึงหน้าจัดการ</span>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        (smsAccount.progress || 0) >= 70 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          (smsAccount.progress || 0) >= 70 ? 'bg-green-500' : (smsAccount.progress || 0) >= 50 ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'
                        }`}></div>
                        <span className="font-medium">สร้างบัญชีผู้ใช้</span>
                      </div>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-all col-span-2 ${
                        (smsAccount.progress || 0) >= 100 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          (smsAccount.progress || 0) >= 100 ? 'bg-green-500' : (smsAccount.progress || 0) >= 70 ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'
                        }`}></div>
                        <span className="font-medium">บันทึกข้อมูลสำเร็จ</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {smsAccount.status === 'generated' && smsAccount.credentials && (
                <div className="space-y-6">
                  <div className="text-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-sm px-4 py-1 font-semibold">
                      🎉 Auto-Bot สร้างบัญชี SMS สำเร็จ!
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold text-slate-700">Username</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(smsAccount.credentials!.username)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-slate-900 font-mono text-sm bg-white px-3 py-2 rounded border">{smsAccount.credentials.username}</p>
                    </div>

                    <div className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold text-slate-700">Email</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(smsAccount.credentials!.email)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-slate-900 font-mono text-sm bg-white px-3 py-2 rounded border">{smsAccount.credentials.email}</p>
                    </div>

                    <div className="group bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold text-slate-700">Password</Label>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(smsAccount.credentials!.password)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-slate-900 font-mono text-sm bg-white px-3 py-2 rounded border">
                        {showPassword ? smsAccount.credentials.password : '••••••••'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      เข้าสู่ระบบ SMS
                    </Button>
                    <Button variant="outline" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-all duration-200" onClick={retryGeneration}>
                      รีเซ็ทและสร้างใหม่
                    </Button>
                  </div>
                </div>
              )}

              {smsAccount.status === 'error' && (
                <div className="text-center py-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <Badge variant="destructive" className="text-sm px-4 py-1 font-semibold mb-3">
                      🚫 Auto-Bot เกิดข้อผิดพลาด
                    </Badge>
                    <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
                      {smsAccount.error || 'กรุณาลองใหม่อีกครั้ง'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                    <Button
                      onClick={generateSMSAccountReal}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                      🔄 ลอง Auto-Bot อีกครั้ง
                    </Button>
                    <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-all duration-200">
                      📞 ติดต่อฝ่ายสนับสนุน
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Settings & Security */}
        <div className="mb-8 sm:mb-12">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Settings className="h-6 w-6 text-indigo-600" />
                </div>
                การตั้งค่าและความปลอดภัย
              </CardTitle>
              <p className="text-slate-600 mt-2">จัดการการตั้งค่าบัญชีและความปลอดภัยของคุณ</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="group p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">เปลี่ยนรหัสผ่าน</h4>
                      <p className="text-sm text-slate-600">อัปเดตรหัสผ่านเพื่อความปลอดภัย</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4 border-slate-300 text-slate-700 hover:bg-slate-100">
                      เปลี่ยน
                    </Button>
                  </div>
                </div>

                <div className="group p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">การแจ้งเตือน</h4>
                      <p className="text-sm text-slate-600">จัดการการแจ้งเตือนทางอีเมล</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4 border-slate-300 text-slate-700 hover:bg-slate-100">
                      ตั้งค่า
                    </Button>
                  </div>
                </div>

                <div className="group p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:border-amber-300 transition-all duration-200 hover:shadow-sm md:col-span-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">การเข้าสู่ระบบสองขั้นตอน</h4>
                      <p className="text-sm text-slate-600">เพิ่มความปลอดภัยในการเข้าสู่ระบบ</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100">
                      เปิดใช้งาน
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Log */}
        <div className="mb-8 sm:mb-12">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
                กิจกรรมล่าสุด
              </CardTitle>
              <p className="text-slate-600 mt-2">ติดตามกิจกรรมและการเปลี่ยนแปลงในบัญชีของคุณ</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 mb-1">🤖 Auto-Bot สร้างบัญชี SMS สำเร็จ</p>
                    <p className="text-xs text-slate-600">2 ชั่วโมงที่แล้ว</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 mb-1">เติมเครดิต 100 เครดิต</p>
                    <p className="text-xs text-slate-600">1 วันที่แล้ว</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-shrink-0 w-3 h-3 bg-slate-400 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 mb-1">เข้าสู่ระบบ</p>
                    <p className="text-xs text-slate-600">2 วันที่แล้ว</p>
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

export default Profile;
