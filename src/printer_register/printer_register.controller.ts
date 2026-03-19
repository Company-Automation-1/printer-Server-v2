import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PrinterRegisterService } from './printer_register.service';
import { RegisterPrinterRegisterDto } from './dto/register-printer_register.dto';
import { BaseController } from 'src/base/base.controller';

@Controller('printer-register')
export class PrinterRegisterController extends BaseController {
  constructor(private readonly printerRegisterService: PrinterRegisterService) {
    super();
  }

  @Get()
  findAll() {
    return this.printerRegisterService.findAll();
  }

  @Get('unregistered')
  findUnregistered() {
    return this.printerRegisterService.findUnregistered();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() registerPrinterRegisterDto: RegisterPrinterRegisterDto,
  ) {
    return this.printerRegisterService.update(id, registerPrinterRegisterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.printerRegisterService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.printerRegisterService.delete(id);
  }
}
