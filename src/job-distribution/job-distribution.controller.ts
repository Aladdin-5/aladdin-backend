import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JobDistributionService } from './job-distribution.service';
import { CreateJobDistributionDto, UpdateJobDistributionDto, UpdateAgentWorkStatusDto } from '../dto/job-distribution.dto';

@ApiTags('JobDistribution')
@Controller('job-distributions')
export class JobDistributionController {
  constructor(private readonly jobDistributionService: JobDistributionService) {}

  @Post()
  @ApiOperation({ summary: '创建任务分发记录' })
  @ApiBody({ type: CreateJobDistributionDto })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createJobDistributionDto: CreateJobDistributionDto) {
    return this.jobDistributionService.create(createJobDistributionDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有任务分发记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll() {
    return this.jobDistributionService.findAll();
  }

  @Get('by-job/:jobId')
  @ApiOperation({ summary: '按任务ID获取分发记录' })
  @ApiParam({ name: 'jobId', description: '任务ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByJobId(@Param('jobId') jobId: string) {
    return this.jobDistributionService.findByJobId(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个分发记录' })
  @ApiParam({ name: 'id', description: '分发记录ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.jobDistributionService.findOne(id);
  }

  @Get(':id/agents')
  @ApiOperation({ summary: '获取分发记录中的Agent列表' })
  @ApiParam({ name: 'id', description: '分发记录ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getAgentsByDistribution(@Param('id') id: string) {
    return this.jobDistributionService.getAgentsByDistribution(id);
  }

  @Get(':distributionId/agents/:agentId/status')
  @ApiOperation({ summary: '获取Agent的工作状态' })
  @ApiParam({ name: 'distributionId', description: '分发记录ID' })
  @ApiParam({ name: 'agentId', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getAgentWorkStatus(@Param('distributionId') distributionId: string, @Param('agentId') agentId: string) {
    return this.jobDistributionService.getAgentWorkStatus(distributionId, agentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新分发记录' })
  @ApiParam({ name: 'id', description: '分发记录ID' })
  @ApiBody({ type: UpdateJobDistributionDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateJobDistributionDto: UpdateJobDistributionDto) {
    return this.jobDistributionService.update(id, updateJobDistributionDto);
  }

  @Patch(':distributionId/agents/:agentId/status')
  @ApiOperation({ summary: '更新Agent工作状态' })
  @ApiParam({ name: 'distributionId', description: '分发记录ID' })
  @ApiParam({ name: 'agentId', description: 'Agent ID' })
  @ApiBody({ type: UpdateAgentWorkStatusDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateAgentWorkStatus(
    @Param('distributionId') distributionId: string,
    @Param('agentId') agentId: string,
    @Body() updateDto: UpdateAgentWorkStatusDto
  ) {
    return this.jobDistributionService.updateAgentWorkStatus(distributionId, agentId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分发记录' })
  @ApiParam({ name: 'id', description: '分发记录ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.jobDistributionService.remove(id);
  }
}