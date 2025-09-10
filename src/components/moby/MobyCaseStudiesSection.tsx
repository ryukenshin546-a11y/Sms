import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Target, Users } from 'lucide-react';

const MobyCaseStudiesSection = () => {
  const caseStudies = [
    {
      icon: TrendingUp,
      title: "ยอดขายเติบโตขึ้น 140%",
      subtitle: "ด้วยการ Tracking ข้อมูลลูกค้า Offline",
      description: "เจ้าของความสำเร็จ บริษัทเครื่องใช้ไฟฟ้าชั้นนำในประเทศไทย",
      image: "/placeholder.svg",
      logo: "UniSight",
      link: "อ่านเพิ่มเติม"
    },
    {
      icon: Target,
      title: "UniSight Sale and Marketing Automation",
      subtitle: "ปิดการขายเพิ่มขึ้นด้วยข้อมูลที่มีบนมือ",
      description: "",
      image: "/placeholder.svg",
      logo: "UniSight",
      link: ""
    },
    {
      icon: Users,
      title: "Thaibulksms",
      subtitle: "ผู้ให้บริการธุรกิจ SMS Communication อันดับ 1 ของประเทศไทย",
      description: "",
      image: "/placeholder.svg",
      logo: "Thaibulksms",
      link: ""
    }
  ];

  const companyProfile = {
    title: "องค์กรคุณเหมาะกับเทคโนโลยี",
    subtitle: "ลองดาวน์โหลดเพื่อดูรายละเอียดของเราได้",
    documents: [
      {
        title: "Company Profile",
        image: "/placeholder.svg",
        downloadLink: "#",
        viewLink: "#"
      },
      {
        title: "Rate Card",
        image: "/placeholder.svg",
        downloadLink: "#",
        viewLink: "#"
      }
    ]
  };

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ตัวอย่างความสำเร็จที่คุณจะได้รับ
          </h2>
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {caseStudies.map((study, index) => {
            const IconComponent = study.icon;
            
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:transform hover:scale-105"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={study.image} 
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {study.title}
                      </h3>
                      
                      {study.subtitle && (
                        <p className="text-gray-700 font-medium">
                          {study.subtitle}
                        </p>
                      )}

                      {study.description && (
                        <p className="text-gray-600 text-sm">
                          {study.description}
                        </p>
                      )}

                      {/* Logo */}
                      <div className="flex items-center gap-2 pt-2">
                        <div className="text-blue-600 font-bold">{study.logo}</div>
                      </div>

                      {/* Link */}
                      {study.link && (
                        <Button 
                          variant="ghost" 
                          className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium group-hover:translate-x-2 transition-transform"
                        >
                          <span className="mr-1">{study.link}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Company Profile Section */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {companyProfile.title}
          </h3>
          <p className="text-xl text-gray-600 mb-12">
            {companyProfile.subtitle}
          </p>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {companyProfile.documents.map((doc, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:transform hover:scale-105"
              >
                <CardContent className="p-6">
                  {/* Document Image */}
                  <div className="mb-6">
                    <img 
                      src={doc.image} 
                      alt={doc.title}
                      className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-900">
                      {doc.title}
                    </h4>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        asChild
                      >
                        <a href={doc.downloadLink}>ดาวน์โหลด</a>
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        asChild
                      >
                        <a href={doc.viewLink}>👁 ดูออนไลน์</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobyCaseStudiesSection;
