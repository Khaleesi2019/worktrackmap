import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function Settings() {
  const { t, language, toggleLanguage, setLanguage } = useLanguage();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
        <p className="text-muted-foreground">
          Customize your application experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile')}</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : (
                  <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium text-lg">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-muted-foreground">{user?.username}</p>
            </div>
            
            <Button variant="outline" className="w-full" onClick={logout}>
              <i className="fas fa-sign-out-alt mr-2"></i>
              {t('logout')}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">{t('darkMode')}</p>
                <p className="text-sm text-muted-foreground">
                  Toggle between dark and light mode
                </p>
              </div>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <p className="font-medium">{t('language')}</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={language === "en" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setLanguage("en")}
                >
                  English
                </Button>
                <Button 
                  variant={language === "es" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setLanguage("es")}
                >
                  Español
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('notifications')}</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
