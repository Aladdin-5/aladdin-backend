import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';

console.log('process.env.NODE_ENV2', process.env.NODE_ENV)
@Module({
  imports: [
    NestConfigModule.forRoot({
      // 支持多环境文件加载
      envFilePath: [
        '.env.local',
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
      // 全局可用
      isGlobal: true,
      // 展开环境变量
      expandVariables: true,
      // 缓存配置
      cache: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {} 