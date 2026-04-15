const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// SSE clients: clientId -> response
const clients = new Map();

// Veri dosyasini olustur (yoksa)
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ catalog: null, projects: [] }, null, 2));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch(e) {
    return { catalog: null, projects: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Diger cihazlara bildirim gonder (kendisi haric)
function broadcast(event, data, excludeClientId) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res, id) => {
    if (id !== excludeClientId) {
      try { res.write(msg); } catch(e) { clients.delete(id); }
    }
  });
}

// ============ SSE (Gercek zamanli senkronizasyon) ============
app.get('/api/events', (req, res) => {
  const clientId = req.query.clientId || Math.random().toString(36).slice(2);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // 30 saniyede bir heartbeat (baglantinin kopmamasini saglar)
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch(e) { clearInterval(heartbeat); }
  }, 30000);

  clients.set(clientId, res);
  console.log(`Cihaz baglandi: ${clientId} (toplam: ${clients.size})`);

  req.on('close', () => {
    clients.delete(clientId);
    clearInterval(heartbeat);
    console.log(`Cihaz ayrildi: ${clientId} (toplam: ${clients.size})`);
  });
});

// ============ Katalog (Fiyat Listesi) API ============
app.get('/api/catalog', (req, res) => {
  const data = readData();
  res.json(data.catalog);
});

app.post('/api/catalog', (req, res) => {
  const data = readData();
  data.catalog = req.body;
  writeData(data);
  broadcast('catalog', data.catalog, req.headers['x-client-id']);
  console.log('Fiyat listesi guncellendi');
  res.json({ ok: true });
});

// ============ Projeler API ============
app.get('/api/projects', (req, res) => {
  const data = readData();
  res.json(data.projects || []);
});

app.post('/api/projects', (req, res) => {
  const data = readData();
  data.projects = req.body;
  writeData(data);
  broadcast('projects', data.projects, req.headers['x-client-id']);
  console.log('Projeler guncellendi');
  res.json({ ok: true });
});

// ============ Sunucuyu Baslat ============
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================');
  console.log('  CAM-O Sunucu Calisiyor!');
  console.log('========================================');
  console.log(`\nBu bilgisayardan: http://localhost:${PORT}`);

  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`Agdaki diger cihazlardan: http://${net.address}:${PORT}`);
      }
    }
  }

  console.log('\nNot: Diger cihazlar bu bilgisayarla ayni Wi-Fi\'ye bagli olmali.');
  console.log('Durdurmak icin: Ctrl+C');
  console.log('========================================\n');
});
