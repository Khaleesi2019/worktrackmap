import { Link, useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function MobileNavbar() {
  const [location] = useLocation();
  const { t } = useLanguage();

  // Navigation items
  const navItems = [
    { path: "/dashboard", icon: "fas fa-tachometer-alt", label: t("dashboard") },
    { path: "/location-tracking", icon: "fas fa-map-marked-alt", label: t("map") },
    { path: "/attendance", icon: "fas fa-clipboard-check", label: t("attendance") },
    { path: "/chat", icon: "fas fa-comment-dots", label: t("chat"), badge: 3 },
    { path: "/settings", icon: "fas fa-cog", label: t("settings") },
  ];

  return (
    <nav className="lg:hidden flex items-center justify-around h-16 bg-background border-t border-border">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a className="flex flex-col items-center justify-center relative">
            <i className={cn(
              `${item.icon} text-lg`,
              location === item.path 
                ? "text-primary" 
                : "text-muted-foreground"
            )}></i>
            <span className={cn(
              "text-xs mt-1",
              location === item.path 
                ? "text-primary" 
                : "text-muted-foreground"
            )}>
              {item.label}
            </span>
            {item.badge && (
              <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </a>
        </Link>
      ))}
    </nav>
  );
}
