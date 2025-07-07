import { CreateAgentDto } from './create-agent.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateAgentDto implements Partial<CreateAgentDto> {
  agentName?: string;
  agentAddress?: string;
  description?: string;
  authorBio?: string;
  agentClassification?: string;
  tags?: string[];
  isPrivate?: boolean;
  autoAcceptJobs?: boolean;
  contractType?: string;
  isActive?: boolean;
  walletAddress?: string;
  reputation?: number;
  successRate?: number;
  totalJobsCompleted?: number;
} 