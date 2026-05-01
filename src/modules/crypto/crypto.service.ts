/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CryptoWallet,
  BlockchainNetwork,
} from './entities/crypto-wallet.entity';
import {
  CryptoTransaction,
  CryptoTransactionStatus,
  CryptoTransactionType,
} from './entities/crypto-transaction.entity';
import { CreateCryptoWalletDto } from './dto/create-crypto-wallet.dto';
import { BlockchainProviderService } from './services/blockchain-provider.service';
import { PriceFeedService } from './services/price-feed.service';
import { LedgerService } from '../ledger/ledger.service';
import { AccountsService } from '../accounts/accounts.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CryptoService {
  constructor(
    @InjectRepository(CryptoWallet)
    private readonly walletRepository: Repository<CryptoWallet>,
    @InjectRepository(CryptoTransaction)
    private readonly cryptoTxRepository: Repository<CryptoTransaction>,
    private readonly blockchainProvider: BlockchainProviderService,
    private readonly priceFeed: PriceFeedService,
    private readonly ledgerService: LedgerService,
    private readonly accountsService: AccountsService,
    private readonly auditService: AuditService,
  ) {}

  async createWallet(
    createWalletDto: CreateCryptoWalletDto,
  ): Promise<CryptoWallet> {
    const existing = await this.walletRepository.findOne({
      where: {
        tenantId: createWalletDto.tenantId,
        address: createWalletDto.address,
        network: createWalletDto.network,
      },
    });

    if (existing) {
      throw new ConflictException('Wallet already exists for this tenant');
    }

    const wallet = this.walletRepository.create(createWalletDto);
    const saved = await this.walletRepository.save(wallet);

    await this.auditService.logCreate(
      'crypto_wallet',
      saved.id,
      saved.tenantId,
    );

    return saved;
  }

  async getBalance(
    walletId: string,
    asset: string = 'ETH',
  ): Promise<{ balance: string; usdValue: number }> {
    const wallet = await this.findWallet(walletId);

    let balance: string;

    if (asset === 'ETH' || asset === 'MATIC') {
      balance = await this.blockchainProvider.getBalance(
        wallet.network,
        wallet.address,
      );
    } else {
      const tokenAddress = this.getTokenAddress(asset, wallet.network);
      balance = await this.blockchainProvider.getTokenBalance(
        wallet.network,
        wallet.address,
        tokenAddress,
      );
    }

    const usdValue = await this.priceFeed.convertToUsd(
      parseFloat(balance),
      asset,
    );

    return { balance, usdValue };
  }

  async getAllBalances(walletId: string): Promise<any[]> {
    const wallet = await this.findWallet(walletId);
    const assets = this.getAssetsForNetwork(wallet.network);
    const balances = [];

    for (const asset of assets) {
      try {
        const { balance, usdValue } = await this.getBalance(walletId, asset);

        if (parseFloat(balance) > 0) {
          balances.push({ asset, balance, usdValue });
        }
      } catch (error) {
        console.error(`Failed to fetch ${asset} balance:`, error);
      }
    }

    return balances;
  }

  async syncWalletTransactions(walletId: string): Promise<void> {
    const wallet = await this.findWallet(walletId);

    console.log(`Syncing wallet ${wallet.address} on ${wallet.network}...`);

    wallet.lastSyncedAt = new Date();
    await this.walletRepository.save(wallet);
  }

  async recordDeposit(
    walletId: string,
    txHash: string,
    asset: string,
    amount: number,
  ): Promise<CryptoTransaction> {
    const wallet = await this.findWallet(walletId);

    const existing = await this.cryptoTxRepository.findOne({
      where: { txHash },
    });
    if (existing) {
      return existing;
    }

    const usdValue = await this.priceFeed.convertToUsd(amount, asset);

    const tx = this.cryptoTxRepository.create({
      walletId: wallet.id,
      txHash,
      fromAddress: 'external',
      toAddress: wallet.address,
      asset,
      amount,
      amountUsd: usdValue,
      type: CryptoTransactionType.DEPOSIT,
      status: CryptoTransactionStatus.CONFIRMED,
      confirmations: 1,
    });

    const saved = await this.cryptoTxRepository.save(tx);

    await this.createLedgerEntry(wallet, saved);

    return saved;
  }

  private async createLedgerEntry(
    wallet: CryptoWallet,
    cryptoTx: CryptoTransaction,
  ): Promise<void> {
    const cryptoAssetAccount = await this.accountsService
      .findByTenantAndCode(wallet.tenantId, `CRYPTO_${cryptoTx.asset}`)
      .catch(() => null);

    if (!cryptoAssetAccount) {
      console.log(
        `No crypto asset account found for ${cryptoTx.asset}, skipping ledger entry`,
      );
      return;
    }

    const customerDepositAccount = await this.accountsService
      .findByTenantAndCode(wallet.tenantId, 'CUSTOMER_DEPOSIT')
      .catch(() => null);

    if (!customerDepositAccount) {
      console.log('No customer deposit account found, skipping ledger entry');
      return;
    }

    const ledgerTx = await this.ledgerService.createTransaction({
      tenantId: wallet.tenantId,
      idempotencyKey: `crypto-${cryptoTx.txHash}`,
      description: `${cryptoTx.asset} deposit: ${cryptoTx.amount}`,
      reference: cryptoTx.txHash,
      transactionDate: new Date().toISOString(),
      metadata: {
        cryptoTransactionId: cryptoTx.id,
        blockNumber: cryptoTx.blockNumber,
      },
      lines: [
        {
          accountId: cryptoAssetAccount.id,
          debit: cryptoTx.amountUsd || 0,
          credit: 0,
          currency: 'USD',
        },
        {
          accountId: customerDepositAccount.id,
          debit: 0,
          credit: cryptoTx.amountUsd || 0,
          currency: 'USD',
        },
      ],
    });

    cryptoTx.ledgerTransactionId = ledgerTx.id;
    await this.cryptoTxRepository.save(cryptoTx);
  }

  async findAllWallets(tenantId?: string): Promise<CryptoWallet[]> {
    const where = tenantId ? { tenantId } : {};
    return await this.walletRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findWallet(id: string): Promise<CryptoWallet> {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID '${id}' not found`);
    }
    return wallet;
  }

  async findTransactions(walletId: string): Promise<CryptoTransaction[]> {
    return await this.cryptoTxRepository.find({
      where: { walletId },
      order: { blockTimestamp: 'DESC' },
    });
  }

  private getTokenAddress(symbol: string, network: BlockchainNetwork): string {
    const addresses: Record<BlockchainNetwork, Record<string, string>> = {
      [BlockchainNetwork.ETHEREUM]: {
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      },
      [BlockchainNetwork.POLYGON]: {
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      },
      [BlockchainNetwork.BASE]: {
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      },
      [BlockchainNetwork.ARBITRUM]: {
        USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      },
      [BlockchainNetwork.BITCOIN]: {},
    };

    return addresses[network]?.[symbol] || '';
  }

  private getAssetsForNetwork(network: BlockchainNetwork): string[] {
    const assets: Record<BlockchainNetwork, string[]> = {
      [BlockchainNetwork.ETHEREUM]: ['ETH', 'USDC', 'USDT', 'DAI'],
      [BlockchainNetwork.POLYGON]: ['MATIC', 'USDC', 'USDT'],
      [BlockchainNetwork.BASE]: ['ETH', 'USDC'],
      [BlockchainNetwork.ARBITRUM]: ['ETH', 'USDC'],
      [BlockchainNetwork.BITCOIN]: ['BTC'],
    };

    return assets[network] || [];
  }
}
