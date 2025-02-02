const express = require('express');
const router = express.Router();

// Placeholder for air quality routes
router.get('/', (req, res) => {
  res.json({ message: 'Air quality endpoint' });
});

module.exports = router;
