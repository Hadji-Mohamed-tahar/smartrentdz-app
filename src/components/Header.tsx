import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Heart, User, Menu, X, LogOut, Building2, Settings, CreditCard, Calculator } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">SmartRentdz</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/search" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            تصفح الشقق
          </Link>
          <Link 
            to="/favorites" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            المفضلة
          </Link>
          <Link 
            to="/subscription" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            الاشتراكات
          </Link>
          <Link 
            to="/price-prediction" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            التنبؤ بالأسعار
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/favorites">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {userData?.name?.charAt(0) || "م"}
                    </span>
                  </div>
                  <span className="max-w-24 truncate">{userData?.name || "مستخدم"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="h-4 w-4" />
                    لوحة التحكم
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="h-4 w-4" />
                    المفضلة
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/subscription-status" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    حالة الاشتراك
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    الإعدادات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild>
                <Link to="/register">إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-card animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            <Link
              to="/search"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">تصفح الشقق</span>
            </Link>
            <Link
              to="/favorites"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">المفضلة</span>
            </Link>
            <Link
              to="/subscription"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">الاشتراكات</span>
            </Link>
            <Link
              to="/price-prediction"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">التنبؤ بالأسعار</span>
            </Link>
            
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">لوحة التحكم</span>
                </Link>
                <Link
                  to="/subscription-status"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">حالة الاشتراك</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">الإعدادات</span>
                </Link>
                <button
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-destructive w-full text-right"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">تسجيل الدخول</span>
                </Link>
                <div className="pt-2 px-4">
                  <Button className="w-full" asChild>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      إنشاء حساب
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
