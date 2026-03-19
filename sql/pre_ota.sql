-- OTA 固件预发布表：版本、存储键、文件 URL
CREATE TABLE `pre_ota`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '版本号',
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '存储键',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '文件 URL',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_version`(`version` ASC) USING BTREE,
  INDEX `idx_key`(`key` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC COMMENT = 'OTA 固件预发布表';

