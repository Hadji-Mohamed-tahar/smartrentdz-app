import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Crown, Calendar, Building2, ArrowUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSubscriptionStatus, SubscriptionStatus } from "@/services/subscriptionService";

interface CurrentPlanCardProps {
  publishedApartments?: number;
}

const CurrentPlanCard = ({ publishedApartments = 0 }: CurrentPlanCardProps) => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSubscriptionStatus();
        setSubscription(data);
      } catch {
        // no active subscription
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-2/3 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!subscription || !subscription.is_active) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Crown className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">لا يوجد اشتراك نشط</h3>
            <p className="text-sm text-muted-foreground">اشترك في إحدى الباقات للاستفادة من المميزات</p>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link to="/subscription">تصفح الباقات</Link>
        </Button>
      </div>
    );
  }

  const endDate = subscription.end_date ? new Date(subscription.end_date) : null;
  const startDate = subscription.start_date ? new Date(subscription.start_date) : null;
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{subscription.package_name}</h3>
            <Badge variant={subscription.is_active ? "default" : "secondary"} className="mt-1">
              {subscription.is_active ? "نشط" : "منتهي"}
            </Badge>
          </div>
        </div>
        {daysLeft > 0 && (
          <div className="text-left">
            <span className="text-2xl font-bold text-primary">{daysLeft}</span>
            <p className="text-xs text-muted-foreground">يوم متبقي</p>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 mb-4">
        {startDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />تاريخ البداية
            </span>
            <span>{startDate.toLocaleDateString("ar-DZ")}</span>
          </div>
        )}
        {endDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />تاريخ الانتهاء
            </span>
            <span>{endDate.toLocaleDateString("ar-DZ")}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to="/subscription">
            <ArrowUp className="h-4 w-4 ml-1" />
            ترقية
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to="/subscription">
            <RefreshCw className="h-4 w-4 ml-1" />
            تجديد
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CurrentPlanCard;
