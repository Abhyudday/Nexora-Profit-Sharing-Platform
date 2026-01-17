# Nexora - Trade as one

A full-stack crypto investment platform with multi-level marketing features, USDT deposits/withdrawals, and automated profit distribution.

## Features

### Core Features
- User registration (email verification disabled for easy testing)
- USDT deposits and withdrawals (crypto only)
- Multi-level network tree (up to 7 levels)
- Automated profit/loss calculation and distribution
- Network bonus system
- Admin panel for approvals and trading results
- Professional, minimal UI

### ✨ New: Advanced Withdrawal & Rank System
- **Time-Restricted Withdrawals**: 06:01 AM - 12:00 PM GMT+7 daily
- **Minimum Withdrawal**: $10 USD
- **Dynamic Rank System**: Based on current balance (upgrades & downgrades)
- **Configurable Level Bonuses**: Dynamic percentage allocation (20%, 4%, 4%...)
- **Rank-Based Profit Sharing**: 50%-80% user share based on rank
- **Detailed Bonus Tracking**: View breakdown by level in transaction history
- **Wallet Details Visibility**: Admin can view wallet addresses in pending lists

#### Rank Tiers
- **Starter** ($100-$499): 0 level bonus, 50/50 profit split
- **Beginner** ($500-$999): 3 level bonus, 60/40 profit split
- **Investor** ($1,000-$4,999): 7 level bonus, 70/30 profit split
- **VIP** ($5,000-$9,999): 7 level bonus, 80/20 profit split
- **VVIP** ($10,000+): 7 level bonus, 80/20 profit split + monthly rewards

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Crypto integration (ethers.js)

### Frontend
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- Redux Toolkit
- React Router
- Axios

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and JWT secret in .env
npx prisma migrate dev

# NEW: Run integration setup for withdrawal & rank system
bash setup-integration.sh

npm run dev
```

**Note**: The `setup-integration.sh` script will:
- Update database schema
- Seed level bonus configurations
- Initialize rank system settings

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/          # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
│
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

## Environment Variables

See `.env.example` files in backend and frontend directories.

## Deployment

### Railway (Recommended)

⚠️ **This is a monorepo** - Deploy backend and frontend as separate services.

**Quick Deploy:**
1. Push to GitHub
2. Create Railway "Empty Project"
3. Add PostgreSQL database
4. Deploy backend (Root Directory: `backend`)
5. Deploy frontend (Root Directory: `frontend`)

**Guides:**
- 📋 [RAILWAY_STEPS.md](RAILWAY_STEPS.md) - Simple step-by-step guide
- 📖 [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Detailed documentation

Railway will host:
- ✅ PostgreSQL Database
- ✅ Backend API (Node.js)
- ✅ Frontend App (React)

All in a single project with automatic deployments from GitHub.

### Local Development

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed local setup instructions.

## Documentation

- 📖 [Setup Guide](SETUP_GUIDE.md) - Local development setup
- 🚂 [Railway Deployment](RAILWAY_DEPLOYMENT.md) - Deploy to Railway
- 🎯 [API Documentation](SETUP_GUIDE.md#api-endpoints) - API endpoints reference
- ⭐ [Integration Guide](INTEGRATION_GUIDE.md) - **NEW**: Withdrawal & Rank System
- 📋 [Integration Summary](INTEGRATION_SUMMARY.md) - Quick reference for new features

## License

MIT
