import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { 
  SQSClient, 
  SendMessageCommand,
  SendMessageCommandInput 
} from '@aws-sdk/client-sqs';
import { 
  SSMClient, 
  GetParameterCommand 
} from '@aws-sdk/client-ssm';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private sqsClient: SQSClient;
  private ssmClient: SSMClient;
  private sqsUrl: string | null = null;

  constructor(private configService: ConfigService) {
    const region = this.configService.awsRegion;
    this.sqsClient = new SQSClient({ region });
    this.ssmClient = new SSMClient({ region });
  }

  /**
   * 获取SQS队列URL
   */
  async getSqsUrl(): Promise<string> {
    if (this.sqsUrl) {
      return this.sqsUrl;
    }

    try {
      const paramName = this.configService.jobsSqsUrlParameter;
      const command = new GetParameterCommand({
        Name: paramName,
      });
      
      const response = await this.ssmClient.send(command);
      this.logger.debug(`SSM参数 ${paramName} 值: ${response.Parameter?.Value}`);
      if (!response.Parameter?.Value) {
        throw new Error(`Parameter ${paramName} not found or has no value`);
      }
      
      this.sqsUrl = response.Parameter.Value;
      return this.sqsUrl;
    } catch (error) {
      this.logger.error(`Failed to get SQS URL from SSM: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 发送消息到SQS队列
   * @param messageBody 消息内容
   * @param messageAttributes 消息属性
   */
  async sendMessage(messageBody: string, messageAttributes?: Record<string, any>): Promise<string> {
    try {
      const queueUrl = await this.getSqsUrl();
      
      const params: SendMessageCommandInput = {
        QueueUrl: queueUrl,
        MessageBody: messageBody,
      };
      
      if (messageAttributes) {
        const formattedAttributes = {};
        
        Object.entries(messageAttributes).forEach(([key, value]) => {
          let dataType = 'String';
          
          if (typeof value === 'number') {
            dataType = 'Number';
            value = value.toString();
          }
          
          formattedAttributes[key] = {
            DataType: dataType,
            StringValue: value,
          };
        });
        
        params.MessageAttributes = formattedAttributes;
      }
      
      const command = new SendMessageCommand(params);
      const result = await this.sqsClient.send(command);
      
      this.logger.debug(`Message sent to SQS: ${result.MessageId}`);
      return result.MessageId;
    } catch (error) {
      this.logger.error(`Failed to send message to SQS: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 发送Job创建消息到SQS队列
   * @param jobId 任务ID
   */
  async sendJobCreatedMessage(jobId: string): Promise<string> {
    this.logger.debug(`构建任务创建消息: jobId=${jobId}`);
    
    const messageBody = JSON.stringify({
      type: 'JOB_CREATED',
      data: { jobId },
      timestamp: new Date().toISOString(),
    });
    
    this.logger.debug(`消息内容: ${messageBody}`);
    
    const messageId = await this.sendMessage(messageBody, {
      messageType: 'JOB_CREATED',
    });
    
    this.logger.debug(`任务创建消息已发送: jobId=${jobId}, messageId=${messageId}`);
    return messageId;
  }
} 