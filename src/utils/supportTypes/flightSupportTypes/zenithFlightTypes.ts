export interface IZenithFlightSearchRestResponse {
    "s:Body": {
        SearchFlightsResponse: {
            $: {
                xmlns: string;
            };
            SearchFlightsResult: {
                $: {
                    "xmlns:a": string;
                    "xmlns:i": string;
                };
                Extensions: {
                    $: {
                        xmlns: string;
                    }
                };
                "a:ResponseInfo": {
                    $: {};
                    "b:EchoToken": string;
                    "b:Error": {};
                    "b:ProcessingMs": number;
                    "b:Warnings": string;
                };
                "a:FareInfo": {
                    $: {};
                    Extensions: {};
                    "b:ETTicketFares": {
                        "b:ETTicketFare": IETTicketFare[];
                    };
                    "b:SaleCurrencyCode": string; //BDT
                    "b:FareRules": {
                        "b:FareRule": {
                            Extensions: {
                                $: {
                                    "i:nil": string;
                                    xmlns: string;
                                };
                            };
                            "b:Details": {
                                $: {
                                    "i:nil": string;
                                };
                            };
                            "b:FareConditionText": {
                                $: {
                                    "i:nil": string;
                                };
                            };
                            "b:Ref": string;
                            "b:VoluntaryChangeCode": string;
                            "b:VoluntaryRefundCode": string;
                        };
                    };
                    "b:Itineraries": {
                        "b:Itinerary": IItinerary[];
                    }
                };
                "a:Offer": {
                    $: {
                        "xmlns:b": string;
                    };
                    Extensions: {
                        $: {
                            "i:nil": string;
                            xmlns: string;
                        };
                    };
                    "b:Ref": string;
                    "b:ExpirationDateGMT": string;
                };
                "a:Passengers": {
                    $: {
                        "xmlns:b": string;
                    };
                    "b:Passenger": IPassenger[];
                };
                "a:Segments": {
                    $: {
                        "xmlns:b": string;
                    };
                    "b:SegmentOption": IFlightSegment[];
                }
            }
        }
    }
}

interface IETTicketFare {
    Extensions: {};
    "b:AmountDetails": {};
    "b:SaleCurrencyAmount": {
        Extensions: {};
        "b:MilesAmount": number;
        "b:TotalAmount": number;
        "b:BaseAmount": number;
        "b:TaxAmount": number;
        "b:DiscountAmount": number;
    };
    "b:CreatedDateGMT": {};
    "b:Ref": string;
    "b:RefItinerary": string;
    "b:OriginDestinationFares": {
        "b:OriginDestinationFare": IOriginDestinationFare[];
    };
    "b:RefPassenger": string; //P_0
    "b:Taxes": {
        "b:TicketTax": {
            Extensions: {};
            "b:Code": string;
            "b:CountryCode": string;
            "b:SaleCurrencyAmount": number;
        }[];
    }
}

interface IOriginDestinationFare {
    Extensions: {};
    "b:CouponFares": {
        "b:ETCouponFare": {
            Extensions: {};
            "b:AmountDetails": {};
            "b:SaleCurrencyAmount": {
                Extensions: {};
                "b:MilesAmount": number;
                "b:TotalAmount": number;
                "b:BaseAmount": number;
                "b:TaxAmount": number;
                "b:DiscountAmount": number;
            };
            "b:BagAllowances": {
                "b:BagAllowance": {
                    Extensions: {};
                    "b:Quantity": {};
                    "b:Weight": number;
                    "b:WeightMeasureQualifier": string //Kg
                    "b:CarryOn": boolean;
                    "b:TotalWeight": number;
                }
            };
            "b:BookingClassCode": string;
            "b:CouponOrder": number;
            "b:FareBasisCode": string;
            "b:RefSegment": number;
            "b:Taxes": string;
        }
    };
    "b:OriginDestinationOrder": number;
    "b:RefWebClass": number;
}

interface IItinerary {
    Extensions: {
        $: {
            "i:nil": string;
            xmlns: string;
        };
    };
    "b:AirOriginDestinations": {
        "b:AirOriginDestination": IAirOriginDestination[];
    };
    "b:Ref": string;
    "b:SaleCurrencyAmount": {
        Extensions: {
            $: {
                "i:nil": string;
                xmlns: string;
            };
        };
        "b:MilesAmount": number;
        "b:TotalAmount": number;
        "b:BaseAmount": number;
        "b:TaxAmount": number;
        "b:DiscountAmount": number;
    };
    "b:RefExchangingItin": {
        $: {
            "i:nil": string;
        };
    };
    "b:ValidatingAirlineDesignator": {
        $: {
            "i:nil": string;
        };
    };
}

interface IAirOriginDestination {
    Extensions: {
        $: {
            "i:nil": string;
            xmlns: string;
        };
    };
    "b:AirCoupons": {
        "b:AirCoupon": IAirCoupon;
    };
    "b:OriginDestinationOrder": number;
    "b:RefFareRule": string;
}

interface IAirCoupon {
    Extensions: {
        $: {
            "i:nil": string;
            xmlns: string;
        };
    };
    "b:BookingClassCode": string;
    "b:CouponOrder": number;
    "b:RefSegment": number;
}

interface IPassenger {
    Extensions: {
        $: {
            "i:nil": string;
            xmlns: string;
        };
    };
    "b:NameElement": {
        $: {
            "i:nil": string;
        };
    };
    "b:PassengerQuantity": number;
    "b:PassengerTypeCode": string;
    "b:Ref": string;
    "b:RefClient": {
        $: {
            "i:nil": string;
        };
    };
}

interface IFlightSegment {
    Extensions: {
        $: {
            "i:nil": string;
            xmlns: string;
        };
    };
    "b:DestinationCode": string;
    "b:OriginCode": string;
    "b:AirlineDesignator": string;
    "b:FlightInfo": IFlightInfo;
    "b:Ref": number;
    "b:BookingClasses": {
        "b:BookingClass": IBookingClass[];
    };
    "b:LegRemarks": {
        $: {
            "i:nil": string;
        };
    };
}

interface IFlightInfo {
    Extensions: {
        $: {
            "i:nil": string;
            xmlns: string;
        };
    };
    "b:ArrivalDate": string;
    "b:CodeShareAgreementTypeCode": string;
    "b:DepartureDate": string;
    "b:DestinationAirportTerminal": number;
    "b:DurationMinutes": number;
    "b:EquipmentCode": number;
    "b:EquipmentText": string;
    "b:FlightNumber": number;
    "b:OperatingAirlineDesignator": string;
    "b:OperatingFlightNumber": number;
    "b:OriginAirportTerminal": number;
    "b:Remarks": {
        $: {
            "i:nil": string;
        };
    };
    "b:Stops": string;
}

interface IBookingClass {
    Extensions: {
        $: {
            "i:nil": string;
            xmlns: string;
        };
    };
    "b:CabinClassCode": string;
    "b:Code": string;
    "b:OperatingCode": string;
    "b:Quantity": number;
    "b:StatusCode": string;
}