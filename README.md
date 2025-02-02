# BEACON

**Group 2 - HackRU Spring - 2025**

## Team Members
- Nithik Pandya
- Krisha Jhala
- Preet Patel
- Azra Bano

## Overview
Beacon is an advanced wildfire detection and monitoring system that integrates NASA's FIRMS (Fire Information for Resource Management System) with AI-driven analytics. It provides real-time fire data visualization and predictive insights to assist in wildfire management.

## 🚀 The Problem
Wildfires in Los Angeles and other urban areas present unique hazards as buildings, cars, and products are incinerated, exposing people to particulate matter, gases, chemicals, heavy metals, asbestos, PFAS, microplastics, and other toxic pollutants. They settle out of the air into soil and dust and can become resuspended during recovery and rebuilding efforts. Water quality can also be affected. The wildfires that began in early January 2025 killed 29 people, destroyed more than 16,000 structures, and exposed millions to toxic smoke.

According to a recent IEEE study on wildfire visualization systems for research and training, wildfires have become more unpredictable, intense, and devastating due to climate change. Key findings from the study highlight:
Global wildfires have increased in frequency and severity, with events like Australia’s Black Summer Fires (2019-2020) burning 21% of the country’s forest land—a tenfold increase from previous years.
Unprecedented wildfire behaviors (e.g., fire tornadoes, pyrocumulonimbus clouds) make traditional prediction models ineffective.
Firefighters lack updated training to handle the erratic behavior of modern wildfires, relying on outdated drills and slide-based training rather than real-time AI-powered risk assessment tools.
Mega wildfires (fires burning over 45,000 hectares) are becoming more common, leading to widespread destruction and health crises due to hazardous smoke inhalation.
Existing wildfire visualization systems lack interactivity and real-time adaptability, making it difficult for both emergency responders and the public to predict fire spread and plan safe evacuation routes.

## 🚀 Our Solution: 
Beacon To tackle these critical gaps, Beacon provides real-time wildfire detection and evacuation planning tool. Unlike traditional fire tracking systems, our platform offers:

✅ Live Fire Data from NASA FIRMS API – Real-time detection of active wildfires.

✅ Dynamic AI-Generated Evacuation Routes – Automatically reroutes users based on real-time Google Maps and Waze data for safer escape planning.

✅ Air Quality & Smoke Impact Monitoring – Using AirNow API, we provide real-time AQI updates and predict smoke travel patterns.

✅ AI-Driven Fire Spread Predictions – Integrating NOAA weather data to analyze how wind, humidity, and temperature affect wildfire movement.

✅ Emergency Alerts & First Responder Assistance – Notifies affected users and fire departments through Twilio SMS and LoRaWAN for offline areas.

🔥 Why This Matters 📍 Better Emergency Preparedness: Traditional systems fail to predict wildfire spread dynamically, leading to ineffective responses. Wildfire Guardian adapts in real-time, ensuring safer, more informed decision-making.

🚗 Smarter Evacuations: Unlike static fire maps, our AI-driven routing system adjusts instantly based on changing wildfire conditions and road closures.

🌫 Public Health Protection: By monitoring and visualizing air quality trends, we help residents understand when it’s safe to go outside and when to evacuate.

🌎 The Future of Wildfire Safety Starts Here Beacon bridges the gap between advanced AI fire detection, evacuation planning, and real-time emergency response. By combining cutting-edge data visualization and predictive modeling, we empower communities to stay ahead of disasters.

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

