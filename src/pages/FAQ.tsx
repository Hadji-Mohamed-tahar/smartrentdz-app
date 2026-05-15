import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FAQ = () => {
  const generalFAQs = [
    {
      question: "ما هي منصة سَكَني؟",
      answer:
        "سَكَني هي منصة إلكترونية تربط بين مؤجّري الشقق المفروشة والمستأجرين في جميع ولايات الجزائر. نوفر لك أسهل طريقة للبحث عن شقة مفروشة للكراء اليومي، الأسبوعي، أو الشهري.",
    },
    {
      question: "هل المنصة مجانية للمستأجرين؟",
      answer:
        "نعم، التصفح والبحث مجاني تماماً. يمكنك استعراض جميع الشقق والاطلاع على تفاصيلها دون أي رسوم. التسجيل مطلوب فقط للوصول إلى رقم هاتف المؤجّر أو حفظ الشقق في المفضلة.",
    },
    {
      question: "كيف أتواصل مع المؤجّر؟",
      answer:
        "بعد تسجيل الدخول، يمكنك الاطلاع على رقم هاتف المؤجّر في صفحة تفاصيل الشقة والتواصل معه مباشرة. المنصة لا تتدخل في عملية التفاوض أو التعاقد.",
    },
    {
      question: "هل يمكنني الحجز عبر المنصة؟",
      answer:
        "المنصة تقتصر على ربط المستأجرين بالمؤجّرين. الحجز والتعاقد يتمان مباشرة بين الطرفين خارج المنصة.",
    },
  ];

  const renterFAQs = [
    {
      question: "كيف أسجل حساب جديد؟",
      answer:
        'انقر على "تسجيل" في أعلى الصفحة، اختر "مستأجر" كنوع الحساب، أدخل بياناتك الأساسية، وستتمكن من البدء فوراً.',
    },
    {
      question: "كيف أحفظ شقة في المفضلة؟",
      answer:
        "بعد تسجيل الدخول، انقر على أيقونة القلب في بطاقة أي شقة لحفظها في قائمة المفضلة. يمكنك الوصول إلى مفضلاتك من لوحة التحكم.",
    },
    {
      question: "هل يمكنني تصفية الشقق حسب موقعي؟",
      answer:
        "نعم، يمكنك تصفية الشقق حسب الولاية، البلدية، عدد الغرف، نطاق السعر، ومدة الكراء المطلوبة.",
    },
    {
      question: "ماذا أفعل إذا وجدت إعلان مشبوه؟",
      answer:
        "يمكنك الإبلاغ عن أي إعلان مشبوه عبر الضغط على زر الإبلاغ في صفحة تفاصيل الشقة. سنقوم بمراجعته في أقرب وقت.",
    },
  ];

  const landlordFAQs = [
    {
      question: "كيف أنشر شقتي على المنصة؟",
      answer:
        'أنشئ حساب مؤجّر، اشترك في إحدى الباقات المتاحة، ثم انقر على "إضافة شقة" وأدخل جميع تفاصيل الشقة مع الصور.',
    },
    {
      question: "ما هي تكلفة الاشتراك؟",
      answer:
        "نوفر ثلاث باقات: الأساسية (2,000 د.ج/شهر لـ 3 شقق)، الاحترافية (5,000 د.ج/شهر لـ 10 شقق)، والمتميزة (10,000 د.ج/شهر لشقق غير محدودة).",
    },
    {
      question: "كيف أميّز شقتي في نتائج البحث؟",
      answer:
        "يمكنك طلب تمييز شقتك من لوحة التحكم. الشقق المميزة تظهر في الصفحة الرئيسية وأعلى نتائج البحث برسوم إضافية.",
    },
    {
      question: "هل يمكنني تتبع أداء إعلاناتي؟",
      answer:
        "نعم، توفر لوحة التحكم إحصائيات تفصيلية عن عدد المشاهدات ونقرات رقم الهاتف لكل شقة.",
    },
    {
      question: "كيف أوقف إعلان شقة مؤقتاً؟",
      answer:
        "من لوحة التحكم، انقر على زر الإيقاف بجانب الشقة المطلوبة. يمكنك إعادة تفعيلها في أي وقت.",
    },
  ];

  const paymentFAQs = [
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer:
        "نقبل الدفع عبر CCP، Baridimob، وكذلك التحويل البنكي. يمكنك اختيار الطريقة المناسبة لك عند الاشتراك.",
    },
    {
      question: "هل يمكنني استرداد أموالي؟",
      answer:
        "يمكن استرداد المبلغ خلال 7 أيام من الاشتراك إذا لم تنشر أي شقة. بعد ذلك، لا يمكن الاسترداد.",
    },
    {
      question: "هل الاشتراك يتجدد تلقائياً؟",
      answer:
        "لا، الاشتراك لا يتجدد تلقائياً. ستتلقى إشعاراً قبل انتهاء اشتراكك لتجديده يدوياً.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-primary-foreground py-16">
          <div className="container text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">الأسئلة الشائعة</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              إجابات على أكثر الأسئلة شيوعاً حول استخدام منصة سَكَني
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container max-w-3xl">
            {/* General */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">أسئلة عامة</h2>
              <Accordion type="single" collapsible className="bg-card rounded-xl border">
                {generalFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`general-${index}`}>
                    <AccordionTrigger className="px-5 text-right hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Renter */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">للمستأجرين</h2>
              <Accordion type="single" collapsible className="bg-card rounded-xl border">
                {renterFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`renter-${index}`}>
                    <AccordionTrigger className="px-5 text-right hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Landlord */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">للمؤجّرين</h2>
              <Accordion type="single" collapsible className="bg-card rounded-xl border">
                {landlordFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`landlord-${index}`}>
                    <AccordionTrigger className="px-5 text-right hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Payment */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">الدفع والاشتراكات</h2>
              <Accordion type="single" collapsible className="bg-card rounded-xl border">
                {paymentFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`payment-${index}`}>
                    <AccordionTrigger className="px-5 text-right hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Still have questions */}
            <div className="text-center p-8 bg-muted/50 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">لم تجد إجابة سؤالك؟</h3>
              <p className="text-muted-foreground mb-4">
                تواصل معنا وسنرد عليك في أقرب وقت
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2 font-medium hover:bg-primary/90 transition-colors"
              >
                اتصل بنا
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
