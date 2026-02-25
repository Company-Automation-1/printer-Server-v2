import {
  Controller,
  Get,
  Post,
  Res,
  Body,
  Query,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrinterService } from './printer.service';
import { SseGatewayService } from 'src/shared/sse-gateway.service';
import { BaseController } from 'src/base/base.controller';
import { LockPrinterDto, UnlockPrinterDto, CountersPrinterDto } from './dto';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { RequireApiKey } from 'src/middlewares/api-key';

@Controller('printer')
export class PrinterController extends BaseController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly sseGatewayService: SseGatewayService,
  ) {
    super();
  }

  @Post('lock')
  @RequireApiKey()
  @HttpCode(200)
  @ApiBody({ type: LockPrinterDto })
  lockPrinter(@Body() lockPrinterDto: LockPrinterDto) {
    this.printerService.lockPrinter(lockPrinterDto);
    return this.responseService.success(null, '打印机锁定消息发送成功', 200);
  }

  @Post('unlock')
  @RequireApiKey()
  @HttpCode(200)
  @ApiBody({ type: UnlockPrinterDto })
  unlockPrinter(@Body() unlockPrinterDto: UnlockPrinterDto) {
    this.printerService.unlockPrinter(unlockPrinterDto);
    return this.responseService.success(null, '打印机解锁消息发送成功', 200);
  }

  @Get('counters')
  @RequireApiKey()
  @ApiQuery({
    name: 'pid',
    description: '打印机ID，如 3E:71:BF:7F:05:2B 需要转为 3E-71-BF-7F-05-2B',
  })
  async countersPrinter(@Query() query: CountersPrinterDto) {
    const result = await this.printerService.getPrinterCounters(query.pid);
    return this.responseService.success(
      result,
      '打印机计数器消息获取成功',
      200,
    );
  }

  @Get('events')
  streamEvents(@Res() response: Response) {
    this.sseGatewayService.addClient(response, 'printer');
  }
}
