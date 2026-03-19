-- 打印机月度快照表：按月截取累计数据，用于月增量统计
CREATE TABLE `pre_printer_monthly`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `printer_id` char(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '打印机 MAC',
  `serial` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '序列号',
  `year` smallint NOT NULL COMMENT '年',
  `month` tinyint NOT NULL COMMENT '月 1-12',
  `s_total` int NULL DEFAULT NULL COMMENT '总打印+复印数(月末累计)',
  `bw_cp` int NULL DEFAULT NULL COMMENT '黑白复印',
  `bw_p` int NULL DEFAULT NULL COMMENT '黑白打印',
  `c_cp` int NULL DEFAULT NULL COMMENT '彩色复印',
  `c_p` int NULL DEFAULT NULL COMMENT '彩色打印',
  `t_bk` int NULL DEFAULT NULL COMMENT '黑色碳粉余量',
  `t_cy` int NULL DEFAULT NULL COMMENT '青色碳粉余量',
  `t_rd` int NULL DEFAULT NULL COMMENT '红色碳粉余量',
  `t_yl` int NULL DEFAULT NULL COMMENT '黄色碳粉余量',
  `created_at` bigint NULL DEFAULT NULL COMMENT '秒级时间戳',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_printer_year_month`(`printer_id` ASC, `year` ASC, `month` ASC) USING BTREE,
  INDEX `idx_year_month`(`year` ASC, `month` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC COMMENT = '打印机月度快照';
