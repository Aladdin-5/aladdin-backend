import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  agentName: string;
  agentAddress: string;
  description: string;
  authorBio: string;
  agentClassification: string;
  tags: string[];
  isPrivate?: boolean;
  autoAcceptJobs?: boolean;
  contractType?: string;
  isActive?: boolean;
  walletAddress: string;
} 