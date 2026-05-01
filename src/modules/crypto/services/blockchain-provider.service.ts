/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BlockchainNetwork } from '../entities/crypto-wallet.entity';

@Injectable()
export class BlockchainProviderService {
  private providers: Map<BlockchainNetwork, ethers.JsonRpcProvider>;

  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  private initializeProviders() {
    // Ethereum Mainnet (using public RPC - will add Infura/Alchemy key later)
    this.providers.set(
      BlockchainNetwork.ETHEREUM,
      new ethers.JsonRpcProvider('https://eth.public-rpc.com'),
    );

    // Polygon Mainnet
    this.providers.set(
      BlockchainNetwork.POLYGON,
      new ethers.JsonRpcProvider('https://polygon-rpc.com'),
    );

    // Base Mainnet
    this.providers.set(
      BlockchainNetwork.BASE,
      new ethers.JsonRpcProvider('https://mainnet.base.org'),
    );

    // Arbitrum Mainnet
    this.providers.set(
      BlockchainNetwork.ARBITRUM,
      new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc'),
    );
  }

  getProvider(network: BlockchainNetwork): ethers.JsonRpcProvider {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`No provider configured for network: ${network}`);
    }
    return provider;
  }

  async getBalance(
    network: BlockchainNetwork,
    address: string,
  ): Promise<string> {
    const provider = this.getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance); // Convert from Wei to ETH
  }

  async getTokenBalance(
    network: BlockchainNetwork,
    walletAddress: string,
    tokenAddress: string,
  ): Promise<string> {
    const provider = this.getProvider(network);

    // ERC20 ABI - just the balanceOf function
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];

    const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();

    return ethers.formatUnits(balance, decimals);
  }

  async getTransactionReceipt(network: BlockchainNetwork, txHash: string) {
    const provider = this.getProvider(network);
    return await provider.getTransactionReceipt(txHash);
  }

  async getTransaction(network: BlockchainNetwork, txHash: string) {
    const provider = this.getProvider(network);
    return await provider.getTransaction(txHash);
  }

  async getCurrentBlockNumber(network: BlockchainNetwork): Promise<number> {
    const provider = this.getProvider(network);
    return await provider.getBlockNumber();
  }

  async getBlockTimestamp(
    network: BlockchainNetwork,
    blockNumber: number,
  ): Promise<number> {
    const provider = this.getProvider(network);
    const block = await provider.getBlock(blockNumber);
    return block ? block.timestamp : 0;
  }
}
