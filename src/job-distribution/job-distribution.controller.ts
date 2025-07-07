import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobDistributionService } from './job-distribution.service';
import { CreateJobDistributionDto, UpdateJobDistributionDto, UpdateAgentWorkStatusDto } from '../dto/job-distribution.dto';

@Controller('job-distributions')
export class JobDistributionController {
  constructor(private readonly jobDistributionService: JobDistributionService) {}

  @Post()
  create(@Body() createJobDistributionDto: CreateJobDistributionDto) {
    return this.jobDistributionService.create(createJobDistributionDto);
  }

  @Get()
  findAll() {
    return this.jobDistributionService.findAll();
  }

  @Get('by-job/:jobId')
  findByJobId(@Param('jobId') jobId: string) {
    return this.jobDistributionService.findByJobId(jobId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobDistributionService.findOne(id);
  }

  @Get(':id/agents')
  getAgentsByDistribution(@Param('id') id: string) {
    return this.jobDistributionService.getAgentsByDistribution(id);
  }

  @Get(':distributionId/agents/:agentId/status')
  getAgentWorkStatus(@Param('distributionId') distributionId: string, @Param('agentId') agentId: string) {
    return this.jobDistributionService.getAgentWorkStatus(distributionId, agentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDistributionDto: UpdateJobDistributionDto) {
    return this.jobDistributionService.update(id, updateJobDistributionDto);
  }

  @Patch(':distributionId/agents/:agentId/status')
  updateAgentWorkStatus(
    @Param('distributionId') distributionId: string,
    @Param('agentId') agentId: string,
    @Body() updateDto: UpdateAgentWorkStatusDto
  ) {
    return this.jobDistributionService.updateAgentWorkStatus(distributionId, agentId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobDistributionService.remove(id);
  }
}