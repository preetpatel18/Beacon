const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount your NASA FIRMS route.
const nasaFirmsRoutes = require('./routes/nasaFirms');
app.use('/api/nasa-firms', nasaFirmsRoutes);

// Mount the emergency alert route.
const emergencyAlertRoutes = require('./routes/emergencyAlert');
app.use('/api/emergency-alert', emergencyAlertRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
