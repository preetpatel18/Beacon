const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const router = express.Router();

function parseDateTime(acq_date, acq_time) {
  let timeStr = acq_time.toString().padStart(4, '0');
  const hour = timeStr.slice(0, 2);
  const minute = timeStr.slice(2, 4);
  const dateTimeStr = `${acq_date} ${hour}:${minute}`;
  return new Date(dateTimeStr);
}

router.get('/', (req, res) => {
  const results = [];
  fs.createReadStream('data/nasa_firms.csv')
    .pipe(csv())
    .on('data', (data) => {
      const acq_datetime = parseDateTime(data.acq_date, data.acq_time);
      const lat = parseFloat(data.latitude);
      const lon = parseFloat(data.longitude);
      if (lon >= -150 && lon <= -49 && lat >= 40 && lat <= 79) {
        results.push({
          ...data,
          acq_datetime: acq_datetime,
          latitude: lat,
          longitude: lon,
          brightness: parseFloat(data.brightness) || 0,
        });
      }
    })
    .on('end', () => {

      res.json({ data: results });
    })
    .on('error', (err) => {
      console.error("Error processing CSV:", err);
      res.status(500).json({ error: "Error processing CSV", details: err });
    });
});

module.exports = router;
