import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto, UpdateAgentDto } from '../dto/agent.dto';

@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentService.create(createAgentDto);
  }

  @Get()
  findAll() {
    return this.agentService.findAll();
  }

  @Get('by-wallet/:walletAddress')
  findByWalletAddress(@Param('walletAddress') walletAddress: string) {
    return this.agentService.findByWalletAddress(walletAddress);
  }

  @Get('by-tags')
  findByTags(@Query('tags') tags: string) {
    const tagArray = tags.split(',');
    return this.agentService.findByTags(tagArray);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentService.update(id, updateAgentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentService.remove(id);
  }
}