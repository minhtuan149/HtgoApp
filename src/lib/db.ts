// Force reload Prisma Client schema updates
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

const connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // Prevent multiple instances of Prisma Client in development due to hot reloading
  const globalWithPrisma = global as typeof globalThis & {
    prisma?: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalWithPrisma.prisma = new PrismaClient({ adapter });
  }
  
  prisma = globalWithPrisma.prisma;
}

export { prisma };
