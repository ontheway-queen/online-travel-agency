export interface IUpdateAPIAirlinesCommissionReqBody {
  api_status?: boolean;
  add?: {
    airlines: string[];
    com_domestic: number;
    com_from_dac: number;
    com_to_dac: number;
    com_soto: number;
    com_type: 'PER' | 'FLAT'; // PER, FLAT
    com_mode: 'INCREASE' | 'DECREASE'; // INCREASE, DECREASE
  }[];
  update?: {
    id: 2;
    airline?: string;
    com_domestic?: number;
    com_from_dac?: number;
    com_to_dac?: number;
    com_soto?: number;
    com_type?: 'PER' | 'FLAT'; // PER, FLAT
    com_mode?: 'INCREASE' | 'DECREASE'; // INCREASE, DECREASE
    status?: false;
  }[];
  remove?: number[];
}
