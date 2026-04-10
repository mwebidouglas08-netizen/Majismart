const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('query', { text: text.substring(0,60), duration, rows: res.rowCount });
  }
  return res;
}

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'operator' CHECK (role IN ('admin','county_officer','operator','community')),
      county VARCHAR(100),
      phone VARCHAR(20),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS nodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      location VARCHAR(200) NOT NULL,
      county VARCHAR(100) NOT NULL,
      latitude DECIMAL(10,7),
      longitude DECIMAL(10,7),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','warning','offline','maintenance')),
      type VARCHAR(30) DEFAULT 'borehole' CHECK (type IN ('borehole','tank','kiosk','river_intake')),
      capacity_litres INTEGER DEFAULT 10000,
      installed_at TIMESTAMPTZ DEFAULT NOW(),
      last_reading TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sensor_readings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      water_level INTEGER CHECK (water_level BETWEEN 0 AND 100),
      flow_rate DECIMAL(8,2),
      turbidity DECIMAL(6,2),
      temperature DECIMAL(5,1),
      ph DECIMAL(4,2),
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      node_id UUID NOT NULL REFERENCES nodes(id),
      phone VARCHAR(20) NOT NULL,
      amount_ksh DECIMAL(10,2) NOT NULL,
      litres INTEGER NOT NULL,
      mpesa_code VARCHAR(50),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info','warning','critical')),
      resolved BOOLEAN DEFAULT FALSE,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      node_id UUID NOT NULL REFERENCES nodes(id),
      user_id UUID REFERENCES users(id),
      description TEXT NOT NULL,
      type VARCHAR(50),
      cost_ksh DECIMAL(10,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_sensor_node ON sensor_readings(node_id);
    CREATE INDEX IF NOT EXISTS idx_sensor_time ON sensor_readings(recorded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_payments_node ON payments(node_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_node ON alerts(node_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
  `);

  // Seed demo data if empty
  const { rows } = await pool.query('SELECT COUNT(*) FROM nodes');
  if (parseInt(rows[0].count) === 0) {
    await seedDemo();
  }
  console.log('✅ Database schema ready');
}

async function seedDemo() {
  // Demo admin user
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(`
    INSERT INTO users (name, email, password, role, county) VALUES
    ('Admin User', 'admin@majismart.ke', $1, 'admin', 'Nairobi'),
    ('Jane Wanjiku', 'county@majismart.ke', $1, 'county_officer', 'Kiambu'),
    ('John Kamau', 'operator@majismart.ke', $1, 'operator', 'Machakos')
    ON CONFLICT DO NOTHING
  `, [hash]);

  // Demo nodes
  await pool.query(`
    INSERT INTO nodes (name, location, county, latitude, longitude, status, type, capacity_litres) VALUES
    ('Kiambu Borehole 1','Thika Road, Kiambu','Kiambu',-1.0332,36.8279,'active','borehole',15000),
    ('Machakos Tank A','Machakos Town Centre','Machakos',-1.5177,37.2634,'active','tank',10000),
    ('Kibera Water Kiosk','Olympic Estate, Kibera','Nairobi',-1.3133,36.7887,'warning','kiosk',5000),
    ('Nakuru Borehole 3','Nakuru Industrial Area','Nakuru',-0.3031,36.0800,'active','borehole',20000),
    ('Mombasa Tank B','Kisauni, Mombasa','Mombasa',-3.9930,39.7193,'active','tank',8000),
    ('Kisumu Intake','Winam Gulf, Kisumu','Kisumu',-0.1022,34.7617,'offline','river_intake',25000)
    ON CONFLICT DO NOTHING
  `);

  // Seed historical sensor data (last 48 hours)
  const { rows: nodes } = await pool.query('SELECT id FROM nodes');
  for (const node of nodes) {
    for (let i = 48; i >= 0; i--) {
      const t = new Date(Date.now() - i * 60 * 60 * 1000);
      await pool.query(`
        INSERT INTO sensor_readings (node_id, water_level, flow_rate, turbidity, temperature, recorded_at)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          node.id,
          Math.floor(30 + Math.random() * 70),
          parseFloat((1 + Math.random() * 10).toFixed(2)),
          parseFloat((0.3 + Math.random() * 4).toFixed(2)),
          parseFloat((17 + Math.random() * 12).toFixed(1)),
          t
        ]
      );
    }
  }

  // Seed some payments
  const nodeIds = nodes.map(n => n.id);
  const phones = ['0712345678','0723456789','0734567890','0745678901','0756789012'];
  for (let i = 0; i < 30; i++) {
    const litres = [20,40,60,100][Math.floor(Math.random()*4)];
    await pool.query(`
      INSERT INTO payments (node_id, phone, amount_ksh, litres, mpesa_code, status, created_at)
      VALUES ($1,$2,$3,$4,$5,'completed', NOW() - ($6 * interval '1 hour'))`,
      [
        nodeIds[Math.floor(Math.random()*nodeIds.length)],
        phones[Math.floor(Math.random()*phones.length)],
        (litres * 0.1).toFixed(2),
        litres,
        'QK' + Math.random().toString(36).substr(2,8).toUpperCase(),
        Math.floor(Math.random() * 72)
      ]
    );
  }

  // Seed alerts
  const alertTypes = [
    {type:'low_water', msg:'Tank level below 20%', sev:'critical'},
    {type:'high_turbidity', msg:'Turbidity exceeds WHO limit', sev:'warning'},
    {type:'pump_failure', msg:'Flow rate dropped to zero', sev:'critical'},
    {type:'maintenance_due', msg:'Scheduled maintenance overdue', sev:'info'}
  ];
  for (let i = 0; i < 8; i++) {
    const a = alertTypes[Math.floor(Math.random()*alertTypes.length)];
    await pool.query(`
      INSERT INTO alerts (node_id, type, message, severity, resolved, created_at)
      VALUES ($1,$2,$3,$4,$5, NOW() - ($6 * interval '1 hour'))`,
      [
        nodeIds[Math.floor(Math.random()*nodeIds.length)],
        a.type, a.msg, a.sev,
        Math.random() > 0.5,
        Math.floor(Math.random() * 48)
      ]
    );
  }

  console.log('✅ Demo data seeded');
}

module.exports = { query, initSchema, pool };
