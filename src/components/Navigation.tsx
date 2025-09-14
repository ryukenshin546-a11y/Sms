import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, ChevronDown, TestTube, Smartphone, BarChart3, Zap } from 'lucide-react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();

  // ตรวจสอบว่าเป็น development mode หรือไม่
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_MODE === 'development';

  // Dev Tools Dropdown Component
  const DevToolsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
          <TestTube className="h-4 w-4 mr-1" />
          Dev Tools
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a href="/otp-test" className="flex items-center">
            <TestTube className="h-4 w-4 mr-2" />
            ทดสอบ OTP
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/otp-demo" className="flex items-center">
            <Smartphone className="h-4 w-4 mr-2" />
            OTP Demo
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/performance" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-primary">
              SMS-UP+
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-professional">
              บริการ
            </a>
            <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-professional">
              ราคา
            </a>
            <a href="/help-center" className="text-muted-foreground hover:text-foreground transition-professional">
              ศูนย์ช่วยเหลือ
            </a>
            <a href="/about-us" className="text-muted-foreground hover:text-foreground transition-professional">
              เกี่ยวกับเรา
            </a>
            <a href="/profile" className="text-muted-foreground hover:text-foreground transition-professional">
              โปรไฟล์
            </a>
            {isDevMode && <DevToolsDropdown />}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={toggle}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" asChild>
              <a href="/profile">บัญชีของฉัน</a>
            </Button>
            <Button variant="default" className="bg-primary hover:bg-primary-hover" asChild>
              <a href="/register">ทดลองใช้ฟรี</a>
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
                href="/"
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
                ราคา
              </a>
              <a
                href="/help-center"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                ศูนย์ช่วยเหลือ
              </a>
              <a
                href="/about-us"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                เกี่ยวกับเรา
              </a>
              <a
                href="/profile"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                โปรไฟล์
              </a>
              {isDevMode && (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-orange-600 border-t border-border mt-2 mb-1">
                    Dev Tools
                  </div>
                  <a
                    href="/otp-test"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🧪 ทดสอบ OTP
                  </a>
                  <a
                    href="/otp-demo"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📱 OTP Demo
                  </a>
                  <a
                    href="/analytics"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📊 Analytics
                  </a>
                  <a
                    href="/performance"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ⚡ Performance
                  </a>
                </>
              )}
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={toggle}>
                  {isDark ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                  {isDark ? 'โหมดสว่าง' : 'โหมดมืด'}
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <a href="/profile">บัญชีของฉัน</a>
                </Button>
                <Button variant="default" className="w-full bg-primary hover:bg-primary-hover" asChild>
                  <a href="/register">ทดลองใช้ฟรี</a>
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