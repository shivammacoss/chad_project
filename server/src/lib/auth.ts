import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

function secret(): string {
  return process.env.JWT_SECRET ?? 'test-secret'
}

export function signToken(payload: { sub: string; role: string }): string {
  return jwt.sign(payload, secret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): { sub: string; role: string } {
  return jwt.verify(token, secret()) as { sub: string; role: string }
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export function makeVerifyToken(): { raw: string; hashed: string; expires: Date } {
  const raw = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  return { raw, hashed: hashToken(raw), expires }
}
