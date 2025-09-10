import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Mail, Smartphone, BarChart3, Users, Zap } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const FeaturesSection = () => {
  const { ref: featuresRef, isInView: featuresInView } = useInView({ threshold: 0.1 });
  const { ref: additionalRef, isInView: additionalInView } = useInView({ threshold: 0.1 });

  const mainFeatures = [
    {
      icon: MessageSquare,
      title: 'LINE Marketing',
      description: 'ส่งข้อความและโปรโมชั่นผ่าน LINE Official Account พร้อมระบบแชทบอทอัตโนมัติ',
      color: 'text-green-600'
    },
    {
      icon: Mail,
      title: 'Email Marketing',
      description: 'สร้างอีเมลแคมเปญที่สวยงามด้วยเครื่องมือแบบลากวาง พร้อมระบบ A/B Testing',
      color: 'text-blue-600'
    },
    {
      icon: Smartphone,
      title: 'SMS Marketing',
      description: 'ส่ง SMS โปรโมชั่นและแจ้งเตือนถึงลูกค้าได้ทันที ด้วยอัตราการเปิดอ่านสูงถึง 98%',
      color: 'text-purple-600'
    }
  ];

  const additionalFeatures = [
    {
      icon: BarChart3,
      title: 'รายงานและวิเคราะห์',
      description: 'ติดตามผลการตลาดแบบเรียลไทม์ พร้วมข้อมูลเชิงลึกเพื่อปรับปรุงแคมเปญ'
    },
    {
      icon: Users,
      title: 'จัดการลูกค้า',
      description: 'ระบบ CRM ในตัวสำหรับจัดกลุ่มลูกค้าและส่งข้อความเฉพาะกลุ่ม'
    },
    {
      icon: Zap,
      title: 'ระบบอัตโนมัติ',
      description: 'ตั้งค่าการส่งข้อความอัตโนมัติตามพฤติกรรมลูกค้า เพิ่มประสิทธิภาพการขาย'
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
            บริการการตลาดที่ครบครัน
            <span className="text-primary"> ในแพลตฟอร์มเดียว</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            รวมทุกช่องทางการตลาดดิจิทัลที่สำคัญ พร้อมเครื่องมือวิเคราะห์ที่ทรงพลัง
            เพื่อให้คุณเข้าถึงลูกค้าได้อย่างมีประสิทธิภาพ
          </p>
        </div>

        {/* Main Features */}
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-large transition-all duration-500 border-0 shadow-professional bg-card hover:scale-[1.02] ${
                featuresInView 
                  ? 'animate-fade-in opacity-100' 
                  : 'opacity-0'
              }`}
              style={{
                animationDelay: featuresInView ? `${index * 200}ms` : '0ms'
              }}
            >
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background mb-6 ${feature.color} group-hover:scale-110 transition-bounce`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div ref={additionalRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index} 
              className={`flex items-start space-x-4 p-6 rounded-xl bg-card border border-border/50 hover:shadow-medium transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 ${
                additionalInView 
                  ? 'animate-slide-up opacity-100' 
                  : 'opacity-0'
              }`}
              style={{
                animationDelay: additionalInView ? `${index * 150}ms` : '0ms'
              }}
            >
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;