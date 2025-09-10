import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Lightbulb, Award, Globe, Clock } from 'lucide-react';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'นายสมชาย เทคโนโลยี',
      position: 'CEO & Founder',
      description: 'ผู้นำองค์กรด้วยประสบการณ์กว่า 20 ปีในอุตสาหกรรมเทคโนโลยี',
      image: '/placeholder.svg'
    },
    {
      name: 'นางสาวนิภา วิศวกรรม',
      position: 'CTO',
      description: 'ผู้เชี่ยวชาญด้านระบบเครือข่ายและการพัฒนาผลิตภัณฑ์',
      image: '/placeholder.svg'
    },
    {
      name: 'นายรัฐพล การตลาด',
      position: 'Head of Sales',
      description: 'ผู้เชี่ยวชาญด้านการขายและการบริการลูกค้าเป็นเลิศ',
      image: '/placeholder.svg'
    },
    {
      name: 'นางสาวจิรา สนับสนุน',
      position: 'Customer Success Manager',
      description: 'ผู้ดูแลให้ลูกค้าได้รับประสบการณ์ที่ดีที่สุด',
      image: '/placeholder.svg'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Reliability',
      titleTh: 'ความน่าเชื่อถือ',
      description: 'เราให้บริการที่เสถียรและเชื่อถือได้ตลอด 24/7 ด้วยระบบที่มีมาตรฐานสูง'
    },
    {
      icon: Users,
      title: 'Customer Focus',
      titleTh: 'ใส่ใจลูกค้า',
      description: 'ลูกค้าคือศูนย์กลางของทุกสิ่งที่เราทำ เราฟังและตอบสนองความต้องการอย่างใกล้ชิด'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      titleTh: 'นวัตกรรม',
      description: 'เราพัฒนาเทคโนโลยีใหม่ๆ อยู่เสมอเพื่อมอบประสบการณ์ที่ดีกว่าให้กับลูกค้า'
    }
  ];

  const stats = [
    { number: '18+', label: 'ปีของประสบการณ์' },
    { number: '10,000+', label: 'ลูกค้าที่ไว้วางใจ' },
    { number: '99.9%', label: 'อัตราการส่งสำเร็จ' },
    { number: '24/7', label: 'การให้บริการ' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Thaibulksms: ผู้นำบริการ SMS อันดับ 1 ของไทย
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              ด้วยประสบการณ์กว่า 18 ปีในการให้บริการ SMS Marketing เราได้ช่วยให้ธุรกิจนับหมื่นแห่งสื่อสารกับลูกค้าได้อย่างมีประสิทธิภาพ 
              พันธกิจของเราคือการเป็นสะพานเชื่อมระหว่างธุรกิจกับลูกค้า ผ่านการส่งข้อความที่รวดเร็ว เชื่อถือได้ และคุ้มค่า
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              เรื่องราวของเรา
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">การเริ่มต้น</h3>
                  <p className="text-muted-foreground">
                    เริ่มต้นจากความต้องการช่วยให้ธุรกิจไทยสื่อสารกับลูกค้าได้ดีขึ้น
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">ความเชี่ยวชาญ</h3>
                  <p className="text-muted-foreground">
                    พัฒนาเทคโนโลยีและบริการที่ตอบโจทย์ธุรกิจทุกขนาดอย่างต่อเนื่อง
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">อนาคต</h3>
                  <p className="text-muted-foreground">
                    มุ่งมั่นเป็นผู้นำด้านการสื่อสารธุรกิจในยุคดิจิทัลต่อไป
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              ทีมงานของเรา
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-professional">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {member.position}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              ค่านิยมของเรา
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="shadow-soft hover:shadow-medium transition-professional">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {value.titleTh}
                      </h3>
                      <p className="text-sm text-primary font-medium mb-4">
                        {value.title}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              พร้อมเริ่มต้นกับเราแล้วหรือยัง?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณและเริ่มส่งข้อความได้ทันที
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 text-lg"
              onClick={() => window.location.href = '/pricing'}
            >
              ดูแพ็กเกจของเรา
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;