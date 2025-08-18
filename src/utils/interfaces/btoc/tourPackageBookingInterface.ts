import { ITourPackagePayload } from "../admin/tourpackageInterface";

export interface IFixedPackageBookingPayload extends ITourPackagePayload{
  user_id: number;
  tour_id: number;
  traveler_adult: number;
  traveler_child: number;
  note_from_customer?: string;
  travel_date: Date;
  double_room?: number;
  twin_room?: number;
}


export interface ICustomizePackageBookingPayload {
  tour_id:number;
  full_name:string;
  email:string,
  phone:number,
  address:string,
  note:string,
}

export interface IUpdateBooking {
  tour_id?: number; // Required positive integer
  traveler_adult?: number; // Required non-negative integer
  traveler_child?: number; // Optional non-negative integer
  adult_price?: number; // Required positive number
  child_price?: number; // Optional positive number
  discount?: number; // Optional non-negative number
  discount_type?: 'FLAT' | 'PERCENTAGE'; // Optional with specific allowed values
  note_from_customer?: string; // Optional string
  travel_date?: string; // Required ISO date string
  double_room?: number; // Optional non-negative integer
  twin_room?: number; // Optional non-negative integer
  status?: string; // Optional non-negative integer
}