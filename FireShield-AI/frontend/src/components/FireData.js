import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FireData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("FireData component mounted: Fetching fire data...");
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fire');
        console.log("Fire data received:", response.data);
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching fire data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading fire data...</p>;
  if (error) return <p>Error loading fire data: {error.message}</p>;

  return (
    <div>
      <h2>Fire Data</h2>
      <ul>
        {data.map((fire) => (
          <li key={fire.id}>
            <strong>Location:</strong> {fire.location} | <strong>Intensity:</strong> {fire.intensity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FireData;
