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
import { Loader2, User, Mail, Phone, Building, Eye, EyeOff, Copy, ExternalLink, Settings, Activity, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.avatar || undefined} />
                  <AvatarFallback className="text-lg">
                    {userData.firstName[0]}{userData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    สวัสดี, {userData.firstName} {userData.lastName}
                  </h1>
                  <p className="text-muted-foreground">
                    ยินดีต้อนรับสู่แดชบอร์ดของคุณ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Balance Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    เครดิตคงเหลือ
                  </h2>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-green-600">
                      {userData.creditBalance.toLocaleString()}
                    </span>
                    <span className="text-lg text-muted-foreground">เครดิต</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="default">
                    เติมเครดิต
                  </Button>
                  <Button variant="outline">
                    ประวัติการใช้งาน
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>ข้อมูลส่วนตัว</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ชื่อ-นามสกุล</Label>
                  <div className="flex items-center justify-between">
                    <span>{userData.firstName} {userData.lastName}</span>
                    <Button variant="ghost" size="sm">แก้ไข</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>อีเมล</Label>
                  <div className="flex items-center justify-between">
                    <span>{userData.email}</span>
                    <Button variant="ghost" size="sm">แก้ไข</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์</Label>
                  <div className="flex items-center justify-between">
                    <span>{userData.phone}</span>
                    <Button variant="ghost" size="sm">แก้ไข</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ชื่อบริษัท</Label>
                  <div className="flex items-center justify-between">
                    <span>{userData.company}</span>
                    <Button variant="ghost" size="sm">แก้ไข</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ประเภทธุรกิจ</Label>
                  <div className="flex items-center justify-between">
                    <span>{userData.businessType}</span>
                    <Button variant="ghost" size="sm">แก้ไข</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SMS Account Management Section - Real Auto-Bot Integration */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🤖 SMS Account Management (Auto-Bot)</CardTitle>
            </CardHeader>
            <CardContent>
              {smsAccount.status === 'not-generated' && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">
                      ยังไม่ได้สร้างบัญชี SMS
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    สร้างบัญชี SMS อัตโนมัติด้วยระบบ Auto-Bot ที่จะเชื่อมต่อกับ smsup-plus.com
                  </p>
                  <Button onClick={generateSMSAccountReal} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    🚀 เริ่ม Auto-Bot Generation
                  </Button>
                </div>
              )}

              {smsAccount.status === 'generating' && (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">🤖 Auto-Bot กำลังทำงาน...</h3>
                  <p className="text-muted-foreground mb-4">
                    {smsAccount.currentStep}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="max-w-md mx-auto mb-6">
                    <Progress value={smsAccount.progress || 0} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {smsAccount.progress}% เสร็จสิ้น
                    </p>
                  </div>

                  {/* Process Steps */}
                  <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${(smsAccount.progress || 0) >= 10 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>เชื่อมต่อระบบ SMS</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${(smsAccount.progress || 0) >= 30 ? 'bg-green-500' : (smsAccount.progress || 0) >= 10 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span>เข้าสู่ระบบ SMS</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${(smsAccount.progress || 0) >= 50 ? 'bg-green-500' : (smsAccount.progress || 0) >= 30 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span>เข้าถึงหน้าจัดการบัญชี</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${(smsAccount.progress || 0) >= 70 ? 'bg-green-500' : (smsAccount.progress || 0) >= 50 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span>สร้างบัญชีผู้ใช้</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${(smsAccount.progress || 0) >= 100 ? 'bg-green-500' : (smsAccount.progress || 0) >= 70 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span>บันทึกข้อมูลสำเร็จ</span>
                    </div>
                  </div>
                </div>
              )}

              {smsAccount.status === 'generated' && smsAccount.credentials && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 mb-4">
                      🎉 Auto-Bot สร้างบัญชี SMS สำเร็จ!
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <Label className="text-sm font-medium">Username</Label>
                        <p className="text-sm text-muted-foreground font-mono">{smsAccount.credentials.username}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(smsAccount.credentials!.username)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground font-mono">{smsAccount.credentials.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(smsAccount.credentials!.email)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <Label className="text-sm font-medium">Password</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          {showPassword ? smsAccount.credentials.password : '••••••••'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(smsAccount.credentials!.password)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      เข้าสู่ระบบ SMS
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={retryGeneration}>
                      รีเซ็ทและสร้างใหม่
                    </Button>
                  </div>
                </div>
              )}

              {smsAccount.status === 'error' && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <Badge variant="destructive">
                      🚫 Auto-Bot เกิดข้อผิดพลาด
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {smsAccount.error || 'กรุณาลองใหม่อีกครั้ง'}
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <Button onClick={generateSMSAccountReal} className="bg-blue-600 hover:bg-blue-700">
                      🔄 ลอง Auto-Bot อีกครั้ง
                    </Button>
                    <Button variant="outline">
                      📞 ติดต่อฝ่ายสนับสนุน
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Settings & Security */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>การตั้งค่าและความปลอดภัย</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">เปลี่ยนรหัสผ่าน</h4>
                    <p className="text-sm text-muted-foreground">อัปเดตรหัสผ่านเพื่อความปลอดภัย</p>
                  </div>
                  <Button variant="outline">เปลี่ยน</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">การแจ้งเตือน</h4>
                    <p className="text-sm text-muted-foreground">จัดการการแจ้งเตือนทางอีเมล</p>
                  </div>
                  <Button variant="outline">ตั้งค่า</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">การเข้าสู่ระบบสองขั้นตอน</h4>
                    <p className="text-sm text-muted-foreground">เพิ่มความปลอดภัยในการเข้าสู่ระบบ</p>
                  </div>
                  <Button variant="outline">เปิดใช้งาน</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Log */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>กิจกรรมล่าสุด</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">🤖 Auto-Bot สร้างบัญชี SMS สำเร็จ</p>
                    <p className="text-xs text-muted-foreground">2 ชั่วโมงที่แล้ว</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">เติมเครดิต 100 เครดิต</p>
                    <p className="text-xs text-muted-foreground">1 วันที่แล้ว</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">เข้าสู่ระบบ</p>
                    <p className="text-xs text-muted-foreground">2 วันที่แล้ว</p>
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
