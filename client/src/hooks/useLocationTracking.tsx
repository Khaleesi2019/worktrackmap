import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "./useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LocationOptions {
  enableHighAccuracy?: boolean;
  interval?: number; // in milliseconds, defaults to 30 min
  onLocationError?: (error: GeolocationPositionError) => void;
}

export function useLocationTracking(options: LocationOptions = {}) {
  const { user } = useAuth();
  const { updateLocation } = useWebSocket();
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    enableHighAccuracy = true, 
    interval = 30 * 60 * 1000, // 30 minutes in milliseconds
    onLocationError 
  } = options;
  
  // Function to get and update current location
  const updateCurrentLocation = useCallback(async () => {
    if (!user) return;
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setCurrentPosition(position);
          setError(null);
          
          const locationData = {
            userId: user.id,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            status: "active"
          };
          
          // Try to update via WebSocket first
          const wsSuccess = updateLocation(user.id, locationData);
          
          // Fallback to REST API if WebSocket is not available
          if (!wsSuccess) {
            try {
              await apiRequest("POST", "/api/locations", locationData);
            } catch (error) {
              console.error("Failed to update location via API:", error);
              toast({
                title: "Location Error",
                description: "Failed to update your location. Please check your connection.",
                variant: "destructive",
              });
            }
          }
        },
        (geolocationError) => {
          setError(`Error getting location: ${geolocationError.message}`);
          if (onLocationError) {
            onLocationError(geolocationError);
          }
        },
        { enableHighAccuracy, timeout: 10000, maximumAge: 60000 }
      );
    } catch (error) {
      console.error("Location tracking error:", error);
      setError("Failed to track location");
    }
  }, [user, enableHighAccuracy, updateLocation, onLocationError, toast]);
  
  // Start location tracking
  const startTracking = useCallback(() => {
    if (!isTracking) {
      setIsTracking(true);
      // Update location immediately
      updateCurrentLocation();
      
      // Set up interval for periodic updates
      const intervalId = setInterval(updateCurrentLocation, interval);
      return () => {
        clearInterval(intervalId);
        setIsTracking(false);
      };
    }
    return () => {}; // No-op if already tracking
  }, [isTracking, updateCurrentLocation, interval]);
  
  // Start tracking when component mounts if user is available
  useEffect(() => {
    if (user) {
      const cleanup = startTracking();
      return cleanup;
    }
  }, [user, startTracking]);
  
  return {
    currentPosition,
    isTracking,
    error,
    updateCurrentLocation,
    startTracking
  };
}
