"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerteilFlightUtils = void 0;
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
const lodash_1 = require("lodash");
class VerteilFlightUtils {
    //prepare data for storing into the redis
    PrepareMetaDataForFlightPrice(reqBody, FormattedResults, Data, AirShoppingRQ) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(FormattedResults.map((Result, ResultIndex) => {
                var _a, _b, _c, _d;
                const searchId = Result.api_search_id;
                const Offer = Data.OffersGroup.AirlineOffers[0].AirlineOffer.find((Offer) => Offer.OfferID.value === searchId);
                let hasDealCodeApplied = false;
                const OwnerCode = Offer.OfferID.Owner;
                //=== Generate DataLists ===//
                const fareGroupListRefs = Array.from(new Set(Offer.PricedOffer.OfferPrice.map((OP) => OP.FareDetail.FareComponent.map((FC) => FC.refs).flat()).flat()));
                const FareGroupList = this.deepClone(((_a = Data.DataLists.FareList) === null || _a === void 0 ? void 0 : _a.FareGroup.filter((FG) => fareGroupListRefs.includes(FG.ListKey))) || []);
                const FareGroupMetaRefs = [];
                FareGroupList.forEach((FL) => {
                    var _a;
                    if (FL.Fare) {
                        if (((_a = FL.Fare.FareDetail) === null || _a === void 0 ? void 0 : _a.Remarks.Remark[0].value) === "CF")
                            hasDealCodeApplied = true;
                        delete FL.Fare;
                    }
                    if (FL.refs)
                        FareGroupMetaRefs.push(...new Set(FL.refs));
                });
                const travelerRefs = Offer.PricedOffer.OfferPrice.map((OP) => OP.RequestedDate.Associations[0].AssociatedTraveler
                    .TravelerReferences).flat();
                const AnonymousTraveler = ((_b = Data.DataLists.AnonymousTravelerList) === null || _b === void 0 ? void 0 : _b.AnonymousTraveler.filter((AT) => travelerRefs.includes(AT.ObjectKey))) || [];
                //=== Generate Query ===//
                const QueryOriginDestination = Result.flights.map((Flight, LegIndex) => {
                    const Segments = Flight.options;
                    const Flights = Segments.map((Segment, SegmentIndex) => {
                        var _a;
                        return ({
                            SegmentKey: String(Segment.id),
                            // SegmentType:
                            //   reqBody.JourneyType === "2" ? "ReturnSeg" : "OnwardSeg",
                            Departure: {
                                AirportCode: { value: Segment.departure.airport_code },
                                Date: typeof Segment.departure.date === "string"
                                    ? Segment.departure.date
                                    : Segment.departure.date.toISOString().slice(0, 10),
                            },
                            Arrival: {
                                AirportCode: { value: Segment.arrival.airport_code },
                            },
                            MarketingCarrier: {
                                AirlineID: { value: Segment.carrier.carrier_marketing_code },
                                FlightNumber: {
                                    value: String(Segment.carrier.carrier_marketing_flight_number),
                                },
                            },
                            ClassOfService: {
                                refs: Array.from(new Set(Offer.PricedOffer.OfferPrice.map((OP) => OP.FareDetail.FareComponent[SegmentIndex].refs).flat())),
                                Code: {
                                    value: ((_a = Offer.PricedOffer.Associations[LegIndex].ApplicableFlight
                                        .FlightSegmentReference[SegmentIndex].ClassOfService.Code) === null || _a === void 0 ? void 0 : _a.value) || "",
                                },
                            },
                        });
                    });
                    return { Flight: Flights };
                });
                const QueryOffers = {
                    Offer: [
                        {
                            refs: Offer.refs,
                            OfferID: Offer.OfferID,
                            OfferItemIDs: {
                                OfferItemID: Offer.PricedOffer.OfferPrice.map((offerPrice) => ({
                                    value: offerPrice.OfferItemID,
                                    refs: offerPrice.RequestedDate.Associations[0]
                                        .AssociatedTraveler.TravelerReferences,
                                })),
                            },
                        },
                    ],
                };
                const Query = {
                    OriginDestination: QueryOriginDestination,
                    Offers: QueryOffers,
                };
                //=== Generate Metadata ===/
                const PriceMetadata = Offer.refs
                    ? Offer.refs
                        .map((MetaRef) => {
                        var _a;
                        const PriceMeta = (_a = Data.Metadata.Other.OtherMetadata[0].PriceMetadatas) === null || _a === void 0 ? void 0 : _a.PriceMetadata.filter((PriceMetaData) => PriceMetaData.MetadataKey === MetaRef.Ref);
                        return PriceMeta ? PriceMeta : [];
                    })
                        .flat()
                    : [];
                const PriceMetaDataMore = FareGroupMetaRefs.map((MetaRef) => {
                    var _a;
                    const PriceMeta = (_a = Data.Metadata.Other.OtherMetadata[0].PriceMetadatas) === null || _a === void 0 ? void 0 : _a.PriceMetadata.filter((PriceMetaData) => PriceMetaData.MetadataKey === MetaRef);
                    return PriceMeta ? PriceMeta : [];
                }).flat();
                PriceMetadata.push(...PriceMetaDataMore);
                //=== Generate ShoppingResponseID ===//
                const shoppingMeta = (_d = (_c = Data.Metadata) === null || _c === void 0 ? void 0 : _c.Other.OtherMetadata[0].DescriptionMetadatas) === null || _d === void 0 ? void 0 : _d.DescriptionMetadata.filter((dt) => dt.MetadataKey === "SHOPPING_RESPONSE_IDS");
                const info = shoppingMeta === null || shoppingMeta === void 0 ? void 0 : shoppingMeta[0].AugmentationPoint.AugPoint.find((ap) => ap.Owner === OwnerCode);
                const ShoppingResponseID = {
                    Owner: (info === null || info === void 0 ? void 0 : info.Owner) || "",
                    ResponseID: { value: (info === null || info === void 0 ? void 0 : info.Key) || "" },
                };
                const VerteilFlightPriceRequestBody = {
                    ShoppingResponseID,
                    Query,
                    DataLists: {
                        FareList: { FareGroup: FareGroupList },
                        AnonymousTravelerList: { AnonymousTraveler },
                    },
                    Travelers: {
                        Traveler: reqBody.PassengerTypeQuantity.map((PTQ) => {
                            const code = PTQ.Code;
                            return Array.from({ length: PTQ.Quantity }, () => {
                                if (flightConstants_1.PTC_TYPES_CHILD.includes(code))
                                    return {
                                        AnonymousTraveler: [
                                            {
                                                PTC: { Quantity: 1, value: "CHD" },
                                                Age: { Value: { value: 11 } },
                                            },
                                        ],
                                    };
                                else
                                    return {
                                        AnonymousTraveler: [
                                            { PTC: { Quantity: 1, value: code } },
                                        ],
                                    };
                            });
                        }).flat(),
                    },
                };
                if (PriceMetadata.length)
                    VerteilFlightPriceRequestBody.Metadata = {
                        Other: {
                            OtherMetadata: [
                                {
                                    PriceMetadatas: {
                                        PriceMetadata,
                                    },
                                },
                            ],
                        },
                    };
                // DEAL Codes
                if (hasDealCodeApplied && AirShoppingRQ.Party) {
                    const Party = AirShoppingRQ.Party;
                    const appliedDealCodes = Party.Sender.CorporateSender.CorporateCode;
                    const targetDealCodes = appliedDealCodes
                        .split(",")
                        .filter((adc) => adc.startsWith(OwnerCode));
                    if (targetDealCodes.length) {
                        VerteilFlightPriceRequestBody.Party = Object.assign({}, Party);
                        VerteilFlightPriceRequestBody.Party.Sender.CorporateSender.CorporateCode =
                            targetDealCodes.join(",");
                    }
                }
                return {
                    flight_id: Result.flight_id,
                    flightPriceRQ: VerteilFlightPriceRequestBody,
                };
            }));
        });
    }
    //prepare data for storing into the redis
    PrepareMetaDataFlightPricePlus(oldResult, reqBody, Data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const PricedFlightOffer = Data.PricedFlightOffers.PricedFlightOffer;
            //=== Generate DataLists ===//
            const FareGroup = (_a = Data.DataLists.FareList) === null || _a === void 0 ? void 0 : _a.FareGroup.map((FG) => ({
                ListKey: FG.ListKey,
                FareBasisCode: FG.FareBasisCode,
                refs: FG.refs,
            }));
            const DataLists = {
                FareList: FareGroup && { FareGroup },
                AnonymousTravelerList: Data.DataLists.AnonymousTravelerList,
            };
            //=== Generate Query ===//
            const QueryOriginDestination = Data.DataLists.OriginDestinationList.OriginDestination.map((OD) => {
                const FlightReference = OD.FlightReferences.value[0];
                const FlightInfo = Data.DataLists.FlightList.Flight.find((F) => F.FlightKey === FlightReference);
                const Segments = FlightInfo.SegmentReferences.value;
                const Flights = Segments.map((SegKey) => {
                    var _a, _b;
                    const Segment = (_a = Data.DataLists.FlightSegmentList) === null || _a === void 0 ? void 0 : _a.FlightSegment.find((FG) => FG.SegmentKey === SegKey);
                    return {
                        SegmentKey: SegKey,
                        // SegmentType:
                        //   reqBody.JourneyType === "2" ? "ReturnSeg" : "OnwardSeg",
                        Departure: {
                            AirportCode: Segment.Departure.AirportCode,
                            Date: (_b = Segment.Departure.Date) === null || _b === void 0 ? void 0 : _b.slice(0, 10),
                        },
                        Arrival: {
                            AirportCode: Segment.Arrival.AirportCode,
                        },
                        MarketingCarrier: {
                            AirlineID: Segment.MarketingCarrier.AirlineID,
                            FlightNumber: Segment.MarketingCarrier.FlightNumber,
                        },
                        // ClassOfService:
                    };
                });
                return { Flight: Flights };
            });
            const QueryOffers = {
                Offer: [
                    {
                        // refs: Offer.refs,
                        OfferID: {
                            Owner: PricedFlightOffer[0].OfferID.Owner,
                            Channel: PricedFlightOffer[0].OfferID.Channel || "",
                            value: PricedFlightOffer[0].OfferID.value,
                        },
                        OfferItemIDs: {
                            OfferItemID: PricedFlightOffer[0].OfferPrice.map((offerPrice) => ({
                                value: offerPrice.OfferItemID,
                                refs: offerPrice.RequestedDate.Associations[0].AssociatedTraveler
                                    .TravelerReferences,
                            })),
                        },
                    },
                ],
            };
            const Query = {
                OriginDestination: QueryOriginDestination,
                Offers: QueryOffers,
            };
            //=== Generate ShoppingResponseID ===//
            const ShoppingResponseID = {
                Owner: PricedFlightOffer[0].OfferID.Owner,
                ResponseID: Data.ShoppingResponseID.ResponseID,
            };
            const VerteilFlightPriceRequestBody = {
                ShoppingResponseID,
                Query,
                DataLists,
                Travelers: {
                    Traveler: reqBody.PassengerTypeQuantity.map((PTQ) => {
                        const code = PTQ.Code;
                        return Array.from({ length: PTQ.Quantity }, () => {
                            if (flightConstants_1.PTC_TYPES_CHILD.includes(code))
                                return {
                                    AnonymousTraveler: [
                                        {
                                            PTC: { Quantity: 1, value: "CHD" },
                                            Age: { Value: { value: 11 } },
                                        },
                                    ],
                                };
                            else
                                return {
                                    AnonymousTraveler: [{ PTC: { Quantity: 1, value: code } }],
                                };
                        });
                    }).flat(),
                },
            };
            if (Data.Metadata) {
                VerteilFlightPriceRequestBody.Metadata = Data.Metadata;
            }
            return {
                flight_id: oldResult.flight_id,
                flightPriceRQ: VerteilFlightPriceRequestBody,
            };
        });
    }
    //prepare data for storing into the redis
    PrepareMetaDataForOrderCreate(Data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const PricedFlightOffer = Data.PricedFlightOffers.PricedFlightOffer;
            //=== Generate OrderItems ===//
            const OrderItems = {};
            {
                const Owner = PricedFlightOffer[0].OfferID.Owner;
                const ResponseID = Data.ShoppingResponseID.ResponseID;
                const OfferID = PricedFlightOffer[0].OfferID;
                const ShoppingResponse = {
                    Owner,
                    ResponseID,
                    Offers: {
                        Offer: [
                            {
                                OfferID: Object.assign(Object.assign({}, OfferID), { Channel: OfferID.Channel || "NDC" }),
                                OfferItems: {
                                    OfferItem: PricedFlightOffer[0].OfferPrice.map((OP) => ({
                                        OfferItemID: {
                                            Owner,
                                            value: OP.OfferItemID || "",
                                        },
                                    })),
                                },
                            },
                        ],
                    },
                };
                const OfferItemID = {
                    Owner: OfferID.Owner,
                    Channel: OfferID.Channel,
                    value: OfferID.value,
                };
                const OfferItem = PricedFlightOffer[0].OfferPrice.map((OP, OPIndex) => {
                    const Associations = OP.RequestedDate.Associations;
                    const Price = {
                        BaseAmount: OP.RequestedDate.PriceDetail.BaseAmount,
                        Taxes: {
                            Total: OP.RequestedDate.PriceDetail.Taxes.Total,
                        },
                    };
                    const OriginDestination = Associations.map((Association, ODIndex) => {
                        var _a, _b;
                        const Flight = (_a = Association.ApplicableFlight.FlightSegmentReference) === null || _a === void 0 ? void 0 : _a.map((Segment, SegIndex) => {
                            var _a;
                            const SegRef = Segment.ref;
                            const SegDetail = (_a = Data.DataLists.FlightSegmentList) === null || _a === void 0 ? void 0 : _a.FlightSegment.find((FS) => FS.SegmentKey === SegRef);
                            return {
                                SegmentKey: OPIndex === 0 ? SegRef : undefined,
                                Details: SegDetail.FlightDetail
                                    ? {
                                        FlightDuration: SegDetail.FlightDetail.FlightDuration,
                                        Stops: SegDetail.FlightDetail.Stops
                                            ? {
                                                StopQuantity: SegDetail.FlightDetail.Stops.StopQuantity,
                                            }
                                            : undefined,
                                    }
                                    : undefined,
                                Equipment: SegDetail.Equipment,
                                Departure: {
                                    AirportCode: SegDetail.Departure.AirportCode,
                                    Time: SegDetail.Departure.Time,
                                    Terminal: SegDetail.Departure.Terminal,
                                    Date: SegDetail.Departure.Date,
                                },
                                MarketingCarrier: SegDetail === null || SegDetail === void 0 ? void 0 : SegDetail.MarketingCarrier,
                                OperatingCarrier: (SegDetail === null || SegDetail === void 0 ? void 0 : SegDetail.OperatingCarrier)
                                    ? {
                                        AirlineID: SegDetail === null || SegDetail === void 0 ? void 0 : SegDetail.OperatingCarrier.AirlineID,
                                        Name: SegDetail === null || SegDetail === void 0 ? void 0 : SegDetail.OperatingCarrier.Name,
                                    }
                                    : undefined,
                                ClassOfService: {
                                    refs: Segment.ClassOfService.refs,
                                    Code: Segment.ClassOfService.Code,
                                    MarketingName: Segment.ClassOfService.MarketingName
                                        ? {
                                            CabinDesignator: Segment.ClassOfService.MarketingName
                                                .CabinDesignator,
                                            value: Segment.ClassOfService.MarketingName.value,
                                        }
                                        : undefined,
                                },
                                Arrival: {
                                    AirportCode: SegDetail.Arrival.AirportCode,
                                    Time: SegDetail.Arrival.Time,
                                    Terminal: SegDetail.Arrival.Terminal,
                                    Date: SegDetail.Arrival.Date,
                                },
                            };
                        });
                        return OPIndex === 0
                            ? {
                                Flight,
                                OriginDestinationKey: (_b = Association.ApplicableFlight.OriginDestinationReferences) === null || _b === void 0 ? void 0 : _b[0],
                            }
                            : { Flight };
                    });
                    return {
                        OfferItemID: {
                            Owner: OfferID.Owner,
                            Channel: OfferID.Channel,
                            value: OP.OfferItemID,
                        },
                        OfferItemType: {
                            DetailedFlightItem: [
                                {
                                    Price,
                                    OriginDestination,
                                    refs: OP.RequestedDate.Associations[0].AssociatedTraveler
                                        .TravelerReferences,
                                },
                            ],
                        },
                    };
                });
                OrderItems.ShoppingResponse = ShoppingResponse;
                OrderItems.OfferItem = OfferItem;
            }
            //=== Generate DataLists ===//
            const ClassOfServiceRefs = Array.from(new Set(PricedFlightOffer[0].OfferPrice.map((OP) => OP.RequestedDate.Associations.map((AC) => {
                var _a;
                return (_a = AC.ApplicableFlight.FlightSegmentReference) === null || _a === void 0 ? void 0 : _a.map((Seg) => Seg.ClassOfService.refs);
            }))
                .flat(10)
                .filter((v) => v !== undefined)));
            const FareGroup = (_a = Data.DataLists.FareList) === null || _a === void 0 ? void 0 : _a.FareGroup.filter((FG) => ClassOfServiceRefs.includes(FG.ListKey)).map((FG) => ({
                ListKey: FG.ListKey,
                FareBasisCode: FG.FareBasisCode,
                refs: FG.refs,
                Fare: FG.Fare ? { FareCode: FG.Fare.FareCode } : undefined,
            }));
            const DataLists = { FareList: { FareGroup } };
            //=== Generate Metadata ===//
            const FareGroupRefs = FareGroup.map((FG) => FG.refs)
                .flat()
                .filter((ref) => ref !== undefined);
            const PriceMetadata = (_e = (_d = (_c = (_b = Data.Metadata) === null || _b === void 0 ? void 0 : _b.Other) === null || _c === void 0 ? void 0 : _c.OtherMetadata) === null || _d === void 0 ? void 0 : _d[0].PriceMetadatas) === null || _e === void 0 ? void 0 : _e.PriceMetadata.filter((PM) => FareGroupRefs.includes(PM.MetadataKey));
            const Metadata = (PriceMetadata === null || PriceMetadata === void 0 ? void 0 : PriceMetadata.length)
                ? {
                    Other: { OtherMetadata: [{ PriceMetadatas: { PriceMetadata } }] },
                }
                : undefined;
            //=== Generate Passengers (PARTIAL) ===//
            const Passenger = (_f = Data.DataLists.AnonymousTravelerList) === null || _f === void 0 ? void 0 : _f.AnonymousTraveler.map((AT) => ({
                ObjectKey: AT.ObjectKey,
                PTC: AT.PTC,
            }));
            const Passengers = { Passenger };
            const RQ = {
                Query: { OrderItems, DataLists, Metadata, Passengers },
            };
            return RQ;
        });
    }
    //calculate price from nanos
    calculatePriceFromNanos({ currencyCode, units, nanos, }) {
        // Parse units as number (or default to 0)
        const u = units ? Number(units) : 0;
        const n = nanos !== null && nanos !== void 0 ? nanos : 0;
        // Validate nanos range
        if (n < -999999999 || n > 999999999) {
            throw new Error("Nanos out of valid range (-999,999,999 to 999,999,999)");
        }
        // Enforce unit-nano sign consistency rules
        if (u > 0 && n < 0) {
            throw new Error("If units > 0, nanos must be >= 0");
        }
        if (u < 0 && n > 0) {
            throw new Error("If units < 0, nanos must be <= 0");
        }
        // Combine into a float
        const result = u + n / 1000000000;
        return result;
    }
    deepClone(obj) {
        return typeof structuredClone === "function"
            ? structuredClone(obj)
            : (0, lodash_1.cloneDeep)(obj);
    }
}
exports.VerteilFlightUtils = VerteilFlightUtils;
