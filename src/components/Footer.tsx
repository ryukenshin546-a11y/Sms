import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const mainNavLinks = [
    { label: 'หน้าแรก', href: '/' },
    { label: 'บริการ', href: '/services' },
    { label: 'แคมเปญ', href: '/campaigns' },
    { label: 'แดชบอร์ด', href: '/dashboard' }
  ];

  const companyLinks = [
    { label: 'เกี่ยวกับเรา', href: '/about-us' },
    { label: 'ทีมงาน', href: '/about-us#team' },
    { label: 'ข่าวสาร', href: '/about-us#news' },
    { label: 'ร่วมงานกับเรา', href: '/about-us#careers' },
    { label: 'ติดต่อเรา', href: '/contact' }
  ];

  const productLinks = [
    { label: 'ฟีเจอร์ทั้งหมด', href: '#features' },
    { label: 'ราคา', href: '#pricing' },
    { label: 'การบูรณาการ', href: '#integrations' },
    { label: 'API', href: '#api' },
    { label: 'เทมเพลต', href: '/templates' }
  ];

  const resourcesLinks = [
    { label: 'บล็อก', href: '/blog' },
    { label: 'เคสสตั๊ดี้', href: '/case-studies' },
    { label: 'คู่มือการตลาด', href: '/marketing-guide' },
    { label: 'เว็บinars', href: '/webinars' },
    { label: 'ดาวน์โหลด', href: '/downloads' }
  ];

  const supportLinks = [
    { label: 'ศูนย์ช่วยเหลือ', href: '/help-center' },
    { label: 'คู่มือการใช้งาน', href: '/help-center#guide' },
    { label: 'วิดีโอสอน', href: '/help-center#tutorials' },
    { label: 'ติดต่อซัพพอร์ต', href: '/help-center#support' },
    { label: 'FAQ', href: '/faq' }
  ];

  const legalLinks = [
    { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy-policy' },
    { label: 'ข้อกำหนดการใช้งาน', href: '/terms-of-use' },
    { label: 'นโยบายคุกกี้', href: '/cookie-policy' },
    { label: 'PDPA', href: '/pdpa-policy' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#facebook', label: 'Facebook' },
    { icon: Twitter, href: '#twitter', label: 'Twitter' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
    { icon: Instagram, href: '#instagram', label: 'Instagram' }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2 lg:col-span-2 space-y-6">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                SMS-UP+
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                แพลตฟอร์มการตลาดดิจิทัลที่ครบครันที่สุดในประเทศไทย 
                ช่วยให้ธุรกิจของคุณเติบโตอย่างยั่งยืน
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">contact@smsup-plus.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">02-123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                   <span className="text-muted-foreground text-sm md:text-base">
                    123 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-professional"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6">นำทาง</h4>
              <div className="space-y-3">
                {mainNavLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-professional"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">บริษัท</h4>
              <div className="space-y-3">
                {companyLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-professional"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">ผลิตภัณฑ์</h4>
              <div className="space-y-3">
                {productLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-professional"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-6">ทรัพยากร</h4>
              <div className="space-y-3">
                {resourcesLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-professional"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Support and Legal Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-x-8 gap-y-6 w-full justify-center">
              {/* Support Links Horizontal */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 w-full md:w-auto">
                <h4 className="font-semibold text-lg mb-2 md:mb-0 md:mr-4 min-w-max">ช่วยเหลือ</h4>
                <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
                  {supportLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-professional text-sm whitespace-nowrap"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
              {/* Legal Links Horizontal */}
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 w-full md:w-auto">
                <h4 className="font-semibold text-lg mb-2 md:mb-0 md:mr-4 min-w-max">กฎหมาย</h4>
                <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
                  {legalLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-professional text-sm whitespace-nowrap"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2024 SMS-UP+. สงวนลิขสิทธิ์ทุกประการ
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>เวอร์ชัน 2.1.0</span>
              <span>•</span>
              <span>Made with ❤️ in Thailand</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;