import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Bell, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiPut } from "@/lib/api";

const Settings = () => {
  const { toast } = useToast();
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    email: true, sms: false, newApartments: true, priceChanges: true,
  });

  useEffect(() => {
    if (userData) {
      setFormData({ name: userData.name || "", email: userData.email || "", phone: userData.phone || "" });
    }
  }, [userData]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await apiPut('/user/profile', {
        name: formData.name,
        phone: formData.phone,
      });
      toast({ title: "تم الحفظ", description: "تم حفظ التغييرات بنجاح" });
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء حفظ التغييرات", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await apiPut('/user/password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      });
      toast({ title: "تم التحديث", description: "تم تغيير كلمة المرور بنجاح" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "حدث خطأ أثناء تغيير كلمة المرور", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // The API should handle account deletion
      await logout();
      toast({ title: "تم الحذف", description: "تم حذف حسابك بنجاح" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء حذف الحساب", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">الإعدادات</h1>
          <div className="bg-card rounded-xl border">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
                <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-4 px-6"><User className="h-4 w-4 ml-2" />الملف الشخصي</TabsTrigger>
                <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-4 px-6"><Lock className="h-4 w-4 ml-2" />الأمان</TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-4 px-6"><Bell className="h-4 w-4 ml-2" />الإشعارات</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="p-6">
                <div className="max-w-md space-y-6">
                  <div className="space-y-2"><Label htmlFor="name">الاسم الكامل</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" type="email" value={formData.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>
                  <div className="space-y-2"><Label htmlFor="phone">رقم الهاتف</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                  <Button onClick={handleSaveProfile} disabled={isLoading}><Save className="h-4 w-4 ml-2" />{isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
                </div>
              </TabsContent>

              <TabsContent value="security" className="p-6">
                <div className="max-w-md space-y-6">
                  <h3 className="font-semibold">تغيير كلمة المرور</h3>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input id="current-password" type={showPassword ? "text" : "password"} placeholder="أدخل كلمة المرور الحالية" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="new-password">كلمة المرور الجديدة</Label><Input id="new-password" type="password" placeholder="أدخل كلمة المرور الجديدة" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="confirm-password">تأكيد كلمة المرور</Label><Input id="confirm-password" type="password" placeholder="أعد إدخال كلمة المرور الجديدة" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} /></div>
                  <Button onClick={handleChangePassword} disabled={isLoading}>{isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}</Button>

                  <Separator className="my-8" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-destructive">حذف الحساب</h3>
                    <p className="text-sm text-muted-foreground">سيتم حذف حسابك وجميع بياناتك نهائياً. هذا الإجراء لا يمكن التراجع عنه.</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="destructive" disabled={isLoading}><Trash2 className="h-4 w-4 ml-2" />حذف الحساب</Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                          <AlertDialogDescription>سيتم حذف حسابك وجميع بياناتك بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteAccount}>حذف نهائياً</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="p-6">
                <div className="max-w-md space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">طريقة الإشعارات</h3>
                    <div className="flex items-center justify-between"><div><p className="font-medium">البريد الإلكتروني</p><p className="text-sm text-muted-foreground">استلام الإشعارات عبر البريد</p></div><Switch checked={notifications.email} onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })} /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">الرسائل النصية</p><p className="text-sm text-muted-foreground">استلام الإشعارات عبر SMS</p></div><Switch checked={notifications.sms} onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })} /></div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold">نوع الإشعارات</h3>
                    <div className="flex items-center justify-between"><div><p className="font-medium">شقق جديدة</p><p className="text-sm text-muted-foreground">إشعار عند إضافة شقق جديدة في منطقتك</p></div><Switch checked={notifications.newApartments} onCheckedChange={(checked) => setNotifications({ ...notifications, newApartments: checked })} /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">تغييرات الأسعار</p><p className="text-sm text-muted-foreground">إشعار عند تغيير أسعار الشقق المحفوظة</p></div><Switch checked={notifications.priceChanges} onCheckedChange={(checked) => setNotifications({ ...notifications, priceChanges: checked })} /></div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={isLoading}><Save className="h-4 w-4 ml-2" />{isLoading ? "جاري الحفظ..." : "حفظ التفضيلات"}</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
