# 阶段1：构建（在镜像内安装依赖并编译，不依赖外部预构建）
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装全部依赖（含 devDependencies，用于构建）
RUN npm ci

# 复制源码
COPY . .

# 编译生成 dist
RUN npm run build

# 阶段2：运行
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 复制package文件
COPY package*.json ./

# 只安装生产依赖（跳过 prepare 等脚本，因为 husky 等工具在生产环境不需要）
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# 复制构建产物（从 builder 阶段）
COPY --from=builder /app/dist ./dist

# 设置应用目录权限（uploads 目录通过 docker-compose volume 挂载，无需在镜像中创建）
RUN chown -R nestjs:nodejs /app

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api-docs', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/main.js"]
