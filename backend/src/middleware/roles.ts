import type { Request, Response, NextFunction } from 'express'

const CUSTOMER_ROLES = new Set(['customer', 'user'])

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  if (!req.userRole || CUSTOMER_ROLES.has(req.userRole)) {
    res.status(403).json({ error: 'Staff only' })
    return
  }
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.userRole === 'admin' || (req.userRole && roles.includes(req.userRole))) {
      next()
      return
    }
    res.status(403).json({ error: 'Insufficient role' })
  }
}
