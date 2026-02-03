import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ObjectId } from 'typeorm';
import { StorageService } from '../shared/storage';
import { UploadOtaDto } from './dto/upload-ota.dto';
import { OtaRepository } from '../repositories';
import { Ota } from '../entity/ota.entity';
import { PublishOtaDto } from './dto';
import { MqttService } from '../shared/mqtt.service';

@Injectable()
export class OtaService {
  constructor(
    private readonly storageService: StorageService,
    private readonly otaRepository: OtaRepository,
    @InjectDataSource() private readonly dataSource: DataSource, // 注入 DataSource 用于事务
    private readonly mqttService: MqttService,
  ) {}

  async uploadOta(uploadOtaDto: UploadOtaDto): Promise<Ota> {
    const { version, file } = uploadOtaDto;
    const key = await this.storageService.upload(file, 'ota');
    const url = this.storageService.getUrl(key);

    const ota = this.otaRepository.create({ version, key, url }); // 仅创建实体实例 (内存操作) ,主要用于类型检查和设置默认值
    const result = await this.otaRepository.save(ota); // 保存 OTA 实体 (数据库操作)
    return result;
  }

  publishOta(publishOtaDto: PublishOtaDto): Promise<boolean> {
    const { printerId, version, url } = publishOtaDto;

    const topic = printerId
      ? `printer/data/${printerId}/ota/update`
      : 'printer/ota/broadcast/update';

    this.mqttService.publish(topic, JSON.stringify({ version, url }));
    return Promise.resolve(true);
  }

  async findAll(): Promise<Ota[]> {
    return this.otaRepository.find();
  }

  async findOne(id: ObjectId): Promise<Ota | null> {
    return this.otaRepository.findOne({ where: { _id: id } });
  }

  /**
   * 事务：删除 OTA 并同时删除存储文件（需要原子性）
   */
  async delete(id: ObjectId): Promise<boolean> {
    // 使用显式事务，确保多个操作的原子性
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      // 在事务中使用事务的 EntityManager 获取 Repository
      const otaRepo = transactionalEntityManager.getRepository(Ota);

      // 查找要删除的记录
      const ota = await otaRepo.findOne({ where: { _id: id } });
      if (!ota) {
        throw new NotFoundException('OTA not found');
      }

      // 删除数据库记录
      await otaRepo.delete(id);

      // 删除存储文件（如果这一步失败，整个事务会回滚）
      await this.storageService.delete(ota.key);
    });
    return true; // 删除成功
  }
}
