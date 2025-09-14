import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const TestimonialsSection = () => {
  const { ref: testimonialsRef, isInView: testimonialsInView } = useInView({ threshold: 0.1 });

  const testimonials = [
    {
      name: 'คุณสมชาย วงศ์ประเสริฐ',
      position: 'ผู้อำนวยการ',
      company: 'ABC Fashion',
      content: 'ใช้ SMS-UP+ มา 2 ปีแล้ว ยอดขายเพิ่มขึ้น 250% ระบบใช้งานง่าย ทีมซัพพอร์ตดีมาก ตอบเร็วทุกครั้ง',
      rating: 5,
      image: '👨‍💼'
    },
    {
      name: 'คุณนิรมล สุขใส',
      position: 'Marketing Manager',
      company: 'Beauty Plus',
      content: 'การรวม LINE, Email และ SMS ในที่เดียวช่วยประหยัดเวลาเยอะมาก รายงานเห็นผลชัดเจน ROI เพิ่มขึ้นทุกเดือน',
      rating: 5,
      image: '👩‍💼'
    },
    {
      name: 'คุณรัชต์ เจริญสุข',
      position: 'CEO',
      company: 'Tech Solutions Co.',
      content: 'ระบบอัตโนมัติช่วยให้เราส่งข้อความถึงลูกค้าได้ตรงเวลา conversion rate เพิ่มขึ้น 180% ใน 6 เดือน',
      rating: 5,
      image: '👨‍💻'
    },
    {
      name: 'คุณพิมพ์ใจ ใจดี',
      position: 'Owner',
      company: 'Café Sweet',
      content: 'ร้านเล็กๆ อย่างเราก็ใช้ได้ ราคาไม่แพง ฟีเจอร์ครบ ลูกค้าประจำเพิ่มขึ้นเยอะ ขอบคุณ SMS-UP+ ครับ',
      rating: 5,
      image: '☕'
    },
    {
      name: 'คุณอรทัย สร้างสรรค์',
      position: 'Digital Marketing Lead',
      company: 'Home Decor Plus',
      content: 'การทำ A/B Testing ใน email marketing ช่วยให้เราปรับปรุงแคมเปญได้ดีมาก open rate เพิ่มจาก 15% เป็น 35%',
      rating: 5,
      image: '🏡'
    },
    {
      name: 'คุณวิทยา นวัตกรรม',
      position: 'Marketing Director',
      company: 'Sports Equipment',
      content: 'ระบบรายงานแบบ real-time ช่วยให้เราตัดสินใจได้เร็ว ปรับกลยุทธ์ได้ทันที ผลลัพธ์ดีกว่าที่คาดไว้',
      rating: 5,
      image: '⚽'
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6">
            ลูกค้าพูดถึงเรา
            <span className="text-primary"> อย่างไร</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            ฟังเสียงจากลูกค้าจริงที่ใช้ SMS-UP+ 
            เพื่อเติบโตและสร้างความสำเร็จให้กับธุรกิจ
          </p>
        </div>

        {/* Testimonials Grid */}
        <div ref={testimonialsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-large transition-all duration-500 border-0 shadow-professional hover:scale-[1.02] hover:border-primary/20 ${
                testimonialsInView 
                  ? 'animate-fade-in opacity-100' 
                  : 'opacity-0'
              }`}
              style={{
                animationDelay: testimonialsInView ? `${index * 150}ms` : '0ms'
              }}
            >
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="text-primary/20 mb-4">
                  <Quote className="h-8 w-8" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.position}
                    </div>
                    <div className="text-sm text-primary font-medium">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-card rounded-2xl p-6 md:p-8 lg:p-12 shadow-professional border">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
              พร้อมเป็นลูกค้าคนต่อไป?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              เข้าร่วมกับธุรกิจมากกว่า 50,000 แห่งที่เลือกใช้ SMS-UP+ 
              เพื่อเติบโตและสร้างความสำเร็จ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 font-semibold shadow-professional"
              >
                เริ่มทดลองใช้ฟรี 14 วัน
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 font-semibold"
              >
                นัดหมายปรึกษา
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;