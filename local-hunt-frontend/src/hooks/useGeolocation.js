// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPosition = () => {
    setLoading(true);
    setError(null); // Clear previous errors

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    const success = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
      setLoading(false);
    };

    const geoError = (err) => {
      let errorMessage = 'An unknown error occurred.';
      console.error("Geolocation API error object:", err); // <--- ADD THIS LOG to see full error object

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'User denied the request for Geolocation. Please enable location services in your browser settings.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please ensure your device\'s location services are enabled.';
          break;
        case err.TIMEOUT:
          errorMessage = 'The request to get user location timed out. Please try again.';
          break;
        default:
          // For other errors, use the browser's own message if available
          errorMessage = err.message || 'An unexpected geolocation error occurred.';
          break;
      }
      setError(errorMessage);
      setLoading(false);
    };

    // Options for geolocation
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // Increased timeout to 10 seconds for better chance of getting location
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(success, geoError, options);
  };

  return { location, error, loading, getPosition };
};

export default useGeolocation;