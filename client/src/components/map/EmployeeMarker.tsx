import { useEffect, useRef } from "react";
import { User, Location } from "@/types";
import { getStatusColor } from "@/lib/utils";

interface EmployeeMarkerProps {
  map: any;
  user: User;
  location: Location;
  isActive: boolean;
  onClick: () => void;
}

export default function EmployeeMarker({
  map,
  user,
  location,
  isActive,
  onClick
}: EmployeeMarkerProps) {
  const markerRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  
  useEffect(() => {
    if (!map) return;
    
    const L = (window as any).L;
    if (!L) return;
    
    // Create custom emoji marker
    const emojiIcon = L.divIcon({
      className: 'emoji-marker-container',
      html: `
        <div class="emoji-marker ${isActive ? 'active' : ''}" style="font-size: 24px; cursor: pointer;">
          <div class="relative">
            <span class="text-2xl">${user.emoji || '👤'}</span>
            <div class="absolute -bottom-2 -right-2 w-3 h-3 ${getStatusColor(location.status)} rounded-full border-2 border-white dark:border-gray-900"></div>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    
    // Create marker
    const marker = L.marker([parseFloat(location.latitude), parseFloat(location.longitude)], {
      icon: emojiIcon,
      title: user.name
    }).addTo(map);
    
    // Create popup with user info
    const popup = L.popup({
      closeButton: false,
      className: 'employee-popup',
      offset: [0, -15],
      closeOnClick: false
    }).setContent(`
      <div class="p-2 text-xs bg-white dark:bg-gray-900 rounded shadow-lg">
        <p class="font-bold">${user.name}</p>
        <p>${user.role} • ${location.status.charAt(0).toUpperCase() + location.status.slice(1)}</p>
        <p>${location.locationName || 'Unknown location'}</p>
      </div>
    `);
    
    // Add hover events
    marker.on('mouseover', function() {
      marker.bindPopup(popup).openPopup();
    });
    
    marker.on('mouseout', function() {
      marker.closePopup();
    });
    
    // Add click event
    marker.on('click', onClick);
    
    // Save references
    markerRef.current = marker;
    popupRef.current = popup;
    
    // Clean up on unmount
    return () => {
      map.removeLayer(marker);
    };
  }, [map, user, location, isActive, onClick]);
  
  // Update marker position if location changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([parseFloat(location.latitude), parseFloat(location.longitude)]);
    }
  }, [location]);
  
  // Return null as the marker is added directly to the map
  return null;
}
