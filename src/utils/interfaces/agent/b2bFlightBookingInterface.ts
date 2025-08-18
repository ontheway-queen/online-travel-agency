export interface IInsertFlightSegmentPayload {
  flight_booking_id: number;
  flight_number?: string;
  airline?: string;
  airline_code?: string;
  airline_logo?: string;
  origin?: string;
  destination?: string;
  class?: string;
  baggage?: string;
  departure_date?: string | Date;
  arrival_date?: string | Date;
  departure_time?: string;
  arrival_time?: string;
  aircraft?: string;
  duration?: string;
  departure_terminal?: string;
  arrival_terminal?: string;
  segment_key?: number | string;
}

export interface IInsertFlightTravelerPayload {
  flight_booking_id: number;
  passenger_key?: number | string;
  type?: string;
  mid_name?: string;
  sur_name?: string;
  date_of_birth?: string | Date | null;
  gender?: string;
  passport_number?: string;
  passport_expiry_date?: string | Date;
  nationality?: number;
}

export interface ICreateFlightBookingPayload {
  created_by?: number;
  agency_id?: number;
  pnr_code?: string | null;
  total_passenger: number;
  base_fare: number;
  total_tax: number;
  journey_type?: string;
  payable_amount: number;
  ait?: number;
  discount?: number;
  convenience_fee?: number;
  markup?: {
    base_fare: number;
    markup: number;
  };
  refundable?: boolean;
  api?: string;
  route?: string;
  booking_id?: string;
  airline_pnr?: string | null;
  api_booking_ref?: string | null;
  last_time?: string | null;
  status?: string;
  vendor_price?: {};
  partial_payment?: {};
  manual_booking?: boolean;
  ticket_issued_on?: Date;
}

export interface IFlightTicketIssuePayload {
  flight_booking_id: number;
  traveler_given_name?: string;
  traveler_surname?: string;
  traveler_reference?: string;
  reservation_code?: string;
  date_issued?: string;
  ticket_number?: string;
  issuing_airline?: string;
  issuing_agent?: string;
  issuing_agent_location?: string;
  iata_number?: string;
  sub_total?: number;
  taxes?: number;
  total?: number;
  traveler_type?: string;
  currency?: string;
}

export interface IFlightTicketIssueSegmentPayload {
  flight_booking_id: number;
  airline_name?: string;
  airline_code?: string;
  flight_number?: string;
  reservation_code?: string;
  departure_address?: string;
  departure_time?: string;
  departure_terminal?: string;
  arrival_address?: string;
  arrival_time?: string;
  arrival_terminal?: string;
  departure_date?: string;
  cabin_type?: string;
  cabin_code?: string;
  status?: string;
  fare_basis?: string;
  bags?: string;
  operated_by?: string;
  from_airport_code?: string;
  to_airport_code?: string;
  arrival_date?: string;
}

export interface IInsertB2BFlightBookingTrackingPayload {
  flight_booking_id: number;
  details: string;
}

export interface ICreateFlightBookingSSRPayload {
  traveler_key: number | string;
  segment_key: number | string;
  type: string;
  code: string;
  amount: number;
  description: string;
  booking_id: number;
}

export interface IInsertFlightFareRulesPayload {
  flight_booking_id: number;
  rule_text: string;
}

export interface IFlightFareRules {
  flight_booking_id: number;
  rule_text: string;
}
