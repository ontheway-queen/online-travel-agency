export const SABRE_TOKEN_ENV = 'sabre_token';
export const VERTEIL_TOKEN_ENV = 'verteil_token';
export const TRAVELPORT_REST_TOKEN_ENV = 'travelport_rest_token';

export const SABRE_FLIGHT_ITINS = '200ITINS';

// Route type
export const ROUTE_TYPE: {
  FROM_DAC: 'FROM_DAC';
  TO_DAC: 'TO_DAC';
  DOMESTIC: 'DOMESTIC';
  SOTO: 'SOTO';
} = {
  FROM_DAC: 'FROM_DAC',
  TO_DAC: 'TO_DAC',
  DOMESTIC: 'DOMESTIC',
  SOTO: 'SOTO',
};

// API Name Const
export const SABRE_API = 'SABRE';
export const VERTEIL_API = 'VERTEIL';
export const CUSTOM_API = 'CUSTOM';
export const TRAVELPORT_REST_API = 'TRAVELPORT-REST';
export const TRIPJACK_API = 'TRIPJACK';
export const US_BANGLA_API = 'US BANGLA';

// airlines MARKUP const
export const MARKUP_TYPE_PER = 'PER';
export const MARKUP_TYPE_FLAT = 'FLAT';
export const MARKUP_MODE_INCREASE = 'INCREASE';
export const MARKUP_MODE_DECREASE = 'DECREASE';

//booking status
export const FLIGHT_BOOKING_REQUEST = 'PENDING';
export const FLIGHT_BOOKING_CONFIRMED = 'BOOKED';
export const FLIGHT_BOOKING_VOID = 'VOIDED';
export const FLIGHT_BOOKING_IN_PROCESS = 'BOOKING IN PROCESS';
export const FLIGHT_TICKET_IN_PROCESS = 'TICKET IN PROCESS';
export const FLIGHT_BOOKING_ON_HOLD = 'ON HOLD';
export const FLIGHT_TICKET_ISSUE = 'ISSUED';
export const FLIGHT_BOOKING_PROCESSING = 'PROCESSING';
export const FLIGHT_BOOKING_EXPIRED = 'EXPIRED';
export const FLIGHT_BOOKING_CANCELLED = 'CANCELLED';
export const FLIGHT_BOOKING_REFUNDED = 'REFUNDED';
export const FLIGHT_BOOKING_REISSUED = 'REISSUED';
export const FLIGHT_BOOKING_PAID = 'PAID';

//journey type
export const JOURNEY_TYPE_ONE_WAY = 'ONE WAY';
export const JOURNEY_TYPE_ROUND_TRIP = 'ROUND TRIP';
export const JOURNEY_TYPE_MULTI_CITY = 'MULTI CITY';

//ticket issue payment type
export const PAYMENT_TYPE_FULL = 'full';
export const PAYMENT_TYPE_PARTIAL = 'partial';
export const PARTIAL_PAYMENT_PERCENTAGE = 30;
export const PARTIAL_PAYMENT_DEPARTURE_DATE = 10;

//booking traveler files
export const TRAVELER_FILE_TYPE_PASSPORT = 'passport';
export const TRAVELER_FILE_TYPE_VISA = 'visa';

//min days before departure for direct ticket issue
export const MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET = 2;

//redis key for flight revalidate data
export const FLIGHT_REVALIDATE_REDIS_KEY = 'FLIGHT ID - ';

// Priority airport on search
export const PRIORITY_AIRPORTS = [
  'DAC',
  'CGP',
  'ZYL',
  'CXB',
  'SPD',
  'RJH',
  'JSR',
  'BZL',
  'JED',
  'MCT',
  'DOH',
  'RUH',
  'DXB',
  'KUL',
  'DMM',
  'SIN',
  'SHJ',
  'MED',
  'BKK',
  'KTM',
  'AUH',
  'KWI',
  'LHR',
  'MAA',
  'CAN',
  'JFK',
  'AHB',
  'CMB',
  'DEL',
  'CCU',
  'MLE',
  'IXA',
  'BOM',
];

//pending ticket issuance status
export const PENDING_TICKET_ISSUANCE_STATUS = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

//flight fare response
export const FLIGHT_FARE_RESPONSE =
  "Cancellation:<br/>Refund Amount = Paid Amount - Airline Cancellation Fee<br/>Re-issue:<br/>Re-issue Fee = Airline Fee + Fare Difference<br/>Validity:<br/>Re-issue or refund is subject to the original fare rules and route restrictions.<br/>*The airline's fee is indicative and per person. Fare rules are subject to airline policies and may vary.";

export const PTC_TYPES_CHILD = [
  'CHD',
  'C02',
  'C03',
  'C04',
  'C05',
  'C06',
  'C07',
  'C08',
  'C09',
  'C10',
  'C11',
];

export const CLASS_NAME = {
  economy: 'ECONOMY',
  business: 'BUSINESS',
  first: 'FIRST',
  PREMIUM: 'PREMIUM',
};
