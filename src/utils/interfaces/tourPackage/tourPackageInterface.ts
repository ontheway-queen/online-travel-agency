export interface ICreateTourPackagePayload {
  city_id: number;
  title: string;
  details?: string;
  tour_type: string;
  duration: number;
  b2b_adult_price: number;
  b2c_adult_price: number;
  b2b_child_price?: number;
  b2c_child_price?: number;
  b2b_discount?: number;
  b2c_discount?: number;
  b2b_discount_type: "PERCENTAGE" | "FLAT";
  b2c_discount_type: "PERCENTAGE" | "FLAT";
  is_featured: boolean;
  valid_till_date: string;
  group_size: number;
  created_by: number;
  itinerary: string;
  cancellation_policy?: string;
  tax?: string;
  general_condition?: string;
  installment?: string;
}
export interface IUpdateTourPackagePayload {
  city_id?: number;
  title?: string;
  details?: string;
  tour_type?: string;
  duration?: number;
  adult_price?: number;
  child_price?: number;
  discount?: number;
  discount_type?: "PERCENTAGE" | "FLAT";
  is_featured?: boolean;
  valid_till_date?: string;
  group_size?: number;
  created_by?: number;
  b2b_adult_price?: number;
  b2b_child_price?: number;
  b2b_discount_type?: string;
  b2b_discount?: number;
  b2c_adult_price?: number;
  b2c_child_price?: number;
  b2c_discount_type?: string;
  b2c_discount?: number;
  itinerary?: string;
  cancellation_policy?: string;
  tax?: string;
  general_condition?: string;
  installment?: string;
}

export interface IInsertPackagePhoto {
  tour_id: number;
  photo: string;
  details?: string;
}
export interface IInsertPackageItinerary {
  tour_id: number;
  day: string;
  title: string;
  photo: string;
  details?: string;
}
export interface IInsertPackageInEx {
  tour_id: number;
  type: "INCLUDED" | "EXCLUDED";
  title: string;
}

export interface tourPackageFilterQuery {
  title?: string;
  duration?: string;
  type?: string;
  s_type?: string;
  place?: string;
  date?: string;
  b2b_price_from_range?: string;
  b2b_price_to_range?: string;
  b2c_price_from_range?: string;
  b2c_price_to_range?: string;
  status?: boolean;
  limit?: number;
  skip?: number;
  tour_type?: string;

  country_id?: number;
  from_date?: string;
  to_date?: string;
  from_range?: string;
  to_range?: string;
  sort_by?: string;
  is_featured?: boolean;
  city_id?: number;
}

export interface ICreateTourPackageServicesPayload {
  tour_id: number;
  type: "exclude" | "include" | "highlight";
  title: string;
}

export interface ITourPackageRequestPayload {
  tour_package_id: number;
  request_city_id?: number;
  request_date: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email: string;
  user_phone: string;
  requirements?: string;
}

export interface ITourPackageRequestParams {
  id?: number;
  tour_package_id?: number;
  request_city_id?: number;
  request_date?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  user_phone?: string;
  requirements?: string;
  created_at?: string;
  limit?: number;
  skip?: number;
  start_date?: Date;
  end_date?: Date;
  key?: string;
}

export interface ITourPackageReviewPayload {
  tour_id: number;
  booking_id?: number;
  user_id: number;
  rating: number;
  details?: string;
}

export interface ITourPackageReviewParams {
  id?: number;
  tour_id?: number;
  booking_id?: number;
  user_id?: number;
  rating?: number;
  created_at?: Date;
  limit?: number;
  skip?: number;
  order_by?: string;
  order_to?: string;
}

export interface ITourPackageReviewPhotoPayload {
  package_review_id: number;
  photo: string;
}
