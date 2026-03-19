import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiSecurity,
  ApiExtraModels,
} from '@nestjs/swagger';
import { apiResponseSchema, dataSchema } from 'src/lib/swagger';
import { AppService } from './app.service';
import { RequireApiKey } from './middlewares/api-key';
import { ApiResponseDto } from './middlewares/response/api-response.dto';

@ApiTags('应用')
@ApiExtraModels(ApiResponseDto)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** 健康检查，服务存活检测 */
  @Get()
  @ApiResponse(
    apiResponseSchema(dataSchema.string('Hello World!'), {
      description: '服务正常',
    }),
  )
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * 受保护接口，需 X-API-Key 鉴权
   * @throws {401} X-API-Key 缺失或无效
   */
  @Get('protected')
  @RequireApiKey()
  @ApiResponse(
    apiResponseSchema(dataSchema.string('This is a protected endpoint')),
  )
  @ApiSecurity('api-key')
  getProtected(): string {
    return 'This is a protected endpoint';
  }
}
