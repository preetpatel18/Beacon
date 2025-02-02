const express = require('express');
const router = express.Router();

// Sample endpoint to simulate fetching fire data (e.g., from NASA FIRMS)
router.get('/', (req, res) => {
  console.log("Fire data endpoint hit"); // Optional: add a log to verify the request
  res.json({
    message: 'Fire data endpoint - sample data',
    data: [
      { id: 1, location: 'California', intensity: 10 },
      { id: 2, location: 'Oregon', intensity: 8 }
    ]
  });
});

module.exports = router;
