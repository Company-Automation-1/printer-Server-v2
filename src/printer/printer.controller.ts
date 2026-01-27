import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrinterService } from './printer.service';
import { OtaUpdatePrinterDto } from './dto/publish-printer.dto';
import { SseGatewayService } from 'src/shared/sse-gateway.service';

@Controller('printer')
export class PrinterController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly sseGatewayService: SseGatewayService,
  ) {}

  @Post()
  publishOtaUpdate(@Body() otaUpdatePrinterDto: OtaUpdatePrinterDto) {
    return this.printerService.publishOtaUpdate(otaUpdatePrinterDto);
  }

  @Get('events')
  streamEvents(@Res() response: Response) {
    this.sseGatewayService.addClient(response, 'printer');
  }
}
