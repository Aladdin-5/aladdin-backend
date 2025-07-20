import { Module } from "@nestjs/common";
import { JobService } from "./job.service";
import { JobController } from "./job.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AwsModule } from "../aws/aws.module";

@Module({
	imports: [PrismaModule, AwsModule],
	controllers: [JobController],
	providers: [JobService],
})
export class JobModule {}
