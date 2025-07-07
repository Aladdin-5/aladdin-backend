import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async create(createAgentDto: CreateAgentDto) {
    return this.prisma.agent.create({
      data: createAgentDto,
    });
  }

  async findAll(skip = 0, take = 10) {
    const [agents, total] = await Promise.all([
      this.prisma.agent.findMany({
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
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        jobDistributions: {
          include: {
            jobDistribution: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    try {
      return await this.prisma.agent.update({
        where: { id },
        data: updateAgentDto,
      });
    } catch (error) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.agent.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
  }
} 
