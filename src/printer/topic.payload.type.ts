export interface PrinterStatusPayload {
  status: string;
}

export interface PrinterInitPayload {
  mac: string;
  ip: string;
  serial: string;
}

export interface PrinterDataPayload {
  mac: string;
  st: number;
  serial: string;
  col_copies: number;
  bw_copies: number;
  col_prints: number;
  bw_prints: number;
}
