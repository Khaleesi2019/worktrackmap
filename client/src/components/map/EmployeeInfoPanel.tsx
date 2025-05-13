import { useLanguage } from "@/context/LanguageContext";
import { formatTime, formatRelativeTime, getStatusColor, getStatusTextColor } from "@/lib/utils";
import { User, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface EmployeeInfoPanelProps {
  user: User;
  location?: Location;
  onClose: () => void;
  onMessageClick: () => void;
}

export default function EmployeeInfoPanel({
  user,
  location,
  onClose,
  onMessageClick
}: EmployeeInfoPanelProps) {
  const { t } = useLanguage();
  
  return (
    <div className="absolute right-4 bottom-20 w-80 bg-background dark:bg-background rounded-lg shadow-xl overflow-hidden transform transition-transform duration-300 translate-y-0 z-[500]">
      <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
        <h3 className="font-medium">Employee Details</h3>
        <button className="text-primary-foreground hover:text-white focus:outline-none" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
            ) : (
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h4 className="font-medium">{user.name}</h4>
            <span className="text-sm text-muted-foreground">{user.role}</span>
          </div>
          {location && (
            <div className={cn(
              "ml-auto text-xs py-1 px-2 rounded-full",
              location.status === "active" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" :
              location.status === "away" ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" :
              "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            )}>
              <span>{location.status.charAt(0).toUpperCase() + location.status.slice(1)}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3 text-sm">
          {location && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkInTime")}:</span>
                <span className="font-medium">
                  {location.timestamp ? formatTime(location.timestamp) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("currentLocation")}:</span>
                <span className="font-medium">{location.locationName || 'Unknown location'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("status")}:</span>
                <span className={cn(
                  "font-medium",
                  getStatusTextColor(location.status)
                )}>
                  {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("lastUpdate")}:</span>
                <span className="font-medium">
                  {location.timestamp ? formatRelativeTime(location.timestamp) : '-'}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4 space-x-2 flex">
          <Button 
            className="flex-1 flex items-center justify-center" 
            onClick={onMessageClick}
          >
            <i className="fas fa-comment-alt mr-2"></i>
            <span>{t("message")}</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center"
          >
            <i className="fas fa-phone-alt mr-2"></i>
            <span>{t("call")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
