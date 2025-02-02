import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadScript } from '@react-google-maps/api';
import FireHeatmap from './components/FireHeatmap';

const libraries = ['visualization'];

const emergencyNumbers = ['7326199750'];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; 
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

function computeDestinationPoint(lat, lon, bearing, distance) {
  const R = 6371; 
  const toRad = (value) => (value * Math.PI) / 180;
  const toDeg = (value) => (value * 180) / Math.PI;
  const φ1 = toRad(lat);
  const λ1 = toRad(lon);
  const δ = distance / R; 

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
  const [autoLocation, setAutoLocation] = useState(null);
  const [manualLocation, setManualLocation] = useState(null);
  const effectiveUserLocation = manualLocation || autoLocation;
  
  const [fireData, setFireData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskCategory, setRiskCategory] = useState('Safe');
  const [userAddress, setUserAddress] = useState('');
  const [fireAddress, setFireAddress] = useState('');
  const [suggestedSafeLocation, setSuggestedSafeLocation] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState('');
  
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  
  const highThreshold = 3;   
  const moderateThreshold = 5; 
  const safeOffsetDistance = 3;
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setAutoLocation(loc);
        
          setCustomLat(loc.latitude.toString());
          setCustomLng(loc.longitude.toString());
        },
        (error) => {
          console.error('Error obtaining geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);
  

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
    const intervalId = setInterval(fetchFireData, 300000); 
    return () => clearInterval(intervalId);
  }, []);
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
  
      if (newRiskCategory !== 'High') {
        setEmergencyAlert('');
      }
  
      if (newRiskCategory !== 'Safe' && window.google && window.google.maps && nearestFire) {
        const geocoder = new window.google.maps.Geocoder();

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

        const toRad = (value) => (value * Math.PI) / 180;
        const φ1 = toRad(parseFloat(nearestFire.latitude));
        const λ1 = toRad(parseFloat(nearestFire.longitude));
        const φ2 = toRad(effectiveUserLocation.latitude);
        const λ2 = toRad(effectiveUserLocation.longitude);
        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x =
          Math.cos(φ1) * Math.sin(φ2) -
          Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const bearing = Math.atan2(y, x); 
  
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
  

  const handleMapClick = (coords) => {
   
    setManualLocation(coords);
    setCustomLat(coords.latitude.toString());
    setCustomLng(coords.longitude.toString());
  };
  
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
  
  
  const handleEmergencyAlert = () => {
    const number = emergencyNumbers[0]; 
    const currentLocation =
      userAddress ||
      (effectiveUserLocation
        ? `${effectiveUserLocation.latitude.toFixed(4)}, ${effectiveUserLocation.longitude.toFixed(4)}`
        : 'unknown');
    const message = `Emergency alert: I am in danger at ${currentLocation}. Please send help immediately to responder ${number}.`;
 
    window.location.href = `tel:${number}`;
   
    setEmergencyAlert(`Attempting to call responder ${number} with message: "${message}"`);
    setTimeout(() => {
      setEmergencyAlert('');
    }, 5000);
  };
  
  if (loading) return <p>Loading fire data...</p>;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Beacon</h1>
      {effectiveUserLocation ? (
        <p>
          Your Location:{' '}
          {userAddress ||
            `${effectiveUserLocation.latitude.toFixed(4)}, ${effectiveUserLocation.longitude.toFixed(4)}`}
        </p>
      ) : (
        <p>Obtaining your location...</p>
      )}

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
            Manual location set to: ({manualLocation.latitude.toFixed(4)},{' '}
            {manualLocation.longitude.toFixed(4)})
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
          onMapClick={handleMapClick}
        />
      </LoadScript>
    </div>
  );
}

export default App;
