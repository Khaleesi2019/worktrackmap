import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import EmployeeMarker from "./EmployeeMarker";
import EmployeeInfoPanel from "./EmployeeInfoPanel";
import { User, Location } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  locations: Location[];
  users: User[];
  activeEmployeeId: number | null;
  onEmployeeClick: (employeeId: number) => void;
  onMessageClick: () => void;
  lastUpdateTime: string;
  isLoading: boolean;
}

export default function MapView({
  locations,
  users,
  activeEmployeeId,
  onEmployeeClick,
  onMessageClick,
  lastUpdateTime,
  isLoading
}: MapViewProps) {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [zoom, setZoom] = useState(14);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || map) return;
    
    // Create map instance
    const leaflet = (window as any).L;
    if (!leaflet) return;
    
    const mapInstance = leaflet.map(mapRef.current, {
      center: [40.712776, -74.005974], // Default center
      zoom: zoom,
      zoomControl: false // We'll add custom zoom controls
    });
    
    // Add tile layer (map style)
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);
    
    setMap(mapInstance);
    
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapRef, map, zoom]);
  
  // Update map markers when locations change
  useEffect(() => {
    if (!map || !locations.length) return;
    
    // If we have locations, center map on first location
    if (locations.length > 0) {
      const activeLocation = locations.find(loc => loc.userId === activeEmployeeId);
      
      if (activeLocation) {
        map.setView([parseFloat(activeLocation.latitude), parseFloat(activeLocation.longitude)], zoom);
      } else {
        const firstLocation = locations[0];
        map.setView([parseFloat(firstLocation.latitude), parseFloat(firstLocation.longitude)], zoom);
      }
    }
  }, [map, locations, activeEmployeeId, zoom]);
  
  const handleZoomIn = () => {
    if (map) {
      map.setZoom(map.getZoom() + 1);
      setZoom(map.getZoom());
    }
  };
  
  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
      setZoom(map.getZoom());
    }
  };
  
  const handleCenterMap = () => {
    if (map && locations.length > 0) {
      // Find active employee location or use first location
      const activeLocation = locations.find(loc => loc.userId === activeEmployeeId);
      
      if (activeLocation) {
        map.setView([parseFloat(activeLocation.latitude), parseFloat(activeLocation.longitude)], zoom);
      } else {
        const firstLocation = locations[0];
        map.setView([parseFloat(firstLocation.latitude), parseFloat(firstLocation.longitude)], zoom);
      }
    }
  };
  
  // Find active employee
  const activeEmployee = users.find(user => user.id === activeEmployeeId);
  // Find active employee location
  const activeEmployeeLocation = locations.find(loc => loc.userId === activeEmployeeId);

  return (
    <div className="flex-1 relative">
      {isLoading ? (
        <div className="map-container w-full bg-muted flex items-center justify-center">
          <Skeleton className="h-64 w-64 rounded-lg" />
        </div>
      ) : (
        <div className="map-container w-full bg-muted relative overflow-hidden">
          <div ref={mapRef} className="absolute inset-0"></div>
          
          {/* Map locations as markers */}
          {map && locations.map(location => {
            const user = users.find(u => u.id === location.userId);
            if (!user) return null;
            
            return (
              <EmployeeMarker 
                key={`marker-${location.userId}`}
                map={map}
                user={user}
                location={location}
                isActive={activeEmployeeId === location.userId}
                onClick={() => onEmployeeClick(location.userId)}
              />
            );
          })}
          
          {/* Map controls */}
          <div className="absolute top-4 right-4 bg-background dark:bg-background rounded-lg shadow-lg p-2 z-[400]">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <i className="fas fa-plus"></i>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary mt-1"
            >
              <i className="fas fa-minus"></i>
            </Button>
            <div className="border-t border-border my-1"></div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCenterMap}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <i className="fas fa-location-arrow"></i>
            </Button>
          </div>
          
          {/* Last Updated Indicator */}
          <div className="absolute top-4 left-4 bg-background dark:bg-background rounded-lg shadow-lg p-2 text-sm z-[400]">
            <div className="flex items-center">
              <i className="fas fa-sync-alt mr-2 text-green-500 animate-spin"></i>
              <span>{t("lastUpdated")}</span> <span className="ml-1 font-medium">{lastUpdateTime}</span>
            </div>
          </div>
          
          {/* Employee Info Panel */}
          {activeEmployeeId && activeEmployee && (
            <EmployeeInfoPanel 
              user={activeEmployee}
              location={activeEmployeeLocation}
              onClose={() => onEmployeeClick(0)}
              onMessageClick={onMessageClick}
            />
          )}
        </div>
      )}
    </div>
  );
}
