export interface IOriginDestinationInformationPayload {
  RPH: string;
  DepartureDateTime: string;
  OriginLocation: {
    LocationCode: string;
  };
  DestinationLocation: {
    LocationCode: string;
  };
  TPA_Extensions: {
    CabinPref: {
      Cabin: '1' | '2' | '3' | '4'; //1 = Economy, 2=Premium economy, 3=business, 4=first
      PreferLevel: string;
    };
  };
}

export interface IPassengerTypeQuantityPayload {
  Code: string;
  Quantity: number;
}

export interface IAirlineCodePayload {
  Code: string;
}

export interface IFlightSearchReqBody {
  JourneyType: '1' | '2' | '3';
  airline_code: IAirlineCodePayload[];
  OriginDestinationInformation: IOriginDestinationInformationPayload[];
  PassengerTypeQuantity: IPassengerTypeQuantityPayload[];
}

export interface IFlightAvailability {
  from_airport: string;
  to_airport: string;
  segments: IFlightDataAvailabilitySegment[];
}

export interface IFlightDataAvailabilityPassenger {
  type: string;
  count: number;
  meal_type: string | undefined;
  meal_code: string | undefined;
  cabin_code: string | undefined;
  cabin_type: string | undefined;
  booking_code: string | undefined;
  available_seat?: number | undefined;
  available_break?: boolean | undefined;
  available_fare_break?: boolean | undefined;
  baggage_info: string;
  // baggage_unit: string | null;
  // baggage_count: string | null;
}

export interface IFlightDataAvailabilitySegment {
  name: string;
  passenger: IFlightDataAvailabilityPassenger[];
}

// Common types for response after format==============

export interface ILegDescription {
  departureDate: string;
  departureLocation: string;
  arrivalLocation: string;
}
export interface IFormattedFlightItinerary {
  journey_type: '1' | '2' | '3';
  leg_description: ILegDescription[];
  domestic_flight: boolean;
  partial_payment: {
    partial_payment: boolean;
    payment_percentage: number;
    travel_date_from_now: number;
  };
  price_changed?: boolean;
  direct_ticket_issue?: boolean;
  flight_id: string;
  api_search_id: string;
  booking_block: boolean;
  api: string;
  fare: IFormattedFare;
  carrier_code: string;
  carrier_name: string;
  carrier_logo: string;
  ticket_last_date: string;
  ticket_last_time: string;
  refundable: boolean;
  flights: IFormattedFlight[];
  passengers: IFormattedPassenger[];
  availability: IFlightAvailability[];
  fare_rules?: string;
}

export interface IFormattedFlight {
  id: number | string;
  elapsed_time?: number;
  stoppage?: number;
  options: IFormattedFlightOption[];
  layover_time: number[];
}

export interface IFormattedFlightOption {
  id: number | string;
  elapsedTime: number;
  stopCount?: number;
  total_miles_flown?: number;
  departure: IFormattedDeparture;
  arrival: IFormattedArrival;
  carrier: IFormattedCarrier;
  segmentGroup?: number;
  ssr?: {
    meal?: {
      code: string;
      amount: number;
      desc: string;
      equivalent_amount: number;
    }[];
    baggage?: {
      code: string;
      amount: number;
      desc: string;
      equivalent_amount: number;
    }[];
  };
}

export interface IFormattedDeparture {
  airport: string;
  city: string;
  airport_code: string;
  city_code: string;
  country: string;
  terminal: string | undefined;
  time: string;
  date: string | Date;
  date_adjustment?: number | undefined;
}

export interface IFormattedArrival {
  airport: string;
  airport_code: string;
  city_code: string;
  city: string;
  country: string;
  time: string;
  terminal: string | undefined;
  date: string | Date;
  date_adjustment?: number | undefined;
}

export interface IFormattedCarrier {
  carrier_marketing_code: string;
  carrier_marketing_airline: string;
  carrier_marketing_logo: string;
  carrier_marketing_flight_number: string;
  carrier_operating_code: string;
  carrier_operating_airline: string;
  carrier_operating_logo: string;
  carrier_operating_flight_number: string;
  carrier_aircraft_code: string;
  carrier_aircraft_name: string;
}

interface IFormattedFare {
  base_fare: number;
  total_tax: number;
  discount: number;
  payable: number;
  ait: number;
  tax_fare?: any;
  vendor_price?: {
    base_fare: number;
    tax: number;
    charge: number;
    discount: number;
    gross_fare: number;
    net_fare: number;
  };
}

export interface IFormattedPassenger {
  type: string;
  number: number;
  fare: {
    total_fare: number;
    tax: number;
    base_fare: number;
  };
}
