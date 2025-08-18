export interface ITourPackagePayload {
  id?: number;
  key_highlights?:number;
  city_id?: number;
  title?: string;
  details?: string;
  tour_type?: string;
  duration?: number;
  adult_price?: number;
  child_price?: number;
  discount?: number;
  discount_type?: "FLAT" | "PERCENTAGE";
  is_featured?: boolean;
  valid_till_date?: Date;
  group_size?: number;
  status?: boolean;
  created_by?: number;
  created_at?: Date;
  is_deleted?: boolean;
  itinerary?: string;
  cancellation_policy?: string;
  tax?: string;
  general_condition?: string;
  installment?: string;
  b2b_adult_price?: number;
  b2b_child_price?: number;
  b2c_adult_price?: number;
  b2c_child_price?: number;
  b2b_discount?: number;
  b2c_discount?: number;
  b2b_discount_type?: "FLAT" | "PERCENTAGE";
  b2c_discount_type?: "FLAT" | "PERCENTAGE";
}

export interface ITourPackageImagePayload {
  id?: number;
  tour_id?: number;
  details?: string;
  photo?: string;
  created_at?: Date;
}

export interface ITourTypePayload {
  id?: number;
  type_name?: string;
  status?: boolean;
}

export interface IPackageItineraryPayload {
  id?: number;
  tour_id: number;
  day_number?: number;
  date?: Date;
  location?: string;
  sightseeing?: string;
  stay_location?: string;
  meals?: string;
  snacks?: string;
}

export interface IIncludeExcludePayload {
  id?: number;
  tour_id: number;
  type?: "INCLUDE" | "EXCLUDE";
  title?: string;
}

export interface IPackageServicesPayload {
  id?: number;
  tour_id: number;
  type?: string;
  title?: string;
}


export interface IPackageReviewPayload{
    id?:number;
    tour_id:number;
    booking_id?:number;
    user_id:number;
    rating:number;
    details?:string;
}