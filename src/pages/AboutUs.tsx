import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Shield, Lock, Clock, CheckCircle, Users, Phone, Mail, MessageSquare } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-black text-foreground mb-8 leading-tight">
              ทำไมต้องเลือก
              <span className="block text-primary">SMS-UP+?</span>
            </h1>
            <p className="text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              บริการส่งข้อความ SMS ที่เชื่อถือได้และมีประสิทธิภาพสูง
              เข้าร่วมธุรกิจมากกว่า 50,000 แห่งที่ไว้วางใจเราในการส่งข้อความสำคัญ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/register'}
              >
                เริ่มต้นใช้งาน
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/pricing'}
              >
                ดูราคา
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Strengths Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                จุดแข็งหลักของเรา
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                สิ่งที่ทำให้เราแตกต่างในตลาดบริการส่ง SMS
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pricing */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DollarSign className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
                    ราคาที่แข่งขันได้
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    ราคาที่สมเหตุสมผลและโปร่งใส ไม่มีค่าธรรมเนียมซ่อนเร้น
                    เหมาะสำหรับธุรกิจทุกขนาด
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>เริ่มต้นที่ 0.15 บาทต่อข้อความ</span>
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>ส่วนลดพิเศษเมื่อใช้ปริมาณมาก</span>
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>ไม่มีค่าติดตั้งหรือค่าบริการรายเดือน</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Stability */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    ความน่าเชื่อถือสูง
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    ระบบที่เสถียรและเชื่อถือได้ เพื่อให้มั่นใจว่าข้อความจะถึงผู้รับเสมอ
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>รับประกันการทำงาน 99.9%</span>
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>ระบบสำรองเพื่อป้องกันการหยุดทำงาน</span>
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>การตรวจสอบระบบแบบเรียลไทม์</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    ความปลอดภัยระดับสูง
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    การปกป้องข้อมูลระดับองค์กร เพื่อความปลอดภัยของข้อมูลคุณและลูกค้า
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span>การเข้ารหัสข้อมูล SSL 256 บิต</span>
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span>ปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล</span>
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span>การตรวจสอบความปลอดภัยอย่างสม่ำเสมอ</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SLA Guarantee Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold">
                ข้อตกลงระดับการให้บริการ
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                การรับประกันคุณภาพบริการ
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                เรามุ่งมั่นในการให้บริการที่มีคุณภาพสูงสุด และพร้อมรับผิดชอบต่อผลลัพธ์
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground font-semibold">การรับประกันการทำงาน</div>
                <div className="text-sm text-muted-foreground mt-1">หยุดทำงานไม่เกิน 8.77 ชั่วโมงต่อปี</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">98.5%</div>
                <div className="text-muted-foreground font-semibold">อัตราการส่งสำเร็จ</div>
                <div className="text-sm text-muted-foreground mt-1">มาตรฐานสูงสุดในอุตสาหกรรม</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">&lt;30 วินาที</div>
                <div className="text-muted-foreground font-semibold">เวลาตอบสนอง</div>
                <div className="text-sm text-muted-foreground mt-1">เวลาเฉลี่ยในการส่งข้อความ</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">24/7</div>
                <div className="text-muted-foreground font-semibold">การตรวจสอบระบบ</div>
                <div className="text-sm text-muted-foreground mt-1">ตรวจสอบอย่างต่อเนื่องตลอด 24 ชั่วโมง</div>
              </div>
            </div>

            <Card className="shadow-lg border-0 bg-white dark:bg-card">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      การรับประกันทางการเงิน
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      หากเราไม่สามารถปฏิบัติตามข้อผูกพันในการให้บริการ คุณจะได้รับเครดิตบริการ
                      ซึ่งจะถูกนำไปใช้โดยอัตโนมัติในรอบการเรียกเก็บเงินครั้งต่อไป
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">เครดิต 10% สำหรับการทำงานต่ำกว่า 99.9%</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">เครดิต 5% สำหรับอัตราการส่งต่ำกว่า 98%</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">เครดิตจะถูกนำไปใช้ภายใน 30 วัน</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ความพึงพอใจของคุณคือการรับประกันของเรา
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                การสนับสนุนผู้เชี่ยวชาญ 24/7
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                ทีมสนับสนุนเฉพาะของเราพร้อมช่วยคุณให้ประสบความสำเร็จเสมอ
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        บริการสนับสนุน 24 ชั่วโมง
                      </h3>
                      <p className="text-muted-foreground">
                        ทีมงานของเราพร้อมให้บริการทุกวันตลอด 24 ชั่วโมง รวมถึงวันหยุด
                        เพื่อให้ความช่วยเหลือคุณได้ทุกเมื่อที่ต้องการ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        ผู้เชี่ยวชาญด้านเทคนิค
                      </h3>
                      <p className="text-muted-foreground">
                        ทีมงานสนับสนุนของเรามีความรู้เชิงลึกด้านเทคโนโลยี SMS
                        และพร้อมให้คำปรึกษาในการปรับแต่งการใช้งานเพื่อผลลัพธ์ที่ดีที่สุด
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        ช่องทางการติดต่อหลากหลาย
                      </h3>
                      <p className="text-muted-foreground">
                        คุณสามารถติดต่อเราได้ผ่านโทรศัพท์ อีเมล แชทออนไลน์ หรือศูนย์ช่วยเหลือ
                        เลือกช่องทางที่สะดวกสำหรับคุณ
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="shadow-lg border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">ติดต่อฝ่ายสนับสนุน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">การสนับสนุนทางโทรศัพท์</div>
                      <div className="text-sm text-muted-foreground">02-123-4567</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">การสนับสนุนทางอีเมล</div>
                      <div className="text-sm text-muted-foreground">support@SMS-UP+.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">แชทสด</div>
                      <div className="text-sm text-muted-foreground">พร้อมให้บริการ 24/7 บนเว็บไซต์ของเรา</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              พร้อมเริ่มต้นใช้งานหรือไม่?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              เข้าร่วมธุรกิจจำนวนมากที่ไว้วางใจเราในการส่งข้อความ SMS ที่มีประสิทธิภาพ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/register'}
              >
                สมัครใช้งาน
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold"
                onClick={() => window.location.href = '/pricing'}
              >
                ดูราคาและแพ็กเกจ
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;