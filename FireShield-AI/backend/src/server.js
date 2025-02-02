const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

const nasaFirmsRoutes = require('./routes/nasaFirms');
app.use('/api/nasa-firms', nasaFirmsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
