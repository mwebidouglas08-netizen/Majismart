require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Database ──────────────────────────────────────────────────────────────────
const db = require('./db');

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/nodes',     require('./routes/nodes'));
app.use('/api/sensors',   require('./routes/sensors'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users',     require('./routes/users'));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', time: new Date().toISOString() });
});

// ─── Serve frontend in production ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// ─── Cron: simulate sensor readings every 2 minutes (demo) ────────────────────
cron.schedule('*/2 * * * *', async () => {
  try {
    const { rows: nodes } = await db.query(`SELECT id FROM nodes WHERE status='active'`);
    for (const node of nodes) {
      const level = Math.floor(50 + Math.random() * 50);
      const flow  = parseFloat((2 + Math.random() * 8).toFixed(2));
      const turb  = parseFloat((0.5 + Math.random() * 3).toFixed(2));
      const temp  = parseFloat((18 + Math.random() * 10).toFixed(1));
      await db.query(
        `INSERT INTO sensor_readings (node_id, water_level, flow_rate, turbidity, temperature)
         VALUES ($1,$2,$3,$4,$5)`,
        [node.id, level, flow, turb, temp]
      );
      // trigger alert if low
      if (level < 20) {
        await db.query(
          `INSERT INTO alerts (node_id, type, message, severity)
           VALUES ($1,'low_water','Tank level critically low: '||$2||'%','critical')
           ON CONFLICT DO NOTHING`,
          [node.id, level]
        );
        await db.query(`UPDATE nodes SET status='warning' WHERE id=$1`, [node.id]);
      }
    }
  } catch (err) {
    // silent in production
  }
});

// ─── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
db.initSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ MajiSmart API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

module.exports = app;
