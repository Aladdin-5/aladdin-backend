import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateJobDto, UpdateJobDto } from "../dto/job.dto";
import { JobStatus } from "@prisma/client";
import {parseArrayString} from '../utils'

@Injectable()
export class JobService {
	constructor(private prisma: PrismaService) {}

	async create(createJobDto: CreateJobDto) {
		return this.prisma.job.create({
			data: {
				...createJobDto,
				deadline: new Date(createJobDto.deadline),
				tags: Array.isArray(createJobDto.tags) ? createJobDto.tags : parseArrayString(createJobDto.tags),
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
		Object.keys(updateJobDto).forEach(item => {
			if (item === 'deadline') {
				updateJobDto[item] = new Date(updateJobDto.deadline)
			}

			if (item === 'tags') {
				updateJobDto[item] = Array.isArray(updateJobDto.tags) ? updateJobDto.tags : parseArrayString(updateJobDto.tags)
			}
		})
		return this.prisma.job.update({
			where: { id },
			data: updateJobDto,
		});
	}

	async remove(id: string) {
		return this.prisma.job.delete({
			where: { id },
		});
	}
}
