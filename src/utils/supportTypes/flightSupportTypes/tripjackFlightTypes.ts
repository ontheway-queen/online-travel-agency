export interface ITripjackFlightSearchReqBody {
    searchQuery: {
        cabinClass?: "ECONOMY" | "BUSINESS" | "PREMIUM_ECONOMY" | "FIRST";
        paxInfo: {
            ADULT: string;
            CHILD: string;
            INFANT: string;
        },
        routeInfos: ITripjackFlightSearchReqBodyRouteInfo[];
        preferredAirline?: { //max 10
            code: string;
        }[];
        searchModifiers?: {
            isDirectFlight: boolean;
            isConnectingFlight: boolean;
        }
    }
}

export interface ITripjackFlightSearchReqBodyRouteInfo {
    fromCityOrAirport: {
        code: string;
    };
    toCityOrAirport: {
        code: string;
    };
    travelDate: Date | string;
}

export interface ITripjackFlightSearchResBody {
    searchResult: {
        //For one way "ONWARD" will be available. For Domestic(india) return "ONWARD, RETURN" will be available. For International return, International multi city "COMBO" will be available. For domestic multi city(india) "DYNAMIC NUMBERS" will be available.
        tripInfos: {
            ONWARD?: ITripjackFlightSearchResults[];
            RETURN?: ITripjackFlightSearchResults[];
            COMBO?: ITripjackFlightSearchResults[];
            [legId: string]: ITripjackFlightSearchResults[] | undefined;
        }
    };
    status: {
        success: boolean;
        httpStatus: number;
    }
}


export interface ITripjackFlightSearchResults {
    sI: IFlightSegmentInfo[];
    totalPriceList: ITripjackFlightResTotalPriceList[];
    airFlowType: "SEARCH";
}

export interface ITripjackFlightResTotalPriceList {
    fd: IFlightResFareBreakdown;
    fareIdentifier: string;
    id: string;
    msri: [];
    tai: {
        tbi: IFlightResBaggageInformation;
    },
    icca: boolean;
}

interface IFlightResBaggageInformation {
    [fareId: string]: IPassengerBaggage[];
}

interface IBaggageInfo {
    iB?: string; // iB: "30 Kg"
    cB?: string; // cB: "7Kg"
}

type IPassengerType = 'INFANT' | 'CHILD' | 'ADULT';

type IPassengerBaggage = {
    [P in IPassengerType]?: IBaggageInfo;
};

type IFlightResFareBreakdown = {
    [key in IPassengerType]?: IFareDetails;
};

interface IFareComponent {
    NF: number;   // Net Fare
    BF: number;   // Base Fare
    TAF: number;  // Total Additional Fare
    TF: number;   // Total Fare
}

interface IAdditionalFareComponent {
    TAF: {
        YQ?: number;
        YR?: number;
        OT?: number;
    };
}

export interface IFareDetails {
    fC: IFareComponent;
    afC: IAdditionalFareComponent;
    sR: number;           // seat remaining
    bI: IBaggageInfo;      // baggage info
    rT: number;           // route type?
    cc: "ECONOMY" | "BUSINESS" | "PREMIUM_ECONOMY" | "FIRST";           // cabin class
    cB: string;           // booking class
    fB: string;           // fare basis
}


export interface IFlightSegmentInfo {
    id: string;
    fD: IFlightDetails;
    stops: number;
    so: string[]; // stopover airports, can be empty
    duration: number; // in minutes
    cT: number;       // cumulative travel time
    da: IAirportInfo;  // departure airport
    aa: IAirportInfo;  // arrival airport
    dt: string;       // departure time (ISO 8601)
    at: string;       // arrival time (ISO 8601)
    iand: boolean;    // is international and domestic?
    isRs: boolean;    // is rescheduled?
    sN: number;       // segment number or sequence
    ssrInfo?: {
        MEAL?: {
            code: string;
            amount: number;
            desc: string;
        }[];
        BAGGAGE?: {
            code: string;
            amount: number;
            desc: string;
        }[]
    }
}

interface IAirportInfo {
    code: string;
    name: string;
    cityCode: string;
    city: string;
    country: string;
    countryCode: string;
    terminal?: string;
}

interface IAirlineInfo {
    code: string;
    name: string;
    isLcc: boolean;
}

interface IFlightDetails {
    aI: IAirlineInfo;
    fN: string;
    eT: string;
}

export interface ITripjackFlightRevalidateReqBody {
    priceIds: string[];
}

export interface ITripjackFlightRevalidateResBody {
    tripInfos: ITripjackFlightSearchResults[];
    alerts?: {
        oldFare: number;
        newFare: number;
        type: "FAREALERT"
    }[],
    searchQuery: {
        routeInfos: {
            fromCityOrAirport: {
                code: string;
                name: string;
                cityCode: string;
                city: string;
                country: string;
                countryCode: string;
            };
            toCityOrAirport: {
                code: string;
                name: string;
                cityCode: string;
                city: string;
                country: string;
                countryCode: string;
            };
            travelDate: string;
        }[];
        cabinClass: string;
        paxInfo: {
            ADULT: number;
            CHILD: number;
            INFANT: number;
        };
        requestId: string;
        searchType: string;
        searchModifiers: {
            isDirectFlight: boolean;
            isConnectingFlight: boolean;
            pft: string;
            pfts: string[];
        };
        isDomestic: boolean;
    };
    bookingId: string;
    totalPriceInfo: {
        totalFareDetail: {
            fC: {
                TF: number;
                TAF: number;
                BF: number;
                NF: number;
            };
            afC: {
                TAF: {
                    OT: number;
                    YQ: number;
                    AGST: number;
                };
            };
        };
    };
    status: {
        success: boolean;
        httpStatus: number;
    };
    conditions: {
        ffas: any[];
        isa: boolean;
        dob: {
            adobr: boolean;
            cdobr: boolean;
            idobr: boolean;
        };
        iecr: boolean;
        dc: {
            ida: boolean;
            idm: boolean;
            iqpe: boolean;
        };
        ipa: boolean;
        addOns: {
            isbpa: boolean;
        };
        iss: boolean;
        fsc: {
            ismi: boolean;
            issi: boolean;
            isbi: boolean;
        };
        isBA: boolean;
        st: number;
        sct: string;
        gst: {
            gstappl: boolean;
            igm: boolean;
        };
    };
}

export interface ITripjackFareRulesFormat1 {
    fareRule: {
        [key: string]: {
            miscInfo: string[];
            fareRuleInfo: object;
        };
    };
    status: {
        success: boolean;
        httpStatus: number;
    };
}

export interface IFareComponentStructure {
    [key: string]: number;
}

export interface ITFRPolicy {
    policyInfo: string;
    amount?: number;
    additionalFee?: number;
    fcs?: IFareComponentStructure;
    st?: string;
    et?: string;
    pp?: string;
}

export interface IFormat2Or3TFR {
    [policyType: string]: ITFRPolicy[];
}

export interface ITripjackFareRulesFormat2 {
    fareRule: {
        [key: string]: {
            tfr: IFormat2Or3TFR;
        };
    };
    status: {
        success: boolean;
        httpStatus: number;
    };
}

export interface ITripjackFlightBookIssuePayload {
    bookingId: string;
    paymentInfos?: {
        amount: number;
    }[],
    travellerInfo: ITripjackFlightBookingTravelerPayload[];
    deliveryInfo: {
        emails: string[];
        contacts: string[];
    }
}

export interface ITripjackFlightBookingTravelerPayload {
    ti: "Mr" | "Mrs" | "Ms" | "Master"; // Adult: Mr, Mrs, MS;  Child: Ms, Master;  Infant: Ms, Master
    pt: "ADULT" | "CHILD" | "INFANT";
    fN: string;
    lN: string;
    dob?: string | Date;
    pNat?: string;
    pNum?: string;
    eD?: string | Date;
}

export interface ITripjackRetrieveBookingDetailsRes {
    order: {
        bookingId: string;
        amount: number;
        markup: number;
        deliveryInfo: {
            emails: string[];
            contacts: string[];
        },
        status: "SUCCESS" | "ON_HOLD" | "CANCELLED" | "FAILED" | "PENDING" | "ABORTED" | "UNCONFIRMED"; //SUCCESS: order has been success with payment, ON_HOLD: order has been blocked, CANCELLED: order cancelled, FAILED: order failed due to other reasons, PENDING: order has been fallen to pending state, ABORTED: order has been aborted, UNCONFIRMED: order has been unconfirmed when hold booking is not confirmed and PNR is released
        createdOn: string | Date;
    }
    itemInfos: {
        AIR: {
            tripInfos: { sI: IFlightSegmentInfo[] }[];
            totalPriceInfo: {
                totalFareDetail: {
                    fC: {
                        TF: number; // Total Fare
                        TAF: number; // Total Additional Fare
                        BF: number; // Base Fare
                        NF: number; // Net Fare
                    };
                    afC: {
                        TAF: {
                        };
                    };
                };
            };
            travellerInfos: {
                pnrDetails: { //airline pnr
                    [route: string]: string;
                };
                gdsPnrs?: {
                    [route: string]: string;
                };
                ticketNumberDetails?: {
                    [route: string]: string;
                };
                fd:{
                    fC: {
                        BF: number;
                        OC: number;
                        TF: number;
                    },
                    bI: {
                        iB: string; // iB: "30 Kg"
                        cB: string; // cB: "7Kg"
                    },
                    rT: number; // route type
                    cc: "ECONOMY" | "BUSINESS" | "PREMIUM_ECONOMY" | "FIRST"; // cabin class
                    cB: string; // booking class
                    fB: string; // fare basis   
                },
                ti: string; // title
                pt: "ADULT" | "CHILD" | "INFANT"; // passenger type
                fN: string; // first name
                lN: string; // last name
                dob?: string | Date; // date of birth
                pNum?: string; // passport number
                eD?: string | Date; // expiry date
                pNat?: string; // passport
                ipct: boolean
            }[];
        }
    }
}
