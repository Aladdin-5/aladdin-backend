import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto, UpdateJobDto } from "../dto/job.dto";
import { JobStatus } from "@prisma/client";
import { parseArrayString, parseBoolean } from '../utils'

@Injectable()
export class JobService {
	constructor(private prisma: PrismaService) {}

	async create(createJobDto: CreateJobDto) {
		return this.prisma.job.create({
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
    const [agents, total] = await Promise.all([
      this.prisma.job.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count(),
    ]);

    return {
      agents,
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
}
