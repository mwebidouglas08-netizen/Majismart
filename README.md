# 💧 MajiSmart — Kenya Water Intelligence Network

A full-stack IoT water monitoring and M-Pesa payment system solving Kenya's last-mile water access challenge.

## 🚀 Live Demo
- **URL**: Deploy to Railway (instructions below)
- **Demo login**: `admin@majismart.ke` / `admin123`
- **County officer**: `county@majismart.ke` / `admin123`
- **Operator**: `operator@majismart.ke` / `admin123`

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Recharts, Vite |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Payments | M-Pesa Daraja API |
| SMS | Africa's Talking |
| Hosting | Railway.app |
| IoT | GSM/2G REST endpoints |

## 📁 Project Structure

```
majismart/
├── backend/
│   ├── server.js          # Main Express server
│   ├── db.js              # PostgreSQL + schema + seed data
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   └── routes/
│       ├── auth.js        # Login, register, me
│       ├── nodes.js       # CRUD for water nodes
│       ├── sensors.js     # IoT sensor readings
│       ├── payments.js    # M-Pesa transactions
│       ├── alerts.js      # System alerts
│       ├── users.js       # User management
│       └── dashboard.js   # Analytics & summary
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Nodes.jsx
│   │   │   ├── NodeDetail.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── api/
│   │       └── index.js
│   └── package.json
├── railway.json
├── nixpacks.toml
└── package.json
```

## 🚀 Deploy to Railway

### Step 1 — Push to GitHub
```bash
cd majismart
git init
git add .
git commit -m "Initial commit — MajiSmart water intelligence"
git remote add origin https://github.com/YOUR_USERNAME/majismart.git
git push -u origin main
```

### Step 2 — Create Railway Project
1. Go to [railway.app](https://railway.app) and log in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `majismart` repository

### Step 3 — Add PostgreSQL
1. In Railway dashboard → **New** → **Database** → **PostgreSQL**
2. Railway auto-injects `DATABASE_URL` into your app ✅

### Step 4 — Set Environment Variables
In Railway → your service → **Variables**, add:
```
NODE_ENV=production
JWT_SECRET=your_strong_random_secret_here_min_32_chars
PORT=5000

# Optional — M-Pesa (get from Safaricom Developer Portal)
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-app.railway.app/api/payments/mpesa-callback

# Optional — Africa's Talking SMS
AT_API_KEY=your_api_key
AT_USERNAME=sandbox
```

### Step 5 — Deploy
Railway will automatically:
1. Install dependencies for backend & frontend
2. Build the React frontend with Vite
3. Start the Express server which serves the built frontend
4. Initialize the PostgreSQL schema and seed demo data

Your app will be live at `https://your-app.railway.app` 🎉

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → JWT token |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Current user |
| GET | `/api/nodes` | List all nodes |
| POST | `/api/nodes` | Create node |
| GET | `/api/nodes/:id` | Node details |
| PATCH | `/api/nodes/:id` | Update node |
| GET | `/api/sensors/:id/latest` | Latest reading |
| GET | `/api/sensors/:id/history?hours=24` | Historical data |
| POST | `/api/sensors/:id/reading` | Post IoT reading |
| GET | `/api/payments` | List payments |
| POST | `/api/payments/initiate` | Initiate M-Pesa STK push |
| POST | `/api/payments/mpesa-callback` | Daraja webhook |
| GET | `/api/alerts` | List alerts |
| PATCH | `/api/alerts/:id/resolve` | Resolve alert |
| GET | `/api/dashboard/summary` | Dashboard stats |
| GET | `/api/dashboard/revenue-chart` | Revenue chart data |
| GET | `/api/dashboard/county-stats` | Per-county stats |
| GET | `/api/health` | Health check |

## 🔧 IoT Sensor Integration

Post sensor readings from any device (Raspberry Pi, Arduino+GSM) to:
```
POST /api/sensors/{node_id}/reading
Content-Type: application/json

{
  "water_level": 75,
  "flow_rate": 5.2,
  "turbidity": 1.3,
  "temperature": 22.5,
  "ph": 7.1
}
```

## 💳 M-Pesa Payment Flow

1. User dials USSD / operator clicks "Initiate Payment"
2. `POST /api/payments/initiate` creates pending payment
3. Daraja API sends STK push to user's phone
4. User confirms on phone
5. Daraja posts to `/api/payments/mpesa-callback`
6. Payment marked complete, solenoid valve opens

## 📊 Features

- ✅ Real-time water level monitoring (all nodes)
- ✅ Historical sensor charts (24h/48h)
- ✅ M-Pesa payment collection with USSD
- ✅ Automated SMS alerts (low water, pump failure, quality)
- ✅ County-level analytics dashboard
- ✅ Role-based access (admin, county officer, operator)
- ✅ Node management (add, edit, status)
- ✅ Alert management (create, resolve)
- ✅ Auto-seeded demo data
- ✅ Cron job: simulates live sensor data every 2 minutes
- ✅ Fully responsive design

## 📄 License
MIT — Built for Kenya's water access challenge.
