export interface ITourPackageBooking {
  tour_id: number; // Required positive integer
  traveler_adult: number; // Required non-negative integer
  traveler_child?: number; // Optional non-negative integer
  adult_price: number; // Required positive number
  child_price?: number; // Optional positive number
  discount?: number; // Optional non-negative number
  discount_type?: 'FLAT' | 'PERCENTAGE'; // Optional with specific allowed values
  note_from_customer?: string; // Optional string
  travel_date: string; // Required ISO date string
  double_room?: number; // Optional non-negative integer
  twin_room?: number; // Optional non-negative integer
}

export interface ICreateBookAddress {
  first_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface tourPackageBookingFilterQuery {
  status?: string;
  limit?: number;
  skip?: number;
  user_id?: number;
  agency_id?: number;
  from_travel_date?: string;
  to_travel_date?: string;
  title?: string;
  user_name?: string;
}

export interface IUpdateBooking {
  status?: string; // Optional non-negative integer
}
