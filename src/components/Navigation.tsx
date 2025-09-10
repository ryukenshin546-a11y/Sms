import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-primary">
              MarketPro
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-professional">
              บริการ
            </a>
            <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-professional">
              แพ็คเกจราคา
            </a>
            <a href="#trust" className="text-muted-foreground hover:text-foreground transition-professional">
              เกี่ยวกับเรา
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-professional">
              รีวิว
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-professional">
              ติดต่อ
            </a>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">
              เข้าสู่ระบบ
            </Button>
            <Button variant="default" className="bg-primary hover:bg-primary-hover">
              ทดลองใช้ฟรี
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              <a
                href="#features"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                บริการ
              </a>
              <a
                href="/pricing"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                แพ็คเกจราคา
              </a>
              <a
                href="#trust"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                เกี่ยวกับเรา
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                รีวิว
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                ติดต่อ
              </a>
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full">
                  เข้าสู่ระบบ
                </Button>
                <Button variant="default" className="w-full bg-primary hover:bg-primary-hover">
                  ทดลองใช้ฟรี
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;