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
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { OtaService } from './ota.service';
import { UploadOtaDto, PublishOtaDto } from './dto';
import { Ota } from '../entity/ota.entity';
import { BaseController } from '../base/base.controller';
import { FormattedResponse } from '../middlewares/response';
import { ApiResponseDto } from '../middlewares/response/api-response.dto';

@ApiTags('OTA 固件')
@ApiExtraModels(ApiResponseDto, Ota)
@Controller('ota')
export class OtaController extends BaseController {
  constructor(private readonly otaService: OtaService) {
    // 初始化父类构造函数
    super();
  }

  /**
   * 上传 OTA 固件文件到存储
   * @throws {400} 参数校验失败（如 version 为空、file 缺失）
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadOtaDto })
  @ApiResponse({
    status: 201,
    description: '上传成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(Ota) } } },
      ],
    },
  })
  async uploadOta(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /.*/, // 允许所有文件类型
            fallbackToMimetype: true, // 如果文件类型无法确定，则使用 MIME 类型
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadOtaDto: Omit<UploadOtaDto, 'file'>,
  ): Promise<FormattedResponse<Ota>> {
    const dto: UploadOtaDto = { ...uploadOtaDto, file };
    const result = await this.otaService.uploadOta(dto);
    return this.responseService.success(result, '固件上传成功', 201);
  }

  /**
   * 发布 OTA，printerId 为空时广播到所有设备
   * @throws {400} 参数校验失败（如 version/url 为空或 url 格式无效）
   */
  @Post('publish')
  @ApiBody({ type: PublishOtaDto })
  @ApiResponse({
    status: 201,
    description: '发布成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'boolean', example: true } } },
      ],
    },
  })
  async publishOta(
    @Body() publishOtaDto: PublishOtaDto,
  ): Promise<FormattedResponse<boolean>> {
    const result = await this.otaService.publishOta(publishOtaDto);
    return this.responseService.success(result, '固件发布成功', 201);
  }

  /** 获取所有 OTA 固件 */
  @Get()
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: { type: 'array', items: { $ref: getSchemaPath(Ota) } },
          },
        },
      ],
    },
  })
  async findAll(): Promise<FormattedResponse<Ota[]>> {
    const result = await this.otaService.findAll();
    return this.responseService.success(result, '固件查询成功', 200);
  }

  /**
   * 根据 ID 获取单个固件
   * @throws {404} OTA 不存在
   */
  @Get(':id')
  @ApiParam({ name: 'id', description: 'OTA ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(Ota) } } },
      ],
    },
  })
  async findOne(@Param('id') id: string): Promise<FormattedResponse<Ota>> {
    const result = await this.otaService.findOne(+id);
    if (!result) {
      throw new NotFoundException('OTA 不存在');
    }
    return this.responseService.success(result, '固件查询成功', 200);
  }

  /**
   * 删除 OTA 记录并移除存储文件
   * @throws {404} OTA 不存在
   */
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'OTA ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'boolean', example: true } } },
      ],
    },
  })
  async delete(@Param('id') id: string): Promise<FormattedResponse<boolean>> {
    const result = await this.otaService.delete(+id);
    return this.responseService.success(result, '固件删除成功', 200);
  }
}
