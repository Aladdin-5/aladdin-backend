import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as awsServerlessExpress from 'aws-serverless-express';
import * as express from 'express';

let cachedServer: any;

async function createServer() {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter);
    
    // 启用 CORS
    app.enableCors();
    
    // Lambda 环境下不使用全局前缀，直接在根路径提供服务
    // app.setGlobalPrefix('api');
    
    await app.init();
    
    cachedServer = awsServerlessExpress.createServer(expressApp);
  }
  
  return cachedServer;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const server = await createServer();
  
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};