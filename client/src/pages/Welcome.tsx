import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  // Proceed to login page
  const handleContinue = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-background p-4">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="text-primary text-6xl mb-2">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <h1 className="text-4xl font-bold">{t("appName")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("welcomeDescription")}
          </p>
        </div>

        {/* Language and Theme Selection */}
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{t("selectLanguage")}</h2>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setLanguage("en")}
                    variant={language === "en" ? "default" : "outline"}
                    className="flex-1"
                  >
                    <span className="mr-2">🇺🇸</span> English
                  </Button>
                  <Button
                    onClick={() => setLanguage("es")}
                    variant={language === "es" ? "default" : "outline"}
                    className="flex-1"
                  >
                    <span className="mr-2">🇪🇸</span> Español
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{t("selectTheme")}</h2>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setTheme("light")}
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex-1"
                  >
                    <i className="fas fa-sun mr-2"></i> {t("lightMode")}
                  </Button>
                  <Button
                    onClick={() => setTheme("dark")}
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex-1"
                  >
                    <i className="fas fa-moon mr-2"></i> {t("darkMode")}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full"
                >
                  {t("continue")} <i className="fas fa-arrow-right ml-2"></i>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowTour(true)}
                  size="lg"
                  className="w-full"
                >
                  Take a Tour <i className="fas fa-compass ml-2"></i>
                </Button>
              </div>

              <Dialog open={showTour} onOpenChange={setShowTour}>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Welcome to Employee Management System</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded">
                      <h3 className="font-bold mb-2">Employee Check-in/out</h3>
                      <p>Employees can easily check in/out by entering their name and phone number. Simple and efficient attendance tracking.</p>
                    </div>

                    <div className="p-4 border rounded">
                      <h3 className="font-bold mb-2">Admin Dashboard (Code: 1020)</h3>
                      <p>Administrators have access to:</p>
                      <ul className="list-disc ml-4">
                        <li>Real-time attendance monitoring</li>
                        <li>Employee location tracking</li>
                        <li>Remote assistance capabilities</li>
                        <li>Performance analytics</li>
                        <li>Team chat functionality</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded">
                      <h3 className="font-bold mb-2">Remote Support</h3>
                      <p>Secure remote desktop access for technical support, completely invisible to employees.</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setShowTour(false)}>Got it!</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* App Screenshots */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
          <div className="bg-accent rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl text-primary mb-2">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3 className="font-semibold">{t("locationTracking")}</h3>
            <p className="text-sm text-muted-foreground">{t("trackInRealTime")}</p>
          </div>
          <div className="bg-accent rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl text-primary mb-2">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="font-semibold">{t("teamManagement")}</h3>
            <p className="text-sm text-muted-foreground">{t("manageEmployees")}</p>
          </div>
          <div className="bg-accent rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl text-primary mb-2">
              <i className="fas fa-comment-dots"></i>
            </div>
            <h3 className="font-semibold">{t("teamChat")}</h3>
            <p className="text-sm text-muted-foreground">{t("communicateWithTeam")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}