# Storage 模块架构说明

## 📁 文件结构

```
src/
├── config/
│   └── storage.module.ts          # StorageConfigModule - 配置模块（从环境变量读取）
└── shared/
    └── storage/
        ├── index.ts               # 公共 API 导出
        ├── storage.ts              # Storage 接口（契约）
        ├── storage.config.ts       # StorageConfig 类型定义
        ├── storage.tokens.ts       # 依赖注入 Token
        ├── storage.module.ts       # StorageModule - 业务模块（提供 StorageService）
        ├── storage.service.ts      # StorageService - 用户使用的服务
        ├── local.storage.ts        # LocalStorage - 具体实现
        └── minio.storage.ts        # MinioStorage - MinIO 实现
```

## 🔄 依赖关系

```
StorageConfigModule (config/)
    ↓ 提供 STORAGE_CONFIG
StorageModule (shared/storage/)
    ↓ 使用 STORAGE_CONFIG 创建 Storage 实现
    ↓ 提供 StorageService
其他模块
    ↓ 注入 StorageService 使用
```

## 📦 模块职责

### 1. StorageConfigModule (`config/storage.module.ts`)
- **职责**：从环境变量读取配置
- **提供**：`STORAGE_CONFIG` token
- **位置**：`src/config/`

### 2. StorageModule (`shared/storage/storage.module.ts`)
- **职责**：
  - 注入 `STORAGE_CONFIG`
  - 根据配置创建对应的 `Storage` 实现（LocalStorage/MinIO/OSS/S3）
  - 提供 `StorageService`
- **提供**：`STORAGE` token（具体实现）、`StorageService`
- **位置**：`src/shared/storage/`

### 3. StorageService (`shared/storage/storage.service.ts`)
- **职责**：统一的存储服务 API，内部委托给具体的 `Storage` 实现
- **使用**：用户在其他模块中注入 `StorageService`

## 🎯 使用方式

### 在其他模块中使用

```typescript
import { Injectable } from '@nestjs/common';
import { StorageService } from '@/shared/storage';

@Injectable()
export class SomeService {
  constructor(private readonly storageService: StorageService) {}

  async uploadFile(file: Express.Multer.File) {
    const key = await this.storageService.upload(file, 'avatars');
    const url = this.storageService.getUrl(key);
    return url;
  }
}
```

## 🔑 关键概念

1. **Storage 接口**：定义存储的契约（upload/delete/getUrl）
2. **StorageService 类**：用户使用的服务，实现 Storage 接口
3. **LocalStorage 类**：具体的存储实现，实现 Storage 接口
4. **STORAGE token**：用于依赖注入，指向具体的 Storage 实现
5. **STORAGE_CONFIG token**：存储配置对象

## ✅ 设计优势

- **解耦**：配置和业务逻辑分离
- **可扩展**：新增存储类型只需添加实现类
- **类型安全**：接口约束保证实现一致性
- **易测试**：可以轻松 mock Storage 实现

## MinIO 配置

当 `STORAGE_TYPE=minio` 时，需设置以下环境变量：

| 变量 | 必填 | 说明 |
|------|------|------|
| STORAGE_TYPE | 是 | 设为 `minio` |
| STORAGE_BUCKET | 是 | 桶名 |
| STORAGE_BASE_URL | 是 | 文件访问根 URL（如 `https://minio.example.com/bucket`） |
| STORAGE_ACCESS_KEY | 是 | MinIO 访问密钥 |
| STORAGE_SECRET_KEY | 是 | MinIO 秘密密钥 |
| STORAGE_ENDPOINT | 是 | API 地址，支持 `host` 或 `host:port`，默认端口 9000 |
| STORAGE_SSL | 否 | 是否 HTTPS，默认 false |
