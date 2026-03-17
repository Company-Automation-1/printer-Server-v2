/** 服务端 → 设备 (publish) */
export const SERVER_LOCK = (mac: string) => `server/${mac}/lock`;
export const SERVER_OID_MAC = (mac: string) => `server/oid/${mac}`;
export const SERVER_OID = 'server/oid';

/** 设备 → 服务端 (subscribe) */
export const PRINTER_INIT = 'printer/+/init'; // 打印机初始化
export const PRINTER_STATUS = 'printer/+/status'; // 打印机状态
export const PRINTER_DATA = 'printer/+/data'; // 打印机数据
export const PRINTER_LOCK = 'printer/+/lock'; // 打印机锁定
export const PRINTER_WEB = 'printer/+/web'; // Web 配置页 URL
export const PRINTER_OID = 'printer/oid/+'; // 按需 OID 查询结果
