import { Module } from "@nestjs/common";
import { JobDistributionService } from "./job-distribution.service";
import { JobDistributionController } from "./job-distribution.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	controllers: [JobDistributionController],
	providers: [JobDistributionService],
})
export class JobDistributionModule {}
