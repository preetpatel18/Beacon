const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log("Fire data endpoint hit"); 
  res.json({
    message: 'Fire data endpoint - sample data',
    data: [
      { id: 1, location: 'California', intensity: 10 },
      { id: 2, location: 'Oregon', intensity: 8 }
    ]
  });
});

module.exports = router;
