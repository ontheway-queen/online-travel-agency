//////////////-------REQUEST BODY(START)---------------///////////////

//flight search req body (START)
export interface IFlightSearchReqBody {
    adults: number;
    childs?: number;
    infants?: number;
    journeyType: 1 | 2 | 3; // 1=One Way, 2=Round Trip, 3=Multi City
    class: "Economy" | "Premium Economy" | "Business" | "First";
    preferredCarriers?: string[]; // List of preferred airline carriers
    childrenAges?: number[]; // Required if childs > 0
    fare_type: "1" | "2"; // 1=General, 2=Labor fare
    routes: IFlightRoute[];
}

export interface IFlightRoute {
    origin: string;
    destination: string;
    departureDate: string; // Format: YYYY-MM-DD
}
//flight search req body (END)



//flight booking req body(start)
export interface IBookingPassengerPayload {
    PassengerType: "ADT" | "CNN" | "INF";
    Title: string; //"Mr" | "Mrs" | "Ms" | "Miss" | "MSTR"
    FirstName: string;
    LastName: string;
    Gender: "Male" | "Female";
    DateOfBirth: string;
    PassportNumber?: string;
    PassportExpireDate?: string;
    Nationality: string;
    IssuingCountry: string;
    IsWheelchair: boolean;
    PhoneCountryCode: string;
    Phone: string;
    Email: string;
}

interface IBookingContactPayload {
    Email: string;
    Phone: string;
    PhoneCountryCode: string;
}

export interface IBookingPayload {
    PassengerInfoes: IBookingPassengerPayload[];
    ContactInfo: IBookingContactPayload;
    UniqueTransID: string;
    ItemCodeRef: string;
    PriceCodeRef: string;
}
//flight booking req body(end)

//////////////-------REQUEST BODY(END)---------------///////////////



















//////////////-------RESPONSE BODY(START)---------------///////////////

//Flight search response (START)
export interface IFlightSearchResBody {
    AirSearchResponses: IAirSearchResponses[];
    AirlineFilters: IAirlineFilters[];
    MinMaxPrice: {
        MinPrice: number;
        MaxPrice: number;
    };
    Stops: number[];
    TotalFlights: number;
    Currency: string;
    FinalResponseTime: string;
}

interface IAirlineFilters {
    AirlineCode: string;
    AirlineName: string;
    TotalFlights: number;
    MinPrice: number;
}

export interface IAirSearchResponses {
    IsBaggageChanged: any;
    IsPriceChanged: any;
    Directions: IFlightDirection[][];
    BookingComponent: IBookingComponent;
    PassengerFares: IPassengerFares[];
    UniqueTransID: string;
    ItemCodeRef: string;
    TotalPrice: number;
    BasePrice: number;
    EqivqlBasePrice: number;
    Taxes: number;
    PlatingCarrierName: string;
    PlatingCarrier: string;
    FareType: string;
    FareTypeDec: string;
    Refundable: boolean;
    Bookable: boolean;
    AvlSrc: string;
    PriceCodeRef?: string;
}

export interface IFlightDirection {
    Origin: string;
    OriginName: string;
    Destination: string;
    DestinationName: string;
    PlatingCarrierCode: string;
    PlatingCarrierName: string;
    Stops: number;
    Segments: IFlightSegment[];
    DirectionTotalTime: string;
}

interface IPassengerFares {
    PassengerType: "ADT" | "CHD" | "INF";
    PassengerCount: number;
    DiscountPrice: number;
    AIT: number;
    TotalPrice: number;
    BasePrice: number;
    EquivalentBasePrice: number;
    Taxes: number;
    ServiceCharge: number;
    TaxesBreakdown: any;
}

interface IBookingComponent {
    DiscountPrice: number;
    TotalPrice: number;
    BasePrice: number;
    Taxes: number;
    AIT: number;
    FareReference: string;
    AgentAdditionalPrice: number;
}

interface IFlightSegmentDetails {
    Origin: string;
    OriginName: string | null;
    Destination: string;
    DestinationName: string | null;
    OriginTerminal: string;
    DestinationTerminal: string;
    Departure: string;
    Arrival: string;
    FlightTime: string;
    TravelTime: string;
    Equipment: string | null;
}

export interface IBaggageDetails {
    Units: string;
    Amount: number;
    PassengerTypeCode: string;
}

export interface IFlightSegment {
    Origin: string;
    OriginName: string;
    Destination: string;
    DestinationName: string;
    Group: number;
    Departure: string;
    Arrival: string;
    Airline: string;
    FlightNumber: string;
    SegmentCodeRef: string;
    Details: IFlightSegmentDetails[];
    ServiceClass: string;
    Plane: (string | null)[];
    Duration: string[];
    TechStops: any[];
    BookingClass: string;
    BookingCount: string;
    Baggage: IBaggageDetails[];
    FareBasisCode: string;
    AirlineCode: string;
    Equipment: string;
}
//Flight search response (END)
//////////////-------RESPONSE BODY(END)---------------///////////////