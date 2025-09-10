import { Card, CardContent } from '@/components/ui/card';
import { Award, Shield, TrendingUp, Clock } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const TrustSection = () => {
  const { ref: statsRef, isInView: statsInView } = useInView({ threshold: 0.1 });
  const { ref: awardsRef, isInView: awardsInView } = useInView({ threshold: 0.1 });

  const stats = [
    {
      icon: TrendingUp,
      number: '300%',
      label: 'เพิ่มยอดขายเฉลี่ย',
      description: 'ลูกค้าเพิ่มยอดขายได้มากกว่า 3 เท่า'
    },
    {
      icon: Award,
      number: '50,000+',
      label: 'ลูกค้าที่ไว้วางใจ',
      description: 'ธุรกิจทั่วประเทศไทยเลือกใช้บริการเรา'
    },
    {
      icon: Clock,
      number: '99.9%',
      label: 'ความเสถียรของระบบ',
      description: 'ระบบที่มั่นคง ใช้งานได้ตลอด 24/7'
    },
    {
      icon: Shield,
      number: '100%',
      label: 'ความปลอดภัยของข้อมูล',
      description: 'มาตรฐาน ISO 27001 และ PDPA'
    }
  ];

  const awards = [
    {
      title: 'Thailand Digital Award 2024',
      subtitle: 'Best Marketing Platform',
      year: '2024'
    },
    {
      title: 'DEPA Digital Excellence',
      subtitle: 'Outstanding SME Solution',
      year: '2023'
    },
    {
      title: 'Thailand Startup Award',
      subtitle: 'Best B2B Technology',
      year: '2023'
    }
  ];

  return (
    <section id="trust" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
            ความไว้วางใจที่
            <span className="text-primary"> พิสูจน์แล้ว</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            ด้วยประสบการณ์มากกว่า 5 ปี เราคือพันธมิตรที่เชื่อถือได้
            สำหรับธุรกิจที่ต้องการเติบโตอย่างยั่งยืน
          </p>
        </div>

        {/* Performance Stats */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-20">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-large transition-all duration-500 text-center border-0 shadow-professional hover:scale-[1.02] hover:border-primary/20 ${
                statsInView 
                  ? 'animate-fade-in opacity-100' 
                  : 'opacity-0'
              }`}
              style={{
                animationDelay: statsInView ? `${index * 150}ms` : '0ms'
              }}
            >
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-bounce">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-lg font-semibold mb-2">{stat.label}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Awards Section */}
        <div className="bg-muted/30 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
              รางวัลและการรับรอง
            </h3>
            <p className="text-muted-foreground">
              ได้รับการยอมรับจากหน่วยงานและองค์กรชั้นนำ
            </p>
          </div>

          <div ref={awardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {awards.map((award, index) => (
              <div 
                key={index} 
                className={`text-center group hover:scale-[1.05] transition-all duration-300 p-4 rounded-xl hover:bg-background/50 ${
                  awardsInView 
                    ? 'animate-slide-up opacity-100' 
                    : 'opacity-0'
                }`}
                style={{
                  animationDelay: awardsInView ? `${index * 200}ms` : '0ms'
                }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 text-accent mb-6 group-hover:scale-110 transition-bounce">
                  <Award className="h-10 w-10" />
                </div>
                <h4 className="font-bold text-lg mb-2">{award.title}</h4>
                <p className="text-muted-foreground text-sm mb-1">{award.subtitle}</p>
                <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full inline-block">
                  {award.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;