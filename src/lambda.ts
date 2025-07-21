import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as awsServerlessExpress from 'aws-serverless-express';
import * as express from 'express';
import { Logger } from '@nestjs/common';
import { JobService } from './job/job.service';
import { PrismaService } from './prisma/prisma.service';

const logger = new Logger('Lambda');
let cachedServer: any;
let cachedApp: any;

async function createServer() {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter);
    cachedApp = app; // 缓存NestJS应用实例
    
    // 启用 CORS
    app.enableCors({
      origin: '*',
      methods: '*',
      allowedHeaders: '*',
      credentials: false, // 注意：通配符时不能使用 credentials: true
    });
    
    // Lambda 环境下不使用全局前缀，直接在根路径提供服务
    // app.setGlobalPrefix('api');
    
    await app.init();
    
    cachedServer = awsServerlessExpress.createServer(expressApp);
  }
  
  return cachedServer;
}

// 获取缓存的NestJS应用实例
async function getApp() {
  if (!cachedApp) {
    await createServer(); // 这会同时设置cachedApp
  }
  return cachedApp;
}

export const handler = async (
  event: any,
  context: Context,
): Promise<any> => {
  // 判断事件类型
  if (event.Records && event.Records[0] && event.Records[0].eventSource === 'aws:sqs') {
    // 处理SQS事件
    return await handleSQSEvent(event as SQSEvent, context);
  } else {
    // 处理API Gateway事件
    return await handleAPIEvent(event as APIGatewayProxyEvent, context);
  }
};

/**
 * 处理API Gateway事件
 */
async function handleAPIEvent(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const server = await createServer();
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
}

/**
 * 处理SQS事件
 */
async function handleSQSEvent(event: SQSEvent, context: Context): Promise<any> {
  logger.log(`Processing ${event.Records.length} SQS messages`);
  
  try {
    // 获取缓存的NestJS应用实例
    const app = await getApp();
    
    // 获取JobService
    const jobService = app.get(JobService);
    
    for (const record of event.Records) {
      try {
        const message = JSON.parse(record.body);
        logger.log(`Processing message: ${JSON.stringify(message)}`);
        
        if (message.type === 'JOB_CREATED') {
          // 处理Job创建消息
          const jobId = message.data.jobId;
          logger.log(`Processing job created message for job ID: ${jobId}`);
          
          try {
            // 获取Job信息
            logger.log(`尝试获取任务信息: jobId=${jobId}`);
            const job = await jobService.findOne(jobId);
            
            if (!job) {
              logger.error(`Job with ID ${jobId} not found`);
              continue;
            }
            
            logger.log(`Found job: ${job.jobTitle}`);
            
            // 如果配置了自动分配，执行分配
            if (job.autoAssign) {
              logger.log(`任务配置了自动分配，准备执行分配: jobId=${jobId}`);
              try {
                const result = await jobService.autoAssignJob(jobId);
                logger.log(`Job ${jobId} has been auto-assigned`);
              } catch (assignError) {
                logger.error(`自动分配任务失败: jobId=${jobId}, 错误=${assignError.message}`, assignError.stack);
              }
            } else {
              logger.log(`Job ${jobId} is not configured for auto-assignment`);
            }
          } catch (jobError) {
            logger.error(`处理任务时出错: jobId=${jobId}, 错误=${jobError.message}`, jobError.stack);
          }
        } else {
          logger.warn(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        logger.error(`Error processing SQS message: ${error.message}`, error.stack);
        // 不抛出异常，继续处理其他消息
      }
    }
  } catch (error) {
    logger.error(`处理SQS消息时发生错误: ${error.message}`, error.stack);
  }
  
  logger.log('SQS message processing completed');
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'SQS messages processed successfully',
    }),
  };
}