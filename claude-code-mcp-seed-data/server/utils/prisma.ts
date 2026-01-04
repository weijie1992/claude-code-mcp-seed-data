import { PrismaClient } from '../../app/generated/prisma/client'

// Singleton pattern to prevent multiple Prisma Client instances
// This is especially important in development with hot module replacement
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
