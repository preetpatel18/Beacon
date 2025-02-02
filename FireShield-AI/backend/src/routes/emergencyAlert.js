// backend/src/routes/emergencyAlert.js
const express = require('express');
const router = express.Router();
const twilio = require('twilio');

// Directly assign Twilio credentials (for testing only; not recommended for production)
                         // Your Twilio phone number

// Initialize the Twilio client.
const client = twilio(accountSid, authToken);

// POST /api/emergency-alert
// Expects a JSON body: { message: "Your emergency message here" }
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }
  
  // For demonstration, send to a fixed number (you can modify or randomize as needed)
  const toNumber = '7326199750';
  
  try {
    const sms = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });
    res.json({ success: true, sid: sms.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
