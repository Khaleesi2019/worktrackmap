import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export default function Sidebar() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDisplayed, setIsDisplayed] = useState(true);

  // Navigation items
  const navItems = [
    { path: "/dashboard", icon: "fas fa-tachometer-alt", label: t("dashboard") },
    { path: "/employees", icon: "fas fa-users", label: t("employees") },
    { path: "/location-tracking", icon: "fas fa-map-marked-alt", label: t("locationTracking") },
    { path: "/attendance", icon: "fas fa-clipboard-check", label: t("attendance") },
    { path: "/chat", icon: "fas fa-comment-dots", label: t("teamChat"), badge: 3 },
    { path: "/reports", icon: "fas fa-chart-bar", label: t("reports") },
    { path: "/settings", icon: "fas fa-cog", label: t("settings") },
  ];

  // Hide sidebar on mobile when it's open
  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsDisplayed(false);
    }
  };

  // Toggle sidebar collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside 
        className={cn(
          "h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-20",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "hidden lg:block"
        )}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && <h1 className="font-bold text-xl text-sidebar-foreground">WorkTracker</h1>}
            <button 
              onClick={toggleCollapse}
              className="text-sidebar-foreground focus:outline-none"
            >
              <i className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
            </button>
          </div>
        </div>
        
        {/* User profile section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                {user?.name.charAt(0)}
              </div>
            )}
            {!isCollapsed && (
              <div>
                <p className="font-medium text-sidebar-foreground">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation menu */}
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <div
                  onClick={() => {
                    window.location.href = item.path;
                    closeSidebar();
                  }}
                  className={cn(
                    "flex items-center p-3 rounded-lg cursor-pointer",
                    location === item.path 
                      ? "bg-sidebar-primary/10 text-sidebar-primary" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    "transition-colors"
                  )}
                >
                  <i className={`${item.icon} ${isCollapsed ? "" : "w-5"}`}></i>
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Settings section */}
        {!isCollapsed && (
          <div className="absolute bottom-0 w-full p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-sidebar-foreground">{t('darkMode')}</span>
              <button 
                onClick={toggleTheme}
                className={cn(
                  "relative inline-flex items-center h-6 rounded-full w-11",
                  theme === "dark" ? "bg-sidebar-primary" : "bg-gray-300"
                )}
              >
                <span 
                  className={cn(
                    "absolute bg-white dark:bg-gray-900 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center",
                    theme === "dark" ? "left-5" : "left-0.5"
                  )}
                >
                  <i className={`fas ${theme === "dark" ? "fa-moon text-blue-300" : "fa-sun text-yellow-500"} text-xs`}></i>
                </span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-sidebar-foreground">{t('language')}</span>
              <Button 
                onClick={toggleLanguage}
                variant="outline" 
                className="h-8 px-3 py-1 text-sm"
              >
                {language === "en" ? "EN" : "ES"}
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile sidebar (overlay) */}
      {isDisplayed && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-black opacity-50" 
            onClick={() => setIsDisplayed(false)}
          ></div>
          <div className="absolute left-0 top-0 h-full w-64 bg-sidebar shadow-lg transform transition-transform duration-300 ease-in-out">
            {/* Mobile sidebar content (duplicate of desktop) */}
            <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
              <h1 className="font-bold text-xl text-sidebar-foreground">WorkTracker</h1>
              <button 
                onClick={() => setIsDisplayed(false)} 
                className="text-sidebar-foreground"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* User profile */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                    {user?.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sidebar-foreground">{user?.name}</p>
                  <p className="text-xs text-sidebar-foreground/60">{user?.role}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation menu */}
            <nav className="p-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <div
                      onClick={() => {
                        window.location.href = item.path;
                        closeSidebar();
                      }}
                      className={cn(
                        "flex items-center p-3 rounded-lg cursor-pointer",
                        location === item.path 
                          ? "bg-sidebar-primary/10 text-sidebar-primary" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                        "transition-colors"
                      )}
                    >
                      <i className={`${item.icon} w-5`}></i>
                      <span className="ml-3">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
