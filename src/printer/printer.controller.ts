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
import { PrinterMonthlyService } from './printer-monthly.service';
import { SseGatewayService } from 'src/shared/sse-gateway.service';
import { BaseController } from 'src/base/base.controller';
import {
  LockPrinterDto,
  UnlockPrinterDto,
  CountersPrinterDto,
  OidCallbackDto,
  MonthlyQueryDto,
  SnapshotDto,
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
@ApiExtraModels(
  ApiResponseDto,
  Printer,
  OidCallbackDto,
  MonthlyQueryDto,
  SnapshotDto,
)
@Controller('printer')
export class PrinterController extends BaseController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly printerMonthlyService: PrinterMonthlyService,
    private readonly sseGatewayService: SseGatewayService,
  ) {
    super();
  }

  /**
   * 获取全部打印机列表
   * @throws {401} X-API-Key 缺失或无效
   */
  @Get()
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
              type: 'array',
              items: { $ref: getSchemaPath(Printer) },
            },
          },
        },
      ],
    },
  })
  @ApiSecurity('api-key')
  async listPrinters() {
    const result = await this.printerService.getAllPrinters();
    return this.responseService.success(result, 'OK', 200);
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

  /**
   * 月度快照查询，默认返回增量。
   * @remarks
   * 增量计算公式：`xxx_delta = 本月值(查询月) - 上月值(查询月 -1)`（上月无记录按 0 计）
   *
   * 碳粉余量计算公式：`xxx_delta = 本月值(查询月) - 上月值(查询月 -1)`（负值表示消耗）
   *
   * - ### year+month：指定月所有设备
   * - ### printerId：设备历史（limit 条）
   * - ### printerId+year+month：指定设备指定月
   * @throws {401} X-API-Key 缺失或无效
   * @throws {400} 需传 year+month 或 printerId
   */
  @Get('monthly')
  @RequireApiKey()
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'array', items: { type: 'object' } } } },
      ],
    },
  })
  @ApiSecurity('api-key')
  async getMonthly(@Query() query: MonthlyQueryDto) {
    const result = await this.printerMonthlyService.findMonthly(query);
    return this.responseService.success(result, 'OK', 200);
  }

  /** 指定设备手动触发上月快照（累计数据无法回溯，会亏损本月已过天数） */
  @Post('monthly/snapshot')
  @RequireApiKey()
  @HttpCode(200)
  @ApiBody({ type: SnapshotDto })
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
              properties: {
                year: { type: 'number' },
                month: { type: 'number' },
                printerIds: { type: 'array', items: { type: 'string' } },
                count: { type: 'number' },
              },
            },
          },
        },
      ],
    },
  })
  @ApiSecurity('api-key')
  async triggerSnapshot(@Body() dto: SnapshotDto) {
    const result = await this.printerMonthlyService.triggerSnapshot(
      dto.printerId,
    );
    return this.responseService.success(result, '快照完成', 200);
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
