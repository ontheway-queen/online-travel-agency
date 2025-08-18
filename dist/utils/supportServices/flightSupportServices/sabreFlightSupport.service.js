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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const customError_1 = __importDefault(require("../../lib/customError"));
const dateTimeFormatter_1 = require("../../lib/dateTimeFormatter");
const commonFlightUtils_1 = __importDefault(require("../../lib/flightLib/commonFlightUtils"));
const sabreRequest_1 = __importDefault(require("../../lib/flightLib/sabreRequest"));
const lib_1 = __importDefault(require("../../lib/lib"));
const constants_1 = require("../../miscellaneous/constants");
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
const sabreApiEndpoints_1 = __importDefault(require("../../miscellaneous/flightMiscellaneous/sabreApiEndpoints"));
const commonFlightSupport_service_1 = require("./commonFlightSupport.service");
const redis_1 = require("../../../app/redis");
class SabreFlightService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.request = new sabreRequest_1.default();
        this.flightUtils = new commonFlightUtils_1.default();
        // Get layover time
        this.getNewLayoverTime = (options) => {
            const layoverTime = options.map((item, index) => {
                var _a, _b;
                let firstArrival = options[index].arrival.time;
                let secondDeparture = (_b = (_a = options[index + 1]) === null || _a === void 0 ? void 0 : _a.departure) === null || _b === void 0 ? void 0 : _b.time;
                let layoverTimeString = 0;
                if (secondDeparture) {
                    const startDate = new Date(`2020-01-01T${firstArrival}`);
                    let endDate = new Date(`2020-01-01T${secondDeparture}`);
                    if (endDate < startDate) {
                        endDate = new Date(`2020-01-02T${secondDeparture}`);
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
                        // Convert the difference minutes
                        layoverTimeString = Math.abs(differenceInMilliseconds / (1000 * 60));
                    }
                    else {
                        const layoverTimeInMilliseconds = endDate.getTime() - startDate.getTime();
                        layoverTimeString = Math.abs(layoverTimeInMilliseconds) / (1000 * 60);
                    }
                }
                return layoverTimeString;
            });
            return layoverTime;
        };
        this.trx = trx;
        this.flightSupport = new commonFlightSupport_service_1.CommonFlightSupport(trx);
    }
    ////////////==================FLIGHT SEARCH (START)=========================///////////
    // Flight Search Request formatter
    FlightReqFormatterV5(body, dynamic_fare_supplier_id, route_type, search_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const AirlinesPrefModel = this.Model.AirlinesPreferenceModel(this.trx);
            const dealCodeModel = this.Model.DealCodeModel(this.trx);
            const prefAirlinesQuery = {
                dynamic_fare_supplier_id,
                pref_type: "PREFERRED",
                status: true,
            };
            const { data: getAllDealCodes } = yield dealCodeModel.getAll({
                api: flightConstants_1.SABRE_API,
                status: true,
            });
            const AccountCode = getAllDealCodes
                .map((item) => {
                if (typeof item.deal_code !== "string")
                    return null;
                return {
                    Code: item.deal_code,
                };
            })
                .filter(Boolean);
            if (AccountCode.length) {
                yield (0, redis_1.setRedis)(`dealcode:${search_id}`, AccountCode);
            }
            const PriceRequestInformation = {
                AccountCode,
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
            // Get preferred airlines
            const cappingAirlinesRaw = yield AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);
            const preferredAirlines = cappingAirlinesRaw.map((el) => el.Code);
            let finalAirlineCodes = [];
            if ((_a = body.airline_code) === null || _a === void 0 ? void 0 : _a.length) {
                const requestedAirlines = body.airline_code.map((el) => el.Code);
                if (preferredAirlines.length) {
                    // Use common values only
                    finalAirlineCodes = requestedAirlines.filter((code) => preferredAirlines.includes(code));
                    if (finalAirlineCodes.length === 0) {
                        return false;
                    }
                }
                else {
                    // No preferred, use all requested
                    finalAirlineCodes = requestedAirlines;
                }
            }
            else {
                if (preferredAirlines.length) {
                    // Only preferred exist
                    finalAirlineCodes = preferredAirlines;
                }
            }
            // Return in the format: { Code: string }[]
            const airlines = finalAirlineCodes.map((code) => ({
                Code: code,
            }));
            const originDestinationInfo = [];
            body.OriginDestinationInformation.forEach((item) => {
                let cabin = "Y";
                switch (item.TPA_Extensions.CabinPref.Cabin) {
                    case "1":
                        cabin = "Y";
                        break;
                    case "2":
                        cabin = "S";
                        break;
                    case "3":
                        cabin = "C";
                        break;
                    case "4":
                        cabin = "F";
                        break;
                    default:
                        break;
                }
                originDestinationInfo.push(Object.assign(Object.assign({}, item), { TPA_Extensions: {
                        CabinPref: {
                            Cabin: cabin,
                            PreferLevel: item.TPA_Extensions.CabinPref.PreferLevel,
                        },
                    } }));
            });
            const reqBody = {
                OTA_AirLowFareSearchRQ: {
                    Version: "5",
                    POS: {
                        Source: [
                            {
                                PseudoCityCode: config_1.default.SABRE_USERNAME.split("-")[1],
                                RequestorID: {
                                    Type: "1",
                                    ID: "1",
                                    CompanyName: {
                                        Code: "TN",
                                        content: "TN",
                                    },
                                },
                            },
                        ],
                    },
                    AvailableFlightsOnly: true,
                    OriginDestinationInformation: originDestinationInfo,
                    TravelPreferences: {
                        VendorPref: (airlines === null || airlines === void 0 ? void 0 : airlines.length) ? airlines : undefined,
                        TPA_Extensions: {
                            LongConnectTime: {
                                Enable: true,
                                Max: 1439,
                                Min: 59,
                            },
                            XOFares: {
                                Value: true,
                            },
                            KeepSameCabin: {
                                Enabled: true,
                            },
                        },
                    },
                    TravelerInfoSummary: {
                        SeatsRequested: [1],
                        AirTravelerAvail: [
                            {
                                PassengerTypeQuantity: body.PassengerTypeQuantity,
                            },
                        ],
                        PriceRequestInformation: PriceRequestInformation,
                    },
                    TPA_Extensions: {
                        IntelliSellTransaction: {
                            RequestType: {
                                Name: flightConstants_1.SABRE_FLIGHT_ITINS,
                            },
                        },
                    },
                },
            };
            return reqBody;
        });
    }
    // Flight search service
    FlightSearch(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, booking_block, reqBody, search_id, }) {
            let route_type = this.flightSupport.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const flightRequestBody = yield this.FlightReqFormatterV5(reqBody, dynamic_fare_supplier_id, route_type, search_id);
            // console.log({ flightRequestBody: JSON.stringify(flightRequestBody) });
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.FLIGHT_SEARCH_ENDPOINT_V5, flightRequestBody);
            // return [response];
            if (!response) {
                return [];
            }
            if (response.groupedItineraryResponse.statistics.itineraryCount === 0) {
                return [];
            }
            const result = yield this.FlightSearchResFormatter({
                data: response.groupedItineraryResponse,
                reqBody: reqBody,
                dynamic_fare_supplier_id,
                booking_block,
                route_type,
            });
            // console.log({result});
            return result;
        });
    }
    // Flight search Response formatter
    FlightSearchResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, booking_block, data, reqBody, flight_id, route_type, }) {
            var _b;
            const commonModel = this.Model.commonModel(this.trx);
            const AirlinesPreferenceModel = this.Model.AirlinesPreferenceModel(this.trx);
            const getBlockedAirlinesPayload = {
                dynamic_fare_supplier_id,
                pref_type: "BLOCKED",
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
            const api_currency = yield this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(flightConstants_1.SABRE_API, "FLIGHT");
            const OriginDest = reqBody.OriginDestinationInformation;
            const scheduleDesc = [];
            for (const item of data.scheduleDescs) {
                const dAirport = yield commonModel.getAirport(item.departure.airport);
                const AAirport = yield commonModel.getAirport(item.arrival.airport);
                const DCity = yield commonModel.getCity(item.departure.city);
                const ACity = yield commonModel.getCity(item.arrival.city);
                const marketing_airline = yield commonModel.getAirlines(item.carrier.marketing);
                const aircraft = yield commonModel.getAircraft(item.carrier.equipment.code);
                let operating_airline = marketing_airline;
                if (item.carrier.marketing !== item.carrier.operating) {
                    operating_airline = yield commonModel.getAirlines(item.carrier.operating);
                }
                const departure = {
                    airport_code: item.departure.airport,
                    city_code: item.departure.city,
                    airport: dAirport,
                    city: DCity,
                    country: item.departure.country,
                    terminal: item.departure.terminal,
                    time: item.departure.time,
                    date: "",
                    date_adjustment: item.departure.dateAdjustment,
                };
                const arrival = {
                    airport: AAirport,
                    city: ACity,
                    airport_code: item.arrival.airport,
                    city_code: item.arrival.city,
                    country: item.arrival.country,
                    time: item.arrival.time,
                    terminal: item.arrival.terminal,
                    date: "",
                    date_adjustment: item.arrival.dateAdjustment,
                };
                const carrier = {
                    carrier_marketing_code: item.carrier.marketing,
                    carrier_marketing_airline: marketing_airline.name,
                    carrier_marketing_logo: marketing_airline.logo,
                    carrier_marketing_flight_number: String(item.carrier.marketingFlightNumber),
                    carrier_operating_code: item.carrier.operating,
                    carrier_operating_airline: operating_airline.name,
                    carrier_operating_logo: operating_airline.logo,
                    carrier_operating_flight_number: String(item.carrier.operatingFlightNumber),
                    carrier_aircraft_code: aircraft.code,
                    carrier_aircraft_name: aircraft.name,
                };
                const new_item = {
                    id: item.id,
                    elapsedTime: item.elapsedTime,
                    stopCount: item.stopCount,
                    message: item.message,
                    message_type: item.messageType,
                    total_miles_flown: item.totalMilesFlown,
                    departure,
                    arrival,
                    carrier,
                };
                scheduleDesc.push(new_item);
            }
            const legDesc = data.legDescs.map((leg) => {
                const schedules = leg.schedules;
                const options = [];
                for (const schedule of schedules) {
                    const founded = scheduleDesc.find((item) => item.id === schedule.ref);
                    if (founded) {
                        options.push(Object.assign(Object.assign({}, founded), { departureDateAdjustment: schedule.departureDateAdjustment }));
                    }
                }
                return {
                    id: leg.id,
                    elapsed_time: leg.elapsedTime,
                    options,
                };
            });
            const itineraryGroup = data.itineraryGroups[0];
            const itineraries = [];
            for (let i = 0; i < itineraryGroup.itineraries.length; i++) {
                const itinerary = itineraryGroup.itineraries[i];
                const fare = itinerary.pricingInformation[0].fare;
                const validatingCarrier = yield commonModel.getAirlines(fare.validatingCarrierCode);
                if (blockedAirlines.find((ba) => ba.Code === fare.validatingCarrierCode)) {
                    continue;
                }
                const passenger_lists = [];
                let refundable = !fare.passengerInfoList[0].passengerInfo.nonRefundable;
                const baggageAndAvailabilityAllSeg = [];
                const legsDesc = this.newGetLegsDesc(itinerary.legs, legDesc, OriginDest);
                const ait = Math.round(((Number(fare.totalFare.equivalentAmount) +
                    Number(fare.totalFare.totalTaxAmount)) /
                    100) *
                    0.3);
                const new_fare = {
                    base_fare: fare.totalFare.equivalentAmount,
                    total_tax: Number(fare.totalFare.totalTaxAmount),
                    ait,
                    discount: 0,
                    payable: Number((Number(fare.totalFare.equivalentAmount) +
                        Number(fare.totalFare.totalTaxAmount) +
                        ait).toFixed(2)),
                    tax_fare: [],
                    vendor_price: {
                        base_fare: fare.totalFare.equivalentAmount,
                        tax: fare.totalFare.totalTaxAmount,
                        charge: 0,
                        discount: 0,
                        gross_fare: Number(fare.totalFare.totalPrice),
                        net_fare: Number(fare.totalFare.totalPrice),
                    },
                };
                new_fare.base_fare *= api_currency;
                new_fare.total_tax *= api_currency;
                new_fare.payable *= api_currency;
                new_fare.ait *= api_currency;
                let partial_payment = {
                    partial_payment: false,
                    payment_percentage: 100,
                    travel_date_from_now: 0,
                };
                if (route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC) {
                    //domestic
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        domestic: true,
                    });
                }
                else if (route_type === flightConstants_1.ROUTE_TYPE.FROM_DAC) {
                    //from dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        from_dac: true,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else if (route_type === flightConstants_1.ROUTE_TYPE.TO_DAC) {
                    //to dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        to_dac: true,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else {
                    //soto
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.SABRE_API,
                        airline: fare.validatingCarrierCode,
                        refundable,
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        soto: true,
                    });
                }
                //tax fare
                const tax_fare = fare.passengerInfoList.map((elm) => {
                    return elm.passengerInfo.taxes.map((tax) => {
                        var _a, _b;
                        // Find matching taxDesc by ref
                        const taxDesc = data.taxDescs.find(desc => desc.id === tax.ref);
                        return {
                            code: (_a = taxDesc === null || taxDesc === void 0 ? void 0 : taxDesc.code) !== null && _a !== void 0 ? _a : 'UNKNOWN',
                            amount: (_b = taxDesc === null || taxDesc === void 0 ? void 0 : taxDesc.amount) !== null && _b !== void 0 ? _b : 0
                        };
                    });
                });
                new_fare.tax_fare = tax_fare;
                let { tax_markup, tax_commission } = yield this.flightSupport.calculateFlightTaxMarkup({
                    dynamic_fare_supplier_id,
                    tax: tax_fare,
                    route_type,
                    airline: fare.validatingCarrierCode,
                });
                tax_commission = tax_commission * api_currency;
                tax_markup = tax_markup * api_currency;
                let total_segments = 0;
                legsDesc.map((elm) => {
                    elm.options.map((elm2) => {
                        total_segments++;
                    });
                });
                const { markup, commission, pax_markup } = yield this.flightSupport.calculateFlightMarkup({
                    dynamic_fare_supplier_id,
                    airline: fare.validatingCarrierCode,
                    flight_class: this.flightUtils.getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
                        .Cabin),
                    base_fare: fare.totalFare.equivalentAmount,
                    total_segments,
                    route_type,
                });
                let pax_count = 0;
                reqBody.PassengerTypeQuantity.map((reqPax) => {
                    pax_count += reqPax.Quantity;
                });
                for (const passenger of fare.passengerInfoList) {
                    const passenger_info = passenger.passengerInfo;
                    refundable = !passenger_info.nonRefundable;
                    const segmentDetails = [];
                    let legInd = 0;
                    let segInd = 0;
                    let segments = [];
                    for (let i = 0; i < passenger_info.fareComponents.length; i++) {
                        const pfd = passenger_info.fareComponents[i];
                        for (let j = 0; j < pfd.segments.length; j++) {
                            const segd = pfd.segments[j];
                            const segment = segd === null || segd === void 0 ? void 0 : segd.segment;
                            if (segment !== undefined) {
                                const meal_type = lib_1.default.getMeal((segment === null || segment === void 0 ? void 0 : segment.mealCode) || "");
                                const cabin_type = lib_1.default.getCabin((segment === null || segment === void 0 ? void 0 : segment.cabinCode) || "");
                                segments.push({
                                    id: j + 1,
                                    name: `Segment-${j + 1}`,
                                    meal_type: meal_type === null || meal_type === void 0 ? void 0 : meal_type.name,
                                    meal_code: meal_type === null || meal_type === void 0 ? void 0 : meal_type.code,
                                    cabin_code: cabin_type === null || cabin_type === void 0 ? void 0 : cabin_type.code,
                                    cabin_type: cabin_type === null || cabin_type === void 0 ? void 0 : cabin_type.name,
                                    booking_code: segment === null || segment === void 0 ? void 0 : segment.bookingCode,
                                    available_seat: segment === null || segment === void 0 ? void 0 : segment.seatsAvailable,
                                    available_break: segment === null || segment === void 0 ? void 0 : segment.availabilityBreak,
                                    available_fare_break: segment === null || segment === void 0 ? void 0 : segment.fareBreakPoint,
                                });
                            }
                            segInd++;
                        }
                        let newBaggage = {};
                        if (passenger_info.baggageInformation) {
                            const baggage = passenger_info.baggageInformation[i];
                            if (baggage) {
                                const allowance_id = (_b = baggage === null || baggage === void 0 ? void 0 : baggage.allowance) === null || _b === void 0 ? void 0 : _b.ref;
                                newBaggage = data.baggageAllowanceDescs.find((all_item) => all_item.id === allowance_id);
                            }
                        }
                        //all the segments are in one fareComponents object for each leg
                        if (pfd.endAirport ===
                            reqBody.OriginDestinationInformation[legInd].DestinationLocation
                                .LocationCode) {
                            legInd++;
                            segInd = 0;
                        }
                        //segments are in different fareComponents object for each leg
                        else {
                            continue;
                        }
                        segmentDetails.push({
                            id: i + 1,
                            from_airport: reqBody.OriginDestinationInformation[legInd - 1].OriginLocation
                                .LocationCode,
                            to_airport: reqBody.OriginDestinationInformation[legInd - 1]
                                .DestinationLocation.LocationCode,
                            segments,
                            baggage: (newBaggage === null || newBaggage === void 0 ? void 0 : newBaggage.id)
                                ? {
                                    id: newBaggage === null || newBaggage === void 0 ? void 0 : newBaggage.id,
                                    unit: newBaggage.unit || "pieces",
                                    count: newBaggage.weight || newBaggage.pieceCount,
                                }
                                : {
                                    id: 1,
                                    unit: "N/A",
                                    count: "N/A",
                                },
                        });
                        segments = [];
                    }
                    baggageAndAvailabilityAllSeg.push({
                        passenger_type: passenger.passengerInfo.passengerType,
                        passenger_count: passenger.passengerInfo.passengerNumber,
                        segmentDetails,
                    });
                    const base_fare = Number(passenger_info.passengerTotalFare.equivalentAmount) *
                        api_currency +
                        pax_markup * passenger_info.passengerNumber;
                    const tax = Number(passenger_info.passengerTotalFare.totalTaxAmount) *
                        api_currency;
                    const per_pax_markup = ((markup + tax_markup) / pax_count) *
                        Number(passenger.passengerInfo.passengerNumber) +
                        pax_markup * Number(passenger.passengerInfo.passengerNumber);
                    const new_passenger = {
                        type: passenger_info.passengerType,
                        number: passenger_info.passengerNumber,
                        fare: {
                            tax,
                            base_fare: Number((base_fare + per_pax_markup).toFixed(2)),
                            total_fare: Number((base_fare + per_pax_markup + tax).toFixed(2)),
                        },
                    };
                    passenger_lists.push(new_passenger);
                }
                const availability = [];
                baggageAndAvailabilityAllSeg.forEach((item) => {
                    const { segmentDetails } = item;
                    segmentDetails.forEach((item2) => {
                        const foundData = availability.find((avItem) => avItem.from_airport === item2.from_airport &&
                            avItem.to_airport === item2.to_airport);
                        if (foundData) {
                            const { segments } = foundData;
                            item2.segments.forEach((item3) => {
                                const segmentFound = segments.find((segs) => item3.name === segs.name);
                                if (segmentFound) {
                                    const passenger = segmentFound.passenger.find((pas) => pas.type === item.passenger_type);
                                    if (!passenger) {
                                        segmentFound.passenger.push({
                                            type: item.passenger_type,
                                            count: item.passenger_count,
                                            meal_type: item3.meal_type,
                                            meal_code: item3.meal_code,
                                            cabin_code: item3.cabin_code,
                                            cabin_type: item3.cabin_type,
                                            booking_code: item3.booking_code,
                                            available_seat: item3.available_seat,
                                            available_break: item3.available_break,
                                            available_fare_break: item3.available_fare_break,
                                            baggage_info: `${item2.baggage.count} ${item2.baggage.unit}`,
                                        });
                                    }
                                }
                                else {
                                    segments.push({
                                        name: item3.name,
                                        passenger: [
                                            {
                                                type: item.passenger_type,
                                                count: item.passenger_count,
                                                meal_type: item3.meal_type,
                                                meal_code: item3.meal_code,
                                                cabin_code: item3.cabin_code,
                                                cabin_type: item3.cabin_type,
                                                booking_code: item3.booking_code,
                                                available_seat: item3.available_seat,
                                                available_break: item3.available_break,
                                                available_fare_break: item3.available_fare_break,
                                                baggage_info: `${item2.baggage.count} ${item2.baggage.unit}`,
                                            },
                                        ],
                                    });
                                }
                            });
                        }
                        else {
                            const segments = [];
                            item2.segments.forEach((item3) => {
                                segments.push({
                                    name: item3.name,
                                    passenger: [
                                        {
                                            type: item.passenger_type,
                                            count: item.passenger_count,
                                            meal_type: item3.meal_type,
                                            meal_code: item3.meal_code,
                                            cabin_code: item3.cabin_code,
                                            cabin_type: item3.cabin_type,
                                            booking_code: item3.booking_code,
                                            available_seat: item3.available_seat,
                                            available_break: item3.available_break,
                                            available_fare_break: item3.available_fare_break,
                                            baggage_info: `${item2.baggage.count} ${item2.baggage.unit}`,
                                        },
                                    ],
                                });
                            });
                            availability.push({
                                from_airport: item2.from_airport,
                                to_airport: item2.to_airport,
                                segments,
                            });
                        }
                    });
                });
                const total_pax_markup = pax_markup * pax_count;
                new_fare.base_fare += markup;
                new_fare.base_fare += total_pax_markup;
                new_fare.base_fare += tax_markup;
                new_fare.discount += commission;
                new_fare.discount += tax_commission;
                new_fare.payable =
                    Number(new_fare.base_fare) +
                        new_fare.total_tax +
                        new_fare.ait -
                        Number(new_fare.discount);
                const itinery = {
                    flight_id: flight_id || (0, uuid_1.v4)(),
                    api_search_id: "",
                    booking_block,
                    partial_payment,
                    direct_ticket_issue: false,
                    price_changed: false,
                    domestic_flight: route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC,
                    journey_type: reqBody.JourneyType,
                    api: flightConstants_1.SABRE_API,
                    fare: new_fare,
                    refundable,
                    carrier_code: fare.validatingCarrierCode,
                    carrier_name: validatingCarrier.name,
                    carrier_logo: validatingCarrier.logo,
                    ticket_last_date: fare.lastTicketDate,
                    ticket_last_time: fare.lastTicketTime,
                    flights: legsDesc,
                    passengers: passenger_lists,
                    availability,
                    leg_description: [],
                };
                itineraries.push(itinery);
            }
            return itineraries;
        });
    }
    ///==================FLIGHT SEARCH (END)=========================///
    //////==================FLIGHT REVALIDATE (START)=========================//////
    //sabre flight revalidate service
    SabreFlightRevalidate(reqBody, retrieved_response, dynamic_fare_supplier_id, flight_id, booking_block, search_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const revalidate_req_body = yield this.RevalidateFlightReqFormatter(reqBody, retrieved_response, search_id);
            const route_type = this.flightSupport.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.FLIGHT_REVALIDATE_ENDPOINT, revalidate_req_body);
            // console.log({response: JSON.stringify(response)});
            if (!response) {
                throw new customError_1.default("An error occurred", 400);
            }
            if (((_a = response.groupedItineraryResponse) === null || _a === void 0 ? void 0 : _a.statistics.itineraryCount) === 0) {
                throw new customError_1.default(`The flight is not available.`, 404);
            }
            const data = yield this.FlightSearchResFormatter({
                booking_block,
                reqBody,
                data: response.groupedItineraryResponse,
                dynamic_fare_supplier_id,
                flight_id,
                route_type,
            });
            return data;
        });
    }
    // Revalidate Flight Request Formatter
    RevalidateFlightReqFormatter(reqBody, retrieved_response, search_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let cabin = "Y";
            switch ((_c = (_b = (_a = reqBody.OriginDestinationInformation[0]) === null || _a === void 0 ? void 0 : _a.TPA_Extensions) === null || _b === void 0 ? void 0 : _b.CabinPref) === null || _c === void 0 ? void 0 : _c.Cabin) {
                case "1":
                    cabin = "Y";
                    break;
                case "2":
                    cabin = "S";
                    break;
                case "3":
                    cabin = "C";
                    break;
                case "4":
                    cabin = "F";
                    break;
                default:
                    break;
            }
            const OriginDestinationInformation = reqBody.OriginDestinationInformation.map((item, index) => {
                const req_depart_air = item.OriginLocation.LocationCode;
                const flights = [];
                const flight = retrieved_response.flights[index];
                const carrierCode = retrieved_response.carrier_code;
                const depart_time = flight.options[0].departure.time;
                const depart_air = flight.options[0].departure.airport_code;
                const depart_city = flight.options[0].departure.city_code;
                if ([depart_air, depart_city].includes(req_depart_air)) {
                    for (const option of flight.options) {
                        const DepartureDateTime = (0, dateTimeFormatter_1.convertDateTime)(option.departure.date, option.departure.time);
                        const ArrivalDateTime = (0, dateTimeFormatter_1.convertDateTime)(option.arrival.date, option.arrival.time);
                        const flight_data = {
                            Number: Number(option === null || option === void 0 ? void 0 : option.carrier.carrier_marketing_flight_number),
                            ClassOfService: new commonFlightUtils_1.default().getCabinCodeForRevalidate(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
                                .Cabin),
                            DepartureDateTime,
                            ArrivalDateTime,
                            Type: "A",
                            OriginLocation: {
                                LocationCode: option === null || option === void 0 ? void 0 : option.departure.airport_code,
                            },
                            DestinationLocation: {
                                LocationCode: option === null || option === void 0 ? void 0 : option.arrival.airport_code,
                            },
                            Airline: {
                                Marketing: option === null || option === void 0 ? void 0 : option.carrier.carrier_marketing_code,
                                Operating: option === null || option === void 0 ? void 0 : option.carrier.carrier_operating_code,
                            },
                        };
                        flights.push(flight_data);
                    }
                    const origin_destination_info = {
                        RPH: item.RPH,
                        DepartureDateTime: (0, dateTimeFormatter_1.convertDateTime)(item.DepartureDateTime, depart_time),
                        OriginLocation: item["OriginLocation"],
                        DestinationLocation: item["DestinationLocation"],
                        TPA_Extensions: {
                            Flight: flights,
                        },
                    };
                    return origin_destination_info;
                }
            });
            const PassengerTypeQuantity = reqBody.PassengerTypeQuantity.map((item) => {
                const passenger_info = {
                    Code: item.Code,
                    Quantity: item.Quantity,
                    TPA_Extensions: {
                        VoluntaryChanges: {
                            Match: "Info",
                        },
                    },
                };
                return passenger_info;
            });
            const dealCodes = yield (0, redis_1.getRedis)(`dealcode:${search_id}`);
            const PriceRequestInformation = {};
            if (dealCodes && Array.isArray(dealCodes) && dealCodes.length > 0) {
                PriceRequestInformation.AccountCode = dealCodes;
            }
            const request_body = {
                OTA_AirLowFareSearchRQ: {
                    POS: {
                        Source: [
                            {
                                PseudoCityCode: config_1.default.SABRE_USERNAME.split("-")[1],
                                RequestorID: {
                                    Type: "1",
                                    ID: "1",
                                    CompanyName: {
                                        Code: "TN",
                                    },
                                },
                            },
                        ],
                    },
                    OriginDestinationInformation: OriginDestinationInformation,
                    TPA_Extensions: {
                        IntelliSellTransaction: {
                            CompressResponse: {
                                Value: false,
                            },
                            RequestType: {
                                Name: "50ITINS",
                            },
                        },
                    },
                    TravelerInfoSummary: Object.assign({ AirTravelerAvail: [
                            {
                                PassengerTypeQuantity: PassengerTypeQuantity,
                            },
                        ], SeatsRequested: [1] }, (Object.keys(PriceRequestInformation).length > 0 && {
                        PriceRequestInformation,
                    })),
                    TravelPreferences: {
                        TPA_Extensions: {
                            DataSources: {
                                NDC: "Disable",
                                ATPCO: "Enable",
                                LCC: "Disable",
                            },
                            VerificationItinCallLogic: {
                                AlwaysCheckAvailability: true,
                                Value: "L",
                            },
                        },
                    },
                    Version: "5",
                },
            };
            return request_body;
        });
    }
    ///==================FLIGHT REVALIDATE (END)=========================///
    /////////==================FLIGHT BOOKING (START)=========================/////////
    //pnr create request formatter
    pnrReqBody(body, foundItem, user_info) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const formattedDate = (dateString) => `${String(new Date(dateString).getDate()).padStart(2, "0")}${new Date(dateString)
                .toLocaleString("default", { month: "short" })
                .toUpperCase()}${String(new Date(dateString).getFullYear()).slice(-2)}`;
            const monthDiff = (date) => {
                const diff = Math.ceil((new Date().getTime() - new Date(date).getTime()) /
                    (1000 * 60 * 60 * 24 * 30));
                return String(diff).padStart(2, "0");
            };
            const passengers = body.passengers;
            const filteredPassengers = passengers.filter((passenger) => passenger.type !== "INF");
            const passengerLength = filteredPassengers.length;
            const SecureFlight = [];
            const AdvancePassenger = [];
            const Service = [];
            const ContactNumber = [];
            Service.push({
                SSR_Code: "CTCM",
                Text: user_info.phone,
                PersonName: {
                    NameNumber: "1.1",
                },
                SegmentNumber: "A",
            });
            Service.push({
                SSR_Code: "OTHS",
                Text: user_info.name,
                PersonName: {
                    NameNumber: "1.1",
                },
                SegmentNumber: "A",
            });
            Service.push({
                SSR_Code: "CTCE",
                Text: constants_1.PROJECT_EMAIL_API_1.replace("@", "//"),
                PersonName: {
                    NameNumber: "1.1",
                },
                SegmentNumber: "A",
            });
            ContactNumber.push({
                NameNumber: "1.1",
                Phone: user_info.phone,
                PhoneUseType: "M",
            });
            const Email = [];
            Email.push({
                NameNumber: "1.1",
                Address: constants_1.PROJECT_EMAIL_API_1,
                Type: "CC",
            });
            let inf_ind = 1;
            const PersonName = yield Promise.all(passengers.map((item, index) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const name_number = `${index + 1}.1`;
                const secure_fl_data = {
                    PersonName: {
                        NameNumber: item.type === "INF" ? inf_ind + ".1" : name_number,
                        DateOfBirth: item.date_of_birth ? (_a = String(item.date_of_birth)) === null || _a === void 0 ? void 0 : _a.split("T")[0] : undefined,
                        Gender: item.gender
                            ? item.type === "INF" && item.gender === "Male"
                                ? "MI"
                                : item.type === "INF" && item.gender === "Female"
                                    ? "FI"
                                    : item.gender[0]
                            : undefined,
                        GivenName: item.first_name,
                        Surname: item.last_name,
                    },
                    SegmentNumber: "A",
                    VendorPrefs: {
                        Airline: {
                            Hosted: false,
                        },
                    },
                };
                if (item.type.startsWith("C")) {
                    Service.push({
                        SSR_Code: "CHLD",
                        Text: formattedDate(item.date_of_birth || ''),
                        PersonName: {
                            NameNumber: name_number,
                        },
                        SegmentNumber: "A",
                    });
                }
                if (item.type === "INF") {
                    Service.push({
                        SSR_Code: "INFT",
                        Text: item.first_name +
                            "/" +
                            item.last_name +
                            "/" +
                            formattedDate(item.date_of_birth || ''),
                        PersonName: {
                            NameNumber: inf_ind + ".1",
                        },
                        SegmentNumber: "A",
                    });
                }
                SecureFlight.push(secure_fl_data);
                if (item.passport_number) {
                    item.issuing_country = item.nationality;
                    const issuing_country = yield this.Model.commonModel().getAllCountry({
                        id: Number(item.issuing_country),
                    });
                    let nationality = issuing_country;
                    if (item.nationality !== item.issuing_country) {
                        nationality = yield this.Model.commonModel().getAllCountry({
                            id: Number(item.nationality),
                        });
                    }
                    AdvancePassenger.push({
                        Document: {
                            IssueCountry: issuing_country[0].iso3,
                            NationalityCountry: nationality[0].iso3,
                            ExpirationDate: (_b = String(item.passport_expiry_date)) === null || _b === void 0 ? void 0 : _b.split("T")[0],
                            Number: item.passport_number,
                            Type: "P",
                        },
                        PersonName: {
                            Gender: item.type === "INF" && item.gender === "Male"
                                ? "MI"
                                : item.type === "INF" && item.gender === "Female"
                                    ? "FI"
                                    : item.gender[0],
                            GivenName: item.first_name,
                            Surname: item.last_name,
                            DateOfBirth: item.date_of_birth ? (_c = String(item.date_of_birth)) === null || _c === void 0 ? void 0 : _c.split("T")[0] : undefined,
                            NameNumber: item.type === "INF" ? inf_ind + ".1" : name_number,
                        },
                        SegmentNumber: "A",
                    });
                }
                const person = {
                    NameNumber: name_number,
                    NameReference: item.type === "INF"
                        ? "I" + monthDiff(item.date_of_birth || '')
                        : item.type === "ADT"
                            ? ""
                            : item.type,
                    GivenName: item.first_name + " " + item.reference,
                    Surname: item.last_name,
                    PassengerType: item.type,
                    Infant: item.type === "INF" ? true : false,
                };
                if (item.type === "INF") {
                    inf_ind++;
                }
                return person;
            })));
            const flight = foundItem;
            let passenger_qty = 0;
            const PassengerType = flight.passengers.map((passenger) => {
                passenger_qty = passenger.number;
                return {
                    Code: passenger.type,
                    Quantity: String(passenger_qty),
                };
            });
            // flight segments
            const FlightSegment = [];
            const booking_code = ((_a = flight.availability) === null || _a === void 0 ? void 0 : _a.flatMap((avElem) => {
                var _a;
                return (_a = avElem === null || avElem === void 0 ? void 0 : avElem.segments) === null || _a === void 0 ? void 0 : _a.map((segElem) => { var _a, _b; return (_b = (_a = segElem === null || segElem === void 0 ? void 0 : segElem.passenger) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.booking_code; });
            })) || [];
            let booking_code_index = 0;
            for (const item of flight.flights) {
                for (const option of item.options) {
                    const mar_code = option.carrier.carrier_marketing_code;
                    const segment = {
                        ArrivalDateTime: this.flightUtils.convertDateTime(String(option.arrival.date), option.arrival.time),
                        DepartureDateTime: this.flightUtils.convertDateTime(String(option.departure.date), option.departure.time),
                        FlightNumber: String(option.carrier.carrier_marketing_flight_number),
                        NumberInParty: String(passengerLength),
                        ResBookDesigCode: booking_code === null || booking_code === void 0 ? void 0 : booking_code[booking_code_index],
                        Status: "NN",
                        DestinationLocation: {
                            LocationCode: option.arrival.airport_code,
                        },
                        MarketingAirline: {
                            Code: mar_code,
                            FlightNumber: String(option.carrier.carrier_marketing_flight_number),
                        },
                        OriginLocation: {
                            LocationCode: option.departure.airport_code,
                        },
                    };
                    FlightSegment.push(segment);
                    booking_code_index++;
                }
            }
            const dealCodes = yield (0, redis_1.getRedis)(`dealcode:${body.search_id}`);
            const formateCode = dealCodes === null || dealCodes === void 0 ? void 0 : dealCodes.map((dealCode) => {
                return dealCode.Code;
            });
            const request_body = {
                CreatePassengerNameRecordRQ: {
                    version: "2.5.0",
                    targetCity: config_1.default.SABRE_USERNAME.split("-")[1],
                    haltOnAirPriceError: true,
                    TravelItineraryAddInfo: {
                        AgencyInfo: {
                            Address: {
                                AddressLine: "OTA",
                                CityName: "DHAKA BANGLADESH",
                                CountryCode: "BD",
                                PostalCode: "1213",
                                StateCountyProv: {
                                    StateCode: "BD",
                                },
                                StreetNmbr: "DHAKA",
                            },
                            Ticketing: {
                                TicketType: "7TAW",
                            },
                        },
                        CustomerInfo: {
                            ContactNumbers: {
                                ContactNumber,
                            },
                            Email,
                            PersonName,
                        },
                    },
                    AirBook: {
                        HaltOnStatus: [
                            {
                                Code: "HL",
                            },
                            {
                                Code: "KK",
                            },
                            {
                                Code: "LL",
                            },
                            {
                                Code: "NN",
                            },
                            {
                                Code: "NO",
                            },
                            {
                                Code: "UC",
                            },
                            {
                                Code: "US",
                            },
                        ],
                        OriginDestinationInformation: {
                            FlightSegment,
                        },
                        RedisplayReservation: {
                            NumAttempts: 5,
                            WaitInterval: 1000,
                        },
                    },
                    AirPrice: [
                        {
                            PriceRequestInformation: {
                                Retain: true,
                                OptionalQualifiers: {
                                    FOP_Qualifiers: {
                                        BasicFOP: {
                                            Type: "CASH",
                                        },
                                    },
                                    PricingQualifiers: Object.assign(Object.assign({}, ((formateCode === null || formateCode === void 0 ? void 0 : formateCode.length)
                                        ? { Account: { Code: formateCode } }
                                        : {})), { PassengerType }),
                                },
                            },
                        },
                    ],
                    SpecialReqDetails: {
                        SpecialService: {
                            SpecialServiceInfo: {
                                AdvancePassenger,
                                SecureFlight,
                                Service,
                            },
                        },
                    },
                    PostProcessing: {
                        EndTransaction: {
                            Source: {
                                ReceivedFrom: "WEB",
                            },
                            Email: {
                                Ind: true,
                            },
                        },
                        RedisplayReservation: {
                            waitInterval: 1000,
                        },
                    },
                },
            };
            return request_body;
        });
    }
    //flight booking service
    FlightBookingService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ body, user_info, revalidate_data, }) {
            var _b, _c, _d, _e, _f;
            const requestBody = yield this.pnrReqBody(body, revalidate_data, {
                email: user_info.email,
                phone: user_info.phone,
                name: user_info.name,
            });
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.FLIGHT_BOOKING_ENDPOINT, requestBody);
            if (!response) {
                throw new customError_1.default("Please contact support team with flight information", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
            }
            if (((_c = (_b = response === null || response === void 0 ? void 0 : response.CreatePassengerNameRecordRS) === null || _b === void 0 ? void 0 : _b.ApplicationResults) === null || _c === void 0 ? void 0 : _c.status) !==
                "Complete") {
                throw new customError_1.default("Please contact support team with flight information", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR, constants_1.ERROR_LEVEL_WARNING, {
                    api: flightConstants_1.SABRE_API,
                    endpoint: sabreApiEndpoints_1.default.FLIGHT_BOOKING_ENDPOINT,
                    payload: requestBody,
                    response: (_d = response === null || response === void 0 ? void 0 : response.CreatePassengerNameRecordRS) === null || _d === void 0 ? void 0 : _d.ApplicationResults,
                });
            }
            //return GDS PNR
            return (_f = (_e = response === null || response === void 0 ? void 0 : response.CreatePassengerNameRecordRS) === null || _e === void 0 ? void 0 : _e.ItineraryRef) === null || _f === void 0 ? void 0 : _f.ID;
        });
    }
    ///==================FLIGHT BOOKING (END)=========================///
    ////////==================TICKET ISSUE (START)=========================//////////
    // // ticket issue req formatter
    SabreTicketIssueReqFormatter(pnrId, unique_traveler) {
        let Record = [];
        for (let i = 1; i <= unique_traveler; i++) {
            Record.push({
                Number: i,
            });
        }
        return {
            AirTicketRQ: {
                version: "1.3.0",
                targetCity: config_1.default.SABRE_USERNAME.split("-")[1],
                DesignatePrinter: {
                    Printers: {
                        Ticket: {
                            CountryCode: "BD",
                        },
                        Hardcopy: {
                            LNIATA: config_1.default.SABRE_LNIATA_CODE,
                        },
                        InvoiceItinerary: {
                            LNIATA: config_1.default.SABRE_LNIATA_CODE,
                        },
                    },
                },
                Itinerary: {
                    ID: pnrId,
                },
                Ticketing: [
                    {
                        MiscQualifiers: {
                            Commission: {
                                Percent: 7,
                            },
                        },
                        PricingQualifiers: {
                            PriceQuote: [
                                {
                                    Record,
                                },
                            ],
                        },
                    },
                ],
                PostProcessing: {
                    EndTransaction: {
                        Source: {
                            ReceivedFrom: "SABRE WEB",
                        },
                        Email: {
                            eTicket: {
                                PDF: {
                                    Ind: true,
                                },
                                Ind: true,
                            },
                            PersonName: {
                                NameNumber: "1.1",
                            },
                            Ind: true,
                        },
                    },
                },
            },
        };
    }
    //ticket issue service
    TicketIssueService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, unique_traveler, }) {
            var _b, _c;
            const ticketReqBody = this.SabreTicketIssueReqFormatter(pnr, unique_traveler);
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT, ticketReqBody);
            if (((_c = (_b = response === null || response === void 0 ? void 0 : response.AirTicketRS) === null || _b === void 0 ? void 0 : _b.ApplicationResults) === null || _c === void 0 ? void 0 : _c.status) === "Complete") {
                const retrieve_booking = yield this.request.postRequest(sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT, {
                    confirmationId: pnr,
                });
                if (!retrieve_booking || !(retrieve_booking === null || retrieve_booking === void 0 ? void 0 : retrieve_booking.flightTickets)) {
                    yield this.Model.errorLogsModel().insert({
                        level: constants_1.ERROR_LEVEL_WARNING,
                        message: "Error from sabre while ticket issue",
                        url: sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT,
                        http_method: "POST",
                        metadata: {
                            api: flightConstants_1.SABRE_API,
                            endpoint: sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT,
                            payload: { confirmationId: pnr },
                            response: retrieve_booking,
                        },
                    });
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: "Please contact support team with flight information",
                        error: retrieve_booking === null || retrieve_booking === void 0 ? void 0 : retrieve_booking.errors,
                    };
                }
                const ticket_number = [];
                for (let i = 0; i < retrieve_booking.flightTickets.length; i++) {
                    ticket_number.push(retrieve_booking.flightTickets[i].number);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Ticket has been issued",
                    data: ticket_number,
                };
            }
            else {
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_WARNING,
                    message: "Error from sabre while ticket issue",
                    url: sabreApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT,
                    http_method: "POST",
                    metadata: {
                        api: flightConstants_1.SABRE_API,
                        endpoint: sabreApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT,
                        payload: ticketReqBody,
                        response: response,
                    },
                });
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: "An error occurred while issuing the ticket",
                    error: response === null || response === void 0 ? void 0 : response.errors,
                };
            }
        });
    }
    ///==================TICKET ISSUE (END)=========================///
    /////////==================BOOKING CANCEL (START)=========================//////////
    //sabre booking cancel req formatter
    SabreBookingCancelReqFormatter(pnr) {
        return {
            confirmationId: pnr,
            retrieveBooking: true,
            cancelAll: true,
            errorHandlingPolicy: "ALLOW_PARTIAL_CANCEL",
        };
    }
    //sabre booking cancel service
    SabreBookingCancelService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr }) {
            //cancel booking req formatter
            const cancelBookingBody = this.SabreBookingCancelReqFormatter(pnr);
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.CANCEL_BOOKING_ENDPOINT, cancelBookingBody);
            //if there is error then return
            if (!response || response.errors) {
                // await this.Model.errorLogsModel(trx).insert({
                //   level: ERROR_LEVEL_WARNING,
                //   message: 'Error from sabre while cancel booking',
                //   url: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
                //   http_method: 'POST',
                //   metadata: {
                //     api: SABRE_API,
                //     endpoint: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
                //     payload: cancelBookingBody,
                //     response: response,
                //   },
                //   source,
                // });
                throw new customError_1.default("An error occurred while cancelling the booking", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR, constants_1.ERROR_LEVEL_WARNING, {
                    api: flightConstants_1.SABRE_API,
                    endpoint: sabreApiEndpoints_1.default.CANCEL_BOOKING_ENDPOINT,
                    payload: cancelBookingBody,
                    response: response,
                });
                // return {
                //   success: false,
                //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                //   message: 'An error occurred while cancelling the booking',
                //   error: response?.errors,
                // };
            }
            return {
                success: true,
            };
        });
    }
    ///==================BOOKING CANCEL (END)=========================///
    /////==================GET BOOKING(START)=========================//////////////
    GRNUpdate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ pnr, booking_status, }) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const response = yield this.request.postRequest(sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT, {
                confirmationId: pnr === null || pnr === void 0 ? void 0 : pnr.trim(),
            });
            let status = booking_status;
            let ticket_number = [];
            let last_time = null;
            let airline_pnr = null;
            let refundable = false;
            let fare_rules;
            if (response) {
                //pnr status
                if (((_d = (_c = (_b = response === null || response === void 0 ? void 0 : response.flightTickets) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.ticketStatusName) === null || _d === void 0 ? void 0 : _d.toLowerCase()) ===
                    flightConstants_1.FLIGHT_BOOKING_VOID) {
                    status = flightConstants_1.FLIGHT_BOOKING_VOID;
                }
                else if (((_g = (_f = (_e = response === null || response === void 0 ? void 0 : response.flightTickets) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.ticketStatusName) === null || _g === void 0 ? void 0 : _g.toLowerCase()) ===
                    flightConstants_1.FLIGHT_BOOKING_REFUNDED) {
                    status = flightConstants_1.FLIGHT_BOOKING_REFUNDED;
                }
                else if (response === null || response === void 0 ? void 0 : response.isTicketed) {
                    status = flightConstants_1.FLIGHT_TICKET_ISSUE;
                    //get ticket number
                    for (let i = 0; i < ((_h = response === null || response === void 0 ? void 0 : response.flightTickets) === null || _h === void 0 ? void 0 : _h.length); i++) {
                        ticket_number.push(response === null || response === void 0 ? void 0 : response.flightTickets[i].number);
                    }
                }
                else {
                    if ((response === null || response === void 0 ? void 0 : response.bookingId) &&
                        (response === null || response === void 0 ? void 0 : response.startDate) === undefined &&
                        (response === null || response === void 0 ? void 0 : response.endDate) === undefined) {
                        status = flightConstants_1.FLIGHT_BOOKING_CANCELLED;
                    }
                }
                //get last time of ticket issue
                (_j = response === null || response === void 0 ? void 0 : response.specialServices) === null || _j === void 0 ? void 0 : _j.map((elem) => {
                    if (elem.code === "ADTK") {
                        last_time = elem.message;
                    }
                });
                //get airline pnr
                airline_pnr =
                    [
                        ...new Set((_k = response === null || response === void 0 ? void 0 : response.flights) === null || _k === void 0 ? void 0 : _k.map((flight) => flight === null || flight === void 0 ? void 0 : flight.confirmationId).filter((id) => id)),
                    ].join(", ") || "";
                //get refundable status
                refundable = (_m = (_l = response === null || response === void 0 ? void 0 : response.fareRules) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.isRefundable;
                //fare rules
                (_o = response === null || response === void 0 ? void 0 : response.fareRules) === null || _o === void 0 ? void 0 : _o.forEach((rule) => {
                    const origin = (rule === null || rule === void 0 ? void 0 : rule.originAirportCode) || 'N/A';
                    const destination = (rule === null || rule === void 0 ? void 0 : rule.destinationAirportCode) || 'N/A';
                    const airline = (rule === null || rule === void 0 ? void 0 : rule.owningAirlineCode) || 'N/A';
                    fare_rules += `<h3>Fare Rules for ${origin} ➔ ${destination} (${airline})</h3>`;
                    // Refund rules
                    if (rule === null || rule === void 0 ? void 0 : rule.isRefundable) {
                        fare_rules += `<h4>Refund Charges:</h4>`;
                        const refundPenalties = (rule === null || rule === void 0 ? void 0 : rule.refundPenalties) || [];
                        if (refundPenalties.length > 0) {
                            refundPenalties.forEach((penalty) => {
                                var _a, _b, _c, _d, _e;
                                const applicability = ((_a = penalty === null || penalty === void 0 ? void 0 : penalty.applicability) === null || _a === void 0 ? void 0 : _a.replace('_', ' ')) || 'N/A';
                                const amount = ((_b = penalty === null || penalty === void 0 ? void 0 : penalty.penalty) === null || _b === void 0 ? void 0 : _b.amount) || 'N/A';
                                const currency = ((_c = penalty === null || penalty === void 0 ? void 0 : penalty.penalty) === null || _c === void 0 ? void 0 : _c.currencyCode) || '';
                                fare_rules += `
          <p><strong>When:</strong> ${applicability}</p>
          <p><strong>Refund Penalty:</strong> ${amount} ${currency}</p>
        `;
                                if ((penalty === null || penalty === void 0 ? void 0 : penalty.hasNoShowCost) && (penalty === null || penalty === void 0 ? void 0 : penalty.noShowPenalty)) {
                                    const noShowAmount = ((_d = penalty === null || penalty === void 0 ? void 0 : penalty.noShowPenalty) === null || _d === void 0 ? void 0 : _d.amount) || 'N/A';
                                    const noShowCurrency = ((_e = penalty === null || penalty === void 0 ? void 0 : penalty.noShowPenalty) === null || _e === void 0 ? void 0 : _e.currencyCode) || '';
                                    fare_rules += `<p><strong>No-Show Penalty:</strong> ${noShowAmount} ${noShowCurrency}</p>`;
                                }
                            });
                        }
                        else {
                            fare_rules += `<p>No refund penalties specified.</p>`;
                        }
                    }
                    else {
                        fare_rules += `<p>This fare is non-refundable.</p>`;
                    }
                    // Reissue rules
                    if (rule === null || rule === void 0 ? void 0 : rule.isChangeable) {
                        fare_rules += `<h4>Reissue (Exchange) Charges:</h4>`;
                        const exchangePenalties = (rule === null || rule === void 0 ? void 0 : rule.exchangePenalties) || [];
                        if (exchangePenalties.length > 0) {
                            exchangePenalties.forEach((penalty) => {
                                var _a, _b, _c, _d, _e;
                                const applicability = ((_a = penalty === null || penalty === void 0 ? void 0 : penalty.applicability) === null || _a === void 0 ? void 0 : _a.replace('_', ' ')) || 'N/A';
                                const amount = ((_b = penalty === null || penalty === void 0 ? void 0 : penalty.penalty) === null || _b === void 0 ? void 0 : _b.amount) || 'N/A';
                                const currency = ((_c = penalty === null || penalty === void 0 ? void 0 : penalty.penalty) === null || _c === void 0 ? void 0 : _c.currencyCode) || '';
                                fare_rules += `
          <p><strong>When:</strong> ${applicability}</p>
          <p><strong>Change Penalty:</strong> ${amount} ${currency}</p>
        `;
                                if ((penalty === null || penalty === void 0 ? void 0 : penalty.hasNoShowCost) && (penalty === null || penalty === void 0 ? void 0 : penalty.noShowPenalty)) {
                                    const noShowAmount = ((_d = penalty === null || penalty === void 0 ? void 0 : penalty.noShowPenalty) === null || _d === void 0 ? void 0 : _d.amount) || 'N/A';
                                    const noShowCurrency = ((_e = penalty === null || penalty === void 0 ? void 0 : penalty.noShowPenalty) === null || _e === void 0 ? void 0 : _e.currencyCode) || '';
                                    fare_rules += `<p><strong>No-Show Penalty:</strong> ${noShowAmount} ${noShowCurrency}</p>`;
                                }
                            });
                        }
                        else {
                            fare_rules += `<p>No reissue penalties specified.</p>`;
                        }
                    }
                    else {
                        fare_rules += `<p>This fare is not changeable.</p>`;
                    }
                    fare_rules += `<hr />`; // Optional: Add a separator
                });
            }
            return {
                success: response ? true : false,
                status,
                ticket_number,
                last_time,
                airline_pnr,
                refundable,
                fare_rules
            };
        });
    }
    pnrShare(pnr, dynamic_fare_supplier_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
            const sabre_response = yield this.request.postRequest(sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT, {
                confirmationId: pnr,
            });
            if (!sabre_response) {
                throw new customError_1.default("PNR not found", this.StatusCode.HTTP_NOT_FOUND);
            }
            if (!sabre_response.flights || !Array.isArray(sabre_response.flights)) {
                throw new customError_1.default("PNR not found", this.StatusCode.HTTP_BAD_REQUEST);
            }
            const commonModel = this.Model.commonModel(this.trx);
            const airports = [];
            const leg_description = (_a = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.journeys) === null || _a === void 0 ? void 0 : _a.map((item) => {
                airports.push(item === null || item === void 0 ? void 0 : item.firstAirportCode);
                airports.push(item === null || item === void 0 ? void 0 : item.lastAirportCode);
                return {
                    departureLocation: item === null || item === void 0 ? void 0 : item.firstAirportCode,
                    arrivalLocation: item === null || item === void 0 ? void 0 : item.lastAirportCode,
                };
            });
            const route_type = this.flightSupport.routeTypeFinder({
                airportsPayload: airports,
            });
            const airline_code = (_c = (_b = sabre_response.fares) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.airlineCode;
            //fare
            const { markup, commission } = yield this.flightSupport.calculateFlightMarkup({
                dynamic_fare_supplier_id,
                airline: airline_code,
                flight_class: sabre_response.flights[0].cabinTypeName,
                base_fare: (_f = (_e = (_d = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _d === void 0 ? void 0 : _d.flightTotals) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.subtotal,
                total_segments: sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.flights.length,
                route_type,
            });
            const ait = Math.round((Number((_h = (_g = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _g === void 0 ? void 0 : _g.flightTotals) === null || _h === void 0 ? void 0 : _h[0].total) / 100) * 0.3);
            const fare = {
                base_fare: Number((_l = (_k = (_j = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _j === void 0 ? void 0 : _j.flightTotals) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.subtotal) + markup,
                total_tax: Number((_p = (_o = (_m = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _m === void 0 ? void 0 : _m.flightTotals) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.taxes),
                ait,
                discount: commission,
                payable: Number((_s = (_r = (_q = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _q === void 0 ? void 0 : _q.flightTotals) === null || _r === void 0 ? void 0 : _r[0]) === null || _s === void 0 ? void 0 : _s.total) +
                    markup +
                    ait +
                    markup -
                    commission,
                vendor_price: {
                    base_fare: Number((_v = (_u = (_t = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _t === void 0 ? void 0 : _t.flightTotals) === null || _u === void 0 ? void 0 : _u[0]) === null || _v === void 0 ? void 0 : _v.subtotal),
                    tax: Number((_y = (_x = (_w = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _w === void 0 ? void 0 : _w.flightTotals) === null || _x === void 0 ? void 0 : _x[0]) === null || _y === void 0 ? void 0 : _y.taxes),
                    charge: 0,
                    discount: 0,
                    gross_fare: Number((_1 = (_0 = (_z = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _z === void 0 ? void 0 : _z.flightTotals) === null || _0 === void 0 ? void 0 : _0[0]) === null || _1 === void 0 ? void 0 : _1.total),
                    net_fare: Number((_4 = (_3 = (_2 = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.payments) === null || _2 === void 0 ? void 0 : _2.flightTotals) === null || _3 === void 0 ? void 0 : _3[0]) === null || _4 === void 0 ? void 0 : _4.total),
                },
            };
            //flights
            const flights = yield Promise.all(sabre_response.journeys.map((journey, journeyIndex) => __awaiter(this, void 0, void 0, function* () {
                const flightGroup = sabre_response.flights.slice(sabre_response.flights.findIndex((_, i) => i ===
                    sabre_response.flights.findIndex((f) => f.fromAirportCode === journey.firstAirportCode &&
                        f.departureDate === journey.departureDate)), sabre_response.flights.findIndex((_, i) => i ===
                    sabre_response.flights.findIndex((f) => f.toAirportCode === journey.lastAirportCode &&
                        f.departureDate === journey.departureDate)) + 1);
                const options = yield Promise.all(flightGroup.map((flight, index) => __awaiter(this, void 0, void 0, function* () {
                    const dAirport = yield commonModel.getAirportDetails(flight.fromAirportCode);
                    const AAirport = yield commonModel.getAirportDetails(flight.toAirportCode);
                    return {
                        id: index + 1,
                        elapsedTime: flight.durationInMinutes,
                        stopCount: 0,
                        total_miles_flown: flight.distanceInMiles,
                        departure: {
                            airport_code: flight.fromAirportCode,
                            city_code: flight.fromAirportCode,
                            airport: dAirport.airport_name,
                            city: dAirport.city_name,
                            country: dAirport.country,
                            terminal: flight.departureTerminalName,
                            time: flight.departureTime,
                            date: flight.departureDate,
                        },
                        arrival: {
                            airport: AAirport.airport_name,
                            city: AAirport.city_name,
                            airport_code: flight.toAirportCode,
                            city_code: flight.toAirportCode,
                            country: AAirport.country,
                            time: flight.arrivalTime,
                            date: flight.arrivalDate,
                        },
                        carrier: {
                            carrier_marketing_code: flight.airlineCode,
                            carrier_marketing_airline: flight.airlineName,
                            carrier_marketing_logo: "",
                            carrier_marketing_flight_number: String(flight.flightNumber),
                            carrier_operating_code: flight.operatingAirlineCode,
                            carrier_operating_airline: flight.operatingAirlineName,
                            carrier_operating_logo: "",
                            carrier_operating_flight_number: String(flight.operatingFlightNumber),
                            carrier_aircraft_code: flight.aircraftTypeCode,
                            carrier_aircraft_name: flight.aircraftTypeName,
                        },
                    };
                })));
                return {
                    id: journeyIndex + 1,
                    stoppage: journey.numberOfFlights - 1,
                    elapsed_time: options.reduce((sum, o) => sum + o.elapsedTime, 0),
                    layover_time: options.length > 1
                        ? options.slice(1).map((opt, i) => {
                            const prev = options[i];
                            const layover = new Date(`${opt.departure.date}T${opt.departure.time}`).getTime() -
                                new Date(`${prev.arrival.date}T${prev.arrival.time}`).getTime();
                            return Math.floor(layover / 60000); // in minutes
                        })
                        : [0],
                    options,
                };
            })));
            //availability
            const availability = sabre_response.journeys.map((journey, journeyIndex) => {
                const journeyFlights = sabre_response.flights.filter((flight) => flight.departureDate === journey.departureDate &&
                    flight.travelerIndices.length > 0 && // ensure the flight belongs to a traveler
                    flight.fromAirportCode === journey.firstAirportCode);
                return {
                    from_airport: journey.firstAirportCode,
                    to_airport: journey.lastAirportCode,
                    segments: journeyFlights.map((flight, index) => {
                        const offer = sabre_response.fareOffers.find((fo) => fo.flights.some((f) => f.itemId === flight.itemId));
                        return {
                            name: `Segment-${index + 1}`,
                            passenger: flight.travelerIndices.map((travelerIndex) => {
                                var _a, _b, _c, _d;
                                const traveler = sabre_response.travelers[travelerIndex];
                                const fare = sabre_response.fares.find((f) => Array.isArray(f.fareConstruction) &&
                                    f.fareConstruction.some((fc) => Array.isArray(fc.flights) &&
                                        fc.flights.some((ff) => ff.itemId === flight.itemId)));
                                const baggage = ((_a = offer === null || offer === void 0 ? void 0 : offer.cabinBaggageAllowance) === null || _a === void 0 ? void 0 : _a.totalWeightInKilograms) ||
                                    ((_d = (_c = (_b = fare === null || fare === void 0 ? void 0 : fare.fareConstruction) === null || _b === void 0 ? void 0 : _b.find((fc) => Array.isArray(fc.flights) &&
                                        fc.flights.some((ff) => ff.itemId === flight.itemId))) === null || _c === void 0 ? void 0 : _c.checkedBaggageAllowance) === null || _d === void 0 ? void 0 : _d.totalWeightInKilograms) ||
                                    0;
                                return {
                                    type: traveler === null || traveler === void 0 ? void 0 : traveler.passengerCode,
                                    count: 1,
                                    cabin_code: flight.cabinTypeCode,
                                    cabin_type: flight.cabinTypeName,
                                    booking_code: flight.bookingClass,
                                    available_seat: flight.numberOfSeats,
                                    available_break: true,
                                    baggage_info: `${baggage} kg`,
                                };
                            }),
                        };
                    }),
                };
            });
            //passengers fare
            const passengers = [];
            const travelerTypeCounts = {};
            sabre_response.travelers.forEach((traveler) => {
                let type = traveler.passengerCode;
                if (type.startsWith("C")) {
                    type = "CHD";
                }
                if (!travelerTypeCounts[type]) {
                    travelerTypeCounts[type] = 0;
                }
                travelerTypeCounts[type]++;
            });
            for (const [type, number] of Object.entries(travelerTypeCounts)) {
                // Map CHD back to CNN to find the correct fare
                const fareMatchType = type === "CHD" ? "CNN" : type;
                const fare = sabre_response.fares.find((f) => f.pricedTravelerType === fareMatchType);
                if (fare) {
                    const subtotal = parseFloat(fare.totals.subtotal);
                    const tax = parseFloat(fare.totals.taxes);
                    const total = parseFloat(fare.totals.total);
                    passengers.push({
                        type,
                        number,
                        fare: {
                            base_fare: subtotal,
                            tax,
                            total_fare: total,
                        },
                    });
                }
            }
            //journey type
            let journey_type = "3";
            if (sabre_response.journeys.length === 1) {
                journey_type = "1";
            }
            else if (sabre_response.journeys.length === 2 &&
                sabre_response.journeys[0].lastAirportCode ===
                    sabre_response.journeys[1].firstAirportCode &&
                sabre_response.journeys[0].firstAirportCode ===
                    sabre_response.journeys[1].lastAirportCode) {
                journey_type = "2";
            }
            //airline pnr
            const confirmationIds = [
                ...new Set(sabre_response.flights.map((flight) => flight.confirmationId)),
            ];
            const airline_pnr = confirmationIds.join(",");
            //ticket issue last time
            let last_time = null;
            (_5 = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.specialServices) === null || _5 === void 0 ? void 0 : _5.map((elem) => {
                if (elem.code === "ADTK") {
                    last_time = elem.message;
                }
            });
            //status
            let status = flightConstants_1.FLIGHT_BOOKING_CONFIRMED;
            if (sabre_response.isTicketed) {
                status = flightConstants_1.FLIGHT_TICKET_ISSUE;
            }
            else if (sabre_response.startDate === undefined &&
                sabre_response.endDate === undefined) {
                status = flightConstants_1.FLIGHT_BOOKING_CANCELLED;
            }
            //passenger booking data
            const passenger_data = yield Promise.all((_6 = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.travelers) === null || _6 === void 0 ? void 0 : _6.map((elem, ind) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                const givenName = elem.givenName.split(" ");
                let reference = "";
                //split reference from given name
                if (givenName.length > 0) {
                    const lastPart = givenName[givenName.length - 1].toLowerCase();
                    const titles = [
                        "mr",
                        "ms",
                        "mrs",
                        "miss",
                        "mstr",
                        "master",
                        "mi",
                        "fi",
                        "misses",
                    ];
                    if (titles.includes(lastPart)) {
                        reference = lastPart;
                        givenName.pop();
                    }
                    else {
                        reference = "";
                    }
                }
                //get date of birth and gender from secure flight passenger data
                let date_of_birth;
                let gender;
                let passport_number;
                let passport_expiry_date;
                let nationality;
                let issuing_country;
                if (elem.type === "INFANT") {
                    const matchingTraveler = (_a = sabre_response === null || sabre_response === void 0 ? void 0 : sabre_response.travelers) === null || _a === void 0 ? void 0 : _a.find((trav) => {
                        var _a;
                        return (_a = trav.identityDocuments) === null || _a === void 0 ? void 0 : _a.some((identity_elem) => {
                            var _a;
                            return identity_elem.documentType ===
                                "SECURE_FLIGHT_PASSENGER_DATA" &&
                                ((_a = identity_elem.gender) === null || _a === void 0 ? void 0 : _a.startsWith("I")) &&
                                identity_elem.givenName === givenName.join(" ") &&
                                identity_elem.surname === elem.surname;
                        });
                    });
                    if (matchingTraveler) {
                        const matchedDocument = (_b = matchingTraveler === null || matchingTraveler === void 0 ? void 0 : matchingTraveler.identityDocuments) === null || _b === void 0 ? void 0 : _b.find((identity_elem) => {
                            var _a;
                            return identity_elem.documentType === "SECURE_FLIGHT_PASSENGER_DATA" &&
                                ((_a = identity_elem.gender) === null || _a === void 0 ? void 0 : _a.startsWith("I"));
                        });
                        date_of_birth = matchedDocument === null || matchedDocument === void 0 ? void 0 : matchedDocument.birthDate;
                        gender = matchedDocument === null || matchedDocument === void 0 ? void 0 : matchedDocument.gender.split("_")[1];
                        const matchedPassportDocument = (_c = matchingTraveler === null || matchingTraveler === void 0 ? void 0 : matchingTraveler.identityDocuments) === null || _c === void 0 ? void 0 : _c.find((identity_elem) => {
                            var _a;
                            return identity_elem.documentType === "PASSPORT" &&
                                ((_a = identity_elem.gender) === null || _a === void 0 ? void 0 : _a.startsWith("I"));
                        });
                        passport_number = matchedPassportDocument === null || matchedPassportDocument === void 0 ? void 0 : matchedPassportDocument.documentNumber;
                        passport_expiry_date = matchedPassportDocument === null || matchedPassportDocument === void 0 ? void 0 : matchedPassportDocument.expiryDate;
                        issuing_country = matchedPassportDocument === null || matchedPassportDocument === void 0 ? void 0 : matchedPassportDocument.issuingCountryCode;
                        nationality = matchedPassportDocument === null || matchedPassportDocument === void 0 ? void 0 : matchedPassportDocument.residenceCountryCode;
                    }
                }
                else {
                    const secure_flight_data = (_d = elem.identityDocuments) === null || _d === void 0 ? void 0 : _d.find((identity_elem) => identity_elem.documentType === "SECURE_FLIGHT_PASSENGER_DATA");
                    date_of_birth = secure_flight_data === null || secure_flight_data === void 0 ? void 0 : secure_flight_data.birthDate;
                    gender = secure_flight_data === null || secure_flight_data === void 0 ? void 0 : secure_flight_data.gender;
                    const passport_info = (_e = elem.identityDocuments) === null || _e === void 0 ? void 0 : _e.find((identity_elem) => identity_elem.documentType === "PASSPORT");
                    passport_number = passport_info === null || passport_info === void 0 ? void 0 : passport_info.documentNumber;
                    passport_expiry_date = passport_info === null || passport_info === void 0 ? void 0 : passport_info.expiryDate;
                    issuing_country = passport_info === null || passport_info === void 0 ? void 0 : passport_info.issuingCountryCode;
                    nationality = passport_info === null || passport_info === void 0 ? void 0 : passport_info.residenceCountryCode;
                }
                const issuing_country_data = yield commonModel.getCountryByIso({
                    iso3: issuing_country,
                });
                const nationality_data = yield commonModel.getCountryByIso({
                    iso3: nationality,
                });
                return {
                    key: String(ind),
                    type: elem.passengerCode,
                    reference: reference.toUpperCase(),
                    first_name: givenName.join(" "),
                    last_name: elem.surname,
                    phone: (_f = elem.phones) === null || _f === void 0 ? void 0 : _f[0].number,
                    date_of_birth: String(date_of_birth),
                    gender: String(gender),
                    email: (_g = elem.emails) === null || _g === void 0 ? void 0 : _g[0],
                    passport_number,
                    passport_expiry_date: passport_expiry_date
                        ? new Date(passport_expiry_date)
                        : undefined,
                    issuing_country: issuing_country_data === null || issuing_country_data === void 0 ? void 0 : issuing_country_data.id,
                    nationality: nationality_data === null || nationality_data === void 0 ? void 0 : nationality_data.id,
                };
            })));
            return {
                flight_details: {
                    flight_id: "",
                    api_search_id: "",
                    booking_block: false,
                    domestic_flight: false,
                    journey_type,
                    api: flightConstants_1.SABRE_API,
                    fare,
                    refundable: sabre_response.fareRules[0].isRefundable,
                    carrier_code: "",
                    carrier_name: "",
                    carrier_logo: "",
                    ticket_last_date: "",
                    ticket_last_time: "",
                    flights,
                    passengers,
                    availability,
                    leg_description,
                },
                gds_pnr: sabre_response.request.confirmationId,
                airline_pnr,
                last_time,
                status,
                passenger_data,
            };
        });
    }
    /////==================GET BOOKING(END)=========================//////////////
    /////////==================UTILS (START)=========================//////////
    // Get legs desc
    newGetLegsDesc(legItems, legDesc, OriginDest) {
        const legsDesc = [];
        for (const [index, leg_item] of legItems.entries()) {
            const leg_id = leg_item.ref;
            const legs = legDesc.find((legDecs) => legDecs.id === leg_id);
            if (legs) {
                const options = [];
                const date = OriginDest[index].DepartureDateTime;
                for (const option of legs.options) {
                    const { departureDateAdjustment } = option, rest = __rest(option, ["departureDateAdjustment"]);
                    let departure_date = new Date(date);
                    if (departureDateAdjustment) {
                        departure_date.setDate(departure_date.getDate() + Number(departureDateAdjustment));
                    }
                    let year = departure_date.getFullYear();
                    let month = String(departure_date.getMonth() + 1).padStart(2, "0");
                    let day = String(departure_date.getDate()).padStart(2, "0");
                    const departureDate = `${year}-${month}-${day}`;
                    const arrivalDate = new Date(departureDate);
                    if (option.arrival.date_adjustment) {
                        arrivalDate.setDate(arrivalDate.getDate() + option.arrival.date_adjustment);
                    }
                    const arrivalYear = arrivalDate.getFullYear();
                    const arrivalMonth = String(arrivalDate.getMonth() + 1).padStart(2, "0");
                    const arrivalDay = String(arrivalDate.getDate()).padStart(2, "0");
                    const formattedArrivalDate = `${arrivalYear}-${arrivalMonth}-${arrivalDay}`;
                    options.push(Object.assign(Object.assign({}, rest), { departure: Object.assign(Object.assign({}, option.departure), { date: departureDate }), arrival: Object.assign(Object.assign({}, option.arrival), { date: formattedArrivalDate }) }));
                }
                const layoverTime = this.getNewLayoverTime(options);
                legsDesc.push({
                    id: legs.id,
                    stoppage: options.length - 1,
                    elapsed_time: legs.elapsed_time,
                    layover_time: layoverTime,
                    options,
                });
            }
        }
        return legsDesc;
    }
}
exports.default = SabreFlightService;
