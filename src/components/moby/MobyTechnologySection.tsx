import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Database, Users } from 'lucide-react';

const MobyTechnologySection = () => {
  const technologies = [
    {
      icon: MessageSquare,
      title: "Customer Communication",
      description: "แพลตฟอร์มการสื่อสารและกระจายข้อมูลไปยังลูกค้า",
      image: "/placeholder.svg"
    },
    {
      icon: Database,
      title: "Data Management",
      description: "พัฒนาระบบเก็บข้อมูล เพื่อเข้าใจและบริการลูกค้าได้อย่างตรงจุด",
      image: "/placeholder.svg"
    },
    {
      icon: Users,
      title: "Customer Engagement",
      description: "สะท้อนถึงตัวตนองค์กร เพิ่มโอกาสให้ลูกค้ามีส่วนร่วมในแบรนด์ยิ่งขึ้น",
      image: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            เดินหน้าธุรกิจด้วยเทคโนโลยีพร้อมใช้งานของเรา
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            1Moby พัฒนาเทคโนโลยี Platform as a service ที่ช่วยเพิ่มประสิทธิภาพธุรกิจให้ครบทุกด้าน
          </p>
          <div className="mt-8">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              ดูโซลูชันของเรา
            </Button>
          </div>
        </div>

        {/* Technology Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {technologies.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <div 
                key={index} 
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <IconComponent className="w-10 h-10 text-blue-600" />
                  </div>
                </div>

                {/* Image Placeholder */}
                <div className="mb-6 overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src={tech.image} 
                    alt={tech.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {tech.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MobyTechnologySection;
