import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatTime } from "@/lib/utils";
import MapView from "@/components/map/MapView";
import EmployeeListPanel from "@/components/employees/EmployeeListPanel";
import ChatPanel from "@/components/chat/ChatPanel";
import { User, Location } from "@/types";

export default function LocationTracking() {
  const { t } = useLanguage();
  const { isTracking, error: locationError } = useLocationTracking();
  const { locations: wsLocations } = useWebSocket();
  const [activeEmployeeId, setActiveEmployeeId] = useState<number | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(formatTime(new Date()));

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

  useEffect(() => {
    if (wsLocations && wsLocations.length > 0) {
      // Update combined locations whenever we get new websocket locations
      setCombinedLocations(prev => {
        // Create a map of existing locations by userId for quick lookup
        const locationMap = new Map(prev.map(loc => [loc.userId, loc]));
        
        // Update with new locations
        wsLocations.forEach(wsLoc => {
          locationMap.set(wsLoc.userId, wsLoc);
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

  return (
    <div className="flex h-full">
      {/* Map View */}
      <MapView 
        locations={combinedLocations}
        users={users || []}
        activeEmployeeId={activeEmployeeId}
        onEmployeeClick={handleEmployeeClick}
        onMessageClick={handleMessageClick}
        lastUpdateTime={lastUpdateTime}
        isLoading={isLoadingUsers || isLoadingLocations}
      />
      
      {/* Employee List Panel (hidden on mobile) */}
      <EmployeeListPanel 
        users={users || []}
        locations={combinedLocations}
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
  );
}
