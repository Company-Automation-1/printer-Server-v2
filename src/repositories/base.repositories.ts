import { Repository, ObjectLiteral } from 'typeorm';

/**
 * 基础 Repository 类
 *
 * 所有领域 Repository 的基类，继承 TypeORM 的 Repository 所有方法
 * 目前为空实现，仅为后续可能的公共扩展方法预留空间
 *
 * @template T - 实体类型，必须满足 ObjectLiteral 约束（即对象字面量类型）
 *
 * @example
 * ```typescript
 * // 领域 Repository 继承 BaseRepository
 * export class OtaRepository extends BaseRepository<Ota> {
 *   // 可以添加领域特定的方法
 *   async findByVersion(version: string) { ... }
 * }
 * ```
 *
 * @description
 * ```typescript
 * // 表示 T 必须满足 ObjectLiteral 约束（即对象字面量类型）
 * T extends ObjectLiteral
 * // 表示 Repository 类，继承 TypeORM 的 Repository 类
 * Repository<T>
 * ```
 */
export abstract class BaseRepository<
  T extends ObjectLiteral,
> extends Repository<T> {}
