import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, ChevronDown, TestTube, Smartphone, BarChart3, Zap, User, LogOut, Loader2 } from 'lucide-react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { isDark, toggle } = useDarkMode();
  const { user, signOut, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ตรวจสอบว่าเป็น development mode หรือไม่
  const isDevMode = import.meta.env.DEV || import.meta.env.VITE_MODE === 'development';

  // Memoized user display name เพื่อปรับปรุงประสิทธิภาพ
  const userDisplayName = useMemo(() => {
    if (!user) return 'ผู้ใช้';
    return user.user_metadata?.first_name || user.email?.split('@')[0] || 'ผู้ใช้';
  }, [user]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setIsMenuOpen(false); // ปิด mobile menu ทันที
      await signOut();
      // ใช้ React Router navigate แทน window.location
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      // แสดง error message ให้ผู้ใช้
      alert('เกิดข้อผิดพลาดในการออกจากระบบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSigningOut(false);
    }
  };

  // User Account Dropdown Component
  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{userDisplayName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            โปรไฟล์
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="flex items-center text-red-600"
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          {isSigningOut ? 'กำลังออก...' : 'ออกจากระบบ'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

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
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-professional">
              บริการ
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-professional">
              ราคา
            </Link>
            <Link to="/help-center" className="text-muted-foreground hover:text-foreground transition-professional">
              ศูนย์ช่วยเหลือ
            </Link>
            <Link to="/about-us" className="text-muted-foreground hover:text-foreground transition-professional">
              เกี่ยวกับเรา
            </Link>
            {isAuthenticated && (
              <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-professional">
                โปรไฟล์
              </Link>
            )}
            {isDevMode && <DevToolsDropdown />}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={toggle}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {loading ? (
              <div className="w-24 h-9 bg-gray-200 animate-pulse rounded"></div>
            ) : isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">เข้าสู่ระบบ</Link>
                </Button>
                <Button variant="default" className="bg-primary hover:bg-primary-hover" asChild>
                  <Link to="/register">สมัครสมาชิก</Link>
                </Button>
              </>
            )}
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
              <Link
                to="/"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                บริการ
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                ราคา
              </Link>
              <Link
                to="/help-center"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                ศูนย์ช่วยเหลือ
              </Link>
              <Link
                to="/about-us"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                onClick={() => setIsMenuOpen(false)}
              >
                เกี่ยวกับเรา
              </Link>
              
              {/* แสดงลิงค์โปรไฟล์เฉพาะเมื่อ login แล้ว */}
              {isAuthenticated && (
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-professional"
                  onClick={() => setIsMenuOpen(false)}
                >
                  โปรไฟล์
                </Link>
              )}
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
                
                {loading ? (
                  <div className="w-full h-9 bg-gray-200 animate-pulse rounded"></div>
                ) : isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-gray-600">
                      {userDisplayName}
                    </div>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/profile">
                        <User className="h-4 w-4 mr-2" />
                        โปรไฟล์
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-2" />
                      )}
                      {isSigningOut ? 'กำลังออก...' : 'ออกจากระบบ'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/login">เข้าสู่ระบบ</Link>
                    </Button>
                    <Button variant="default" className="w-full bg-primary hover:bg-primary-hover" asChild>
                      <Link to="/register">สมัครสมาชิก</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;