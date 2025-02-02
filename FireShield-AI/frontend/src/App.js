import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadScript } from '@react-google-maps/api';
import FireHeatmap from './components/FireHeatmap';

// Define the libraries array as a static constant.
const libraries = ['visualization'];

// For now, only one emergency number is used.
const emergencyNumbers = ['7326199750'];

// Haversine formula: calculates the great-circle distance (in km) between two latitude/longitude points.
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

// Helper function: Compute destination point given start point, bearing (in radians), and distance (km).
function computeDestinationPoint(lat, lon, bearing, distance) {
  const R = 6371; // Earth's radius in km
  const toRad = (value) => (value * Math.PI) / 180;
  const toDeg = (value) => (value * 180) / Math.PI;
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);
  const δ = distance / R; // angular distance in radians

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
      Math.cos(φ1) * Math.sin(δ) * Math.cos(bearing)
  );
  const λ2 = λ1 + Math.atan2(
    Math.sin(bearing) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  );

  return {
    latitude: toDeg(φ2),
    longitude: toDeg(λ2),
  };
}

function App() {
  // Automatically detected location.
  const [autoLocation, setAutoLocation] = useState(null);
  // User-entered manual location.
  const [manualLocation, setManualLocation] = useState(null);
  // Effective location: if a manual location is provided, use it; otherwise, use autoLocation.
  const effectiveUserLocation = manualLocation || autoLocation;
  
  const [fireData, setFireData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskCategory, setRiskCategory] = useState('Safe'); // "High", "Moderate", or "Safe"
  const [userAddress, setUserAddress] = useState('');
  const [fireAddress, setFireAddress] = useState('');
  const [suggestedSafeLocation, setSuggestedSafeLocation] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState('');
  
  // Local state for custom (manual) location inputs.
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  
  // Define risk thresholds (in km)
  const highThreshold = 3;     // High risk if within 3 km.
  const moderateThreshold = 5; // Moderate risk if between 3 and 5 km.
  const safeOffsetDistance = 3; // Fallback safe offset if needed.
  
  // 1. Automatically obtain the user's location using the Geolocation API.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAutoLocation({
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
      const response = await axios.get('http://localhost:5000/api/nasa-firms');
      setFireData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching NASA FIRMS data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFireData();
    const intervalId = setInterval(fetchFireData, 300000); // Poll every 5 minutes.
    return () => clearInterval(intervalId);
  }, []);
  
  // 3. Risk assessment: determine the nearest fire hotspot and assign a risk category.
  useEffect(() => {
    if (effectiveUserLocation && fireData.length > 0) {
      let nearestDistance = Infinity;
      let nearestFire = null;
      fireData.forEach((fire) => {
        const distance = haversineDistance(
          effectiveUserLocation.latitude,
          effectiveUserLocation.longitude,
          parseFloat(fire.latitude),
          parseFloat(fire.longitude)
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestFire = fire;
        }
      });
  
      let newRiskCategory = 'Safe';
      if (nearestDistance < highThreshold) {
        newRiskCategory = 'High';
      } else if (nearestDistance < moderateThreshold) {
        newRiskCategory = 'Moderate';
      }
      setRiskCategory(newRiskCategory);
  
      // Clear any previous emergency alert if not high risk.
      if (newRiskCategory !== 'High') {
        setEmergencyAlert('');
      }
  
      // If risk is not safe and the Maps API is loaded, perform reverse geocoding and compute a suggested safe location.
      if (newRiskCategory !== 'Safe' && window.google && window.google.maps && nearestFire) {
        const geocoder = new window.google.maps.Geocoder();
        // Reverse geocode the effective user location.
        geocoder.geocode(
          { location: { lat: effectiveUserLocation.latitude, lng: effectiveUserLocation.longitude } },
          (results, status) => {
            if (status === 'OK' && results[0]) {
              setUserAddress(results[0].formatted_address);
            } else {
              console.error('User reverse geocoding failed:', status);
            }
          }
        );
        // Reverse geocode the nearest fire hotspot.
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
  
        // Compute a suggested safe location.
        const toRad = (value) => (value * Math.PI) / 180;
        const φ1 = toRad(parseFloat(nearestFire.latitude));
        const λ1 = toRad(parseFloat(nearestFire.longitude));
        const φ2 = toRad(effectiveUserLocation.latitude);
        const λ2 = toRad(effectiveUserLocation.longitude);
        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x =
          Math.cos(φ1) * Math.sin(φ2) -
          Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const bearing = Math.atan2(y, x); // Bearing from fire to user (radians)
  
        // Compute extra offset: push the user out until they're at least (moderateThreshold + 1) km away.
        const extraOffset = (moderateThreshold + 1) - nearestDistance;
        const safeOffset = extraOffset > 0 ? extraOffset : safeOffsetDistance;
  
        const destination = computeDestinationPoint(
          effectiveUserLocation.latitude,
          effectiveUserLocation.longitude,
          bearing,
          safeOffset
        );
        setSuggestedSafeLocation(destination);
      }
    }
  }, [effectiveUserLocation, fireData]);
  
  // 4. Allow the user to manually set a different location.
  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setManualLocation({ latitude: lat, longitude: lng });
    } else {
      alert('Please enter valid numbers for latitude and longitude.');
    }
  };
  
  // 5. (Optional) Always reverse geocode the auto-detected location if no manual location is provided.
  useEffect(() => {
    if (autoLocation && window.google && window.google.maps && !manualLocation) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: autoLocation.latitude, lng: autoLocation.longitude } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            setUserAddress(results[0].formatted_address);
          } else {
            console.error('Auto-location reverse geocoding failed:', status);
          }
        }
      );
    }
  }, [autoLocation, manualLocation]);
  
  // 6. Emergency Alert: when in high risk, initiate a call using a tel: link.
  const handleEmergencyAlert = () => {
    const number = emergencyNumbers[0]; // Only one emergency number is used.
    const currentLocation =
      userAddress ||
      (effectiveUserLocation
        ? `${effectiveUserLocation.latitude.toFixed(4)}, ${effectiveUserLocation.longitude.toFixed(4)}`
        : 'unknown');
    const message = `Emergency alert: I am in danger at ${currentLocation}. Please send help immediately to responder ${number}.`;
    
    // Initiate the call using a tel: link.
    window.location.href = `tel:${number}`;
    
    // Optionally, display an alert message on screen.
    setEmergencyAlert(`Attempting to call responder ${number} with message: "${message}"`);
    setTimeout(() => {
      setEmergencyAlert('');
    }, 5000);
  };
  
  if (loading) return <p>Loading fire data...</p>;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>FireShield AI - Fire Risk Heatmap</h1>
      {effectiveUserLocation ? (
        <p>
          Your Location:{' '}
          {userAddress ||
            `${effectiveUserLocation.latitude.toFixed(4)}, ${effectiveUserLocation.longitude.toFixed(4)}`}
        </p>
      ) : (
        <p>Obtaining your location...</p>
      )}
  
      {/* Risk Alerts */}
      {riskCategory === 'High' && (
        <div style={{ backgroundColor: '#b71c1c', color: 'white', padding: '10px', marginBottom: '10px' }}>
          <strong>High Risk:</strong> You are extremely close to an active fire zone{' '}
          {fireAddress && `(${fireAddress})`}. Please move immediately to a safer location.
          {suggestedSafeLocation && (
            <span>
              {' '}
              Suggested safe location: ({suggestedSafeLocation.latitude.toFixed(4)}, {suggestedSafeLocation.longitude.toFixed(4)}).
            </span>
          )}
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={handleEmergencyAlert}
              style={{
                backgroundColor: '#d32f2f',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Emergency Alert
            </button>
          </div>
          {emergencyAlert && (
            <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{emergencyAlert}</p>
          )}
        </div>
      )}
      {riskCategory === 'Moderate' && (
        <div style={{ backgroundColor: '#f57c00', color: 'white', padding: '10px', marginBottom: '10px' }}>
          <strong>Moderate Risk:</strong> You are moderately close to an active fire zone{' '}
          {fireAddress && `(${fireAddress})`}. Please be cautious and consider moving to a safer area.
          {suggestedSafeLocation && (
            <span>
              {' '}
              Suggested safe location: ({suggestedSafeLocation.latitude.toFixed(4)}, {suggestedSafeLocation.longitude.toFixed(4)}).
            </span>
          )}
        </div>
      )}
      {riskCategory === 'Safe' && (
        <div style={{ backgroundColor: '#388e3c', color: 'white', padding: '10px', marginBottom: '10px' }}>
          <strong>Safe:</strong> You are at a safe distance from active fire zones.
        </div>
      )}
  
      {/* Manual Location Input Form */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Set a Different Location</h2>
        <form onSubmit={handleManualLocationSubmit}>
          <label>
            Latitude:{' '}
            <input
              type="text"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              placeholder="Enter latitude"
            />
          </label>
          <br />
          <label>
            Longitude:{' '}
            <input
              type="text"
              value={customLng}
              onChange={(e) => setCustomLng(e.target.value)}
              placeholder="Enter longitude"
            />
          </label>
          <br />
          <button type="submit">Set This Location</button>
        </form>
        {manualLocation && (
          <p>
            Manual location set to: ({manualLocation.latitude.toFixed(4)}, {manualLocation.longitude.toFixed(4)})
          </p>
        )}
      </div>
  
      <LoadScript
        googleMapsApiKey="AIzaSyD7yhyKbAtYlE_1GLPyYKG4FkvqbiTKlPY"
        libraries={libraries}
      >
        <FireHeatmap
          fireData={fireData}
          userLocation={effectiveUserLocation}
          suggestedSafeLocation={suggestedSafeLocation}
        />
      </LoadScript>
    </div>
  );
}

export default App;
