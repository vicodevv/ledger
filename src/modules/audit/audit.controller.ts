import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    return await this.auditService.log(createAuditLogDto);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AuditLogResponseDto[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return await this.auditService.findAll(
      tenantId,
      entityType,
      entityId,
      start,
      end,
    );
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AuditLogResponseDto[]> {
    return await this.auditService.findByEntity(entityType, entityId);
  }

  @Get('tenant/:tenantId')
  async findByTenant(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: number,
  ): Promise<AuditLogResponseDto[]> {
    return await this.auditService.findByTenant(tenantId, limit);
  }

  @Get('summary/:tenantId')
  async getActivitySummary(
    @Param('tenantId') tenantId: string,
    @Query('days') days?: number,
  ): Promise<any> {
    return await this.auditService.getActivitySummary(tenantId, days || 7);
  }
}
