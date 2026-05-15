import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { AdAnalysisReport as Report } from "@/services/adAnalysisService";

interface LocationState {
  report?: Report;
  apartmentTitle?: string;
}

const AdAnalysisReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) || {};
  const report = state.report;

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">لا يوجد تقرير لعرضه</h1>
          <p className="text-muted-foreground mb-6">
            يرجى تشغيل التحليل من لوحة التحكم.
          </p>
          <Button asChild>
            <Link to="/dashboard">العودة للوحة التحكم</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const score = typeof report.score === "number" ? report.score : null;
  const scoreOutOf = score !== null && score <= 10 ? 10 : 100;

  const scoreColor =
    score === null
      ? "text-muted-foreground"
      : score / scoreOutOf >= 0.75
      ? "text-success"
      : score / scoreOutOf >= 0.4
      ? "text-featured"
      : "text-destructive";

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowRight className="h-4 w-4 ml-2 rotate-180" />
            رجوع
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              تقرير تحليل الإعلان
            </h1>
            {state.apartmentTitle && (
              <p className="text-muted-foreground mt-1">{state.apartmentTitle}</p>
            )}
          </div>

          {/* Score */}
          <div className="bg-card rounded-2xl border p-6 mb-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">التقييم العام</p>
            <div className={`text-5xl font-bold ${scoreColor}`}>
              {score !== null ? `${score}/${scoreOutOf}` : "—"}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm">جودة الإعلان</span>
            </div>
          </div>

          {/* Feedback */}
          {report.feedback && (
            <div className="bg-card rounded-2xl border p-6 mb-6">
              <h2 className="text-lg font-bold mb-3">التحليل العام</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {report.feedback}
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            {/* Strengths */}
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                نقاط القوة
              </h2>
              {report.strengths.length > 0 ? (
                <ul className="space-y-2 list-disc pr-5 text-muted-foreground">
                  {report.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد عناصر</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                نقاط الضعف
              </h2>
              {report.weaknesses.length > 0 ? (
                <ul className="space-y-2 list-disc pr-5 text-muted-foreground">
                  {report.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد عناصر</p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-card rounded-2xl border p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-featured" />
              الاقتراحات
            </h2>
            {report.suggestions.length > 0 ? (
              <ul className="space-y-2 list-disc pr-5 text-muted-foreground">
                {report.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد اقتراحات</p>
            )}
          </div>

          {/* Optimized Content */}
          {(report.optimized_content.title || report.optimized_content.description) && (
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">تحسين الإعلان</h2>
                <Badge variant="secondary">مقترح بالذكاء الاصطناعي</Badge>
              </div>

              {report.optimized_content.title && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1">العنوان المقترح</p>
                  <p className="text-base bg-muted rounded-lg p-3">
                    {report.optimized_content.title}
                  </p>
                </div>
              )}

              {report.optimized_content.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-semibold mb-1">الوصف المقترح</p>
                    <p className="text-muted-foreground leading-relaxed bg-muted rounded-lg p-3 whitespace-pre-line">
                      {report.optimized_content.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdAnalysisReportPage;
