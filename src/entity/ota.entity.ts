import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Ota {
  @ObjectIdColumn()
  @Transform(({ value }: { value: ObjectId }) => value.toString(), {
    toPlainOnly: true,
  }) // 序列化(Class → Plain Object) 将 ObjectId 转换为字符串
  // @Transform(({ value }: { value: string }) => new ObjectId(value), {
  //   toClassOnly: true,
  // }) // 反序列化(Plain Object → Class) 将字符串转换为 ObjectId
  @ApiProperty({ type: String, description: 'OTA ID' })
  _id: ObjectId;

  @Column()
  @ApiProperty({ description: '版本号' })
  version: string;

  @Column()
  @ApiProperty({ description: '存储键' })
  key: string;

  @Column()
  @ApiProperty({ description: '文件URL' })
  url: string;
}
