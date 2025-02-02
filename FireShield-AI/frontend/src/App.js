import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadScript } from '@react-google-maps/api';
import FireHeatmap from './components/FireHeatmap';
import EmergencyButton from './EmergencyButton';
import './App.css';

// Haversine formula: calculates the distance (in km) between two lat/lng points.
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Specify which libraries to load for Google Maps.
const libraries = ['visualization'];

// Define safe zones for local use. (Adjust these coordinates to match your local context.)
const safePlaces = [
  { name: 'Trenton', latitude: 40.2200, longitude: -74.7600 }
];

// For a campus-level solution, use a smaller risk threshold, e.g., 1 km.
const riskThreshold = 1; // kilometers

function App() {
  const [fireData, setFireData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [riskCategory, setRiskCategory] = useState('Safe'); // "High", "Moderate", or "Safe"
  const [userAddress, setUserAddress] = useState('');
  const [fireAddress, setFireAddress] = useState('');
  const [suggestedSafePlace, setSuggestedSafePlace] = useState(null);

  // 1. Get the user's current location.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error obtaining geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  // 2. Fetch NASA FIRMS data from the backend.
  const fetchFireData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/nasa-firms');
      // Ensure we always set fireData to an array.
      setFireData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching NASA FIRMS data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFireData();
    const intervalId = setInterval(fetchFireData, 300000); // poll every 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  // 3. Risk assessment: Determine the closest fire hotspot and assign a risk category.
  useEffect(() => {
    if (userLocation && fireData.length > 0) {
      let nearestDistance = Infinity;
      let nearestFire = null;
      fireData.forEach((fire) => {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          parseFloat(fire.latitude),
          parseFloat(fire.longitude)
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestFire = fire;
        }
      });
      // Determine risk category based on the nearest distance.
      let newRiskCategory = 'Safe';
      if (nearestDistance < riskThreshold * 0.5) { // e.g., less than 0.5 km is High risk
        newRiskCategory = 'High';
      } else if (nearestDistance < riskThreshold) { // between 0.5 km and 1 km is Moderate risk
        newRiskCategory = 'Moderate';
      }
      setRiskCategory(newRiskCategory);

      // If risk is High or Moderate, perform reverse geocoding.
      if (newRiskCategory !== 'Safe' && window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        // Reverse geocode the user's location.
        geocoder.geocode(
          { location: { lat: userLocation.latitude, lng: userLocation.longitude } },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              setUserAddress(results[0].formatted_address);
            } else {
              console.error('User reverse geocoding failed:', status);
            }
          }
        );
        // Reverse geocode the nearest fire hotspot.
        if (nearestFire) {
          geocoder.geocode(
            {
              location: {
                lat: parseFloat(nearestFire.latitude),
                lng: parseFloat(nearestFire.longitude),
              },
            },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                setFireAddress(results[0].formatted_address);
              } else {
                console.error('Fire hotspot reverse geocoding failed:', status);
              }
            }
          );
        }
      }
    }
  }, [userLocation, fireData]);

  // 4. Determine the nearest safe place from the safePlaces array.
  useEffect(() => {
    if (userLocation) {
      let nearestSafe = null;
      let minSafeDistance = Infinity;
      safePlaces.forEach((place) => {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.latitude,
          place.longitude
        );
        if (distance < minSafeDistance) {
          minSafeDistance = distance;
          nearestSafe = place;
        }
      });
      setSuggestedSafePlace(nearestSafe);
    }
  }, [userLocation]);

  // 5. (Optional) Always reverse geocode the user's location.
  useEffect(() => {
    if (userLocation && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: userLocation.latitude, lng: userLocation.longitude } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            setUserAddress(results[0].formatted_address);
          } else {
            console.error('User reverse geocoding failed:', status);
          }
        }
      );
    }
  }, [userLocation]);

  if (loading) return <p>Loading fire data...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>FireShield AI - Fire Risk Heatmap</h1>
      <EmergencyButton status={riskCategory} />
      {userLocation ? (
        <p>
          Your Location:{' '}
          {userAddress ||
            `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
        </p>
      ) : (
        <p>Obtaining your location...</p>
      )}
      {riskCategory === 'High' && (
        <div style={{ backgroundColor: '#b71c1c', color: 'white', padding: '10px', marginBottom: '10px' }}>
          <strong>High Risk:</strong> You are extremely close to an active fire zone{' '}
          {fireAddress && `(${fireAddress})`}. Please move immediately to a safer location.
          {suggestedSafePlace && (
            <span>
              {' '}
              Suggested safe zone: {suggestedSafePlace.name} (at {suggestedSafePlace.latitude},{' '}
              {suggestedSafePlace.longitude}).
            </span>
          )}
        </div>
      )}
      {riskCategory === 'Moderate' && (
        <div style={{ backgroundColor: '#f57c00', color: 'white', padding: '10px', marginBottom: '10px' }}>
          <strong>Moderate Risk:</strong> You are relatively close to a fire zone{' '}
          {fireAddress && `(${fireAddress})`}. Please be cautious and consider moving to a safer area.
          {suggestedSafePlace && (
            <span>
              {' '}
              Suggested safe zone: {suggestedSafePlace.name} (at {suggestedSafePlace.latitude},{' '}
              {suggestedSafePlace.longitude}).
            </span>
          )}
        </div>
      )}
      {riskCategory === 'Safe' && (
        <div style={{ backgroundColor: '#388e3c', color: 'white', padding: '10px', marginBottom: '10px' }}>
          <strong>Safe:</strong> You are at a safe distance from active fire zones.
        </div>
      )}
      <LoadScript
        googleMapsApiKey="AIzaSyD7yhyKbAtYlE_1GLPyYKG4FkvqbiTKlPY"  // Replace with your actual API key.
        libraries={libraries}
      >
        <FireHeatmap fireData={fireData} userLocation={userLocation} safePlaces={safePlaces} />
      </LoadScript>
    </div>
  );
}

export default App;
