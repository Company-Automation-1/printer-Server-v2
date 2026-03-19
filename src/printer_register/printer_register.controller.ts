import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PrinterRegisterService } from './printer_register.service';
import { RegisterPrinterRegisterDto } from './dto/register-printer_register.dto';
import { BaseController } from 'src/base/base.controller';
import { PrinterRegister } from 'src/entity/printer-register.entity';
import { ApiResponseDto } from 'src/middlewares/response/api-response.dto';
import { apiResponseSchema, arrayRef } from 'src/lib/swagger';

const affectedSchema = {
  type: 'object' as const,
  properties: { affected: { type: 'number' as const, example: 1 } },
};

@ApiTags('打印机注册')
@ApiExtraModels(ApiResponseDto, PrinterRegister, RegisterPrinterRegisterDto)
@Controller('printer-register')
export class PrinterRegisterController extends BaseController {
  constructor(private readonly printerRegisterService: PrinterRegisterService) {
    super();
  }

  /** 获取全部注册记录 */
  @Get()
  @ApiResponse(apiResponseSchema(arrayRef(PrinterRegister)))
  findAll() {
    return this.printerRegisterService.findAll();
  }

  /**
   * 扫码重定向到打印机局域网地址
   * @throws {404} 二维码已失效
   */
  @Get('302/:uuid')
  @ApiParam({ name: 'uuid', description: '二维码 UUID（雪花 ID）' })
  @ApiResponse({ status: 302, description: '重定向到 http://{lanIp}' })
  async redirect(@Param('uuid') uuid: string, @Res() res: Response) {
    const lanIp = await this.printerRegisterService.findByUuid(uuid);
    return res.redirect(302, `http://${lanIp}`);
  }

  /** 获取未注册（identifier 为空）的记录 */
  @Get('unregistered')
  @ApiResponse(apiResponseSchema(arrayRef(PrinterRegister)))
  findUnregistered() {
    return this.printerRegisterService.findUnregistered();
  }

  /**
   * 更新注册记录（填写 identifier）
   * @throws {404} 记录不存在
   */
  @Patch(':id')
  @ApiParam({ name: 'id', description: '记录 ID', example: 1 })
  @ApiBody({ type: RegisterPrinterRegisterDto })
  @ApiResponse(apiResponseSchema(affectedSchema))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() registerPrinterRegisterDto: RegisterPrinterRegisterDto,
  ) {
    return this.printerRegisterService.update(id, registerPrinterRegisterDto);
  }

  /**
   * 根据 ID 获取单条记录
   * @throws {404} 记录不存在
   */
  @Get(':id')
  @ApiParam({ name: 'id', description: '记录 ID', example: 1 })
  @ApiResponse(apiResponseSchema(PrinterRegister))
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.printerRegisterService.findOne(id);
  }

  /**
   * 删除记录并移除二维码存储文件
   * @throws {404} 记录不存在
   */
  @Delete(':id')
  @ApiParam({ name: 'id', description: '记录 ID', example: 1 })
  @ApiResponse(apiResponseSchema(affectedSchema))
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.printerRegisterService.delete(id);
  }
}
