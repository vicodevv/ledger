Ledger
A production-grade double-entry accounting ledger system supporting traditional fiat currencies and cryptocurrency assets. Built for fintech companies, marketplaces, and platforms that need accurate money tracking with blockchain integration.
Overview
Ledger provides enterprise-grade financial infrastructure. Track fiat currencies (NGN, USD, EUR) and crypto assets (BTC, ETH, USDC) in a single system with complete audit trails and real-time balance updates.
Core Features

Double-entry accounting - Transactions balance automatically (debits = credits)
Multi-tenant architecture - Isolated data for multiple companies
Multi-currency support - Handle USD, NGN, EUR, GBP with automatic conversion
Blockchain integration - Track Bitcoin, Ethereum, stablecoins alongside fiat
Immutable audit trails - Every action logged with complete history
Idempotency - Duplicate transactions prevented automatically
Real-time balances - Sub-millisecond balance calculations
REST API - Complete API for all operations

Tech Stack

Backend: NestJS, TypeScript
Database: PostgreSQL (transactional data), Redis (caching)
ORM: TypeORM
Blockchain: ethers.js (Ethereum), Infura/Alchemy (RPC providers)
Scheduling: NestJS Schedule (cron jobs)
DevOps: Docker, Docker Compose

Getting Started
Prerequisites

Node.js 20+
Docker & Docker Compose
PostgreSQL 15+ (or use Docker)

Installation
bash# Clone the repository
git clone https://github.com/vicodevv/ledger.git
cd ledger

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL and Redis via Docker
docker-compose up -d

# Run the application
npm run start:dev
The API runs at http://localhost:3000
Quick Test
bash# Create a tenant
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "slug": "acme"}'

# Create accounts
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "YOUR_TENANT_ID",
    "code": "1000",
    "name": "Cash",
    "type": "ASSET",
    "currency": "NGN"
  }'

# Create a transaction
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "YOUR_TENANT_ID",
    "description": "Customer payment",
    "transactionDate": "2026-04-30T10:00:00Z",
    "lines": [
      {"accountId": "CASH_ID", "debit": 10000, "credit": 0, "currency": "NGN"},
      {"accountId": "REVENUE_ID", "debit": 0, "credit": 10000, "currency": "NGN"}
    ]
  }'
Project Structure
ledger/
├── src/
│   ├── modules/
│   │   ├── tenants/          # Multi-tenant management
│   │   ├── accounts/         # Chart of accounts
│   │   ├── ledger/           # Transaction engine
│   │   ├── exchange-rates/   # Currency conversion
│   │   ├── audit/            # Audit logging
│   │   └── crypto/           # Blockchain integration
│   ├── common/               # Shared utilities
│   └── config/               # Configuration
├── migrations/               # Database migrations
├── docker-compose.yml        # Docker setup
└── README.md
Core Concepts
Double-Entry Accounting
Every transaction has at least two entries that balance:
typescript// Customer pays ₦10,000
{
  "lines": [
    { "account": "Cash", "debit": 10000, "credit": 0 },      // Asset increases
    { "account": "Revenue", "debit": 0, "credit": 10000 }    // Revenue increases
  ]
}
// Debits (10000) = Credits (10000) ✓
Account types behave differently:

ASSET & EXPENSE: Debit increases, Credit decreases
LIABILITY, EQUITY, REVENUE: Credit increases, Debit decreases

Multi-Tenancy
Each tenant (company) has isolated data:

Separate accounts
Separate transactions
Separate balances

Tenant A cannot access Tenant B's data.
Blockchain Integration
Track crypto assets alongside fiat:

Monitor Bitcoin, Ethereum, USDC wallets
Auto-record on-chain transactions
Convert crypto to fiat using live prices
Support multiple blockchains (Ethereum, Polygon, Base, Arbitrum)
Track DeFi positions (Aave, Uniswap)
Immutable audit trail on-chain

Exchange Rates
Automatic currency conversion:

Daily auto-sync from external APIs
Historical rate tracking
Reverse rate calculation (if USD→NGN exists, calculate NGN→USD)
Manual rate override supported

Audit Logging
Complete activity history:

Who performed the action
What changed (before/after)
When it happened
IP address and user agent
Activity summaries and statistics

API Documentation
Tenants

POST /tenants - Create tenant
GET /tenants - List all tenants
GET /tenants/:id - Get tenant by ID
GET /tenants/slug/:slug - Get tenant by slug
DELETE /tenants/:id - Delete tenant

Accounts

POST /accounts - Create account
GET /accounts - List accounts (optional: filter by tenant)
GET /accounts/:id - Get account by ID
GET /accounts/:id/balance - Get account balance
DELETE /accounts/:id - Delete account

Transactions

POST /transactions - Create transaction
GET /transactions - List transactions (optional: filter by tenant)
GET /transactions/:id - Get transaction by ID

Exchange Rates

POST /exchange-rates/sync - Sync rates from API
POST /exchange-rates - Create manual rate
GET /exchange-rates - List all rates
GET /exchange-rates/latest?from=USD&to=NGN - Get latest rate
GET /exchange-rates/rate?from=USD&to=NGN&date=2026-04-30 - Get historical rate
GET /exchange-rates/convert?amount=100&from=USD&to=NGN - Convert currency

Audit Logs

POST /audit - Create audit log
GET /audit - List audit logs (with filters)
GET /audit/tenant/:tenantId - Get tenant activity
GET /audit/entity/:type/:id - Get entity history
GET /audit/summary/:tenantId?days=7 - Get activity summary

Crypto (Coming Soon)

POST /crypto/wallets - Add wallet to monitor
GET /crypto/wallets - List monitored wallets
GET /crypto/balances/:walletId - Get crypto balances
GET /crypto/transactions/:walletId - Get on-chain transactions
POST /crypto/sync/:walletId - Sync wallet transactions

Use Cases
Fintech: Payment processors, digital banks, wallets
E-commerce: Marketplaces, online stores, subscription platforms
Crypto: Exchanges, DeFi protocols, NFT platforms
SaaS: Any application handling money
Configuration
Key environment variables:
env# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ledger
DB_PASSWORD=ledger123
DB_DATABASE=ledger_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Blockchain (optional)
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key
Development
bash# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
Database Schema
Core Tables

tenants - Company/organization records
accounts - Chart of accounts (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
transactions - Transaction headers
transaction_lines - Double-entry lines (debits/credits)
exchange_rates - Currency conversion rates with time validity
audit_logs - Complete activity history

Indexes
Optimized for:

Tenant-scoped queries
Date range filtering
Account balance lookups
Audit trail searches

Security Features

Idempotency keys - Prevent duplicate transactions
Multi-tenant isolation - Data segregation enforced at database level
Audit trails - Every action tracked with user, IP, timestamp
Input validation - Class-validator on all DTOs
SQL injection protection - TypeORM parameterized queries
CORS configuration - Configurable allowed origins

Performance

Balance caching - Account balances stored and updated incrementally
Database transactions - Atomic operations prevent race conditions
Decimal precision - Uses Decimal.js to avoid floating-point errors
Query optimization - Strategic indexes on high-traffic queries
Connection pooling - PostgreSQL connection reuse

Roadmap
Completed

 Multi-tenant architecture
 Chart of accounts
 Double-entry transaction engine
 Exchange rate auto-sync
 Audit logging
 REST API

In Progress

 Blockchain wallet monitoring
 Crypto asset tracking
 On-chain transaction sync

Planned

 Multi-chain support (Bitcoin, Polygon, Base, Arbitrum)
 DeFi protocol integration (Aave, Uniswap)
 Financial reports (Balance Sheet, Income Statement, Trial Balance)
 Webhook notifications
 GraphQL API
 SDK (TypeScript, Python, Go)

Contributing
Contributions welcome. Please read CONTRIBUTING.md for details.
License
MIT License - see LICENSE for details.
