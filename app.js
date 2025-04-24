const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;
const MAX_CLIENTS = 2; // Batasi jumlah klien SSE

// Middleware
app.use(express.json());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), { cacheControl: false }));

// Simpan klien SSE
const clients = [];

// Data awal
let latestData = { temperature: '--', humidity: '--' };

// Fungsi untuk menghasilkan data acak
function generateRandomData() {
  const temperature = (Math.random() * (34.9 - 20.0) + 20.0).toFixed(1); // 20.0–34.9 °C
  const humidity = (Math.random() * (89.9 - 40.0) + 40.0).toFixed(1); // 40.0–89.9 %
  return { temperature, humidity };
}

// Update data setiap 3 detik
setInterval(() => {
  latestData = generateRandomData();
  console.log('Data acak diperbarui:', latestData);
  if (clients.length > 0) {
    clients.forEach(client => {
      console.log(`Mengirim SSE ke klien ${client.id}:`, latestData);
      client.response.write(`data: ${JSON.stringify(latestData)}\n\n`);
    });
  } else {
    console.log('Tidak ada klien SSE yang terhubung');
  }
}, 3000);

// Endpoint untuk menerima data (kompatibel dengan ESP32)
app.post('/data', (req, res) => {
  const { temperature, humidity } = req.body;
  console.log('Menerima POST request:', req.body);
  if (temperature != null && humidity != null) {
    latestData = { temperature: String(temperature), humidity: String(humidity) };
    console.log('Data diperbarui dari POST:', latestData);
    if (clients.length > 0) {
      clients.forEach(client => {
        console.log(`Mengirim SSE ke klien ${client.id}:`, latestData);
        client.response.write(`data: ${JSON.stringify(latestData)}\n\n`);
      });
    }
    res.status(200).json({ message: 'Data diterima' });
  } else {
    console.log('Data tidak valid:', req.body);
    res.status(400).json({ message: 'Data tidak valid' });
  }
});

// Endpoint untuk SSE
app.get('/events', (req, res) => {
  if (clients.length >= MAX_CLIENTS) {
    console.log('Terlalu banyak klien SSE, menolak koneksi baru');
    res.status(503).send('Terlalu banyak koneksi');
    return;
  }
  console.log('Klien SSE terhubung dari:', req.ip);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, response: res };
  clients.push(newClient);

  res.write(`data: ${JSON.stringify(latestData)}\n\n`);

  req.on('close', () => {
    console.log(`Klien SSE ${clientId} terputus`);
    clients.splice(clients.indexOf(newClient), 1);
  });
});

// Endpoint debug
app.get('/debug', (req, res) => {
  res.json({ clientCount: clients.length, latestData });
});

// Log jumlah klien setiap menit
setInterval(() => {
  console.log(`Jumlah klien SSE aktif: ${clients.length}`);
}, 60000);

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});