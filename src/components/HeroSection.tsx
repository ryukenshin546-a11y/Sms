import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroImage from '@/assets/hero-marketing-platform.jpg';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
                แพลตฟอร์ม
                <span className="text-primary"> การตลาดดิจิทัล </span>
                ที่ครบครัน
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                เพิ่มยอดขายด้วยระบบการตลาดอัตโนมัติที่รวม SMS, Email และ LINE 
                ในแพลตฟอร์มเดียว พร้อมเครื่องมือวิเคราะห์ที่ทรงพลัง
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-lg px-8 py-4 transition-bounce shadow-professional"
                asChild
              >
                <a href="/register">
                  เริ่มต้นใช้งาน
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 transition-professional"
                asChild
              >
                <a href="/pricing">
                  <Play className="mr-2 h-5 w-5" />
                  ดูราคา
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-6 md:pt-8">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">ไม่มีค่าติดตั้ง</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">ทดลองใช้ 14 วัน</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">ยกเลิกได้ตลอดเวลา</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-professional">
              <img 
                src={heroImage} 
                alt="แพลตฟอร์มการตลาดดิจิทัล MarketPro"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-card rounded-xl p-3 md:p-4 shadow-professional border">
              <div className="text-xl md:text-2xl font-bold text-primary">99.9%</div>
              <div className="text-xs md:text-sm text-muted-foreground">อัตราการส่งสำเร็จ</div>
            </div>
            
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-card rounded-xl p-3 md:p-4 shadow-professional border">
              <div className="text-xl md:text-2xl font-bold text-accent">50K+</div>
              <div className="text-xs md:text-sm text-muted-foreground">ลูกค้าที่ไว้วางใจ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;