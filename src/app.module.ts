import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CategoryModule } from "./category/category.module";
import { AgentModule } from "./agent/agent.module";
import { JobModule } from "./job/job.module";
import { JobDistributionModule } from "./job-distribution/job-distribution.module";
import { AwsModule } from "./aws/aws.module";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		CategoryModule,
		AgentModule,
		JobModule,
		JobDistributionModule,
		AwsModule,
	],
	controllers: [],
  providers: [],
})
export class AppModule {}
