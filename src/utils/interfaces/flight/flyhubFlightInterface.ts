
export interface IFlightSearchReqBody {
  OriginDestinationInformation: OriginDestinationInformation[];
  PassengerTypeQuantity: PassengerTypeQuantity[];
  EndUserIp?: string;
  JourneyType: 1 | 2 | 3;
}

interface IFlightReqBody {
  departure_time: string;
  departure_date: string;
  arrival_time: string;
  arrival_date: string;
  carrier_marketing_flight_number: number;
  departure_airport_code: string;
  arrival_airport_code: string;
  carrier_marketing_code: string;
  carrier_operating_code: string;
}

interface IOriginDestinationInformationReqBody {
  RPH: string;
  DepartureDateTime: string;
  OriginLocation: OriginLocation;
  DestinationLocation: DestinationLocation;
  flight: IFlightReqBody[];
}

export interface IFlightRevalidateReqBody {
  OriginDestinationInformation: IOriginDestinationInformationReqBody[];
  PassengerTypeQuantity: PassengerTypeQuantity[];
}

export interface OriginDestinationInformation {
  RPH: string;
  DepartureDateTime: string;
  OriginLocation: OriginLocation;
  DestinationLocation: DestinationLocation;
  TPA_Extensions: TpaExtensions;
}

export interface OriginLocation {
  LocationCode: string;
}

export interface DestinationLocation {
  LocationCode: string;
}

export interface TpaExtensions {
  CabinPref: CabinPref;
}

export interface CabinPref {
  Cabin:"1" | "2" | "3" | "4";
  PreferLevel: string;
}

export interface PassengerTypeQuantity {
  Code: string;
  Quantity: number;
}

export interface ISegmentsPayload {
    Origin: string;
    Destination: string;
    CabinClass: "1" | "2" | "3" | "4";
    DepartureDateTime: string;
}


export interface IAirPreBookPassengerPayload {
  Title: "Mr" | "Ms" | "Mrs";
  FirstName: string;
  LastName: string;
  PaxType: "Adult" | "Child" | "Infant";
  DateOfBirth: string;
  Gender: string;
  Address1: string;
  CountryCode: string;
  Nationality: string;
  ContactNumber: string;
  Email: string;
  PassportNumber?: string;
  PassportExpiryDate?: string;
  PassportNationality?: string;
  IsLeadPassenger: boolean;
}

export interface IAirPreBookPayload {
  SearchID: string;
  ResultID: string;
  Passengers: IAirPreBookPassengerPayload[];
}


