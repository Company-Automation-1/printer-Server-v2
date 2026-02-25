import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { API_KEY_REQUIRED } from './api-key.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  private verify(apiKey: string): boolean {
    return apiKey === this.configService.get<string>('API_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const requireApiKey = this.reflector.getAllAndOverride<boolean>(
      API_KEY_REQUIRED,
      [context.getHandler(), context.getClass()],
    );

    if (!requireApiKey) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'X-API-Key 请求头缺失',
      });
    }

    if (!this.verify(apiKey)) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'API密钥无效',
      });
    }

    return true;
  }
}
