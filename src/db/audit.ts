import { db } from './index.ts';
import { auditLog } from './schema.ts';

export async function recordAuditLog(params: {
  actorProfileId?: number | null;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | number;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorProfileId: params.actorProfileId ?? null,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: String(params.entityId),
      beforeState: params.beforeState ?? null,
      afterState: params.afterState ?? null,
    });
  } catch (err) {
    console.error('Audit log insert failed:', err);
  }
}
