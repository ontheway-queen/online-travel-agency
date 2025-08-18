// Sabre Request Payload Types ==== Start ====================

export interface IMultiAPISabreFlightFormattedReqBodyV5 {
  OTA_AirLowFareSearchRQ: {
    Version: string;
    POS: {
      Source: {
        PseudoCityCode: string;
        RequestorID: {
          Type: string;
          ID: string;
          CompanyName: {
            Code: string;
            content: string;
          };
        };
      }[];
    };
    AvailableFlightsOnly: boolean;
    OriginDestinationInformation: OriginDestinationInformation[];
    TravelPreferences: {
      VendorPref: { Code: string }[];
      TPA_Extensions: {
        LongConnectTime: {
          Enable: boolean;
          Max: number;
          Min: number;
        };
        XOFares: {
          Value: boolean;
        };
        KeepSameCabin: {
          Enabled: boolean;
        };
      };
    };
    TravelerInfoSummary: {
      SeatsRequested: number[];
      AirTravelerAvail: {
        PassengerTypeQuantity: PassengerTypeQuantity[];
      }[];
    };
    TPA_Extensions: {
      IntelliSellTransaction: {
        RequestType: {
          Name: string;
        };
      };
    };
  };
}

export interface IMultiAPISabreFlightFormattedReqBodyV4 {
  OTA_AirLowFareSearchRQ: {
    AvailableFlightsOnly: boolean;
    OriginDestinationInformation: OriginDestinationInformation[];
    TravelerInfoSummary: {
      SeatsRequested: number[];
      AirTravelerAvail: {
        PassengerTypeQuantity: PassengerTypeQuantity[];
      }[];
    };
    POS: {
      Source: {
        PseudoCityCode: string;
        RequestorID: {
          CompanyName: {
            Code: string;
          };
          Type: string;
          ID: string;
        };
      }[];
    };
    ResponseType: string;
    TPA_Extensions: {
      IntelliSellTransaction: {
        RequestType: {
          Name: string;
        };
      };
    };

    TravelPreferences: {
      VendorPref?: {
        Code: string;
      }[];
      TPA_Extensions: {
        NumTrips: {
          Number: number;
        };
      };
    };
    Version: string;
  };
}

export interface PassengerTypeQuantity {
  Code: string;
  Quantity: number;
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
  Cabin: string;
  PreferLevel: string;
}



export interface ISecureFlight {
  PersonName: {
    NameNumber: string;
    DateOfBirth?: string;
    Gender?: string;
    GivenName: string;
    Surname: string;
  };
  SegmentNumber: string;
  VendorPrefs: {
    Airline: {
      Hosted: boolean;
    };
  };
}

export interface IContactNumber {
  NameNumber: string;
  Phone: string;
  PhoneUseType: 'H' | 'M';
}


// Sabre Request Payload Types ==== END =========================

// Sabre Flight Response Types=================== Start ==========

export interface ISabreResponseResult {
  version: string;
  statistics: {
    itineraryCount: number;
  };
  scheduleDescs: IScheduleDesc[];
  taxDescs: ITaxDesc[];
  taxSummaryDescs: ITaxSummeryDesc[];
  obFeeDescs?: IObFeeDesc[];
  fareComponentDescs: IFareComponentDesc[];
  baggageAllowanceDescs: IBaggageAllowanceDesc[];
  legDescs: ILegDesc[];
  itineraryGroups: IItineraryGroup[];
}

interface IScheduleDesc {
  id: 1;
  frequency: string;
  stopCount: number;
  eTicketable: boolean;
  totalMilesFlown: number;
  message?: string;
  messageType?: string;
  elapsedTime: number;
  departure: IDeparture;
  arrival: IArrival;
  carrier: ICarrier;
}

interface IDeparture {
  airport: string;
  city: string;
  state?: string;
  country: string;
  time: string;
  terminal?: string;
  dateAdjustment?: number;
}

interface IArrival {
  airport: string;
  airport_code: string;
  city: string;
  state?: string;
  country: string;
  time: string;
  terminal?: string;
  dateAdjustment?: number;
}
interface ICarrier {
  marketing: string;
  marketingFlightNumber: number;
  operating: string;
  operatingFlightNumber: number;
  equipment: {
    code: string;
    typeForFirstLeg: string;
    typeForLastLeg: string;
  };
}

interface ITaxDesc {
  id: number;
  code: string;
  amount: number;
  currency: string;
  description: string;
  publishedAmount: number;
  publishedCurrency: string;
  station: string;
  country?: string;
}

interface ITaxSummeryDesc {
  id: number;
  code: string;
  amount: number;
  currency: string;
  description: string;
  publishedAmount?: number;
  publishedCurrency?: string;
  station?: string;
  country?: string;
}

interface IObFeeDesc {
  id: number;
  amount: number;
  currency: string;
}

interface IFareComponentDesc {
  id: 1;
  governingCarrier: string;
  fareAmount: number;
  fareCurrency: string;
  fareBasisCode: string;
  farePassengerType: string;
  publishedFareAmount: number;
  directionality: string;
  applicablePricingCategories: string;
  vendorCode: string;
  fareTypeBitmap: string;
  fareType: string;
  fareTariff: string;
  fareRule: string;
  cabinCode: string;
  segments: {
    segment: {
      stopover?: boolean;
      surcharges?: {
        amount: number;
        currency: string;
        description: string;
        type: string;
      }[];
    };
  }[];
}

interface IBaggageAllowanceDesc {
  id: number;
  pieceCount?: number;
  weight?: number;
  unit?: string;
}

interface ILegDesc {
  id: number;
  elapsedTime: number;
  schedules: {
    ref: number;
    departureDateAdjustment?: number;
  }[];
}

interface IItineraryGroup {
  groupDescription: IGroupDescription;
  itineraries: IItinerary[];
}

interface IGroupDescription {
  legDescriptions: ILegDescription[];
}

interface ILegDescription {
  departureDate: string;
  departureLocation: string;
  arrivalLocation: string;
}

interface IItinerary {
  id: number;
  pricingSource: string;
  legs: { ref: number }[];
  pricingInformation: IPricingInformation[];
  diversitySwapper: {
    weighedPrice: number;
  };
}

interface IPricingInformation {
  pricingSubsource: string;
  fare: {
    tax_fare: { code: string; amount: number; }[][];
    validatingCarrierCode: string;
    vita: boolean;
    eTicketable: boolean;
    lastTicketDate: string;
    lastTicketTime: string;
    governingCarriers: string;
    passengerInfoList: IPassengerInfoList[];
    totalFare: ITotalFare;
  };
}

interface IPassengerInfoList {
  passengerInfo: {
    passengerType: string;
    passengerNumber: number;
    nonRefundable: boolean;
    fareComponents: IFareComponents[];
    taxes: ITaxes[];
    taxSummaries: ITaxSummary[];
    currencyConversion: ICurrencyConversion;
    passengerTotalFare: IPassengerTotalFare;
    baggageInformation: IBaggageInformation[];
  };
}

interface IFareComponents {
  ref: number;
  beginAirport: string;
  endAirport: string;
  segments: ISegment[];
}

interface IBaggageInformation {
  provisionType: string;
  airlineCode: string;
  segments: {
    id: number;
  }[];
  allowance: {
    ref: number;
  };
}

interface IPassengerTotalFare {
  totalFare: number;
  totalTaxAmount: number;
  currency: string;
  baseFareAmount: number;
  baseFareCurrency: string;
  equivalentAmount: number;
  equivalentCurrency: string;
  constructionAmount: number;
  constructionCurrency: string;
  commissionPercentage: number;
  commissionAmount: number;
  exchangeRateOne: number;
}

interface ICurrencyConversion {
  from: string;
  to: string;
  exchangeRateUsed: number;
}

interface ITaxes {
  ref: number;
}

interface ITaxSummary {
  ref: number;
}

interface ISegment {
  segment: {
    bookingCode: string;
    cabinCode: string;
    mealCode?: string;
    seatsAvailable: number;
    availabilityBreak?: true;
    fareBreakPoint?: true;
  };
}

interface ITotalFare {
  totalPrice: number;
  totalTaxAmount: number;
  currency: string;
  baseFareAmount: number;
  baseFareCurrency: string;
  constructionAmount: number;
  constructionCurrency: string;
  equivalentAmount: number;
  equivalentCurrency: string;
}

//=================================== End ==============================

// Formatted Sabre Response Type === Start =============================

// Sabre Data type after format response
export interface ISabreItinerary {
  leg_description?: ILegDescription;
  flight_id: string;
  api_search_id: string;
  api: string;
  fare: INewFare;
  carrier_code: string;
  carrier_name: string;
  carrier_logo: string;
  ticket_last_date: string;
  ticket_last_time: string;
  refundable: boolean;
  flights: INewLegDesc[];
  passengers: ISabreNewPassenger[];
}

export interface INewLegDesc {
  id: number;
  options: IFlightOption[];
  layover_time: number[];
}

export interface IFlightOption extends IScheduleDesc {
  departure_date: Date;
  arrival_date: Date;
  departure_time: string;
  arrival_time: string;
}

interface INewFare {
  base_fare: number;
  total_tax: number;
  discount: number;
  convenience_fee: number;
  total_price: number;
  payable: number;
}

export interface ISabreNewPassenger {
  type: string;
  number: number;
  fare: {
    total_fare: number;
    tax: number;
    base_fare: number;
  };
}

export interface IBaggageAndAvailabilityAllSeg {
  passenger_type: string;
  passenger_count: number;
  segmentDetails: IBaggageAndAvailabilityAllSegSegmentDetails[];
}

export interface IBaggageAndAvailabilityAllSegSegmentDetails {
  id: number;
  from_airport: string;
  to_airport: string;
  segments: IBaggageAndAvailabilitySingleSeg[];
  baggage: {
    id: number | null;
    unit: string | null;
    count: string | null;
  };
}

export interface IBaggageAndAvailabilitySingleSeg {
  id: number;
  name: string;
  meal_code: string | undefined;
  meal_type: string | undefined;
  cabin_code: string | undefined;
  cabin_type: string | undefined;
  booking_code: string | undefined;
  available_seat: number | undefined;
  available_break: boolean | undefined;
  available_fare_break: boolean | undefined;
}

export interface IFormattedScheduleDesc {
  id: number;
  elapsedTime: number;
  stopCount: number;
  total_miles_flown: number;
  message?: string;
  message_type?: string;
  departure: IFormattedDeparture;
  arrival: IFormattedArrival;
  carrier: IFormattedCarrier;
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
  date_adjustment: number | undefined;
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
  date_adjustment: number | undefined;
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

export interface IFormattedLegDesc {
  id: number;
  elapsed_time: number;
  options: ILegDescOption[];
}

export interface ILegDescOption extends IFormattedScheduleDesc {
  departureDateAdjustment: number | undefined;
}

// Formatted Sabre Response Type === END =============================


export interface ISabreRetrieveDataResponse {
  bookingId: string;
  startDate?: string | Date;
  endDate?: string | Date;
  insCancelable?: boolean;
  isTicketed?: boolean;
  creationDetails: {
    creationUserSine: string;
    creationDate: string | Date;
    creationTime: string;
    userWorkPcc: string;
    userHomePcc: string;
    primeHostId: string;
  },
  contactInfo: {
    phones: string[]; //format: 01774504111-M-1.1
  },
  travelers: {
    givenName: string;
    surname: string;
    type: string; //example: ADULT
    passengerCode: "ADT" | "C02" | "C03" | "C04" | "C05" | "C06" | "C07" | "C08" | "C09" | "C10" | "C11" | "CHD" | "INF"; //example: ADT
    nameAssociationId: string;
    emails: string[]; //format MAHIN.M360ICT@GMAIL.COM
    phones: {
      number: string,
      label: "M"
    }[];
    identityDocuments: {
      documentNumber?: string;
      documentType: string; //example: PASSPORT, SECURE_FLIGHT_PASSENGER_DATA (for PASSPORT the optional field will be present)
      expiryDate?: string | Date;
      issuingCountryCode?: string; //example: BDG
      residenceCountryCode?: string; //example: BDG
      givenName: string;
      surname: string;
      birthDate: string | Date;
      gender: string; //example MALE
      isPrimaryDocumentHolder?: boolean;
      itemId: string;
    }[];
  }[];
  flights: {
    itemId: string;
    confirmationId: string;
    sourceType: string;
    flightNumber: number;
    airlineCode: string;
    airlineName: string;
    operatingFlightNumber: number;
    operatingAirlineCode: string;
    operatingAirlineName: string;
    fromAirportCode: string;
    toAirportCode: string;
    departureDate: string;
    departureTime: string;
    departureTerminalName: string;
    departureGate: string;
    arrivalDate: string;
    arrivalTime: string;
    arrivalTerminalName: string;
    arrivalGate: string;
    numberOfSeats: number;
    cabinTypeName: string;
    cabinTypeCode: string;
    aircraftTypeCode: string;
    aircraftTypeName: string;
    bookingClass: string;
    meals: {
      code: string;
      description: string;
    }[];
    flightStatusCode: string;
    flightStatusName: string;
    durationInMinutes: number;
    distanceInMiles: number;
    hiddenStopAirportCode: string;
    hiddenStopArrivalDate: string;
    hiddenStopArrivalTime: string;
    hiddenStopDepartureDate: string;
    hiddenStopDepartureTime: string;
    hiddenStops: {
      airportCode: string;
      departureDate: string;
      departureTime: string;
      arrivalDate: string;
      arrivalTime: string;
      durationInMinutes: number;
    }[];
    travelerIndices: number[];
    identityDocuments: {
      itemId: string;
      status: string;
    }[];
  }[];
  journeys: {
    firstAirportCode: string;
    departureDate: string | Date;
    departureTime: string;
    lastAirportCode: string;
    numberOfFlights: number;
  }[];
  fareRules: {
    owningAirlineCode: string;
    passengerCode: string;
    isRefundable: boolean;
    refundPenalties: {
      applicability: 'BEFORE_DEPARTURE' | 'AFTER_DEPARTURE' | string;
      conditionsApply: boolean;
      penalty: {
        amount: string;
        currencyCode: string;
      };
      hasNoShowCost: boolean;
      noShowPenalty: {
        amount: string;
        currencyCode: string;
      };
    }[];
    isChangeable: boolean;
    exchangePenalties: {
      applicability: 'BEFORE_DEPARTURE' | 'AFTER_DEPARTURE' | string;
      conditionsApply: boolean;
      penalty: {
        amount: string;
        currencyCode: string;
      };
      hasNoShowCost: boolean;
      noShowPenalty: {
        amount: string;
        currencyCode: string;
      };
    }[];
  }[];
  fareOffers: {
    travelerIndices: number[];
    flights: {
      itemId: string;
    }[];
    cabinBaggageAllowance: {
      maximumPieces: number;
      totalWeightInKilograms: number;
    };
    cabinBaggageCharges: {
      maximumSizeInInches: number;
      maximumSizeInCentimeters: number;
      maximumWeightInPounds: number;
      maximumWeightInKilograms: number;
      numberOfPieces: number;
      fee: {
        amount: string;
        currencyCode: string;
      };
    }[];
  }[];
  fares: {
    creationDetails: {
      creationUserSine: string;
      creationDate: string;
      creationTime: string;
      purchaseDeadlineDate: string;
      purchaseDeadlineTime: string;
      userWorkPcc: string;
      userHomePcc: string;
    };
    airlineCode: string;
    fareCalculationLine: string;
    isNegotiatedFare: boolean;
    fareConstruction: {
      flights: {
        itemId: string;
      }[];
      flightIndices: number[];
      fareBasisCode: string;
      baseRate: {
        amount: string;
        currencyCode: string;
      };
      isCurrentItinerary: boolean;
      checkedBaggageAllowance: {
        totalWeightInKilograms: number;
      };
    }[];
    taxBreakdown: {
      taxCode: string;
      taxAmount: {
        amount: string;
        currencyCode: string;
      };
    }[];
    totals: {
      subtotal: string;
      taxes: string;
      total: string;
      currencyCode: string;
    };
    pricingTypeCode: string;
    pricingTypeName: string;
    pricingStatusCode: string;
    pricingStatusName: string;
    requestedTravelerType: string;
    pricedTravelerType: string;
    recordTypeCode: string;
    recordTypeName: string;
    recordId: string;
  }[];
  allSegments: {
    id: string;
    type: string; // e.g., "FLIGHT"
    text: string; // e.g., flight number or reference text
    vendorCode: string; // airline code
    startDate: string; // format: YYYY-MM-DD
    startTime: string; // format: HH:mm:ss
    startLocationCode: string; // IATA code
    endDate: string; // format: YYYY-MM-DD
    endTime: string; // format: HH:mm:ss
    endLocationCode: string; // IATA code
  }[];
  payments: {
    flightTotals: {
      subtotal: number; //base fare
      taxes: number;
      total: number;
      currencyCode: string; //BDT
    }[];
  };
  otherServices: {
    airlineCode: string;
    serviceMessage: string;
  }[];
  specialServices: {
    travelerIndices: number[];
    code: "CTCE"| "CTCM" | "DOCS" | "OTHS" | string;
    name?: string;
    message: string;
    statusCode?: string;
    statusName?: string;
  }[];
  timestamp: string  | Date;
  bookingSignature: string;
  request : {
    confirmationId: string; //gds prn
  };
  errors?: any;
}