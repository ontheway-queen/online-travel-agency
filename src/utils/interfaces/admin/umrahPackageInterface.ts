export interface IUmrahpackagePayload {
  id?: number;
  package_name: string;
  description?: string;
  duration?: number;
  is_featured?: boolean;
  valid_till_date?: Date;
  group_size?: number;
  status?: boolean;
  created_by?: number;
  created_at?: Date;
  is_deleted?: boolean;
  b2b_price_per_person?: number;
  b2c_price_per_person?: number;
  b2b_discount?: number;
  b2c_discount?: number;
  b2b_discount_type?: string;
  b2c_discount_type?: string;
  journey_start_date?: Date;
  journey_end_date?: Date;
  itinerary?: string;
  include?: string;
  exclude?: string;
  total_accommodation?: number;
  total_destination?: number;
  meeting_point?: number;
  payment_policy?:string;
  visa_requirements?:string;
  cancellation_policy?:string;
  general_remarks?:string;
}

export interface IUmrahPackagePhotosPayload {
  id?: number;
  umrah_id?: number;
  photo?: string;
}

export interface IUmrahDetailDescriptionPayload{
  id?:number,
  title?:string,
  description?:string,
  meta_title?:string,
  meta_description?:string,
  cover_img?:string,
  page:string
  status:boolean
}
