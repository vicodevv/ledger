import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<AccountResponseDto> {
    return await this.accountsService.create(createAccountDto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId?: string,
  ): Promise<AccountResponseDto[]> {
    return await this.accountsService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AccountResponseDto> {
    return await this.accountsService.findOne(id);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string): Promise<{ balance: number }> {
    const balance = await this.accountsService.getBalance(id);
    return { balance };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return await this.accountsService.remove(id);
  }
}
