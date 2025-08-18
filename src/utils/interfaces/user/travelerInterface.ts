export interface IInsertTravelerPayload {
  first_name: string;
  sur_name: string;
  mobile_number?: string;
  date_of_birth: string;
  email?: string;
  type: string;
  passport_number?: string;
  passport_expiry_date?: string;
  title: string;
  country_id?:number;
  city?:string;
  frequent_flyer_airline?:string;
  frequent_flyer_number?:string;
  user_id:number;
  nationality?:number;
  issuing_country?:number;
  visa_file?:string;
  passport_file?:string;
  passenger_key?: string | number;
}

export interface IGetTravelerQuery {
  user_id?: number;
  name?: string;
  // gender?: string;
  type?: string;
  // country_id?: number;
  limit?: string;
  skip?: string;
  deleted: boolean;
  city_id?:number;
  status?:number;
}

export interface IUpdateTravelerPayload {
  title?: string;
  first_name?: string;
  deleted?: boolean;
  sur_name?: string;
  mobile_number?: string;
  date_of_birth?: string;
  // gender?: string;
  email?: string;
  type?: string;
  // address?: string;
  passport_number?: string;
  passport_expiry_date?: string;
  country_id?: number;
  frequent_flyer_number?: string;
  // passport_file?: string;
  frequent_flyer_airline?:string;
  city?:string;
  status?: number;
}
