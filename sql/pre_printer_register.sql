-- 打印机注册表：MAC、序列号及注册二维码
CREATE TABLE `pre_printer_register`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `uuid` bigint NOT NULL COMMENT '雪花ID',
  `identifier` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '标识 (可读唯一标识)',
  `qr_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '二维码存储键',
  `qr_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '二维码访问 URL',
  `printer_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '打印机id(硬件 MAC 地址)',
  `lan_ip` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '局域网IP',
  `serial` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '打印机序列号',
  `created_at` bigint NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` bigint NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_uuid`(`uuid` ASC) USING BTREE,
  UNIQUE INDEX `idx_identifier`(`identifier` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC COMMENT = '打印机注册表';

