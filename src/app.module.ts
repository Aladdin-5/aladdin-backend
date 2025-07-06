import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    AgentModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 