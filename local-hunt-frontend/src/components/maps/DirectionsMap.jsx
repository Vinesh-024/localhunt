// src/components/maps/DirectionsMap.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

function DirectionsMap({
  userLocation, // { lng, lat }
  selectedVendorForDirections, // { id, lng, lat, businessName }
  travelMode = 'driving', // 'driving', 'walking', 'cycling'
  onRouteCalculated, // Callback { distance, duration, mode }
  onClose, // Callback to close the directions (e.g., from parent modal)
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const directionsControlRef = useRef(null);

  // Refs for custom start/end markers
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  // Helper functions for custom markers (copied from MapDisplay)
  const createMarkerElement = useCallback((text, color, textColor = 'white') => {
      const el = document.createElement('div');
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.color = textColor;
      el.style.fontWeight = 'bold';
      el.style.fontSize = '1.2em';
      el.style.cursor = 'pointer';
      el.innerText = text;
      return el;
  }, []);

  const removeCustomStartEndMarkers = useCallback(() => {
      if (startMarkerRef.current) {
          startMarkerRef.current.remove();
          startMarkerRef.current = null;
      }
      if (endMarkerRef.current) {
          endMarkerRef.current.remove();
          endMarkerRef.current = null;
      }
  }, []);

  const addCustomStartEndMarkers = useCallback((userLoc, vendorLoc, mapInstance) => {
      removeCustomStartEndMarkers();
      const startEl = createMarkerElement('S', '#28a745');
      startMarkerRef.current = new mapboxgl.Marker({ element: startEl })
          .setLngLat([userLoc.lng, userLoc.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<h3>Your Location (Start)</h3>'))
          .addTo(mapInstance);

      const endEl = createMarkerElement('E', '#dc3545');
      endMarkerRef.current = new mapboxgl.Marker({ element: endEl })
          .setLngLat([vendorLoc.lng, vendorLoc.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${vendorLoc.businessName || 'Destination'} (End)</h3>`))
          .addTo(mapInstance);
  }, [createMarkerElement, removeCustomStartEndMarkers]);


  // --- Effect: Initialize Map and Directions (Runs ONCE per modal open) ---
  useEffect(() => {
    if (!mapContainer.current) {
      console.error('DirectionsMap container ref is null, cannot initialize map.');
      return;
    }
    if (!mapboxgl.accessToken || mapboxgl.accessToken === 'undefined' || mapboxgl.accessToken.includes('YOUR_PUBLIC_MAPBOX_TOKEN_HERE')) {
      console.error('Mapbox Access Token is missing or invalid. Map will not load.');
      return;
    }

    // Initialize map
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: selectedVendorForDirections ? [selectedVendorForDirections.lng, selectedVendorForDirections.lat] : [78.4867, 17.3850],
      zoom: 12,
      interactive: true,
    });
    map.current = mapInstance;

    // Initialize Mapbox Directions control
    const newDirections = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: `mapbox/${travelMode}`,
      controls: {
        inputs: false, // Hide default input boxes
        instructions: true, // Show instructions
        profileSwitcher: true, // Show travel mode selector
        geolocate: true, // Show geolocate button
        destination: true, // Show destination input
      },
      interactive: true,
      congestion: true,
      flyTo: true,
      alternatives: false,
      geometries: 'geojson',
    });

    directionsControlRef.current = newDirections;
    mapInstance.addControl(newDirections, 'top-right');


    mapInstance.on('load', () => {
      // Set origin and destination once map is loaded
      if (userLocation && selectedVendorForDirections) {
        newDirections.setOrigin([userLocation.lng, userLocation.lat]);
        newDirections.setDestination([selectedVendorForDirections.lng, selectedVendorForDirections.lat]);
        addCustomStartEndMarkers(userLocation, selectedVendorForDirections, mapInstance); // Add custom markers
      }
    });

    // Listen for route calculation and pass info to parent
    const routeHandler = (e) => {
      if (e.route && e.route.length > 0) {
        const route = e.route[0];
        if (typeof onRouteCalculated === 'function') {
          onRouteCalculated({
            distance: route.distance, // in meters
            duration: route.duration, // in seconds
            mode: travelMode,
          });
        }
      } else {
        if (typeof onRouteCalculated === 'function') {
          onRouteCalculated({ distance: 0, duration: 0, mode: travelMode });
        }
      }
    };
    newDirections.on('route', routeHandler);
    newDirections._routeHandler = routeHandler; // Store for cleanup


    // Cleanup function (runs on component unmount)
    return () => {
      if (map.current) {
        if (directionsControlRef.current) {
          if (directionsControlRef.current._routeHandler) {
              directionsControlRef.current.off('route', directionsControlRef.current._routeHandler);
          }
          if (map.current.removeControl && typeof map.current.removeControl === 'function') {
              map.current.removeControl(directionsControlRef.current);
          }
          directionsControlRef.current = null;
        }
        removeCustomStartEndMarkers(); // Remove custom markers
        map.current.remove(); // Remove the map instance
        map.current = null;
      }
    };
  }, [userLocation, selectedVendorForDirections, travelMode, onRouteCalculated, addCustomStartEndMarkers, removeCustomStartEndMarkers]);


  // Effect: Update travel mode if it changes
  useEffect(() => {
    if (directionsControlRef.current && map.current && map.current.isStyleLoaded()) {
        directionsControlRef.current.setProfile(`mapbox/${travelMode}`);
    }
  }, [travelMode, map.current]); // map.current is stable


  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }} // Adjusted height for modal
    >
      {/* Close button for directions text (part of MapboxDirections control itself) */}
      {/* MapboxDirections control has its own UI including a close button for instructions */}
      {/* If you want a custom close button outside MapboxDirections control, you'd add it here */}
    </div>
  );
}

export default DirectionsMap;