import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { formatTime } from "@/lib/utils";
import MapView from "@/components/map/MapView";
import EmployeeListPanel from "@/components/employees/EmployeeListPanel";
import ChatPanel from "@/components/chat/ChatPanel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Location } from "@/types";

export default function LocationTracking() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isTracking, error: locationError } = useLocationTracking();
  const { locations: wsLocations } = useWebSocket();
  const { toast } = useToast();
  const [activeEmployeeId, setActiveEmployeeId] = useState<number | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(formatTime(new Date()));
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [monitoredLocations, setMonitoredLocations] = useState<Map<number, {lastNotified: Date, originalLocation: Location}>>(new Map());

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch initial locations
  const { data: initialLocations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });

  // Combine initial locations with real-time updates
  const [combinedLocations, setCombinedLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (initialLocations) {
      setCombinedLocations(initialLocations);
    }
  }, [initialLocations]);

  // Helper function to calculate distance between two points in miles
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Check if a location has moved more than 1 mile from original
  const checkLocationDistance = (userId: number, currentLocation: Location) => {
    // Only monitor locations that have been previously recorded
    if (!monitoredLocations.has(userId)) {
      setMonitoredLocations(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, {
          lastNotified: new Date(),
          originalLocation: currentLocation
        });
        return newMap;
      });
      return;
    }
    
    // Get original location data
    const monitoredData = monitoredLocations.get(userId);
    if (!monitoredData) return;
    
    const origLat = parseFloat(monitoredData.originalLocation.latitude);
    const origLon = parseFloat(monitoredData.originalLocation.longitude);
    const currentLat = parseFloat(currentLocation.latitude);
    const currentLon = parseFloat(currentLocation.longitude);
    
    // Calculate distance
    const distance = calculateDistance(origLat, origLon, currentLat, currentLon);
    
    // Create notification if movement is > 1 mile
    if (distance > 1.0) {
      // Only notify every 15 minutes for the same user
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
      
      if (monitoredData.lastNotified < fifteenMinutesAgo) {
        // Find user name
        const employee = users?.find(u => u.id === userId);
        const employeeName = employee ? employee.name : `Employee #${userId}`;
        
        // Send notification
        if (notificationsEnabled) {
          toast({
            title: "Employee Movement Alert",
            description: `${employeeName} has moved ${distance.toFixed(1)} miles from their check-in location.`,
            variant: "destructive",
          });
        }
        
        // Update last notification time
        setMonitoredLocations(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, {
            ...monitoredData,
            lastNotified: new Date()
          });
          return newMap;
        });
      }
    }
  };
  
  useEffect(() => {
    if (wsLocations && wsLocations.length > 0) {
      // Update combined locations whenever we get new websocket locations
      setCombinedLocations(prev => {
        // Create a map of existing locations by userId for quick lookup
        const locationMap = new Map(prev.map(loc => [loc.userId, loc]));
        
        // Update with new locations
        wsLocations.forEach(wsLoc => {
          locationMap.set(wsLoc.userId, wsLoc);
          
          // Check if the employee has moved too far (admin only)
          if (user?.role === "admin" || user?.role === "Administrator") {
            checkLocationDistance(wsLoc.userId, wsLoc);
          }
        });
        
        // Convert map back to array
        return Array.from(locationMap.values());
      });
      
      // Update last update time
      setLastUpdateTime(formatTime(new Date()));
    }
  }, [wsLocations]);

  const handleEmployeeClick = (employeeId: number) => {
    setActiveEmployeeId(employeeId);
    setShowChatPanel(false);
  };

  const handleMessageClick = () => {
    setShowChatPanel(true);
  };

  const handleCloseChatPanel = () => {
    setShowChatPanel(false);
  };

  // Filter locations based on user role
  const getFilteredLocations = () => {
    // Administrators can see all employees
    if (user?.role === "admin" || user?.role === "Administrator") {
      return combinedLocations;
    }
    
    // Regular employees can only see their own location
    return combinedLocations.filter(loc => loc.userId === user?.id);
  };

  // Filter users based on user role
  const getFilteredUsers = () => {
    // Administrators can see all employees
    if (user?.role === "admin" || user?.role === "Administrator") {
      return users || [];
    }
    
    // Regular employees can only see themselves
    return (users || []).filter(u => u.id === user?.id);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Admin controls - only visible to admins */}
      {(user?.role === "admin" || user?.role === "Administrator") && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Switch 
              id="notifications" 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label htmlFor="notifications">
              {notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
            </Label>
          </div>
          <div className="text-sm text-muted-foreground">
            Employees will appear on the map until they check out. You'll be notified if they move more than 1 mile from their check-in location.
          </div>
        </div>
      )}
      
      <div className="flex flex-1 h-full">
        {/* Map View */}
        <MapView 
          locations={getFilteredLocations()}
          users={getFilteredUsers()}
          activeEmployeeId={activeEmployeeId}
          onEmployeeClick={handleEmployeeClick}
          onMessageClick={handleMessageClick}
          lastUpdateTime={lastUpdateTime}
          isLoading={isLoadingUsers || isLoadingLocations}
        />
        
        {/* Employee List Panel (hidden on mobile) */}
        <EmployeeListPanel 
          users={getFilteredUsers()}
          locations={getFilteredLocations()}
          activeEmployeeId={activeEmployeeId}
          onEmployeeClick={handleEmployeeClick}
          isLoading={isLoadingUsers || isLoadingLocations}
          className="hidden lg:block"
        />
        
        {/* Chat Panel (hidden by default) */}
        {showChatPanel && (
          <ChatPanel 
            onClose={handleCloseChatPanel}
            targetUserId={activeEmployeeId}
            users={users || []}
          />
        )}
      </div>
    </div>
  );
}
