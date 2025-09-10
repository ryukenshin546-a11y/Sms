import React from 'react';
import { Button } from '@/components/ui/button';

const MobyHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            One move,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Endless potential
            </span>
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-8 font-medium">
            เดินหน้าธุรกิจด้วยเทคโนโลยีพร้อมใช้งานของเรา
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            1Moby พัฒนาเทคโนโลยี Platform as a service ที่ช่วยเพิ่มประสิทธิภาพธุรกิจให้ครบทุกด้าน
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              ดูโซลูชันของเรา
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
            >
              ติดต่อเรา
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="relative block w-full h-8 md:h-16" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M1200 0L0 0 892.25 114.72 1200 0z" 
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
};

export default MobyHero;
