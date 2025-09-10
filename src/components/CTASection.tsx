import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const CTASection = () => {
  const benefits = [
    'ทดลองใช้ฟรี 14 วัน ไม่มีค่าใช้จ่าย',
    'ไม่ต้องผูกสัญญาระยะยาว',
    'ซัพพอร์ตภาษาไทย 24/7',
    'ติดตั้งและใช้งานได้ทันที',
    'มีทีมคอนซัลแตนต์ช่วยเหลือ'
  ];

  return (
    <section id="cta" className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA Content */}
          <div className="bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-16 shadow-professional border">
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
              เริ่มต้นเติบโตธุรกิจ
              <span className="text-primary"> วันนี้</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
              อย่าปล่อยให้โอกาสหลุดลอยไป เริ่มใช้ MarketPro 
              และเพิ่มยอดขายได้ตั้งแต่สัปดาห์แรก
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10 text-left max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-lg px-10 py-6 transition-bounce shadow-professional text-primary-foreground"
              >
                เริ่มทดลองใช้ฟรี
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 transition-professional"
              >
                ขอใบเสนอราคา
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 pt-6 md:pt-8 border-t border-border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">ไม่มีค่าธรรมเนียมแอบแฝง</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">รับประกันความพึงพอใจ</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">ยกเลิกได้ทุกเมื่อ</span>
              </div>
            </div>
          </div>

          {/* Urgency Message */}
          <div className="mt-8 p-6 bg-accent/10 rounded-2xl border border-accent/20">
            <p className="text-accent font-semibold">
              🔥 เฉพาะเดือนนี้ รับ Setup ฟรี มูลค่า 5,000 บาท 
              สำหรับ 100 บัญชีแรกเท่านั้น!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;