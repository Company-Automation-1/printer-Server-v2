import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Query,
  Param,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrinterService } from './printer.service';
import { SseGatewayService } from 'src/shared/sse-gateway.service';
import { BaseController } from 'src/base/base.controller';
import {
  LockPrinterDto,
  UnlockPrinterDto,
  CountersPrinterDto,
  OidCallbackDto,
} from './dto';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiSecurity,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { RequireApiKey } from 'src/middlewares/api-key';
import { Printer } from '../entity/printer.entity';
import { ApiResponseDto } from '../middlewares/response/api-response.dto';

@ApiTags('打印机')
@ApiExtraModels(ApiResponseDto, Printer, OidCallbackDto)
@Controller('printer')
export class PrinterController extends BaseController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly sseGatewayService: SseGatewayService,
  ) {
    super();
  }

  /**
   * 锁定打印机，向指定打印机发送锁定指令
   * @throws {401} X-API-Key 缺失或无效
   * @throws {400} 参数校验失败
   */
  @Post('lock')
  @RequireApiKey()
  @HttpCode(200)
  @ApiBody({ type: LockPrinterDto })
  @ApiResponse({
    status: 200,
    description: '锁定消息发送成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'object', nullable: true } } },
      ],
    },
  })
  @ApiSecurity('api-key')
  lockPrinter(@Body() lockPrinterDto: LockPrinterDto) {
    this.printerService.lockPrinter(lockPrinterDto);
    return this.responseService.success(null, '打印机锁定消息发送成功', 200);
  }

  /**
   * 解锁打印机，向指定打印机发送解锁指令
   * @throws {401} X-API-Key 缺失或无效
   * @throws {400} 参数校验失败
   */
  @Post('unlock')
  @RequireApiKey()
  @HttpCode(200)
  @ApiBody({ type: UnlockPrinterDto })
  @ApiResponse({
    status: 200,
    description: '解锁消息发送成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'object', nullable: true } } },
      ],
    },
  })
  @ApiSecurity('api-key')
  unlockPrinter(@Body() unlockPrinterDto: UnlockPrinterDto) {
    this.printerService.unlockPrinter(unlockPrinterDto);
    return this.responseService.success(null, '打印机解锁消息发送成功', 200);
  }

  /**
   * 获取打印计数，pid 格式为 3E-71-BF-7F-05-2B
   * @throws {401} X-API-Key 缺失或无效
   * @throws {404} 打印机不存在
   * @throws {400} 参数校验失败
   */
  @Get('counters')
  @RequireApiKey()
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(Printer) } } },
      ],
    },
  })
  @ApiSecurity('api-key')
  async countersPrinter(@Query() query: CountersPrinterDto) {
    const result = await this.printerService.getPrinterCounters(query.pid);
    return this.responseService.success(
      result,
      '打印机计数器消息获取成功',
      200,
    );
  }

  /**
   * OID 广播，向所有设备查询 OID，每台设备响应后回调一次
   * @throws {401} X-API-Key 缺失或无效
   * @throws {400} 参数校验失败
   */
  @Post('oid')
  @RequireApiKey()
  @HttpCode(200)
  @ApiBody({ type: OidCallbackDto })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { requestId: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @ApiSecurity('api-key')
  async oidList(@Body() dto: OidCallbackDto) {
    const requestId = await this.printerService.publishOid(dto);
    return this.responseService.success({ requestId }, 'OK', 200);
  }

  /**
   * OID 单设备，向指定设备查询 OID，响应后回调一次
   * @throws {401} X-API-Key 缺失或无效
   * @throws {400} 参数校验失败
   */
  @Post('oid/:oid')
  @RequireApiKey()
  @HttpCode(200)
  @ApiParam({ name: 'oid', description: 'MAC 格式如 3E-71-BF-7F-05-2B' })
  @ApiBody({ type: OidCallbackDto })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { requestId: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @ApiSecurity('api-key')
  async oidDetail(@Param('oid') oid: string, @Body() dto: OidCallbackDto) {
    const requestId = await this.printerService.publishOidByMac(oid, dto);
    return this.responseService.success({ requestId }, 'OK', 200);
  }

  /** SSE 实时推送，接收打印机 MQTT 消息 */
  @Get('events')
  @ApiResponse({
    status: 200,
    description: 'SSE 流，Content-Type: text/event-stream',
  })
  streamEvents(@Res() response: Response) {
    this.sseGatewayService.addClient(response, 'printer');
  }
}
