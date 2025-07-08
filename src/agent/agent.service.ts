import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { parseArrayString, parseBoolean } from '../utils'

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async create(createAgentDto: CreateAgentDto) {
    // 转换 boolean 字段
    const data = {
      ...createAgentDto,
      tags: Array.isArray(createAgentDto.tags) ? createAgentDto.tags : parseArrayString(createAgentDto.tags),
      isPrivate: parseBoolean(createAgentDto.isPrivate),
      autoAcceptJobs: parseBoolean(createAgentDto.autoAcceptJobs),
      isActive: parseBoolean(createAgentDto.isActive),
    };
    
    return this.prisma.agent.create({ data });
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
    // 处理数据转换
    const data = { ...updateAgentDto };
    
    // 处理数组字段
    if (data.tags) {
      data.tags = Array.isArray(data.tags) ? data.tags : parseArrayString(data.tags);
    }
    
    // 处理布尔字段
    if (data.isPrivate !== undefined) {
      data.isPrivate = parseBoolean(data.isPrivate);
    }
    if (data.autoAcceptJobs !== undefined) {
      data.autoAcceptJobs = parseBoolean(data.autoAcceptJobs);
    }
    if (data.isActive !== undefined) {
      data.isActive = parseBoolean(data.isActive);
    }
    
    try {
      return await this.prisma.agent.update({
        where: { id },
        data,
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
