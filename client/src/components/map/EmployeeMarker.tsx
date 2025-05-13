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
    
    // Create custom avatar marker
    const avatarIcon = L.divIcon({
      className: 'avatar-marker-container',
      html: `
        <div class="avatar-marker ${isActive ? 'scale-125' : ''}" style="cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;">
          <div class="relative">
            ${user.avatarUrl 
              ? `<div class="w-12 h-12 rounded-full overflow-hidden border-2 ${isActive ? 'border-primary' : 'border-white dark:border-gray-800'} ${isActive ? 'shadow-lg' : ''}">
                  <img src="${user.avatarUrl}" alt="${user.name}" class="w-full h-full object-cover" />
                </div>`
              : `<div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-primary text-primary-foreground border-2 ${isActive ? 'border-primary-foreground' : 'border-white dark:border-gray-800'}">${user.name.charAt(0)}</div>`
            }
            <div class="absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(location.status)} rounded-full border-2 border-white dark:border-gray-900"></div>
            ${isActive ? `<div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-full whitespace-nowrap">${user.name}</div>` : ''}
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
    
    // Create marker
    const marker = L.marker([parseFloat(location.latitude), parseFloat(location.longitude)], {
      icon: avatarIcon,
      title: user.name,
      // Adding a zIndexOffset for active markers to ensure they appear on top
      zIndexOffset: isActive ? 1000 : 0
    }).addTo(map);
    
    // Create popup with user info
    const popup = L.popup({
      closeButton: false,
      className: 'employee-popup',
      offset: [0, -25],
      closeOnClick: false
    }).setContent(`
      <div class="p-3 text-sm bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-[200px]">
        <div class="font-bold text-base mb-1">${user.name}</div>
        <div class="flex items-center mb-1 text-xs">
          <span class="inline-block w-2 h-2 ${getStatusColor(location.status)} rounded-full mr-1"></span>
          <span>${location.status.charAt(0).toUpperCase() + location.status.slice(1)}</span>
        </div>
        <div class="text-xs opacity-70">${user.role}</div>
        <div class="text-xs opacity-70">${location.locationName || 'Unknown location'}</div>
      </div>
    `);
    
    // Add hover events
    marker.on('mouseover', function() {
      if (!isActive) { // Only show popup on hover if not already active
        marker.bindPopup(popup).openPopup();
      }
    });
    
    marker.on('mouseout', function() {
      if (!isActive) {
        marker.closePopup();
      }
    });
    
    // Add click event
    marker.on('click', onClick);
    
    // If active, show popup by default
    if (isActive) {
      marker.bindPopup(popup).openPopup();
    }
    
    // Save references
    markerRef.current = marker;
    popupRef.current = popup;
    
    // Clean up on unmount
    return () => {
      map.removeLayer(marker);
    };
  }, [map, user, location, isActive, onClick]);
  
  // Update marker position and icon if location or active state changes
  useEffect(() => {
    if (!markerRef.current || !map) return;
    
    // Update position
    markerRef.current.setLatLng([parseFloat(location.latitude), parseFloat(location.longitude)]);
    
    // Update icon if active state changes
    const L = (window as any).L;
    if (L) {
      // Recreate icon with updated active state
      const avatarIcon = L.divIcon({
        className: 'avatar-marker-container',
        html: `
          <div class="avatar-marker ${isActive ? 'scale-125' : ''}" style="cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;">
            <div class="relative">
              ${user.avatarUrl 
                ? `<div class="w-12 h-12 rounded-full overflow-hidden border-2 ${isActive ? 'border-primary' : 'border-white dark:border-gray-800'} ${isActive ? 'shadow-lg' : ''}">
                    <img src="${user.avatarUrl}" alt="${user.name}" class="w-full h-full object-cover" />
                  </div>`
                : `<div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-primary text-primary-foreground border-2 ${isActive ? 'border-primary-foreground' : 'border-white dark:border-gray-800'}">${user.name.charAt(0)}</div>`
              }
              <div class="absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(location.status)} rounded-full border-2 border-white dark:border-gray-900"></div>
              ${isActive ? `<div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-full whitespace-nowrap">${user.name}</div>` : ''}
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });
      
      markerRef.current.setIcon(avatarIcon);
      markerRef.current.setZIndexOffset(isActive ? 1000 : 0);
      
      // Handle popup based on active state
      if (isActive && popupRef.current) {
        markerRef.current.bindPopup(popupRef.current).openPopup();
      } else {
        markerRef.current.closePopup();
      }
    }
  }, [location, isActive, map, user]);
  
  // Return null as the marker is added directly to the map
  return null;
}
