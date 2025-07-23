import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto, UpdateJobDto } from "../dto/job.dto";
import { JobStatus, AgentWorkStatus } from "@prisma/client";
import { parseArrayString, parseBoolean } from '../utils'
import { SqsService } from "../aws/sqs.service";
import axios from 'axios';

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
      this.prisma.job.count(),
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

	async findByWalletAddress(walletAddress: string, skip = 0, take = 10) {
		const [jobs, total] = await Promise.all([
			this.prisma.job.findMany({
				where: { walletAddress },
				skip,
				take,
				orderBy: { createdAt: 'desc' },
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
			}),
			this.prisma.job.count({
				where: { walletAddress },
			}),
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

		const matchResult = await this.matchAgents(jobId, job.allowParallelExecution ? 10 : 10, 0);
		
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

		// 异步调用 Agent 地址获取回调结果
		await this.fetchAgentResults(jobId, agents, job);

		return {
			distributionRecord,
			assignedAgents: agents,
		};
	}

	private async fetchAgentResults(jobId: string, agents: any[], job: any) {
		this.logger.log(`开始为任务 ${jobId} 调用 ${agents.length} 个 Agent`);

		for (const agent of agents) {
			const startTime = Date.now();
			try {
				// 更新 Agent 状态为工作中
				await this.updateAgentWorkStatus(jobId, agent.id, AgentWorkStatus.WORKING);
				
				this.logger.log(`正在调用 Agent: ${agent.agentName} (${agent.agentAddress})`);
				
				// 准备发送给 Agent 的任务数据
				// {
				// 	jobId: job.id,
				// 	jobTitle: job.jobTitle,
				// 	description: job.description,
				// 	deliverables: job.deliverables,
				// 	deadline: job.deadline,
				// 	tags: job.tags,
				// 	category: job.category,
				// 	skillLevel: job.skillLevel,
				// 	priority: job.priority
				// };
				const runIdList = agent.agentAddress.split('/');

				this.logger.log(`正在调用 runId: ${runIdList} (${runIdList[runIdList.length - 2]}), ${job.description}`);

				const taskData = {
					"messages": [{ "role": "user", "content": job.description }],
					"runId": runIdList[runIdList.length - 2],
					"maxRetries": 2,
					"maxSteps": 5,
					"temperature": 0.5,
					"topP": 1,
					"runtimeContext": {}
				}

				// 调用 Agent 的 API
				const response = await axios.post(agent.agentAddress, taskData, {
					timeout: 120000, // 2分钟超时
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'Aladdin-Backend/1.0'
					}
				});

				const executionTime = Date.now() - startTime;
				
				// 保存执行结果
				await this.saveAgentResult(
					jobId, 
					agent.id, 
					response.data, 
					AgentWorkStatus.COMPLETED,
					executionTime
				);

				this.logger.log(`Agent ${agent.agentName} 执行成功，耗时 ${executionTime}ms`);

			} catch (error) {
				const executionTime = Date.now() - startTime;
				const errorMessage = error.response?.data?.message || error.message || '未知错误';
				
				this.logger.error(`Agent ${agent.agentName} 执行失败: ${errorMessage}`);
				
				// 保存错误结果
				await this.saveAgentResult(
					jobId, 
					agent.id, 
					null, 
					AgentWorkStatus.FAILED,
					executionTime,
					errorMessage
				);
			}
		}

		// 检查是否所有 Agent 都已完成
		await this.checkJobCompletion(jobId);
	}

	private async updateAgentWorkStatus(jobId: string, agentId: string, status: AgentWorkStatus) {
		await this.prisma.jobDistributionAgent.updateMany({
			where: {
				agentId: agentId,
				jobDistribution: {
					jobId: jobId
				}
			},
			data: {
				workStatus: status,
				startedAt: status === AgentWorkStatus.WORKING ? new Date() : undefined,
				completedAt: (status === AgentWorkStatus.COMPLETED || status === AgentWorkStatus.FAILED) ? new Date() : undefined
			}
		});
	}

	private async saveAgentResult(
		jobId: string, 
		agentId: string, 
		result: any, 
		status: AgentWorkStatus,
		executionTime: number,
		errorMessage?: string
	) {
		const resultText = result ? JSON.stringify(result, null, 2) : null;
		
		await this.prisma.jobDistributionAgent.updateMany({
			where: {
				agentId: agentId,
				jobDistribution: {
					jobId: jobId
				}
			},
			data: {
				workStatus: status,
				executionResult: resultText,
				completedAt: new Date(),
				executionTimeMs: executionTime,
				errorMessage: errorMessage,
				progress: status === AgentWorkStatus.COMPLETED ? 100 : 0
			}
		});
	}

	private async checkJobCompletion(jobId: string) {
		// 获取任务的所有 Agent 执行状态
		const distributionRecord = await this.prisma.jobDistributionRecord.findFirst({
			where: { jobId },
			include: {
				assignedAgents: {
					include: { agent: true }
				}
			}
		});

		if (!distributionRecord) return;

		const allCompleted = distributionRecord.assignedAgents.every(
			agent => agent.workStatus === AgentWorkStatus.COMPLETED || agent.workStatus === AgentWorkStatus.FAILED
		);

		if (allCompleted) {
			const hasSuccessful = distributionRecord.assignedAgents.some(
				agent => agent.workStatus === AgentWorkStatus.COMPLETED
			);

			// 更新任务状态
			await this.prisma.job.update({
				where: { id: jobId },
				data: {
					status: hasSuccessful ? JobStatus.COMPLETED : JobStatus.CANCELLED
				}
			});

			this.logger.log(`任务 ${jobId} 已${hasSuccessful ? '完成' : '失败'}`);
		}
	}

	async getExecutionResults(jobId: string) {
		const distributionRecord = await this.prisma.jobDistributionRecord.findFirst({
			where: { jobId },
			include: {
				job: true,
				assignedAgents: {
					include: {
						agent: {
							select: {
								id: true,
								agentName: true,
								agentAddress: true,
								reputation: true,
								successRate: true,
								pricePerCall: true,
								walletAddress: true
							}
						}
					},
					orderBy: {
						assignedAt: 'asc'
					}
				}
			}
		});

		if (!distributionRecord) {
			throw new Error(`No distribution record found for job ${jobId}`);
		}

		const results = distributionRecord.assignedAgents.map(agentRecord => ({
			agent: agentRecord.agent,
			workStatus: agentRecord.workStatus,
			assignedAt: agentRecord.assignedAt,
			startedAt: agentRecord.startedAt,
			completedAt: agentRecord.completedAt,
			executionTimeMs: agentRecord.executionTimeMs,
			progress: agentRecord.progress,
			retryCount: agentRecord.retryCount,
			executionResult: agentRecord.executionResult,
			errorMessage: agentRecord.errorMessage
		}));

		const summary = {
			total: results.length,
			completed: results.filter(r => r.workStatus === AgentWorkStatus.COMPLETED).length,
			failed: results.filter(r => r.workStatus === AgentWorkStatus.FAILED).length,
			working: results.filter(r => r.workStatus === AgentWorkStatus.WORKING).length,
			assigned: results.filter(r => r.workStatus === AgentWorkStatus.ASSIGNED).length
		};

		return {
			job: {
				id: distributionRecord.job.id,
				jobTitle: distributionRecord.job.jobTitle,
				status: distributionRecord.job.status,
				createdAt: distributionRecord.job.createdAt,
				assignedAgentId: distributionRecord.assignedAgentId,
				assignedAgentName: distributionRecord.assignedAgentName,
			},
			summary,
			results
		};
	}

	/**
	 * 记录任务最终选中的Agent
	 * @param jobId 任务ID
	 * @param agentId 选中的Agent ID
	 * @returns 更新后的分发记录
	 */
	async selectFinalAgent(jobId: string, agentId: string) {
		// 检查任务是否存在
		const job = await this.prisma.job.findUnique({
			where: { id: jobId },
			include: {
				distributionRecord: {
					include: {
						assignedAgents: {
							include: {
								agent: true
							}
						}
					}
				}
			}
		});

		if (!job) {
			throw new Error(`Job with ID ${jobId} not found`);
		}

		if (!job.distributionRecord) {
			throw new Error(`No distribution record found for job ${jobId}`);
		}

		// 检查指定的Agent是否在分配列表中
		const assignedAgent = job.distributionRecord.assignedAgents.find(
			agentRecord => agentRecord.agentId === agentId
		);

		if (!assignedAgent) {
			throw new Error(`Agent with ID ${agentId} is not assigned to job ${jobId}`);
		}

		// 更新分发记录中的最终选中Agent
		const updatedRecord = await this.prisma.jobDistributionRecord.update({
			where: { id: job.distributionRecord.id },
			data: {
				assignedAgentId: agentId,
				assignedAgentName: assignedAgent.agent.agentName
			},
			include: {
				job: true,
				assignedAgents: {
					include: {
						agent: true
					}
				}
			}
		});

		this.logger.log(`任务 ${jobId} 最终选中Agent: ${assignedAgent.agent.agentName} (${agentId})`);

		return {
			distributionRecord: updatedRecord,
			selectedAgent: assignedAgent.agent,
			message: `Successfully selected agent ${assignedAgent.agent.agentName} for job ${job.jobTitle}`
		};
	}

	/**
	 * 获取任务最终选中的Agent
	 * @param jobId 任务ID
	 * @returns 最终选中的Agent信息
	 */
	async getFinalSelectedAgent(jobId: string) {
		const distributionRecord = await this.prisma.jobDistributionRecord.findFirst({
			where: { jobId },
			include: {
				job: true,
				assignedAgents: {
					include: {
						agent: true
					}
				}
			}
		});

		if (!distributionRecord) {
			throw new Error(`No distribution record found for job ${jobId}`);
		}

		// 如果有最终选中的Agent
		if (distributionRecord.assignedAgentId) {
			const selectedAgentRecord = distributionRecord.assignedAgents.find(
				agentRecord => agentRecord.agentId === distributionRecord.assignedAgentId
			);

			return {
				job: {
					id: distributionRecord.job.id,
					jobTitle: distributionRecord.job.jobTitle,
					status: distributionRecord.job.status
				},
				finalSelectedAgent: selectedAgentRecord?.agent || null,
				selectedAt: distributionRecord.assignedAgentId ? 'Already selected' : 'Not selected yet',
				allAssignedAgents: distributionRecord.assignedAgents.map(agentRecord => ({
					agent: agentRecord.agent,
					workStatus: agentRecord.workStatus,
					isSelected: agentRecord.agentId === distributionRecord.assignedAgentId
				}))
			};
		}

		return {
			job: {
				id: distributionRecord.job.id,
				jobTitle: distributionRecord.job.jobTitle,
				status: distributionRecord.job.status
			},
			finalSelectedAgent: null,
			selectedAt: 'Not selected yet',
			allAssignedAgents: distributionRecord.assignedAgents.map(agentRecord => ({
				agent: agentRecord.agent,
				workStatus: agentRecord.workStatus,
				isSelected: false
			}))
		};
	}
}
