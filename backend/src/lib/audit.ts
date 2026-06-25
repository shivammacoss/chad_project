import type { Request } from 'express'
import { AuditLog } from '../models/AuditLog.js'

export async function logAudit(req: Request, action: string, target: string, meta: Record<string, unknown> = {}): Promise<void> {
  try {
    await AuditLog.create({ actorId: req.userId ?? null, actorRole: req.userRole ?? '', action, target, meta, ip: req.ip ?? '' })
  } catch (err) {
    console.warn('logAudit failed (ignored):', (err as Error).message)
  }
}
