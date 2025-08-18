export interface ICreatePartialPaymentRulePayload {
  flight_api_id: number;
  airline: string;
  from_dac: boolean;
  to_dac: boolean;
  one_way?: boolean;
  round_trip?: boolean;
  travel_date_from_now: number;
  payment_percentage: number;
  created_by: number;
  domestic?: boolean;
  soto?: boolean;
  payment_before?: number;
  note?: string;
}

export interface IUpdatePartialPaymentRulePayload {
  airline?: string;
  from_dac?: boolean;
  to_dac?: boolean;
  one_way?: boolean;
  round_trip?: boolean;
  travel_date_from_now?: number;
  payment_percentage?: number;
  status?: boolean;
  domestic?: boolean;
  soto?: boolean;
  payment_before?: number;
}

export interface IGetPartialPaymentRuleQueryFilter {
  flight_api_id?: number;
  airline?: string;
  from_dac?: boolean;
  to_dac?: boolean;
  one_way?: boolean;
  round_trip?: boolean;
  status?: boolean;
  limit?: number;
  skip?: number;
  flight_api_name?: string;
}
