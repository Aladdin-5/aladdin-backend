import { AgentWorkStatus } from "@prisma/client";

export class CreateJobDistributionDto {
	jobId: string;
	jobName: string;
	matchCriteria: any;
	totalAgents: number;
	agentIds: string[];
}

export class UpdateJobDistributionDto {
	assignedAgentId?: string;
	assignedAgentName?: string;
	assignedCount?: number;
	responseCount?: number;
}

export class UpdateAgentWorkStatusDto {
	workStatus: AgentWorkStatus;
	executionResult?: string;
	startedAt?: Date;
	completedAt?: Date;
	progress?: number;
	errorMessage?: string;
	executionTimeMs?: number;
	retryCount?: number;
}
