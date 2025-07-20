import { Module } from '@nestjs/common';
import { SqsService } from './sqs.service';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [SqsService],
  exports: [SqsService],
})
export class AwsModule {} 