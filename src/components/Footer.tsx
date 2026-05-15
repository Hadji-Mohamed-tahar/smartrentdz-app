import { Link } from "react-router-dom";
import { Home, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">سَكَني</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة سكني تربط بين المؤجرين والمستأجرين في جميع أنحاء الجزائر. ابحث عن شقتك المفروشة المثالية للإيجار اليومي، الأسبوعي أو الشهري.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">روابط سريعة</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                تصفح الشقق
              </Link>
              <Link to="/subscription" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                الاشتراكات
              </Link>
              <Link to="/favorites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                المفضلة
              </Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                إنشاء حساب
              </Link>
            </nav>
          </div>

          {/* Popular Wilayas */}
          <div className="space-y-4">
            <h4 className="font-semibold">الولايات الشائعة</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/search?wilaya=16" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                شقق في الجزائر العاصمة
              </Link>
              <Link to="/search?wilaya=31" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                شقق في وهران
              </Link>
              <Link to="/search?wilaya=25" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                شقق في قسنطينة
              </Link>
              <Link to="/search?wilaya=23" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                شقق في عنابة
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">تواصل معنا</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@sakani.dz</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+213 555 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>الجزائر العاصمة</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} سَكَني. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
