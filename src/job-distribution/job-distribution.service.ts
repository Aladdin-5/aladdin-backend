import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
	CreateJobDistributionDto,
	UpdateJobDistributionDto,
	UpdateAgentWorkStatusDto,
} from "../dto/job-distribution.dto";

@Injectable()
export class JobDistributionService {
	constructor(private prisma: PrismaService) {}

	async create(createJobDistributionDto: CreateJobDistributionDto) {
		const { agentIds, ...recordData } = createJobDistributionDto;

		return this.prisma.jobDistributionRecord.create({
			data: {
				...recordData,
				assignedAgents: {
					create: agentIds.map((agentId) => ({
						agentId,
					})),
				},
			},
			include: {
				assignedAgents: {
					include: {
						agent: true,
					},
				},
			},
		});
	}

	async findAll() {
		return this.prisma.jobDistributionRecord.findMany({
			include: {
				job: true,
				assignedAgents: {
					include: {
						agent: true,
					},
				},
			},
		});
	}

	async findOne(id: string) {
		return this.prisma.jobDistributionRecord.findUnique({
			where: { id },
			include: {
				job: true,
				assignedAgents: {
					include: {
						agent: true,
					},
				},
			},
		});
	}

	async findByJobId(jobId: string) {
		return this.prisma.jobDistributionRecord.findUnique({
			where: { jobId },
			include: {
				job: true,
				assignedAgents: {
					include: {
						agent: true,
					},
				},
			},
		});
	}

	async update(id: string, updateJobDistributionDto: UpdateJobDistributionDto) {
		return this.prisma.jobDistributionRecord.update({
			where: { id },
			data: updateJobDistributionDto,
		});
	}

	async updateAgentWorkStatus(
		distributionId: string,
		agentId: string,
		updateDto: UpdateAgentWorkStatusDto,
	) {
		return this.prisma.jobDistributionAgent.update({
			where: {
				jobDistributionId_agentId: {
					jobDistributionId: distributionId,
					agentId,
				},
			},
			data: updateDto,
		});
	}

	async getAgentWorkStatus(distributionId: string, agentId: string) {
		return this.prisma.jobDistributionAgent.findUnique({
			where: {
				jobDistributionId_agentId: {
					jobDistributionId: distributionId,
					agentId,
				},
			},
			include: {
				agent: true,
				jobDistribution: true,
			},
		});
	}

	async getAgentsByDistribution(distributionId: string) {
		return this.prisma.jobDistributionAgent.findMany({
			where: { jobDistributionId: distributionId },
			include: {
				agent: true,
			},
		});
	}

	async remove(id: string) {
		return this.prisma.jobDistributionRecord.delete({
			where: { id },
		});
	}
}
