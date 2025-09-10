import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users2, Cloud, ShoppingBag, Smartphone, Video } from 'lucide-react';

const MobyCertificationsSection = () => {
  const certifications = [
    {
      icon: Shield,
      title: "ISO 27001",
      subtitle: "รับรองมาตรฐาน ISO 27001",
      description: "มาตรฐานการจัดการความปลอดภัยสารสนเทศระดับสากล",
      logo: "/placeholder.svg"
    },
    {
      icon: Award,
      title: "ISO 29110",
      subtitle: "รับรองมาตรฐาน ISO 29110",
      description: "มาตรฐานการบริหารและพัฒนาผลิตภัณฑ์ซอฟต์แวร์ที่มีระบบตามกระบวนการสากล",
      logo: "/placeholder.svg"
    },
    {
      icon: Users2,
      title: "LINE Agency Partner",
      subtitle: "LINE Agency Partner",
      description: "มาตรฐานการบริหารและพัฒนาผลิตภัณฑ์ซอฟต์แวร์ที่มีระบบตามกระบวนการสากล",
      logo: "/placeholder.svg"
    },
    {
      icon: Users2,
      title: "LINE Developer Partner",
      subtitle: "LINE Developer Partner",
      description: "มาตรฐานการบริหารและพัฒนาผลิตภัณฑ์ซอฟต์แวร์ที่มีระบบตามกระบวนการสากล",
      logo: "/placeholder.svg"
    },
    {
      icon: Cloud,
      title: "AWS Letter of Support",
      subtitle: "AWS Letter of Support",
      description: "รับรองหรือสนับสนุนโครงการ ธุรกิจ หรือองค์กรที่ต้องการขอทุนหรือสิทธิพิเศษจาก AWS",
      logo: "/placeholder.svg"
    },
    {
      icon: ShoppingBag,
      title: "Shopee Partner",
      subtitle: "Shopee Partner",
      description: "ผ่านมาตรฐานด้านความปลอดภัยทุกขั้นตอนตามที่ผู้ให้บริการกำหนด",
      logo: "/placeholder.svg"
    },
    {
      icon: ShoppingBag,
      title: "Lazada Partner",
      subtitle: "Lazada Partner",
      description: "ผ่านมาตรฐานด้านความปลอดภัยทุกขั้นตอนตามที่ผู้ให้บริการกำหนด",
      logo: "/placeholder.svg"
    },
    {
      icon: Video,
      title: "Tiktok Partner",
      subtitle: "Tiktok Partner",
      description: "ผ่านมาตรฐานด้านความปลอดภัยทุกขั้นตอนตามที่ผู้ให้บริการกำหนด",
      logo: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            แบรนด์ชั้นนำที่บริการของเราอยู่เบื้องหลังความสำเร็จ
          </h2>
          <div className="mt-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              การันตีคุณภาพด้วยการรับรองมาตรฐานระดับสากล
            </h3>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {certifications.map((cert, index) => {
            const IconComponent = cert.icon;
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 bg-white hover:transform hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  {/* Logo/Icon */}
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <IconComponent className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {cert.title}
                    </h3>
                    <h4 className="text-sm font-medium text-blue-600">
                      {cert.subtitle}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {cert.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-16">
          <p className="text-xl text-gray-700 font-medium">
            แนะนำทุกก้าวสำคัญ
          </p>
        </div>
      </div>
    </section>
  );
};

export default MobyCertificationsSection;
