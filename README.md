# Kulacino SSE

A Node.js application using Server-Sent Events (SSE) to display random temperature and humidity data on a web page. The app generates random data every 3 seconds and supports a POST endpoint for future ESP32 integration.

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Run the server: `npm start`.
4. Open `http://localhost:3000` in a browser.

## Endpoints

- `GET /`: Serves the web page (`index.html`).
- `POST /data`: Accepts temperature and humidity data (for ESP32).
- `GET /events`: SSE endpoint for real-time data updates.
- `GET /debug`: Returns current client count and latest data.

## Deployment

Deployed on Render with the free tier. Update the ESP32 `serverUrl` to the Render URL (e.g., `https://kulacino-sse.onrender.com/data`) when integrating hardware.