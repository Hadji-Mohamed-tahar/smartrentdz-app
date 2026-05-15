import { Building2, Users, Shield, Phone, MapPin, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  const features = [
    {
      icon: Building2,
      title: "شقق مفروشة متنوعة",
      description: "آلاف الشقق المفروشة في جميع ولايات الجزائر الـ 58",
    },
    {
      icon: Users,
      title: "تواصل مباشر",
      description: "تواصل مباشر مع المؤجّرين دون وسطاء أو عمولات",
    },
    {
      icon: Shield,
      title: "موثوقية وأمان",
      description: "نتحقق من جميع الإعلانات لضمان تجربة آمنة",
    },
    {
      icon: Clock,
      title: "مرونة في المدة",
      description: "كراء يومي، أسبوعي، أو شهري حسب احتياجاتك",
    },
  ];

  const stats = [
    { value: "5,000+", label: "شقة متاحة" },
    { value: "58", label: "ولاية" },
    { value: "10,000+", label: "مستخدم نشط" },
    { value: "50,000+", label: "عملية تواصل" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-primary-foreground py-16 md:py-24">
          <div className="container text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">من نحن</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              سَكَني هي المنصة الأولى في الجزائر لكراء الشقق المفروشة قصيرة المدى
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">قصتنا</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                انطلقت منصة سَكَني من فكرة بسيطة: تسهيل إيجاد شقة مفروشة للكراء في الجزائر.
                ندرك أن البحث عن سكن مؤقت يمكن أن يكون مرهقاً وصعباً، لذلك أنشأنا منصة تجمع
                بين المؤجّرين والمستأجرين في مكان واحد، مع توفير جميع المعلومات اللازمة
                لاتخاذ القرار الصحيح.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                نعمل على تغطية جميع ولايات الجزائر الـ 58، من المدن الكبرى إلى المناطق
                السياحية والساحلية، لنوفر لك أفضل الخيارات أينما كنت.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-card rounded-xl border">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 p-6 bg-card rounded-xl border">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">مهمتنا</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                نسعى لجعل عملية البحث عن شقة مفروشة للكراء تجربة سهلة وممتعة لجميع
                الجزائريين. نؤمن بأن الجميع يستحق سكناً مريحاً ومناسباً، ونعمل كل يوم
                لتحقيق هذه الرؤية من خلال توفير منصة موثوقة وسهلة الاستخدام.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">تواصل معنا</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">الهاتف</h3>
                <p className="text-muted-foreground" dir="ltr">+213 555 123 456</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">العنوان</h3>
                <p className="text-muted-foreground">الجزائر العاصمة، الجزائر</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">ساعات العمل</h3>
                <p className="text-muted-foreground">السبت - الخميس: 9ص - 6م</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
