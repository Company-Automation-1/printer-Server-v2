import { Controller, Get, Post, Res, Body } from '@nestjs/common';
import type { Response } from 'express';
import { PrinterService } from './printer.service';
import { SseGatewayService } from 'src/shared/sse-gateway.service';
import { BaseController } from 'src/base/base.controller';
import { LockPrinterDto } from './dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('printer')
export class PrinterController extends BaseController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly sseGatewayService: SseGatewayService,
  ) {
    super();
  }

  @Post('lock')
  @ApiBody({ type: LockPrinterDto })
  lockPrinter(@Body() lockPrinterDto: LockPrinterDto) {
    this.printerService.lockPrinter(lockPrinterDto);
    return this.responseService.success(null, '打印机锁定消息发送成功', 201);
  }

  @Get('events')
  streamEvents(@Res() response: Response) {
    this.sseGatewayService.addClient(response, 'printer');
  }
}
