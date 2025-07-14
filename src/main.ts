import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// 环境变量现在由 @nestjs/config 管理，无需手动加载

const logger = new Logger('Bootstrap');

export async function createNestApp() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // 设置全局前缀
  app.setGlobalPrefix('');
  
  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('Aladdin API')
    .setDescription('Aladdin 后台接口文档')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // 可在此添加全局中间件、拦截器等
  await app.init();
  return app.getHttpAdapter().getInstance(); // 返回 express 实例
}

// 创建 NestJS 应用实例
console.log('process.env.NODE_ENV', process.env.NODE_ENV)

async function bootstrap() {
    const app = await createNestApp();
    const port = process.env.PORT || 3999;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Aladdin启动成功!`);
    logger.log(`📊 服务地址: http://localhost:${port}`);
    logger.log(`📝 API文档: http://localhost:${port}/api`);
    logger.log(`🌍 环境: ${process.env.NODE_ENV}`);
  }
  
// 开发环境下启动监听服务
// if (process.env.NODE_ENV === 'development') {
//     bootstrap(); 
// }

    bootstrap(); 
