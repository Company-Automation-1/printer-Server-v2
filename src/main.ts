import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 3000;

  //* **************************************************************
  //* 启用 CORS
  //* **************************************************************
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // 允许的源，默认允许所有
    methods:
      process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 允许的请求方法，默认允许所有
    credentials: process.env.CORS_CREDENTIALS === 'true', // 是否允许携带 cookie
    allowedHeaders:
      'Content-Type,Authorization,Accept,X-Requested-With,X-HTTP-Method-Override,X-File-Name', // 允许的请求头
    exposedHeaders: 'Content-Range,X-Content-Range,X-File-Name', // 暴露的响应头
  });

  //* **************************************************************
  //* 全局配置 ClassSerializerInterceptor 自动排除隐私字段
  //* **************************************************************
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //* **************************************************************
  //* 全局配置 ValidationPipe 用于请求体验证和转换
  //* **************************************************************
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动移除未在 DTO 中定义的属性
      forbidNonWhitelisted: true, // 如果请求包含未定义的属性，抛出错误
      transform: true, // 自动将请求体转换为 DTO 实例
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
    }),
  );

  //* **************************************************************
  //* Swagger 配置
  //* **************************************************************
  const config = new DocumentBuilder()
    .setTitle('SERVER API')
    .setDescription('SERVER API 接口文档')
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 保持授权状态，刷新页面后仍然保留 token
      // docExpansion: 'none', // 默认不展开文档
      // filter: true, // 启用搜索过滤
    },
  });

  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  await app.listen(port);
}
void bootstrap();
