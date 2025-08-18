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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const redis_1 = require("../../../app/redis");
const customError_1 = __importDefault(require("../../lib/customError"));
const commonFlightUtils_1 = __importDefault(require("../../lib/flightLib/commonFlightUtils"));
const verteilRequest_1 = __importDefault(require("../../lib/flightLib/verteilRequest"));
const constants_1 = require("../../miscellaneous/constants");
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
const verteilApiEndpoints_1 = __importDefault(require("../../miscellaneous/flightMiscellaneous/verteilApiEndpoints"));
const verteilFlightUtils_1 = require("../../lib/flightLib/verteilFlightUtils");
const commonFlightSupport_service_1 = require("./commonFlightSupport.service");
const commonFlightUtils_2 = __importDefault(require("../../lib/flightLib/commonFlightUtils"));
const lib_1 = __importDefault(require("../../lib/lib"));
class VerteilFlightService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.request = new verteilRequest_1.default();
        this.flightUtils = new commonFlightUtils_1.default();
        this.trx = trx;
        this.flightSupport = new commonFlightSupport_service_1.CommonFlightSupport(trx);
    }
    applyDecimal(amount, decimals = 0) {
        return amount / Math.pow(10, decimals);
    }
    // Flight Search (start)//
    flightSearchRequestFormatter(body, dealCodes) {
        const CTC = body.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin;
        let deal_code = undefined;
        if (dealCodes === null || dealCodes === void 0 ? void 0 : dealCodes.length) {
            deal_code = dealCodes.map((item) => item.deal_code).join(',');
        }
        return {
            Party: deal_code ? { Sender: { CorporateSender: { CorporateCode: deal_code } } } : undefined,
            Preference: {
                CabinPreferences: {
                    CabinType: [
                        {
                            PrefLevel: {
                                PrefLevelCode: 'Preferred',
                            },
                            Code: CTC === '4' ? 'F' : CTC === '3' ? 'C' : CTC === '2' ? 'W' : 'Y', // Economy-Y PremiumEconomy-W BusinessClass-C FirstClass-F
                        },
                    ],
                },
                FarePreferences: {
                    Types: {
                        Type: [
                            {
                                Code: 'PUBL',
                            },
                            {
                                Code: 'PVT',
                            },
                        ],
                    },
                },
            },
            ResponseParameters: {
                SortOrder: [
                    {
                        Order: 'ASCENDING',
                        Parameter: 'PRICE',
                    },
                ],
                ShopResultPreference: 'BEST',
                ResultsLimit: { value: 100 },
            },
            Travelers: {
                Traveler: body.PassengerTypeQuantity.flatMap((item) => Array.from({ length: item.Quantity }, () => item.Code === 'ADT'
                    ? { AnonymousTraveler: [{ PTC: { value: 'ADT' } }] }
                    : item.Code === 'INF'
                        ? { AnonymousTraveler: [{ PTC: { value: 'INF' } }] }
                        : {
                            AnonymousTraveler: [{ PTC: { value: 'CHD' }, Age: { Value: { value: 11 } } }],
                        })),
            },
            //   EnableGDS: false, // Can be removed or should be set as false always
            CoreQuery: {
                OriginDestinations: {
                    OriginDestination: body.OriginDestinationInformation.map((leg) => ({
                        Departure: {
                            AirportCode: {
                                value: leg.OriginLocation.LocationCode,
                            },
                            Date: leg.DepartureDateTime.split('T')[0],
                        },
                        Arrival: {
                            AirportCode: {
                                value: leg.DestinationLocation.LocationCode,
                            },
                        },
                        OriginDestinationKey: `LEG-${leg.RPH}`,
                    })),
                },
            },
        };
    }
    // Flight search service
    FlightSearchService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_block, reqBody, search_id, dynamic_fare_supplier_id, }) {
            var _b, _c, _d, _e;
            const route_type = this.flightSupport.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const AirlinesPrefModel = this.Model.AirlinesPreferenceModel(this.trx);
            const prefAirlinesQuery = {
                dynamic_fare_supplier_id,
                pref_type: 'PREFERRED',
                status: true,
            };
            if (route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC) {
                prefAirlinesQuery.domestic = true;
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.FROM_DAC) {
                prefAirlinesQuery.from_dac = true;
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.TO_DAC) {
                prefAirlinesQuery.to_dac = true;
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.SOTO) {
                prefAirlinesQuery.soto = true;
            }
            //preferred airlines
            const cappingAirlines = yield AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);
            const PreferredAirlines = cappingAirlines.map((elm) => elm.Code);
            let finalAirlineCodes = [];
            if ((_b = reqBody.airline_code) === null || _b === void 0 ? void 0 : _b.length) {
                const reqAirlineCodes = reqBody.airline_code.map((elm) => elm.Code);
                if (PreferredAirlines.length) {
                    // Take common values between preferred and requested airlines
                    finalAirlineCodes = reqAirlineCodes.filter((code) => PreferredAirlines.includes(code));
                    if (finalAirlineCodes.length === 0) {
                        return [];
                    }
                }
                else {
                    // If no preferred airlines, take all from request
                    finalAirlineCodes = reqAirlineCodes;
                }
            }
            else {
                if (PreferredAirlines.length) {
                    // No requested airlines, but preferred exists
                    finalAirlineCodes = PreferredAirlines;
                }
            }
            // Convert to comma-separated string
            const airlineCodesCsv = finalAirlineCodes.join(',');
            //deal code
            const dealCodes = yield this.Model.DealCodeModel(this.trx).getAll({
                api: flightConstants_1.VERTEIL_API,
                status: true,
            });
            const AirShoppingRQ = this.flightSearchRequestFormatter(reqBody, dealCodes.data.length ? dealCodes.data : undefined);
            // console.log('AirShoppingRQ', JSON.stringify(AirShoppingRQ, null, 2));
            const AirShoppingRS = yield this.request.postRequest(verteilApiEndpoints_1.default.FLIGHT_SEARCH_ENDPOINT, AirShoppingRQ, airlineCodesCsv ? { headers: { ThirdpartyId: airlineCodesCsv } } : undefined);
            // const AirShoppingRS = await this.request.postRequest<
            //     Interfaces.IVerteilFlightSearchRQ,
            //     Interfaces.IVerteilFlightSearchRS
            // >("AirShopping", AirShoppingRQ);
            if (!AirShoppingRS) {
                return [];
            }
            // console.log('AirShoppingRS', JSON.stringify(AirShoppingRS, null, 2));
            const hasAtLeastOneOffer = ((_e = (_d = (_c = AirShoppingRS.OffersGroup) === null || _c === void 0 ? void 0 : _c.AirlineOffers[0]) === null || _d === void 0 ? void 0 : _d.AirlineOffer) === null || _e === void 0 ? void 0 : _e.length) > 0;
            if (AirShoppingRS.Errors && !hasAtLeastOneOffer)
                return [];
            if (!hasAtLeastOneOffer) {
                return [];
            }
            const result = yield this.FlightSearchResFormatter({
                data: AirShoppingRS,
                reqBody: reqBody,
                booking_block,
                dynamic_fare_supplier_id,
                route_type,
            });
            {
                const flightPriceRQs = yield new verteilFlightUtils_1.VerteilFlightUtils().PrepareMetaDataForFlightPrice(reqBody, result, AirShoppingRS, AirShoppingRQ);
                (0, redis_1.setRedis)(`VerteilFlightPriceRQs-${search_id}`, flightPriceRQs, 900);
            }
            return result;
        });
    }
    FlightSearchResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, booking_block, data, reqBody, route_type, }) {
            var _b, _c;
            const commonModel = this.Model.commonModel(this.trx);
            const AirlinesPreferenceModel = this.Model.AirlinesPreferenceModel(this.trx);
            const api_currency = yield this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(flightConstants_1.VERTEIL_API, 'FLIGHT');
            // convert any Child aged value to CHD
            reqBody.PassengerTypeQuantity.forEach((PTQ) => {
                if (PTQ.Code.startsWith('C'))
                    PTQ.Code = 'CHD';
            });
            const leg_description = reqBody.OriginDestinationInformation.map((OrDeInfo) => {
                return {
                    departureDate: OrDeInfo.DepartureDateTime,
                    departureLocation: OrDeInfo.OriginLocation.LocationCode,
                    arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
                };
            });
            const getBlockedAirlinesPayload = {
                dynamic_fare_supplier_id,
                pref_type: 'BLOCKED',
                status: true,
            };
            if (route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC) {
                getBlockedAirlinesPayload.domestic = true;
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.FROM_DAC) {
                getBlockedAirlinesPayload.from_dac = true;
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.TO_DAC) {
                getBlockedAirlinesPayload.to_dac = true;
            }
            else {
                getBlockedAirlinesPayload.soto = true;
            }
            const blockedAirlines = yield AirlinesPreferenceModel.getAirlinePrefCodes(getBlockedAirlinesPayload);
            const FormattedResponseList = [];
            for (const Offer of data.OffersGroup.AirlineOffers[0].AirlineOffer) {
                try {
                    const airlineCode = Offer.OfferID.Owner;
                    if (blockedAirlines.find((ba) => ba.Code === airlineCode)) {
                        continue;
                    }
                    const airlineInfo = yield commonModel.getAirlines(airlineCode);
                    //=== Flights Construction ===//
                    const Associations = Offer.PricedOffer.Associations;
                    const FormattedFlights = yield Promise.all(Associations.map((Association) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const priceClassRef = Association.PriceClass.PriceClassReference;
                        const SegmentRefs = Association.ApplicableFlight.FlightSegmentReference;
                        //=== Options array construction ===//
                        const FormattedFlightOptions = yield Promise.all(SegmentRefs.map((segRef) => __awaiter(this, void 0, void 0, function* () {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                            const FlightSegment = data.DataLists.FlightSegmentList.FlightSegment.find((item) => item.SegmentKey === segRef.ref);
                            if (!FlightSegment)
                                throw new Error(`Fatal: Verteil API FlightSegment with key "${segRef.ref}" not found.`);
                            const dAirport = yield commonModel.getAirportDetails(FlightSegment.Departure.AirportCode.value);
                            const aAirport = yield commonModel.getAirportDetails(FlightSegment.Arrival.AirportCode.value);
                            const marketing_airline = yield commonModel.getAirlines(FlightSegment.MarketingCarrier.AirlineID.value);
                            const operating_airline = yield commonModel.getAirlines(((_b = (_a = FlightSegment.OperatingCarrier) === null || _a === void 0 ? void 0 : _a.AirlineID) === null || _b === void 0 ? void 0 : _b.value) || '');
                            const aircraft = yield commonModel.getAircraft(((_d = (_c = FlightSegment.Equipment) === null || _c === void 0 ? void 0 : _c.AircraftCode) === null || _d === void 0 ? void 0 : _d.value) || '');
                            const departure = {
                                airport_code: FlightSegment.Departure.AirportCode.value,
                                airport: dAirport.airport_name,
                                city: dAirport.city_name,
                                city_code: dAirport.city_code,
                                country: dAirport.country,
                                terminal: ((_e = FlightSegment.Departure.Terminal) === null || _e === void 0 ? void 0 : _e.Name) || '',
                                time: FlightSegment.Departure.Time +
                                    ':00' +
                                    `${dAirport.time_zone
                                        ? luxon_1.DateTime.now().setZone(dAirport.time_zone).toFormat('ZZ')
                                        : ''}`, // HH:MM -> HH:MM:00
                                date: FlightSegment.Departure.Date.slice(0, 10), // YYYY-MM-DDT00-00-00.000 -> YYYY-MM-DD
                            };
                            const arrival = {
                                date_adjustment: FlightSegment.Arrival.ChangeOfDay,
                                airport_code: FlightSegment.Arrival.AirportCode.value,
                                airport: aAirport.airport_name,
                                city: aAirport.city_name,
                                city_code: aAirport.city_code,
                                country: aAirport.country,
                                terminal: ((_f = FlightSegment.Arrival.Terminal) === null || _f === void 0 ? void 0 : _f.Name) || '',
                                time: FlightSegment.Arrival.Time +
                                    ':00' +
                                    `${aAirport.time_zone
                                        ? luxon_1.DateTime.now().setZone(aAirport.time_zone).toFormat('ZZ')
                                        : ''}`, // HH:MM -> HH:MM:00
                                date: FlightSegment.Arrival.Date.slice(0, 10), // YYYY-MM-DDT00-00-00.000 -> YYYY-MM-DD
                            };
                            const carrier = {
                                carrier_marketing_code: FlightSegment.MarketingCarrier.AirlineID.value,
                                carrier_marketing_airline: marketing_airline.name,
                                carrier_marketing_logo: marketing_airline.logo,
                                carrier_marketing_flight_number: FlightSegment.MarketingCarrier.FlightNumber.value,
                                carrier_operating_code: ((_h = (_g = FlightSegment.OperatingCarrier) === null || _g === void 0 ? void 0 : _g.AirlineID) === null || _h === void 0 ? void 0 : _h.value) || '',
                                carrier_operating_airline: operating_airline.name,
                                carrier_operating_logo: operating_airline.logo,
                                carrier_operating_flight_number: '',
                                carrier_aircraft_code: aircraft.code,
                                carrier_aircraft_name: aircraft.name,
                            };
                            let elapsed_time;
                            {
                                const SegmentDuration = (_j = FlightSegment.FlightDetail) === null || _j === void 0 ? void 0 : _j.FlightDuration.Value;
                                if (SegmentDuration) {
                                    elapsed_time = luxon_1.Duration.fromISO(SegmentDuration).as('minutes');
                                }
                                else {
                                    const dDt = luxon_1.DateTime.fromISO(departure.date + 'T' + departure.time);
                                    const aDt = luxon_1.DateTime.fromISO(arrival.date + 'T' + arrival.time);
                                    elapsed_time = aDt.diff(dDt, 'minutes').minutes;
                                }
                            }
                            const FormattedFlightOption = {
                                id: segRef.ref,
                                elapsedTime: elapsed_time,
                                departure,
                                arrival,
                                carrier,
                            };
                            return FormattedFlightOption;
                        })));
                        const targetSegmentRefs = SegmentRefs.map((seg) => seg.ref)
                            .sort()
                            .join(',');
                        const FLightInfo = (_a = data.DataLists.FlightList) === null || _a === void 0 ? void 0 : _a.Flight.find((item) => {
                            var _a, _b;
                            const flightKeyMatch = item.FlightKey === Association.ApplicableFlight.FlightReferences.value[0];
                            const segmentValues = (_b = (_a = item.SegmentReferences) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : [];
                            const segmentMatch = segmentValues.length === SegmentRefs.length &&
                                segmentValues.sort().join(',') === targetSegmentRefs;
                            return flightKeyMatch && segmentMatch;
                        });
                        if (!FLightInfo)
                            throw new Error(`Fatal: Verteil API FLightInfo with key "${Association.ApplicableFlight.FlightReferences.value[0]}" not found.`);
                        let flightElapsedTime = undefined;
                        if (FLightInfo === null || FLightInfo === void 0 ? void 0 : FLightInfo.Journey) {
                            const FlightDuration = FLightInfo.Journey.Time;
                            flightElapsedTime = luxon_1.Duration.fromISO(FlightDuration).as('minutes');
                        }
                        // const PriceClassInfo =
                        //     data.DataLists.PriceClassList?.PriceClass.find(
                        //         (PC) => PC.ObjectKey === priceClassRef
                        //     );
                        const FormattedFlight = {
                            id: FLightInfo === null || FLightInfo === void 0 ? void 0 : FLightInfo.FlightKey,
                            elapsed_time: flightElapsedTime,
                            stoppage: FormattedFlightOptions.length - 1,
                            // price_class_code: PriceClassInfo?.Code,
                            // price_class_name: PriceClassInfo?.Name,
                            layover_time: new commonFlightUtils_1.default().getNewLayoverTime(FormattedFlightOptions),
                            options: FormattedFlightOptions,
                        };
                        return FormattedFlight;
                    })));
                    //=== Availability Construction ===//
                    const FormattedAvailability = Associations.map(
                    // Flight LEG
                    (Association, AssociationIndex) => {
                        const originDestRef = Association.ApplicableFlight.OriginDestinationReferences[0];
                        const OriginDestination = data.DataLists.OriginDestinationList.OriginDestination.find((od) => od.OriginDestinationKey === originDestRef);
                        if (!OriginDestination)
                            throw new Error(`Fatal: Verteil API OriginDestination with key "${originDestRef}" not found.`);
                        const from_airport = OriginDestination.DepartureCode.value;
                        const to_airport = OriginDestination.ArrivalCode.value;
                        const SegmentRefs = Association.ApplicableFlight.FlightSegmentReference; // Segments for this LEG
                        const FormattedSegments = SegmentRefs.map(
                        // Single Segment
                        (Segment, SegmentIndex) => {
                            // Passenger Types for this Segment
                            const FormattedPassengers = Offer.PricedOffer.OfferPrice.map(
                            // Single Passenger Type
                            (OfferPrice) => {
                                var _a, _b, _c, _d, _e, _f;
                                const travelerRef = OfferPrice.RequestedDate.Associations[0].AssociatedTraveler
                                    .TravelerReferences[0];
                                const TravelerInfo = (_a = data.DataLists.AnonymousTravelerList) === null || _a === void 0 ? void 0 : _a.AnonymousTraveler.find((tr) => tr.ObjectKey === travelerRef);
                                if (!TravelerInfo)
                                    throw new Error(`Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`);
                                let baggage_count = null;
                                let baggage_unit = null;
                                const OfferPriceSegment = (_b = OfferPrice.RequestedDate.Associations[AssociationIndex]) === null || _b === void 0 ? void 0 : _b.ApplicableFlight.FlightSegmentReference[SegmentIndex];
                                if (OfferPriceSegment && OfferPriceSegment.BagDetailAssociation) {
                                    const CarryOnReferences = // this is hand baggage
                                     OfferPriceSegment.BagDetailAssociation.CarryOnReferences;
                                    const CheckedBagReferences = OfferPriceSegment.BagDetailAssociation.CheckedBagReferences;
                                    if (CheckedBagReferences) {
                                        const filteredBagAllowance = (_c = data.DataLists.CheckedBagAllowanceList) === null || _c === void 0 ? void 0 : _c.CheckedBagAllowance.filter((item) => CheckedBagReferences.includes(item.ListKey));
                                        if (filteredBagAllowance) {
                                            const firstBaggage = filteredBagAllowance[0];
                                            if (firstBaggage &&
                                                firstBaggage.PieceAllowance &&
                                                firstBaggage.PieceAllowance.length) {
                                                if (firstBaggage.WeightAllowance) {
                                                    const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                                                    baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                                                    baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                                                }
                                                else {
                                                    baggage_unit = 'pieces';
                                                    baggage_count = firstBaggage.PieceAllowance[0].TotalQuantity;
                                                }
                                            }
                                            else {
                                                if (firstBaggage.WeightAllowance) {
                                                    const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                                                    baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                                                    baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                                                }
                                                else {
                                                    baggage_unit = 'pieces';
                                                    baggage_count = 0;
                                                }
                                            }
                                        }
                                    }
                                }
                                const FormattedPassenger = {
                                    type: TravelerInfo.PTC.value,
                                    count: ((_d = reqBody.PassengerTypeQuantity.find((PTQ) => PTQ.Code === TravelerInfo.PTC.value)) === null || _d === void 0 ? void 0 : _d.Quantity) || 0,
                                    cabin_code: Segment.ClassOfService.MarketingName.CabinDesignator,
                                    cabin_type: Segment.ClassOfService.MarketingName.value,
                                    booking_code: (_e = Segment.ClassOfService.Code) === null || _e === void 0 ? void 0 : _e.value,
                                    available_seat: (_f = Segment.ClassOfService.Code) === null || _f === void 0 ? void 0 : _f.SeatsLeft,
                                    meal_code: undefined,
                                    meal_type: undefined,
                                    available_break: undefined,
                                    available_fare_break: undefined,
                                    baggage_info: `${baggage_count} ${baggage_unit}`,
                                };
                                return FormattedPassenger;
                            });
                            const FormattedSegment = {
                                name: `Segment-${SegmentIndex + 1}`,
                                passenger: FormattedPassengers,
                            };
                            return FormattedSegment;
                        });
                        const Availability = {
                            from_airport,
                            to_airport,
                            segments: FormattedSegments,
                        };
                        return Availability;
                    });
                    //=== Passengers Fare Construction ==//
                    let totalBaseFare = 0;
                    let totalTax = 0;
                    let totalDiscount = 0;
                    let pax_count = 0;
                    let totalConFee = 0;
                    let total_amount = 0;
                    let tax_fare = [];
                    reqBody.PassengerTypeQuantity.forEach((reqPax) => {
                        pax_count += reqPax.Quantity;
                    });
                    const FormattedPassengers = Offer.PricedOffer.OfferPrice.map((OfferPrice) => {
                        var _a, _b, _c, _d, _e, _f, _g;
                        const travelerRef = OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences[0];
                        const TravelerInfo = (_a = data.DataLists.AnonymousTravelerList) === null || _a === void 0 ? void 0 : _a.AnonymousTraveler.find((tr) => tr.ObjectKey === travelerRef);
                        if (!TravelerInfo)
                            throw new Error(`Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`);
                        const paxCount = reqBody.PassengerTypeQuantity.filter((PTQ) => PTQ.Code[0] === TravelerInfo.PTC.value[0]).reduce((sum, PTQ) => sum + PTQ.Quantity, 0);
                        const PriceDetail = OfferPrice.RequestedDate.PriceDetail;
                        const baseFare = PriceDetail.BaseAmount.value;
                        const tax = ((_b = PriceDetail.Taxes) === null || _b === void 0 ? void 0 : _b.Total.value) || 0;
                        const surcharge = ((_c = PriceDetail.Surcharges) === null || _c === void 0 ? void 0 : _c.Surcharge.reduce((sum, item) => {
                            var _a, _b;
                            return sum + ((_b = (_a = item.Total) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0);
                        }, 0)) || 0;
                        const discount = ((_d = PriceDetail.Discount) === null || _d === void 0 ? void 0 : _d.reduce((sum, item) => {
                            var _a, _b;
                            return sum + ((_b = (_a = item.DiscountAmount) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0);
                        }, 0)) || 0;
                        totalBaseFare += baseFare * paxCount * api_currency;
                        totalTax += tax * paxCount * api_currency;
                        totalConFee += surcharge * paxCount * api_currency;
                        totalTax += totalConFee * api_currency;
                        totalDiscount += discount * paxCount * api_currency;
                        total_amount +=
                            PriceDetail.TotalAmount.SimpleCurrencyPrice.value * paxCount * api_currency;
                        const taxBreakdown = ((_f = (_e = PriceDetail.Taxes) === null || _e === void 0 ? void 0 : _e.Breakdown) === null || _f === void 0 ? void 0 : _f.Tax) || [];
                        const taxes = taxBreakdown.map(tax => {
                            var _a;
                            return ({
                                code: tax.TaxCode,
                                amount: Number((_a = tax.Amount) === null || _a === void 0 ? void 0 : _a.value) || 0
                            });
                        });
                        tax_fare.push(taxes);
                        const FormattedPassenger = {
                            type: TravelerInfo === null || TravelerInfo === void 0 ? void 0 : TravelerInfo.PTC.value,
                            number: paxCount,
                            fare: {
                                base_fare: Number(PriceDetail.BaseAmount.value) * api_currency,
                                tax: Number(((_g = PriceDetail.Taxes) === null || _g === void 0 ? void 0 : _g.Total.value) || 0) * api_currency,
                                total_fare: Number(PriceDetail.TotalAmount.SimpleCurrencyPrice.value) * api_currency,
                            },
                        };
                        return FormattedPassenger;
                    });
                    const ait = Math.round(((Number(totalBaseFare) + Number(totalTax)) / 100) * 0.3);
                    const new_fare = {
                        base_fare: totalBaseFare,
                        total_tax: totalTax,
                        ait: ait,
                        discount: totalDiscount,
                        payable: 0,
                        vendor_price: {
                            base_fare: totalBaseFare,
                            tax: totalTax,
                            charge: totalConFee,
                            discount: totalDiscount,
                            gross_fare: total_amount + totalDiscount,
                            net_fare: total_amount,
                        },
                    };
                    let total_segments = 0;
                    FormattedFlights.map((elm) => {
                        elm.options.map((elm2) => {
                            total_segments++;
                        });
                    });
                    //calculate tax fare
                    let { tax_markup, tax_commission } = yield this.flightSupport.calculateFlightTaxMarkup({
                        dynamic_fare_supplier_id,
                        tax: tax_fare,
                        route_type,
                        airline: airlineCode,
                    });
                    tax_commission = tax_commission * api_currency;
                    tax_markup = tax_markup * api_currency;
                    const { markup, commission, pax_markup } = yield this.flightSupport.calculateFlightMarkup({
                        dynamic_fare_supplier_id,
                        airline: airlineCode,
                        flight_class: this.flightUtils.getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin),
                        base_fare: new_fare.base_fare,
                        total_segments,
                        route_type,
                    });
                    const total_pax_markup = pax_count * pax_markup;
                    new_fare.base_fare += markup + total_pax_markup;
                    new_fare.base_fare += tax_markup;
                    new_fare.discount += commission;
                    new_fare.discount += tax_commission;
                    new_fare.payable = Number((Number(new_fare.base_fare) +
                        Number(new_fare.total_tax) +
                        Number(new_fare.ait) -
                        Number(new_fare.discount)).toFixed(2));
                    const newFormattedPax = FormattedPassengers.map((newPax) => {
                        const per_pax_markup = ((markup + tax_markup) / pax_count) * newPax.number + pax_markup * newPax.number;
                        return {
                            type: newPax.type,
                            number: newPax.number,
                            fare: {
                                base_fare: newPax.fare.base_fare + per_pax_markup,
                                tax: newPax.fare.tax,
                                total_fare: newPax.fare.total_fare + per_pax_markup,
                            },
                        };
                    });
                    // ticket last date
                    const [ticket_last_date, ticket_last_time] = new commonFlightUtils_1.default().utcToLocalDateTime(`${(_b = Offer.TimeLimits) === null || _b === void 0 ? void 0 : _b.OfferExpiration.DateTime}Z`);
                    // refundable or not
                    let refundable;
                    {
                        const PenaltyRefs = [
                            ...new Set(Offer.PricedOffer.OfferPrice.map((OP) => OP.FareDetail.FareComponent.map((FC) => { var _a; return (_a = FC.FareRules) === null || _a === void 0 ? void 0 : _a.Penalty.refs; }))
                                .flat(10)
                                .filter((PR) => PR !== undefined)),
                        ];
                        // const PenaltyRefs =
                        //   Offer.PricedOffer.OfferPrice[0].FareDetail.FareComponent[0]
                        //     .FareRules?.Penalty.refs;
                        const Penalty = (_c = data.DataLists.PenaltyList) === null || _c === void 0 ? void 0 : _c.Penalty;
                        if ((PenaltyRefs === null || PenaltyRefs === void 0 ? void 0 : PenaltyRefs.length) && Penalty) {
                            const matched = Penalty.filter((item) => PenaltyRefs.includes(item.ObjectKey) && item.RefundableInd !== undefined);
                            if (matched.length > 0) {
                                refundable = matched.every((p) => p.RefundableInd === true);
                            }
                            else {
                                refundable = false;
                            }
                        }
                    }
                    let partial_payment = {
                        partial_payment: false,
                        payment_percentage: 100,
                        travel_date_from_now: 0,
                    };
                    if (route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC) {
                        //domestic
                        partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                            flight_api_name: flightConstants_1.VERTEIL_API,
                            airline: airlineCode,
                            refundable: Boolean(refundable),
                            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                            domestic: true,
                        });
                    }
                    else if (route_type === flightConstants_1.ROUTE_TYPE.FROM_DAC) {
                        //from dac
                        partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                            flight_api_name: flightConstants_1.VERTEIL_API,
                            airline: airlineCode,
                            from_dac: true,
                            refundable: Boolean(refundable),
                            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        });
                    }
                    else if (route_type === flightConstants_1.ROUTE_TYPE.TO_DAC) {
                        //to dac
                        partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                            flight_api_name: flightConstants_1.VERTEIL_API,
                            airline: airlineCode,
                            to_dac: true,
                            refundable: Boolean(refundable),
                            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        });
                    }
                    else {
                        //soto
                        partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                            flight_api_name: flightConstants_1.VERTEIL_API,
                            airline: airlineCode,
                            refundable: Boolean(refundable),
                            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                            soto: true,
                        });
                    }
                    // Policies
                    // const fare_rules = await this.ConstructDynamicFareRules({
                    //   Offer,
                    //   DataLists: data.DataLists,
                    //   MetaData: data.Metadata,
                    // });
                    const FormattedResponse = {
                        journey_type: reqBody.JourneyType,
                        flight_id: crypto.randomUUID(),
                        api_search_id: Offer.OfferID.value,
                        booking_block,
                        api: flightConstants_1.VERTEIL_API,
                        partial_payment,
                        price_changed: false,
                        direct_ticket_issue: false,
                        refundable: Boolean(refundable),
                        domestic_flight: route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC,
                        carrier_code: airlineCode,
                        carrier_name: airlineInfo.name,
                        carrier_logo: airlineInfo.logo,
                        ticket_last_date,
                        ticket_last_time,
                        fare: new_fare,
                        leg_description,
                        flights: FormattedFlights,
                        passengers: newFormattedPax,
                        availability: FormattedAvailability,
                        // dynamic_fare_rules: fare_rules,
                    };
                    FormattedResponseList.push(FormattedResponse);
                }
                catch (error) {
                    console.warn('An error occurred while formatting a Verteil Offer. This offer will be omitted from final response. ErrorMessage: ' +
                        error.message);
                    continue;
                }
            }
            return FormattedResponseList;
        });
    }
    ConstructDynamicFareRules(_a) {
        return __awaiter(this, arguments, void 0, function* ({ Offer, DataLists, MetaData, }) {
            const policyObject = Offer.PricedOffer.OfferPrice.map((OfferPrice) => {
                var _a, _b;
                const paxRef = OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences[0];
                const PaxTypeCode = (_b = (_a = DataLists.AnonymousTravelerList) === null || _a === void 0 ? void 0 : _a.AnonymousTraveler.find((AT) => AT.ObjectKey === paxRef)) === null || _b === void 0 ? void 0 : _b.PTC.value;
                const OD = Offer.PricedOffer.Associations.map((Association) => {
                    var _a, _b;
                    let route = '';
                    const ODRef = (_a = Association.ApplicableFlight.OriginDestinationReferences) === null || _a === void 0 ? void 0 : _a[0];
                    const ODInfo = DataLists.OriginDestinationList.OriginDestination.find((od) => od.OriginDestinationKey === ODRef);
                    if (ODInfo)
                        route = ODInfo.DepartureCode.value + '-' + ODInfo.ArrivalCode.value;
                    const ODSegmentsRef = Association.ApplicableFlight.FlightSegmentReference.map((Seg) => Seg.ref);
                    const ODPenaltyRefs = OfferPrice.FareDetail.FareComponent.filter((FC) => ODSegmentsRef.includes(FC.SegmentReference.value))
                        .map((FC) => { var _a; return (_a = FC.FareRules) === null || _a === void 0 ? void 0 : _a.Penalty.refs; })
                        .filter((value) => value !== undefined)
                        .flat(2);
                    const ODPenalties = ((_b = DataLists.PenaltyList) === null || _b === void 0 ? void 0 : _b.Penalty.filter((P) => ODPenaltyRefs.includes(P.ObjectKey))) || [];
                    const ChangeFeePenalties = ODPenalties.filter((ODP) => ODP.ChangeFeeInd !== undefined);
                    const CancelFeePenalties = ODPenalties.filter((ODP) => ODP.CancelFeeInd !== undefined);
                    let changeAllowed = true;
                    let noChangeFee = true;
                    let changeFeeCurrencyCode = '';
                    const changeFeeMinValueList = [];
                    const changeFeeMaxValueList = [];
                    let noCancelFee = true;
                    let cancelFeeCurrencyCode = '';
                    const cancelFeeMinValueList = [];
                    const cancelFeeMaxValueList = [];
                    ChangeFeePenalties.forEach((CFP) => {
                        var _a, _b, _c, _d, _e;
                        if (CFP.ChangeAllowedInd !== true)
                            changeAllowed = false;
                        if (CFP.ChangeFeeInd !== false)
                            noChangeFee = false;
                        const ChangeDetails = CFP.Details.Detail.filter((Detail) => Detail.Type === 'Change');
                        for (const detail of ChangeDetails) {
                            const Amounts = (_a = detail.Amounts) === null || _a === void 0 ? void 0 : _a.Amount;
                            if (Amounts) {
                                for (const Amount of Amounts) {
                                    if (Amount.CurrencyAmountValue == undefined)
                                        continue;
                                    changeFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                                    const decimalKey = Offer.OfferID.Owner + '-' + changeFeeCurrencyCode;
                                    const decimal = (_e = (_d = (_c = (_b = MetaData.Other.OtherMetadata) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.CurrencyMetadatas) === null || _d === void 0 ? void 0 : _d.CurrencyMetadata.find((CM) => CM.MetadataKey === decimalKey)) === null || _e === void 0 ? void 0 : _e.Decimals;
                                    if (Amount.AmountApplication === 'MIN')
                                        changeFeeMinValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                    else if (Amount.AmountApplication === 'MAX')
                                        changeFeeMaxValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                }
                            }
                        }
                    });
                    CancelFeePenalties.forEach((CFP) => {
                        var _a, _b, _c, _d, _e;
                        if (CFP.CancelFeeInd !== false)
                            noCancelFee = false;
                        const ChangeDetails = CFP.Details.Detail.filter((Detail) => Detail.Type === 'Cancel');
                        for (const detail of ChangeDetails) {
                            const Amounts = (_a = detail.Amounts) === null || _a === void 0 ? void 0 : _a.Amount;
                            if (Amounts) {
                                for (const Amount of Amounts) {
                                    if (Amount.CurrencyAmountValue == undefined)
                                        continue;
                                    cancelFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                                    const decimalKey = Offer.OfferID.Owner + '-' + cancelFeeCurrencyCode;
                                    const decimal = (_e = (_d = (_c = (_b = MetaData.Other.OtherMetadata) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.CurrencyMetadatas) === null || _d === void 0 ? void 0 : _d.CurrencyMetadata.find((CM) => CM.MetadataKey === decimalKey)) === null || _e === void 0 ? void 0 : _e.Decimals;
                                    if (Amount.AmountApplication === 'MIN')
                                        cancelFeeMinValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                    else if (Amount.AmountApplication === 'MAX')
                                        cancelFeeMaxValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                }
                            }
                        }
                    });
                    const minimumChangePenalty = Math.min(...changeFeeMinValueList);
                    const maximumChangePenalty = Math.max(...changeFeeMaxValueList);
                    const minimumCancelPenalty = Math.min(...cancelFeeMinValueList);
                    const maximumCancelPenalty = Math.max(...cancelFeeMaxValueList);
                    return {
                        route,
                        changeAllowed,
                        noChangeFee,
                        noCancelFee,
                        changeFeeCurrencyCode,
                        minimumChangePenalty,
                        maximumChangePenalty,
                        cancelFeeCurrencyCode,
                        minimumCancelPenalty,
                        maximumCancelPenalty,
                    };
                });
                return {
                    PTC: PaxTypeCode,
                    OD,
                };
            });
            const safeValue = (val) => {
                if (val === null || val === undefined || !isFinite(val))
                    return '-';
                return val;
            };
            let html = `
    <style>
      table.compact-table {
        font-size: 12px;
        border-collapse: collapse;
        width: 100%;
      }
      table.compact-table th, table.compact-table td {
        border: 1px solid #ccc;
        padding: 4px 6px;
        text-align: center;
      }
      table.compact-table th {
        background-color: #f2f2f2;
        white-space: nowrap;
      }
    </style>

    <table class="compact-table">
      <caption>Fare Rules (Change/Cancel Fees)</caption>
      <thead>
        <tr>
          <th>PTC</th>
          <th>Route</th>
          <th title="Change Allowed Or Not?">Change Allowed</th>
          <th title="Change Fee Currency">Change Cur</th>
          <th title="Minimum Change Penalty">Min CP</th>
          <th title="Maximum Change Penalty">Max CP</th>
          <th title="Cancel Fee Currency">Cancel Cur</th>
          <th title="Minimum Cancel Penalty">Min XP</th>
          <th title="Maximum Cancel Penalty">Max XP</th>
        </tr>
      </thead>
      <tbody>
  `;
            for (const ptc of policyObject) {
                for (const od of ptc.OD) {
                    html += `
        <tr>
          <td>${ptc.PTC}</td>
          <td>${od.route}</td>
          <td>${od.changeAllowed ? 'Yes' : 'No'}</td>
          <td>${od.changeFeeCurrencyCode || '-'}</td>
          <td>${safeValue(od.minimumChangePenalty)}</td>
          <td>${safeValue(od.maximumChangePenalty)}</td>
          <td>${od.cancelFeeCurrencyCode || '-'}</td>
          <td>${safeValue(od.minimumCancelPenalty)}</td>
          <td>${safeValue(od.maximumCancelPenalty)}</td>
        </tr>
      `;
                }
            }
            html += `
      </tbody>
    </table>
  `;
            return lib_1.default.minifyHTML(html);
        });
    }
    // Flight Search (end)//
    // Flight Revalidate (start)//
    FlightRevalidateService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ search_id, reqBody, oldData, dynamic_fare_supplier_id, }) {
            var _b;
            let FlightPriceRQ;
            FlightPriceRQ = yield (0, redis_1.getRedis)(`VerteilFlightPriceRQ-${search_id}-${oldData.flight_id}`);
            if (FlightPriceRQ === null) {
                const flightPriceRQs = yield (0, redis_1.getRedis)(`VerteilFlightPriceRQs-${search_id}`);
                `VerteilFlightPriceRQs`;
                FlightPriceRQ =
                    ((_b = flightPriceRQs === null || flightPriceRQs === void 0 ? void 0 : flightPriceRQs.find((RQs) => RQs.flight_id === oldData.flight_id)) === null || _b === void 0 ? void 0 : _b.flightPriceRQ) || null;
            }
            if (!FlightPriceRQ)
                throw new Error(this.ResMsg.HTTP_NOT_FOUND);
            const FlightPriceRS = yield this.request.postRequest(verteilApiEndpoints_1.default.FLIGHT_REVALIDATE_ENDPOINT, FlightPriceRQ, { headers: { ThirdpartyId: FlightPriceRQ.ShoppingResponseID.Owner } });
            if (!FlightPriceRS)
                throw new customError_1.default('This flight is not available ', 404);
            if (FlightPriceRS.Errors)
                throw new customError_1.default('This flight is not available ', 404);
            const route_type = this.flightSupport.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const newData = yield this.FlightRevalidateResFormatter({
                reqBody,
                oldData,
                response: FlightPriceRS,
                dynamic_fare_supplier_id,
                route_type,
            });
            // Post Revalidate Works
            {
                // 1. Prepare metadata for next revalidate request
                const FlightPriceRQ = yield new verteilFlightUtils_1.VerteilFlightUtils().PrepareMetaDataFlightPricePlus(oldData, reqBody, FlightPriceRS);
                (0, redis_1.setRedis)(`VerteilFlightPriceRQ-${search_id}-${newData.flight_id}`, FlightPriceRQ.flightPriceRQ, 900);
                // 2. Prepare metadata for flight booking request
                const OrderCreateRQ = yield new verteilFlightUtils_1.VerteilFlightUtils().PrepareMetaDataForOrderCreate(FlightPriceRS);
                (0, redis_1.setRedis)(`VerteilOrderCreateRQ-${search_id}-${newData.flight_id}`, OrderCreateRQ, 900);
                (0, redis_1.setRedis)(`FlightRevalidateRS-${search_id}-${newData.flight_id}`, newData, 900);
            }
            return [newData];
        });
    }
    FlightRevalidateResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ reqBody, oldData, dynamic_fare_supplier_id, response, route_type, }) {
            var _b;
            const api_currency = yield this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(flightConstants_1.VERTEIL_API, 'FLIGHT');
            const newData = JSON.parse(JSON.stringify(oldData));
            const PricedFlightOffer = response.PricedFlightOffers.PricedFlightOffer;
            const DataLists = response.DataLists;
            //=== Availability Check ===//
            {
                const Associations = PricedFlightOffer[0].OfferPrice[0].RequestedDate.Associations;
                const FormattedAvailability = Associations.map(
                // Flight LEG
                (Association, AssociationIndex) => {
                    var _a;
                    const originDestRef = (_a = Association.ApplicableFlight.OriginDestinationReferences) === null || _a === void 0 ? void 0 : _a[0];
                    const OriginDestination = response.DataLists.OriginDestinationList.OriginDestination.find((od) => od.OriginDestinationKey === originDestRef);
                    if (!OriginDestination)
                        throw new Error(`Fatal: Verteil API OriginDestination with key "${originDestRef}" not found.`);
                    const from_airport = OriginDestination.DepartureCode.value;
                    const to_airport = OriginDestination.ArrivalCode.value;
                    const SegmentRefs = Association.ApplicableFlight.FlightSegmentReference; // Segments for this LEG
                    if (!SegmentRefs)
                        throw new Error(`Fatal: Verteil API SegmentRefs Segment not found.`);
                    const FormattedSegments = SegmentRefs.map(
                    // Single Segment
                    (Segment, SegmentIndex) => {
                        // Passenger Types for this Segment
                        const FormattedPassengers = PricedFlightOffer[0].OfferPrice.map(
                        // Single Passenger Type
                        (OfferPrice) => {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                            const travelerRef = OfferPrice.RequestedDate.Associations[0].AssociatedTraveler
                                .TravelerReferences[0];
                            const TravelerInfo = (_a = DataLists.AnonymousTravelerList) === null || _a === void 0 ? void 0 : _a.AnonymousTraveler.find((tr) => tr.ObjectKey === travelerRef);
                            if (!TravelerInfo)
                                throw new Error(`Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`);
                            let baggage_count = null;
                            let baggage_unit = null;
                            const OfferPriceSegment = (_b = OfferPrice.RequestedDate.Associations[AssociationIndex]) === null || _b === void 0 ? void 0 : _b.ApplicableFlight.FlightSegmentReference[SegmentIndex];
                            if (OfferPriceSegment && OfferPriceSegment.BagDetailAssociation) {
                                const CheckedBagReferences = OfferPriceSegment.BagDetailAssociation.CheckedBagReferences;
                                if (CheckedBagReferences) {
                                    const filteredBagAllowance = (_c = DataLists.CheckedBagAllowanceList) === null || _c === void 0 ? void 0 : _c.CheckedBagAllowance.filter((item) => CheckedBagReferences.includes(item.ListKey));
                                    if (filteredBagAllowance) {
                                        const firstBaggage = filteredBagAllowance[0];
                                        if (firstBaggage &&
                                            firstBaggage.PieceAllowance &&
                                            firstBaggage.PieceAllowance.length) {
                                            if (firstBaggage.WeightAllowance) {
                                                const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                                                baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                                                baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                                            }
                                            else {
                                                baggage_unit = 'pieces';
                                                baggage_count = firstBaggage.PieceAllowance[0].TotalQuantity;
                                            }
                                        }
                                        else {
                                            if (firstBaggage.WeightAllowance) {
                                                const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                                                baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                                                baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                                            }
                                            else {
                                                baggage_unit = 'pieces';
                                                baggage_count = 0;
                                            }
                                        }
                                    }
                                }
                            }
                            const FormattedPassenger = {
                                type: TravelerInfo.PTC.value,
                                count: ((_d = reqBody.PassengerTypeQuantity.find((PTQ) => PTQ.Code === TravelerInfo.PTC.value)) === null || _d === void 0 ? void 0 : _d.Quantity) || 0,
                                cabin_code: (_e = OfferPriceSegment.ClassOfService.MarketingName) === null || _e === void 0 ? void 0 : _e.CabinDesignator,
                                cabin_type: (_f = OfferPriceSegment.ClassOfService.MarketingName) === null || _f === void 0 ? void 0 : _f.value,
                                booking_code: (_g = OfferPriceSegment.ClassOfService.Code) === null || _g === void 0 ? void 0 : _g.value,
                                available_seat: (_j = (_h = Association.AssociatedService) === null || _h === void 0 ? void 0 : _h.SeatAssignment) === null || _j === void 0 ? void 0 : _j.length,
                                meal_code: undefined,
                                meal_type: undefined,
                                available_break: undefined,
                                available_fare_break: undefined,
                                baggage_info: `${baggage_count} ${baggage_unit}`,
                            };
                            return FormattedPassenger;
                        });
                        const FormattedSegment = {
                            name: `Segment-${SegmentIndex + 1}`,
                            passenger: FormattedPassengers,
                        };
                        return FormattedSegment;
                    });
                    const Availability = {
                        from_airport,
                        to_airport,
                        segments: FormattedSegments,
                    };
                    return Availability;
                });
                newData.availability = FormattedAvailability;
            }
            //=== Passengers & Fare Check ==//
            {
                let totalBaseFare = 0;
                let totalTax = 0;
                let totalConFee = 0;
                let totalDiscount = 0;
                let total_amount = 0;
                let totalProviderTotal = 0;
                let pax_count = 0;
                let tax_fare = [];
                reqBody.PassengerTypeQuantity.forEach((reqPax) => {
                    pax_count += reqPax.Quantity;
                });
                const FormattedPassengers = PricedFlightOffer[0].OfferPrice.map((OfferPrice) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const travelerRef = OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences[0];
                    const TravelerInfo = (_a = response.DataLists.AnonymousTravelerList) === null || _a === void 0 ? void 0 : _a.AnonymousTraveler.find((tr) => tr.ObjectKey === travelerRef);
                    if (!TravelerInfo)
                        throw new Error(`Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`);
                    const paxCount = OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences.length;
                    const PriceDetail = OfferPrice.RequestedDate.PriceDetail;
                    const baseFare = PriceDetail.BaseAmount.value;
                    const tax = ((_b = PriceDetail.Taxes) === null || _b === void 0 ? void 0 : _b.Total.value) || 0;
                    const surcharge = ((_c = PriceDetail.Surcharges) === null || _c === void 0 ? void 0 : _c.Surcharge.reduce((sum, item) => {
                        var _a, _b;
                        return sum + ((_b = (_a = item.Total) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0);
                    }, 0)) || 0;
                    const discount = ((_d = PriceDetail.Discount) === null || _d === void 0 ? void 0 : _d.reduce((sum, item) => {
                        var _a, _b;
                        return sum + ((_b = (_a = item.DiscountAmount) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0);
                    }, 0)) || 0;
                    totalBaseFare += baseFare * paxCount * api_currency;
                    totalTax += tax * paxCount * api_currency;
                    totalConFee += surcharge * paxCount * api_currency;
                    totalTax += totalConFee;
                    totalDiscount += discount * paxCount * api_currency;
                    total_amount += PriceDetail.TotalAmount.SimpleCurrencyPrice.value * paxCount;
                    const taxBreakdown = ((_f = (_e = PriceDetail.Taxes) === null || _e === void 0 ? void 0 : _e.Breakdown) === null || _f === void 0 ? void 0 : _f.Tax) || [];
                    const taxes = taxBreakdown.map(tax => {
                        var _a;
                        return ({
                            code: tax.TaxCode,
                            amount: Number((_a = tax.Amount) === null || _a === void 0 ? void 0 : _a.value) || 0
                        });
                    });
                    tax_fare.push(taxes);
                    const FormattedPassenger = {
                        type: TravelerInfo === null || TravelerInfo === void 0 ? void 0 : TravelerInfo.PTC.value,
                        number: paxCount,
                        fare: {
                            total_fare: Number(PriceDetail.TotalAmount.SimpleCurrencyPrice.value) * api_currency,
                            tax: Number(((_g = PriceDetail.Taxes) === null || _g === void 0 ? void 0 : _g.Total.value) || 0) * api_currency,
                            base_fare: Number(PriceDetail.BaseAmount.value) * api_currency,
                        },
                    };
                    return FormattedPassenger;
                });
                const vendor_price = {
                    base_fare: totalBaseFare,
                    tax: totalTax,
                    charge: totalConFee,
                    discount: totalDiscount,
                    gross_fare: total_amount + totalDiscount,
                    net_fare: total_amount,
                };
                const ait = Math.round(((Number(totalBaseFare) + Number(totalTax)) / 100) * 0.3);
                const new_fare = {
                    base_fare: totalBaseFare,
                    total_tax: totalTax,
                    ait,
                    discount: totalDiscount,
                    payable: totalBaseFare + totalTax + ait - totalDiscount,
                    vendor_price: vendor_price,
                    tax_fare
                };
                let total_segments = 0;
                newData.flights.map((elm) => {
                    elm.options.map((elm2) => {
                        total_segments++;
                    });
                });
                new_fare.tax_fare = tax_fare;
                //calculate tax fare
                let { tax_markup, tax_commission } = yield this.flightSupport.calculateFlightTaxMarkup({
                    dynamic_fare_supplier_id,
                    tax: tax_fare,
                    route_type,
                    airline: newData.carrier_code,
                });
                tax_commission = tax_commission * api_currency;
                tax_markup = tax_markup * api_currency;
                const { markup, commission, pax_markup } = yield new commonFlightSupport_service_1.CommonFlightSupport(this.trx).calculateFlightMarkup({
                    dynamic_fare_supplier_id,
                    airline: newData.carrier_code,
                    flight_class: new commonFlightUtils_2.default().getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin),
                    base_fare: new_fare.base_fare,
                    total_segments,
                    route_type,
                });
                const total_pax_markup = pax_count * pax_markup;
                new_fare.base_fare += markup + total_pax_markup;
                new_fare.base_fare += tax_markup;
                new_fare.discount += commission;
                new_fare.discount += tax_commission;
                new_fare.payable = Number((Number(new_fare.base_fare) +
                    Number(new_fare.total_tax) +
                    Number(new_fare.ait) -
                    Number(new_fare.discount)).toFixed(2));
                newData.fare = new_fare;
                newData.passengers = FormattedPassengers.map((newPax) => {
                    const per_pax_markup = ((markup + tax_markup) / pax_count) * newPax.number + pax_markup * newPax.number;
                    return {
                        type: newPax.type,
                        number: newPax.number,
                        fare: {
                            base_fare: Number((newPax.fare.base_fare + per_pax_markup).toFixed(2)),
                            tax: newPax.fare.tax,
                            total_fare: Number((newPax.fare.total_fare + per_pax_markup).toFixed(2)),
                        },
                    };
                });
            }
            //=== Last Time Check ==//
            {
                const TimeLimits = PricedFlightOffer[0].TimeLimits;
                if (TimeLimits) {
                    const [ticket_last_date, ticket_last_time] = new commonFlightUtils_1.default().utcToLocalDateTime(TimeLimits.Payment.DateTime + 'Z');
                    if (oldData.ticket_last_date !== ticket_last_date)
                        newData.ticket_last_date = ticket_last_date;
                    if (oldData.ticket_last_time !== ticket_last_time)
                        newData.ticket_last_time = ticket_last_time;
                }
            }
            //=== Refundable Check ==//
            {
                let refundable = false;
                const PenaltyRefs = [
                    ...new Set(PricedFlightOffer[0].OfferPrice.map((OP) => { var _a; return (_a = OP.FareDetail) === null || _a === void 0 ? void 0 : _a.FareComponent.map((FC) => { var _a; return (_a = FC.FareRules) === null || _a === void 0 ? void 0 : _a.Penalty.refs; }); })
                        .flat(10)
                        .filter((PR) => PR !== undefined)),
                ];
                // const PenaltyRefs =
                //   response.PricedFlightOffers.PricedFlightOffer[0].OfferPrice[0]
                //     .FareDetail?.FareComponent[0].FareRules?.Penalty.refs;
                const Penalty = (_b = response.DataLists.PenaltyList) === null || _b === void 0 ? void 0 : _b.Penalty;
                if (PenaltyRefs && Penalty) {
                    const matched = Penalty.filter((item) => PenaltyRefs.includes(item.ObjectKey) && item.RefundableInd !== undefined);
                    if (matched.length > 0) {
                        refundable = matched.every((p) => p.RefundableInd === true);
                    }
                }
                if (oldData.refundable !== refundable)
                    newData.refundable = refundable;
            }
            let partial_payment = {
                partial_payment: false,
                payment_percentage: 100,
                travel_date_from_now: 0,
            };
            if (route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC) {
                //domestic
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.VERTEIL_API,
                    airline: newData.carrier_code,
                    refundable: newData.refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    domestic: true,
                });
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.FROM_DAC) {
                //from dac
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.VERTEIL_API,
                    airline: newData.carrier_code,
                    refundable: newData.refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    domestic: false,
                });
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.TO_DAC) {
                //to dac
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.VERTEIL_API,
                    airline: newData.carrier_code,
                    to_dac: true,
                    refundable: newData.refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                });
            }
            else {
                //soto
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.VERTEIL_API,
                    airline: newData.carrier_code,
                    refundable: newData.refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    soto: true,
                });
            }
            newData.partial_payment = partial_payment;
            // console.log({old: oldData.fare.payable});
            newData.price_changed = !(oldData.fare.payable === newData.fare.payable);
            // Policies
            {
                const policyObject = PricedFlightOffer[0].OfferPrice.map((OfferPrice) => {
                    var _a, _b;
                    const paxRef = OfferPrice.RequestedDate.Associations[0].AssociatedTraveler
                        .TravelerReferences[0];
                    const PaxTypeCode = (_b = (_a = DataLists.AnonymousTravelerList) === null || _a === void 0 ? void 0 : _a.AnonymousTraveler.find((AT) => AT.ObjectKey === paxRef)) === null || _b === void 0 ? void 0 : _b.PTC.value;
                    const OD = OfferPrice.RequestedDate.Associations.map((Association) => {
                        var _a, _b, _c, _d;
                        let route = "";
                        const ODRef = (_a = Association.ApplicableFlight.OriginDestinationReferences) === null || _a === void 0 ? void 0 : _a[0];
                        const ODInfo = DataLists.OriginDestinationList.OriginDestination.find((od) => od.OriginDestinationKey === ODRef);
                        if (ODInfo)
                            route = ODInfo.DepartureCode.value + "-" + ODInfo.ArrivalCode.value;
                        const ODSegmentsRef = ((_b = Association.ApplicableFlight.FlightSegmentReference) === null || _b === void 0 ? void 0 : _b.map((Seg) => Seg.ref).filter((item) => item !== undefined)) || [];
                        const ODPenaltyRefs = (_c = OfferPrice.FareDetail) === null || _c === void 0 ? void 0 : _c.FareComponent.filter((FC) => FC.refs.some((ref) => ODSegmentsRef.includes(ref))
                        // (FC) => ODSegmentsRef.includes(FC.refs[0])
                        ).map((FC) => { var _a; return (_a = FC.FareRules) === null || _a === void 0 ? void 0 : _a.Penalty.refs; }).filter((value) => value !== undefined).flat(2);
                        const ODPenalties = ((_d = DataLists.PenaltyList) === null || _d === void 0 ? void 0 : _d.Penalty.filter((P) => ODPenaltyRefs === null || ODPenaltyRefs === void 0 ? void 0 : ODPenaltyRefs.includes(P.ObjectKey))) || [];
                        const ChangeFeePenalties = ODPenalties.filter((ODP) => ODP.ChangeFeeInd !== undefined);
                        const CancelFeePenalties = ODPenalties.filter((ODP) => ODP.CancelFeeInd !== undefined);
                        let changeAllowed = true;
                        let noChangeFee = true;
                        let changeFeeCurrencyCode = "";
                        const changeFeeMinValueList = [];
                        const changeFeeMaxValueList = [];
                        let noCancelFee = true;
                        let cancelFeeCurrencyCode = "";
                        const cancelFeeMinValueList = [];
                        const cancelFeeMaxValueList = [];
                        ChangeFeePenalties.forEach((CFP) => {
                            var _a, _b, _c, _d, _e, _f, _g;
                            if (CFP.ChangeAllowedInd !== true)
                                changeAllowed = false;
                            if (CFP.ChangeFeeInd !== false)
                                noChangeFee = false;
                            const ChangeDetails = CFP.Details.Detail.filter((Detail) => Detail.Type === "Change");
                            for (const detail of ChangeDetails) {
                                const Amounts = (_a = detail.Amounts) === null || _a === void 0 ? void 0 : _a.Amount;
                                if (Amounts) {
                                    for (const Amount of Amounts) {
                                        if (Amount.CurrencyAmountValue == undefined)
                                            continue;
                                        changeFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                                        const decimalKey = 
                                        // PricedFlightOffer[0].OfferID.Owner +
                                        // "-" +
                                        changeFeeCurrencyCode;
                                        const decimal = (_g = (_f = (_e = (_d = (_c = (_b = response.Metadata) === null || _b === void 0 ? void 0 : _b.Other) === null || _c === void 0 ? void 0 : _c.OtherMetadata) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.CurrencyMetadatas) === null || _f === void 0 ? void 0 : _f.CurrencyMetadata.find((CM) => CM.MetadataKey === decimalKey)) === null || _g === void 0 ? void 0 : _g.Decimals;
                                        if (Amount.AmountApplication === "MIN")
                                            changeFeeMinValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                        else if (Amount.AmountApplication === "MAX")
                                            changeFeeMaxValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                    }
                                }
                            }
                        });
                        CancelFeePenalties.forEach((CFP) => {
                            var _a, _b, _c, _d, _e, _f, _g;
                            if (CFP.CancelFeeInd !== false)
                                noCancelFee = false;
                            const ChangeDetails = CFP.Details.Detail.filter((Detail) => Detail.Type === "Cancel");
                            for (const detail of ChangeDetails) {
                                const Amounts = (_a = detail.Amounts) === null || _a === void 0 ? void 0 : _a.Amount;
                                if (Amounts) {
                                    for (const Amount of Amounts) {
                                        if (Amount.CurrencyAmountValue == undefined)
                                            continue;
                                        cancelFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                                        const decimalKey = 
                                        // PricedFlightOffer[0].OfferID.Owner +
                                        // "-" +
                                        cancelFeeCurrencyCode;
                                        const decimal = (_g = (_f = (_e = (_d = (_c = (_b = response.Metadata) === null || _b === void 0 ? void 0 : _b.Other) === null || _c === void 0 ? void 0 : _c.OtherMetadata) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.CurrencyMetadatas) === null || _f === void 0 ? void 0 : _f.CurrencyMetadata.find((CM) => CM.MetadataKey === decimalKey)) === null || _g === void 0 ? void 0 : _g.Decimals;
                                        if (Amount.AmountApplication === "MIN")
                                            cancelFeeMinValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                        else if (Amount.AmountApplication === "MAX")
                                            cancelFeeMaxValueList.push(this.applyDecimal(Amount.CurrencyAmountValue.value, decimal));
                                    }
                                }
                            }
                        });
                        const minimumChangePenalty = Math.min(...changeFeeMinValueList);
                        const maximumChangePenalty = Math.max(...changeFeeMaxValueList);
                        const minimumCancelPenalty = Math.min(...cancelFeeMinValueList);
                        const maximumCancelPenalty = Math.max(...cancelFeeMaxValueList);
                        return {
                            route,
                            changeAllowed,
                            noChangeFee,
                            noCancelFee,
                            changeFeeCurrencyCode,
                            minimumChangePenalty,
                            maximumChangePenalty,
                            cancelFeeCurrencyCode,
                            minimumCancelPenalty,
                            maximumCancelPenalty,
                        };
                    });
                    return {
                        PTC: PaxTypeCode,
                        OD,
                    };
                });
                const safeValue = (val) => {
                    if (val === null || val === undefined || !isFinite(val))
                        return "-";
                    return val;
                };
                let html = `
    <style>
      table.compact-table {
        font-size: 12px;
        border-collapse: collapse;
        width: 100%;
      }
      table.compact-table th, table.compact-table td {
        border: 1px solid #ccc;
        padding: 4px 6px;
        text-align: center;
      }
      table.compact-table th {
        background-color: #f2f2f2;
        white-space: nowrap;
      }
    </style>

    <table class="compact-table">
      <caption>Fare Rules (Change/Cancel Fees)</caption>
      <thead>
        <tr>
          <th>PTC</th>
          <th>Route</th>
          <th title="Change Allowed Or Not?">Change Allowed</th>
          <th title="Change Fee Currency">Change Cur</th>
          <th title="Minimum Change Penalty">Min CP</th>
          <th title="Maximum Change Penalty">Max CP</th>
          <th title="Change Allowed Or Not?">Refund Allowed</th>
          <th title="Cancel Fee Currency">Cancel Cur</th>
          <th title="Minimum Cancel Penalty">Min XP</th>
          <th title="Maximum Cancel Penalty">Max XP</th>
        </tr>
      </thead>
      <tbody>
  `;
                for (const ptc of policyObject) {
                    for (const od of ptc.OD) {
                        html += `
        <tr>
          <td>${ptc.PTC}</td>
          <td>${od.route}</td>
          <td>${od.changeAllowed ? "Yes" : "No"}</td>
          <td>${od.changeFeeCurrencyCode || "-"}</td>
          <td>${safeValue(od.minimumChangePenalty)}</td>
          <td>${safeValue(od.maximumChangePenalty)}</td>
          <td>${od.noCancelFee ? "Full" : "None/Partial"}</td>
          <td>${od.cancelFeeCurrencyCode || "-"}</td>
          <td>${safeValue(od.minimumCancelPenalty)}</td>
          <td>${safeValue(od.maximumCancelPenalty)}</td>
        </tr>
      `;
                    }
                }
                html += `
        </tbody>
        </table>
      `;
                newData.fare_rules = lib_1.default.minifyHTML(html);
            }
            return newData;
        });
    }
    // Flight Revalidate (end)//
    // Flight Booking (start)//
    orderCreateRequestFormatter({ OrderCreateRQ, passengers, countries, }) {
        let infAssociationAdtIndex = 0;
        const priority = { ADT: 1, CHD: 2, INF: 3 };
        const incompletePax = OrderCreateRQ.Query.Passengers.Passenger;
        incompletePax.sort((a, b) => priority[a.PTC.value] - priority[b.PTC.value]);
        // Reorder passengers array to match incompletePax
        {
            // Step 1: Sort by type in ADT, CHD, INF order
            passengers.sort((a, b) => priority[a.type] - priority[b.type]);
            // Step 2: Reorder ADT so that the one with contact info appears first
            const adults = passengers.filter((p) => p.type === 'ADT');
            const children = passengers.filter((p) => p.type === 'CHD');
            const infants = passengers.filter((p) => p.type === 'INF');
            const primaryAdultIndex = adults.findIndex((p) => p.contact_number && p.contact_email);
            if (primaryAdultIndex > 0) {
                // Move the primary adult to the first position
                const primaryAdult = adults.splice(primaryAdultIndex, 1)[0];
                adults.unshift(primaryAdult);
                passengers = [...adults, ...children, ...infants];
            }
        }
        const completedPax = incompletePax.map((iPax, iPaxInd) => {
            var _a, _b, _c;
            let FormattedPassenger = {};
            const passenger = passengers[iPaxInd];
            const paxType = iPax.PTC.value;
            // Provide contact only for the first adult passenger node
            if (iPaxInd === 0) {
                FormattedPassenger.Contacts = {
                    Contact: [
                        {
                            PhoneContact: {
                                Number: [
                                    {
                                        CountryCode: '+880',
                                        value: (_a = passenger.contact_number) === null || _a === void 0 ? void 0 : _a.slice(-10),
                                    },
                                ],
                            },
                            EmailContact: { Address: { value: passenger.contact_email } },
                            AddressContact: { Street: ['Bangladesh'], PostalCode: '1000' },
                        },
                    ],
                };
            }
            // Only for INFANT
            if (paxType === 'INF') {
                FormattedPassenger.Measurements = {
                    Height: {
                        UOM: 'Centimeter',
                        value: 75,
                    },
                    Weight: {
                        UOM: 'Kilogram',
                        value: 10,
                    },
                };
                FormattedPassenger.PassengerAssociation = incompletePax[infAssociationAdtIndex].ObjectKey;
                infAssociationAdtIndex++;
            }
            // Passport detail
            FormattedPassenger.PassengerIDInfo = {
                PassengerDocument: [
                    {
                        ID: passenger.passport_number,
                        Type: 'PT',
                        CountryOfIssuance: ((_b = countries.find((cn) => cn.id == passenger.issuing_country)) === null || _b === void 0 ? void 0 : _b.iso) || 'BD',
                        CountryOfResidence: ((_c = countries.find((cn) => cn.id == passenger.nationality)) === null || _c === void 0 ? void 0 : _c.iso) || 'BD',
                        DateOfIssue: passenger.passport_issue_date,
                        DateOfExpiration: passenger.passport_expiry_date,
                    },
                ],
            };
            // Gender detail
            FormattedPassenger.Gender = { value: passenger.gender };
            // Age detail
            FormattedPassenger.Age = {
                BirthDate: { value: passenger.date_of_birth },
            };
            // Name detail
            const getTitle = (paxType, paxGender, paxTitle) => {
                if (paxType === 'ADT') {
                    if (paxGender === 'Female') {
                        return paxTitle === 'Mrs' ? 'Mrs' : 'Ms';
                    }
                    return 'Mr'; // Male adults default to Mr
                }
                else if (paxType === 'CHD' || paxType === 'INF') {
                    return paxGender === 'Female' ? 'Miss' : 'Mstr';
                }
                return ''; // Default case
            };
            FormattedPassenger.Name = {
                Given: [{ value: passenger.first_name }],
                Surname: { value: passenger.last_name },
                Title: getTitle(paxType, passenger.gender, passenger.reference),
            };
            // ObjectKey and PTC has been set at PrepareMetaDataForOrderCreate phase
            FormattedPassenger.ObjectKey = iPax.ObjectKey;
            FormattedPassenger.PTC = iPax.PTC;
            // add _ref to original passenger data for saving
            passenger._ref = iPax.ObjectKey;
            return FormattedPassenger;
        });
        // @ts-ignore
        OrderCreateRQ.Query.Passengers.Passenger = completedPax;
        // Append Payment Method for instant purchase
        // if (primeFlow !== undefined) {
        //   OrderCreateRQ.Query.Payments = {
        //     Payment: [
        //       {
        //         Amount: primeFlow.Amount,
        //         Method: primeFlow.Method,
        //       },
        //     ],
        //   };
        // }
        // {
        //   OrderCreateRQ.Query.Payments = {
        //     Payment: [
        //       {
        //         Amount: { Code: "INR", value: 259614 },
        //         Method: { Cash: { CashInd: true } },
        //       },
        //     ],
        //   };
        // }
        return OrderCreateRQ;
    }
    // Flight book
    FlightBookService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ search_id, flight_id, passengers, }) {
            var _b, _c, _d, _e, _f;
            const preOrderCreateRQ = yield (0, redis_1.getRedis)(`VerteilOrderCreateRQ-${search_id}-${flight_id}`);
            if (!preOrderCreateRQ)
                throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
            const passengerCountryIds = [
                ...new Set(passengers
                    .map((pax) => [pax.issuing_country, pax.nationality])
                    .flat()
                    .filter((value) => value !== undefined) // Type guard
                ),
            ];
            const countries = yield this.Model.commonModel().getAllCountry({
                id: passengerCountryIds,
            });
            const OrderCreateRQ = this.orderCreateRequestFormatter({
                OrderCreateRQ: preOrderCreateRQ,
                passengers,
                countries,
            });
            const OrderCreateRS = yield this.request.postRequest(verteilApiEndpoints_1.default.FLIGHT_BOOK_ENDPOINT, OrderCreateRQ, {
                headers: {
                    ThirdpartyId: OrderCreateRQ.Query.OrderItems.ShoppingResponse.Owner,
                },
            });
            if (!OrderCreateRS)
                throw new customError_1.default('Please contact support team with flight information', 500);
            if (OrderCreateRS.Errors)
                throw new customError_1.default('Please contact support team with flight information', 500);
            const Order = (_b = OrderCreateRS.Response) === null || _b === void 0 ? void 0 : _b.Order[0];
            let paymentTimeLimit = (Order === null || Order === void 0 ? void 0 : Order.TimeLimits)
                ? new Date(Order.TimeLimits.PaymentTimeLimit.DateTime)
                    .toLocaleString('sv-SE', { hour12: false })
                    .replace('T', ' ')
                : '';
            if (paymentTimeLimit === '' && ((_c = Order === null || Order === void 0 ? void 0 : Order.OrderItems) === null || _c === void 0 ? void 0 : _c.OrderItem[0].TimeLimits)) {
                let timeLimit = (_d = Order.OrderItems.OrderItem[0].TimeLimits.PaymentTimeLimit) === null || _d === void 0 ? void 0 : _d.Timestamp;
                if (!timeLimit)
                    timeLimit = (_e = Order.OrderItems.OrderItem[0].TimeLimits.PriceGuaranteeTimeLimits) === null || _e === void 0 ? void 0 : _e.Timestamp;
                if (timeLimit)
                    paymentTimeLimit = new Date(timeLimit)
                        .toLocaleString('sv-SE', { hour12: false })
                        .replace('T', ' ');
            }
            return {
                success: true,
                pnr: (Order === null || Order === void 0 ? void 0 : Order.OrderID.value) || '',
                paymentTimeLimit,
                apiBookingId: ((_f = Order === null || Order === void 0 ? void 0 : Order.BookingReferences.BookingReference) === null || _f === void 0 ? void 0 : _f[0].ID) || '',
            };
        });
    }
    // Flight Booking (end)//
    // Get Booking (start)//
    orderRetrieveRequestFormatter(pnr, airlineCode) {
        return {
            Query: {
                Filters: {
                    OrderID: {
                        Owner: airlineCode,
                        value: pnr,
                        Channel: 'NDC',
                    },
                },
            },
        };
    }
    // Order Retrieve
    OrderRetrieveService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, airlineCode, passengers, }) {
            var _b, _c, _d, _e, _f;
            try {
                const OrderRetrieveRQ = this.orderRetrieveRequestFormatter(pnr, airlineCode);
                const OrderRetrieveRS = yield this.request.postRequest(verteilApiEndpoints_1.default.GET_BOOKING_ENDPOINT, OrderRetrieveRQ, {
                    headers: {
                        ThirdpartyId: airlineCode,
                    },
                });
                if (!OrderRetrieveRS)
                    throw new customError_1.default('No information has been found', 404);
                if (OrderRetrieveRS.Errors)
                    throw new Error('No information has been found' +
                        ((_b = OrderRetrieveRS === null || OrderRetrieveRS === void 0 ? void 0 : OrderRetrieveRS.Errors) === null || _b === void 0 ? void 0 : _b.Error.map((Er) => Er.value + ' ')));
                if (OrderRetrieveRS.Response === undefined)
                    throw new customError_1.default('This flight is not available ', 404);
                const Order = OrderRetrieveRS.Response.Order[0];
                const DataLists = OrderRetrieveRS.Response.DataLists;
                let paymentTimeLimit = (Order === null || Order === void 0 ? void 0 : Order.TimeLimits)
                    ? new Date(Order.TimeLimits.PaymentTimeLimit.DateTime)
                        .toLocaleString('sv-SE', { hour12: false })
                        .replace('T', ' ')
                    : '';
                if (paymentTimeLimit === '' && ((_c = Order === null || Order === void 0 ? void 0 : Order.OrderItems) === null || _c === void 0 ? void 0 : _c.OrderItem[0].TimeLimits)) {
                    let timeLimit = (_d = Order.OrderItems.OrderItem[0].TimeLimits.PaymentTimeLimit) === null || _d === void 0 ? void 0 : _d.Timestamp;
                    if (!timeLimit)
                        timeLimit = (_e = Order.OrderItems.OrderItem[0].TimeLimits.PriceGuaranteeTimeLimits) === null || _e === void 0 ? void 0 : _e.Timestamp;
                    if (timeLimit)
                        paymentTimeLimit = new Date(timeLimit)
                            .toLocaleString('sv-SE', { hour12: false })
                            .replace('T', ' ');
                }
                // Ticket Details
                let flightTickets = [];
                const TicketDocInfo = (_f = OrderRetrieveRS.Response.TicketDocInfos) === null || _f === void 0 ? void 0 : _f.TicketDocInfo;
                if (TicketDocInfo) {
                    flightTickets = passengers.map((Pax) => {
                        var _a, _b, _c, _d;
                        const passportID = (_a = Pax.passport_number) === null || _a === void 0 ? void 0 : _a.toUpperCase();
                        const paxRef = (_c = (_b = OrderRetrieveRS.Response) === null || _b === void 0 ? void 0 : _b.Passengers.Passenger.find((VerteilPax) => VerteilPax.PassengerIDInfo.PassengerDocument[0].ID.toUpperCase() === passportID)) === null || _c === void 0 ? void 0 : _c.ObjectKey;
                        const TicketInfo = TicketDocInfo.find((TDI) => TDI.PassengerReference[0] === paxRef);
                        const TicketDocument = (_d = TicketInfo === null || TicketInfo === void 0 ? void 0 : TicketInfo.TicketDocument) === null || _d === void 0 ? void 0 : _d[0];
                        return {
                            number: (TicketDocument === null || TicketDocument === void 0 ? void 0 : TicketDocument.TicketDocNbr) || '',
                            status: 'ISSUED',
                            originalTicketData: TicketInfo,
                        };
                    });
                }
                // Baggage Details
                let BaggagePerPTC;
                {
                    const Passenger = OrderRetrieveRS.Response.Passengers.Passenger;
                    const PTCs = Array.from(new Map(Passenger.map((p) => [p.PTC, p])).values());
                    BaggagePerPTC = PTCs.map((PTC) => {
                        var _a, _b, _c, _d, _e, _f, _g;
                        const serviceRefs = (_c = (_b = (_a = Order.OrderItems) === null || _a === void 0 ? void 0 : _a.OrderItem.find((OI) => {
                            var _a;
                            return OI.BaggageItem !== undefined &&
                                ((_a = OI.Associations) === null || _a === void 0 ? void 0 : _a.Passengers.PassengerReferences.includes(PTC.ObjectKey));
                        })) === null || _b === void 0 ? void 0 : _b.BaggageItem) === null || _c === void 0 ? void 0 : _c.refs;
                        if (!serviceRefs)
                            return { PTC: PTC.PTC.value, baggageDesc: 'N/A' };
                        const Service = (_e = (_d = DataLists.ServiceList) === null || _d === void 0 ? void 0 : _d.Service.filter((S) => serviceRefs.includes(S.ObjectKey))) === null || _e === void 0 ? void 0 : _e.filter((S) => S.refs !== undefined);
                        if (!Service)
                            return { PTC: PTC.PTC.value, baggageDesc: 'N/A' };
                        const ServiceRefs = Service.map((S) => S.refs).flat();
                        let CheckedBagDescription = '';
                        let CarryBagDescription = '';
                        const CarryOnAllowanceList = (_f = DataLists.CarryOnAllowanceList) === null || _f === void 0 ? void 0 : _f.CarryOnAllowance.filter((COA) => ServiceRefs.includes(COA.ListKey));
                        const CheckedBagAllowanceList = (_g = DataLists.CheckedBagAllowanceList) === null || _g === void 0 ? void 0 : _g.CheckedBagAllowance.filter((CBA) => ServiceRefs.includes(CBA.ListKey));
                        if (CarryOnAllowanceList && CarryOnAllowanceList.length) {
                            const Allowance = CarryOnAllowanceList[0];
                            if (Allowance.PieceAllowance) {
                                const count = Allowance.PieceAllowance[0].TotalQuantity;
                                CarryBagDescription = `${count} PC${count > 1 ? 's' : ''} `;
                            }
                            if (Allowance.WeightAllowance) {
                                const count = Allowance.WeightAllowance.MaximumWeight[0].Value;
                                const unit = Allowance.WeightAllowance.MaximumWeight[0].UOM;
                                CarryBagDescription += ` ${count} ${unit}`;
                            }
                        }
                        if (CheckedBagAllowanceList && CheckedBagAllowanceList.length) {
                            const Allowance = CheckedBagAllowanceList[0];
                            if (Allowance.PieceAllowance) {
                                const count = Allowance.PieceAllowance[0].TotalQuantity;
                                CheckedBagDescription = `${count} PC${count > 1 ? 's' : ''} `;
                            }
                            if (Allowance.WeightAllowance) {
                                const count = Allowance.WeightAllowance.MaximumWeight[0].Value;
                                const unit = Allowance.WeightAllowance.MaximumWeight[0].UOM;
                                CheckedBagDescription += ` ${count} ${unit}`;
                            }
                        }
                        return {
                            PTC: PTC.PTC.value,
                            baggageDesc: `Checked: ${CheckedBagDescription.length ? CheckedBagDescription : 'N/A'} \nHand: ${CarryBagDescription.length ? CarryBagDescription : 'N/A'}`,
                        };
                    });
                }
                return {
                    success: true,
                    pnr_code: (Order === null || Order === void 0 ? void 0 : Order.OrderID.value) || pnr,
                    paymentTimeLimit,
                    flightTickets,
                    baggageDescription: BaggagePerPTC,
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: { code: 500, message: error.message },
                };
            }
        });
    }
    // Get Booking (end)//
    // Ticket issue (start)//
    TicketIssueService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, airlineCode, oldFare, passengers, }) {
            var _b;
            let errorCode;
            try {
                //phase 1 - order reshop
                const { OrderReshopRS, OrderReshopRQ } = yield this.OrderReshop({ pnr, airlineCode });
                {
                    if (!OrderReshopRS || OrderReshopRS.error || !OrderReshopRS.response) {
                        yield this.Model.errorLogsModel().insert({
                            level: constants_1.ERROR_LEVEL_WARNING,
                            message: 'Error from verteil while ticket issue',
                            url: verteilApiEndpoints_1.default.ORDER_RESHOP_HEADER_ENDPOINT,
                            http_method: 'POST',
                            metadata: {
                                api: flightConstants_1.VERTEIL_API,
                                endpoint: verteilApiEndpoints_1.default.ORDER_RESHOP_HEADER_ENDPOINT,
                                payload: OrderReshopRQ,
                                response: OrderReshopRS,
                            },
                        });
                        return {
                            success: false,
                            message: 'Cannot issue the booking ',
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                        };
                    }
                    // const curTotalPrice = new VerteilFlightUtils().calculatePriceFromNanos(
                    //   OrderReshopRS.response.repriceResult.totalPrice.totalAmount
                    // );
                    // const priceHasChanged =
                    //   // OrderReshopRS.response.repriceResult.noPriceChangeInd !== true ||
                    //   // OrderReshopRS.response.repriceResult.repricedOffers !== undefined ||
                    //   oldFare.vendor_total !== curTotalPrice;
                    // if (priceHasChanged) {
                    //   return {
                    //     success: false,
                    //     code: this.StatusCode.HTTP_CONFLICT,
                    //     message:
                    //       'Price has been changed. Please review & confirm the new prices.',
                    //     error: {
                    //       priceChangeInd: true,
                    //       priceChangeAmount: curTotalPrice - oldFare.vendor_total,
                    //     },
                    //   };
                    // }
                }
                //phase 2 - order change
                const { OrderChangeRS, OrderChangeRQ } = yield this.AcceptRepricedOffer({
                    pnr,
                    airlineCode,
                    OrderReshopRS,
                });
                {
                    if (!OrderChangeRS || OrderChangeRS.Errors || !OrderChangeRS.Response) {
                        yield this.Model.errorLogsModel().insert({
                            level: constants_1.ERROR_LEVEL_WARNING,
                            message: 'Error from verteil while ticket issue',
                            url: verteilApiEndpoints_1.default.ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT,
                            http_method: 'POST',
                            metadata: {
                                api: flightConstants_1.VERTEIL_API,
                                endpoint: verteilApiEndpoints_1.default.ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT,
                                payload: OrderChangeRQ,
                                response: OrderChangeRS,
                            },
                        });
                        return {
                            success: false,
                            message: 'Cannot issue the booking ',
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                        };
                    }
                }
                let flightTickets = [];
                const TicketDocInfo = (_b = OrderChangeRS.Response.TicketDocInfos) === null || _b === void 0 ? void 0 : _b.TicketDocInfo;
                if (TicketDocInfo) {
                    flightTickets = passengers.map((Pax) => {
                        var _a, _b, _c, _d;
                        const passportID = (_a = Pax.passport_number) === null || _a === void 0 ? void 0 : _a.toUpperCase();
                        const paxRef = (_c = (_b = OrderChangeRS.Response) === null || _b === void 0 ? void 0 : _b.Passengers.Passenger.find((VerteilPax) => VerteilPax.PassengerIDInfo.PassengerDocument[0].ID.toUpperCase() === passportID)) === null || _c === void 0 ? void 0 : _c.ObjectKey;
                        const TicketInfo = TicketDocInfo.find((TDI) => TDI.PassengerReference[0] === paxRef);
                        const TicketDocument = (_d = TicketInfo === null || TicketInfo === void 0 ? void 0 : TicketInfo.TicketDocument) === null || _d === void 0 ? void 0 : _d[0];
                        return (TicketDocument === null || TicketDocument === void 0 ? void 0 : TicketDocument.TicketDocNbr) || '';
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Ticket has been issued',
                    data: flightTickets,
                    ticket_status: flightConstants_1.FLIGHT_TICKET_ISSUE,
                };
            }
            catch (error) {
                console.warn(`Verteil TicketIssue Error: ` + error.message);
                return {
                    success: false,
                    message: error.message,
                    code: errorCode || this.StatusCode.HTTP_BAD_REQUEST,
                };
            }
        });
    }
    // Order Reshop Request Formatter
    orderReshopRequestFormatter(pnr, airlineCode) {
        return {
            ownerCode: airlineCode,
            orderId: pnr,
            channel: 'NDC',
        };
    }
    // Order Reshop
    OrderReshop(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, airlineCode }) {
            const OrderReshopRQ = this.orderReshopRequestFormatter(pnr, airlineCode);
            const OrderReshopRS = yield this.request.postRequest(verteilApiEndpoints_1.default.ORDER_RESHOP_ENDPOINT, OrderReshopRQ, {
                headers: {
                    service: verteilApiEndpoints_1.default.ORDER_RESHOP_HEADER_ENDPOINT,
                    ThirdpartyId: airlineCode,
                    Resource: 'Reprice.V3',
                },
            });
            return { OrderReshopRS, OrderReshopRQ };
        });
    }
    // Order Accept Request Formatter
    acceptRepricedOrderRequestFormatter({ pnr, airlineCode, amount, dataMap, augmentations, }) {
        return {
            ownerCode: airlineCode,
            orderId: pnr,
            channel: 'NDC',
            acceptRepricedOrder: {
                paymentFunctions: [
                    {
                        paymentProcessingDetails: {
                            typeCode: 'CA',
                            amount,
                        },
                    },
                ],
                dataMap,
                augmentations,
            },
        };
    }
    // Accept Repriced Offer
    AcceptRepricedOffer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, airlineCode, OrderReshopRS, }) {
            var _b, _c, _d;
            const OrderChangeRQ = this.acceptRepricedOrderRequestFormatter({
                pnr,
                airlineCode,
                dataMap: (_b = OrderReshopRS.response) === null || _b === void 0 ? void 0 : _b.dataMap,
                augmentations: (_c = OrderReshopRS.response) === null || _c === void 0 ? void 0 : _c.augmentations,
                amount: (_d = OrderReshopRS.response) === null || _d === void 0 ? void 0 : _d.repriceResult.totalPrice.totalAmount,
            });
            const OrderChangeRS = yield this.request.postRequest(verteilApiEndpoints_1.default.ACCEPT_REPRICE_OFFER_ENDPOINT, OrderChangeRQ, {
                headers: {
                    service: verteilApiEndpoints_1.default.ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT,
                    ThirdpartyId: airlineCode,
                    Resource: 'AcceptRepricedOrder.V3',
                },
            });
            return { OrderChangeRS, OrderChangeRQ };
        });
    }
    // Ticket issue (end)//
    // Booking Cancel (start)//
    orderCancelRequestFormatter(pnr, airlineCode) {
        return {
            Query: { OrderID: [{ Channel: 'NDC', Owner: airlineCode, value: pnr }] },
        };
    }
    // Order cancel
    OrderCancelService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, airlineCode }) {
            try {
                const OrderCancelRQ = this.orderCancelRequestFormatter(pnr, airlineCode);
                const OrderCancelRS = yield this.request.postRequest(verteilApiEndpoints_1.default.BOOKING_CANCEL_ENDPOINT, OrderCancelRQ, {
                    headers: {
                        ThirdpartyId: airlineCode,
                        Resource: 'Unpaid',
                    },
                });
                if (!OrderCancelRS)
                    throw new customError_1.default('Cannot cancel the booking ', 400);
                if (OrderCancelRS.Errors)
                    throw new Error(OrderCancelRS.Errors.Error.map((Er) => Er.value + ' ').join(','));
                if (OrderCancelRS.Response === undefined)
                    throw new Error('No_Response Error');
                if (OrderCancelRS.Success === undefined)
                    throw new Error('Unknown Error.');
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Booking has been cancelled',
                };
            }
            catch (error) {
                throw new customError_1.default('Cannot cancel the booking ', 400);
            }
        });
    }
}
exports.default = VerteilFlightService;
