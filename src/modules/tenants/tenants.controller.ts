import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTenantDto: CreateTenantDto,
  ): Promise<TenantResponseDto> {
    return await this.tenantsService.create(createTenantDto);
  }

  @Get()
  async findAll(): Promise<TenantResponseDto[]> {
    return await this.tenantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TenantResponseDto> {
    return await this.tenantsService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<TenantResponseDto> {
    return await this.tenantsService.findBySlug(slug);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return await this.tenantsService.remove(id);
  }
}
