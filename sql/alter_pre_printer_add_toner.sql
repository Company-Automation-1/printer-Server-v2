-- 为 pre_printer 表添加碳粉余量字段
ALTER TABLE `pre_printer`
  ADD COLUMN `t_bk` int NULL DEFAULT NULL COMMENT '黑色碳粉余量' AFTER `c_p`,
  ADD COLUMN `t_cy` int NULL DEFAULT NULL COMMENT '青色碳粉余量' AFTER `t_bk`,
  ADD COLUMN `t_rd` int NULL DEFAULT NULL COMMENT '红色碳粉余量' AFTER `t_cy`,
  ADD COLUMN `t_yl` int NULL DEFAULT NULL COMMENT '黄色碳粉余量' AFTER `t_rd`;
