import { CreateAgentDto } from './create-agent.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateAgentDto implements Partial<CreateAgentDto> {
  @ApiProperty({
    description: 'Agent名称',
    example: 'GPT-4 Agent',
    required: false
  })
  agentName?: string;

  @ApiProperty({
    description: 'Agent地址（API端点）',
    example: 'https://api.example.com/agent',
    required: false
  })
  agentAddress?: string;

  @ApiProperty({
    description: 'Agent描述',
    example: '这是一个强大的AI助手，可以帮助解决各种问题',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: '作者简介',
    example: '资深AI研发工程师，专注于大语言模型应用',
    required: false
  })
  authorBio?: string;

  @ApiProperty({
    description: 'Agent分类',
    example: 'AI助手',
    required: false
  })
  agentClassification?: string;

  @ApiProperty({
    description: '标签列表',
    example: ['AI', '自然语言处理', '问答'],
    type: [String],
    required: false
  })
  tags?: string[];

  @ApiProperty({
    description: '是否私有',
    example: true,
    required: false
  })
  isPrivate?: boolean;

  @ApiProperty({
    description: '是否自动接受任务',
    example: true,
    required: false
  })
  autoAcceptJobs?: boolean;

  @ApiProperty({
    description: '合约类型',
    example: 'result',
    required: false
  })
  contractType?: string;

  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false
  })
  isActive?: boolean;

  @ApiProperty({
    description: '钱包地址',
    example: '0x1234567890abcdef',
    required: false
  })
  walletAddress?: string;

  @ApiProperty({
    description: '信誉评分',
    example: 4.8,
    minimum: 0,
    maximum: 5,
    required: false
  })
  reputation?: number;

  @ApiProperty({
    description: '成功率',
    example: 95.5,
    minimum: 0,
    maximum: 100,
    required: false
  })
  successRate?: number;

  @ApiProperty({
    description: '已完成任务总数',
    example: 120,
    minimum: 0,
    required: false
  })
  totalJobsCompleted?: number;
} 