import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto, UpdateJobDto } from '../dto/job.dto';
import { JobStatus } from '@prisma/client';

@ApiTags('Job')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiOperation({ summary: '创建任务' })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  // @Get()
  // findAll() {
  //   return this.jobService.findAll();
  // }

  @Get('page')
  @ApiOperation({ summary: '分页获取任务' })
  @ApiQuery({ name: 'skip', description: '跳过数量', required: false, type: Number })
  @ApiQuery({ name: 'take', description: '获取数量', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByPage(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.jobService.findByPage(skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: '按状态获取任务' })
  @ApiParam({ name: 'status', description: '任务状态', enum: JobStatus })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByStatus(@Param('status') status: JobStatus) {
    return this.jobService.findByStatus(status);
  }

  @Get('by-wallet/:walletAddress')
  @ApiOperation({ summary: '按钱包地址获取任务' })
  @ApiParam({ name: 'walletAddress', description: '钱包地址' })
  @ApiQuery({ name: 'skip', description: '跳过数量', required: false, type: Number })
  @ApiQuery({ name: 'take', description: '获取数量', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByWalletAddress(
    @Param('walletAddress') walletAddress: string,
    @Query('skip') skip?: string, 
    @Query('take') take?: string
  ) {
    return this.jobService.findByWalletAddress(
      walletAddress, 
      skip ? parseInt(skip) : 0, 
      take ? parseInt(take) : 10
    );
  }

  @Get('by-category/:category')
  @ApiOperation({ summary: '按分类获取任务' })
  @ApiParam({ name: 'category', description: '分类名称' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByCategory(@Param('category') category: string) {
    return this.jobService.findByCategory(category);
  }

  @Get('by-tags')
  @ApiOperation({ summary: '按标签获取任务' })
  @ApiQuery({ name: 'tags', description: '标签列表，逗号分隔', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByTags(@Query('tags') tags: string) {
    const tagArray = tags.split(',');
    return this.jobService.findByTags(tagArray);
  }

  @Get(':id/match-agents')
  @ApiOperation({ summary: '匹配任务合适的Agent' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiQuery({ name: 'limit', description: '限制数量', required: false, type: Number })
  @ApiQuery({ name: 'minScore', description: '最低匹配分数', required: false, type: Number })
  @ApiResponse({ status: 200, description: '匹配成功' })
  matchAgents(@Param('id') id: string, @Query('limit') limit?: string, @Query('minScore') minScore?: string) {
    const parsedLimit = limit ? parseInt(limit) : 50;
    const parsedMinScore = minScore ? parseFloat(minScore) : 0;

    return this.jobService.matchAgents(id, parsedLimit, parsedMinScore);
  }

  @Post(':id/auto-assign')
  @ApiOperation({ summary: '自动分配任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '分配成功' })
  autoAssignJob(@Param('id') id: string) {
    return this.jobService.autoAssignJob(id);
  }

  @Post(':id/assign-agents')
  @ApiOperation({ summary: '将任务分配给指定Agent' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      agentIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Agent ID列表'
      }
    }
  }})
  @ApiResponse({ status: 200, description: '分配成功' })
  assignJobToAgents(@Param('id') id: string, @Body() body: { agentIds: string[] }) {
    return this.jobService.assignJobToAgents(id, body.agentIds.map(id => ({ id })));
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiBody({ type: UpdateJobDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto);
  }

  @Get(':id/execution-results')
  @ApiOperation({ summary: '获取任务执行结果' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getExecutionResults(@Param('id') id: string) {
    return this.jobService.getExecutionResults(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.jobService.remove(id);
  }
}