import { useLanguage } from "@/context/LanguageContext";
import { formatTime, formatRelativeTime, getStatusColor, getStatusTextColor } from "@/lib/utils";
import { User, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Card className="absolute right-4 left-4 bottom-20 md:left-auto md:w-96 bg-background/95 dark:bg-background/95 backdrop-blur-sm shadow-xl overflow-hidden z-[500] border border-primary/20">
      <CardHeader className="p-4 pb-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="w-12 h-12 border-2 border-primary-foreground mr-3">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary-foreground text-primary font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <span className="text-sm opacity-80">{user.role}</span>
            </div>
          </div>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 focus:outline-none transition-colors"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="details" className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="details">{t("details")}</TabsTrigger>
            <TabsTrigger value="location">{t("location")}</TabsTrigger>
          </TabsList>
        </div>
      
        <TabsContent value="details" className="p-0 m-0">
          <CardContent className="p-4 space-y-4">
            {location && (
              <div className="flex items-center justify-between">
                <span>{t("status")}</span>
                <Badge 
                  className={cn(
                    "capitalize",
                    location.status === "active" ? "bg-green-500" :
                    location.status === "away" ? "bg-yellow-500" :
                    "bg-gray-500"
                  )}
                >
                  {location.status}
                </Badge>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <div className="text-2xl text-primary mb-1">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("checkInTime")}
                </div>
                <div className="font-medium">
                  {location?.timestamp ? formatTime(location.timestamp) : '-'}
                </div>
              </div>
              
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <div className="text-2xl text-primary mb-1">
                  <i className="fas fa-history"></i>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("lastUpdate")}
                </div>
                <div className="font-medium">
                  {location?.timestamp ? formatRelativeTime(location.timestamp) : '-'}
                </div>
              </div>
            </div>
            
            {/* Job and Task Information */}
            <div className="bg-accent/50 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <i className="fas fa-briefcase text-primary mr-2"></i>
                <span className="font-medium">{t("jobTitle")}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>{user.jobTitle || 'No job assigned'}</span>
              </div>
              <div className="flex items-center mb-2">
                <i className="fas fa-tasks text-primary mr-2"></i>
                <span className="font-medium">{t("currentTask")}</span>
              </div>
              <div className="flex justify-between">
                <span>{user.task || 'No task assigned'}</span>
              </div>
            </div>
            
            {/* Current Location */}
            <div className="bg-accent/50 rounded-lg p-3 mt-4">
              <div className="flex items-center mb-2">
                <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                <span className="font-medium">{t("currentLocation")}</span>
              </div>
              <div>
                {location?.locationName || 'Unknown location'}
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="location" className="p-0 m-0">
          <CardContent className="p-4">
            <div className="bg-accent/50 rounded-lg p-3 mb-4">
              <div className="flex items-center mb-2">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                <span className="font-medium">{t("locationDetails")}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("latitude")}:</span>
                  <span className="font-medium">
                    {location?.latitude || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("longitude")}:</span>
                  <span className="font-medium">
                    {location?.longitude || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("locationName")}:</span>
                  <span className="font-medium">
                    {location?.locationName || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-accent/50 rounded-lg h-40 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2 text-primary">
                  <i className="fas fa-map"></i>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("detailedMapView")}
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="p-4 pt-2 flex space-x-2">
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
      </CardFooter>
    </Card>
  );
}
