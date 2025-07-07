import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAgentDto, UpdateAgentDto } from "../dto/agent.dto";

@Injectable()
export class AgentService {
	constructor(private prisma: PrismaService) {}

	async create(createAgentDto: CreateAgentDto) {
		return this.prisma.agent.create({
			data: createAgentDto,
		});
	}

	async findAll() {
		return this.prisma.agent.findMany({
			include: {
				jobDistributions: {
					include: {
						jobDistribution: true,
					},
				},
			},
		});
	}

	async findOne(id: string) {
		return this.prisma.agent.findUnique({
			where: { id },
			include: {
				jobDistributions: {
					include: {
						jobDistribution: true,
					},
				},
			},
		});
	}

	async findByWalletAddress(walletAddress: string) {
		return this.prisma.agent.findMany({
			where: { walletAddress },
			include: {
				jobDistributions: {
					include: {
						jobDistribution: true,
					},
				},
			},
		});
	}

	async findByTags(tags: string[]) {
		return this.prisma.agent.findMany({
			where: {
				tags: {
					hasSome: tags,
				},
			},
			include: {
				jobDistributions: {
					include: {
						jobDistribution: true,
					},
				},
			},
		});
	}

	async update(id: string, updateAgentDto: UpdateAgentDto) {
		return this.prisma.agent.update({
			where: { id },
			data: updateAgentDto,
		});
	}

	async remove(id: string) {
		return this.prisma.agent.delete({
			where: { id },
		});
	}
}
