const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const nasaFirmsRoutes = require('./routes/nasaFirms');
app.use('/api/nasa-firms', nasaFirmsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
