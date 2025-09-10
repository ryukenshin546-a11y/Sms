import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Target, Bot, MessageCircle, Palette, Globe, Gamepad2, Phone } from 'lucide-react';

const MobySoftwareStudioSection = () => {
  const services = [
    {
      icon: Target,
      title: "Customer Data Tracking",
      description: "บริการทำระบบติดตามและเก็บข้อมูล เสริมด้วยการวัดผลที่เหนือช่องทาง Ads อื่น ๆ",
      color: "bg-blue-600"
    },
    {
      icon: Bot,
      title: "ChatBot",
      description: "พัฒนา Chatbot ที่ฉลาดและเป็นธรรมชาติ สามารถเชื่อมต่อได้ทุกแพลตฟอร์มการตอบแชท",
      color: "bg-green-600"
    },
    {
      icon: MessageCircle,
      title: "LINE OA Customization",
      description: "เพิ่มความสามารถให้ LINE OA ให้เป็นมากกว่าแพลตฟอร์มส่งข้อความที่เหมาะกับธุรกิจ",
      color: "bg-blue-600"
    },
    {
      icon: Globe,
      title: "Web Design and Application",
      description: "ออกแบบเว็บไซต์และเว็บแอปพลิเคชันให้เหมาะกับการนำเสนอภาพลักษณ์และแนวทางทางธุรกิจ",
      color: "bg-green-600"
    },
    {
      icon: Palette,
      title: "Interactive Design",
      description: "เพิ่มจุดดึงดูดให้ลูกค้าได้มีส่วนร่วมกับแบรนด์มากขึ้น ด้วยการออกแบบที่สร้างสรรค์ เช่น Metaverse หรือการออกแบบเกม",
      color: "bg-blue-600"
    },
    {
      icon: Phone,
      title: "LINE OA Services",
      description: "บริการสร้างบัญชี LINE OA สำหรับธุรกิจทุกประเภทเริ่มตั้งแต่ธุรกิจขนาดเล็กไปจนถึงองค์กรขนาดใหญ่",
      color: "bg-blue-600"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            หากเทคโนโลยีที่มีไม่เหมาะ เราสร้างขึ้นมาใหม่ให้เข้ากับคุณได้
          </h2>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="text-2xl font-bold text-blue-600">1Moby</div>
            <div className="text-2xl font-bold text-gray-900">Software Studio</div>
          </div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            สามารถเพิ่มความสามารถของระบบที่เหมาะสมกับองค์กรด้วยบริการของเรา ตอบโจทย์การใช้งานในทุกแง่มุม
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            เราให้คำปรึกษาเพื่อการปรับเปลี่ยนองค์กรที่ดีที่สุดด้วยเทคโนโลยีที่เหมาะสม
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            const isBlue = service.color === "bg-blue-600";
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:transform hover:scale-105"
              >
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 ${service.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                    
                    {/* More Button */}
                    <div className="pt-4">
                      <Button 
                        variant="ghost" 
                        className={`p-0 h-auto ${isBlue ? 'text-blue-600 hover:text-blue-700' : 'text-green-600 hover:text-green-700'} font-medium group-hover:translate-x-2 transition-transform`}
                      >
                        <span className="mr-1">เพิ่มเติม</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            ดูบริการของเรา
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MobySoftwareStudioSection;
