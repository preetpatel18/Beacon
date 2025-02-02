import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const getHealthStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error("Error fetching health status:", error);
    throw error;
  }
};
