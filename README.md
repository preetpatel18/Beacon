# BEACON

**Group 2 - HackRU Spring - 2025**

## Team Members
- Nithik Pandya
- Krisha Jhala
- Preet Patel
- Azra Bano

## Overview
Beacon is an advanced wildfire detection and monitoring system that integrates NASA's FIRMS (Fire Information for Resource Management System) with AI-driven analytics. It provides real-time fire data visualization and predictive insights to assist in wildfire management.

## 🚀 Features
Real-time Wildfire Tracking: Uses FIRMS data to display active fire locations.
AI-Powered Analysis: Predicts fire spread and risk zones.
Interactive Map Interface: A fully functional map with intuitive UI.
Alerts & Notifications: Customizable alerts for fire-prone regions.
Responsive Design: Works seamlessly across devices.

## 🛠️ Technologies Used

Frontend: React (for map rendering)
Backend: Node.js (Python)
Data Sources: NASA FIRMS API, Google Maps API

## Getting Started
To get started with the project, ensure you have Node.js installed, and then run the following commands to install the required libraries:

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
npm install

# Configure environment variables
# Create a .env file in the server/ directory and set up database credentials & API keys.

# Start the backend (Different Terminal)
cd ../<your Directory>/backend
uvicorn main:app --reload

# Start the frontend (Different Terminal)
cd ../<your Directory>/frontend
npm start
```

