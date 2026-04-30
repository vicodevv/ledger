# Ledger3

A production-grade double-entry accounting ledger system that handles both traditional fiat currencies and cryptocurrency assets. Built as an open-source alternative to proprietary ledger solutions.

## Overview

Ledger3 provides enterprise-grade financial infrastructure for fintech companies, marketplaces, e-commerce platforms, and any application that needs accurate money tracking.

### Key Features

- ✅ **Double-entry accounting** - Every transaction balances (debits = credits)
- ✅ **Multi-tenant architecture** - Serve multiple companies from one system
- ✅ **Multi-currency support** - Handle USD, NGN, EUR, GBP, and more
- ✅ **Blockchain integration** - Track Bitcoin, Ethereum, stablecoins (USDC, USDT)
- ✅ **Immutable audit trails** - Every transaction is logged forever
- ✅ **Idempotency** - Prevent duplicate transactions
- ✅ **Real-time balances** - Sub-millisecond balance calculations
- ✅ **REST + GraphQL APIs** - Flexible integration options

## Tech Stack

- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL (transactional data) + Redis (caching)
- **ORM:** TypeORM
- **Blockchain:** ethers.js (Ethereum), web3.js (multi-chain)
- **DevOps:** Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ledger3.git
cd ledger3

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL and Redis via Docker
docker-compose up -d

# Run the application
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Quick Test

```bash
# Create a tenant
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "slug": "acme"}'

# Create accounts
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "your-tenant-id",
    "code": "1000",
    "name": "Cash",
    "type": "ASSET",
    "currency": "NGN"
  }'
```

## Project Structure
ledger3/
├── src/
│   ├── modules/
│   │   ├── tenants/          # Multi-tenant management
│   │   ├── accounts/         # Chart of accounts
│   │   ├── ledger/           # Core transaction engine
│   │   ├── exchange-rates/   # Currency conversion
│   │   └── crypto/           # Blockchain integration (coming soon)
│   ├── common/               # Shared utilities
│   └── config/               # Configuration
├── migrations/               # Database migrations
├── docker-compose.yml        # Docker setup
└── README.md

## Core Concepts

### Double-Entry Accounting

Every transaction has at least two entries that balance:

```typescript
// Example: Customer pays ₦10,000
{
  "description": "Payment from customer",
  "lines": [
    { "account": "Cash", "debit": 10000, "credit": 0 },
    { "account": "Revenue", "debit": 0, "credit": 10000 }
  ]
}
// Total debits (10000) = Total credits (10000) ✅
```

### Multi-Tenancy

Each tenant (company) has isolated data:
- Separate accounts
- Separate transactions
- Separate balances

### Blockchain Support (Phase 2)

Track crypto assets alongside fiat:
- Bitcoin, Ethereum, USDC balances
- On-chain transaction monitoring
- Automatic price conversions
- Gas fee tracking

## Roadmap

### Phase 1: Core Ledger (Current)
- [x] Project setup
- [x] Tenant management
- [ ] Account management
- [ ] Transaction engine
- [ ] Multi-currency support
- [ ] Audit logging
- [ ] REST API
- [ ] GraphQL API

### Phase 2: Blockchain Integration
- [ ] Crypto asset support (BTC, ETH, USDC)
- [ ] Blockchain event listeners
- [ ] On-chain transaction tracking
- [ ] DeFi protocol integration

### Phase 3: Advanced Features
- [ ] Automated reconciliation
- [ ] Fraud detection
- [ ] Financial reporting
- [ ] Webhook notifications
- [ ] SDK (TypeScript, Python, Go)

## Use Cases

- **Fintech:** Payment processors, digital banks, wallets
- **E-commerce:** Marketplaces, online stores, subscription platforms
- **Crypto:** Exchanges, DeFi protocols, NFT platforms
- **SaaS:** Any application that handles money

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Inspiration

Built as an open-source alternative to:
- [Blnk Finance](https://blnkfinance.com/) - Ledger for fintechs
- Stripe Ledger (proprietary)
- Modern Treasury (proprietary)

## Author

**Victor Omoniyi**
- Backend Engineer specializing in fintech infrastructure
- Building production-grade systems for African markets
- [LinkedIn](https://linkedin.com/in/victoromoniyi) | [GitHub](https://github.com/yourusername)

## Acknowledgments

- Inspired by Blnk Finance's approach to ledger architecture
- Built with knowledge from FigoRisk GRC platform development
- Designed for African infrastructure constraints (intermittent connectivity, multi-currency complexity)# ledger
