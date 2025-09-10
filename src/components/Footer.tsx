import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const companyLinks = [
    { label: 'เกี่ยวกับเรา', href: '#about' },
    { label: 'ทีมงาน', href: '#team' },
    { label: 'ข่าวสาร', href: '#news' },
    { label: 'ร่วมงานกับเรา', href: '#careers' }
  ];

  const productLinks = [
    { label: 'ฟีเจอร์ทั้งหมด', href: '#features' },
    { label: 'ราคา', href: '#pricing' },
    { label: 'การบูรณาการ', href: '#integrations' },
    { label: 'API', href: '#api' }
  ];

  const supportLinks = [
    { label: 'ศูนย์ช่วยเหลือ', href: '#help' },
    { label: 'คู่มือการใช้งาน', href: '#guide' },
    { label: 'วิดีโอสอน', href: '#tutorials' },
    { label: 'ติดต่อซัพพอร์ต', href: '#support' }
  ];

  const legalLinks = [
    { label: 'นโยบายความเป็นส่วนตัว', href: '#privacy' },
    { label: 'ข้อกำหนดการใช้งาน', href: '#terms' },
    { label: 'นโยบายคุกกี้', href: '#cookies' },
    { label: 'PDPA', href: '#pdpa' }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2 lg:col-span-2 space-y-6">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                MarketPro
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                แพลตฟอร์มการตลาดดิจิทัลที่ครบครันที่สุดในประเทศไทย 
                ช่วยให้ธุรกิจของคุณเติบโตอย่างยั่งยืน
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">contact@marketpro.co.th</span>
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

            {/* Links Sections */}
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
              <h4 className="font-semibold text-lg mb-6">ช่วยเหลือ</h4>
              <div className="space-y-3 mb-8">
                {supportLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-professional"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <h4 className="font-semibold text-lg mb-6">กฎหมาย</h4>
              <div className="space-y-3">
                {legalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-professional text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2024 MarketPro. สงวนลิขสิทธิ์ทุกประการ
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