import { IUmrahpackagePayload } from '../admin/umrahPackageInterface';

export interface IUmrahPackageBookingPayload {
  id?:number;
  user_id?: number;
  umrah_id: number;
  agency_id?: number;
  created_by?: number;
  traveler_adult: number;
  traveler_child: number;
  note_from_customer?: string;
  travel_date: Date;
  double_room?: number;
  twin_room?: number;
  price_per_person: number;
  discount: number;
  discount_type: string;
}

export interface IUmrahPackageBookingContactPayload {
  id?:number;
  booking_id: number;
  first_name: string;
  email: string;
  phone: number;
  address: string;
  
}
