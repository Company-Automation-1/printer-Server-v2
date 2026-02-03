import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import {
  ResponseInterceptor,
  AllExceptionsFilter,
} from './middlewares/response';
import { MqttProxyMiddleware } from './middlewares/mqtt-proxy.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 3000;
  const uploadPath = 'uploads';

  //* **************************************************************
  //* 全局配置 MQTT 代理中间件
  //* **************************************************************
  const mqttProxy = app.get(MqttProxyMiddleware); // 获取 MQTT 代理中间件实例
  app.use(mqttProxy.use.bind(mqttProxy)); // 使用 MQTT 代理中间件

  //* **************************************************************
  //* 通过 useStaticAssets 方法将服务器本地的 uploads 目录暴露为静态资源目录
  //* **************************************************************
  // 设置 prefix: `/${uploadPath}` 后，上传到 uploads 目录的文件可通过 http://localhost:端口号/uploads/文件名 直接访问。
  app.useStaticAssets(join(__dirname, '..', uploadPath), {
    prefix: `/${uploadPath}`,
  });

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
  //* 全局配置响应拦截器
  //* 注意：拦截器执行顺序是后进先出（LIFO），所以先注册的会最后执行
  //* **************************************************************
  app.useGlobalInterceptors(new ResponseInterceptor());

  //* **************************************************************
  //* 全局配置 ClassSerializerInterceptor 自动排除隐私字段
  //* 执行顺序：ClassSerializerInterceptor（先执行） -> ResponseInterceptor（后执行）
  //* **************************************************************
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //* **************************************************************
  //* 全局配置异常过滤器
  //* **************************************************************
  app.useGlobalFilters(new AllExceptionsFilter());

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
