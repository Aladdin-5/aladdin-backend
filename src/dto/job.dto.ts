import { JobStatus } from "@prisma/client";

export class CreateJobDto {
	jobTitle: string;
	category: string;
	description: string;
	deliverables: string;
	budget: any;
	maxBudget?: number;
	deadline: Date;
	paymentType: string;
	priority: string;
	skillLevel: string;
	tags: string[];
	autoAssign?: boolean;
	allowBidding?: boolean;
	allowParallelExecution?: boolean;
	escrowEnabled?: boolean;
	isPublic?: boolean;
	walletAddress: string;
}

export class UpdateJobDto {
	jobTitle?: string;
	category?: string;
	description?: string;
	deliverables?: string;
	budget?: any;
	maxBudget?: number;
	deadline?: Date;
	paymentType?: string;
	priority?: string;
	skillLevel?: string;
	tags?: string[];
	status?: JobStatus;
	autoAssign?: boolean;
	allowBidding?: boolean;
	allowParallelExecution?: boolean;
	escrowEnabled?: boolean;
	isPublic?: boolean;
}
