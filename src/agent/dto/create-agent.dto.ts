import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({
    description: 'Agent名称',
    example: 'GPT-4 Agent',
    required: true
  })
  agentName: string;

  @ApiProperty({
    description: 'Agent地址（API端点）',
    example: 'https://api.example.com/agent',
    required: true
  })
  agentAddress: string;

  @ApiProperty({
    description: 'Agent描述',
    example: '这是一个强大的AI助手，可以帮助解决各种问题',
    required: true
  })
  description: string;

  @ApiProperty({
    description: '作者简介',
    example: '资深AI研发工程师，专注于大语言模型应用',
    required: true
  })
  authorBio: string;

  @ApiProperty({
    description: 'Agent分类',
    example: 'AI助手',
    required: true
  })
  agentClassification: string;

  @ApiProperty({
    description: '标签列表',
    example: ['AI', '自然语言处理', '问答'],
    type: [String],
    required: true
  })
  tags: string[];

  @ApiProperty({
    description: '是否私有',
    example: true,
    default: true,
    required: false
  })
  isPrivate?: boolean;

  @ApiProperty({
    description: '是否自动接受任务',
    example: true,
    default: true,
    required: false
  })
  autoAcceptJobs?: boolean;

  @ApiProperty({
    description: '合约类型',
    example: 'result',
    default: 'result',
    required: false
  })
  contractType?: string;

  @ApiProperty({
    description: '是否激活',
    example: true,
    default: true,
    required: false
  })
  isActive?: boolean;

  @ApiProperty({
    description: '钱包地址',
    example: '0x1234567890abcdef',
    required: true
  })
  walletAddress: string;
} 