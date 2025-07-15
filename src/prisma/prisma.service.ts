import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// 使用any类型暂时解决类型问题
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  // SSM 客户端
  private ssmClient: SSMClient;

  constructor() {
    this.ssmClient = new SSMClient({ 
      region: process.env.AWS_REGION || 'us-west-1' 
    });
  }

  async onModuleInit() {
    try {
      console.log('正在从 SSM Parameter Store 获取数据库连接字符串...');
      
      // 从 SSM 获取数据库连接字符串
      const [databaseMain] = await Promise.all([
        this.ssmClient.send(
          new GetParameterCommand({
            Name: '/aladdin-backend/database-url',
            WithDecryption: true,
          })
        ),
      ]);

      const databaseMainUrl = databaseMain.Parameter?.Value;

      console.log('成功获取数据库连接字符串，正在初始化 Prisma 客户端...',databaseMainUrl);

      // 使用获取到的连接字符串初始化 Prisma 客户端
      this.prisma = new PrismaClient({
        datasourceUrl: databaseMainUrl,
      })

      // 连接到数据库
      await this.prisma.$connect();
      console.log('数据库连接成功建立');

    } catch (error) {
      console.error('数据库连接失败:', error);
      throw error;
    }
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
