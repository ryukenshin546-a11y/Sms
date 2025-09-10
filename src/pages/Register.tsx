import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Clock, CreditCard, Users } from 'lucide-react';

const Register = () => {
  const benefits = [
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: 'ปลอดภัย 100%',
      description: 'ระบบความปลอดภัยระดับธนาคาร'
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: 'เริ่มใช้ได้ทันที',
      description: 'ใช้งานได้ใน 5 นาที หลังสมัคร'
    },
    {
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      title: 'ไม่มีค่าติดตั้ง',
      description: 'ไม่เสียค่าใช้จ่ายในการเริ่มต้น'
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: 'ซัพพอร์ต 24/7',
      description: 'ทีมช่วยเหลือพร้อมให้บริการ'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                เริ่มต้นใช้งาน MarketPro
              </h1>
              <p className="text-xl text-muted-foreground">
                สมัครสมาชิกและเริ่มเพิ่มยอดขายได้ทันที
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Registration Form */}
              <Card className="shadow-professional">
                <CardHeader>
                  <CardTitle className="text-2xl">สร้างบัญชีใหม่</CardTitle>
                  <CardDescription>
                    กรอกข้อมูลเพื่อเริ่มทดลองใช้ฟรี 14 วัน
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">ชื่อ</Label>
                      <Input id="firstName" placeholder="ชื่อของคุณ" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">นามสกุล</Label>
                      <Input id="lastName" placeholder="นามสกุลของคุณ" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input id="phone" placeholder="08x-xxx-xxxx" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">ชื่อบริษัท</Label>
                    <Input id="company" placeholder="บริษัทของคุณ" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">ประเภทธุรกิจ</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">ค้าปลีก/ค้าส่ง</SelectItem>
                        <SelectItem value="service">ธุรกิจบริการ</SelectItem>
                        <SelectItem value="education">การศึกษา</SelectItem>
                        <SelectItem value="healthcare">สุขภาพ</SelectItem>
                        <SelectItem value="finance">การเงิน</SelectItem>
                        <SelectItem value="technology">เทคโนโลยี</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <Input id="password" type="password" placeholder="รหัสผ่านขั้นต่ำ 8 ตัวอักษร" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground">
                      ฉันยอมรับ{" "}
                      <a href="#terms" className="text-primary hover:underline">
                        ข้อกำหนดการใช้งาน
                      </a>{" "}
                      และ{" "}
                      <a href="#privacy" className="text-primary hover:underline">
                        นโยบายความเป็นส่วนตัว
                      </a>
                    </Label>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    เริ่มทดลองใช้ฟรี 14 วัน
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    มีบัญชีอยู่แล้ว?{" "}
                    <a href="#login" className="text-primary hover:underline font-medium">
                      เข้าสู่ระบบ
                    </a>
                  </p>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    ทำไมต้อง MarketPro?
                  </h3>
                  <div className="space-y-6">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            {benefit.title}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Indicators */}
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-accent mb-4">
                      🎉 โปรโมชั่นพิเศษ
                    </h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>ทดลองใช้ฟรี 14 วัน ไม่มีค่าใช้จ่าย</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>Setup ฟรี มูลค่า 5,000 บาท</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>ซัพพอร์ตเต็มรูปแบบจากทีมผู้เชี่ยวชาญ</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Register;