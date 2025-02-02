// frontend/src/components/FireMarkers.js
import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px'
};

// Adjust the center as needed (roughly central Canada)
const center = {
  lat: 56.0,
  lng: -100.0,
};

const groupColors = {
  group1: "darkred",  // fires detected within last 1 hour
  group2: "red",      // 1 to 4 hours ago
  group3: "orange",   // 4 to 12 hours ago
  group4: "yellow"    // more than 12 hours ago
};

function FireMarkers({ fireGroups }) {
  // Load the Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyD7yhyKbAtYlE_1GLPyYKG4FkvqbiTKlPY", // Replace with your actual API key
    libraries: ['places']
  });

  if (!isLoaded) return <div>Loading map...</div>;

  // Combine markers from all groups into one array with group info
  const markers = [];
  Object.keys(fireGroups).forEach((groupKey) => {
    if (Array.isArray(fireGroups[groupKey])) {
      fireGroups[groupKey].forEach((fire) => {
        markers.push({ ...fire, group: groupKey });
      });
    }
  });

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={4}>
      {markers.map((fire, index) => (
        <Marker
          key={index}
          position={{ lat: fire.latitude, lng: fire.longitude }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: groupColors[fire.group],
            fillOpacity: 0.8,
            scale: 4,
            strokeColor: 'white',
            strokeWeight: 1
          }}
        />
      ))}
    </GoogleMap>
  );
}

export default FireMarkers;
