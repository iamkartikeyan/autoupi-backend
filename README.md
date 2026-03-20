# 🚀 AutoUPI – Cross-Border Settlement Layer

> Send money internationally in **8 seconds** with 0.5% fees. Powered by UPI + Blockchain.

[![Deploy Frontend](https://vercel.com/button)](https://vercel.com/new)
[![Deploy Backend](https://railway.app/button.svg)](https://railway.app)

---

## 📋 Project Structure

```
autoupi/
├── frontend/        → Next.js 14 + Tailwind + Framer Motion (Deploy on Vercel)
└── backend/         → Express.js + TypeScript + Socket.io (Deploy on Railway)
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion, Socket.io Client |
| Backend | Node.js, Express, TypeScript, Socket.io |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + Phone OTP |
| Realtime | WebSocket (Socket.io) |
| Deploy | Vercel (Frontend) + Railway (Backend) |

---

## ⚡ Quick Start (Local Development)

### Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/autoupi.git
cd autoupi

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → Paste contents of `backend/supabase-schema.sql` → Run
3. Go to **Settings → API** → Copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role key` → `SUPABASE_SERVICE_KEY`

### Step 3: Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials

# Frontend
cd ../frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 4: Seed Database

```bash
cd backend
npm run seed
```

### Step 5: Run Both Servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit: http://localhost:3000

---

## 🌐 Production Deployment

### Part 1: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select `autoupi/backend` folder
3. Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_KEY=<your-service-key>
   JWT_SECRET=<random-64-char-string>
   FRONTEND_URL=<your-vercel-url>
   DEMO_MODE=true
   DEMO_MODE_SPEED=normal
   ```
4. Railway auto-deploys. Copy the deployed URL (e.g., `https://autoupi-backend.railway.app`)

### Part 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select `autoupi/frontend` folder
3. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://autoupi-backend.railway.app
   NEXT_PUBLIC_WS_URL=https://autoupi-backend.railway.app
   ```
4. Deploy! Vercel gives you a URL like `https://autoupi.vercel.app`

### Part 3: Update CORS

Go back to Railway → Update `FRONTEND_URL` to your Vercel URL.

---

## 🔑 Demo Credentials

| Role | Phone | Email | Password/OTP |
|------|-------|-------|-------------|
| Demo User | +911234567890 | demo@autoupi.com | 123456 |
| Admin | +919999999999 | admin@autoupi.com | 123456 |

> 💡 **Demo Mode**: When `DEMO_MODE=true`, OTP is always `123456` for any phone number.

---

## 📱 Application Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | Phone OTP authentication |
| Send Money | `/send` | Main transaction form |
| Processing | `/process?id=<txn_id>` | Live WebSocket settlement tracking |
| Success | `/success?id=<txn_id>` | Confetti + transaction receipt |
| Dashboard | `/dashboard` | Transaction history |
| Compare | `/compare` | AutoUPI vs Banks |
| Admin | `/admin` | Full admin panel (admin only) |

---

## 🏗 Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌──────────────┐
│   Next.js       │ HTTP   │   Express API     │  SQL   │  Supabase    │
│   Frontend      │◄──────►│   (Railway)       │◄──────►│  PostgreSQL  │
│   (Vercel)      │        │                  │        │              │
│                 │ WS     │   Socket.io       │        └──────────────┘
│   Processing    │◄──────►│   Real-time logs  │
│   Screen        │        │                  │
└─────────────────┘        └──────────────────┘
```

---

## ⚙️ API Endpoints

```
POST /api/v1/auth/request-otp     → Send OTP
POST /api/v1/auth/verify-otp      → Verify OTP + Login
GET  /api/v1/auth/me              → Get current user

POST /api/v1/transactions/initiate → Start transaction (triggers WebSocket)
GET  /api/v1/transactions/:id     → Get transaction details
GET  /api/v1/transactions/history → User's transaction history
GET  /api/v1/rates                → Current exchange rates

GET  /api/v1/admin/stats          → Dashboard metrics
GET  /api/v1/admin/pools          → Liquidity pool status
GET  /api/v1/admin/transactions   → All transactions
GET  /api/v1/admin/users          → All users
POST /api/v1/admin/pools/rebalance → Rebalance pool
```

---

## 🎬 WebSocket Events

```javascript
// Client emits
socket.emit('join_transaction', transactionId)
socket.emit('join_admin')

// Server emits
socket.on('txn_status', { status })
socket.on('txn_log', { step, status, message, timestamp })
socket.on('txn_complete', { hash, timeTaken })
socket.on('txn_failed', { error })
socket.on('admin_update', { type, transactionId })
```

---

## 🌱 Seed Script

```bash
cd backend
npm run seed

# Creates:
# - 1 admin user (admin@autoupi.com)
# - 5 demo users
# - 5 liquidity pools (INR, AED, USD, EUR, GBP)
# - 60 historical transactions
```

---

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Phone OTP verification (Twilio in production)
- Rate limiting (200 req/15min global, 5 transactions/min)
- Helmet.js security headers
- CORS whitelist
- Input validation with Zod
- SQL injection protection via Supabase parameterized queries
- Row Level Security on Supabase tables

---

## 📊 Demo Mode

Set `DEMO_MODE=true` in backend `.env`:
- OTP is always `123456`
- Settlement animations run at configurable speed
- Pre-seeded demo data available

`DEMO_MODE_SPEED=fast` → 20% of normal speed (for quick demos)
`DEMO_MODE_SPEED=normal` → Realistic 8-second flow

---

## 🏆 Hackathon Tips

1. **Start with demo user** → Fill form → Submit → Watch Processing screen (most impressive!)
2. **Show Admin panel** → Live stats, liquidity pools, transaction feed
3. **Compare page** → Use for judge Q&A about differentiation
4. **Demo mode speed** → Set to `fast` if time-constrained during demo

---

## 👥 Team

Built with ❤️ for the Hackathon

---

## 📄 License

MIT
