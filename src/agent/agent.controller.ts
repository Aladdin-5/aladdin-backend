import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@ApiTags('Agent')
@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({ summary: '创建 Agent' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentService.create(createAgentDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有 Agent' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.agentService.findAll(skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个 Agent' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新 Agent' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentService.update(id, updateAgentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除 Agent' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.agentService.remove(id);
  }
} 