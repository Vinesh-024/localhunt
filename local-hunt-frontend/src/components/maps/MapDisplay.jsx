// // src/components/maps/MapDisplay.jsx
// import React, { useRef, useEffect, useState } from 'react';
// import mapboxgl from 'mapbox-gl';
// import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'; // For search control
// import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'; // Geocoder CSS

// // Set Mapbox access token globally
// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

// function MapDisplay({
//   center = [78.486671, 17.385044], // Default center (Hyderabad)
//   zoom = 10,
//   vendors = [], // Array of vendor objects with location {latitude, longitude}
//   onMapClick, // Callback for map clicks
//   onGeocoderResult, // Callback for geocoder search results
//   showGeocoder = false, // Whether to show the search bar
//   isInteractive = true, // Whether map is draggable/zoomable
//   style = 'mapbox://styles/mapbox/streets-v11', // Map style
// }) {
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [mapLoaded, setMapLoaded] = useState(false);

//   useEffect(() => {
//     if (map.current || !mapContainer.current) return;

//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: style,
//       center: center,
//       zoom: zoom,
//       interactive: isInteractive, // Control interactivity
//     });

//     // Add navigation control (zoom and compass)
//     if (isInteractive) {
//       map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
//     }

//     // Add geocoder search control if enabled
//     if (showGeocoder && isInteractive) {
//       const geocoder = new MapboxGeocoder({
//         accessToken: mapboxgl.accessToken,
//         mapboxgl: mapboxgl,
//         marker: {
//           color: 'orange'
//         },
//         placeholder: 'Search for places or addresses',
//         proximity: center, // Prioritize results near initial center
//       });
//       map.current.addControl(geocoder, 'top-right');

//       geocoder.on('result', (e) => {
//         if (onGeocoderResult) {
//           const { center: [lon, lat], place_name } = e.result;
//           onGeocoderResult({ latitude: lat, longitude: lon, address: place_name });
//         }
//       });
//     }

//     map.current.on('load', () => {
//       setMapLoaded(true);
//     });

//     // Add click listener
//     if (onMapClick) {
//       map.current.on('click', (e) => {
//         onMapClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
//       });
//     }

//     // Cleanup on unmount
//     return () => {
//       if (map.current) {
//         map.current.remove();
//       }
//     };
//   }, [center, zoom, isInteractive, showGeocoder, onMapClick, onGeocoderResult, style]); // Dependencies

//   // Add/update markers when vendors or mapLoaded state changes
//   useEffect(() => {
//     if (!mapLoaded || !map.current) return;

//     // Clear existing markers
//     // This is a simple way; for many markers, consider Mapbox GL JS layers or clustering
//     const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
//     existingMarkers.forEach(marker => marker.remove());

//     vendors.forEach(vendor => {
//       if (vendor.location && vendor.location.latitude && vendor.location.longitude) {
//         const el = document.createElement('div');
//         el.className = 'marker';
//         el.style.backgroundImage = `url(${vendor.profileImageUrl || 'https://placehold.co/30x30/007bff/ffffff?text=V'})`; // Use vendor logo or default
//         el.style.width = '30px';
//         el.style.height = '30px';
//         el.style.backgroundSize = 'cover';
//         el.style.borderRadius = '50%';
//         el.style.border = '2px solid #007bff';
//         el.style.cursor = 'pointer';

//         const popup = new mapboxgl.Popup({ offset: 25 })
//           .setHTML(
//             `<h6>${vendor.businessName}</h6>
//              <p>${vendor.category}</p>
//              <p>Rating: ${vendor.averageRating ? vendor.averageRating.toFixed(1) : 'N/A'}/5</p>
//              <a href="/vendors/${vendor.id}" class="btn btn-sm btn-primary">View Details</a>`
//           );

//         new mapboxgl.Marker(el)
//           .setLngLat([vendor.location.longitude, vendor.location.latitude])
//           .setPopup(popup)
//           .addTo(map.current);
//       }
//     });
//   }, [vendors, mapLoaded]); // Dependencies for marker effect

//   return (
//     <div ref={mapContainer} style={{ width: '100%', height: '500px', borderRadius: '0.5rem' }} />
//   );
// }

// export default MapDisplay;

// src/components/maps/MapDisplay.jsx
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

function MapDisplay({
  center = [78.486671, 17.385044], // Default: Hyderabad
  zoom = 10,
  vendors = [],
  onMapClick,
  onGeocoderResult,
  showGeocoder = false,
  isInteractive = true,
  style = 'mapbox://styles/mapbox/streets-v11',
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const initMap = () => {
      if (!mapContainer.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: center,
        zoom: zoom,
        interactive: isInteractive,
      });

      if (isInteractive) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
      }

      if (showGeocoder && isInteractive) {
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: { color: 'orange' },
          placeholder: 'Search for places or addresses',
          proximity: center,
        });

        map.current.addControl(geocoder, 'top-right');

        geocoder.on('result', (e) => {
          if (onGeocoderResult) {
            const { center: [lon, lat], place_name } = e.result;
            onGeocoderResult({ latitude: lat, longitude: lon, address: place_name });
          }
        });
      }

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
        });
      }
    };

    requestAnimationFrame(initMap);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, isInteractive, showGeocoder, onMapClick, onGeocoderResult, style]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove previous markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    vendors.forEach(vendor => {
      if (vendor.location?.latitude && vendor.location?.longitude) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = `url(${vendor.profileImageUrl || 'https://placehold.co/30x30/007bff/ffffff?text=V'})`;
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundSize = 'cover';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #007bff';
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h6>${vendor.businessName}</h6>
           <p>${vendor.category}</p>
           <p>Rating: ${vendor.averageRating ? vendor.averageRating.toFixed(1) : 'N/A'}/5</p>
           <a href="/vendors/${vendor.id}" class="btn btn-sm btn-primary">View Details</a>`
        );

        new mapboxgl.Marker(el)
          .setLngLat([vendor.location.longitude, vendor.location.latitude])
          .setPopup(popup)
          .addTo(map.current);
      }
    });
  }, [vendors, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '500px', borderRadius: '0.5rem' }}
    />
  );
}

export default MapDisplay;
