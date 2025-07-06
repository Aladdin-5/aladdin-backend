import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// 使用any类型暂时解决类型问题
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: any;

  constructor() {
    // 动态导入PrismaClient
    const { PrismaClient } = require('@prisma/client');
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // 代理方法，使其行为像PrismaClient
  get agent() {
    return this.prisma.agent;
  }

  get category() {
    return this.prisma.category;
  }

  get job() {
    return this.prisma.job;
  }

  get jobDistributionRecord() {
    return this.prisma.jobDistributionRecord;
  }

  get jobDistributionAgent() {
    return this.prisma.jobDistributionAgent;
  }
} 