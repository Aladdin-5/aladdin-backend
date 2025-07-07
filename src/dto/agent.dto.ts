export class CreateAgentDto {
	agentName: string;
	agentAddress: string;
	description: string;
	authorBio: string;
	agentClassification: string;
	tags: string[];
	isPrivate?: boolean;
	autoAcceptJobs?: boolean;
	contractType?: string;
	walletAddress: string;
}

export class UpdateAgentDto {
	agentName?: string;
	agentAddress?: string;
	description?: string;
	authorBio?: string;
	agentClassification?: string;
	tags?: string[];
	isPrivate?: boolean;
	autoAcceptJobs?: boolean;
	contractType?: string;
	isActive?: boolean;
	reputation?: number;
	successRate?: number;
	totalJobsCompleted?: number;
}
