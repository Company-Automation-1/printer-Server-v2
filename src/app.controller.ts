import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiSecurity,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
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
  @ApiResponse({
    status: 200,
    description: '服务正常',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'string', example: 'Hello World!' } } },
      ],
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  /** 受保护接口，需 X-API-Key 鉴权 */
  @Get('protected')
  @RequireApiKey()
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'string',
              example: 'This is a protected endpoint',
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'X-API-Key 缺失或无效' })
  @ApiSecurity('api-key')
  getProtected(): string {
    return 'This is a protected endpoint';
  }
}
