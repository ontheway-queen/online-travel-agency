export interface ICreateAirlinesPreferencePayload {
  airlines_code: string;
  dynamic_fare_supplier_id: number;
  preference_type: 'PREFERRED' | 'BLOCKED';
  from_dac: boolean;
  to_dac: boolean;
  domestic: boolean;
  soto: boolean;
  status?: boolean;
}

export interface IUpdateAirlinesPreferencePayload {
  status?: boolean;
  from_dac?: boolean;
  to_dac?: boolean;
  domestic?: boolean;
  soto?: boolean;
}

export interface IGetAirlinesPreferenceData {
  id: number;
  airlines_code: string;
  status: boolean;
  dynamic_fare_supplier_id: number;
  preference_type: 'PREFERRED' | 'BLOCKED';
  from_dac: boolean;
  to_dac: boolean;
  domestic: boolean;
  soto: boolean;
  airlines_name: string;
  airlines_logo: string;
}

export interface IGetAirlinesPreferenceQuery {
  dynamic_fare_supplier_id: number;
  airlines_code?: string;
  pref_type?: string;
  status?: boolean;
  from_dac?: boolean;
  to_dac?: boolean;
  domestic?: boolean;
  soto?: boolean;
}
