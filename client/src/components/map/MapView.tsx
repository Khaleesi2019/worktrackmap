import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import EmployeeMarker from "./EmployeeMarker";
import EmployeeInfoPanel from "./EmployeeInfoPanel";
import { User, Location } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
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
    
    // Add tile layer based on selected map type
    const tileLayer = getMapLayer(mapType);
    tileLayer.addTo(mapInstance);
    
    setMap(mapInstance);
    
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapRef, map, zoom, mapType]);
  
  // Get map layer based on selected type
  const getMapLayer = (type: 'standard' | 'satellite') => {
    const leaflet = (window as any).L;
    
    if (type === 'satellite') {
      return leaflet.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
    } else {
      return leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
    }
  };
  
  // Change map type
  useEffect(() => {
    if (!map) return;
    
    // Remove existing layers
    map.eachLayer((layer: any) => {
      if (layer._url) { // It's a tile layer
        map.removeLayer(layer);
      }
    });
    
    // Add new layer based on selected type
    const tileLayer = getMapLayer(mapType);
    tileLayer.addTo(map);
    
  }, [map, mapType]);
  
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
  
  // Filter locations based on search and active tab
  const filteredLocations = locations.filter(location => {
    const user = users.find(u => u.id === location.userId);
    if (!user) return false;
    
    // Search filter
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.locationName && location.locationName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filter
    const matchesStatus = 
      activeTab === 'all' || 
      (activeTab === 'active' && location.status === 'active') ||
      (activeTab === 'away' && location.status === 'away') ||
      (activeTab === 'offline' && location.status === 'offline');
    
    return matchesSearch && matchesStatus;
  });
  
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
  
  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };
  
  // Count employees by status
  const statusCounts = {
    all: locations.length,
    active: locations.filter(loc => loc.status === 'active').length,
    away: locations.filter(loc => loc.status === 'away').length,
    offline: locations.filter(loc => loc.status === 'offline').length,
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
          {map && filteredLocations.map(location => {
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
          
          {/* Top search and filter bar */}
          <Card className="absolute top-4 left-4 right-4 bg-background/90 dark:bg-background/90 shadow-lg p-3 z-[400] backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input 
                    type="text" 
                    placeholder={t("searchEmployees")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={toggleMapType}
                  className="h-10 w-10"
                >
                  <i className={`fas ${mapType === 'standard' ? 'fa-satellite' : 'fa-map'}`}></i>
                </Button>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 w-full h-9">
                  <TabsTrigger value="all" className="text-xs h-7 px-2">
                    {t("all")} <Badge className="ml-1 bg-gray-500 text-xs">{statusCounts.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-xs h-7 px-2">
                    {t("active")} <Badge className="ml-1 bg-green-500 text-xs">{statusCounts.active}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="away" className="text-xs h-7 px-2">
                    {t("away")} <Badge className="ml-1 bg-yellow-500 text-xs">{statusCounts.away}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="offline" className="text-xs h-7 px-2">
                    {t("offline")} <Badge className="ml-1 bg-gray-500 text-xs">{statusCounts.offline}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>
          
          {/* Map controls */}
          <div className="absolute bottom-24 right-4 bg-background/90 dark:bg-background/90 rounded-lg shadow-lg p-2 z-[400] backdrop-blur-sm">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary mb-1"
            >
              <i className="fas fa-plus"></i>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary mb-1"
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
          <div className="absolute bottom-4 left-4 bg-background/90 dark:bg-background/90 rounded-lg shadow-lg px-3 py-2 text-sm z-[400] backdrop-blur-sm">
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
