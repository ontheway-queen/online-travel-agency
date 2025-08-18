export interface IVerteilFlightSearchRQ {
  Party?: {
    Sender: {
      CorporateSender: {
        CorporateCode: string;
      };
    };
  };
  Preference: {
    CabinPreferences?: {
      CabinType: [
        {
          PrefLevel?: {
            PrefLevelCode: "Preferred";
          };
          OriginDestinationReferences?: string[];
          Code: "Y" | "W" | "C" | "F";
        }
      ];
    };
    FarePreferences: {
      Types: {
        Type: {
          Code:
          | "PUBL"
          | "PVT"
          | "FLEX"
          | "IT"
          | "CB"
          | "MR"
          | "STU"
          | "HR"
          | "VFR"
          | "LBR"
          | "CRU"
          | "NAM";
        }[];
      };
    };
    PricingMethodPreference?: {
      BestPricingOption: "Y";
    };
  };
  ResponseParameters: {
    ResultsLimit?: {
      value: number;
    };
    SortOrder: {
      Order: "ASCENDING" | "DESCENDING";
      Parameter: "STOP" | "PRICE" | "DEPARTURE_TIME";
    }[];
    ShopResultPreference: "OPTIMIZED" | "FULL" | "BEST";
  };
  Travelers: {
    Traveler: Array<{
      AnonymousTraveler?: {
        PTC: {
          /** ADT, CHD or INF */
          value: string;
        };
        Age?: {
          Value?: {
            value: number;
          };
          BirthDate?: {
            /** @deprecated YYYY-MM-DD */
            value: string;
          };
        };
      }[];
      RecognizedTraveler?: {
        FQTVs?: [
          {
            Account: {
              Number: {
                value: string;
              };
            };
            AirlineID: {
              value: string;
            };
            ProgramID?: string;
          }
        ];
        PTC: {
          value: string;
        };
        Age?: {
          Value?: {
            value: number;
          };
          BirthDate?: {
            value: string;
          };
        };
        Name: {
          Given: [
            {
              value: string;
            }
          ];
          Title: string;
          Surname: {
            value: string;
          };
        };
      }[];
    }>;
  };
  EnableGDS?: boolean;
  Qualifier?: {
    ProgramQualifiers: {
      ProgramQualifier: [
        {
          DiscountProgramQualifier: {
            Account: {
              value: string;
            };
            AssocCode: {
              value: string;
            };
            Name: {
              value: string;
            };
          };
        }
      ];
    };
    BaggagePricingQualifier?: {
      BaggageOption: {
        Code: "CarryOn" | "CheckedBag";
      };
    };
  };
  CoreQuery: {
    OriginDestinations: {
      SpecificOriginDestination?: [
        {
          Flight?: [
            {
              Departure: {
                AirportCode: {
                  value: string;
                };
                Date: string;
              };
              FlightNumber?: [
                {
                  value: string;
                }
              ];
              Arrival: {
                AirportCode: {
                  value: string;
                };
              };
              OriginDestinationKey?: string;
            }
          ];
        }
      ];
      OriginDestination?: {
        Departure: {
          AirportCode: {
            value: string;
          };
          /** HH-MM & is given in a 24 hour clock */
          TimeFrom?: string;
          TimeTo?: string;
          /** YYYY-MM-DD */
          Date: string;
        };
        Arrival: {
          AirportCode: {
            value: string;
          };
          TimeFrom?: string;
          TimeTo?: string;
          Date?: string;
        };
        OriginDestinationKey: string;
      }[];
    };
  };
}

export interface IVerteilFlightPriceRQ {
  Party?: {
    Sender: {
      CorporateSender: {
        CorporateCode: string;
      };
    };
  };
  DataLists: {
    FareList?: {
      FareGroup: {
        ListKey: string;
        FareBasisCode?: {
          Code: string;
        };
        refs?: string[];
      }[];
    };
    AnonymousTravelerList?: {
      AnonymousTraveler: {
        ObjectKey: string;
        PTC: {
          value: string;
        };
        Age?: {
          Value?: {
            value: number;
          };
          BirthDate?: {
            value: string;
          };
        };
      }[];
    };
    RecognizedTravelerList?: {
      RecognizedTraveler: {
        FQTVs: {
          AirlineID: {
            value: string;
          };
          Account: {
            Number: [
              {
                value: number;
              }
            ];
          };
          ProgramID?: string;
        }[];
        ObjectKey: string;
        PTC: {
          /** ADT, CHD or INF */
          value: string;
        };
        Name: {
          Given: {
            value: string;
          }[];
          Surname: {
            value: string;
          };
        };
      }[];
    };
  };
  Parameters?: {
    Pricing: {
      OverrideCurrency: string; // From point of sale currency to only USD
    };
  };
  Query: {
    /** Repeated for each OD */
    OriginDestination: Array<{
      /** Repeated for each Segment */
      Flight: Array<{
        /** OnwardSeg for one way and multi city. ReturnSeg for Roundtrip */
        SegmentType?: string;
        SegmentKey: string;
        FlightDetail?: {
          FlightDuration: {
            /** h m */
            CnValue: string;
            /** ISO duration. PTHM */
            Value?: string;
          };
          Stops?: {
            StopQuantity: number;
          };
        };
        CabinType?: {
          Code?: string;
          Name?: string;
        };
        Equipment?: {
          AircraftCode: {
            value: string;
          };
          Name?: string;
        };
        Departure: {
          AirportCode: {
            value: string;
          };
          CountryName?: string;
          AirportName?: string;
          Time?: string;
          CityName?: string;
          Terminal?: {
            Name: string;
          };
          /** YYYY-MM-DD (Local to the departure location) */
          Date: string;
        };
        MarketingCarrier?: {
          AirlineID: {
            value: string;
          };
          FlightNumber: {
            value: string;
          };
          Name?: string;
        };
        OperatingCarrier?: {
          AirlineID: {
            value: string;
          };
          Name: string;
        };
        ClassOfService?: {
          refs?: string[];
          Code?: {
            value: string;
          };
        };
        Arrival: {
          ChangeOfDay?: number;
          AirportCode: {
            value: string;
          };
          CountryName?: string;
          AirportName?: string;
          Time?: string;
          CityName?: string;
          Terminal?: {
            Name: string;
          };
          Date?: string;
        };
      }>;
    }>;
    Offers: {
      Offer: {
        OfferID: {
          Owner: string;
          Channel: string;
          Quantity?: number;
          value: string;
        };
        refs?: {
          Ref?: string;
        }[];
        OfferItemIDs: {
          OfferItemID: {
            /** Reference of the passenger */
            refs: string[];
            SelectedSeat?: [
              {
                SeatAssociation: [
                  {
                    SegmentReferences: {
                      value: string[];
                    };
                    TravelerReference: string;
                  }
                ];
                Location: {
                  Column: string;
                  Characteristics: {
                    Characteristic: [
                      {
                        Remarks: {
                          Remark: [
                            {
                              value: string;
                            }
                          ];
                        };
                        Code: string;
                      }
                    ];
                  };
                  Row: {
                    Number: {
                      value: string;
                    };
                  };
                };
              }
            ];
            Quantity?: number;
            value?: string;
          }[];
        };
      }[];
    };
  };
  Travelers: {
    Traveler: Array<{
      /** Repeated for number of passengers */
      AnonymousTraveler?: Array<{
        PTC: {
          Quantity: number;
          /** ADT, CHD or INF */
          value?: string;
        };
        Age?: {
          Value?: {
            value: number;
          };
          BirthDate?: {
            /** YYYY-MM-DD */
            value: number;
          };
        };
      }>;
      RecognizedTraveler?: Array<{
        FQTVs?: {
          Account: {
            Number: {
              value: string;
            };
          };
          AirlineID: {
            value: string;
          };
          ProgramID?: string;
        }[];
        PTC: {
          value: string;
        };
        Age?: {
          Value?: {
            value: string;
          };
          BirthDate?: {
            value: number;
          };
        };
        Name: {
          Given: {
            value: string;
          }[];
          Surname: {
            value: string;
          };
        };
      }>;
    }>;
  };
  Metadata?: {
    Other?: {
      OtherMetadata?: {
        LanguageMetadatas?: {
          LanguageMetadata: {
            Code_ISO: string;
            MetadataKey: string;
            Application: string;
          }[];
        };
        PriceMetadatas?: {
          PriceMetadata: {
            AugmentationPoint: {
              AugPoint: {
                any: {
                  "@type"?: string;
                };
              }[];
            };
            MetadataKey: string;
          }[];
        };
      }[];
    };
  };
  Qualifier?: {
    ProgramQualifiers: {
      ProgramQualifier: {
        DiscountProgramQualifier: {
          Account: {
            value: string;
          };
          AssocCode: {
            value: string;
          };
          Name: {
            value: string;
          };
        };
      }[];
    };
    PaymentCardQualifier?: {
      /** P for personal or C for Corporate */
      cardProductTypeCode?: string;
      cardBrandCode: string;
      cardNumber: string;
    };
  };
  ShoppingResponseID: {
    /** Airline ID */
    Owner: string;
    ResponseID: {
      /** Response ID from Airshopping RS */
      value: string;
    };
  };
}

export interface IVerteilOrderCreateRQ {
  Party?: {
    Sender?: {
      CorporateSender: {
        CorporateCode: string;
      };
    };
  };
  Query: {
    OrderItems: {
      ShoppingResponse: {
        Owner: string;
        ResponseID: {
          value: string;
        };
        Offers: {
          Offer: {
            OfferID: {
              Owner: string;
              Channel: string;
              ObjectKey: string;
              value: string;
            };
            OfferItems: {
              OfferItem: {
                OfferItemID: {
                  Owner: string;
                  value: string;
                };
              }[];
            };
          }[];
        };
      };
      OfferItem: {
        OfferItemID: {
          Owner: string;
          refs?: string[];
          Channel?: string;
          value: string;
        };
        OfferItemType: {
          OtherItem?: [
            {
              refs: string[];
              Price: {
                SimpleCurrencyPrice: {
                  value: number;
                  Code: string;
                };
              };
            }
          ];
          DetailedFlightItem: {
            FareDetail?: {
              FareComponent: {
                refs?: string;
                FareBasis?: {
                  FareBasisCode?: {
                    Code?: string;
                  };
                  RBD?: string;
                };
                FareRules?: {
                  Penalty?: string;
                };
              };
            };
            Price: {
              BaseAmount: {
                value: number;
                Code: string;
              };
              Taxes: {
                Total: {
                  value: number;
                  Code: string;
                };
              };
            };
            OriginDestination: Array<{
              Flight: Array<{
                SegmentKey: string;
                Details?: {
                  FlightDuration: {
                    Value: string;
                  };
                  Stops?: {
                    StopQuantity: number;
                  };
                };
                Equipment?: {
                  AircraftCode: {
                    value: string;
                  };
                  Name?: string;
                };
                Departure: {
                  AirportCode: {
                    value: string;
                  };
                  Time?: string;
                  Terminal?: {
                    Name: string;
                  };
                  Date: string;
                };
                MarketingCarrier: {
                  AirlineID: {
                    value: string;
                  };
                  FlightNumber: {
                    value: string;
                  };
                  Name?: string;
                };
                OperatingCarrier?: {
                  AirlineID: {
                    value: string;
                  };
                  Name?: string;
                };
                ClassOfService?: {
                  refs?: string[];
                  Code?: {
                    value: string;
                  };
                  MarketingName?: {
                    CabinDesignator?: string;
                    value: string;
                  };
                };
                Arrival: {
                  AirportCode: {
                    value: string;
                  };
                  Time?: string;
                  Terminal?: {
                    Name: string;
                  };
                  Date?: string;
                };
              }>;
              OriginDestinationKey?: string;
            }>;
            refs: string[];
          }[];
          SeatItem?: [
            {
              Descriptions?: {
                Description: [
                  {
                    Text: {
                      value: string;
                    };
                  }
                ];
              };
              Price: {
                Total: {
                  value: number;
                  Code: string;
                };
              };
              SeatAssociation: [
                {
                  SegmentReferences: {
                    value: string;
                  };
                  TravelerReference?: string;
                }
              ];
              Location: {
                Column: string;
                Characteristics: {
                  Characteristic: [
                    {
                      Remarks: {
                        Remark?: [
                          {
                            value?: string;
                          }
                        ];
                      };
                      Code: string;
                    }
                  ];
                };
                Row: {
                  Number: {
                    value: string;
                  };
                };
              };
            }
          ];
        };
      }[];
    };
    DataLists: {
      PriceClassList?: {
        PriceClass: [
          {
            Descriptions?: {
              Description: string;
            };
            ObjectKey?: string;
            Code?: string;
            Name?: string;
          }
        ];
      };
      FareList: {
        FareGroup: {
          ListKey: string;
          FareBasisCode: {
            Code: string;
          };
          refs?: string[];
          Fare?: {
            FareCode: {
              Code: string;
            };
          };
        }[];
      };
      ServiceList?: {
        Service: [
          {
            PricedInd?: true;
            Descriptions?: {
              Description: [
                {
                  Text: {
                    value: string;
                  };
                }
              ];
            };
            image?: string;
            Price: {
              Discount?: {
                discountCode?: string;
                discountOwner: string;
                preDiscountedAmount?: {
                  value: number;
                  Code: string;
                };
                DiscountAmount: {
                  value: number;
                  Code: string;
                };
                DiscountPercent?: number;
              };
              Total: {
                value: number;
                Code: string;
              };
            }[];
            ObjectKey: string;
            Associations: Array<{
              Offer?: {
                OfferReferences: string;
              }[];
              Flight?: Array<{
                originDestinationReferencesOrSegmentReferences?: {
                  SegmentReferences?: {
                    value: string;
                  };
                };
              }>;
              Traveler: {
                TravelerReferences: string;
              };
            }>;
            BookingInstructions?: {
              SSRCode?: string;
              OSIText?: string;
              Text?: string;
              Method?: string;
            };
            ServiceID: {
              Owner: string;
              value: string;
            };
            Name: {
              value: string;
            };
          }
        ];
      };
    };
    Passengers: {
      Passenger: Array<{
        Contacts: {
          Contact: [
            {
              PhoneContact: {
                Number: {
                  CountryCode: string;
                  value: string;
                }[];
                Application?: string;
              };
              EmailContact: {
                Address: {
                  value: string;
                };
              };
              AddressContact: {
                Street: string[];
                /** Required for some airline */
                PostalCode?: string;
                /**  Required for some airline */
                CityName?: string;
                /** 2 letter country code */
                CountryCode?: {
                  value: string;
                };
              };
              ContactRefuseInd?: true;
            }
          ];
        };
        /** Required for INF for airline ZG */
        Measurements?: {
          Height: {
            UOM: string;
            value: number;
          };
          Weight: {
            UOM: string;
            value: number;
          };
        };
        PassengerIDInfo?: {
          /**  @deprecated This property is deprecated and should not be used */
          AllowDocumentInd?: true;
          PassengerDocument: {
            /** Supply two letter country code as per ISO 3166 */
            CountryOfResidence?: string;
            /** PT for Passport, NI for National Identification */
            Type: string;
            /** Date of Passport Issue. YYYY-MM-DD */
            DateOfIssue?: string;
            ID: string;
            /** Mandatory when document ID is passport or National ID. YYYY-MM-DD */
            DateOfExpiration?: string;
            /** Mandatory for Passport & National ID. Supply two letter country code as per ISO 3166 */
            CountryOfIssuance?: string;
          }[];
        };
        FQTVs?: {
          TravelerFQTV_Information: [
            {
              AirlineID: {
                value: string;
              };
              Account: {
                Number: {
                  value: string;
                };
              };
              ProgramID?: string;
            }
          ];
        };
        Employer?: {
          SalesTaxRegistration: {
            EmailAddressText: string;
            SalesTaxRegistrationId: string;
            CountrySubDivisionName: string;
            StreetTexts: string[];
            CountryDialingCode: string;
            PhoneNumber: number;
            PostalCode: number;
            CityName: string;
            CountryCode: string;
          };
          Name: string;
        };
        /** Specify this element only if this passenger is the payer of the booking. Do not pass this element otherwise */
        AdditionalRoles?: {
          PaymentContactInd: true;
        };
        /**
         * Unique passenger ID used to associate other elements to this passenger at booking creation time.

           Value will be 'Payer' when the credit card of the third party is used, Other than the passengers credit card.

           When ObjectKey is 'Payer', PTC and Gender for the 'Payer' is not required
         */
        ObjectKey: string;
        Gender: {
          /** Male or Female */
          value: string;
        };
        PTC: {
          /** ADT, CHD or INF */
          value: string;
        };
        /** This element is used to associate an infant to an adult. Specify the adult passengers ObjectKey */
        PassengerAssociation?: string;
        /** Required for some airlines */
        Age?: {
          BirthDate: {
            /** YYYY-MM-DD */
            value: string;
          };
        };
        /** When ObjectKey is 'Payer', Name of Credit Card holder */
        Name: {
          Given: {
            value: string;
          }[];
          Title?: string;
          Surname: {
            value: string;
          };
        };
      }>;
    };
    Metadata?: {
      PassengerMetadata?: [
        {
          AugmentationPoint: {
            AugPoint: [
              {
                any: {
                  VdcAugPoint: [
                    {
                      Values: string[];
                    }
                  ];
                };
              }
            ];
          };
        }
      ];
      Other?: {
        OtherMetadata: [
          {
            PaymentFormMetadatas?: {
              PaymentFormMetadata: {
                Text: string;
                MetadataKey: string;
              }[];
            };
            PriceMetadatas?: {
              PriceMetadata: {
                AugmentationPoint: {
                  AugPoint: [
                    {
                      any?: {
                        "@type"?: string;
                        VdcAugPoint?: {
                          Value: string;
                        };
                        value?: string;
                      };
                    }
                  ];
                };
                MetadataKey: string;
              }[];
            };
            CurrencyMetadatas?: {
              /**
               * This is where the number of decimals that is applicable for the currency code is returned.

                 If the information is not provided it is assumed that the consumer does not have to apply decimal logic i.e. the amounts already have decimal applied
               */
              CurrencyMetadata: {
                /** Currency code */
                MetadataKey: string;
                /** Number of decimal applicable for the currency code returned in the response */
                Decimals: number;
              }[];
            };
          }
        ];
      };
    };
    Commission?: [
      {
        Percentage?: number;
        Amount: {
          value: number;
          Code: string;
        };
        Code: string;
      }
    ];
    Payments?: {
      Payment: [
        {
          Surcharge?: {
            Code: string;
            value: number;
          };
          Amount: {
            Code: string;
            value: number;
          };
          Method: {
            refs?: string[];
            EasyPay?: {
              /** Specifies account expiry date (MMYY) */
              ExpirationDate: string;
              AccountNumber: string;
            };
            PaymentCard?: {
              CardNumber: {
                value: number;
              };
              EffectiveExpireDate: {
                Expiration: string;
                Effective: string;
              };
              CardHolderBillingAddress: {
                BuildingRoom: string;
                CountrySubDivisionCode: string;
                Street: string;
                PostalCode: string;
                CityName: string;
                CountryCode: {
                  value: string;
                };
              };
              SeriesCode: {
                value: string;
              };
              CardType: string;
              Amount: {
                value: number;
                Code: string;
              };
              CardCode: string;
              SecurePaymentVersion2: {
                PaymentTrxChannelCode: string;
              };
              ProductTypeCode: string;
              CardHolderName: {
                refs: string[];
                value: string;
              };
            };
            /** Populate this section if form of payment is cash (BSP settlement) */
            Cash?: {
              /** This should always be True for cash payment */
              CashInd: boolean;
            };
            Other?: {
              Remarks: {
                Remark: [
                  {
                    value: string;
                  }
                ];
              };
            };
          };
        }
      ];
    };
  };
}

export interface IVerteilOrderRetrieveRQ {
  Query: {
    Filters: {
      OrderID: {
        Owner: string;
        Channel?: string;
        value: string;
      };
    };
  };
}

export interface IVerteilOrderReshopRQ {
  ownerCode: string;
  orderId: string;
  channel?: string;
}

export interface IVerteilOrderChangeRQ {
  ownerCode: string;
  orderId: string;
  channel?: string;
  acceptRepricedOrder: {
    paymentFunctions: [
      {
        paymentProcessingDetails: {
          /**
          * CA: Cash.
            CC: Credit Card.
            AC: Agency Credit.
            APP_PSP: External Payment Service Provider.
            PAY_BY_LINK: Inbound form of payment when payment is done through a link to customer.
            AIRLINE_INVOICE: Airline Invoice.
            AG: Airline Agency Pay.
            WL: Verteil Wallet.
            MS: Miscellaneous.
            EP: Easy Pay.
         */
          typeCode?:
          | "CA"
          | "CC"
          | "AC"
          | "APP_PSP"
          | "PAY_BY_LINK"
          | "AIRLINE_INVOICE"
          | "AG"
          | "WL"
          | "MS"
          | "EP";
          amount?: {
            currencyCode: string;
            units?: string;
            nanos?: number;
          };
        };
      }
    ];
    dataMap?: any;
    augmentations?: any;
  };
}

export interface IVerteilOrderCancelRQ {
  Query: {
    OrderID: [
      {
        Owner: string;
        refs?: [
          {
            Ref: {};
          }
        ];
        Channel?: string;
        value: string;
      }
    ];
  };
  Metadata?: {
    Other?: {
      OtherMetadata?: [
        {
          PriceMetadatas?: {
            PriceMetadata: [
              {
                AugmentationPoint: {
                  AugPoint: {
                    Key: string;
                  }[];
                };
                MetadataKey: string;
              }
            ];
          };
          CurrencyMetadatas?: {
            CurrencyMetadata: {
              MetadataKey: string;
              Decimals: number;
            }[];
          };
        }
      ];
    };
  };
  /** This amount will be mandatory while canceling a ticketed booking. */
  ExpectedRefundAmount?: {
    Total: {
      value: number;
      Code: string;
    };
  };
  CorrelationID?: string;
}

// START -- SEARCH RESPONSE TYPES //
export interface IVerteilFlightSearchRS {
  DataLists: IDataLists;
  Metadata: IMetaData;
  OffersGroup: IOffersGroup;
  Errors?: {
    Error: Array<IError>;
  };
  Document?: {
    ReferenceVersion?: string;
    /** IATA Code of the Airline */
    Name: string;
  };
  Warnings?: {
    Warning: {
      /** warning from the airline */
      value: string;
    }[];
  };
  /** The presence of the empty Success element explicitly indicates that the message succeeded. */
  Success?: {};
}

interface IOffersGroup {
  AirlineOffers: [
    {
      Owner?: {
        value: string;
      };
      TotalOfferQuantity?: number;
      AirlineOffer: Array<IAirlineOffer>;
    }
  ];
}

export interface IAirlineOffer {
  OfferID: {
    Owner: string;
    Channel: string;
    value: string;
  };
  PricedOffer: {
    Associations: {
      PriceClass: {
        PriceClassReference: string;
      };
      ApplicableFlight: {
        FlightReferences: {
          value: string[];
        };
        FlightSegmentReference: {
          ref: string;
          ClassOfService: {
            Code?: {
              /** Seat left in the booking class */
              SeatsLeft?: number;
              /** Booking/Selling class */
              value: string;
            };
            MarketingName: {
              /** Code of the selected cabin, eg: Y, W, C, F */
              CabinDesignator: string;
              /** Marketing name of the cabin class, eg: ECONOMY, FIRST CLASS */
              value?: string;
            };
          };
        }[];
        OriginDestinationReferences: string[];
      };
    }[];
    OfferPrice: Array<{
      OfferItemID: string;
      FareDetail: {
        FareComponent: [
          {
            refs: string[];
            SegmentReference: {
              value: string;
            };
            FareRules?: {
              CorporateFare?: {
                Account: {
                  value: string;
                };
              };
              Penalty: {
                refs: string[];
              };
            };
          }
        ];
      };
      RequestedDate: {
        Associations: [
          {
            AssociatedTraveler: {
              TravelerReferences: string[];
            };
            ApplicableFlight: {
              FlightReferences: {
                value: string[];
              };
              FlightSegmentReference: [
                {
                  ref?: string;
                  BagDetailAssociation?: {
                    CarryOnReferences?: string[];
                    CheckedBagReferences?: string[];
                  };
                }
              ];
              OriginDestinationReferences?: string[];
            };
          }
        ];
        PriceDetail: {
          BaseAmount: {
            value: number;
            Code: string;
          };
          Discount?: {
            discountName?: string;
            Description?: string;
            discountCode?: string;
            discountOwner: string;
            preDiscountedAmount?: {
              value: number;
              Code: string;
            };
            Application?: string;
            DiscountAmount: {
              value: number;
              Code: string;
            };
            DiscountPercent?: number;
          }[];
          Taxes?: {
            Total: {
              value: number;
              Code: string;
            };
            Breakdown?: {
              Tax: [
                {
                  Description?: string;
                  TaxCode: string;
                  Amount: {
                    value: number;
                    Code: string;
                  };
                }
              ];
            };
          };
          Surcharges?: {
            Surcharge: {
              Total: {
                value: number;
                Code: string;
              };
              Breakdown?: {
                Fee: [
                  {
                    Designator?: string;
                    Description?: string;
                    FeePercent?: number;
                    Amount: {
                      value: number;
                      Code: string;
                    };
                    FeeOwner: string;
                  }
                ];
              };
            }[];
          };
          TotalAmount: {
            SimpleCurrencyPrice: {
              value: number;
              Code: string;
            };
          };
          Fees?: {
            Total: {
              value: number;
              Code: string;
            };
            Breakdown: {
              Fee: {
                FeeName?: string;
                FeePercent?: string;
                RefundInd?: boolean;
                Amount: {
                  value: number;
                  Code: string;
                };
                FeeCode: string;
                FeeOwner: string;
              }[];
            };
          };
        };
      };
    }>;
  };
  refs?: {
    Ref: string;
  }[];
  TotalPrice: {
    SimpleCurrencyPrice: {
      value: number;
      Code: string;
    };
  };
  Commission?: {
    Percentage?: string;
    Amount: {
      code: string;
      value: number;
    };
    Code: string;
  }[];
  TimeLimits?: {
    OfferExpiration: {
      /** Time in GMT, format: YYYY-MM-DDTHH-MM-SS.SSS */
      DateTime: string;
    };
  };
}

export interface IDataLists {
  CheckedBagAllowanceList?: {
    /** Baggage is considered as not included in the fare for below scenarios

        Checked baggage with piece allowance as zero

        Checked baggage with piece weight allowance in which piece allowance as zero

        Checked baggage with piece weight and dimension allowance in which piece allowance is zero */
    CheckedBagAllowance: Array<{
      ListKey: string;
      PieceAllowance?: {
        /** Value will always be Traveler */
        ApplicableParty: string;
        PieceMeasurements?: [
          {
            Quantity: number;
          }
        ];
        TotalQuantity: number;
        PieceAllowanceCombination?: string;
      }[];
      WeightAllowance?: {
        ApplicableParty: string;
        MaximumWeight: {
          UOM: string;
          Value: number;
        }[];
      };
      AllowanceDescription: {
        ApplicableParty: string;
        Descriptions?: {
          Description: {
            Text: {
              value: string;
            };
          }[];
        };
      };
    }>;
  };
  FlightList?: {
    Flight: Array<{
      SegmentReferences: {
        OffPoint?: string;
        value: string[];
        OnPoint?: string;
      };
      FlightKey: string;
      Journey?: {
        /** Total journey duration of this flight, eg: PTHM */
        Time: string;
        Distance?: {
          UOM: string;
          /** Decimal number, eg: 1234.56 */
          Value: string;
        };
      };
    }>;
  };
  MediaList?: {
    Media: Array<{
      ListKey: string;
      MediaLinks?: [
        {
          Type: string;
          Size: string;
          Url: string;
        }
      ];
    }>;
  };
  PriceClassList?: {
    PriceClass: Array<{
      Descriptions?: {
        Description: {
          Category?: string;
          Media?: [
            {
              MediaRef: string;
            }
          ];
          Text: {
            value: string;
          };
        }[];
      };
      DisplayOrder: string;
      ObjectKey: string;
      Code?: string;
      Name: string;
    }>;
  };
  OriginDestinationList: {
    OriginDestination: {
      ArrivalCode: {
        value: string;
      };
      FlightReferences: {
        value: string[];
      };
      DepartureCode: {
        value: string;
      };
      OriginDestinationKey: string;
    }[];
  };
  FareList?: {
    FareGroup: Array<{
      ListKey: string;
      FareBasisCode?: {
        Code: string;
      };
      refs?: string[];
      Fare?: {
        FareDetail?: {
          Remarks: {
            Remark: {
              value: string;
            }[];
          };
        };
        FareCode: {
          Code: string;
        };
      };
    }>;
  };
  CarryOnAllowanceList?: {
    CarryOnAllowance: Array<{
      ListKey: string;
      PieceAllowance?: [
        {
          ApplicableParty: string;
          PieceMeasurements?: {
            Quantity: number;
          }[];
          TotalQuantity: number;
          /** Possible values are AND / OR */
          PieceAllowanceCombination?: string;
          ApplicableBag?: string;
        }
      ];
      WeightAllowance?: {
        ApplicableParty: string;
        MaximumWeight?: {
          UOM: string;
          Value: number;
        }[];
      };
      AllowanceDescription?: {
        ApplicableParty: string;
        Descriptions?: {
          Description: [
            {
              Text: {
                value: string;
              };
            }
          ];
        };
      };
    }>;
  };
  FlightSegmentList: {
    FlightSegment: Array<{
      SegmentKey: string;
      FlightDetail?: {
        FlightDuration: {
          /** ISO Duration. PTHM */
          Value: string;
        };
        Stops?: {
          StopLocations?: {
            StopLocation: {
              /** HH-MM */
              DepartureTime?: string;
              AirportCode: {
                value: string;
              };
              /** YYYY-MM-DD */
              ArrivalDate?: string;
              DepartureDate?: string;
              ArrivalTime?: string;
            }[];
          };
          StopQuantity: number;
        };
      };
      Equipment?: {
        AircraftCode: {
          value: string;
        };
        Name?: string;
      };
      Departure: {
        AirportCode: {
          value: string;
        };
        AirportName?: string;
        Time: string;
        Terminal?: {
          Name: string;
        };
        Date: string;
      };
      MarketingCarrier: {
        AirlineID: {
          value: string;
        };
        FlightNumber: {
          value: string;
        };
        Name?: string;
      };
      OperatingCarrier?: {
        AirlineID: {
          value: string;
        };
        Disclosures?: [
          {
            Description: [
              {
                Text: {
                  value: string;
                };
              }
            ];
          }
        ];
        Name: string;
      };
      Arrival: {
        ChangeOfDay?: number;
        AirportCode: {
          value: string;
        };
        AirportName?: string;
        Time: string;
        Terminal?: {
          Name: string;
        };
        Date: string;
      };
    }>;
  };
  AnonymousTravelerList?: {
    AnonymousTraveler: Array<{
      ObjectKey: string;
      PTC: {
        /** ADT, CHD, INF */
        value: string;
      };
      Age?: {
        Value?: {
          value: number;
        };
        BirthDate?: {
          value: string;
        };
      };
    }>;
  };
  PenaltyList?: {
    Penalty: Array<IDataListsPenalty>;
  };
  RecognizedTravelerList?: {
    RecognizedTraveler: Array<{
      FQTVs: {
        AirlineID: {
          value: string;
        };
        Account: {
          Number: {
            value: number;
          }[];
        };
        ProgramID?: string;
      }[];
      ObjectKey: string;
      PTC: {
        /** ADT, CHD or INF */
        value: string;
      };
      Age?: {
        Value?: {
          /** Date format */
          value: string;
        };
        BirthDate?: {
          /** Integer */
          value: number;
        };
      };
      Name: {
        Given: {
          value: string;
        }[];
        Title?: string;
        Surname: {
          value: string;
        };
      };
    }>;
  };
}

export interface IDataListsPenalty {
  ObjectKey: string;
  Details: {
    Detail: {
      /** Cancel, Cancel-Noshow, Change, Change-Noshow, Upgrade, NoShow, Other */
      Type: string;
      Amounts?: {
        Amount: {
          ApplicableFeeRemarks?: {
            Remark: {
              value: string;
            }[];
          };
          CurrencyAmountValue?: {
            value: number;
            Code: string;
          };
          /** MAX or MIN */
          AmountApplication: string;
        }[];
      };
      Application?: {
        Code: string;
      };
    }[];
  };
  CancelFeeInd?: boolean;
  ChangeAllowedInd?: boolean;
  UpgradeFeeInd?: boolean;
  ChangeFeeInd?: boolean;
  RefundableInd?: boolean;
}

export interface IMetaData {
  Shopping: {
    ShopMetadataGroup: {
      Offer: {
        disclosureMetadatasOrOfferMetadatasOrOfferInstructionMetadatas: Array<{
          OfferMetadatas: {
            OfferMetadata: Array<{
              AugmentationPoint: {
                AugPoint: {
                  any: {
                    VdcAugPoint: [
                      {
                        Values?: string[];
                        Key: string;
                      }
                    ];
                  };
                  /** Airline Code */
                  Key: string;
                }[];
              };
              MetadataKey: string;
            }>;
          };
        }>;
      };
    };
  };
  Other: {
    OtherMetadata: Array<{
      PriceMetadatas?: {
        PriceMetadata: {
          AugmentationPoint: {
            AugPoint: {
              any: {
                "@type"?: string;
              };
            }[];
          };
          MetadataKey: string;
        }[];
      };
      // PriceMetadatas?: {
      //   PriceMetadata: Array<{
      //     AugmentationPoint: {
      //       AugPoint: {
      //         "any@type"?: string;
      //         any: {
      //           value: string;
      //         };
      //       }[];
      //     };
      //     MetadataKey: string;
      //   }>;
      // };
      CurrencyMetadatas?: {
        CurrencyMetadata: Array<{
          MetadataKey: string;
          Decimals: number;
        }>;
      };
      RuleMetadatas?: {
        RuleMetadata: Array<{
          Values?: {
            Value: [
              {
                Instruction: {};
              }
            ];
          };
          MetadataKey: string;
        }>;
      };
      DescriptionMetadatas?: {
        DescriptionMetadata: Array<{
          AugmentationPoint: {
            AugPoint: {
              Owner: string;
              Key: string;
            }[];
          };
          MetadataKey: string;
        }>;
      };
    }>;
  };
}

interface IError {
  Owner?: string;
  ShortText: string; // short text identifying the error
  value: string; // descriptive message about the error
  Code: string; // INTERNAL_ERROR / VALIDATION_FAILURE / AIRLINE_ERROR
  Reason?: string;
}
// END -- SEARCH RESPONSE TYPES //

// START -- FLIGHT PRICE TYPES //
export interface IVerteilFlightPriceRS {
  ShoppingResponseID: {
    ResponseID: {
      value: string;
    };
  };
  PricedFlightOffers: { PricedFlightOffer: Array<IPricedFlightOffer> };
  DataLists: IFlightPriceDataLists;
  Metadata?: IFlightPriceMetaData;
  Errors?: {
    Error: {
      Owner: string;
      ShortText: string;
      value: string;
      Code: string;
      Reason: string;
    }[];
  };
  Warnings?: {
    Warning: {
      value: string;
    }[];
  };
}

interface IPricedFlightOffer {
  OfferID: {
    Owner: string;
    Channel?: string;
    ObjectKey: string;
    value: string;
  };
  OfferPrice: {
    OfferItemID?: string;
    FareDetail?: {
      FareComponent: [
        {
          refs: string[];
          SegmentReference: {
            value: string;
          };
          FareRules?: {
            CorporateFare?: {
              Account: {
                value: string;
              };
            };
            Penalty: {
              refs: string[];
            };
          };
        }
      ];
    };
    Commission?: [
      {
        Percentage: {};
        Amount: {
          value: number;
          Code: string;
        };
        Code: string;
      }
    ];
    RequestedDate: {
      Associations: Array<{
        PriceClass?: {
          PriceClassReference: string;
        };
        AssociatedService?: {
          ServiceReferences: string[];
          SeatAssignment?: [
            {
              Seat: {
                Location: {
                  Column: string;
                  Characteristics: {
                    Characteristic: [
                      {
                        Remarks: {
                          Remark: [
                            {
                              value: string;
                            }
                          ];
                        };
                        Code: string;
                      }
                    ];
                  };
                  Row: {
                    Number: {
                      value: number;
                    };
                  };
                };
              };
            }
          ];
        };
        AssociatedTraveler: {
          TravelerReferences: string[];
        };
        ApplicableFlight: {
          FlightReferences: {
            value: string[];
          };
          FlightSegmentReference?: {
            ref?: string;
            BagDetailAssociation?: {
              BagDisclosureReferences?: string;
              CarryOnReferences?: string[];
              CheckedBagReferences?: string[];
            };
            ClassOfService: {
              refs?: string[];
              Code?: {
                value: string;
              };
              MarketingName?: {
                CabinDesignator: string;
                value: string;
              };
            };
          }[];
          OriginDestinationReferences?: string[];
        };
      }>;
      PriceDetail: {
        BaseAmount: {
          value: number;
          Code: string;
        };
        Discount?: {
          discountName?: string;
          Description?: string;
          discountCode?: string;
          discountOwner: string;
          preDiscountedAmount?: {
            value: number;
            Code: string;
          };
          Application?: string;
          DiscountAmount: {
            value: number;
            Code: string;
          };
          DiscountPercent?: number;
        }[];
        Taxes: {
          Total: {
            value: number;
            Code: string;
          };
          Breakdown?: {
            Tax: [
              {
                Description?: string;
                TaxCode: string;
                Amount: {
                  value: number;
                  Code: string;
                };
              }
            ];
          };
        };
        Surcharges?: {
          Surcharge: {
            Total: {
              value: number;
              Code: string;
            };
            Breakdown?: {
              Fee: [
                {
                  Designator?: string;
                  Description?: string;
                  FeePercent?: number;
                  Amount: {
                    value: number;
                    Code: string;
                  };
                  FeeOwner: string;
                }
              ];
            };
          }[];
        };
        TotalAmount: {
          SimpleCurrencyPrice: {
            value: number;
            Code: string;
          };
        };
        Fees?: {
          Total: {
            value: number;
            Code: string;
          };
          Breakdown: {
            Fee: {
              FeeName?: string;
              FeePercent?: string;
              RefundInd?: boolean;
              Amount: {
                value: number;
                Code: string;
              };
              FeeCode: string;
              FeeOwner: string;
            }[];
          };
        };
      };
    };
  }[];
  TimeLimits?: {
    Payment: {
      DateTime: string;
    };
    OfferExpiration: {
      DateTime: string;
    };
    OtherLimits?: {
      OtherLimit: {
        PriceGuarantee?: {
          DateTime: string;
        };
      };
    };
  };
}
interface IFlightPriceDataLists {
  BagDisclosureList: {
    BagDisclosure: {
      ListKey: string;
      Descriptions?: {
        Description: {
          Text: {
            value: string;
          };
        }[];
      };
      BagRule: string;
    }[];
  };
  CheckedBagAllowanceList?: {
    CheckedBagAllowance: Array<{
      ListKey: string;
      PieceAllowance?: {
        ApplicableParty: string; // Value will always be Traveler
        PieceMeasurements?: [
          {
            Quantity: number;
          }
        ];
        TotalQuantity: number;
        PieceAllowanceCombination?: string;
      }[];
      WeightAllowance?: {
        ApplicableParty: string;
        MaximumWeight: {
          UOM: string;
          Value: number;
        }[];
      };
      AllowanceDescription: {
        ApplicableParty: string;
        Descriptions?: {
          Description: {
            Text: {
              value: string;
            };
          }[];
        };
      };
    }>;
  };
  FlightList: {
    Flight: Array<{
      SegmentReferences: {
        OffPoint?: string;
        value: string[];
        OnPoint?: string;
      };
      FlightKey: string;
      Journey?: {
        Time: string; // Total journey duration of this flight, eg: PTHM
      };
    }>;
  };
  MediaList?: {
    Media: Array<{
      ListKey: string;
      MediaLinks?: [
        {
          Type: string;
          Size: string;
          Url: string;
        }
      ];
    }>;
  };
  PriceClassList?: {
    PriceClass: Array<{
      Descriptions?: {
        Description: {
          Category?: string;
          Media?: [
            {
              MediaRef: string;
            }
          ];
          Text: {
            value: string;
          };
        }[];
      };
      DisplayOrder: string;
      ObjectKey: string;
      Code?: string;
      Name: string;
    }>;
  };
  OriginDestinationList: {
    OriginDestination: {
      ArrivalCode: {
        value: string;
      };
      FlightReferences: {
        value: string[];
      };
      DepartureCode: {
        value: string;
      };
      OriginDestinationKey: string;
    }[];
  };
  FareList?: {
    FareGroup: Array<{
      ListKey: string;
      FareBasisCode?: {
        Code: string;
      };
      refs?: string[];
      Fare?: {
        FareDetail?: {
          Remarks: {
            Remark: {
              value: string;
            }[];
          };
        };
        FareCode: {
          Code: string;
        };
      };
    }>;
  };
  CarryOnAllowanceList?: {
    CarryOnAllowance: Array<{
      ListKey: string;
      PieceAllowance?: [
        {
          ApplicableParty: string;
          PieceMeasurements?: {
            Quantity: number;
          }[];
          TotalQuantity: number;
          PieceAllowanceCombination?: string; // Possible values are AND / OR
          ApplicableBag?: string;
        }
      ];
      WeightAllowance?: {
        ApplicableParty: string;
        MaximumWeight?: {
          UOM: string;
          Value: number;
        }[];
      };
      AllowanceDescription?: {
        ApplicableParty: string;
        Descriptions?: {
          Description: [
            {
              Text: {
                value: string;
              };
            }
          ];
        };
      };
    }>;
  };
  FlightSegmentList?: {
    FlightSegment: Array<{
      SegmentKey: string;
      FlightDetail?: {
        FlightDuration: {
          Value: string; // ISO Duration, eg: PTHM
        };
        Stops?: {
          StopLocations?: {
            StopLocation: {
              DepartureTime?: string; // HH-MM
              AirportCode: {
                value: string;
              };
              ArrivalDate?: string; // YYYY-MM-DD
              DepartureDate?: string;
              ArrivalTime?: string;
            }[];
          };
          StopQuantity: number;
        };
      };
      Equipment?: {
        AircraftCode: {
          value: string;
        };
        Name?: string;
      };
      Departure: {
        AirportCode: {
          value: string;
        };
        AirportName?: string;
        Time: string;
        Terminal?: {
          Name: string;
        };
        Date: string;
      };
      MarketingCarrier: {
        AirlineID: {
          value: string;
        };
        FlightNumber: {
          value: string;
        };
        Name?: string;
      };
      OperatingCarrier?: {
        AirlineID: {
          value: string;
        };
        Disclosures?: [
          {
            Description: [
              {
                Text: {
                  value: string;
                };
              }
            ];
          }
        ];
        Name: string;
      };
      Arrival: {
        ChangeOfDay?: number;
        AirportCode: {
          value: string;
        };
        AirportName?: string;
        Time: string;
        Terminal?: {
          Name: string;
        };
        Date: string;
      };
    }>;
  };
  AnonymousTravelerList?: {
    AnonymousTraveler: Array<{
      ObjectKey: string;
      PTC: {
        /** ADT, CHD or INF */
        value: string;
      };
      Age?: {
        Value?: {
          value: number;
        };
        BirthDate?: {
          value: string;
        };
      };
    }>;
  };
  PenaltyList?: {
    Penalty: Array<{
      ObjectKey: string;
      Details: {
        Detail: {
          Type: string;
          Amounts?: {
            Amount: {
              ApplicableFeeRemarks?: {
                Remark: {
                  value: string;
                }[];
              };
              CurrencyAmountValue?: {
                value: number;
                Code: string;
              };
              AmountApplication: string; // MAX / MIN
            }[];
          };
          Application?: {
            Code: string;
          };
        }[];
      };
      CancelFeeInd?: boolean;
      ChangeAllowedInd?: boolean;
      UpgradeFeeInd?: boolean;
      ChangeFeeInd?: boolean;
      RefundableInd?: boolean;
    }>;
  };
  RecognizedTravelerList?: {
    RecognizedTraveler: Array<{
      FQTVs: {
        AirlineID: {
          value: string;
        };
        Account: {
          Number: {
            value: number;
          }[];
        };
        ProgramID?: string;
      }[];
      ObjectKey: string;
      PTC: {
        value: string; // ADT/CHD/INF
      };
      Age?: {
        Value?: {
          value: string; // Date format
        };
        BirthDate?: {
          value: number; // integer
        };
      };
      Name: {
        Given: {
          value: string;
        }[];
        Title?: string;
        Surname: {
          value: string;
        };
      };
    }>;
  };
}

interface IFlightPriceMetaData {
  Other?: {
    OtherMetadata?: [
      {
        PriceMetadatas?: {
          PriceMetadata: {
            AugmentationPoint: {
              AugPoint: [
                {
                  any: {
                    "@type"?: string;
                    VdcAugPoint?: [
                      {
                        Value: string;
                      }
                    ];
                  };
                }
              ];
            };
            MetadataKey: string;
          }[];
        };
        CurrencyMetadatas?: {
          CurrencyMetadata: {
            MetadataKey: string;
            Decimals: number;
          }[];
        };
        PaymentCardMetadatas?: {
          PaymentCardMetadata: {
            CardName: string;
            CardType: string;
            CardCode: string;
            MetadataKey: string;
            CardFields: {
              FieldName: {
                value: string;
                Mandatory: true;
              };
            };
          }[];
        };
      }
    ];
  };
}

// END -- FLIGHT PRICE TYPES //

// START -- ORDER CREATE TYPES //
export interface IVerteilOrderCreateRS {
  Response?: {
    Order: [
      {
        Status?: {
          StatusCode: {
            /** The status of the cancelled booking is given as 'X'. */
            Code: string;
          };
        };
        OrderItems?: {
          /** OrderItems are generated either at the PTC level or on a per-pax basis */
          OrderItem: Array<{
            Disclosures?: {
              Description: [
                {
                  Text: {
                    value: string;
                  };
                  Link?: string;
                }
              ];
            };
            Services?: {
              ServiceDefinitionRefs: string;
              PassengerReferences: string;
              ServiceID: {
                Status?: string;
                ObjectKey: string;
              };
              SegmentRefs?: string;
            }[];
            SellerFollowUpAction?: {
              ActionCode?: string;
              ActionInd?: true;
            };
            Price?: {
              Total: {
                value: number;
                Code: string;
              };
            };
            SeatItem?: {
              Price: {
                Total: {
                  value: number;
                  Code: string;
                };
              };
              SeatAssociation?: {
                SegmentReferences: {
                  value: string[];
                };
                TravelerReference: string;
              }[];
              Location?: {
                Column: string;
                Row: {
                  Number: {
                    value: string;
                  };
                };
                Associations?: {
                  Services?: {
                    ServiceDefinitionReferences?: string;
                    PassengerReferences?: string;
                    ServiceID?: [
                      {
                        refs?: string[];
                        ObjectKey?: string;
                        value?: string;
                      }
                    ];
                  };
                };
              };
            };
            FareRules?: {
              Penalty: {
                refs: string[];
              };
            };
            Associations?: {
              AssociatedService?: {
                ServiceReferences?: string[];
              };
              Passengers: {
                PassengerReferences: string[];
              };
              IncludedService: {
                ServiceReferences: string[];
                ServiceStatus?: [
                  {
                    StatusCode?: string;
                    ServiceID?: string;
                  }
                ];
              };
            };
            FlightItem?: {
              FareDetail: {
                Account?: string;
                TourCode?: string;
                FareComponent: {
                  refs: string[];
                  PriceClassReference: string[];
                  FareRules?: {
                    Penalty: {
                      Details?: {};
                      refs: string[];
                    };
                  };
                }[];
              };
              Price: {
                BaseAmount: {
                  value: number;
                  Code: string;
                };
                Discount?: {
                  discountName?: string;
                  discountCode?: string;
                  discountOwner: string;
                  preDiscountedAmount?: {
                    value: number;
                    Code: string;
                  };
                  DiscountAmount: {
                    value: number;
                    Code: string;
                  };
                  DiscountPercent?: number;
                }[];
                Taxes?: {
                  Total: {
                    value: number;
                    Code: string;
                  };
                  Breakdown?: {
                    Tax: {
                      Description?: string;
                      TaxCode?: string;
                      Amount: {
                        value: number;
                        Code: string;
                      };
                    }[];
                  };
                };
                Surcharges?: {
                  Surcharge: {
                    Total: {
                      value: number;
                      Code: string;
                    };
                    Breakdown?: {
                      Fee: [
                        {
                          Designator?: string;
                          Description?: string;
                          FeePercent?: number;
                          Amount: {
                            value: number;
                            Code: string;
                          };
                          FeeOwner: string;
                        }
                      ];
                    };
                  }[];
                };
                Fees: {
                  Total: {
                    value: number;
                    Code: string;
                  };
                  Breakdown: {
                    Fee: {
                      FeeName?: string;
                      FeePercent?: number;
                      RefundInd?: true;
                      Amount: {
                        value: number;
                        Code: string;
                      };
                      FeeCode: string;
                      FeeOwner: string;
                    }[];
                  };
                };
              };
              OriginDestination: Array<{
                Flight: Array<{
                  SegmentKey?: string;
                  Details?: {
                    FlightSegmentType: {
                      Code: string;
                    };
                    FlightDistance?: {
                      Value: number;
                    };
                    FlightDuration?: {
                      Value: string;
                    };
                    Stops?: {
                      StopQuantity: number;
                    };
                  };
                  Equipment?: {
                    AircraftCode: {
                      value: string;
                    };
                    Name?: string;
                  };
                  Departure: {
                    AirportCode: {
                      value: string;
                    };
                    AirportName?: string;
                    Time: string;
                    Terminal?: {
                      Name: string;
                    };
                    Date: string;
                  };
                  MarketingCarrier: {
                    AirlineID: {
                      value: string;
                    };
                    FlightNumber: {
                      value: string;
                    };
                    ResBookDesigCode?: string;
                    Name?: string;
                  };
                  OperatingCarrier?: {
                    AirlineID: {
                      value: string;
                    };
                    Name?: string;
                  };
                  ClassOfService: {
                    refs?: string[];
                    Code?: {
                      value: string;
                    };
                    MarketingName: {
                      CabinDesignator: string;
                      value?: string;
                    };
                  };
                  Arrival: {
                    ChangeOfDay?: number;
                    AirportCode: {
                      value: string;
                    };
                    AirportName?: string;
                    Time: string;
                    Terminal?: {
                      Name: string;
                    };
                    Date: string;
                  };
                }>;
              }>;
            };
            BaggageItem?: {
              refs: string[];
            };
            TimeLimits?: {
              PaymentTimeLimit?: {
                /** YYYY-MM-DDTHH-MM-SS.SSS (GTM */
                Timestamp: string;
              };
              PriceGuaranteeTimeLimits?: {
                /** YYYY-MM-DDTHH-MM-SS.SSS (GTM */
                Timestamp: string;
              };
            };
            Penalty?: {
              refs: string[];
            };
            OrderItemID?: {
              /** IATA code of the airline providing the service. */
              Owner: string;
              value: string;
            };
          }>;
        };
        CreationAPI: string;
        BookingReferences: {
          BookingReference: [
            {
              /** Verteil Booking Reference number */
              ID: string;
              OtherID: {
                value: string;
                Name: string;
              };
            }
          ];
        };
        LastModificationAPI: string;
        Commission: {
          Percentage?: number;
          Amount: {
            value: number;
            Code: string;
          };
          Code: string;
        }[];
        TotalOrderPrice: {
          SimpleCurrencyPrice: {
            value: number;
            Code: string;
          };
        };
        OrderID: {
          Owner: string;
          Channel: string;
          /** PNR code */
          value: string;
        };
        TimeLimits?: {
          PaymentTimeLimit: {
            /** YYYY-MM-DDTHH-MM-SS.SSS */
            DateTime: string;
          };
        };
      }
    ];
    DataLists: {
      CheckedBagAllowanceList?: {
        CheckedBagAllowance: [
          {
            ListKey: string;
            PieceAllowance: [
              {
                ApplicableParty: string;
                PieceMeasurements: [
                  {
                    Quantity: number;
                  }
                ];
                TotalQuantity: number;
              }
            ];
            WeightAllowance: {
              MaximumWeight: [
                {
                  UOM: string;
                  Value: number;
                }
              ];
            };
            AllowanceDescription: {
              ApplicableParty: string;
              Descriptions: {
                Description: [
                  {
                    Text: {
                      value: string;
                    };
                  }
                ];
              };
            };
          }
        ];
      };
      FlightList?: {};
      DisclosureList?: {
        Disclosures: [
          {
            Description: [
              {
                Text: {
                  value: string;
                };
              }
            ];
          }
        ];
      };
      PriceClassList?: {
        PriceClass: [
          {
            ObjectKey: string;
            Code: string;
            Name: string;
          }
        ];
      };
      OriginDestinationList?: {
        OriginDestination: [
          {
            ArrivalCode: {
              value: string;
            };
            FlightReferences: {
              value: string[];
            };
            DepartureCode: {
              value: string;
            };
            OriginDestinationKey: string;
          }
        ];
      };
      FareList?: {
        FareGroup: [
          {
            FareBasisCode: {
              Code: string;
            };
            refs: string[];
            Fare: {
              FareDetail: {
                Remarks: {
                  Remark: [
                    {
                      value: string;
                    }
                  ];
                };
                FareComponent: [
                  {
                    PriceBreakdown: {
                      Price: {
                        BaseAmount: {
                          Code: string;
                          value: number;
                        };
                        Taxes: {
                          Total: {
                            value: number;
                            Code: string;
                          };
                          Breakdown: {
                            Tax: [
                              {
                                TaxType: string;
                                Description: string;
                                Amount: {
                                  Code: string;
                                  value: number;
                                };
                              }
                            ];
                          };
                        };
                        Surcharges: {
                          Surcharge: [
                            {
                              Total: {
                                value: number;
                                Code: string;
                              };
                              Breakdown: {
                                Fee: [
                                  {
                                    Designator: string;
                                    Description: string;
                                    FeePercent: number;
                                    Amount: {
                                      value: number;
                                      Code: string;
                                    };
                                    FeeOwner: string;
                                  }
                                ];
                              };
                            }
                          ];
                        };
                      };
                    };
                    FareBasis: {
                      RBD: string;
                    };
                    SegmentReference: {
                      value: string[];
                    };
                    FareRules: {
                      CorporateFare: {
                        Account: {
                          value: string;
                        };
                      };
                    };
                  }
                ];
              };
              FareCode: {
                refs: string[];
                Code: string;
              };
            };
          }
        ];
      };
      ServiceList?: {
        Service: [
          {
            Descriptions: {
              Description: [
                {
                  Text: {
                    value: string;
                  };
                  Application: string;
                }
              ];
            };
            Settlement: {
              Method: {
                Code: string;
              };
            };
            refs: string[];
            ObjectKey: string;
            Encoding: {
              RFIC: {
                Code: string;
              };
              SubCode: {
                value: string;
              };
            };
            Associations: [
              {
                Flight: {
                  originDestinationReferencesOrSegmentReferences: string[];
                };
                Traveler: {
                  TravelerReferences: string[];
                };
              }
            ];
            Detail: {
              ServiceCoupon: {
                CouponType: {
                  value: string;
                };
              };
            };
            BookingInstructions: {
              SSRCode: string[];
              Method: string;
            };
            Name: {
              value: string;
            };
          }
        ];
      };
      CarryOnAllowanceList?: {
        CarryOnAllowance: [
          {
            ListKey: string;
            PieceAllowance: [
              {
                ApplicableParty: string;
                PieceMeasurements: [
                  {
                    Quantity: number;
                  }
                ];
                TotalQuantity: number;
              }
            ];
            WeightAllowance: {
              ApplicableParty: string;
              MaximumWeight: [
                {
                  UOM: string;
                  Value: number;
                }
              ];
            };
            AllowanceDescription: {
              ApplicableParty: string;
              Descriptions: {
                Description: [
                  {
                    Text: {
                      value: string;
                    };
                  }
                ];
              };
            };
          }
        ];
      };
      FlightSegmentList?: {};
      AnonymousTravelerList?: {};
      PenaltyList?: {
        Penalty: [
          {
            Details: {
              Detail: [
                {
                  Type: string;
                  Amounts: {
                    Amount: [
                      {
                        ApplicableFeeRemarks: {
                          Remark: [
                            {
                              value: string;
                            }
                          ];
                        };
                        CurrencyAmountValue: {
                          value: number;
                          Code: string;
                        };
                        AmountApplication: string;
                      }
                    ];
                  };
                  Application: {
                    Code: string;
                  };
                }
              ];
            };
            CancelFeeInd: true;
            ChangeAllowedInd: true;
            ObjectKey: string;
            ChangeFeeInd: true;
            RefundableInd: true;
          }
        ];
      };
    };
    Passengers: {
      Passenger: [
        {
          Contacts: {
            Contact: [
              {
                PhoneContact: {
                  Number: [
                    {
                      CountryCode: string;
                      value: string;
                    }
                  ];
                  Application: string;
                };
                EmailContact: {
                  Address: {
                    value: string;
                  };
                };
                AddressContact: {
                  Street: string[];
                  PostalCode: string;
                  CityName: string;
                  CountryCode: {
                    value: string;
                  };
                };
                ContactRefuseInd: true;
              }
            ];
          };
          Employer: {
            SalesTaxRegistration: {
              SalesTaxRegistrationId: string;
            };
            Name: string;
          };
          PassengerIDInfo: {
            PassengerDocument: [
              {
                CountryOfResidence: string;
                Type: string;
                DateOfIssue: string;
                ID: string;
                DateOfExpiration: string;
                CountryOfIssuance: string;
              }
            ];
          };
          FQTVs: {
            TravelerFQTV_Information: [
              {
                AirlineID: {
                  value: string;
                };
                Account: {
                  Number: {
                    value: string;
                  };
                };
                ProgramID: string;
              }
            ];
          };
          ObjectKey: string;
          AirlinePassengerId: string;
          Gender: {
            value: string;
          };
          PTC: {
            value: string;
          };
          PassengerAssociation: string;
          Age: {
            Value: {
              value: number;
            };
            BirthDate: {
              value: string;
            };
          };
          Name: {
            Given: [
              {
                value: string;
              }
            ];
            Title: string;
            Surname: {
              value: string;
            };
          };
        }
      ];
    };
    Metadata?: {
      Other: {
        OtherMetadata: [
          {
            PriceMetadatas: {
              PriceMetadata: [
                {
                  AugmentationPoint: {
                    AugPoint: [
                      {
                        any: {
                          "@type": string;
                          value: string;
                        };
                      }
                    ];
                  };
                  MetadataKey: string;
                }
              ];
            };
            CurrencyMetadatas: {
              CurrencyMetadata: [
                {
                  MetadataKey: string;
                  Decimals: number;
                }
              ];
            };
            RuleMetadatas: {
              RuleMetadata: [
                {
                  RuleID: {
                    value: string;
                  };
                  Values: {
                    Value: [
                      {
                        Instruction: {
                          value: string;
                        };
                      }
                    ];
                  };
                  MetadataKey: string;
                }
              ];
            };
            PaymentCardMetadatas: {
              PaymentCardMetadata: [
                {
                  Surcharge: [
                    {
                      Amount: {
                        value: number;
                        Code: string;
                      };
                    }
                  ];
                }
              ];
            };
          }
        ];
      };
    };
    Payments?: {
      Payment: [
        {
          Type: {
            Code: string;
          };
          Amount: {
            value: number;
            Code: string;
          };
          Method: {
            CashMethod: {
              Amount: {
                value: number;
                Code: string;
              };
            };
            EasyPay: {
              ExpirationDate: string;
              MaskedAcccountNumber: string;
            };
            PaymentCardMethod: {
              CardCode: string;
              MaskedCardNumber: string;
              SecurePaymentVersion2: {
                PaymentTrxChannelCode: string;
              };
            };
            OtherMethod: {
              Remarks: {
                Remark: [
                  {
                    value: string;
                  }
                ];
              };
            };
          };
          SurchargeAmount: {
            value: number;
            Code: string;
          };
          Associations: {
            OrderItemID: [
              {
                Owner: string;
                value: string;
              }
            ];
          };
        }
      ];
    };
    TicketDocInfos?: {
      TicketDocInfo: Array<{
        IssuingAirlineInfo?: {
          AirlineName: string;
        };
        Price?: {
          Total: {
            value: number;
            Code: string;
          };
        };
        TicketDocument?: [
          {
            Type?: {
              Definition?: string;
              Code: string;
            };
            PrimaryDocInd?: true;
            TicketDocNbr: string;
            DateOfIssue: string;
            ReportingType: string;
            TicketingLocation?: string;
            CouponInfo: {
              Status?: {
                Code: string;
              };
              CouponReference?: string;
              FareBasisCode?: {
                Code: string;
              };
              ServiceReferences?: string[];
              AddlBaggageInfo?: {};
              CurrentAirlineInfo?: {
                Departure: {
                  AirportCode: {
                    value: string;
                  };
                  /** HH-MM */
                  Time: string;
                  /** YYYY-MM-DDTHH-MM-SS.SSS */
                  Date: string;
                };
                MarketingCarrier?: {
                  AirlineID: {
                    value: string;
                  };
                  FlightNumber: {
                    value: string;
                  };
                  ResBookDesigCode: string;
                };
                Arrival: {
                  AirportCode: {
                    value: string;
                  };
                  /** HH-MM */
                  Time: string;
                  /** YYYY-MM-DDTHH-MM-SS.SSS */
                  Date: string;
                };
              };
              InConnectionWithInfo?: {
                InConnectionWithDocNbr?: string;
                InConnectionCpnNbr?: number;
              };
              ReasonForIssuance?: {
                Description?: string;
                RFIC?: {
                  Code: string;
                };
                Code?: string;
              };
              CouponNumber: number;
              SoldAirlineInfo?: {
                DepartureDateTime: {
                  /** YYYY-MM-DDTHH-MM-SS.SSS */
                  DateTime: string;
                };
                Departure: {
                  AirportCode: {
                    value: string;
                  };
                  AirportName?: string;
                  /** HH-MM */
                  Time: string;
                  /** YYYY-MM-DDTHH-MM-SS.SSS */
                  Date: string;
                };
                MarketingCarrier?: {
                  AirlineID: {
                    value: string;
                  };
                  FlightNumber: {
                    value: string;
                  };
                };
                Arrival: {
                  AirportCode: {
                    value: string;
                  };
                };
              };
            }[];
            NumberofBooklets: number;
            Remark?: string;
          }
        ];
        AgentIDs?: {
          AgentID: {
            Type?: {
              Code: string;
            };
            ID?: {
              value: string;
            };
          }[];
        };
        PassengerReference: string[];
      }>;
    };
  };
  Errors?: {
    Error: {
      Owner?: string;
      ShortText: string;
      value: string;
      Code: string;
      Reason?: string;
    }[];
  };
  Document?: {
    /** IATA code of the airline */
    Name: string;
  };
  Warnings?: {
    Warning?: {
      Code?: string;
      value?: string;
    }[];
  };
}
// END -- ORDER CREATE TYPES //

// START -- ORDER RETRIEVE TYPES //

export interface IVerteilOrderRetrieveRS extends IVerteilOrderCreateRS { }

interface IFormattedOrderRetrieveError {
  success: boolean;
  error: { code: number; message: string };
}

export interface IFormattedOrderRetrieveSuccess {
  success: boolean;
  apiOrderRef?: string;
  paymentTimeLimit?: string;
  pnr_code?: string;
  flightTickets: Array<{
    number: string;
    status: string;
    originalTicketData: any;
  }>;
  baggageDescription: Array<{
    PTC: string;
    baggageDesc: string;
  }>;
}

export type IFormattedOrderRetrieveRS =
  | IFormattedOrderRetrieveSuccess
  | IFormattedOrderRetrieveError;



// END -- ORDER RETRIEVE TYPES //

// START -- ORDER RESHOP TYPES //

export interface IVerteilOrderReshopRS {
  response?: {
    warnings?: [
      {
        code: number;
        message: string;
        details: [
          {
            "@type": string;
            additionalProp1: string;
            additionalProp2: string;
            additionalProp3: string;
          }
        ];
      }
    ];
    repriceResult: {
      // Only one of no_price_change_ind or reprice_offer will be returned
      /**  When true, the Reprice had no effect on the price(s) of the original Order/OrderItems */
      noPriceChangeInd: true;
      /** List of offers which has undergone a price change. */
      repricedOffers: {
        offers: [
          {
            offerId: string;
            ownerCode: string;
            repricedOfferItems: Array<{
              offerItemId: string;
              fareDetails?: [
                {
                  passengerRefs: string[];
                  farePriceTypeCode: "PER_PAX" | "PARTY";
                  price: {
                    totalAmount: {
                      currencyCode: string;
                      units?: string;
                      nanos?: number;
                    };
                    baseAmount?: {
                      currencyCode: string;
                      units?: string;
                      nanos?: number;
                    };
                    taxSummaries?: {
                      totalTaxAmount: {
                        currencyCode: string;
                        units?: string;
                        nanos?: number;
                      };
                      allRefundableInd?: true;
                      approximateInd?: true;
                      collectionInd?: true;
                      breakdown?: [
                        {
                          taxCode?: string;
                          amount: {
                            currencyCode: string;
                            units?: string;
                            nanos?: number;
                          };
                          descText?: string;
                          refundInd?: true;
                          qualifierCode?: string;
                          collectionInd?: true;
                        }
                      ];
                    }[];
                    surcharges?: [
                      {
                        totalAmount: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        breakdown?: [
                          {
                            ownerCode: string;
                            code: string;
                            name: string;
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            percent: number;
                            maxAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            minAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            approxInd: true;
                            refundInd: true;
                            descText: string;
                            includedInBaseFare: true;
                          }
                        ];
                      }
                    ];
                    fees?: [
                      {
                        ownerCode?: string;
                        code?: string;
                        name?: string;
                        amount: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        percent?: number;
                        maxAmount?: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        minAmount?: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        approxInd?: true;
                        refundInd?: true;
                        descText?: string;
                        includedInBaseFare?: true;
                      }
                    ];
                    discounts?: [
                      {
                        ownerCode?: string;
                        code?: string;
                        name?: string;
                        amount: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        preDiscountedAmount?: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        percent?: number;
                      }
                    ];
                    markups?: [
                      {
                        amount: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        typeCode?: string;
                      }
                    ];
                    commissions?: [
                      {
                        amount: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        commissionCode: string;
                        percentage?: number;
                      }
                    ];
                    curConversions?: [
                      {
                        amount: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        sourceAmount: {
                          currencyCode: string;
                          units?: string;
                          nanos?: number;
                        };
                        multiplierValue: number;
                        format?: string;
                      }
                    ];
                    dueByAirlineAmount?: {
                      currencyCode: string;
                      units?: string;
                      nanos?: number;
                    };
                  };
                  fareWaivers?: [
                    {
                      fareRuleWaiverCode: string;
                      fareWaiverType: string;
                    }
                  ];
                  fareComponents: [
                    {
                      cabinCode: "CABIN_UNSPECIFIED";
                      cabinName: string;
                      priceClassRefId: string;
                      paxSegmentRefId: string[];
                      fbc: string;
                      fareType: "FARE_TYPE_UNSPECIFIED";
                      rbd: string;
                      seatsLeft: number;
                      ticketDesigCode: string;
                      fareRule: {
                        penaltyRefIds: string[];
                      };
                      augRefIds: string[];
                    }
                  ];
                  tourCode?: string;
                  accountCode?: string;
                  fareCalculationInfo?: {
                    pricingCodeText: string;
                    addlInfoText: string;
                    reportingCodeText: string;
                  };
                  penaltyRefIds?: string[];
                  augRefIds?: string[];
                }
              ];
              price: {
                totalAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                baseAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                taxSummaries: [
                  {
                    totalTaxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    allRefundableInd: true;
                    approximateInd: true;
                    collectionInd: true;
                    breakdown: [
                      {
                        taxCode: string;
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        descText: string;
                        refundInd: true;
                        qualifierCode: string;
                        collectionInd: true;
                      }
                    ];
                  }
                ];
                surcharges: [
                  {
                    totalAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    breakdown: [
                      {
                        ownerCode: string;
                        code: string;
                        name: string;
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        percent: number;
                        maxAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        minAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        approxInd: true;
                        refundInd: true;
                        descText: string;
                        includedInBaseFare: true;
                      }
                    ];
                  }
                ];
                fees: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                    maxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    minAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    approxInd: true;
                    refundInd: true;
                    descText: string;
                    includedInBaseFare: true;
                  }
                ];
                discounts: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    preDiscountedAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                  }
                ];
                markups: [
                  {
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    typeCode: string;
                  }
                ];
                commissions: [
                  {
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    commissionCode: string;
                    percentage: number;
                  }
                ];
                curConversions: [
                  {
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    sourceAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    multiplierValue: number;
                    format: string;
                  }
                ];
                dueByAirlineAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
              };
              originalOrderItems: [
                {
                  orderItemRefId: string;
                  ownerCode: string;
                  fareDetails: [
                    {
                      passengerRefs: string[];
                      farePriceTypeCode: "PER_PAX";
                      price: {
                        totalAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        baseAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        taxSummaries: [
                          {
                            totalTaxAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            allRefundableInd: true;
                            approximateInd: true;
                            collectionInd: true;
                            breakdown: [
                              {
                                taxCode: string;
                                amount: {
                                  currencyCode: string;
                                  units: string;
                                  nanos: number;
                                };
                                descText: string;
                                refundInd: true;
                                qualifierCode: string;
                                collectionInd: true;
                              }
                            ];
                          }
                        ];
                        surcharges: [
                          {
                            totalAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            breakdown: [
                              {
                                ownerCode: string;
                                code: string;
                                name: string;
                                amount: {
                                  currencyCode: string;
                                  units: string;
                                  nanos: number;
                                };
                                percent: number;
                                maxAmount: {
                                  currencyCode: string;
                                  units: string;
                                  nanos: number;
                                };
                                minAmount: {
                                  currencyCode: string;
                                  units: string;
                                  nanos: number;
                                };
                                approxInd: true;
                                refundInd: true;
                                descText: string;
                                includedInBaseFare: true;
                              }
                            ];
                          }
                        ];
                        fees: [
                          {
                            ownerCode: string;
                            code: string;
                            name: string;
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            percent: number;
                            maxAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            minAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            approxInd: true;
                            refundInd: true;
                            descText: string;
                            includedInBaseFare: true;
                          }
                        ];
                        discounts: [
                          {
                            ownerCode: string;
                            code: string;
                            name: string;
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            preDiscountedAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            percent: number;
                          }
                        ];
                        markups: [
                          {
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            typeCode: string;
                          }
                        ];
                        commissions: [
                          {
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            commissionCode: string;
                            percentage: number;
                          }
                        ];
                        curConversions: [
                          {
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            sourceAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            multiplierValue: number;
                            format: string;
                          }
                        ];
                        dueByAirlineAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                      };
                      fareWaivers: [
                        {
                          fareRuleWaiverCode: string;
                          fareWaiverType: string;
                        }
                      ];
                      fareComponents: [
                        {
                          cabinCode: "CABIN_UNSPECIFIED";
                          cabinName: string;
                          priceClassRefId: string;
                          paxSegmentRefId: string[];
                          fbc: string;
                          fareType: "FARE_TYPE_UNSPECIFIED";
                          rbd: string;
                          seatsLeft: number;
                          ticketDesigCode: string;
                          fareRule: {
                            penaltyRefIds: string[];
                          };
                          augRefIds: string[];
                        }
                      ];
                      tourCode: string;
                      accountCode: string;
                      fareCalculationInfo: {
                        pricingCodeText: string;
                        addlInfoText: string;
                        reportingCodeText: string;
                      };
                      penaltyRefIds: string[];
                      augRefIds: string[];
                    }
                  ];
                  price: {
                    totalAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    baseAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    taxSummaries: [
                      {
                        totalTaxAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        allRefundableInd: true;
                        approximateInd: true;
                        collectionInd: true;
                        breakdown: [
                          {
                            taxCode: string;
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            descText: string;
                            refundInd: true;
                            qualifierCode: string;
                            collectionInd: true;
                          }
                        ];
                      }
                    ];
                    surcharges: [
                      {
                        totalAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        breakdown: [
                          {
                            ownerCode: string;
                            code: string;
                            name: string;
                            amount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            percent: number;
                            maxAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            minAmount: {
                              currencyCode: string;
                              units: string;
                              nanos: number;
                            };
                            approxInd: true;
                            refundInd: true;
                            descText: string;
                            includedInBaseFare: true;
                          }
                        ];
                      }
                    ];
                    fees: [
                      {
                        ownerCode: string;
                        code: string;
                        name: string;
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        percent: number;
                        maxAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        minAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        approxInd: true;
                        refundInd: true;
                        descText: string;
                        includedInBaseFare: true;
                      }
                    ];
                    discounts: [
                      {
                        ownerCode: string;
                        code: string;
                        name: string;
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        preDiscountedAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        percent: number;
                      }
                    ];
                    markups: [
                      {
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        typeCode: string;
                      }
                    ];
                    commissions: [
                      {
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        commissionCode: string;
                        percentage: number;
                      }
                    ];
                    curConversions: [
                      {
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        sourceAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        multiplierValue: number;
                        format: string;
                      }
                    ];
                    dueByAirlineAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                  };
                  services: [
                    {
                      serviceId: string;
                      paxRefIds: string[];
                      serviceAssociation: {
                        paxJourneyRefs: {
                          paxJourneyRefIds: string[];
                        };
                        seatAssignment: {
                          segmentLegs: [
                            {
                              paxSegmentRefId: string;
                              legRefIds: string[];
                            }
                          ];
                          seat: {
                            rowNumber: number;
                            columnId: string;
                            seatProfileRefId: string;
                          };
                          serviceDefRefId: string;
                        };
                        serviceDefRef: {
                          paxJourneyRefs: {
                            paxJourneyRefIds: string[];
                          };
                          paxSegmentRefs: {
                            paxSegmentRefIds: string[];
                          };
                          legsRefs: {
                            segmentLegs: [
                              {
                                paxSegmentRefId: string;
                                legRefIds: string[];
                              }
                            ];
                          };
                          serviceDefRefId: string;
                        };
                      };
                      validatingCarrierCode: string;
                    }
                  ];
                }
              ];
            }>;
            /** 2025-05-04T08:05:45.386Z" */
            offerExpirationDateTime: string;
            /** 2025-05-04T08:05:45.386Z" */
            paymentTimeLimitDateTime: string;
            /** 2025-05-04T08:05:45.386Z" */
            priceGuaranteeTimeLimitDateTime: string;
            commissions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                commissionCode: string;
                percentage: number;
              }
            ];
            /** Don't consume its value as total price */
            totalPrice: {
              totalAmount: {
                currencyCode: string;
                units: string;
                nanos: number;
              };
              baseAmount?: {
                currencyCode: string;
                units: string;
                nanos: number;
              };
              taxSummaries?: [
                {
                  totalTaxAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  allRefundableInd: true;
                  approximateInd: true;
                  collectionInd: true;
                  breakdown: [
                    {
                      taxCode: string;
                      amount: {
                        currencyCode: string;
                        units: string;
                        nanos: number;
                      };
                      descText: string;
                      refundInd: true;
                      qualifierCode: string;
                      collectionInd: true;
                    }
                  ];
                }
              ];
              surcharges?: [
                {
                  totalAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  breakdown: [
                    {
                      ownerCode: string;
                      code: string;
                      name: string;
                      amount: {
                        currencyCode: string;
                        units: string;
                        nanos: number;
                      };
                      percent: number;
                      maxAmount: {
                        currencyCode: string;
                        units: string;
                        nanos: number;
                      };
                      minAmount: {
                        currencyCode: string;
                        units: string;
                        nanos: number;
                      };
                      approxInd: true;
                      refundInd: true;
                      descText: string;
                      includedInBaseFare: true;
                    }
                  ];
                }
              ];
              fees?: [
                {
                  ownerCode: string;
                  code: string;
                  name: string;
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  percent: number;
                  maxAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  minAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  approxInd: true;
                  refundInd: true;
                  descText: string;
                  includedInBaseFare: true;
                }
              ];
              discounts?: [
                {
                  ownerCode: string;
                  code: string;
                  name: string;
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  preDiscountedAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  percent: number;
                }
              ];
              markups?: [
                {
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  typeCode: string;
                }
              ];
              commissions?: [
                {
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  commissionCode: string;
                  percentage: number;
                }
              ];
              curConversions?: [
                {
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  sourceAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  multiplierValue: number;
                  format: string;
                }
              ];
              dueByAirlineAmount?: {
                currencyCode: string;
                units: string;
                nanos: number;
              };
            };
            baggageAllowanceSpecs: [
              {
                paxJourneyRefIds: string[];
                paxRefIds: string[];
                baggageAllowanceRefId: string;
              }
            ];
            augRefIds: string[];
          }
        ];
      };
      noPriceChangeOrderItems?: [
        {
          orderItemRefId: string;
          ownerCode: string;
          fareDetails: [
            {
              passengerRefs: string[];
              farePriceTypeCode: "PER_PAX";
              price: {
                totalAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                baseAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                taxSummaries: [
                  {
                    totalTaxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    allRefundableInd: true;
                    approximateInd: true;
                    collectionInd: true;
                    breakdown: [
                      {
                        taxCode: string;
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        descText: string;
                        refundInd: true;
                        qualifierCode: string;
                        collectionInd: true;
                      }
                    ];
                  }
                ];
                surcharges: [
                  {
                    totalAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    breakdown: [
                      {
                        ownerCode: string;
                        code: string;
                        name: string;
                        amount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        percent: number;
                        maxAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        minAmount: {
                          currencyCode: string;
                          units: string;
                          nanos: number;
                        };
                        approxInd: true;
                        refundInd: true;
                        descText: string;
                        includedInBaseFare: true;
                      }
                    ];
                  }
                ];
                fees: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                    maxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    minAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    approxInd: true;
                    refundInd: true;
                    descText: string;
                    includedInBaseFare: true;
                  }
                ];
                discounts: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    preDiscountedAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                  }
                ];
                markups: [
                  {
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    typeCode: string;
                  }
                ];
                commissions: [
                  {
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    commissionCode: string;
                    percentage: number;
                  }
                ];
                curConversions: [
                  {
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    sourceAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    multiplierValue: number;
                    format: string;
                  }
                ];
                dueByAirlineAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
              };
              fareWaivers: [
                {
                  fareRuleWaiverCode: string;
                  fareWaiverType: string;
                }
              ];
              fareComponents: [
                {
                  cabinCode: "CABIN_UNSPECIFIED";
                  cabinName: string;
                  priceClassRefId: string;
                  paxSegmentRefId: string[];
                  fbc: string;
                  fareType: "FARE_TYPE_UNSPECIFIED";
                  rbd: string;
                  seatsLeft: number;
                  ticketDesigCode: string;
                  fareRule: {
                    penaltyRefIds: string[];
                  };
                  augRefIds: string[];
                }
              ];
              tourCode: string;
              accountCode: string;
              fareCalculationInfo: {
                pricingCodeText: string;
                addlInfoText: string;
                reportingCodeText: string;
              };
              penaltyRefIds: string[];
              augRefIds: string[];
            }
          ];
          price: {
            totalAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            baseAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            taxSummaries: [
              {
                totalTaxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                allRefundableInd: true;
                approximateInd: true;
                collectionInd: true;
                breakdown: [
                  {
                    taxCode: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    descText: string;
                    refundInd: true;
                    qualifierCode: string;
                    collectionInd: true;
                  }
                ];
              }
            ];
            surcharges: [
              {
                totalAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                breakdown: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                    maxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    minAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    approxInd: true;
                    refundInd: true;
                    descText: string;
                    includedInBaseFare: true;
                  }
                ];
              }
            ];
            fees: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
                maxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                minAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                approxInd: true;
                refundInd: true;
                descText: string;
                includedInBaseFare: true;
              }
            ];
            discounts: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                preDiscountedAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
              }
            ];
            markups: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                typeCode: string;
              }
            ];
            commissions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                commissionCode: string;
                percentage: number;
              }
            ];
            curConversions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                sourceAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                multiplierValue: number;
                format: string;
              }
            ];
            dueByAirlineAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
          };
          services: [
            {
              serviceId: string;
              paxRefIds: string[];
              serviceAssociation: {
                paxJourneyRefs: {
                  paxJourneyRefIds: string[];
                };
                seatAssignment: {
                  segmentLegs: [
                    {
                      paxSegmentRefId: string;
                      legRefIds: string[];
                    }
                  ];
                  seat: {
                    rowNumber: number;
                    columnId: string;
                    seatProfileRefId: string;
                  };
                  serviceDefRefId: string;
                };
                serviceDefRef: {
                  paxJourneyRefs: {
                    paxJourneyRefIds: string[];
                  };
                  paxSegmentRefs: {
                    paxSegmentRefIds: string[];
                  };
                  legsRefs: {
                    segmentLegs: [
                      {
                        paxSegmentRefId: string;
                        legRefIds: string[];
                      }
                    ];
                  };
                  serviceDefRefId: string;
                };
              };
              validatingCarrierCode: string;
            }
          ];
        }
      ];
      unchangedCommissions?: [
        {
          amount: {
            currencyCode: string;
            units: string;
            nanos: number;
          };
          commissionCode: string;
          percentage: number;
        }
      ];
      /** Consume its value as total price */
      totalPrice: {
        totalAmount: {
          currencyCode: string;
          units?: string;
          nanos?: number;
        };
        baseAmount?: {
          currencyCode: string;
          units?: string;
          nanos?: number;
        };
        taxSummaries?: {
          totalTaxAmount: {
            currencyCode: string;
            units?: string;
            nanos?: number;
          };
          allRefundableInd?: true;
          approximateInd?: true;
          collectionInd?: true;
          breakdown?: [
            {
              taxCode?: string;
              amount: {
                currencyCode: string;
                units?: string;
                nanos?: number;
              };
              descText?: string;
              refundInd?: true;
              qualifierCode?: string;
              collectionInd?: true;
            }
          ];
        }[];
        surcharges?: Array<{
          totalAmount: {
            currencyCode: string;
            units?: string;
            nanos?: number;
          };
          breakdown?: [
            {
              ownerCode: string;
              code: string;
              name: string;
              amount: {
                currencyCode: string;
                units: string;
                nanos: number;
              };
              percent: number;
              maxAmount: {
                currencyCode: string;
                units: string;
                nanos: number;
              };
              minAmount: {
                currencyCode: string;
                units: string;
                nanos: number;
              };
              approxInd: true;
              refundInd: true;
              descText: string;
              includedInBaseFare: true;
            }
          ];
        }>;
        fees?: [
          {
            ownerCode?: string;
            code?: string;
            name?: string;
            amount: {
              currencyCode: string;
              units?: string;
              nanos?: number;
            };
            percent?: number;
            maxAmount?: {
              currencyCode: string;
              units?: string;
              nanos?: number;
            };
            minAmount?: {
              currencyCode: string;
              units?: string;
              nanos?: number;
            };
            approxInd?: true;
            refundInd?: true;
            descText?: string;
            includedInBaseFare?: true;
          }
        ];
        discounts?: Array<{
          ownerCode?: string;
          code?: string;
          name?: string;
          amount: {
            currencyCode: string;
            units?: string;
            nanos?: number;
          };
          preDiscountedAmount?: {
            currencyCode: string;
            units?: string;
            nanos?: number;
          };
          percent?: number;
        }>;
        markups?: [
          {
            amount: {
              currencyCode: string;
              units?: string;
              nanos?: number;
            };
            typeCode?: string;
          }
        ];
        commissions?: [
          {
            amount: {
              currencyCode: string;
              units?: string;
              nanos?: number;
            };
            commissionCode: string;
            percentage?: number;
          }
        ];
        curConversions?: [
          {
            amount: {
              currencyCode: string;
              units?: string;
              nanos?: number;
            };
            sourceAmount: {
              currencyCode: string;
              units?: string;
              nanos?: number;
            };
            multiplierValue: number;
            format?: string;
          }
        ];
        dueByAirlineAmount?: {
          currencyCode: string;
          units?: string;
          nanos?: number;
        };
      };
    };
    paymentFunctions?: [
      {
        offerAssociations: [
          {
            offerRefId: string;
            ownerCode: string;
            channel: "NDC";
            offerItemRefId: string[];
          }
        ];
        orderAssociations: [
          {
            orderRefId: string;
            ownerCode: string;
            channel: "NDC";
            orderItemRefId: string[];
          }
        ];
        paymentSupportedMethod: {
          paymentSurcharge: {
            preciseAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
          };
          paymentTypeCode: "PAYMENT_TYPE_UNDEFINED";
        };
      }
    ];
    dataMap: {
      passengers: {
        additionalProp1: {
          ptc: "PTC_UNSPECIFIED";
          paxRefId: string;
          individual: {
            birthdate: string;
            genderCode: "UNSPECIFIED";
            titleName: string;
            givenNames: string[];
            middleNames: string[];
            surname: string;
          };
          loyaltyProgramAccounts: [
            {
              loyaltyProgram: {
                allianceCode: string;
                carrierCode: string;
                programCode: string;
              };
              accountNumber: string;
            }
          ];
          citizenshipCountryCode: string;
          contactInfoRefId: string;
        };
        additionalProp2: {
          ptc: "PTC_UNSPECIFIED";
          paxRefId: string;
          individual: {
            birthdate: string;
            genderCode: "UNSPECIFIED";
            titleName: string;
            givenNames: string[];
            middleNames: string[];
            surname: string;
          };
          loyaltyProgramAccounts: [
            {
              loyaltyProgram: {
                allianceCode: string;
                carrierCode: string;
                programCode: string;
              };
              accountNumber: string;
            }
          ];
          citizenshipCountryCode: string;
          contactInfoRefId: string;
        };
        additionalProp3: {
          ptc: "PTC_UNSPECIFIED";
          paxRefId: string;
          individual: {
            birthdate: string;
            genderCode: "UNSPECIFIED";
            titleName: string;
            givenNames: string[];
            middleNames: string[];
            surname: string;
          };
          loyaltyProgramAccounts: [
            {
              loyaltyProgram: {
                allianceCode: string;
                carrierCode: string;
                programCode: string;
              };
              accountNumber: string;
            }
          ];
          citizenshipCountryCode: string;
          contactInfoRefId: string;
        };
      };
      contactInfos: {
        additionalProp1: {
          contactPurpose: "CTC_OTHER";
          individual: {
            birthdate: string;
            genderCode: "UNSPECIFIED";
            titleName: string;
            givenNames: string[];
            middleNames: string[];
            surname: string;
          };
          phone: [
            {
              contactType: "TYPE_OTHER";
              countryDialingCode: string;
              phoneNumber: string;
              extensionNumber: string;
            }
          ];
          postalAddresses: [
            {
              contactType: "TYPE_OTHER";
              streetTexts: string[];
              cityName: string;
              postalCode: string;
              countryName: string;
              countryCode: string;
              countrySubDivisionName: string;
            }
          ];
          emailAddresses: [
            {
              contactType: "TYPE_OTHER";
              emailAddressText: string;
            }
          ];
          paxSegmentRefId: string;
          contactRefusedInd: true;
        };
        additionalProp2: {
          contactPurpose: "CTC_OTHER";
          individual: {
            birthdate: string;
            genderCode: "UNSPECIFIED";
            titleName: string;
            givenNames: string[];
            middleNames: string[];
            surname: string;
          };
          phone: [
            {
              contactType: "TYPE_OTHER";
              countryDialingCode: string;
              phoneNumber: string;
              extensionNumber: string;
            }
          ];
          postalAddresses: [
            {
              contactType: "TYPE_OTHER";
              streetTexts: string[];
              cityName: string;
              postalCode: string;
              countryName: string;
              countryCode: string;
              countrySubDivisionName: string;
            }
          ];
          emailAddresses: [
            {
              contactType: "TYPE_OTHER";
              emailAddressText: string;
            }
          ];
          paxSegmentRefId: string;
          contactRefusedInd: true;
        };
        additionalProp3: {
          contactPurpose: "CTC_OTHER";
          individual: {
            birthdate: string;
            genderCode: "UNSPECIFIED";
            titleName: string;
            givenNames: string[];
            middleNames: string[];
            surname: string;
          };
          phone: [
            {
              contactType: "TYPE_OTHER";
              countryDialingCode: string;
              phoneNumber: string;
              extensionNumber: string;
            }
          ];
          postalAddresses: [
            {
              contactType: "TYPE_OTHER";
              streetTexts: string[];
              cityName: string;
              postalCode: string;
              countryName: string;
              countryCode: string;
              countrySubDivisionName: string;
            }
          ];
          emailAddresses: [
            {
              contactType: "TYPE_OTHER";
              emailAddressText: string;
            }
          ];
          paxSegmentRefId: string;
          contactRefusedInd: true;
        };
      };
      paxSegments: {
        additionalProp1: {
          secureFlightIndicator: true;
          dep: {
            stationCode: string;
            terminalName: string;
            schedDateTime: string;
            aircraftType: string;
          };
          arrival: {
            stationCode: string;
            terminalName: string;
            schedDateTime: string;
            aircraftType: string;
          };
          aircraftType: string;
          duration: string;
          legs: [
            {
              operatingLegId: string;
              dep: {
                stationCode: string;
                terminalName: string;
                schedDateTime: string;
                aircraftType: string;
              };
              arrival: {
                stationCode: string;
                terminalName: string;
                schedDateTime: string;
                aircraftType: string;
              };
              aircraftType: string;
            }
          ];
          marketingInfo: {
            carrierCode: string;
            flightNumber: string;
            operationalSuffix: string;
            rbdCode: string;
          };
          operatingInfo: {
            carrierCode: string;
            flightNumber: string;
            operationalSuffix: string;
            rbdCode: string;
          };
        };
        additionalProp2: {
          secureFlightIndicator: true;
          dep: {
            stationCode: string;
            terminalName: string;
            schedDateTime: string;
            aircraftType: string;
          };
          arrival: {
            stationCode: string;
            terminalName: string;
            schedDateTime: string;
            aircraftType: string;
          };
          aircraftType: string;
          duration: string;
          legs: [
            {
              operatingLegId: string;
              dep: {
                stationCode: string;
                terminalName: string;
                schedDateTime: string;
                aircraftType: string;
              };
              arrival: {
                stationCode: string;
                terminalName: string;
                schedDateTime: string;
                aircraftType: string;
              };
              aircraftType: string;
            }
          ];
          marketingInfo: {
            carrierCode: string;
            flightNumber: string;
            operationalSuffix: string;
            rbdCode: string;
          };
          operatingInfo: {
            carrierCode: string;
            flightNumber: string;
            operationalSuffix: string;
            rbdCode: string;
          };
        };
        additionalProp3: {
          secureFlightIndicator: true;
          dep: {
            stationCode: string;
            terminalName: string;
            schedDateTime: string;
            aircraftType: string;
          };
          arrival: {
            stationCode: string;
            terminalName: string;
            schedDateTime: string;
            aircraftType: string;
          };
          aircraftType: string;
          duration: string;
          legs: [
            {
              operatingLegId: string;
              dep: {
                stationCode: string;
                terminalName: string;
                schedDateTime: string;
                aircraftType: string;
              };
              arrival: {
                stationCode: string;
                terminalName: string;
                schedDateTime: string;
                aircraftType: string;
              };
              aircraftType: string;
            }
          ];
          marketingInfo: {
            carrierCode: string;
            flightNumber: string;
            operationalSuffix: string;
            rbdCode: string;
          };
          operatingInfo: {
            carrierCode: string;
            flightNumber: string;
            operationalSuffix: string;
            rbdCode: string;
          };
        };
      };
      paxJourneys: {
        additionalProp1: {
          origin: string;
          dest: string;
          duration: string;
          paxSegmentRefIds: string[];
        };
        additionalProp2: {
          origin: string;
          dest: string;
          duration: string;
          paxSegmentRefIds: string[];
        };
        additionalProp3: {
          origin: string;
          dest: string;
          duration: string;
          paxSegmentRefIds: string[];
        };
      };
      baggageAllowances: {
        additionalProp1: {
          type: "BAGGAGE_TYPE_UNSPECIFIED";
          descText: string;
          weightAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              unit: "WEIGHT_UNIT_UNSPECIFIED";
              maxWeight: number;
            }
          ];
          pieceAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              zeroBagInd: true;
              totalQty: number;
              pieceWeightAllowances: [
                {
                  appParty: "PER_PAX";
                  combination: "AND";
                  appBagTypes: string[];
                  unit: "WEIGHT_UNIT_UNSPECIFIED";
                  maxWeight: number;
                }
              ];
              pieceDimensionAllowances: [
                {
                  appParty: "PER_PAX";
                  combination: "AND";
                  appBagTypes: string[];
                  dimensions: [
                    {
                      dimensionCategory: "BAG_DIMENSION_UNSPECIFIED";
                      unit: "DIMENSION_UNIT_UNSPECIFIED";
                      maxValue: number;
                      minValue: number;
                    }
                  ];
                }
              ];
            }
          ];
          dimensionAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              dimensions: [
                {
                  dimensionCategory: "BAG_DIMENSION_UNSPECIFIED";
                  unit: "DIMENSION_UNIT_UNSPECIFIED";
                  maxValue: number;
                  minValue: number;
                }
              ];
            }
          ];
        };
        additionalProp2: {
          type: "BAGGAGE_TYPE_UNSPECIFIED";
          descText: string;
          weightAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              unit: "WEIGHT_UNIT_UNSPECIFIED";
              maxWeight: number;
            }
          ];
          pieceAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              zeroBagInd: true;
              totalQty: number;
              pieceWeightAllowances: [
                {
                  appParty: "PER_PAX";
                  combination: "AND";
                  appBagTypes: string[];
                  unit: "WEIGHT_UNIT_UNSPECIFIED";
                  maxWeight: number;
                }
              ];
              pieceDimensionAllowances: [
                {
                  appParty: "PER_PAX";
                  combination: "AND";
                  appBagTypes: string[];
                  dimensions: [
                    {
                      dimensionCategory: "BAG_DIMENSION_UNSPECIFIED";
                      unit: "DIMENSION_UNIT_UNSPECIFIED";
                      maxValue: number;
                      minValue: number;
                    }
                  ];
                }
              ];
            }
          ];
          dimensionAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              dimensions: [
                {
                  dimensionCategory: "BAG_DIMENSION_UNSPECIFIED";
                  unit: "DIMENSION_UNIT_UNSPECIFIED";
                  maxValue: number;
                  minValue: number;
                }
              ];
            }
          ];
        };
        additionalProp3: {
          type: "BAGGAGE_TYPE_UNSPECIFIED";
          descText: string;
          weightAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              unit: "WEIGHT_UNIT_UNSPECIFIED";
              maxWeight: number;
            }
          ];
          pieceAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              zeroBagInd: true;
              totalQty: number;
              pieceWeightAllowances: [
                {
                  appParty: "PER_PAX";
                  combination: "AND";
                  appBagTypes: string[];
                  unit: "WEIGHT_UNIT_UNSPECIFIED";
                  maxWeight: number;
                }
              ];
              pieceDimensionAllowances: [
                {
                  appParty: "PER_PAX";
                  combination: "AND";
                  appBagTypes: string[];
                  dimensions: [
                    {
                      dimensionCategory: "BAG_DIMENSION_UNSPECIFIED";
                      unit: "DIMENSION_UNIT_UNSPECIFIED";
                      maxValue: number;
                      minValue: number;
                    }
                  ];
                }
              ];
            }
          ];
          dimensionAllowances: [
            {
              appParty: "PER_PAX";
              combination: "AND";
              appBagTypes: string[];
              dimensions: [
                {
                  dimensionCategory: "BAG_DIMENSION_UNSPECIFIED";
                  unit: "DIMENSION_UNIT_UNSPECIFIED";
                  maxValue: number;
                  minValue: number;
                }
              ];
            }
          ];
        };
      };
      serviceDefs: {
        additionalProp1: {
          ownerCode: string;
          name: string;
          rfic: "SERVICE_CATEGORY_UNSPECIFIED";
          rficSubCode: string;
          ssrCode: string;
          serviceDefAssociation: {
            baggageAllowanceRefId: string;
            serviceBundle: {
              maxServiceQty: number;
              serviceDefRefIds: string[];
            };
          };
          desc: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
          /** 2025-05-04T08:05:45.387Z */
          depositTltTime: string;
          /** 2025-05-04T08:05:45.387Z */
          nameTltTime: string;
        };
        additionalProp2: {
          ownerCode: string;
          name: string;
          rfic: "SERVICE_CATEGORY_UNSPECIFIED";
          rficSubCode: string;
          ssrCode: string;
          serviceDefAssociation: {
            baggageAllowanceRefId: string;
            serviceBundle: {
              maxServiceQty: number;
              serviceDefRefIds: string[];
            };
          };
          desc: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
          /** 2025-05-04T08:05:45.387Z */
          depositTltTime: string;
          /** 2025-05-04T08:05:45.387Z */
          nameTltTime: string;
        };
        additionalProp3: {
          ownerCode: string;
          name: string;
          rfic: "SERVICE_CATEGORY_UNSPECIFIED";
          rficSubCode: string;
          ssrCode: string;
          serviceDefAssociation: {
            baggageAllowanceRefId: string;
            serviceBundle: {
              maxServiceQty: number;
              serviceDefRefIds: string[];
            };
          };
          desc: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
          /** 2025-05-04T08:05:45.387Z */
          depositTltTime: string;
          /** 2025-05-04T08:05:45.387Z */
          nameTltTime: string;
        };
      };
      seatProfiles: {
        additionalProp1: {
          seatProfileId: string;
          seatCharCodes: string[];
          marketingInfo: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
        };
        additionalProp2: {
          seatProfileId: string;
          seatCharCodes: string[];
          marketingInfo: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
        };
        additionalProp3: {
          seatProfileId: string;
          seatCharCodes: string[];
          marketingInfo: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
        };
      };
      penalties: {
        additionalProp1: {
          type: "OTHERS";
          descTexts: string[];
          feeInd: true;
          netInd: true;
          penaltyPrice: {
            totalAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            baseAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            taxSummaries: [
              {
                totalTaxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                allRefundableInd: true;
                approximateInd: true;
                collectionInd: true;
                breakdown: [
                  {
                    taxCode: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    descText: string;
                    refundInd: true;
                    qualifierCode: string;
                    collectionInd: true;
                  }
                ];
              }
            ];
            surcharges: [
              {
                totalAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                breakdown: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                    maxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    minAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    approxInd: true;
                    refundInd: true;
                    descText: string;
                    includedInBaseFare: true;
                  }
                ];
              }
            ];
            fees: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
                maxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                minAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                approxInd: true;
                refundInd: true;
                descText: string;
                includedInBaseFare: true;
              }
            ];
            discounts: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                preDiscountedAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
              }
            ];
            markups: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                typeCode: string;
              }
            ];
            commissions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                commissionCode: string;
                percentage: number;
              }
            ];
            curConversions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                sourceAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                multiplierValue: number;
                format: string;
              }
            ];
            dueByAirlineAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
          };
          penaltyRestrictions: {
            modificationAllowedInd: true;
            changeTypeCode: "CHANGE_TYPE_UNSPECIFIED";
            descText: string;
            restrictions: [
              {
                journeyStageCode: "JOURNEY_STAGE_UNDEFINED";
                /** 2025-05-04T08:05:45.387Z */
                effectiveTime: string;
                /** 2025-05-04T08:05:45.387Z */
                expirationTime: string;
                fee: {
                  ownerCode: string;
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  percent: number;
                  maxAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  minAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  approxInd: true;
                  descText: string;
                };
              }
            ];
          };
        };
        additionalProp2: {
          type: "OTHERS";
          descTexts: string[];
          feeInd: true;
          netInd: true;
          penaltyPrice: {
            totalAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            baseAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            taxSummaries: [
              {
                totalTaxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                allRefundableInd: true;
                approximateInd: true;
                collectionInd: true;
                breakdown: [
                  {
                    taxCode: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    descText: string;
                    refundInd: true;
                    qualifierCode: string;
                    collectionInd: true;
                  }
                ];
              }
            ];
            surcharges: [
              {
                totalAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                breakdown: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                    maxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    minAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    approxInd: true;
                    refundInd: true;
                    descText: string;
                    includedInBaseFare: true;
                  }
                ];
              }
            ];
            fees: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
                maxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                minAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                approxInd: true;
                refundInd: true;
                descText: string;
                includedInBaseFare: true;
              }
            ];
            discounts: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                preDiscountedAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
              }
            ];
            markups: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                typeCode: string;
              }
            ];
            commissions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                commissionCode: string;
                percentage: number;
              }
            ];
            curConversions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                sourceAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                multiplierValue: number;
                format: string;
              }
            ];
            dueByAirlineAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
          };
          penaltyRestrictions: {
            modificationAllowedInd: true;
            changeTypeCode: "CHANGE_TYPE_UNSPECIFIED";
            descText: string;
            restrictions: [
              {
                journeyStageCode: "JOURNEY_STAGE_UNDEFINED";
                effectiveTime: string; // 2025-05-04T08:05:45.387Z
                expirationTime: string; // 2025-05-04T08:05:45.387Z
                fee: {
                  ownerCode: string;
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  percent: number;
                  maxAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  minAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  approxInd: true;
                  descText: string;
                };
              }
            ];
          };
        };
        additionalProp3: {
          type: "OTHERS";
          descTexts: string[];
          feeInd: true;
          netInd: true;
          penaltyPrice: {
            totalAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            baseAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
            taxSummaries: [
              {
                totalTaxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                allRefundableInd: true;
                approximateInd: true;
                collectionInd: true;
                breakdown: [
                  {
                    taxCode: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    descText: string;
                    refundInd: true;
                    qualifierCode: string;
                    collectionInd: true;
                  }
                ];
              }
            ];
            surcharges: [
              {
                totalAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                breakdown: [
                  {
                    ownerCode: string;
                    code: string;
                    name: string;
                    amount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    percent: number;
                    maxAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    minAmount: {
                      currencyCode: string;
                      units: string;
                      nanos: number;
                    };
                    approxInd: true;
                    refundInd: true;
                    descText: string;
                    includedInBaseFare: true;
                  }
                ];
              }
            ];
            fees: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
                maxAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                minAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                approxInd: true;
                refundInd: true;
                descText: string;
                includedInBaseFare: true;
              }
            ];
            discounts: [
              {
                ownerCode: string;
                code: string;
                name: string;
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                preDiscountedAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                percent: number;
              }
            ];
            markups: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                typeCode: string;
              }
            ];
            commissions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                commissionCode: string;
                percentage: number;
              }
            ];
            curConversions: [
              {
                amount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                sourceAmount: {
                  currencyCode: string;
                  units: string;
                  nanos: number;
                };
                multiplierValue: number;
                format: string;
              }
            ];
            dueByAirlineAmount: {
              currencyCode: string;
              units: string;
              nanos: number;
            };
          };
          penaltyRestrictions: {
            modificationAllowedInd: true;
            changeTypeCode: "CHANGE_TYPE_UNSPECIFIED";
            descText: string;
            restrictions: [
              {
                journeyStageCode: "JOURNEY_STAGE_UNDEFINED";
                /** 2025-05-04T08:05:45.387Z */
                effectiveTime: string;
                /** 2025-05-04T08:05:45.387Z */
                expirationTime: string;
                fee: {
                  ownerCode: string;
                  amount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  percent: number;
                  maxAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  minAmount: {
                    currencyCode: string;
                    units: string;
                    nanos: number;
                  };
                  approxInd: true;
                  descText: string;
                };
              }
            ];
          };
        };
      };
      priceClasses: {
        additionalProp1: {
          name: string;
          cabinCode: "CABIN_UNSPECIFIED";
          displayOrder: number;
          features: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
        };
        additionalProp2: {
          name: string;
          cabinCode: "CABIN_UNSPECIFIED";
          displayOrder: number;
          features: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
        };
        additionalProp3: {
          name: string;
          cabinCode: "CABIN_UNSPECIFIED";
          displayOrder: number;
          features: [
            {
              category: "FEATURE_UNSPECIFIED";
              descTexts: string[];
              mediaRefId: string[];
              paxSegmentRefIds: string[];
            }
          ];
        };
      };
      medias: {
        additionalProp1: {
          descText: string;
          mediaLinks: [
            {
              url: string;
              type: "IMAGE";
              size: "MEDIA_SIZE_UNSPECIFIED";
            }
          ];
        };
        additionalProp2: {
          descText: string;
          mediaLinks: [
            {
              url: string;
              type: "IMAGE";
              size: "MEDIA_SIZE_UNSPECIFIED";
            }
          ];
        };
        additionalProp3: {
          descText: string;
          mediaLinks: [
            {
              url: string;
              type: "IMAGE";
              size: "MEDIA_SIZE_UNSPECIFIED";
            }
          ];
        };
      };
    };
    augmentations?: {
      additionalProp1: {};
      additionalProp2: {};
      additionalProp3: {};
    };
  };
  error?: {
    code: string;
    descTexts: string[];
    tagText: string;
  };
}

// END -- ORDER RESHOP TYPES //

// START -- ORDER CANCEL TYPES //

export interface IVerteilOrderCancelRS {
  Response: [
    {
      ChangeFees?: {
        Details: {
          Detail: [
            {
              Amounts: {
                Amount: [
                  {
                    CurrencyAmountValue: {
                      value: number;
                      Code: string;
                    };
                  }
                ];
              };
            }
          ];
        };
      };
      OrderReference: string;
      TicketDocInfos?: {
        TicketDocInfo: Array<{
          BookingReferences?: {
            BookingReference: [
              {
                ID: string;
              }
            ];
          };
          TicketDocument: [
            {
              Type?: {
                Code: string;
              };
              TicketDocNbr: string;
              DateOfIssue: string;
              CouponInfo: [
                {
                  Status: {
                    Code: string;
                  };
                  CouponNumber: number;
                }
              ];
            }
          ];
          Payments: {
            Payment: [
              {
                Type?: {
                  Code: string;
                };
                Amount: {
                  value: number;
                  Code: string;
                };
              }
            ];
          };
        }>;
      };
    }
  ];
  Errors?: {
    Error: [
      {
        Owner?: string;
        ShortText: string;
        value: string;
        Code: string;
        Reason?: string;
      }
    ];
  };
  Warnings?: string;
  Success: {};
}

// END -- ORDER CANCEL TYPES //


// START -- TICKET ISSUE TYPES //
export interface IFormattedTicketIssueRes {
  success: boolean;
  message: string;
  code: number;
  error?: {
    priceChangeInd?: boolean;
    priceChangeAmount?: number;
  };
  data?: string[];
  ticket_status?: string;
}
// END -- TICKET ISSUE TYPES //
