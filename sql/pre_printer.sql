-- 打印机表：MAC、序列号及打印/复印计数
CREATE TABLE `pre_printer` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `printer_id` char(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '打印机id(硬件 MAC 地址)',
  `serial` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '打印机序列号',
  `s_total` int NULL DEFAULT NULL COMMENT '总打印+复印数',
  `bw_cp` int NULL DEFAULT NULL COMMENT '黑白复印',
  `bw_p` int NULL DEFAULT NULL COMMENT '黑白打印',
  `c_cp` int NULL DEFAULT NULL COMMENT '彩色复印',
  `c_p` int NULL DEFAULT NULL COMMENT '彩色打印',
  `t_bk` int NULL DEFAULT NULL COMMENT '黑色碳粉余量',
  `t_cy` int NULL DEFAULT NULL COMMENT '青色碳粉余量',
  `t_rd` int NULL DEFAULT NULL COMMENT '红色碳粉余量',
  `t_yl` int NULL DEFAULT NULL COMMENT '黄色碳粉余量',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_printer_id`(`printer_id` ASC) USING BTREE,
  UNIQUE INDEX `idx_serial`(`serial` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC COMMENT = '打印机表';
