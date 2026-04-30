import { AuditAction } from '../entities/audit-log.entity';

export class AuditLogResponseDto {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
