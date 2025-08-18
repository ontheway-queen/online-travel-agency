export interface OTPType {
  type:
    | 'reset_user'
    | 'reset_admin'
    | 'verify_user'
    | 'reset_agent'
    | 'agent_2FA'
    | 'verify_agent'
    | 'admin_2FA'
    | 'verify_agent'
    | 'verify_admin'
    | 'transaction_verify'
    | 'admin_transaction';
}
export interface IInsertOTPPayload extends OTPType {
  hashed_otp: string;
  email?: string;
}

export interface IGetOTPPayload extends OTPType {
  email: string;
}

export interface ICreateAirportPayload {
  country_id: number;
  name: string;
  iata_code: string;
  city?: number;
}
export interface IUpdateAirportPayload {
  country_id?: number;
  name?: string;
  iata_code?: string;
  city?: number;
}

export interface ICreateAirlinesPayload {
  code: string;
  name: string;
  logo: string;
}
export interface IUpdateAirlinesPayload {
  code?: string;
  name?: string;
  logo?: string;
}

export interface IAnnouncementBarPayload {
  message?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  link?: string;
  type?: 'B2B' | 'B2C';
}
