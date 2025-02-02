
import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 56.0,
  lng: -100.0,
};

const groupColors = {
  group1: "darkred",  
  group2: "red",     
  group3: "orange",   
  group4: "yellow"    
};

function FireMarkers({ fireGroups }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyD7yhyKbAtYlE_1GLPyYKG4FkvqbiTKlPY", 
    libraries: ['places']
  });

  if (!isLoaded) return <div>Loading map...</div>;

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
