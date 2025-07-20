import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto, UpdateJobDto } from "../dto/job.dto";
import { JobStatus } from "@prisma/client";
import { parseArrayString, parseBoolean } from '../utils'
import { SqsService } from "../aws/sqs.service";

@Injectable()
export class JobService {
	private readonly logger = new Logger(JobService.name);
	
	constructor(
		private prisma: PrismaService,
		private sqsService: SqsService
	) {}

	async create(createJobDto: CreateJobDto) {
		const job = await this.prisma.job.create({
			data: {
				...createJobDto,
				deadline: new Date(createJobDto.deadline),
				tags: Array.isArray(createJobDto.tags) ? createJobDto.tags : parseArrayString(createJobDto.tags),
				autoAssign: parseBoolean(createJobDto.autoAssign),
				allowBidding: parseBoolean(createJobDto.allowBidding),
				allowParallelExecution: parseBoolean(createJobDto.allowParallelExecution),
				escrowEnabled: parseBoolean(createJobDto.escrowEnabled),
				isPublic: parseBoolean(createJobDto.isPublic),
			},
		});

		// 发送Job创建消息到SQS队列
		try {
			this.logger.log(`准备发送任务创建消息到SQS队列: jobId=${job.id}, jobTitle=${job.jobTitle || '未命名'}`);
			const messageId = await this.sqsService.sendJobCreatedMessage(job.id);
			this.logger.log(`成功发送任务创建消息到SQS队列: jobId=${job.id}, messageId=${messageId}`);
		} catch (error) {
			this.logger.error(`发送任务创建消息到SQS队列失败: jobId=${job.id}, 错误=${error.message}`, error.stack);
			// 不阻止正常流程，即使SQS发送失败也返回创建的Job
		}

		return job;
	}

	async findAll() {
		return this.prisma.job.findMany({
			include: {
				distributionRecord: {
					include: {
						assignedAgents: {
							include: {
								agent: true,
							},
						},
					},
				},
			},
		});
	}

	async findByPage(skip = 0, take = 10) {
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count(),
    ]);

    return {
      jobs,
      meta: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

	async findOne(id: string) {
		return this.prisma.job.findUnique({
			where: { id },
			include: {
				distributionRecord: {
					include: {
						assignedAgents: {
							include: {
								agent: true,
							},
						},
					},
				},
			},
		});
	}

	async findByStatus(status: JobStatus) {
		return this.prisma.job.findMany({
			where: { status },
			include: {
				distributionRecord: {
					include: {
						assignedAgents: {
							include: {
								agent: true,
							},
						},
					},
				},
			},
		});
	}

	async findByWalletAddress(walletAddress: string) {
		return this.prisma.job.findMany({
			where: { walletAddress },
			include: {
				distributionRecord: {
					include: {
						assignedAgents: {
							include: {
								agent: true,
							},
						},
					},
				},
			},
		});
	}

	async findByCategory(category: string) {
		return this.prisma.job.findMany({
			where: { category },
			include: {
				distributionRecord: {
					include: {
						assignedAgents: {
							include: {
								agent: true,
							},
						},
					},
				},
			},
		});
	}

	async findByTags(tags: string[]) {
		return this.prisma.job.findMany({
			where: {
				tags: {
					hasSome: tags,
				},
			},
			include: {
				distributionRecord: {
					include: {
						assignedAgents: {
							include: {
								agent: true,
							},
						},
					},
				},
			},
		});
	}

	async update(id: string, updateJobDto: UpdateJobDto) {
		// 处理数据转换
		const data = { ...updateJobDto };
		
		// 处理日期字段
		if (data.deadline) {
			data.deadline = new Date(data.deadline);
		}
		
		// 处理数组字段
		if (data.tags) {
			data.tags = Array.isArray(data.tags) ? data.tags : parseArrayString(data.tags);
		}
		
		// 处理布尔字段
		if (data.autoAssign !== undefined) {
			data.autoAssign = parseBoolean(data.autoAssign);
		}
		if (data.allowBidding !== undefined) {
			data.allowBidding = parseBoolean(data.allowBidding);
		}
		if (data.allowParallelExecution !== undefined) {
			data.allowParallelExecution = parseBoolean(data.allowParallelExecution);
		}
		if (data.escrowEnabled !== undefined) {
			data.escrowEnabled = parseBoolean(data.escrowEnabled);
		}
		if (data.isPublic !== undefined) {
			data.isPublic = parseBoolean(data.isPublic);
		}
		
		return this.prisma.job.update({
			where: { id },
			data,
		});
	}

	async remove(id: string) {
		return this.prisma.job.delete({
			where: { id },
		});
	}

	async matchAgents(jobId: string, limit: number = 50, minScore: number = 0) {
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
		});

		if (!job) {
			throw new Error(`Job with ID ${jobId} not found`);
		}

		const availableAgents = await this.prisma.agent.findMany({
			where: {
				isActive: true,
				autoAcceptJobs: true,
				isPrivate: false,
			},
		});

		const matchedAgents = this.calculateMatches(job, availableAgents);
		const filteredAgents = matchedAgents.filter(agent => agent.matchScore >= minScore);
		const shuffledAgents = this.shuffleArray(filteredAgents);
		
		return {
			total: filteredAgents.length,
			agents: shuffledAgents.slice(0, limit),
			hasMore: filteredAgents.length > limit,
			matchCriteria: {
				category: job.category,
				tags: job.tags,
				skillLevel: job.skillLevel,
				priority: job.priority,
				minScore: minScore,
				limit: limit
			}
		};
	}

	private calculateMatches(job: any, agents: any[]) {
		return agents.map(agent => {
			let score = 0;
			let priceMatch = false;
			let agentPrice = 0;
			
			const categoryMatch = job.category === agent.agentClassification;
			if (categoryMatch) {
				score += 50;
			}
			
			const tagIntersection = job.tags.filter(tag => agent.tags.includes(tag));
			const tagScore = (tagIntersection.length / Math.max(job.tags.length, 1)) * 30;
			score += tagScore;
			
			// 价格匹配逻辑
			let jobMinBudget = 0;
			let jobMaxBudget = 0;
			
			// 解析 job 的 budget 字段
			if (typeof job.budget === 'object' && job.budget !== null) {
				jobMinBudget = job.budget.min || 0;
				jobMaxBudget = job.budget.max || job.maxBudget || Infinity;
			} else if (typeof job.budget === 'number') {
				jobMinBudget = job.budget;
				jobMaxBudget = job.maxBudget || job.budget;
			}
			
			// 根据 agent 的计费模式获取价格
			agentPrice = agent.pricePerCall;
			
			// 检查价格是否在预算范围内
			if (agentPrice > 0 && agentPrice >= jobMinBudget && agentPrice <= jobMaxBudget) {
				priceMatch = true;
				// 价格匹配加分：越接近预算下限，分数越高
				const priceRange = jobMaxBudget - jobMinBudget;
				if (priceRange > 0) {
					const priceScore = ((jobMaxBudget - agentPrice) / priceRange) * 20;
					score += priceScore;
				} else {
					score += 20; // 完全匹配加20分
				}
			}
			
			const reputationScore = agent.reputation * 10;
			score += reputationScore;
			
			const successRateScore = agent.successRate * 10;
			score += successRateScore;

			return {
				...agent,
				matchScore: score,
				categoryMatch,
				tagMatches: tagIntersection,
				tagMatchCount: tagIntersection.length,
				priceMatch,
				agentPrice,
				jobBudgetRange: { min: jobMinBudget, max: jobMaxBudget },
			};
		}).filter(agent => agent.matchScore > 0 && agent.priceMatch) // 只返回价格匹配的 agent
		  .sort((a, b) => b.matchScore - a.matchScore);
	}

	private shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	async autoAssignJob(jobId: string) {
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				distributionRecord: true,
			},
		});

		if (!job) {
			throw new Error(`Job with ID ${jobId} not found`);
		}

		if (job.distributionRecord) {
			throw new Error(`Job ${jobId} has already been distributed`);
		}

		if (!job.autoAssign) {
			throw new Error(`Job ${jobId} is not configured for auto-assignment`);
		}

		const matchResult = await this.matchAgents(jobId, job.allowParallelExecution ? 10 : 1, 30);
		
		if (matchResult.agents.length === 0) {
			throw new Error(`No suitable agents found for job ${jobId}`);
		}

		return this.assignJobToAgents(jobId, matchResult.agents);
	}

	async assignJobToAgents(jobId: string, agents: any[]) {
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				distributionRecord: true,
			},
		});

		if (!job) {
			throw new Error(`Job with ID ${jobId} not found`);
		}

		if (job.distributionRecord) {
			throw new Error(`Job ${jobId} has already been distributed`);
		}

		if (agents.length === 0) {
			throw new Error(`No agents provided for assignment`);
		}

		const distributionRecord = await this.prisma.jobDistributionRecord.create({
			data: {
				jobId: job.id,
				jobName: job.jobTitle,
				matchCriteria: {
					category: job.category,
					tags: job.tags,
					skillLevel: job.skillLevel,
					priority: job.priority,
				},
				totalAgents: agents.length,
				assignedAgentId: agents[0].id,
				assignedAgentName: agents[0].agentName,
			},
		});

		const agentDistributions = agents.map(agent => ({
			jobDistributionId: distributionRecord.id,
			agentId: agent.id,
		}));

		await this.prisma.jobDistributionAgent.createMany({
			data: agentDistributions,
		});

		await this.prisma.job.update({
			where: { id: jobId },
			data: { status: JobStatus.DISTRIBUTED },
		});

		return {
			distributionRecord,
			assignedAgents: agents,
		};
	}
}
