export interface ICreateDynamicFareSetPayload {
  name: string;
  created_by: number;
}

export interface IGetDynamicFareSetData {
  id: number;
  name: string;
  created_by: number;
  created_at: Date;
}

export interface IUpdateDynamicFareSetPayload {
  name?: string;
}

export interface ICreateDynamicFareSupplierPayload {
  set_id: number;
  supplier_id: number;
  commission?: number;
  commission_type?: 'PER' | 'FLAT';
  markup?: number;
  markup_type?: 'PER' | 'FLAT';
  segment_commission?: number;
  segment_commission_type?: 'PER' | 'FLAT';
  segment_markup?: number;
  segment_markup_type?: 'PER' | 'FLAT';
  pax_markup?: number;
  status?: boolean;
}

export interface IGetDynamicFareSupplierData {
  id: number;
  set_id: number;
  set_name: string;
  supplier_id: number;
  supplier_name: string;
  supplier_logo: string;
  commission: number | null;
  commission_type: 'PER' | 'FLAT' | null;
  markup: number;
  markup_type: 'PER' | 'FLAT' | null;
  segment_commission: number | null;
  segment_commission_type: 'PER' | 'FLAT' | null;
  segment_markup: number | null;
  segment_markup_type: 'PER' | 'FLAT' | null;
  pax_markup: number | null;
  status: boolean;
}

export interface IUpdateDynamicFareSupplierPayload {
  commission?: number;
  commission_type?: 'PER' | 'FLAT';
  markup?: number;
  markup_type?: 'PER' | 'FLAT';
  segment_commission?: number;
  segment_commission_type?: 'PER' | 'FLAT';
  segment_markup?: number;
  segment_markup_type?: 'PER' | 'FLAT';
  pax_markup?: number;
  status?: boolean;
}

export interface ICreateSupplierAirlinesDynamicFarePayload {
  dynamic_fare_supplier_id: number;
  airline: string;
  from_dac?: boolean | null;
  to_dac?: boolean | null;
  soto?: boolean | null;
  domestic?: boolean | null;
  commission_type?: 'PER' | 'FLAT' | null;
  commission?: number | null;
  markup_type?: 'PER' | 'FLAT' | null;
  markup?: number | null;
  flight_class?: string | null;
  status?: boolean;
  segment_commission?: number | null;
  segment_commission_type?: 'PER' | 'FLAT' | null;
  segment_markup?: number | null;
  segment_markup_type?: 'PER' | 'FLAT' | null;
  pax_markup?: number | null;
}

export interface IGetSupplierAirlinesDynamicFareData {
  id: number;
  dynamic_fare_supplier_id: number;
  airline: string;
  from_dac: boolean | null;
  to_dac: boolean | null;
  soto: boolean | null;
  domestic: boolean | null;
  commission_type: 'PER' | 'FLAT' | null;
  commission: number | null;
  markup_type: 'PER' | 'FLAT' | null;
  markup: number | null;
  flight_class: string | null;
  status: boolean;
  segment_commission: number | null;
  segment_commission_type: 'PER' | 'FLAT' | null;
  segment_markup: number | null;
  segment_markup_type: 'PER' | 'FLAT' | null;
  pax_markup: number | null;
}

export interface IUpdateSupplierAirlinesDynamicFarePayload {
  id: number;
  dynamic_fare_supplier_id?: number;
  airline?: string;
  from_dac?: boolean;
  to_dac?: boolean;
  soto?: boolean;
  commission_type?: 'PER' | 'FLAT';
  commission?: number;
  markup_type?: 'PER' | 'FLAT';
  markup?: number;
  flight_class?: string;
  status?: boolean;
  segment_commission?: number;
  segment_commission_type?: 'PER' | 'FLAT';
  segment_markup?: number;
  segment_markup_type?: 'PER' | 'FLAT';
  pax_markup?: number;
}

export interface IGetSupplierAirlinesDynamicFareQuery {
  dynamic_fare_supplier_id: number;
  airline?: string;
  flight_class?: string;
  from_dac?: boolean;
  to_dac?: boolean;
  soto?: boolean;
  domestic?: boolean;
  order_by?: 'asc' | 'desc';
}

export interface ICreateDynamicFareTaxPayload {
  dynamic_fare_supplier_id: number;
  airline: string;
  tax_name: string;
  commission?: number;
  commission_type?: 'PER' | 'FLAT';
  markup?: number;
  markup_type?: 'PER' | 'FLAT';
  status?: boolean;
}

export interface IGetDynamicFareTaxData {
  id: number;
  dynamic_fare_supplier_id: number;
  airline: string;
  tax_name: string;
  commission: number | null;
  commission_type: 'PER' | 'FLAT' | null;
  markup: number | null;
  markup_type: 'PER' | 'FLAT' | null;
  status: boolean;
}

export interface IUpdateDynamicFareTaxPayload {
  id: number;
  dynamic_fare_supplier_id?: number;
  airline?: string;
  tax_name?: string;
  commission?: number;
  commission_type?: 'PER' | 'FLAT';
  markup?: number;
  markup_type?: 'PER' | 'FLAT';
  status?: boolean;
}
