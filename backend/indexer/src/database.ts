import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('Connected to SQLite database');
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    // For compatibility with existing code, we'll use raw queries
    return await this.prisma.$queryRawUnsafe(sql, ...params);
  }

  get client() {
    return this.prisma;
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const database = new Database();