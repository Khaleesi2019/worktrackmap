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

              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full mt-6"
              >
                {t("continue")} <i className="fas fa-arrow-right ml-2"></i>
              </Button>
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