import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto, UpdateJobDto } from '../dto/job.dto';
import { JobStatus } from '@prisma/client';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  // @Get()
  // findAll() {
  //   return this.jobService.findAll();
  // }

  @Get('page')
  findByPage(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.jobService.findByPage(skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
  }

  @Get('by-status/:status')
  findByStatus(@Param('status') status: JobStatus) {
    return this.jobService.findByStatus(status);
  }

  @Get('by-wallet/:walletAddress')
  findByWalletAddress(@Param('walletAddress') walletAddress: string) {
    return this.jobService.findByWalletAddress(walletAddress);
  }

  @Get('by-category/:category')
  findByCategory(@Param('category') category: string) {
    return this.jobService.findByCategory(category);
  }

  @Get('by-tags')
  findByTags(@Query('tags') tags: string) {
    const tagArray = tags.split(',');
    return this.jobService.findByTags(tagArray);
  }

  @Get(':id/match-agents')
  matchAgents(@Param('id') id: string, @Query('limit') limit?: string, @Query('minScore') minScore?: string) {
    const parsedLimit = limit ? parseInt(limit) : 50;
    const parsedMinScore = minScore ? parseFloat(minScore) : 0;
    
    return this.jobService.matchAgents(id, parsedLimit, parsedMinScore);
  }

  @Post(':id/auto-assign')
  autoAssignJob(@Param('id') id: string) {
    return this.jobService.autoAssignJob(id);
  }

  @Post(':id/assign-agents')
  assignJobToAgents(@Param('id') id: string, @Body() body: { agentIds: string[] }) {
    return this.jobService.assignJobToAgents(id, body.agentIds.map(id => ({ id })));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobService.remove(id);
  }
}