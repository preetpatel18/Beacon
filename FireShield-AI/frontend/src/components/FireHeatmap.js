import React, { useEffect, useRef } from 'react';

const FireHeatmap = ({ fireData, userLocation, suggestedSafeLocation }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded yet.');
      return;
    }

    // Center the map on the effective user location if available; otherwise, default to a center over Canada.
    const center = userLocation
      ? { lat: userLocation.latitude, lng: userLocation.longitude }
      : { lat: 56, lng: -100 };

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 6,
    });

    // Add a marker for the effective user location.
    if (userLocation) {
      new window.google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: map,
        title: 'Your Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });
    }

    // Create a heatmap layer using fire data.
    const heatmapData = fireData.map((fire) => ({
      location: new window.google.maps.LatLng(
        parseFloat(fire.latitude),
        parseFloat(fire.longitude)
      ),
      weight: fire.brightness ? parseFloat(fire.brightness) : 1,
    }));

    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      radius: 20,
    });
    heatmap.setMap(map);

    // Add a marker for the suggested safe location.
    if (suggestedSafeLocation) {
      new window.google.maps.Marker({
        position: {
          lat: suggestedSafeLocation.latitude,
          lng: suggestedSafeLocation.longitude,
        },
        map: map,
        title: 'Suggested Safe Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      });
    }
  }, [fireData, userLocation, suggestedSafeLocation]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default FireHeatmap;
