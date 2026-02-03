import {
  Controller,
  Post,
  Get,
  Body,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { OtaService } from './ota.service';
import { UploadOtaDto, PublishOtaDto } from './dto';
import { Ota } from '../entity/ota.entity';
import { ObjectId } from 'mongodb';
import { BaseController } from '../base/base.controller';
import { FormattedResponse } from '../middlewares/response';

@Controller('ota')
export class OtaController extends BaseController {
  constructor(private readonly otaService: OtaService) {
    // 初始化父类构造函数
    super();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadOtaDto })
  @ApiCreatedResponse({ type: () => Ota })
  async uploadOta(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /.*/ })],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadOtaDto: Omit<UploadOtaDto, 'file'>,
  ): Promise<FormattedResponse<Ota>> {
    const dto: UploadOtaDto = { ...uploadOtaDto, file };
    const result = await this.otaService.uploadOta(dto);
    return this.responseService.success(result, '固件上传成功', 201);
  }

  @Post('publish')
  async publishOta(
    @Body() publishOtaDto: PublishOtaDto,
  ): Promise<FormattedResponse<boolean>> {
    const result = await this.otaService.publishOta(publishOtaDto);
    return this.responseService.success(result, '固件发布成功', 201);
  }

  @Get()
  @ApiOkResponse({ type: () => Ota, isArray: true })
  // @ApiOkResponse({ type: [Ota] }) // 使用数组类型
  async findAll(): Promise<FormattedResponse<Ota[]>> {
    const result = await this.otaService.findAll();
    return this.responseService.success(result, '固件查询成功', 200);
  }

  @Get(':id')
  @ApiOkResponse({ type: () => Ota })
  async findOne(@Param('id') id: string): Promise<FormattedResponse<Ota>> {
    const result = await this.otaService.findOne(new ObjectId(id));
    if (!result) {
      throw new NotFoundException('OTA 不存在');
    }
    return this.responseService.success(result, '固件查询成功', 200);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<FormattedResponse<boolean>> {
    const result = await this.otaService.delete(new ObjectId(id));
    return this.responseService.success(result, '固件删除成功', 200);
  }
}
