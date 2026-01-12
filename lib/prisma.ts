import { PrismaClient } from '@/generated/prisma-client/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure database path is resolved correctly for SQLite
if (process.env.DATABASE_URL?.startsWith('file:')) {
  const dbPath = process.env.DATABASE_URL.replace('file:', '')
  // If relative path, resolve it relative to project root
  if (!path.isAbsolute(dbPath)) {
    const absolutePath = path.join(process.cwd(), dbPath)
    process.env.DATABASE_URL = `file:${absolutePath}`
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(undefined as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
