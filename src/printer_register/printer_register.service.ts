import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import QRCode from 'qrcode';
import { generateSnowflakeId } from 'src/lib';
import { StorageService } from 'src/shared/storage';
import { PrinterRegisterRepository } from 'src/repositories';
import { PrinterRegister } from 'src/entity/printer-register.entity';
import { CreatePrinterRegisterDto } from './dto/create-printer_register.dto';
import { APP_CONFIG, type AppConfig } from 'src/config/app.module';
import { DeleteResult, IsNull, UpdateResult } from 'typeorm';
import { RegisterPrinterRegisterDto } from './dto/register-printer_register.dto';

@Injectable()
export class PrinterRegisterService {
  constructor(
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
    private readonly storage: StorageService,
    private readonly repo: PrinterRegisterRepository,
  ) {}

  private createdAt = Math.floor(Date.now() / 1000);
  private updatedAt = Math.floor(Date.now() / 1000);

  async create(dto: CreatePrinterRegisterDto): Promise<PrinterRegister> {
    const { lanIp, printerId } = dto;
    const uuid = generateSnowflakeId();
    const { httpProtocol, domain, port } = this.appConfig;
    const redirectUrl = `${httpProtocol}://${domain}:${port}/printer-register/302/${uuid}`;

    // 根据生成的 uuid，拼接出打印机注册重定向 URL，然后生成对应的二维码图片 Buffer
    const qrBuffer = await (
      QRCode as { toBuffer: (t: string, o?: object) => Promise<Buffer> }
    ).toBuffer(redirectUrl, {
      type: 'png', // 生成 png 格式
    });

    // 构建 Express.Multer.File 格式的文件对象，用于上传到云存储
    const file = {
      buffer: qrBuffer, // 二维码图片 Buffer 数据
      originalname: `${uuid}.png`, // 文件名使用 uuid
      mimetype: 'image/png', // MIME 类型
      size: qrBuffer.length, // Buffer 长度作为文件大小
    } as Express.Multer.File;

    // 上传二维码到对象存储（如 OSS、COS 等），获取存储键
    const qrKey = await this.storage.upload(file, 'printer-register');
    // 通过存储键获取二维码图片的访问 URL
    const qrUrl = this.storage.getUrl(qrKey);

    const entity = this.repo.create({
      uuid,
      lanIp,
      printerId,
      qrKey,
      qrUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
    return this.repo.save(entity);
  }

  findAll(): Promise<PrinterRegister[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<PrinterRegister | null> {
    return this.repo.findById(id);
  }

  update(id: number, dto: RegisterPrinterRegisterDto): Promise<UpdateResult> {
    return this.repo.update(id, {
      identifier: dto.identifier,
      updatedAt: this.updatedAt,
    });
  }

  async delete(id: number): Promise<DeleteResult> {
    const one = await this.repo.findById(id);
    if (!one) throw new NotFoundException('记录不存在');
    await this.storage.delete(one.qrKey);
    return this.repo.delete(id);
  }

  async upsertByPrinterId(
    printerId: string,
    lanIp: string,
  ): Promise<PrinterRegister | null> {
    const result = await this.repo.update(
      { printerId },
      { lanIp, updatedAt: this.updatedAt },
    );
    if ((result.affected ?? 0) > 0) return null;
    return this.create({ printerId, lanIp });
  }

  findUnregistered(): Promise<PrinterRegister[]> {
    return this.repo.find({ where: { identifier: IsNull() } });
  }

  async findByUuid(uuid: string): Promise<string | null> {
    const record = await this.repo.findByUuid(uuid);
    if (!record || !record.lanIp) throw new NotFoundException('二维码已失效');
    return record.lanIp;
  }
}
