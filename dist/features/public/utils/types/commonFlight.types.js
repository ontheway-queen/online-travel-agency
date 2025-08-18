"use strict";
// export interface IMultiAPIFlightSearchReqBody {
//   JourneyType: '1' | '2' | '3';
//   airline_code: { Code: string }[];
//   OriginDestinationInformation: {
//     RPH: string;
//     DepartureDateTime: string;
//     OriginLocation: {
//       LocationCode: string;
//     };
//     DestinationLocation: {
//       LocationCode: string;
//     };
//     TPA_Extensions: {
//       CabinPref: {
//         Cabin: '1' | '2' | '3' | '4'; //1 = Economy, 2=Premium economy, 3=business, 4=first
//         PreferLevel: string;
//       };
//     };
//   }[];
//   PassengerTypeQuantity: {
//     Code: string;
//     Quantity: number;
//   }[];
// }
// // IMultiAPISabreFlightFormattedReqBodyV4
// export interface IMultipleAPIFlightBookingPassengerReqBody {
//   type: string;
//   reference: string;
//   first_name: string;
//   last_name: string;
//   contact_number?: string;
//   contact_email?: string;
//   date_of_birth: string;
//   gender: string;
//   passport_number?: string;
//   passport_issue_date?: string;
//   passport_expiry_date?: string;
//   nationality?: number;
//   issuing_country?: number;
//   frequent_flyer_airline?: string;
//   frequent_flyer_number?: string;
//   key?: string;
//   visa_file?: string;
//   passport_file?: string;
//   save_information?: boolean;
//   _ref?: string;
// }
// export interface IMultiFlightAvailability {
//   from_airport: string;
//   to_airport: string;
//   segments: IMultiFlightDataAvailabilitySegment[];
// }
// export interface IMultiFlightDataAvailabilityPassenger {
//   type: string;
//   count: number;
//   meal_type: string | undefined;
//   meal_code: string | undefined;
//   cabin_code: string | undefined;
//   cabin_type: string | undefined;
//   booking_code: string | undefined;
//   available_seat: number | undefined;
//   available_break: boolean | undefined;
//   available_fare_break: boolean | undefined;
//   baggage_unit: string | null;
//   baggage_count: string | null;
// }
// export interface IMultiFlightDataAvailabilitySegment {
//   name: string;
//   passenger: IMultiFlightDataAvailabilityPassenger[];
// }
// export interface IMultipleApiBookingRequestBody {
//   search_id: string;
//   flight_id: string;
//   passengers: IMultipleApiPassengerBody[];
// }
// export interface IMultipleApiPassengerBody {
//   save_information?: boolean;
//   type: string;
//   reference: string;
//   first_name: string;
//   last_name: string;
//   contact_number?: string;
//   date_of_birth: string;
//   gender: string;
//   contact_email?: string;
//   nationality?: number;
//   issuing_country?: number;
//   frequent_flyer_number?: string;
//   frequent_flyer_airline?: string;
//   passport_number?: string;
//   passport_expiry_date?: string;
// }
// // Common types for response after format==============
// export interface ILegDescription {
//   departureDate: string;
//   departureLocation: string;
//   arrivalLocation: string;
// }
// export interface IFormattedFlightItinerary {
//   journey_type?: string;
//   leg_description: ILegDescription[];
//   domestic_flight: boolean;
//   price_changed: boolean;
//   direct_ticket_issue: boolean;
//   flight_id: string;
//   api_search_id: string;
//   booking_block: boolean;
//   api: string;
//   fare: IFormattedFare;
//   carrier_code: string;
//   carrier_name: string;
//   carrier_logo: string;
//   ticket_last_date: string;
//   ticket_last_time: string;
//   refundable: boolean;
//   flights: IFormattedFlight[];
//   passengers: IFormattedPassenger[];
//   availability: IMultiFlightAvailability[];
// }
// export interface IFormattedFlight {
//   id: number;
//   elapsed_time?: number;
//   stoppage?: number;
//   options: IFormattedFlightOption[];
//   layover_time: number[];
// }
// export interface IFormattedFlightOption {
//   segment_ref?: string;
//   id: number;
//   elapsedTime: number;
//   total_miles_flown?: number | null;
//   departure: IFormattedDeparture;
//   arrival: IFormattedArrival;
//   carrier: IFormattedCarrier;
// }
// export interface IFormattedDeparture {
//   airport: string;
//   city: string;
//   airport_code: string;
//   city_code: string;
//   country: string;
//   terminal: string | undefined;
//   time: string;
//   date: string | Date;
//   date_adjustment: number | undefined;
// }
// export interface IFormattedArrival {
//   airport: string;
//   airport_code: string;
//   city_code: string;
//   city: string;
//   country: string;
//   time: string;
//   terminal: string | undefined;
//   date: string | Date;
//   date_adjustment: number | undefined;
// }
// export interface IFormattedCarrier {
//   carrier_marketing_code: string;
//   carrier_marketing_airline: string;
//   carrier_marketing_logo: string;
//   carrier_marketing_flight_number: string;
//   carrier_operating_code: string;
//   carrier_operating_airline: string;
//   carrier_operating_logo: string;
//   carrier_operating_flight_number: string;
//   carrier_aircraft_code: string;
//   carrier_aircraft_name: string;
// }
// interface IFormattedFare {
//   base_fare: number;
//   total_tax: number;
//   discount: number;
//   convenience_fee: number;
//   total_price: number;
//   payable: number;
//   ait: number;
// }
// export interface IFormattedPassenger {
//   type: string;
//   number: number;
//   fare: {
//     total_fare: number;
//     tax: number;
//     base_fare: number;
//   };
// }
// export interface ICheckDirectBookingPermissionPayload {
//   commission_set_id: number;
//   api_name: string;
//   airline: string;
// }
