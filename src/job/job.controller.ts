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