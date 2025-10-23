# 🏗️ Solana Asset Tokenization Platform

**SolAssets** is a modern platform for tokenizing real-world assets (RWA) on the Solana blockchain, allowing investors to purchase fractional shares in real estate, equipment, and art.

![Platform Preview](https://via.placeholder.com/800x400/00A8E8/FFFFFF?text=SolAssets+Platform)

## 🌟 Key Features

### 💰 Investment
- **Fractional Ownership** — invest in high-value assets starting from 10 USDC  
- **Global Access** — access assets worldwide with no geographic restrictions  
- **Instant Liquidity** — trade asset shares 24/7 on a decentralized exchange  

### 🔒 Security and Transparency
- **Smart Contracts** — all operations are recorded on the Solana blockchain  
- **KYC/AML** — full user verification and regulatory compliance  
- **Asset Audit** — professional valuation and verification for every asset  

### 📊 Analytics and Management
- **Portfolio** — detailed yield and risk analytics  
- **Transaction History** — complete transparency of all operations  
- **Dividends** — automatic distribution of asset income  

---

## 🏗️ Project Architecture

```
assetslicenew/
├── 🎨 Frontend (Next.js 14)
│   ├── app/                    # App Router pages
│   │   ├── assets/             # Asset catalog
│   │   ├── portfolio/          # User portfolio
│   │   ├── trade/              # Trading platform
│   │   ├── history/            # Transaction history
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   ├── providers/          # Context providers
│   │   └── ui/                 # UI components
│   └── lib/                    # Utilities and types
│
├── ⚡ Solana Programs (Rust)
│   ├── rwa_backend/            # Main tokenization program
│   ├── rwa_market/             # Marketplace program
│   └── rwa_registry/           # Asset registry
│
├── 🗄️ Backend Services
│   ├── indexer/                # Blockchain data indexer
│   ├── api/                    # REST API services
│   └── migrations/             # Database migrations
│
└── 📊 Database (PostgreSQL + Prisma)
    └── prisma/                 # Schema and migrations
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Recharts**

### Blockchain
- **Solana**
- **Anchor Framework**
- **Rust**
- **SPL Token**

### Wallet Integration
- **@solana/wallet-adapter**
- **Phantom**
- **Solflare**
- **Backpack**

### Backend & Database
- **PostgreSQL**
- **Prisma**
- **Node.js**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn  
- Rust 1.70+ and Cargo  
- Solana CLI 1.16+  
- Anchor CLI 0.29+  
- PostgreSQL 14+  

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/solana-asset-tokenization.git
cd solana-asset-tokenization
```

2. **Install dependencies**
```bash
npm install
cd rwa_backend
anchor build
cd ..
```

3. **Set up environment**
```bash
cp .env.example .env.local
cp .env.example .env
DATABASE_URL="postgresql://username:password@localhost:5432/solassets"
```

4. **Initialize the database**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Run in development mode**
```bash
npm run dev
solana-test-validator
cd rwa_backend && anchor deploy
```

App available at: [http://localhost:3000](http://localhost:3000)

---

## 📱 Main Pages

### 🏠 Home (`/`)
- Platform overview  
- Asset and investor statistics  
- Wallet integration  

### 🏢 Assets Catalog (`/assets`)
- Browse all assets  
- Filter by category  
- Search and sort  
- Detailed asset info  

### 💼 Portfolio (`/portfolio`)
- Investment overview  
- Yield and P&L analytics  
- Category allocation  
- Dividend history  

### 📈 Trading Platform (`/trade`)
- Buy and sell asset shares  
- Real-time order book  
- Trade history  
- Price and volume charts  

### 📋 Transaction History (`/history`)
- Full transaction record  
- Filter by type  
- Blockchain confirmations  
- Export data  

---

## 🔧 API Endpoints

### Assets API
```typescript
GET /api/assets
GET /api/assets/[id]
POST /api/assets
```

### Portfolio API
```typescript
GET /api/portfolio
GET /api/portfolio/stats
```

### Trading API
```typescript
GET /api/orderbook
POST /api/orders
GET /api/trades
```

### Transactions API
```typescript
GET /api/transactions
POST /api/transactions
GET /api/transactions/[sig]
```

---

## 🏗️ Solana Programs

### RWA Backend (`rwa_backend`)
```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
pub fn create_asset(ctx: Context<CreateAsset>, params: CreateAssetParams) -> Result<()>
pub fn mint_shares(ctx: Context<MintShares>, amount: u64) -> Result<()>
pub fn transfer_shares(ctx: Context<TransferShares>, amount: u64) -> Result<()>
```

### RWA Market (`rwa_market`)
- Create and manage orders  
- Match buyers and sellers  
- Calculate and distribute fees  

### RWA Registry (`rwa_registry`)
- Asset metadata  
- Verification and audit  
- Access control  

---

## 🎨 UI/UX Highlights

### Design System
- Solana-inspired green + Ocean blue  
- Inter (text) & Satoshi (headings)  
- Dark/light theme  
- Mobile-first responsive design  

### Animations
- Framer Motion transitions  
- Microinteractions  
- Skeleton loading  

### Components
- Modular and reusable  
- TypeScript typing  
- Error boundaries  

---

## 🔐 Security

### Blockchain Security
- PDAs (Program Derived Addresses)  
- Anchor safety checks  
- Multisig operations  

### Frontend Security
- Input validation  
- XSS & CSRF protection  
- Wallet signature verification  

### Data Protection
- Encrypted sensitive data  
- Rate limiting  
- Audit logs  

---

## 📊 Database

### Core Models

```prisma
model Asset {
  id           String @id @default(cuid())
  mint         String @unique
  ticker       String
  issuer       String
  priceUsdc    BigInt
  totalSupply  BigInt
  freeFloat    BigInt
  trades       Trade[]
  positions    Position[]
  dividends    Dividend[]
}

model Trade {
  id        String @id @default(cuid())
  sig       String @unique
  mint      String
  side      String // "buy" or "sell"
  priceUsdc BigInt
  amount    BigInt
  wallet    String
}

model Position {
  id        String @id @default(cuid())
  wallet    String
  mint      String
  amount    BigInt
  avgPrice  BigInt
}
```

---

## 🧪 Testing

### Frontend
```bash
npm run test
npm run test:e2e
npm run test:coverage
```

### Solana Programs
```bash
cd rwa_backend
anchor test
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
npm run start
```

### Solana Programs
```bash
anchor build
anchor deploy --provider.cluster mainnet
```

### Database
```bash
npx prisma migrate deploy
```

---

## 🤝 Contributing

1. Fork the repository  
2. Create a branch (`git checkout -b feature/amazing-feature`)  
3. Commit changes (`git commit -m 'Add amazing feature'`)  
4. Push (`git push origin feature/amazing-feature`)  
5. Open a Pull Request  

### Code Standards
- ESLint + Prettier  
- Rustfmt  
- Conventional Commits  

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.  

---

**Made with ❤️ for the future of decentralized finance.**
