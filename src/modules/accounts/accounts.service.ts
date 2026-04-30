import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // Verify tenant exists
    await this.tenantsService.findOne(createAccountDto.tenantId);

    // Check if account code already exists for this tenant
    const existingAccount = await this.accountRepository.findOne({
      where: {
        tenantId: createAccountDto.tenantId,
        code: createAccountDto.code,
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        `Account with code '${createAccountDto.code}' already exists for this tenant`,
      );
    }

    // If parentId is provided, verify it exists
    if (createAccountDto.parentId) {
      const parent = await this.accountRepository.findOne({
        where: { id: createAccountDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent account with ID '${createAccountDto.parentId}' not found`,
        );
      }

      // Verify parent belongs to same tenant
      if (parent.tenantId !== createAccountDto.tenantId) {
        throw new BadRequestException(
          'Parent account must belong to the same tenant',
        );
      }
    }

    const account = this.accountRepository.create(createAccountDto);
    return await this.accountRepository.save(account);
  }

  async findAll(tenantId?: string): Promise<Account[]> {
    const where = tenantId ? { tenantId } : {};
    return await this.accountRepository.find({
      where,
      order: { code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID '${id}' not found`);
    }

    return account;
  }

  async findByTenantAndCode(tenantId: string, code: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { tenantId, code },
    });

    if (!account) {
      throw new NotFoundException(
        `Account with code '${code}' not found for this tenant`,
      );
    }

    return account;
  }

  async getBalance(id: string): Promise<number> {
    const account = await this.findOne(id);
    return account.balance;
  }

  async updateBalance(id: string, amount: number): Promise<Account> {
    const account = await this.findOne(id);
    account.balance = Number(account.balance) + amount;
    return await this.accountRepository.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);

    // Check if account has children
    const children = await this.accountRepository.find({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete account with child accounts',
      );
    }

    await this.accountRepository.remove(account);
  }
}
