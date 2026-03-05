# 打印机管理服务

基于 NestJS 的打印机设备管理后端，支持 MQTT 通信、固件 OTA、打印计数统计。

## 技术栈

- **框架**: NestJS 11 + Express
- **数据库**: MySQL + TypeORM
- **消息**: MQTT (EMQX)
- **存储**: local / MinIO / 火山引擎 TOS（可切换）
- **文档**: Swagger

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 5.7+
- MQTT Broker (EMQX)
- MinIO 或 TOS（可选，可用 local 存储）

### 安装

```bash
npm install
```

### 配置

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

主要配置项：

| 变量           | 说明                             |
| -------------- | -------------------------------- |
| `PORT`         | 服务端口，默认 3000              |
| `API_KEY`      | API 鉴权密钥，请求头 `X-API-Key` |
| `DB_*`         | MySQL 连接                       |
| `MQTT_*`       | MQTT Broker 连接                 |
| `EMQX_*`       | EMQX HTTP API（/mqtt 代理用）    |
| `STORAGE_TYPE` | 存储类型：local / minio / tos    |

### 运行

```bash
# 开发
npm run dev

# 生产
npm run build && npm run start:prod
```

服务启动后：

- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

## API 概览

### 打印机

| 方法 | 路径                      | 说明                                        |
| ---- | ------------------------- | ------------------------------------------- |
| POST | /printer/lock             | 锁定打印机                                  |
| POST | /printer/unlock           | 解锁打印机                                  |
| GET  | /printer/counters?pid=xxx | 获取打印计数（pid 格式：3E-71-BF-7F-05-2B） |
| GET  | /printer/events           | SSE 实时推送                                |

### OTA 固件

| 方法   | 路径         | 说明                   |
| ------ | ------------ | ---------------------- |
| POST   | /ota         | 上传固件               |
| POST   | /ota/publish | 发布 OTA（单机或广播） |
| GET    | /ota         | 固件列表               |
| GET    | /ota/:id     | 固件详情               |
| DELETE | /ota/:id     | 删除固件               |

### 其他

- `/mqtt/*` 透传至 EMQX HTTP API
- `/uploads/*` 静态文件

## MQTT Topic

| Topic                         | 方向      | 说明          |
| ----------------------------- | --------- | ------------- |
| printer/+/init                | 设备→服务 | 打印机初始化  |
| printer/+/status              | 设备→服务 | 在线/离线状态 |
| printer/+/data                | 设备→服务 | 打印计数数据  |
| printer/+/lock                | 设备→服务 | 锁定状态上报  |
| server/{printerId}/lock       | 服务→设备 | 锁定/解锁指令 |
| server/{printerId}/ota/update | 服务→设备 | 单机 OTA      |
| server/ota/broadcast/update   | 服务→设备 | 广播 OTA      |

## 项目结构

```
src/
├── config/       # 数据库、MQTT、存储配置
├── entity/       # 实体：Printer、Ota
├── printer/      # 打印机模块
├── ota/          # OTA 固件模块
├── shared/       # MqttService、SseGateway、Storage
├── repositories/ # 数据访问
└── middlewares/  # 响应封装、API Key、MQTT 代理
```

## 脚本

| 命令                 | 说明              |
| -------------------- | ----------------- |
| `npm run dev`        | 开发模式（watch） |
| `npm run build`      | 构建              |
| `npm run start:prod` | 生产启动          |
| `npm run lint`       | ESLint            |
| `npm run test`       | 单元测试          |
