import { AgentWorkStatus } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDistributionDto {
	@ApiProperty({
		description: '任务ID',
		example: 'clg2hq3e90000mp08c7qy1r1a',
		required: true
	})
	jobId: string;

	@ApiProperty({
		description: '任务名称',
		example: '开发一个AI聊天机器人',
		required: true
	})
	jobName: string;

	@ApiProperty({
		description: '匹配标准',
		example: {
			tags: ['AI', '机器学习'],
			category: '人工智能',
			skillLevel: 'expert'
		},
		required: true
	})
	matchCriteria: any;

	@ApiProperty({
		description: '总Agent数量',
		example: 5,
		minimum: 1,
		required: true
	})
	totalAgents: number;

	@ApiProperty({
		description: 'Agent ID列表',
		example: ['clg2hq3e90001mp08c7qy1r1b', 'clg2hq3e90002mp08c7qy1r1c'],
		type: [String],
		required: true
	})
	agentIds: string[];
}

export class UpdateJobDistributionDto {
	@ApiProperty({
		description: '分配的Agent ID',
		example: 'clg2hq3e90001mp08c7qy1r1b',
		required: false
	})
	assignedAgentId?: string;

	@ApiProperty({
		description: '分配的Agent名称',
		example: 'GPT-4 Agent',
		required: false
	})
	assignedAgentName?: string;

	@ApiProperty({
		description: '已分配Agent数量',
		example: 3,
		minimum: 0,
		required: false
	})
	assignedCount?: number;

	@ApiProperty({
		description: '已响应Agent数量',
		example: 2,
		minimum: 0,
		required: false
	})
	responseCount?: number;
}

export class UpdateAgentWorkStatusDto {
	@ApiProperty({
		description: '工作状态',
		enum: AgentWorkStatus,
		example: 'WORKING',
		required: true
	})
	workStatus: AgentWorkStatus;

	@ApiProperty({
		description: '执行结果',
		example: '任务已完成，详细报告如下...',
		required: false
	})
	executionResult?: string;

	@ApiProperty({
		description: '开始时间',
		example: '2023-12-15T10:30:00Z',
		required: false
	})
	startedAt?: Date;

	@ApiProperty({
		description: '完成时间',
		example: '2023-12-15T14:45:00Z',
		required: false
	})
	completedAt?: Date;

	@ApiProperty({
		description: '进度百分比',
		example: 75,
		minimum: 0,
		maximum: 100,
		required: false
	})
	progress?: number;

	@ApiProperty({
		description: '错误信息',
		example: '执行过程中遇到网络连接问题',
		required: false
	})
	errorMessage?: string;

	@ApiProperty({
		description: '执行时间（毫秒）',
		example: 15000,
		minimum: 0,
		required: false
	})
	executionTimeMs?: number;

	@ApiProperty({
		description: '重试次数',
		example: 2,
		minimum: 0,
		required: false
	})
	retryCount?: number;
}
