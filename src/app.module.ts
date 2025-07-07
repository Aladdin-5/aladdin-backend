import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CategoryModule } from "./category/category.module";
import { AgentModule } from "./agent/agent.module";
import { JobModule } from "./job/job.module";
import { JobDistributionModule } from "./job-distribution/job-distribution.module";

@Module({
	imports: [
		PrismaModule,
		CategoryModule,
		AgentModule,
		JobModule,
		JobDistributionModule,
	],
})
export class AppModule {}
