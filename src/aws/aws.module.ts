import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsService } from './sqs.service';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [ConfigModule],
  providers: [SqsService, ConfigService],
  exports: [SqsService],
})
export class AwsModule {} 