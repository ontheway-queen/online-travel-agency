export interface IInsertAirlinesCommissionPayload {
  airline_code: string;
  capping?: 0 | 1;
  soto_commission: number;
  from_dac_commission: number;
  to_dac_commission: number;
  soto_allowed: 0 | 1;
  updated_by: number;
  domestic_commission?: number;
}

export interface IGetAirlinesCommissionQuery {
  code?: string;
  last_update?: string;
  limit?: string;
  skip?: string;
  check_code?: string;
  name?: string;
}

export interface IUpdateAirlinesCommissionPayload {
  capping?: 0 | 1;
  soto_commission?: number;
  from_dac_commission?: number;
  to_dac_commission?: number;
  soto_allowed?: 0 | 1;
  last_updated?: string;
  updated_by?: number;
  domestic_commission?: number;
}

export interface IGetAPIAirlinesParams {
  set_flight_api_id?: number;
  airline?: string;
  status?: boolean;
  api_status?: boolean;
  limit?: string;
  skip?: string;
}

export interface IInsertAPIAirlinesCommission {
  set_flight_api_id: number;
  airline: string;
  com_domestic: number;
  com_from_dac: number;
  com_to_dac: number;
  com_soto: number;
  created_by: number;
  com_type: "PER" | "FLAT";
  com_mode: "INCREASE" | "DECREASE";
  booking_block?: boolean;
  issue_block?: boolean;
}
export interface IUpdateAPIAirlinesCommission {
  set_flight_api_id?: number;
  airline?: string;
  com_domestic?: number;
  com_from_dac?: number;
  updated_by: number;
  com_to_dac?: number;
  com_soto?: number;
  status?: boolean;
  com_type?: "PER" | "FLAT";
  com_mode?: "INCREASE" | "DECREASE";
  booking_block?: boolean;
  issue_block?: boolean;
}

export interface IInsertSetRoutesCommissionPayload {
  commission_set_id: number;
  departure: string;
  arrival: string;
  commission: number;
  com_type: "PER" | "FLAT";
  com_mode: "INCREASE" | "DECREASE";
  one_way: boolean;
  round_trip: boolean;
}

export interface IUpdateSetRoutesCommissionPayload {
  departure?: string;
  arrival?: string;
  commission?: number;
  com_type?: "PER" | "FLAT";
  com_mode?: "INCREASE" | "DECREASE";
  one_way?: boolean;
  round_trip?: boolean;
  status?: boolean;
}

export interface IGetSetRoutesCommissionParams {
  commission_set_id: number;
  departure?: string;
  arrival?: string;
  one_way?: boolean;
  round_trip?: boolean;
  status?: boolean;
  limit?: string;
  skip?: string;
}

export interface IInsertBlockRoutePayload {
  departure: string;
  arrival: string;
  airline: string;
  com_type: "PER" | "FLAT"; // PER, FLAT
  com_mode: "INCREASE" | "DECREASE"; // INCREASE, DECREASE
  one_way: boolean;
  round_trip: boolean;
  booking_block: boolean;
  full_block: boolean;
}

export interface IUpdateBlockRoutePayload {
  departure?: string;
  arrival?: string;
  airline?: string;
  com_type?: "PER" | "FLAT"; // PER, FLAT
  com_mode?: "INCREASE" | "DECREASE"; // INCREASE, DECREASE
  one_way?: boolean;
  round_trip?: boolean;
  booking_block?: boolean;
  full_block?: boolean;
  status?: boolean;
}

export interface IGetBlockAirlineParams {
  airline?: string;
  status?: boolean;
  departure?: string;
  arrival?: string;
  one_way?: boolean;
  round_trip?: boolean;
  booking_block?: boolean;
  full_block?: boolean;
  limit?: string;
  skip?: string;
}
