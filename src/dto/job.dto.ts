import { JobStatus } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
	@ApiProperty({
		description: '任务标题',
		example: '开发一个AI聊天机器人',
		required: true
	})
	jobTitle: string;

	@ApiProperty({
		description: '任务分类',
		example: '人工智能',
		required: true
	})
	category: string;

	@ApiProperty({
		description: '任务描述',
		example: '需要开发一个基于GPT的聊天机器人，能够回答用户问题并提供帮助',
		required: true
	})
	description: string;

	@ApiProperty({
		description: '交付物描述',
		example: '完整的聊天机器人代码和部署文档',
		required: true
	})
	deliverables: string;

	@ApiProperty({
		description: '预算',
		example: { min: 1000, max: 2000 },
		required: true
	})
	budget: any;

	@ApiProperty({
		description: '最大预算',
		example: 2000,
		required: false
	})
	maxBudget?: number;

	@ApiProperty({
		description: '截止日期',
		example: '2023-12-31T23:59:59Z',
		required: true
	})
	deadline: Date;

	@ApiProperty({
		description: '支付类型',
		example: 'fixed',
		required: true
	})
	paymentType: string;

	@ApiProperty({
		description: '优先级',
		example: 'high',
		required: true
	})
	priority: string;

	@ApiProperty({
		description: '技能等级要求',
		example: 'expert',
		required: true
	})
	skillLevel: string;

	@ApiProperty({
		description: '标签列表',
		example: ['AI', 'ChatGPT', '机器学习'],
		type: [String],
		required: true
	})
	tags: string[];

	@ApiProperty({
		description: '是否自动分配',
		example: false,
		default: false,
		required: false
	})
	autoAssign?: boolean;

	@ApiProperty({
		description: '是否允许竞标',
		example: true,
		default: true,
		required: false
	})
	allowBidding?: boolean;

	@ApiProperty({
		description: '是否允许并行执行',
		example: false,
		default: false,
		required: false
	})
	allowParallelExecution?: boolean;

	@ApiProperty({
		description: '是否启用托管',
		example: true,
		default: true,
		required: false
	})
	escrowEnabled?: boolean;

	@ApiProperty({
		description: '是否公开',
		example: true,
		default: true,
		required: false
	})
	isPublic?: boolean;

	@ApiProperty({
		description: '钱包地址',
		example: '0x1234567890abcdef',
		required: true
	})
	walletAddress: string;
}

export class UpdateJobDto {
	@ApiProperty({
		description: '任务标题',
		example: '开发一个高级AI聊天机器人',
		required: false
	})
	jobTitle?: string;

	@ApiProperty({
		description: '任务分类',
		example: '人工智能',
		required: false
	})
	category?: string;

	@ApiProperty({
		description: '任务描述',
		example: '需要开发一个基于GPT-4的高级聊天机器人，能够回答用户问题并提供帮助',
		required: false
	})
	description?: string;

	@ApiProperty({
		description: '交付物描述',
		example: '完整的聊天机器人代码、部署文档和用户手册',
		required: false
	})
	deliverables?: string;

	@ApiProperty({
		description: '预算',
		example: { min: 1500, max: 2500 },
		required: false
	})
	budget?: any;

	@ApiProperty({
		description: '最大预算',
		example: 2500,
		required: false
	})
	maxBudget?: number;

	@ApiProperty({
		description: '截止日期',
		example: '2024-01-31T23:59:59Z',
		required: false
	})
	deadline?: Date;

	@ApiProperty({
		description: '支付类型',
		example: 'milestone',
		required: false
	})
	paymentType?: string;

	@ApiProperty({
		description: '优先级',
		example: 'urgent',
		required: false
	})
	priority?: string;

	@ApiProperty({
		description: '技能等级要求',
		example: 'expert',
		required: false
	})
	skillLevel?: string;

	@ApiProperty({
		description: '标签列表',
		example: ['AI', 'GPT-4', '机器学习', 'NLP'],
		type: [String],
		required: false
	})
	tags?: string[];

	@ApiProperty({
		description: '任务状态',
		enum: JobStatus,
		example: 'IN_PROGRESS',
		required: false
	})
	status?: JobStatus;

	@ApiProperty({
		description: '是否自动分配',
		example: true,
		required: false
	})
	autoAssign?: boolean;

	@ApiProperty({
		description: '是否允许竞标',
		example: false,
		required: false
	})
	allowBidding?: boolean;

	@ApiProperty({
		description: '是否允许并行执行',
		example: true,
		required: false
	})
	allowParallelExecution?: boolean;

	@ApiProperty({
		description: '是否启用托管',
		example: true,
		required: false
	})
	escrowEnabled?: boolean;

	@ApiProperty({
		description: '是否公开',
		example: false,
		required: false
	})
	isPublic?: boolean;
}
