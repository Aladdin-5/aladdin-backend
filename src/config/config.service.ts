import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  // 数据库配置
  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/blog_db');
  }

  // GitHub配置
  get githubToken(): string {
    return this.configService.get<string>('GITHUB_TOKEN', '');
  }

  get githubUsername(): string {
    return this.configService.get<string>('GITHUB_USERNAME', 'Da-Sheng');
  }

  // 应用配置
  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'info');
  }

  // 是否开发环境
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  // 是否生产环境
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // 获取任意配置（带默认值）
  get<T = string>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue);
  }
} 