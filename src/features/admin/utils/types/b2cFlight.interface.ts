import { CUSTOM_API, FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_ISSUE, JOURNEY_TYPE_MULTI_CITY, JOURNEY_TYPE_ONE_WAY, JOURNEY_TYPE_ROUND_TRIP, SABRE_API, TRIPJACK_API, VERTEIL_API } from "../../../../utils/miscellaneous/flightMiscellaneous/flightConstants";

export interface IEditBookingPayload {
    pnr_code?: string;
    status?: string;
    last_time?: string;
    airline_pnr?: string;
    travelers?: {
        id: number;
        title?: string;
        first_name?: string;
        last_name?: string;
        type?: string;
        date_of_birth?: Date;
        gender?: string;
        nationality?: number;
        issuing_country?: number;
        email?: string;
        contact_number?: string;
        passport_number?: string;
        passport_expiry_date?: Date;
        ticket_number?: string;
    }[];
    segments?: {
        id: number;
        class?: string;
        baggage?: string;
        departure_date?: Date;
        arrival_date?: Date;
        departure_time?: string;
        arrival_time?: string;
        departure_terminal?: string;
        arrival_terminal?: string;
    }[]
}

export interface IAdminB2CFlightManualBookingPayload {
    user_id: number;
    api: typeof SABRE_API | typeof TRIPJACK_API | typeof VERTEIL_API | typeof CUSTOM_API;
    pnr_code?: string;
    base_fare: number;
    total_tax: number;
    ait: number;
    discount: number;
    convenience_fee: number;
    markup: number;
    journey_type: typeof JOURNEY_TYPE_ONE_WAY | typeof JOURNEY_TYPE_ROUND_TRIP | typeof JOURNEY_TYPE_MULTI_CITY;
    refundable: boolean;
    last_time?: string;
    airline_pnr: string;
    api_booking_ref?: string;
    vendor_price?: {
        base_fare: number;
        tax: number;
        charge: number;
        discount: number;
    },
    leg_description: {
        departureLocation: string;
        arrivalLocation: string;
    }[];
    flights: IAdminB2CFlightManualBookingFlightPayload[];
    travelers: IAdminB2CFlightManualBookingTravelerPayload[];
    status: typeof FLIGHT_BOOKING_CONFIRMED | typeof FLIGHT_TICKET_ISSUE;
    paid: boolean;
}

interface IAdminB2CFlightManualBookingFlightPayload {
    airline_code: string;
    flight_number: string;
    origin: string;
    destination: string;
    class: string;
    baggage: string;
    departure_date: Date;
    departure_time: string;
    departure_terminal?: string;
    arrival_date: Date;
    arrival_time: string;
    arrival_terminal?: string;
    aircraft?: string;
}

interface IAdminB2CFlightManualBookingTravelerPayload {
    key: string;
    type: "ADT" | "C02" | "C03" | "C04" | "C05" | "C06" | "C07" | "C08" | "C09" | "C10" | "C11" | "CHD" | "INF";
    reference: "Mr" | "Mrs" | "Ms" | "Miss" | "MSTR";
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
    date_of_birth: Date;
    gender: "Male" | "Female";
    passport_number?: string;
    passport_expiry_date?: Date;
    issuing_country?: number;
    nationality?: number;
    frequent_flyer_airline?: string;
    frequent_flyer_number?: string;
    ticket_number?: string;
    visa_file?: string;
    passport_file?: string;
}