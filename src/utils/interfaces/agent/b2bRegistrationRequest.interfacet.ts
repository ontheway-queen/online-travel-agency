export interface B2bRegistrationRequestPayload {
  name: string;
  email: string;
  mobile_number: string;
  photo?: string;
  trade_license?: string;
  nid?: string;
  tin?: string;
  address?: string;
  postal_code?: string;
  approved_by?: number;
  rejected_by?: number;
  rejected_reason?: string;
  visiting_card?: string;
}

export interface B2bRegistrationRequestParams {
  id?: number;
  name?: string;
  email?: string;
  mobile_number?: string;
  photo?: string;
  status?: boolean;
  created_at?: Date;
  trade_license?: string;
  nid?: string;
  tin?: string;
  address?: string;
  postal_code?: string;
  approved_by?: number;
  rejected_by?: number;
  rejected_reason?: string;
  state?: string;
  limit?: number;
  skip?: number;
  key?: string;
}
