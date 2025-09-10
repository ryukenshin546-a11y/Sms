import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobyHero from '@/components/moby/MobyHero';
import MobyTechnologySection from '@/components/moby/MobyTechnologySection';
import MobySoftwareStudioSection from '@/components/moby/MobySoftwareStudioSection';
import MobyCertificationsSection from '@/components/moby/MobyCertificationsSection';
import MobyCaseStudiesSection from '@/components/moby/MobyCaseStudiesSection';
import MobyArticlesSection from '@/components/moby/MobyArticlesSection';

const MobyClone = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - ใช้ของเรา */}
      <Navigation />
      
      {/* Main Content - โคลนจาก 1moby */}
      <main>
        {/* Hero Section */}
        <MobyHero />
        
        {/* Technology Platform Section */}
        <MobyTechnologySection />
        
        {/* Software Studio Section */}
        <MobySoftwareStudioSection />
        
        {/* Certifications Section */}
        <MobyCertificationsSection />
        
        {/* Case Studies Section */}
        <MobyCaseStudiesSection />
        
        {/* Articles Section */}
        <MobyArticlesSection />
      </main>
      
      {/* Footer - ใช้ของเรา */}
      <Footer />
    </div>
  );
};

export default MobyClone;
