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
import type { UserGenerationData } from '@/services/smsBotService';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Phone, Building, Eye, EyeOff, Copy, ExternalLink, Settings, Activity, AlertTriangle } from 'lucide-react';
import { smsAccountAPI, GenerationStatus } from '@/api/smsAccount';
import { smsGenerationQueue } from '@/services/queueService';
import { DatabaseService } from '@/services/databaseService';

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

  // SMS Account state
  const [smsAccount, setSmsAccount] = useState<GenerationStatus>({ 
    status: 'not-generated' 
  });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // โหลดข้อมูล SMS account เมื่อ component mount
  useEffect(() => {
    loadSMSAccountData();
    loadActivityLogs();
  }, []);

  // โหลดข้อมูล SMS account
  const loadSMSAccountData = async () => {
    try {
      const accountData = await smsAccountAPI.getSMSAccount('user123');
      setSmsAccount(accountData);
    } catch (error) {
      console.error('ไม่สามารถโหลดข้อมูล SMS account:', error);
    }
  };

  // โหลด activity logs
  const loadActivityLogs = async () => {
    try {
      const logs = await DatabaseService.getUserActivityLogs('user123');
      setActivityLogs(logs);
    } catch (error) {
      console.error('ไม่สามารถโหลด activity logs:', error);
    }
  };

  // ฟังก์ชันสำหรับ Generate SMS Account แบบใหม่
  const generateSMSAccount = async () => {
    try {
      setSmsAccount({ status: 'generating', progress: 0, currentStep: 'เริ่มต้นกระบวนการ' });

      // เพิ่ม job เข้า queue
      const jobId = await smsGenerationQueue.addJob('user123', userData, 1);
      setCurrentJobId(jobId);

      // ตรวจสอบสถานะ job แบบ polling
      const pollInterval = setInterval(async () => {
        const job = smsGenerationQueue.getJob(jobId);
        
        if (job) {
          if (job.status === 'completed') {
            setSmsAccount({
              status: 'generated',
              credentials: {
                username: 'test123',
                email: 'test123@gmail.com',
                password: '@Test1234',
                originalEmail: userData.email,
                createdAt: new Date().toISOString()
              }
            });
            clearInterval(pollInterval);
            setCurrentJobId(null);
            
            // บันทึก activity log
            await DatabaseService.logActivity(
              'user123', 
              'sms_account_created', 
              'สร้างบัญชี SMS สำเร็จ'
            );
            loadActivityLogs();

          } else if (job.status === 'failed') {
            setSmsAccount({
              status: 'error',
              error: job.error || 'เกิดข้อผิดพลาดในการสร้างบัญชี'
            });
            clearInterval(pollInterval);
            setCurrentJobId(null);

          } else if (job.status === 'active') {
            setSmsAccount({
              status: 'generating',
              progress: job.progress,
              currentStep: getStepFromProgress(job.progress)
            });
          }
        }
      }, 1000); // ตรวจสอบทุก 1 วินาที

      // หยุด polling หลังจาก 5 นาที (timeout)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (smsAccount.status === 'generating') {
          setSmsAccount({
            status: 'error',
            error: 'การสร้างบัญชีใช้เวลานานเกินไป กรุณาลองใหม่'
          });
          setCurrentJobId(null);
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('ไม่สามารถเริ่มการสร้างบัญชี:', error);
      setSmsAccount({
        status: 'error',
        error: 'ไม่สามารถเริ่มการสร้างบัญชีได้ กรุณาลองใหม่'
      });
    }
  };

  // แปลง progress เป็น step description
  const getStepFromProgress = (progress: number): string => {
    if (progress < 30) return 'เชื่อมต่อระบบ SMS';
    if (progress < 70) return 'สร้างบัญชีผู้ใช้';
    if (progress < 100) return 'ตั้งค่าบัญชี';
    return 'เสร็จสิ้น';
  };

  // รีเซ็ท SMS account
  const resetSMSAccount = async () => {
    try {
      await smsAccountAPI.resetSMSAccount('user123');
      setSmsAccount({ status: 'not-generated' });
      
      // บันทึก activity log
      await DatabaseService.logActivity(
        'user123', 
        'sms_account_reset', 
        'รีเซ็ทบัญชี SMS'
      );
      loadActivityLogs();
      
    } catch (error) {
      console.error('ไม่สามารถรีเซ็ทบัญชีได้:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

        {/* SMS Account Management Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>SMS Account Management</CardTitle>
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
                    สร้างบัญชี SMS เพื่อเริ่มใช้งานบริการส่งข้อความของเรา
                  </p>
                  <Button onClick={generateSMSAccount} size="lg">
                    Generate Account
                  </Button>
                </div>
              )}

              {smsAccount.status === 'generating' && (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    กำลังสร้างบัญชี SMS...
                  </p>
                  
                  {/* Progress Bar */}
                  {smsAccount.progress !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${smsAccount.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Process Steps */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        (smsAccount.progress || 0) > 10 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={
                        smsAccount.currentStep === 'เชื่อมต่อระบบ SMS' ? 'font-medium text-blue-600' : ''
                      }>เชื่อมต่อระบบ SMS</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      {smsAccount.currentStep === 'สร้างบัญชีผู้ใช้' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <div className={`w-2 h-2 rounded-full ${
                          (smsAccount.progress || 0) > 50 ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                      <span className={
                        smsAccount.currentStep === 'สร้างบัญชีผู้ใช้' ? 'font-medium text-blue-600' : ''
                      }>สร้างบัญชีผู้ใช้</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      {smsAccount.currentStep === 'ตั้งค่าบัญชี' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <div className={`w-2 h-2 rounded-full ${
                          (smsAccount.progress || 0) >= 100 ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                      <span className={
                        smsAccount.currentStep === 'ตั้งค่าบัญชี' ? 'font-medium text-blue-600' : ''
                      }>ตั้งค่าบัญชี</span>
                    </div>
                  </div>
                  
                  {/* Current Job Info */}
                  {currentJobId && (
                    <div className="mt-4 text-xs text-gray-500">
                      Job ID: {currentJobId}
                    </div>
                  )}
                  
                  {/* Queue Stats */}
                  <div className="mt-4 text-xs text-gray-500">
                    Queue Stats: {JSON.stringify(smsGenerationQueue.getQueueStats())}
                  </div>
                </div>
              )}

              {smsAccount.status === 'generated' && smsAccount.credentials && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800">
                      บัญชี SMS พร้อมใช้งาน
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <Label className="text-sm font-medium">Username</Label>
                        <p className="text-sm text-muted-foreground">{smsAccount.credentials.username}</p>
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
                        <p className="text-sm text-muted-foreground">{smsAccount.credentials.email}</p>
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
                        <p className="text-sm text-muted-foreground">
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
                    <Button className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      เข้าสู่ระบบ SMS
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={resetSMSAccount}>
                      รีเซ็ทบัญชี
                    </Button>
                  </div>
                </div>
              )}

              {smsAccount.status === 'error' && (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4 flex items-center justify-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <Badge variant="destructive">
                      เกิดข้อผิดพลาดในการสร้างบัญชี
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {smsAccount.error || 'กรุณาลองใหม่อีกครั้ง'}
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <Button onClick={generateSMSAccount}>
                      ลองอีกครั้ง
                    </Button>
                    <Button variant="outline">
                      ติดต่อฝ่ายสนับสนุน
                    </Button>
                  </div>
                  
                  {/* Error Details for Development */}
                  {process.env.NODE_ENV === 'development' && smsAccount.error && (
                    <div className="mt-4 p-3 bg-red-50 rounded text-xs text-left">
                      <strong>Error Details:</strong>
                      <pre className="mt-1 overflow-x-auto">{smsAccount.error}</pre>
                    </div>
                  )}
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
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.action === 'sms_account_created' ? 'bg-blue-500' :
                        log.action === 'credits_added' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('th-TH')}
                        </p>
                        {log.metadata && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(log.metadata)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">ยังไม่มีกิจกรรม</p>
                  </div>
                )}
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
