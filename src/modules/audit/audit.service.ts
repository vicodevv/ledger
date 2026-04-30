/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return await this.auditLogRepository.save(auditLog);
  }

  // Helper methods for common actions
  async logCreate(
    entityType: string,
    entityId: string,
    tenantId?: string,
    performedBy?: string,
    metadata?: Record<string, any>,
  ): Promise<AuditLog> {
    return await this.log({
      tenantId,
      entityType,
      entityId,
      action: AuditAction.CREATE,
      performedBy,
      metadata,
    });
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    changes: Record<string, any>,
    tenantId?: string,
    performedBy?: string,
  ): Promise<AuditLog> {
    return await this.log({
      tenantId,
      entityType,
      entityId,
      action: AuditAction.UPDATE,
      performedBy,
      changes,
    });
  }

  async logDelete(
    entityType: string,
    entityId: string,
    tenantId?: string,
    performedBy?: string,
  ): Promise<AuditLog> {
    return await this.log({
      tenantId,
      entityType,
      entityId,
      action: AuditAction.DELETE,
      performedBy,
    });
  }

  async findAll(
    tenantId?: string,
    entityType?: string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLog[]> {
    const where: any = {};

    if (tenantId) where.tenantId = tenantId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return await this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100, // Limit to last 100 logs
    });
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'ASC' }, // Chronological order
    });
  }

  async findByTenant(
    tenantId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getActivitySummary(tenantId: string, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditLogRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, new Date()),
      },
    });

    // Group by action type
    const summary = {
      total: logs.length,
      creates: logs.filter((l) => l.action === AuditAction.CREATE).length,
      updates: logs.filter((l) => l.action === AuditAction.UPDATE).length,
      deletes: logs.filter((l) => l.action === AuditAction.DELETE).length,
      byEntityType: {} as Record<string, number>,
    };

    // Count by entity type
    logs.forEach((log) => {
      if (!summary.byEntityType[log.entityType]) {
        summary.byEntityType[log.entityType] = 0;
      }
      summary.byEntityType[log.entityType]++;
    });

    return summary;
  }
}
