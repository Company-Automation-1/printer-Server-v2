import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from './base.repositories';
import { Ota } from '../entity/ota.entity';

@Injectable()
export class OtaRepository extends BaseRepository<Ota> {
  /**
   * 构造函数
   * @param dataSource - 数据源 (由 NestJS 依赖注入提供)
   */
  constructor(dataSource: DataSource) {
    // 将子类所需的实体类型与数据库操作上下文传递给父类 BaseRepository，完成其初始化
    super(Ota, dataSource.createEntityManager());
  }

  /**
   * 根据版本号查找
   */
  async findByVersion(version: string): Promise<Ota | null> {
    return this.findOne({ where: { version } });
  }
}
