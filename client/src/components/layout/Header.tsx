import { useLocation } from "wouter";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  sidebarToggle?: () => void;
}

export default function Header({ sidebarToggle }: HeaderProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Get page title based on current location
  const getPageTitle = () => {
    switch (true) {
      case location === "/dashboard":
        return t("dashboard");
      case location === "/employees":
        return t("employees");
      case location === "/location-tracking":
        return t("locationTracking");
      case location === "/attendance":
        return t("attendance");
      case location === "/chat":
        return t("teamChat");
      case location === "/reports":
        return t("reports");
      case location === "/settings":
        return t("settings");
      default:
        return t("dashboard");
    }
  };

  // Get page description based on current location
  const getPageDescription = () => {
    switch (true) {
      case location === "/location-tracking":
        return t("locationDescription");
      default:
        return "";
    }
  };

  return (
    <header className="hidden lg:flex justify-between items-center h-16 px-6 bg-background border-b">
      <div>
        <h1 className="text-xl font-bold">{getPageTitle()}</h1>
        <p className="text-sm text-muted-foreground">{getPageDescription()}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Input 
            type="text" 
            placeholder={t("searchEmployees")} 
            className="py-2 pl-10 pr-4 w-64 rounded-lg" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative text-muted-foreground hover:text-foreground">
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
          </button>
          <div className="h-8 border-l border-border"></div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : (
                <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium">{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]?.[0]}.</span>
          </div>
        </div>
      </div>
    </header>
  );
}
