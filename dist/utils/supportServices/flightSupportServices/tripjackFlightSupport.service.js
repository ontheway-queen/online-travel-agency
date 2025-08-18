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
const uuid_1 = require("uuid");
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const commonFlightUtils_1 = __importDefault(require("../../lib/flightLib/commonFlightUtils"));
const tripjackRequest_1 = __importDefault(require("../../lib/flightLib/tripjackRequest"));
const constants_1 = require("../../miscellaneous/constants");
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
const tripjackApiEndpoints_1 = __importDefault(require("../../miscellaneous/flightMiscellaneous/tripjackApiEndpoints"));
const commonFlightSupport_service_1 = require("./commonFlightSupport.service");
const commonFlightUtils_2 = __importDefault(require("../../lib/flightLib/commonFlightUtils"));
class TripjackFlightSupportService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.request = new tripjackRequest_1.default();
        this.flightUtils = new commonFlightUtils_2.default();
        this.trx = trx;
        this.flightSupport = new commonFlightSupport_service_1.CommonFlightSupport(trx);
    }
    /////==================FLIGHT SEARCH (START)=========================//////
    FlightSearchReqBodyFormatter(body, dynamic_fare_supplier_id, route_type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
            // Preferred airlines
            const cappingAirlines = yield AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);
            const PreferredAirlines = cappingAirlines.map((elm) => elm.Code);
            let finalAirlineCodes = [];
            if ((_a = body.airline_code) === null || _a === void 0 ? void 0 : _a.length) {
                const reqAirlineCodes = body.airline_code.map((elm) => elm.Code);
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
            // Convert to desired format: { code: 'XX' }[]
            const airlineCodeObjects = finalAirlineCodes.map((code) => ({ code }));
            // cabin class
            const cabinMap = {
                '1': 'ECONOMY',
                '2': 'PREMIUM_ECONOMY',
                '3': 'BUSINESS',
                '4': 'FIRST',
            };
            const cabinClass = cabinMap[body.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin];
            // passenger info
            const paxInfo = body.PassengerTypeQuantity.reduce((acc, { Code, Quantity }) => {
                if (Code.startsWith('A'))
                    acc.ADULT += Quantity;
                else if (Code.startsWith('C'))
                    acc.CHILD += Quantity;
                else if (Code.startsWith('I'))
                    acc.INFANT += Quantity;
                return acc;
            }, { ADULT: 0, CHILD: 0, INFANT: 0 });
            const paxInfoStr = {
                ADULT: paxInfo.ADULT.toString(),
                CHILD: paxInfo.CHILD.toString(),
                INFANT: paxInfo.INFANT.toString(),
            };
            // flight route info
            const routeInfos = body.OriginDestinationInformation.map((elm) => ({
                fromCityOrAirport: { code: elm.OriginLocation.LocationCode },
                toCityOrAirport: { code: elm.DestinationLocation.LocationCode },
                travelDate: elm.DepartureDateTime.split('T')[0],
            }));
            return {
                searchQuery: {
                    cabinClass,
                    paxInfo: paxInfoStr,
                    routeInfos,
                    preferredAirline: (airlineCodeObjects === null || airlineCodeObjects === void 0 ? void 0 : airlineCodeObjects.length)
                        ? airlineCodeObjects
                        : undefined,
                },
            };
        });
    }
    //combines all the results
    combineTripInfos(tripInfos) {
        var _a, _b;
        if (tripInfos.COMBO)
            return tripInfos.COMBO;
        if (tripInfos.ONWARD &&
            !tripInfos.RETURN &&
            Object.keys(tripInfos).length === 1)
            return tripInfos.ONWARD;
        const onwardKey = 'ONWARD';
        const returnKey = 'RETURN';
        const onwardFlights = (_a = tripInfos[onwardKey]) !== null && _a !== void 0 ? _a : [];
        const returnFlights = (_b = tripInfos[returnKey]) !== null && _b !== void 0 ? _b : [];
        // Handle dynamic keys (e.g., "0", "1") by collecting keys that are not ONWARD, RETURN, or COMBO
        const dynamicKeys = Object.keys(tripInfos).filter((key) => !['ONWARD', 'RETURN', 'COMBO'].includes(key));
        let combinations = [];
        const combineFlights = (onwardList, returnList) => {
            onwardList.forEach((onward) => {
                const onwardArrival = new Date(onward.sI[onward.sI.length - 1].at).getTime();
                returnList.forEach((returnF) => {
                    const returnDeparture = new Date(returnF.sI[0].dt).getTime();
                    if (returnDeparture > onwardArrival) {
                        // Combine segments
                        const combinedSegments = [...onward.sI, ...returnF.sI];
                        const combinedPrices = [];
                        onward.totalPriceList.forEach((onwardPrice) => {
                            returnF.totalPriceList.forEach((returnPrice) => {
                                if (!onwardPrice.fd || !returnPrice.fd)
                                    return;
                                combinedPrices.push(Object.assign(Object.assign({}, onwardPrice), { fd: {
                                        ADULT: this.combineFareDetails(onwardPrice.fd.ADULT, returnPrice.fd.ADULT),
                                        CHILD: this.combineFareDetails(onwardPrice.fd.CHILD, returnPrice.fd.CHILD),
                                        INFANT: this.combineFareDetails(onwardPrice.fd.INFANT, returnPrice.fd.INFANT),
                                    }, 
                                    // Optional: add new fareIdentifier or id if needed
                                    fareIdentifier: `${onwardPrice.fareIdentifier}+${returnPrice.fareIdentifier}`, id: `${onwardPrice.id}+${returnPrice.id}` }));
                            });
                        });
                        combinations.push({
                            sI: combinedSegments,
                            totalPriceList: combinedPrices,
                            airFlowType: 'SEARCH',
                        });
                    }
                });
            });
        };
        if (onwardFlights.length && returnFlights.length) {
            combineFlights(onwardFlights, returnFlights);
        }
        // Handle dynamic leg-based multi-city trips
        if (dynamicKeys.length > 1) {
            const dynamicCombinations = this.combineDynamicLegs(tripInfos, dynamicKeys);
            if (dynamicCombinations.length)
                return dynamicCombinations;
        }
        return combinations.length
            ? combinations.slice(0, 10)
            : onwardFlights.slice(0, 10);
    }
    flightSearchResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_block, response, reqBody, dynamic_fare_supplier_id, route_type, }) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const commonModel = this.Model.commonModel(this.trx);
            const api_currency = yield this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(flightConstants_1.TRIPJACK_API, 'FLIGHT');
            const AirlinesPreferenceModel = this.Model.AirlinesPreferenceModel(this.trx);
            const getBlockedAirlinesPayload = {
                dynamic_fare_supplier_id,
                pref_type: 'BLOCKED',
                status: true
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
            const paxInfo = reqBody.PassengerTypeQuantity.reduce((acc, { Code, Quantity }) => {
                if (Code.startsWith('A'))
                    acc.ADULT += Quantity;
                else if (Code.startsWith('C'))
                    acc.CHILD += Quantity;
                else if (Code.startsWith('I'))
                    acc.INFANT += Quantity;
                return acc;
            }, { ADULT: 0, CHILD: 0, INFANT: 0 });
            let pax_count = 0;
            reqBody.PassengerTypeQuantity.map((reqPax) => {
                pax_count += reqPax.Quantity;
            });
            const formattedResponse = [];
            for (const flight_elm of response) {
                const flight_segments = flight_elm.sI;
                const fare = {
                    base_fare: 0,
                    total_tax: 0,
                    ait: 0,
                    discount: 0,
                    payable: 0,
                    vendor_price: {},
                };
                const flight_code = flight_segments[0].fD.aI.code;
                if (blockedAirlines.find((ba) => ba.Code === flight_code)) {
                    continue;
                }
                const career = yield commonModel.getAirlines(flight_code);
                // Calculate fare and set passenger array
                fare.base_fare +=
                    Number(((_b = flight_elm.totalPriceList[0].fd.ADULT) === null || _b === void 0 ? void 0 : _b.fC.BF) || 0) *
                        paxInfo.ADULT;
                fare.base_fare +=
                    Number(((_c = flight_elm.totalPriceList[0].fd.CHILD) === null || _c === void 0 ? void 0 : _c.fC.BF) || 0) *
                        paxInfo.CHILD;
                fare.base_fare +=
                    Number(((_d = flight_elm.totalPriceList[0].fd.INFANT) === null || _d === void 0 ? void 0 : _d.fC.BF) || 0) *
                        paxInfo.INFANT;
                fare.total_tax +=
                    Number(((_e = flight_elm.totalPriceList[0].fd.ADULT) === null || _e === void 0 ? void 0 : _e.fC.TAF) || 0) *
                        paxInfo.ADULT;
                fare.total_tax +=
                    Number(((_f = flight_elm.totalPriceList[0].fd.CHILD) === null || _f === void 0 ? void 0 : _f.fC.TAF) || 0) *
                        paxInfo.CHILD;
                fare.total_tax +=
                    Number(((_g = flight_elm.totalPriceList[0].fd.INFANT) === null || _g === void 0 ? void 0 : _g.fC.TAF) || 0) *
                        paxInfo.INFANT;
                fare.payable +=
                    Number(((_h = flight_elm.totalPriceList[0].fd.ADULT) === null || _h === void 0 ? void 0 : _h.fC.NF) || 0) *
                        paxInfo.ADULT;
                fare.payable +=
                    Number(((_j = flight_elm.totalPriceList[0].fd.CHILD) === null || _j === void 0 ? void 0 : _j.fC.NF) || 0) *
                        paxInfo.CHILD;
                fare.payable +=
                    Number(((_k = flight_elm.totalPriceList[0].fd.INFANT) === null || _k === void 0 ? void 0 : _k.fC.NF) || 0) *
                        paxInfo.INFANT;
                fare.ait = Math.round(((fare.base_fare + fare.total_tax) / 100) * 0.3);
                fare.vendor_price = {
                    base_fare: fare.base_fare,
                    tax: fare.total_tax,
                    charge: 0,
                    discount: 0,
                    gross_fare: fare.base_fare + fare.total_tax,
                    net_fare: fare.payable,
                };
                fare.base_fare *= api_currency;
                fare.total_tax *= api_currency;
                fare.payable *= api_currency;
                fare.ait *= api_currency;
                const fareTypes = [
                    { key: 'ADULT', type: 'ADT' },
                    { key: 'CHILD', type: 'CHD' },
                    { key: 'INFANT', type: 'INFANT' },
                ];
                //segment data
                let elapsed_time = 0;
                const paxSegment = yield Promise.all(flight_elm.sI.map((segment_elem) => __awaiter(this, void 0, void 0, function* () {
                    const marketing_airline = yield commonModel.getAirlines(segment_elem.fD.aI.code);
                    let operating_airline = marketing_airline;
                    elapsed_time += Number(segment_elem.duration);
                    const splittedDepDateTime = segment_elem.dt.split('T');
                    const splittedArrDateTime = segment_elem.at.split('T');
                    const dAirport = yield commonModel.getAirport(segment_elem.da.code);
                    const AAirport = yield commonModel.getAirport(segment_elem.aa.code);
                    const DCity = yield commonModel.getCity(segment_elem.da.cityCode);
                    const ACity = yield commonModel.getCity(segment_elem.aa.cityCode);
                    return {
                        id: Number(segment_elem.id),
                        elapsedTime: Number(segment_elem.duration),
                        segmentGroup: segment_elem.sN,
                        departure: {
                            airport_code: segment_elem.da.code,
                            airport: dAirport,
                            city: DCity,
                            city_code: segment_elem.da.cityCode,
                            country: dAirport.country,
                            terminal: segment_elem.da.terminal,
                            date: splittedDepDateTime[0],
                            time: splittedDepDateTime[1],
                        },
                        arrival: {
                            airport_code: segment_elem.aa.code,
                            airport: AAirport,
                            city: ACity,
                            city_code: segment_elem.aa.cityCode,
                            country: AAirport.country,
                            terminal: segment_elem.aa.terminal,
                            date: splittedArrDateTime[0],
                            time: splittedArrDateTime[1],
                        },
                        carrier: {
                            carrier_marketing_code: segment_elem.fD.aI.code,
                            carrier_marketing_airline: marketing_airline.name,
                            carrier_marketing_logo: marketing_airline.logo,
                            carrier_marketing_flight_number: segment_elem.fD.fN,
                            carrier_operating_code: segment_elem.fD.aI.code,
                            carrier_operating_airline: operating_airline.name,
                            carrier_operating_logo: operating_airline.logo,
                            carrier_operating_flight_number: segment_elem.fD.fN,
                            carrier_aircraft_code: '',
                            carrier_aircraft_name: '',
                        },
                    };
                })));
                //tax fare
                const tax_fare = Object.entries(flight_elm.totalPriceList[0].fd).map(([paxType, paxInfo]) => {
                    var _a;
                    const afC = ((_a = paxInfo.afC) === null || _a === void 0 ? void 0 : _a.TAF) || {}; // The breakdown of taxes
                    // Transform afC into the same format: [{ code, amount }]
                    const taxes = Object.entries(afC).map(([code, amount]) => ({
                        code,
                        amount
                    }));
                    return taxes;
                });
                let { tax_markup, tax_commission } = yield this.flightSupport.calculateFlightTaxMarkup({
                    dynamic_fare_supplier_id,
                    tax: tax_fare,
                    route_type,
                    airline: flight_code,
                });
                tax_commission = tax_commission * api_currency;
                tax_markup = tax_markup * api_currency;
                //calculate system markup
                const { markup, commission, pax_markup } = yield new commonFlightSupport_service_1.CommonFlightSupport(this.trx).calculateFlightMarkup({
                    dynamic_fare_supplier_id,
                    airline: flight_code,
                    base_fare: fare.base_fare,
                    total_segments: paxSegment.length,
                    flight_class: new commonFlightUtils_1.default().getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin),
                    route_type,
                });
                const total_pax_markup = pax_markup * pax_count;
                fare.base_fare += markup;
                fare.base_fare += total_pax_markup;
                fare.base_fare += tax_markup;
                fare.discount += commission;
                fare.discount += tax_commission;
                fare.payable =
                    Number((Number(fare.base_fare) +
                        fare.total_tax +
                        fare.ait -
                        Number(fare.discount)).toFixed(2));
                const passengers = fareTypes
                    .filter(({ key }) => paxInfo[key] > 0)
                    .map(({ key, type }) => {
                    var _a, _b, _c;
                    const fareData = ((_a = flight_elm.totalPriceList[0].fd[key]) === null || _a === void 0 ? void 0 : _a.fC) || {};
                    const per_pax_markup = ((markup + tax_markup) / pax_count) * Number(paxInfo[key]);
                    const total_pax_markup = pax_markup * Number(paxInfo[key]);
                    const paxBaseFare = Number((_b = fareData.BF) !== null && _b !== void 0 ? _b : 0) * api_currency +
                        per_pax_markup +
                        total_pax_markup;
                    const paxTax = Number((_c = fareData.TAF) !== null && _c !== void 0 ? _c : 0) * api_currency;
                    return {
                        type,
                        number: paxInfo[key],
                        fare: {
                            base_fare: Number(paxBaseFare.toFixed(2)),
                            tax: paxTax,
                            total_fare: Number((paxBaseFare + paxTax).toFixed(2)),
                        },
                    };
                });
                //calculate elapsed time, stoppage, segment data format
                let flights = [];
                let segment_ind = -1;
                for (let i = 0; i < paxSegment.length; i++) {
                    segment_ind =
                        paxSegment[i].segmentGroup === 0 ? ++segment_ind : segment_ind;
                    if (!flights[segment_ind]) {
                        flights[segment_ind] = {
                            id: 0,
                            elapsed_time: 0,
                            stoppage: -1,
                            options: [],
                            layover_time: [],
                        };
                    }
                    flights[segment_ind].id = segment_ind + 1;
                    flights[segment_ind].elapsed_time =
                        Number(flights[segment_ind].elapsed_time) +
                            Number(paxSegment[i].elapsedTime);
                    flights[segment_ind].stoppage++;
                    flights[segment_ind].options.push(paxSegment[i]);
                    flights[segment_ind].layover_time =
                        new commonFlightUtils_1.default().getNewLayoverTime(flights[segment_ind].options);
                }
                let ticketLastDateTimeSplitted = ['', ''];
                const availability = flights.map((leg_elm) => {
                    const segments = leg_elm.options.map((seg_elm, seg_ind) => {
                        const passengerTypes = [
                            { key: 'ADULT', label: 'ADT' },
                            { key: 'CHILD', label: 'CHD' },
                            { key: 'INFANT', label: 'INF' },
                        ];
                        const av_passengers = passengerTypes
                            .filter((pt) => paxInfo[pt.key] > 0)
                            .map((pt) => {
                            var _a, _b, _c;
                            const fd = flight_elm.totalPriceList[0].fd[pt.key];
                            const checkedBaggage = ((_a = fd === null || fd === void 0 ? void 0 : fd.bI) === null || _a === void 0 ? void 0 : _a.iB) || '-';
                            const cabinBaggage = ((_b = fd === null || fd === void 0 ? void 0 : fd.bI) === null || _b === void 0 ? void 0 : _b.cB) || '-';
                            return {
                                type: pt.label,
                                count: paxInfo[pt.key],
                                meal_type: undefined,
                                meal_code: undefined,
                                cabin_code: '',
                                cabin_type: (fd === null || fd === void 0 ? void 0 : fd.cc) || '',
                                booking_code: (fd === null || fd === void 0 ? void 0 : fd.cB) || '',
                                available_seat: (_c = fd === null || fd === void 0 ? void 0 : fd.sR) !== null && _c !== void 0 ? _c : undefined,
                                available_break: undefined,
                                baggage_info: `Checked: ${checkedBaggage}, Cabin: ${cabinBaggage}`,
                            };
                        });
                        return {
                            name: `Segment-${seg_ind + 1}`,
                            passenger: av_passengers,
                        };
                    });
                    return {
                        from_airport: leg_elm.options[0].departure.airport_code,
                        to_airport: leg_elm.options[leg_elm.options.length - 1].arrival.airport_code,
                        segments,
                    };
                });
                let partial_payment = {
                    partial_payment: false,
                    payment_percentage: 100,
                    travel_date_from_now: 0,
                };
                if (route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC) {
                    //domestic
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.TRIPJACK_API,
                        airline: flight_code,
                        refundable: Boolean((_l = flight_elm.totalPriceList[0].fd.ADULT) === null || _l === void 0 ? void 0 : _l.rT),
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        domestic: true,
                    });
                }
                else if (route_type === flightConstants_1.ROUTE_TYPE.FROM_DAC) {
                    //from dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.TRIPJACK_API,
                        airline: flight_code,
                        from_dac: true,
                        refundable: Boolean((_m = flight_elm.totalPriceList[0].fd.ADULT) === null || _m === void 0 ? void 0 : _m.rT),
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else if (route_type === flightConstants_1.ROUTE_TYPE.TO_DAC) {
                    //to dac
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.TRIPJACK_API,
                        airline: flight_code,
                        to_dac: true,
                        refundable: Boolean((_o = flight_elm.totalPriceList[0].fd.ADULT) === null || _o === void 0 ? void 0 : _o.rT),
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    });
                }
                else {
                    //soto
                    partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                        flight_api_name: flightConstants_1.TRIPJACK_API,
                        airline: flight_code,
                        refundable: Boolean((_p = flight_elm.totalPriceList[0].fd.ADULT) === null || _p === void 0 ? void 0 : _p.rT),
                        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                        soto: true,
                    });
                }
                formattedResponse.push({
                    api_search_id: flight_elm.totalPriceList[0].id,
                    booking_block,
                    flight_id: (0, uuid_1.v4)(),
                    journey_type: reqBody.JourneyType,
                    api: flightConstants_1.TRIPJACK_API,
                    partial_payment,
                    is_domestic_flight: route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC,
                    fare,
                    leg_description: [],
                    refundable: Boolean((_q = flight_elm.totalPriceList[0].fd.ADULT) === null || _q === void 0 ? void 0 : _q.rT),
                    carrier_code: flight_code,
                    carrier_name: career.name,
                    carrier_logo: career.logo,
                    ticket_last_date: ticketLastDateTimeSplitted[0] || '',
                    ticket_last_time: ticketLastDateTimeSplitted[1] || '',
                    flights,
                    passengers,
                    availability,
                });
            }
            return formattedResponse;
        });
    }
    FlightSearchService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_block, reqBody, dynamic_fare_supplier_id, }) {
            const route_type = this.flightSupport.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const flightRequestBody = yield this.FlightSearchReqBodyFormatter(reqBody, dynamic_fare_supplier_id, route_type);
            const response = yield this.request.postRequest(tripjackApiEndpoints_1.default.FLIGHT_SEARCH_ENDPOINT, flightRequestBody);
            if (!response) {
                return [];
            }
            const combinedData = this.combineTripInfos(response.searchResult.tripInfos);
            if (!combinedData.length) {
                return [];
            }
            const result = yield this.flightSearchResFormatter({
                booking_block,
                dynamic_fare_supplier_id,
                reqBody,
                response: combinedData,
                route_type,
            });
            return result;
        });
    }
    /////==================FLIGHT SEARCH (END)=========================///////
    /////==================FLIGHT REVALIDATE (START)=========================///////
    FlightRevalidateService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_block, reqBody, api_search_id, flight_id, dynamic_fare_supplier_id, }) {
            const revalidateReqBody = this.FlightRevalidateReqFormatter(api_search_id);
            const response = yield this.request.postRequest(tripjackApiEndpoints_1.default.FLIGHT_REVALIDATE_ENDPOINT, revalidateReqBody);
            if (!response) {
                throw new customError_1.default('The flight is not available', 404);
            }
            const formatted_response = yield this.FlightRevalidateResFormatter({
                dynamic_fare_supplier_id,
                booking_block,
                response,
                reqBody,
                flight_id,
                api_search_id,
            });
            return formatted_response;
        });
    }
    FlightRevalidateReqFormatter(api_search_id) {
        const priceIds = api_search_id.split(',');
        return {
            priceIds,
        };
    }
    FlightRevalidateResFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_block, response, reqBody, flight_id, dynamic_fare_supplier_id, }) {
            var _b, _c;
            const commonModel = this.Model.commonModel(this.trx);
            const api_currency = yield this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(flightConstants_1.TRIPJACK_API, 'FLIGHT');
            const route_type = this.flightSupport.routeTypeFinder({
                originDest: reqBody.OriginDestinationInformation,
            });
            const paxInfo = reqBody.PassengerTypeQuantity.reduce((acc, { Code, Quantity }) => {
                if (Code.startsWith('A'))
                    acc.ADULT += Quantity;
                else if (Code.startsWith('C'))
                    acc.CHILD += Quantity;
                else if (Code.startsWith('I'))
                    acc.INFANT += Quantity;
                return acc;
            }, { ADULT: 0, CHILD: 0, INFANT: 0 });
            const flights = [];
            const availability = [];
            const passengers = [];
            const fare = {
                base_fare: 0,
                total_tax: 0,
                ait: 0,
                discount: 0,
                payable: 0,
                vendor_price: {},
            };
            let pax_count = 0;
            reqBody.PassengerTypeQuantity.map((reqPax) => {
                pax_count += reqPax.Quantity;
            });
            const flight_code = response.tripInfos[0].sI[0].fD.aI.code;
            const career = yield commonModel.getAirlines(flight_code);
            const refundable = Boolean((_b = response.tripInfos[0].totalPriceList[0].fd.ADULT) === null || _b === void 0 ? void 0 : _b.rT);
            const price_changed = Boolean((_c = response.alerts) === null || _c === void 0 ? void 0 : _c.find((elm) => elm.type === 'FAREALERT'));
            yield Promise.all(response.tripInfos.map((flight_elm, flight_ind) => __awaiter(this, void 0, void 0, function* () {
                const flight_segments = flight_elm.sI;
                let elapsed_time = 0;
                const av_segment = [];
                const options = yield Promise.all(flight_segments.map((segment_elem, seg_ind) => __awaiter(this, void 0, void 0, function* () {
                    const passengerTypes = [
                        { key: 'ADULT', label: 'ADT' },
                        { key: 'CHILD', label: 'CHD' },
                        { key: 'INFANT', label: 'INF' },
                    ];
                    const av_passengers = passengerTypes
                        .filter((pt) => paxInfo[pt.key] > 0)
                        .map((pt) => {
                        var _a, _b, _c;
                        const fd = flight_elm.totalPriceList[0].fd[pt.key];
                        const checkedBaggage = ((_a = fd === null || fd === void 0 ? void 0 : fd.bI) === null || _a === void 0 ? void 0 : _a.iB) || '-';
                        const cabinBaggage = ((_b = fd === null || fd === void 0 ? void 0 : fd.bI) === null || _b === void 0 ? void 0 : _b.cB) || '-';
                        return {
                            type: pt.label,
                            count: paxInfo[pt.key],
                            meal_type: undefined,
                            meal_code: undefined,
                            cabin_code: '',
                            cabin_type: (fd === null || fd === void 0 ? void 0 : fd.cc) || '',
                            booking_code: (fd === null || fd === void 0 ? void 0 : fd.cB) || '',
                            available_seat: (_c = fd === null || fd === void 0 ? void 0 : fd.sR) !== null && _c !== void 0 ? _c : undefined,
                            available_break: undefined,
                            baggage_info: `Checked: ${checkedBaggage}, Cabin: ${cabinBaggage}`,
                        };
                    });
                    av_segment.push({
                        name: `Segment-${seg_ind + 1}`,
                        passenger: av_passengers,
                    });
                    const marketing_airline = yield commonModel.getAirlines(segment_elem.fD.aI.code);
                    const operating_airline = marketing_airline;
                    elapsed_time += Number(segment_elem.duration);
                    const [depDate, depTime] = segment_elem.dt.split('T');
                    const [arrDate, arrTime] = segment_elem.at.split('T');
                    const dAirport = yield commonModel.getAirport(segment_elem.da.code);
                    const AAirport = yield commonModel.getAirport(segment_elem.aa.code);
                    const DCity = yield commonModel.getCity(segment_elem.da.cityCode);
                    const ACity = yield commonModel.getCity(segment_elem.aa.cityCode);
                    //SSR
                    const meal = [];
                    const baggage = [];
                    if (segment_elem.ssrInfo) {
                        if (segment_elem.ssrInfo.MEAL && segment_elem.ssrInfo.MEAL.length) {
                            for (const meal_ssr of segment_elem.ssrInfo.MEAL) {
                                meal.push({
                                    code: meal_ssr.code,
                                    amount: Number(meal_ssr.amount) * api_currency,
                                    equivalent_amount: Number(meal_ssr.amount),
                                    desc: meal_ssr.desc
                                });
                            }
                        }
                        if (segment_elem.ssrInfo.BAGGAGE && segment_elem.ssrInfo.BAGGAGE.length) {
                            for (const baggage_ssr of segment_elem.ssrInfo.BAGGAGE) {
                                baggage.push({
                                    code: baggage_ssr.code,
                                    amount: Number(baggage_ssr.amount) * api_currency,
                                    equivalent_amount: Number(baggage_ssr.amount),
                                    desc: baggage_ssr.desc
                                });
                            }
                        }
                    }
                    return {
                        id: Number(segment_elem.id),
                        elapsedTime: Number(segment_elem.duration),
                        segmentGroup: segment_elem.sN,
                        departure: {
                            airport_code: segment_elem.da.code,
                            airport: dAirport,
                            city: DCity,
                            city_code: segment_elem.da.cityCode,
                            country: dAirport.country,
                            terminal: segment_elem.da.terminal,
                            date: depDate,
                            time: depTime,
                        },
                        arrival: {
                            airport_code: segment_elem.aa.code,
                            airport: AAirport,
                            city: ACity,
                            city_code: segment_elem.aa.cityCode,
                            country: AAirport.country,
                            terminal: segment_elem.aa.terminal,
                            date: arrDate,
                            time: arrTime,
                        },
                        carrier: {
                            carrier_marketing_code: segment_elem.fD.aI.code,
                            carrier_marketing_airline: marketing_airline.name,
                            carrier_marketing_logo: marketing_airline.logo,
                            carrier_marketing_flight_number: segment_elem.fD.fN,
                            carrier_operating_code: segment_elem.fD.aI.code,
                            carrier_operating_airline: operating_airline.name,
                            carrier_operating_logo: operating_airline.logo,
                            carrier_operating_flight_number: segment_elem.fD.fN,
                            carrier_aircraft_code: '',
                            carrier_aircraft_name: '',
                        },
                        ssr: {
                            meal,
                            baggage
                        }
                    };
                })));
                flights.push({
                    id: flight_ind + 1,
                    stoppage: options.length - 1,
                    elapsed_time,
                    layover_time: new commonFlightUtils_1.default().getNewLayoverTime(options),
                    options
                });
                const fareTypes = [
                    { key: 'ADULT', type: 'ADT' },
                    { key: 'CHILD', type: 'CHD' },
                    { key: 'INFANT', type: 'INFANT' },
                ];
                fareTypes
                    .filter(({ key }) => paxInfo[key] > 0)
                    .forEach(({ key, type }) => {
                    var _a, _b, _c, _d;
                    const fareData = ((_a = flight_elm.totalPriceList[0].fd[key]) === null || _a === void 0 ? void 0 : _a.fC) || {};
                    const count = paxInfo[key];
                    const baseFare = Number((_b = fareData.BF) !== null && _b !== void 0 ? _b : 0) * api_currency;
                    const tax = Number((_c = fareData.TAF) !== null && _c !== void 0 ? _c : 0) * api_currency;
                    const totalFare = Number((_d = fareData.TF) !== null && _d !== void 0 ? _d : 0) * api_currency;
                    const existingPassenger = passengers.find((pass_elm) => pass_elm.type === type);
                    if (existingPassenger) {
                        existingPassenger.fare.base_fare += baseFare;
                        existingPassenger.fare.tax += tax;
                        existingPassenger.fare.total_fare += totalFare;
                    }
                    else {
                        passengers.push({
                            type,
                            number: count,
                            fare: {
                                base_fare: baseFare,
                                tax: tax,
                                total_fare: totalFare,
                            },
                        });
                    }
                });
                availability.push({
                    from_airport: options[0].departure.airport_code,
                    to_airport: options[options.length - 1].arrival.airport_code,
                    segments: av_segment,
                });
            })));
            // Fare Calculation
            // fare.base_fare +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.ADULT?.fC.BF || 0) *
            //   paxInfo.ADULT;
            // fare.base_fare +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.CHILD?.fC.BF || 0) *
            //   paxInfo.CHILD;
            // fare.base_fare +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.INFANT?.fC.BF || 0) *
            //   paxInfo.INFANT;
            // fare.total_tax +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.ADULT?.fC.TAF || 0) *
            //   paxInfo.ADULT;
            // fare.total_tax +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.CHILD?.fC.TAF || 0) *
            //   paxInfo.CHILD;
            // fare.total_tax +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.INFANT?.fC.TAF || 0) *
            //   paxInfo.INFANT;
            // fare.payable +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.ADULT?.fC.NF || 0) *
            //   paxInfo.ADULT;
            // fare.payable +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.CHILD?.fC.NF || 0) *
            //   paxInfo.CHILD;
            // fare.payable +=
            //   Number(response.tripInfos[0].totalPriceList[0].fd.INFANT?.fC.NF || 0) *
            //   paxInfo.INFANT;
            fare.base_fare = Number(response.totalPriceInfo.totalFareDetail.fC.BF);
            fare.total_tax = Number(response.totalPriceInfo.totalFareDetail.fC.TAF);
            fare.payable = Number(response.totalPriceInfo.totalFareDetail.fC.NF);
            fare.ait = Math.round(((fare.base_fare + fare.total_tax) / 100) * 0.3);
            fare.vendor_price = {
                base_fare: response.totalPriceInfo.totalFareDetail.fC.BF,
                tax: response.totalPriceInfo.totalFareDetail.fC.TAF,
                charge: 0,
                discount: 0,
                gross_fare: response.totalPriceInfo.totalFareDetail.fC.TF,
                net_fare: response.totalPriceInfo.totalFareDetail.fC.TF,
            };
            //currency conversion
            fare.base_fare *= api_currency;
            fare.total_tax *= api_currency;
            fare.payable *= api_currency;
            fare.ait *= api_currency;
            let total_segments = 0;
            flights.map((elm) => {
                elm.options.map((elm2) => {
                    total_segments++;
                });
            });
            //calculate tax markup
            //tax fare
            const tax_fare = Object.entries(response.tripInfos[0].totalPriceList[0].fd).map(([paxType, paxInfo]) => {
                var _a;
                const afC = ((_a = paxInfo.afC) === null || _a === void 0 ? void 0 : _a.TAF) || {}; // The breakdown of taxes
                // Transform afC into the same format: [{ code, amount }]
                const taxes = Object.entries(afC).map(([code, amount]) => ({
                    code,
                    amount
                }));
                return taxes;
            });
            let { tax_markup, tax_commission } = yield this.flightSupport.calculateFlightTaxMarkup({
                dynamic_fare_supplier_id,
                tax: tax_fare,
                route_type,
                airline: flight_code,
            });
            tax_commission = tax_commission * api_currency;
            tax_markup = tax_markup * api_currency;
            //calculate system markup
            const { markup, commission, pax_markup } = yield new commonFlightSupport_service_1.CommonFlightSupport(this.trx).calculateFlightMarkup({
                dynamic_fare_supplier_id,
                airline: flight_code,
                base_fare: fare.base_fare,
                total_segments: total_segments,
                flight_class: new commonFlightUtils_1.default().getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin),
                route_type,
            });
            const total_pax_markup = pax_markup * pax_count;
            fare.base_fare += markup;
            fare.base_fare += total_pax_markup;
            fare.base_fare += tax_markup;
            fare.discount += commission;
            fare.discount += tax_commission;
            fare.payable =
                Number((Number(fare.base_fare) +
                    fare.total_tax +
                    fare.ait -
                    Number(fare.discount)).toFixed(2));
            let partial_payment = {
                partial_payment: false,
                payment_percentage: 100,
                travel_date_from_now: 0,
            };
            if (route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC) {
                //domestic
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.TRIPJACK_API,
                    airline: flight_code,
                    refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    domestic: true,
                });
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.FROM_DAC) {
                //from dac
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.TRIPJACK_API,
                    airline: flight_code,
                    from_dac: true,
                    refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                });
            }
            else if (route_type === flightConstants_1.ROUTE_TYPE.TO_DAC) {
                //to dac
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.TRIPJACK_API,
                    airline: flight_code,
                    to_dac: true,
                    refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                });
            }
            else {
                //soto
                partial_payment = yield this.Model.PartialPaymentRuleModel(this.trx).getPartialPaymentCondition({
                    flight_api_name: flightConstants_1.TRIPJACK_API,
                    airline: flight_code,
                    refundable,
                    travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                    soto: true,
                });
            }
            const newPaxes = passengers.map((exPax) => {
                const per_pax_markup = ((markup + tax_markup) / pax_count) * Number(exPax.number);
                const total_pax_markup = pax_markup * Number(exPax.number);
                const paxBaseFare = per_pax_markup + total_pax_markup;
                return {
                    type: exPax.type,
                    number: exPax.number,
                    fare: {
                        base_fare: Number((exPax.fare.base_fare + per_pax_markup).toFixed(2)),
                        tax: exPax.fare.tax,
                        total_fare: Number((paxBaseFare + exPax.fare.base_fare + exPax.fare.tax).toFixed(2)),
                    },
                };
            });
            return {
                flight_id,
                api_search_id: response.bookingId,
                booking_block,
                price_changed,
                leg_description: [],
                partial_payment,
                direct_ticket_issue: response.conditions.isBA === false ? true : false,
                domestic_flight: route_type === flightConstants_1.ROUTE_TYPE.DOMESTIC,
                journey_type: reqBody.JourneyType,
                api: flightConstants_1.TRIPJACK_API,
                fare,
                refundable,
                carrier_code: flight_code,
                carrier_name: career.name,
                carrier_logo: career.logo,
                ticket_last_date: '',
                ticket_last_time: '',
                flights,
                passengers: newPaxes,
                availability,
            };
        });
    }
    /////==================FLIGHT REVALIDATE (END)=========================///////
    /////==================FARE RULES (START)=========================///////
    FlightFareRulesReqFormatter(api_search_id) {
        return {
            id: api_search_id,
            flowType: 'SEARCH',
        };
    }
    FareRulesService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ api_search_id }) {
            const reqBody = this.FlightFareRulesReqFormatter(api_search_id);
            const response = yield this.request.postRequest(tripjackApiEndpoints_1.default.FARE_RULES_ENDPOINT, reqBody);
            if (!response) {
                return false;
            }
            const formatterRes = this.FareRulesResFormatter(response);
            return formatterRes;
        });
    }
    FareRulesResFormatter(data) {
        var _a, _b;
        const fareRuleKey = Object.keys((_a = data === null || data === void 0 ? void 0 : data.fareRule) !== null && _a !== void 0 ? _a : {})[0];
        const rule = (_b = data === null || data === void 0 ? void 0 : data.fareRule) === null || _b === void 0 ? void 0 : _b[fareRuleKey];
        // Format 1: Contains miscInfo
        if (Array.isArray(rule === null || rule === void 0 ? void 0 : rule.miscInfo)) {
            return rule.miscInfo
                .map((rtf) => {
                return rtf
                    .replace(/\\par(?:\r\n)?/g, '<br>')
                    .replace(/\\[a-z]+\d* ?/g, '')
                    .replace(/{|}/g, '')
                    .replace(/[\r\n]+/g, '');
            })
                .join('<br><br>');
        }
        // Format 2 and 3: Contains tfr
        if ((rule === null || rule === void 0 ? void 0 : rule.tfr) && typeof rule.tfr === 'object') {
            let paragraph = '';
            for (const [category, policies] of Object.entries(rule.tfr)) {
                paragraph += `<b>${category === null || category === void 0 ? void 0 : category.replace(/_/g, ' ')}</b><br>`;
                if (Array.isArray(policies)) {
                    for (const policy of policies) {
                        const lines = [];
                        if (policy === null || policy === void 0 ? void 0 : policy.pp)
                            lines.push(`When: ${policy.pp}`);
                        if (policy === null || policy === void 0 ? void 0 : policy.policyInfo)
                            lines.push(`Policy: ${policy.policyInfo}`);
                        if ((policy === null || policy === void 0 ? void 0 : policy.amount) != null)
                            lines.push(`Penalty Amount: ${policy.amount}`);
                        if ((policy === null || policy === void 0 ? void 0 : policy.additionalFee) != null)
                            lines.push(`Additional Fee: ${policy.additionalFee}`);
                        if ((policy === null || policy === void 0 ? void 0 : policy.fcs) && typeof policy.fcs === 'object') {
                            const fcsDetails = Object.entries(policy.fcs)
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(', ');
                            lines.push(`Fare Components: ${fcsDetails}`);
                        }
                        paragraph += lines.join('<br>') + '<br><br>';
                    }
                }
            }
            return paragraph.trim();
        }
        return false;
    }
    /////==================FARE RULES (END)=========================///////
    /////================FLIGHT BOOKING (START)====================//////////////
    FlightBookingService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_payload, revalidate_data, direct_issue, ssr }) {
            var _b;
            const reqBody = yield this.FlightBookingReqFormatter({
                booking_payload,
                revalidate_data,
                direct_issue,
                ssr
            });
            const response = yield this.request.postRequest(tripjackApiEndpoints_1.default.FLIGHT_BOOKING_ENDPOINT, reqBody);
            if (!response || !((_b = response === null || response === void 0 ? void 0 : response.status) === null || _b === void 0 ? void 0 : _b.success) === true) {
                return false;
            }
            return true;
        });
    }
    FlightBookingReqFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_payload, revalidate_data, direct_issue, ssr }) {
            var _b;
            const travellerInfo = yield Promise.all(booking_payload.passengers.map((passenger) => __awaiter(this, void 0, void 0, function* () {
                let additional_info = undefined;
                if (passenger.passport_number) {
                    const nationality = yield this.Model.commonModel(this.trx).getAllCountry({
                        id: Number(passenger.nationality),
                    });
                    additional_info = {
                        dob: passenger.date_of_birth,
                        pNat: nationality[0].iso,
                        pNum: passenger.passport_number,
                        eD: passenger.passport_expiry_date,
                        pid: passenger.passport_issuing_date
                    };
                }
                const passengerSsrs = (ssr === null || ssr === void 0 ? void 0 : ssr.filter((ssr_elm) => String(ssr_elm.passenger_key) === String(passenger.key))) || [];
                let ssrBaggageInfos = [];
                let ssrMealInfos = [];
                if (passengerSsrs.length) {
                    passengerSsrs.map((elm) => {
                        if (elm.type === 'baggage') {
                            ssrBaggageInfos.push({
                                key: elm.segment_id,
                                code: elm.code
                            });
                        }
                        else if (elm.type === 'meal') {
                            ssrMealInfos.push({
                                key: elm.segment_id,
                                code: elm.code
                            });
                        }
                    });
                }
                return {
                    ti: this.getTravelerTitle({
                        reference: passenger.reference,
                        type: passenger.type,
                        gender: passenger.gender,
                    }),
                    fN: passenger.first_name,
                    lN: passenger.last_name,
                    pt: this.getTravelerType(passenger.type),
                    additional_info,
                    ssrBaggageInfos,
                    ssrMealInfos
                };
            })));
            let amount = Number((_b = revalidate_data.fare.vendor_price) === null || _b === void 0 ? void 0 : _b.net_fare);
            if (direct_issue) {
                if (ssr && ssr.length) {
                    ssr.forEach((ssr_elm) => {
                        revalidate_data.flights.forEach((flight) => {
                            flight.options.forEach((option) => {
                                var _a, _b, _c, _d;
                                if (option.id === ssr_elm.segment_id) {
                                    if (ssr_elm.type === 'meal') {
                                        if (((_a = option.ssr) === null || _a === void 0 ? void 0 : _a.meal) && ((_b = option.ssr) === null || _b === void 0 ? void 0 : _b.meal.length)) {
                                            option.ssr.meal.forEach((meal) => {
                                                if (meal.code === ssr_elm.code) {
                                                    amount += Number(meal.equivalent_amount || 0);
                                                }
                                            });
                                        }
                                    }
                                    else if (ssr_elm.type === 'baggage') {
                                        if (((_c = option.ssr) === null || _c === void 0 ? void 0 : _c.baggage) && ((_d = option.ssr) === null || _d === void 0 ? void 0 : _d.baggage.length)) {
                                            option.ssr.baggage.forEach((baggage) => {
                                                if (baggage.code === ssr_elm.code) {
                                                    amount += Number(baggage.equivalent_amount || 0);
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        });
                    });
                }
            }
            return {
                bookingId: revalidate_data.api_search_id,
                paymentInfos: direct_issue
                    ? [
                        {
                            amount: amount,
                        },
                    ]
                    : undefined,
                travellerInfo,
                deliveryInfo: {
                    emails: [constants_1.PROJECT_EMAIL_API_1],
                    contacts: [booking_payload.passengers[0].contact_number],
                },
            };
        });
    }
    /////================FLIGHT BOOKING (END)====================//////////////
    /////=========TICKET ISSUE (START)============//////////////////
    TicketIssueService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ api_booking_ref, vendor_total_price, }) {
            var _b, _c;
            //phase 1 - confirm fare
            const confirm_fare_response = yield this.request.postRequest(tripjackApiEndpoints_1.default.CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT, {
                bookingId: api_booking_ref,
            });
            if (!confirm_fare_response ||
                !((_b = confirm_fare_response === null || confirm_fare_response === void 0 ? void 0 : confirm_fare_response.status) === null || _b === void 0 ? void 0 : _b.success) === true) {
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_WARNING,
                    message: 'Error from tripjack while ticket issue',
                    url: tripjackApiEndpoints_1.default.CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT,
                    http_method: 'POST',
                    metadata: {
                        api: flightConstants_1.TRIPJACK_API,
                        endpoint: tripjackApiEndpoints_1.default.CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT,
                        payload: {
                            bookingId: api_booking_ref,
                        },
                        response: confirm_fare_response,
                    },
                });
                return {
                    success: false,
                    message: "Fare is not available for this booking. Please contact with the support team for more details!",
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                };
            }
            //phase 2 - ticket issue
            const ticket_issue_response = yield this.request.postRequest(tripjackApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT, {
                bookingId: api_booking_ref,
                paymentInfos: [
                    {
                        amount: vendor_total_price,
                    },
                ],
            });
            if (!ticket_issue_response ||
                !((_c = ticket_issue_response === null || ticket_issue_response === void 0 ? void 0 : ticket_issue_response.status) === null || _c === void 0 ? void 0 : _c.success) === true) {
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_WARNING,
                    message: 'Error from tripjack while ticket issue',
                    url: tripjackApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT,
                    http_method: 'POST',
                    metadata: {
                        api: flightConstants_1.TRIPJACK_API,
                        endpoint: tripjackApiEndpoints_1.default.TICKET_ISSUE_ENDPOINT,
                        payload: {
                            bookingId: api_booking_ref,
                            paymentInfos: [
                                {
                                    amount: vendor_total_price,
                                },
                            ],
                        },
                        response: ticket_issue_response,
                    },
                });
                return {
                    success: false,
                    message: "Ticket cannot be issued now. Please contact with the support team for more details!",
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Ticket has been issued',
            };
        });
    }
    /////=========TICKET ISSUE (END)============//////////////////
    //////=========RETRIEVE BOOKING(START)==============//////////////
    RetrieveBookingService(api_booking_ref) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.request.postRequest(tripjackApiEndpoints_1.default.RETRIEVE_BOOKING_ENDPOINT, {
                bookingId: api_booking_ref,
            });
            if (!response) {
                throw new customError_1.default('No booking has been found with this ID', this.StatusCode.HTTP_NOT_FOUND);
            }
            let gds_pnr = undefined;
            let airline_pnr = undefined;
            let ticket_numbers = [];
            let gross_fare = response.order.amount;
            const travellers = response.itemInfos.AIR.travellerInfos;
            if (travellers && travellers.length > 0) {
                const firstTraveller = travellers[0];
                // Get first gds_pnr if exists
                if (firstTraveller.gdsPnrs) {
                    const gdsPnrValues = Object.values(firstTraveller.gdsPnrs);
                    if (gdsPnrValues.length > 0) {
                        gds_pnr = gdsPnrValues[0];
                    }
                }
                // Get unique airline_pnr values
                if (firstTraveller.pnrDetails) {
                    const pnrValues = Object.values(firstTraveller.pnrDetails);
                    const uniquePnrValues = [...new Set(pnrValues)];
                    airline_pnr = uniquePnrValues.join(',');
                }
                // Push first ticket number from each traveller
                travellers.forEach((traveller) => {
                    if (traveller.ticketNumberDetails) {
                        const ticketValues = Object.values(traveller.ticketNumberDetails);
                        if (ticketValues.length > 0) {
                            ticket_numbers.push(ticketValues[0]);
                        }
                    }
                });
            }
            if (!gds_pnr && airline_pnr) {
                gds_pnr = airline_pnr;
            }
            let status = flightConstants_1.FLIGHT_BOOKING_CONFIRMED;
            if (response.order.status.toUpperCase() === "SUCCESS") {
                status = flightConstants_1.FLIGHT_TICKET_ISSUE;
            }
            else if (response.order.status.toUpperCase() === "ON_HOLD") {
                status = flightConstants_1.FLIGHT_BOOKING_ON_HOLD;
            }
            else if (response.order.status.toUpperCase() === "CANCELLED") {
                status = flightConstants_1.FLIGHT_BOOKING_CANCELLED;
            }
            return {
                gds_pnr,
                airline_pnr,
                ticket_numbers,
                gross_fare,
                status
            };
        });
    }
    pnrShareService(api_booking_ref, dynamic_fare_supplier_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30;
            const response = yield this.request.postRequest(tripjackApiEndpoints_1.default.RETRIEVE_BOOKING_ENDPOINT, {
                bookingId: api_booking_ref,
            });
            if (!response) {
                throw new customError_1.default('No booking has been found with this ID', this.StatusCode.HTTP_NOT_FOUND);
            }
            const commonModel = this.Model.commonModel(this.trx);
            const airports = [];
            let total_segments = 0;
            const leg_description = (_b = (_a = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _a === void 0 ? void 0 : _a.AIR) === null || _b === void 0 ? void 0 : _b.tripInfos.map((item) => {
                const firstAirport = item.sI[0].da.code;
                const lastAirport = item.sI[item.sI.length - 1].aa.code;
                total_segments += item.sI.length;
                airports.push(firstAirport);
                airports.push(lastAirport);
                return {
                    departureLocation: firstAirport,
                    arrivalLocation: lastAirport,
                    departureDate: item.sI[0].dt,
                };
            });
            const route_type = this.flightSupport.routeTypeFinder({
                airportsPayload: airports,
            });
            const airline_code = (_h = (_g = (_f = (_e = (_d = (_c = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _c === void 0 ? void 0 : _c.AIR) === null || _d === void 0 ? void 0 : _d.tripInfos[0]) === null || _e === void 0 ? void 0 : _e.sI[0]) === null || _f === void 0 ? void 0 : _f.fD) === null || _g === void 0 ? void 0 : _g.aI) === null || _h === void 0 ? void 0 : _h.code;
            //fare
            const api_currency = yield this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(flightConstants_1.TRIPJACK_API, 'FLIGHT');
            const { markup, commission, pax_markup } = yield this.flightSupport.calculateFlightMarkup({
                dynamic_fare_supplier_id,
                airline: airline_code,
                flight_class: (_m = (_l = (_k = (_j = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _j === void 0 ? void 0 : _j.AIR) === null || _k === void 0 ? void 0 : _k.travellerInfos[0]) === null || _l === void 0 ? void 0 : _l.fd) === null || _m === void 0 ? void 0 : _m.cc,
                base_fare: Number((_r = (_q = (_p = (_o = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _o === void 0 ? void 0 : _o.AIR) === null || _p === void 0 ? void 0 : _p.totalPriceInfo.totalFareDetail) === null || _q === void 0 ? void 0 : _q.fC) === null || _r === void 0 ? void 0 : _r.BF) * api_currency,
                total_segments,
                route_type,
            });
            const ait = Math.round(((Number((_v = (_u = (_t = (_s = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _s === void 0 ? void 0 : _s.AIR) === null || _t === void 0 ? void 0 : _t.totalPriceInfo.totalFareDetail) === null || _u === void 0 ? void 0 : _u.fC) === null || _v === void 0 ? void 0 : _v.TF) * api_currency) / 100) * 0.3);
            const fare = {
                base_fare: (Number((_z = (_y = (_x = (_w = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _w === void 0 ? void 0 : _w.AIR) === null || _x === void 0 ? void 0 : _x.totalPriceInfo.totalFareDetail) === null || _y === void 0 ? void 0 : _y.fC) === null || _z === void 0 ? void 0 : _z.BF) * api_currency) + markup + pax_markup,
                total_tax: (Number((_3 = (_2 = (_1 = (_0 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _0 === void 0 ? void 0 : _0.AIR) === null || _1 === void 0 ? void 0 : _1.totalPriceInfo.totalFareDetail) === null || _2 === void 0 ? void 0 : _2.fC) === null || _3 === void 0 ? void 0 : _3.TAF) * api_currency),
                ait,
                discount: commission,
                payable: (Number((_7 = (_6 = (_5 = (_4 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _4 === void 0 ? void 0 : _4.AIR) === null || _5 === void 0 ? void 0 : _5.totalPriceInfo.totalFareDetail) === null || _6 === void 0 ? void 0 : _6.fC) === null || _7 === void 0 ? void 0 : _7.TF) * api_currency) +
                    markup +
                    ait +
                    pax_markup -
                    commission,
                vendor_price: {
                    base_fare: Number((_11 = (_10 = (_9 = (_8 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _8 === void 0 ? void 0 : _8.AIR) === null || _9 === void 0 ? void 0 : _9.totalPriceInfo.totalFareDetail) === null || _10 === void 0 ? void 0 : _10.fC) === null || _11 === void 0 ? void 0 : _11.BF),
                    tax: Number((_15 = (_14 = (_13 = (_12 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _12 === void 0 ? void 0 : _12.AIR) === null || _13 === void 0 ? void 0 : _13.totalPriceInfo.totalFareDetail) === null || _14 === void 0 ? void 0 : _14.fC) === null || _15 === void 0 ? void 0 : _15.TAF),
                    charge: 0,
                    discount: 0,
                    gross_fare: Number((_19 = (_18 = (_17 = (_16 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _16 === void 0 ? void 0 : _16.AIR) === null || _17 === void 0 ? void 0 : _17.totalPriceInfo.totalFareDetail) === null || _18 === void 0 ? void 0 : _18.fC) === null || _19 === void 0 ? void 0 : _19.TF),
                    net_fare: Number((_23 = (_22 = (_21 = (_20 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _20 === void 0 ? void 0 : _20.AIR) === null || _21 === void 0 ? void 0 : _21.totalPriceInfo.totalFareDetail) === null || _22 === void 0 ? void 0 : _22.fC) === null || _23 === void 0 ? void 0 : _23.NF),
                },
            };
            const flights = yield Promise.all((_25 = (_24 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _24 === void 0 ? void 0 : _24.AIR) === null || _25 === void 0 ? void 0 : _25.tripInfos.map((journey, journeyIndex) => __awaiter(this, void 0, void 0, function* () {
                const flightGroup = journey.sI;
                const options = yield Promise.all(flightGroup.map((flight, index) => __awaiter(this, void 0, void 0, function* () {
                    // Using the direct data from payload — so no DB call unless you need it
                    // But I’ll keep your `commonModel` usage if you still want live DB data
                    const dAirport = yield commonModel.getAirportDetails(flight.da.code);
                    const aAirport = yield commonModel.getAirportDetails(flight.aa.code);
                    return {
                        id: index + 1,
                        elapsedTime: flight.duration,
                        stopCount: flight.stops,
                        total_miles_flown: null, // Not present in this payload
                        departure: {
                            airport_code: flight.da.code,
                            city_code: flight.da.cityCode,
                            airport: dAirport.airport_name,
                            city: dAirport.city_name,
                            country: dAirport.country,
                            terminal: flight.da.terminal || null,
                            time: flight.dt.split("T")[1],
                            date: flight.dt.split("T")[0],
                        },
                        arrival: {
                            airport_code: flight.aa.code,
                            city_code: flight.aa.cityCode,
                            airport: aAirport.airport_name,
                            city: aAirport.city_name,
                            country: aAirport.country,
                            terminal: flight.aa.terminal || null,
                            time: flight.at.split("T")[1],
                            date: flight.at.split("T")[0],
                        },
                        carrier: {
                            carrier_marketing_code: flight.fD.aI.code,
                            carrier_marketing_airline: flight.fD.aI.name,
                            carrier_marketing_logo: "",
                            carrier_marketing_flight_number: String(flight.fD.fN),
                            carrier_operating_code: flight.fD.aI.code,
                            carrier_operating_airline: flight.fD.aI.name,
                            carrier_operating_logo: "",
                            carrier_operating_flight_number: String(flight.fD.fN),
                            carrier_aircraft_code: flight.fD.eT,
                            carrier_aircraft_name: "",
                        },
                    };
                })));
                return {
                    id: journeyIndex + 1,
                    stoppage: options.length - 1,
                    elapsed_time: options.reduce((sum, o) => sum + o.elapsedTime, 0),
                    layover_time: options.length > 1
                        ? options.slice(1).map((opt, i) => {
                            const prev = options[i];
                            const layover = new Date(`${opt.departure.date}T${opt.departure.time}`).getTime() -
                                new Date(`${prev.arrival.date}T${prev.arrival.time}`).getTime();
                            return Math.floor(layover / 60000);
                        })
                        : [0],
                    options,
                };
            })));
            const availability = response === null || response === void 0 ? void 0 : response.itemInfos.AIR.tripInfos.map((journey) => {
                return {
                    from_airport: journey.sI[0].da.code,
                    to_airport: journey.sI[journey.sI.length - 1].aa.code,
                    segments: journey.sI.map((segment, index) => {
                        var _a, _b, _c, _d, _e;
                        const traveler = response === null || response === void 0 ? void 0 : response.itemInfos.AIR.travellerInfos[0];
                        const routeKey = `${segment.da.code}-${segment.aa.code}`;
                        const baggage = ((_b = (_a = traveler.fd) === null || _a === void 0 ? void 0 : _a.bI) === null || _b === void 0 ? void 0 : _b.iB) || "0KG";
                        return {
                            name: `Segment-${index + 1}`,
                            passenger: [
                                {
                                    type: traveler.pt, // e.g., ADULT
                                    count: 1,
                                    cabin_code: (_c = traveler.fd) === null || _c === void 0 ? void 0 : _c.cc,
                                    cabin_type: (_d = traveler.fd) === null || _d === void 0 ? void 0 : _d.cB, // e.g., 'T'
                                    booking_code: (_e = traveler.fd) === null || _e === void 0 ? void 0 : _e.fB, // e.g., 'TU2YXRDC'
                                    available_seat: null,
                                    available_break: true,
                                    baggage_info: baggage,
                                },
                            ],
                        };
                    }),
                };
            });
            //passengers fare
            const travelerTypeCounts = {};
            response === null || response === void 0 ? void 0 : response.itemInfos.AIR.travellerInfos.forEach((traveler) => {
                let type = traveler.pt;
                if (type.toUpperCase().startsWith("C")) {
                    type = "CHILD";
                }
                if (!travelerTypeCounts[type]) {
                    travelerTypeCounts[type] = 0;
                }
                travelerTypeCounts[type]++;
            });
            const passengers = [];
            for (const [type, number] of Object.entries(travelerTypeCounts)) {
                const fareMatchType = type;
                const fare = response === null || response === void 0 ? void 0 : response.itemInfos.AIR.travellerInfos.find((traveler) => traveler.pt === fareMatchType);
                if (fare) {
                    const subtotal = fare.fd.fC.BF; // base fare
                    const tax = Number(fare.fd.fC.TF) - Number(fare.fd.fC.BF);
                    const total = fare.fd.fC.TF;
                    passengers.push({
                        type,
                        number,
                        fare: {
                            base_fare: Number(subtotal),
                            tax,
                            total_fare: total,
                        },
                    });
                }
            }
            let journey_type = "3"; // default MULTICITY
            const journeys = response === null || response === void 0 ? void 0 : response.itemInfos.AIR.tripInfos;
            if (journeys.length === 1) {
                journey_type = "1"; // ONEWAY
            }
            else if (journeys.length === 2 &&
                journeys[0].sI[journeys[0].sI.length - 1].aa.code === journeys[1].sI[0].da.code &&
                journeys[0].sI[0].da.code === journeys[1].sI[journeys[1].sI.length - 1].aa.code) {
                journey_type = "2"; // RETURN
            }
            //pnr
            let gds_pnr = "N/A";
            let airline_pnr = "N/A";
            if (response.itemInfos.AIR.travellerInfos && response.itemInfos.AIR.travellerInfos.length > 0) {
                const firstTraveller = response.itemInfos.AIR.travellerInfos[0];
                // Get first gds_pnr if exists
                if (firstTraveller.gdsPnrs) {
                    const gdsPnrValues = Object.values(firstTraveller.gdsPnrs);
                    if (gdsPnrValues.length > 0) {
                        gds_pnr = gdsPnrValues[0];
                    }
                }
                // Get unique airline_pnr values
                if (firstTraveller.pnrDetails) {
                    const pnrValues = Object.values(firstTraveller.pnrDetails);
                    const uniquePnrValues = [...new Set(pnrValues)];
                    airline_pnr = uniquePnrValues.join(',');
                }
            }
            if (!gds_pnr && airline_pnr) {
                gds_pnr = airline_pnr;
            }
            let status = flightConstants_1.FLIGHT_BOOKING_CONFIRMED;
            if (response.order.status.toUpperCase() === "SUCCESS") {
                status = flightConstants_1.FLIGHT_TICKET_ISSUE;
            }
            else if (response.order.status.toUpperCase() === "ON_HOLD") {
                status = flightConstants_1.FLIGHT_BOOKING_ON_HOLD;
            }
            else if (response.order.status.toUpperCase() === "CANCELLED") {
                status = flightConstants_1.FLIGHT_BOOKING_CANCELLED;
            }
            const passenger_data = yield Promise.all(response === null || response === void 0 ? void 0 : response.itemInfos.AIR.travellerInfos.map((traveler, ind) => __awaiter(this, void 0, void 0, function* () {
                const givenName = traveler.fN;
                const reference = traveler.ti;
                const date_of_birth = traveler.dob;
                const gender = (reference === null || reference === void 0 ? void 0 : reference.toLowerCase()) === "mr" ? "Male" : "Female";
                const passport_number = traveler.pNum;
                const passport_expiry_date = traveler.eD;
                const nationality = traveler.pNat;
                const issuing_country = traveler.pNat;
                const issuing_country_data = yield commonModel.getCountryByIso({
                    iso3: issuing_country,
                });
                const nationality_data = yield commonModel.getCountryByIso({
                    iso3: nationality,
                });
                // ✅ FIX: map type correctly
                let passengerType;
                switch (traveler.pt.toUpperCase()) {
                    case "ADULT":
                        passengerType = "ADT";
                        break;
                    case "CHILD":
                        passengerType = "CHD";
                        break;
                    case "INFANT":
                        passengerType = "INF";
                        break;
                    default:
                        passengerType = "ADT"; // fallback
                }
                return {
                    key: String(ind),
                    type: passengerType, // ✅ corrected type
                    reference: reference,
                    first_name: givenName,
                    last_name: traveler.lN,
                    phone: "",
                    date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                    gender: gender,
                    email: "",
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
                    price_changed: false,
                    partial_payment: {
                        partial_payment: false,
                        payment_percentage: 100,
                        travel_date_from_now: 0,
                    },
                    direct_ticket_issue: false,
                    booking_block: false,
                    domestic_flight: false,
                    journey_type,
                    api: flightConstants_1.TRIPJACK_API,
                    fare,
                    refundable: Boolean((_30 = (_29 = (_28 = (_27 = (_26 = response === null || response === void 0 ? void 0 : response.itemInfos) === null || _26 === void 0 ? void 0 : _26.AIR) === null || _27 === void 0 ? void 0 : _27.travellerInfos) === null || _28 === void 0 ? void 0 : _28[0]) === null || _29 === void 0 ? void 0 : _29.fd) === null || _30 === void 0 ? void 0 : _30.rT),
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
                gds_pnr,
                airline_pnr,
                last_time: null,
                status,
                passenger_data,
            };
        });
    }
    //////=========RETRIEVE BOOKING(END)==============//////////////
    /////////==========CANCEL BOOKING(START)==============///////////
    CancelBookingService(api_booking_ref, airline_pnr) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const pnrs = airline_pnr.split(',');
            const response = yield this.request.postRequest(tripjackApiEndpoints_1.default.CANCEL_BOOKING_ENDPOINT, {
                bookingId: api_booking_ref,
                pnrs,
            });
            if (!response || !((_a = response === null || response === void 0 ? void 0 : response.status) === null || _a === void 0 ? void 0 : _a.success) === true) {
                throw new customError_1.default('Booking cannot be cancelled now. Please contact with the support team for more details!', this.StatusCode.HTTP_BAD_REQUEST);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Booking has been cancelled',
            };
        });
    }
    /////////==========CANCEL BOOKING(END)==============///////////
    /////////utils/////////////
    combineFareDetails(fare1, fare2) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15;
        if (!fare1 && !fare2)
            return undefined;
        if (!fare1)
            return fare2;
        if (!fare2)
            return fare1;
        return Object.assign(Object.assign({}, fare1), { fC: {
                NF: ((_b = (_a = fare1.fC) === null || _a === void 0 ? void 0 : _a.NF) !== null && _b !== void 0 ? _b : 0) + ((_d = (_c = fare2.fC) === null || _c === void 0 ? void 0 : _c.NF) !== null && _d !== void 0 ? _d : 0),
                BF: ((_f = (_e = fare1.fC) === null || _e === void 0 ? void 0 : _e.BF) !== null && _f !== void 0 ? _f : 0) + ((_h = (_g = fare2.fC) === null || _g === void 0 ? void 0 : _g.BF) !== null && _h !== void 0 ? _h : 0),
                TAF: ((_k = (_j = fare1.fC) === null || _j === void 0 ? void 0 : _j.TAF) !== null && _k !== void 0 ? _k : 0) + ((_m = (_l = fare2.fC) === null || _l === void 0 ? void 0 : _l.TAF) !== null && _m !== void 0 ? _m : 0),
                TF: ((_p = (_o = fare1.fC) === null || _o === void 0 ? void 0 : _o.TF) !== null && _p !== void 0 ? _p : 0) + ((_r = (_q = fare2.fC) === null || _q === void 0 ? void 0 : _q.TF) !== null && _r !== void 0 ? _r : 0),
            }, afC: {
                TAF: {
                    YQ: ((_u = (_t = (_s = fare1.afC) === null || _s === void 0 ? void 0 : _s.TAF) === null || _t === void 0 ? void 0 : _t.YQ) !== null && _u !== void 0 ? _u : 0) + ((_x = (_w = (_v = fare2.afC) === null || _v === void 0 ? void 0 : _v.TAF) === null || _w === void 0 ? void 0 : _w.YQ) !== null && _x !== void 0 ? _x : 0),
                    YR: ((_0 = (_z = (_y = fare1.afC) === null || _y === void 0 ? void 0 : _y.TAF) === null || _z === void 0 ? void 0 : _z.YR) !== null && _0 !== void 0 ? _0 : 0) + ((_3 = (_2 = (_1 = fare2.afC) === null || _1 === void 0 ? void 0 : _1.TAF) === null || _2 === void 0 ? void 0 : _2.YR) !== null && _3 !== void 0 ? _3 : 0),
                    OT: ((_6 = (_5 = (_4 = fare1.afC) === null || _4 === void 0 ? void 0 : _4.TAF) === null || _5 === void 0 ? void 0 : _5.OT) !== null && _6 !== void 0 ? _6 : 0) + ((_9 = (_8 = (_7 = fare2.afC) === null || _7 === void 0 ? void 0 : _7.TAF) === null || _8 === void 0 ? void 0 : _8.OT) !== null && _9 !== void 0 ? _9 : 0),
                },
            }, sR: Math.min((_10 = fare1.sR) !== null && _10 !== void 0 ? _10 : Infinity, (_11 = fare2.sR) !== null && _11 !== void 0 ? _11 : Infinity), bI: {
                iB: ((_12 = fare1.bI) === null || _12 === void 0 ? void 0 : _12.iB) || ((_13 = fare2.bI) === null || _13 === void 0 ? void 0 : _13.iB),
                cB: ((_14 = fare1.bI) === null || _14 === void 0 ? void 0 : _14.cB) || ((_15 = fare2.bI) === null || _15 === void 0 ? void 0 : _15.cB),
            }, rT: 1, cc: fare1.cc, cB: fare1.cB, fB: fare1.fB });
    }
    combineDynamicLegs(tripInfos, dynamicKeys) {
        const allLegFlights = dynamicKeys.map((k) => tripInfos[k] || []);
        const combinations = [];
        const buildCombination = (level, currentSegments, currentPrices, lastArrival) => {
            if (level === allLegFlights.length) {
                combinations.push({
                    sI: currentSegments,
                    totalPriceList: currentPrices,
                    airFlowType: 'SEARCH',
                });
                return;
            }
            for (const flight of allLegFlights[level]) {
                const firstSegment = flight.sI[0];
                if (lastArrival &&
                    new Date(firstSegment.dt).getTime() <= new Date(lastArrival).getTime()) {
                    continue; // skip invalid (departure before last arrival)
                }
                const lastSeg = flight.sI[flight.sI.length - 1];
                const updatedSegments = [...currentSegments, ...flight.sI];
                const combinedPrices = this.combinePriceLists(currentPrices, flight.totalPriceList);
                buildCombination(level + 1, updatedSegments, combinedPrices, lastSeg.at);
            }
        };
        for (const flight of allLegFlights[0]) {
            const lastSeg = flight.sI[flight.sI.length - 1];
            buildCombination(1, [...flight.sI], [...flight.totalPriceList], lastSeg.at);
        }
        return combinations.slice(0, 10); // Limit for testing
    }
    // Helper to combine totalPriceList arrays
    combinePriceLists(prices1, prices2) {
        const result = [];
        for (const p1 of prices1) {
            for (const p2 of prices2) {
                if (!p1.fd || !p2.fd)
                    continue;
                result.push(Object.assign(Object.assign({}, p1), { fd: {
                        ADULT: this.combineFareDetails(p1.fd.ADULT, p2.fd.ADULT),
                        CHILD: this.combineFareDetails(p1.fd.CHILD, p2.fd.CHILD),
                        INFANT: this.combineFareDetails(p1.fd.INFANT, p2.fd.INFANT),
                    }, fareIdentifier: `${p1.fareIdentifier}+${p2.fareIdentifier}`, id: `${p1.id},${p2.id}` }));
            }
        }
        return result;
    }
    //get traveler title
    getTravelerTitle({ reference, type, gender, }) {
        if (type === 'ADT') {
            return reference;
        }
        else {
            if (gender === 'Male') {
                return 'Master';
            }
            else {
                return 'Ms';
            }
        }
    }
    //get traveler type
    getTravelerType(type) {
        if (type === 'ADT') {
            return 'ADULT';
        }
        else if (type === 'INF') {
            return 'INFANT';
        }
        else {
            return 'CHILD';
        }
    }
}
exports.default = TripjackFlightSupportService;
