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
const database_1 = require("../../../app/database");
const redis_1 = require("../../../app/redis");
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const commonFlightSupport_service_1 = require("../../../utils/supportServices/flightSupportServices/commonFlightSupport.service");
const sabreFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const sendBookingMailSupport_service_1 = require("../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service");
const travelportRestFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/travelportRestFlightSupport.service"));
const tripjackFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service"));
const verteilFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service"));
const flightBookingCancelTemplates_1 = require("../../../utils/templates/flightBookingCancelTemplates");
const flightBookingHoldTemplate_1 = require("../../../utils/templates/flightBookingHoldTemplate");
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const BtoBFlightBookingSubService_1 = require("./subServices/BtoBFlightBookingSubService");
const payment_service_1 = require("./subServices/payment.service");
class AgentFlightService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Flight search
    flightSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { agency_id, ref_id, id: user_id } = req.agency;
                const body = req.body;
                const apiAirlinesCommission = this.Model.commissionSetModel(trx);
                const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                //get commission set id
                const agency_info = yield this.Model.agencyModel(trx).getSingleAgency(ref_id ? ref_id : agency_id);
                if (!agency_info[0].commission_set_id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                console.log({ commission_id: agency_info[0].commission_set_id });
                // const apiData = await apiAirlinesCommission.getSetFlightAPI({
                //   status: true,
                //   set_id: agency_info[0].commission_set_id,
                // });
                const apiData = yield dynamicFareModel.getSuppliers({
                    set_id: agency_info[0].commission_set_id,
                    status: true,
                });
                console.log({
                    apiData,
                    agency_info: agency_info[0],
                });
                // Route block codes will be written here. Then Find all the airlines and send with booking block or full block to ResFormatter. if no airlines found just route full block then don't call ResFormatter just return empty array. If just booking block then send empty array to resFormatter of airlines and write booking block to every itins
                const block_routes = yield flightRouteConfigModel.getBlockRoute({
                    status: true,
                    departure: body.OriginDestinationInformation[0].OriginLocation.LocationCode,
                    arrival: body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
                    one_way: body.JourneyType === '1' || body.JourneyType === '3' ? true : undefined,
                    round_trip: body.JourneyType === '2' ? true : undefined,
                });
                //if full block is true then return empty array
                if ((_a = block_routes.data[0]) === null || _a === void 0 ? void 0 : _a.full_block) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: this.ResMsg.HTTP_OK,
                        data: {
                            search_id: '',
                            journey_type: body.JourneyType,
                            leg_descriptions: [],
                            total: 0,
                            results: [],
                        },
                    };
                }
                // //test
                // const zenithSoapApiFlightSupport = new ZenithSoapApiFlightSupport();
                // const data = await zenithSoapApiFlightSupport.FlightSearchService({
                //   dynamic_fare_supplier_id: 1,
                //   booking_block: true,
                //   reqBody: body
                // })
                // console.log({ data });
                // return{
                //   code:200,
                //   data
                // };
                //if booking block is true then make the variable true
                let booking_block = false;
                if ((_b = block_routes.data[0]) === null || _b === void 0 ? void 0 : _b.booking_block) {
                    booking_block = true;
                }
                let sabre_set_flight_api_id = 0;
                let verteil_set_flight_api_id = 0;
                let tripjack_set_flight_api_id = 0;
                let travelport_rest_set_flight_api_id = 0;
                console.log({ apiData });
                apiData.forEach((item) => {
                    if (item.api === flightConstants_1.SABRE_API) {
                        sabre_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.VERTEIL_API) {
                        verteil_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.TRIPJACK_API) {
                        tripjack_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.TRAVELPORT_REST_API) {
                        travelport_rest_set_flight_api_id = item.id;
                    }
                });
                console.log({
                    sabre_set_flight_api_id,
                    verteil_set_flight_api_id,
                    tripjack_set_flight_api_id,
                    travelport_rest_set_flight_api_id,
                });
                let sabreData = [];
                let verteilData = [];
                let tripjackData = [];
                let travelportRestData = [];
                const search_id = (0, uuid_1.v4)();
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    sabreData = yield sabreSubService.FlightSearch({
                        booking_block,
                        reqBody: body,
                        dynamic_fare_supplier_id: sabre_set_flight_api_id,
                        search_id
                    });
                }
                if (verteil_set_flight_api_id) {
                    const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                    verteilData = yield verteilSubService.FlightSearchService({
                        booking_block,
                        reqBody: body,
                        dynamic_fare_supplier_id: verteil_set_flight_api_id,
                        search_id,
                    });
                }
                if (tripjack_set_flight_api_id) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    tripjackData = yield tripjackSubService.FlightSearchService({
                        booking_block,
                        reqBody: body,
                        dynamic_fare_supplier_id: tripjack_set_flight_api_id,
                    });
                }
                // if (travelport_rest_set_flight_api_id) {
                //   const travelportSubService = new TravelportRestFlightService(trx);
                //   travelportRestData = await travelportSubService.FlightSearchService({
                //     booking_block,
                //     reqBody: body,
                //     dynamic_fare_supplier_id: travelport_rest_set_flight_api_id,
                //   });
                // }
                // Add Leg Description with response data
                const leg_descriptions = body.OriginDestinationInformation.map((OrDeInfo) => {
                    return {
                        departureDate: OrDeInfo.DepartureDateTime,
                        departureLocation: OrDeInfo.OriginLocation.LocationCode,
                        arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
                    };
                });
                //insert flight search
                yield new commonFlightSupport_service_1.CommonFlightSupport(trx).insertFlightSearchHistory({
                    search_body: body,
                    leg_description: leg_descriptions,
                    agency_id,
                    user_id,
                });
                const results = [...sabreData, ...verteilData, ...tripjackData, ...travelportRestData];
                // results.sort((a, b) => a.fare.payable - b.fare.payable);
                const responseData = {
                    search_id,
                    journey_type: body.JourneyType,
                    leg_descriptions,
                    total: results.length,
                    results,
                };
                //save data to redis
                const dataForStore = {
                    reqBody: body,
                    response: responseData,
                };
                yield (0, redis_1.setRedis)(search_id, dataForStore);
                // console.log(responseData);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: responseData,
                };
            }));
        });
    }
    //Flight search using Server Sent Events(SSE)
    FlightSearchSSE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { agency_id, ref_id, id: user_id } = req.agency;
                const JourneyType = req.query.JourneyType;
                const promotion_code = req.query.promotion_code;
                const OriginDestinationInformation = req.query.OriginDestinationInformation;
                const PassengerTypeQuantity = req.query.PassengerTypeQuantity;
                const airline_code = req.query.airline_code;
                const body = {
                    JourneyType,
                    OriginDestinationInformation,
                    PassengerTypeQuantity,
                    airline_code,
                    promotion_code,
                };
                const leg_descriptions = body.OriginDestinationInformation.map((OrDeInfo) => {
                    return {
                        departureDate: OrDeInfo.DepartureDateTime,
                        departureLocation: OrDeInfo.OriginLocation.LocationCode,
                        arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
                    };
                });
                //insert flight search
                yield new commonFlightSupport_service_1.CommonFlightSupport(trx).insertFlightSearchHistory({
                    search_body: body,
                    leg_description: leg_descriptions,
                    agency_id,
                    user_id,
                });
                const apiAirlinesCommission = this.Model.commissionSetModel(trx);
                const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);
                //get commission set id
                const agency_info = yield this.Model.agencyModel(trx).getSingleAgency(ref_id ? ref_id : agency_id);
                if (!agency_info[0].commission_set_id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                const commission_set_id = agency_info[0].commission_set_id;
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const apiData = yield dynamicFareModel.getSuppliers({
                    set_id: agency_info[0].commission_set_id,
                    status: true,
                });
                const block_routes = yield flightRouteConfigModel.getBlockRoute({
                    status: true,
                    departure: body.OriginDestinationInformation[0].OriginLocation.LocationCode,
                    arrival: body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
                    one_way: body.JourneyType === '1' || body.JourneyType === '3' ? true : undefined,
                    round_trip: body.JourneyType === '2' ? true : undefined,
                });
                // Return empty data if full block is true
                if ((_a = block_routes.data[0]) === null || _a === void 0 ? void 0 : _a.full_block) {
                    res.write(`data: ${JSON.stringify({
                        search_id: '',
                        journey_type: body.JourneyType,
                        leg_descriptions: [],
                        total: 0,
                        results: [],
                    })}\n\n`);
                    return;
                }
                let booking_block = false;
                if ((_b = block_routes.data[0]) === null || _b === void 0 ? void 0 : _b.booking_block) {
                    booking_block = true;
                }
                // Extract API IDs
                let sabre_set_flight_api_id = 0;
                let verteil_set_flight_api_id = 0;
                let tripjack_set_flight_api_id = 0;
                let travelport_rest_set_flight_api_id = 0;
                apiData.forEach((item) => {
                    if (item.api === flightConstants_1.SABRE_API) {
                        sabre_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.VERTEIL_API) {
                        verteil_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.TRIPJACK_API) {
                        tripjack_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.TRAVELPORT_REST_API) {
                        travelport_rest_set_flight_api_id = item.id;
                    }
                });
                // Generate search ID
                const search_id = (0, uuid_1.v4)();
                res.write('event: search_info\n');
                res.write(`data: ${JSON.stringify({
                    search_id,
                    leg_description: leg_descriptions,
                })}\n\n`);
                // Initialize Redis storage
                const responseData = {
                    search_id,
                    journey_type: JourneyType,
                    leg_descriptions,
                    total: 0,
                    results: [],
                };
                yield (0, redis_1.setRedis)(search_id, { reqBody: body, response: responseData });
                // res.write('event: flight_results\n');
                const data = [];
                // Query each API and stream results
                const sendResults = (apiName, fetchResults) => __awaiter(this, void 0, void 0, function* () {
                    const results = yield fetchResults();
                    // Update results list and Redis
                    responseData.results.push(...results);
                    responseData.total = responseData.results.length;
                    // Stream results to client
                    results.forEach((result) => {
                        data.push(result);
                        res.write(`data: ${JSON.stringify(result)}\n\n`);
                    });
                    // Update Redis after receiving results
                    yield (0, redis_1.setRedis)(search_id, { reqBody: body, response: responseData });
                });
                const tasks = [];
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    tasks.push(sendResults('Sabre', () => __awaiter(this, void 0, void 0, function* () {
                        return sabreSubService.FlightSearch({
                            booking_block: booking_block,
                            reqBody: JSON.parse(JSON.stringify(body)),
                            dynamic_fare_supplier_id: sabre_set_flight_api_id,
                            search_id
                        });
                    })));
                }
                if (verteil_set_flight_api_id) {
                    const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                    tasks.push(sendResults('Verteil', () => __awaiter(this, void 0, void 0, function* () {
                        return verteilSubService.FlightSearchService({
                            booking_block: booking_block,
                            reqBody: JSON.parse(JSON.stringify(body)),
                            dynamic_fare_supplier_id: verteil_set_flight_api_id,
                            search_id,
                        });
                    })));
                }
                if (tripjack_set_flight_api_id) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    tasks.push(sendResults('Tripjack', () => __awaiter(this, void 0, void 0, function* () {
                        return tripjackSubService.FlightSearchService({
                            booking_block,
                            reqBody: JSON.parse(JSON.stringify(body)),
                            dynamic_fare_supplier_id: tripjack_set_flight_api_id,
                        });
                    })));
                }
                if (travelport_rest_set_flight_api_id) {
                    const travelportRestSubService = new travelportRestFlightSupport_service_1.default(trx);
                    tasks.push(sendResults('Travelport_Rest', () => __awaiter(this, void 0, void 0, function* () {
                        return travelportRestSubService.FlightSearchService({
                            booking_block,
                            reqBody: JSON.parse(JSON.stringify(body)),
                            dynamic_fare_supplier_id: travelport_rest_set_flight_api_id,
                        });
                    })));
                }
                // Run all tasks in parallel
                yield Promise.all(tasks);
            }));
        });
    }
    //get airline list
    getAirlineList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, ref_id } = req.agency;
                const agency_info = yield this.Model.agencyModel(trx).getSingleAgency(ref_id ? ref_id : agency_id);
                const apiAirlinesCommission = this.Model.commissionSetModel(trx);
                const commissionModel = this.Model.apiAirlinesCommissionModel(trx);
                const apiData = yield apiAirlinesCommission.getSetFlightAPI({
                    status: true,
                    set_id: agency_info[0].commission_set_id,
                });
                let sabre_set_flight_api_id = 0;
                let nztrip_set_flight_api_id = 0;
                apiData.forEach((item) => {
                    if (item.api_name === flightConstants_1.SABRE_API) {
                        sabre_set_flight_api_id = item.id;
                    }
                });
                const sabreAirlines = yield commissionModel.getAPIActiveAirlinesName(sabre_set_flight_api_id);
                const nztripAirlines = yield commissionModel.getAPIActiveAirlinesName(nztrip_set_flight_api_id);
                // Combine and filter unique airlines
                const airlineMap = new Map();
                [sabreAirlines, nztripAirlines].flat().forEach((airline) => {
                    airlineMap.set(airline.Code, airline);
                });
                const cappingAirlines = Array.from(airlineMap.values());
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: cappingAirlines || [],
                };
            }));
        });
    }
    // Flight Revalidate
    flightRevalidate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, ref_id } = req.agency;
                const { flight_id, search_id } = req.query;
                //get commission set id
                const agency_info = yield this.Model.agencyModel(trx).getSingleAgency(ref_id ? ref_id : agency_id);
                if (!agency_info[0].commission_set_id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                const data = yield this.flightSubRevalidate(search_id, flight_id, agency_info[0].commission_set_id);
                // const isDomesticFlight =
                //   data?.flights[0].options[0].arrival.country ===
                //   data?.flights[0].options[0].departure.country
                //     ? true
                //     : false;
                if (data) {
                    yield (0, redis_1.setRedis)(`${flightConstants_1.FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
                    return {
                        success: true,
                        message: 'Ticket has been revalidated successfully!',
                        data,
                        code: this.StatusCode.HTTP_OK,
                    };
                }
                return {
                    success: false,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }));
        });
    }
    //Flight sub revalidate
    flightSubRevalidate(search_id, flight_id, commission_set_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                //get data from redis using the search id
                const retrievedData = yield (0, redis_1.getRedis)(search_id);
                if (!retrievedData) {
                    return null;
                }
                const retrieveResponse = retrievedData.response;
                const foundItem = retrieveResponse.results.find((item) => item.flight_id === flight_id);
                if (!foundItem) {
                    return null;
                }
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const apiData = yield dynamicFareModel.getSuppliers({
                    status: true,
                    set_id: commission_set_id,
                    api_name: foundItem.api,
                });
                let booking_block = foundItem.booking_block;
                if (foundItem.api === flightConstants_1.SABRE_API) {
                    //SABRE REVALIDATE
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    const formattedResBody = yield sabreSubService.SabreFlightRevalidate(retrievedData.reqBody, foundItem, apiData[0].id, flight_id, booking_block, search_id);
                    formattedResBody[0].leg_description = retrievedData.response.leg_descriptions;
                    return formattedResBody[0];
                }
                else if (foundItem.api === flightConstants_1.VERTEIL_API) {
                    const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                    const formattedResBody = yield verteilSubService.FlightRevalidateService({
                        search_id: search_id,
                        reqBody: retrievedData.reqBody,
                        oldData: foundItem,
                        dynamic_fare_supplier_id: apiData[0].id,
                    });
                    return formattedResBody[0];
                }
                else if (foundItem.api === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    const formattedResBody = yield tripjackSubService.FlightRevalidateService({
                        reqBody: retrievedData.reqBody,
                        dynamic_fare_supplier_id: apiData[0].id,
                        booking_block,
                        api_search_id: foundItem.api_search_id,
                        flight_id,
                    });
                    formattedResBody.leg_description =
                        retrievedData.response.leg_descriptions;
                    return formattedResBody;
                }
                // else if (foundItem.api === TRAVELPORT_REST_API) {
                //   const travelportSubService = new TravelportRestFlightService(trx);
                //   const formattedResBody =
                //     await travelportSubService.FlightRevalidateService({
                //       reqBody: retrievedData.reqBody,
                //       dynamic_fare_supplier_id: apiData[0].id,
                //       booking_block,
                //       api_search_id: foundItem.api_search_id,
                //       flight_id,
                //     });
                //   formattedResBody.leg_description =
                //     retrievedData.response.leg_descriptions;
                //   return formattedResBody;
                // }
                else {
                    return null;
                }
            }));
        });
    }
    //get Flight Fare Rule
    getFlightFareRule(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { flight_id, search_id } = req.query;
                //get data from redis using the search id
                const retrievedData = yield (0, redis_1.getRedis)(search_id);
                if (!retrievedData) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const retrieveResponse = retrievedData.response;
                const foundItem = retrieveResponse.results.find((item) => item.flight_id === flight_id);
                if (!foundItem) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                let res = false;
                if (foundItem.api === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    res = yield tripjackSubService.FareRulesService({ api_search_id: foundItem.api_search_id });
                }
                else if (foundItem.api === flightConstants_1.VERTEIL_API) {
                    // const verteilSubService = new VerteilFlightService(trx);
                    // res = await verteilSubService
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: res ? res : flightConstants_1.FLIGHT_FARE_RESPONSE,
                };
            }));
        });
    }
    //Flight booking with passport and visa file
    flightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, name, email, mobile_number, agency_id, ref_id, agency_logo } = req.agency;
                const body = req.body;
                //get commission set id
                const agency_info = yield this.Model.agencyModel(trx).getSingleAgency(ref_id ? ref_id : agency_id);
                if (!agency_info[0].commission_set_id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No commission set has been found for the agency',
                    };
                }
                const data = yield this.flightSubRevalidate(body.search_id, body.flight_id, agency_info[0].commission_set_id);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //checking eligibility for booking
                const subServices = new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx);
                const checkEligibilityOfBooking = yield subServices.checkEligibilityOfBooking({
                    booking_block: data.booking_block,
                    route: lib_1.default.getRouteOfFlight(data.leg_description),
                    departure_date: data.flights[0].options[0].departure.date,
                    flight_number: `${data.flights[0].options[0].carrier.carrier_marketing_flight_number}`,
                    is_domestic_flight: data.domestic_flight,
                    passenger: body.passengers,
                });
                if (!(checkEligibilityOfBooking === null || checkEligibilityOfBooking === void 0 ? void 0 : checkEligibilityOfBooking.success)) {
                    return checkEligibilityOfBooking;
                }
                if (body.ssr && body.ssr.length) {
                    body.ssr.map((elm) => {
                        data.fare.payable += Number(elm.price);
                    });
                }
                const payable_amount = data.fare.payable;
                if ('direct_ticket_issue' in data && data.direct_ticket_issue === true) {
                    const agencyModel = this.Model.agencyModel(trx);
                    const agencyBalance = yield agencyModel.getTotalBalance(agency_id);
                    const checkBalance = yield subServices.checkAgencyBalanceForTicketIssue({
                        agency_balance: agencyBalance,
                        ticket_price: payable_amount,
                        payment_type: 'full',
                    });
                    if (checkBalance.success === false) {
                        return checkBalance;
                    }
                }
                // //check if the booking is block
                // const directBookingPermission =
                //   await subServices.checkDirectFlightBookingPermission({
                //     commission_set_id: agency_info[0].commission_set_id,
                //     api_name: data.api,
                //     airline: data.carrier_code,
                //   });
                const directBookingPermission = {
                    booking_block: false,
                };
                // if (directBookingPermission.success === false) {
                //   return directBookingPermission;
                // }
                //old revalidate data
                const revalidate_data = yield (0, redis_1.getRedis)(`${flightConstants_1.FLIGHT_REVALIDATE_REDIS_KEY}${body.flight_id}`);
                let airline_pnr;
                let refundable = data.refundable;
                let status = flightConstants_1.FLIGHT_BOOKING_CONFIRMED;
                let details = '';
                let api = data.api;
                let gds_pnr = null;
                let api_booking_ref = null;
                let ticket_issue_last_time = null;
                let ticket_numbers = [];
                let fare_rules = null;
                if (directBookingPermission.booking_block === false) {
                    if (data.api === flightConstants_1.SABRE_API) {
                        const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                        gds_pnr = yield sabreSubService.FlightBookingService({
                            body,
                            user_info: {
                                id,
                                name: name,
                                email,
                                phone: mobile_number,
                                agency_id,
                            },
                            revalidate_data: data,
                        });
                        //get airline pnr, refundable status
                        const grnData = yield sabreSubService.GRNUpdate({
                            pnr: gds_pnr,
                        });
                        airline_pnr = grnData.airline_pnr;
                        refundable = grnData.refundable;
                        details = `Flight has been booked using ${flightConstants_1.SABRE_API}-${config_1.default.SABRE_USERNAME.split('-')[1]} API`;
                        ticket_issue_last_time = grnData.last_time;
                        fare_rules = grnData.fare_rules ? grnData.fare_rules : null;
                    }
                    else if (data.api === flightConstants_1.VERTEIL_API) {
                        const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                        const res = yield verteilSubService.FlightBookService({
                            search_id: body.search_id,
                            flight_id: body.flight_id,
                            passengers: body.passengers,
                        });
                        gds_pnr = res.pnr;
                        airline_pnr = res.pnr;
                        ticket_issue_last_time = res.paymentTimeLimit;
                        api_booking_ref = res.apiBookingId;
                        details = `Flight has been booked using ${flightConstants_1.VERTEIL_API} API`;
                        fare_rules = data.fare_rules ? data.fare_rules : null;
                    }
                    else if (data.api === flightConstants_1.TRIPJACK_API) {
                        const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                        const res = yield tripjackSubService.FlightBookingService({
                            booking_payload: body,
                            revalidate_data,
                            direct_issue: data.direct_ticket_issue === true ? true : false,
                            ssr: body.ssr,
                        });
                        if (res) {
                            const retrieveBooking = yield tripjackSubService.RetrieveBookingService(revalidate_data.api_search_id);
                            gds_pnr = retrieveBooking.gds_pnr;
                            airline_pnr = retrieveBooking.airline_pnr;
                            api_booking_ref = revalidate_data.api_search_id;
                            if (!gds_pnr) {
                                status = flightConstants_1.FLIGHT_BOOKING_IN_PROCESS;
                            }
                            if (data.fare.vendor_price) {
                                data.fare.vendor_price.gross_fare = retrieveBooking.gross_fare;
                            }
                            details = `Flight has been booked using ${flightConstants_1.TRIPJACK_API} API`;
                            ticket_numbers = retrieveBooking.ticket_numbers;
                            if ('direct_ticket_issue' in data && data.direct_ticket_issue === true) {
                                details += `. Direct ticket issue is enabled from ${flightConstants_1.TRIPJACK_API} for this booking.`;
                            }
                            //get data from redis using the search id
                            const retrievedData = yield (0, redis_1.getRedis)(body.search_id);
                            if (!retrievedData) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_NOT_FOUND,
                                    message: this.ResMsg.HTTP_NOT_FOUND,
                                };
                            }
                            const retrieveResponse = retrievedData.response;
                            const foundItem = retrieveResponse.results.find((item) => item.flight_id === body.flight_id);
                            if (!foundItem) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_NOT_FOUND,
                                    message: this.ResMsg.HTTP_NOT_FOUND,
                                };
                            }
                            fare_rules = yield tripjackSubService.FareRulesService({
                                api_search_id: foundItem.api_search_id,
                            });
                        }
                        else {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: 'Please contact support team with flight information',
                            };
                        }
                    }
                    // else if (data.api === TRAVELPORT_REST_API) {
                    //   const travelportSubService = new TravelportRestFlightService(trx);
                    //   const res = await travelportSubService.FlightBookingService({
                    //     api_search_id: data.api_search_id,
                    //     traveler: body.passengers,
                    //   });
                    //   gds_pnr = res.pnr;
                    //   airline_pnr = res.pnr;
                    //   ticket_issue_last_time = res.ticket_issue_last_time;
                    //   details = `Flight has been booked using ${TRAVELPORT_REST_API} API`;
                    // }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.HTTP_BAD_REQUEST,
                        };
                    }
                }
                else {
                    details = `Booking status - ${flightConstants_1.FLIGHT_BOOKING_IN_PROCESS}. Booking Block was enabled for this booking.`;
                    status = flightConstants_1.FLIGHT_BOOKING_IN_PROCESS;
                    api = flightConstants_1.CUSTOM_API;
                }
                //insert the revalidate data as info log
                const log_res = yield this.Model.errorLogsModel().insert({
                    http_method: 'POST',
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: 'Flight booking revalidate data',
                    url: '/flight/booking',
                    user_id: id,
                    source: 'B2B',
                    metadata: {
                        api: data.api,
                        request_body: {
                            flight_id: body.flight_id,
                            search_id: body.search_id,
                            api_search_id: data.api_search_id,
                        },
                        response: data,
                    },
                });
                //insert booking data
                const { booking_id, booking_ref } = yield subServices.insertFlightBookingData({
                    pnr: gds_pnr,
                    flight_details: data,
                    passengers: body.passengers,
                    ssr: body.ssr,
                    created_by: id,
                    api_booking_ref: api_booking_ref,
                    airline_pnr,
                    refundable,
                    name: name,
                    email,
                    files: req.files || [],
                    last_time: ticket_issue_last_time,
                    agency_id,
                    status,
                    api,
                    details,
                    convenience_fee: 0,
                    old_revalidate_data: revalidate_data,
                    fare_rules,
                });
                //delete the log after successful booking
                yield this.Model.errorLogsModel(trx).delete(log_res[0].id);
                //invoice
                const invoiceSubService = new payment_service_1.BookingPaymentService(trx);
                const invoice = yield invoiceSubService.createInvoice({
                    agency_id,
                    user_id: id,
                    ref_id: booking_id,
                    ref_type: constants_1.INVOICE_TYPE_FLIGHT,
                    total_amount: payable_amount,
                    due: payable_amount,
                    details: `Invoice has been created for flight Id ${booking_ref}`,
                    user_name: name,
                    email,
                    total_travelers: body.passengers.length,
                    travelers_type: constants_1.TRAVELER_TYPE_PASSENGERS,
                    bookingId: booking_ref,
                    agency_logo
                });
                //money receipt
                if ('direct_ticket_issue' in data && data.direct_ticket_issue === true) {
                    //update booking data
                    yield subServices.updateDataAfterTicketIssue({
                        booking_id: booking_id,
                        agency_id,
                        payable_amount: data.fare.payable,
                        booking_ref: booking_ref,
                        payment_type: 'full',
                        invoice_id: invoice[0].id,
                        user_id: id,
                        status: ticket_numbers.length ? flightConstants_1.FLIGHT_TICKET_ISSUE : flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                        issued_by: 'AGENT',
                        ticket_number: ticket_numbers,
                    });
                }
                return {
                    success: true,
                    message: 'Pnr has been created successfully',
                    booking_id: booking_id,
                    pnr: gds_pnr,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
    //Flight booking cancel
    flightBookingCancel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const { id: user_id, agency_id, email: user_email, agency_logo } = req.agency;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                //check booking info
                const checkFlightBooking = yield flightBookingModel.getSingleFlightBooking({
                    agency_id,
                    id: Number(booking_id),
                    status: [flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_BOOKING_IN_PROCESS],
                });
                if (!checkFlightBooking.length) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                let cancelBookingRes = {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                };
                if (checkFlightBooking[0].api === flightConstants_1.SABRE_API) {
                    //sabre
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    yield sabreSubService.SabreBookingCancelService({
                        pnr: checkFlightBooking[0].pnr_code,
                    });
                    cancelBookingRes.success = true;
                    cancelBookingRes.message = 'Booking has been cancelled successfully';
                    cancelBookingRes.code = this.StatusCode.HTTP_OK;
                }
                else if (checkFlightBooking[0].api === flightConstants_1.VERTEIL_API) {
                    const segmentDetails = yield flightBookingModel.getFlightSegment(Number(booking_id));
                    const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                    cancelBookingRes = yield verteilSubService.OrderCancelService({
                        airlineCode: segmentDetails[0].airline_code,
                        pnr: checkFlightBooking[0].pnr_code,
                    });
                }
                else if (checkFlightBooking[0].api === flightConstants_1.CUSTOM_API) {
                    yield adminNotificationSubService.insertNotification({
                        message: `A request has been submitted to cancel this custom API booking. Booking ID: ${checkFlightBooking[0].booking_ref}`,
                        ref_id: Number(booking_id),
                        type: constants_1.NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
                    });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Please contact with the support team to cancel this booking',
                    };
                }
                else if (checkFlightBooking[0].api === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    cancelBookingRes = yield tripjackSubService.CancelBookingService(checkFlightBooking[0].api_booking_ref, checkFlightBooking[0].airline_pnr);
                }
                //if cancellation is successful, update the booking status
                if (cancelBookingRes.success === true) {
                    yield flightBookingModel.updateBooking({ status: flightConstants_1.FLIGHT_BOOKING_CANCELLED, cancelled_by: user_id }, Number(booking_id));
                    //delete invoice
                    if (checkFlightBooking[0].invoice_id) {
                        yield this.Model.btobPaymentModel(trx).updateInvoice({ status: false }, checkFlightBooking[0].invoice_id);
                    }
                    //send notification to admin
                    yield adminNotificationSubService.insertNotification({
                        message: `A flight booking has been cancelled from B2B. Booking id ${checkFlightBooking[0].booking_ref}`,
                        ref_id: Number(booking_id),
                        type: constants_1.NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
                    });
                    // send email notification
                    yield Promise.all([
                        lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `A ${checkFlightBooking[0].route} flight booking has been cancelled`, (0, flightBookingCancelTemplates_1.template_onCancelFlightBooking_send_to_admin)({
                            pnr: ((_a = checkFlightBooking[0].pnr_code) === null || _a === void 0 ? void 0 : _a.startsWith('NZB')) &&
                                ((_b = checkFlightBooking[0].pnr_code) === null || _b === void 0 ? void 0 : _b.length) > 6
                                ? 'N/A'
                                : String(checkFlightBooking[0].pnr_code),
                            journey_type: checkFlightBooking[0].journey_type,
                            payable_amount: checkFlightBooking[0].payable_amount,
                            route: checkFlightBooking[0].route,
                            total_passenger: checkFlightBooking[0].total_passenger,
                            logo: constants_1.PROJECT_IMAGE_URL + '/' + agency_logo,
                        })),
                        lib_1.default.sendEmail(user_email, `Your flight booking for ${checkFlightBooking[0].route} has been cancelled`, (0, flightBookingCancelTemplates_1.template_onCancelFlightBooking_send_to_agent)({
                            pnr: ((_c = checkFlightBooking[0].pnr_code) === null || _c === void 0 ? void 0 : _c.startsWith('NZB')) &&
                                ((_d = checkFlightBooking[0].pnr_code) === null || _d === void 0 ? void 0 : _d.length) > 6
                                ? 'N/A'
                                : String(checkFlightBooking[0].pnr_code),
                            journey_type: checkFlightBooking[0].journey_type,
                            payable_amount: checkFlightBooking[0].payable_amount,
                            route: checkFlightBooking[0].route,
                            total_passenger: checkFlightBooking[0].total_passenger,
                            logo: constants_1.PROJECT_IMAGE_URL + '/' + agency_logo,
                        })),
                    ]);
                }
                return cancelBookingRes;
            }));
        });
    }
    //get list of booking
    getBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const query = req.query;
            const model = this.Model.b2bFlightBookingModel();
            const data = yield model.getAllFlightBooking(Object.assign(Object.assign({}, query), { agency_id }));
            const mappedData = data.data.map((item) => (Object.assign(Object.assign({}, item), { pnr_code: item.pnr_code })));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: mappedData,
                total: data.total,
            };
        });
    }
    //get single booking
    getBookingSingle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, email: user_email } = req.agency;
                const { id: booking_id } = req.params;
                const model = this.Model.b2bFlightBookingModel(trx);
                const data = yield model.getSingleFlightBooking({
                    agency_id,
                    id: Number(booking_id),
                });
                const segment = yield model.getFlightSegment(Number(booking_id));
                const traveler = yield model.getFlightBookingTraveler(Number(booking_id));
                if (data[0].pnr_code) {
                    yield new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx).updateFromAPI({
                        data,
                        booking_id,
                        segment,
                        traveler,
                    });
                }
                const ssr = yield model.getFlightBookingSSR(Number(booking_id));
                const fare_rules = yield model.getFlightFareRules({ flight_booking_id: Number(booking_id) });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, data[0]), { segment, traveler, ssr, fare_rules }),
                };
            }));
        });
    }
    //update booking
    updateBooking(_a) {
        return __awaiter(this, arguments, void 0, function* ({ status, booking_id, ticket_number, last_time, airline_pnr, }) {
            const model = this.Model.b2bFlightBookingModel();
            yield model.updateBooking({ status, last_time, airline_pnr }, booking_id);
            if (ticket_number.length) {
                const getTraveler = yield model.getFlightBookingTraveler(Number(booking_id));
                for (let i = 0; i < getTraveler.length; i++) {
                    yield model.updateFlightBookingTraveler({ ticket_number: ticket_number === null || ticket_number === void 0 ? void 0 : ticket_number[i] }, getTraveler[i].id);
                }
            }
        });
    }
    //Ticket Issue
    ticketIssue(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                const { id: booking_id } = req.params;
                const { agency_id, id: user_id, ref_id } = req.agency;
                const { payment_type } = req.body;
                const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const flightBookingSubService = new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx);
                //check booking info
                const [checkFlightBooking, flightSegments, flightTravelers] = yield Promise.all([
                    flightBookingModel.getSingleFlightBooking({
                        id: Number(booking_id),
                        status: [flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_BOOKING_IN_PROCESS],
                    }),
                    flightBookingModel.getFlightSegment(Number(booking_id)),
                    flightBookingModel.getFlightBookingTraveler(Number(booking_id)),
                ]);
                if (!checkFlightBooking.length) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                if (!checkFlightBooking[0].invoice_id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'No invoice has been found for this booking',
                    };
                }
                let partial_payment_percentage = 0;
                //check if the payment is eligible for partial payment
                if (payment_type === 'partial') {
                    if (((_b = (_a = checkFlightBooking[0]) === null || _a === void 0 ? void 0 : _a.partial_payment) === null || _b === void 0 ? void 0 : _b.partial_payment) === false) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Partial payment is not allowed for this booking',
                        };
                    }
                    else {
                        if (((_c = checkFlightBooking[0].partial_payment) === null || _c === void 0 ? void 0 : _c.payment_percentage) === null) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: 'Partial payment percentage for this booking is not yet configured. Please wait while we complete the update.',
                            };
                        }
                        partial_payment_percentage =
                            Number((_d = checkFlightBooking[0].partial_payment) === null || _d === void 0 ? void 0 : _d.payment_percentage) / 100;
                    }
                }
                //check balance
                const agencyBalance = yield agencyModel.getTotalBalance(agency_id);
                const checkBalance = yield flightBookingSubService.checkAgencyBalanceForTicketIssue({
                    agency_balance: agencyBalance,
                    ticket_price: checkFlightBooking[0].payable_amount,
                    payment_type,
                    partial_payment_percentage,
                });
                if (checkBalance.success === false) {
                    return checkBalance;
                }
                //ticket issue
                let ticketIssueRes = {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                    data: [],
                };
                const getTraveler = yield flightBookingModel.getFlightBookingTraveler(Number(booking_id));
                //check ticket issue block
                const checkTicketIssueBlock = yield flightBookingSubService.checkTicketIssueBlock({
                    agency_id: ref_id || agency_id,
                    airline: flightSegments[0].airline_code,
                    api: checkFlightBooking[0].api,
                });
                if (!checkTicketIssueBlock) {
                    if (checkFlightBooking[0].api === flightConstants_1.SABRE_API) {
                        const travelerSet = new Set(getTraveler.map((elem) => elem.type));
                        const unique_traveler = travelerSet.size;
                        //sabre
                        const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                        ticketIssueRes = yield sabreSubService.TicketIssueService({
                            pnr: checkFlightBooking[0].pnr_code,
                            unique_traveler,
                        });
                    }
                    else if (checkFlightBooking[0].api === flightConstants_1.VERTEIL_API) {
                        const segmentDetails = yield flightBookingModel.getFlightSegment(Number(booking_id));
                        const travelerDetails = yield flightBookingModel.getFlightBookingTraveler(Number(booking_id));
                        const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                        ticketIssueRes = yield verteilSubService.TicketIssueService({
                            airlineCode: segmentDetails[0].airline_code,
                            oldFare: {
                                vendor_total: checkFlightBooking[0].vendor_price.net_fare,
                            },
                            passengers: travelerDetails,
                            pnr: checkFlightBooking[0].pnr_code,
                        });
                    }
                    else if (checkFlightBooking[0].api === flightConstants_1.TRIPJACK_API) {
                        const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                        ticketIssueRes = yield tripjackSubService.TicketIssueService({
                            api_booking_ref: checkFlightBooking[0].api_booking_ref,
                            vendor_total_price: checkFlightBooking[0].vendor_price.gross_fare,
                        });
                        const getBooking = yield tripjackSubService.RetrieveBookingService(checkFlightBooking[0].api_booking_ref);
                        ticketIssueRes.data = getBooking.ticket_numbers;
                    }
                }
                //if issue is successful, update the booking status and debit the amount
                if (ticketIssueRes.success === true) {
                    //update booking data
                    yield flightBookingSubService.updateDataAfterTicketIssue({
                        booking_id: Number(booking_id),
                        agency_id,
                        payable_amount: checkFlightBooking[0].payable_amount,
                        booking_ref: checkFlightBooking[0].booking_ref,
                        payment_type,
                        invoice_id: checkFlightBooking[0].invoice_id,
                        ticket_number: ticketIssueRes.data,
                        travelers_info: getTraveler,
                        user_id,
                        issued_by: 'AGENT',
                        status: ((_e = ticketIssueRes.data) === null || _e === void 0 ? void 0 : _e.length) === 0 ? flightConstants_1.FLIGHT_BOOKING_ON_HOLD : flightConstants_1.FLIGHT_TICKET_ISSUE,
                        partial_payment_percentage,
                    });
                    //send notification to admin
                    const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                    yield adminNotificationSubService.insertNotification({
                        message: `Flight ticket has been issued from B2B. Booking id ${checkFlightBooking[0].booking_ref}`,
                        ref_id: Number(booking_id),
                        type: constants_1.NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
                    });
                    if (((_f = ticketIssueRes.data) === null || _f === void 0 ? void 0 : _f.length) && ((_g = ticketIssueRes.data) === null || _g === void 0 ? void 0 : _g.length) > 0) {
                        // send email notification
                        {
                            const due = payment_type === 'partial'
                                ? Number((Number(checkFlightBooking[0].payable_amount) -
                                    Number(checkFlightBooking[0].payable_amount * partial_payment_percentage)).toFixed(2))
                                : 0;
                            const flightBookTemplateData = {
                                travel_date: flightSegments[0].departure_date,
                                ticket_numbers: ticketIssueRes.data || [],
                                journey_type: checkFlightBooking[0].journey_type,
                                payable_amount: checkFlightBooking[0].payable_amount,
                                route: checkFlightBooking[0].route,
                                total_passenger: checkFlightBooking[0].total_passenger,
                                due_amount: due,
                                logo: `${constants_1.PROJECT_IMAGE_URL}/${checkFlightBooking[0].agency_logo}`,
                            };
                            const formatDuration = (minutes) => {
                                const hrs = Math.floor(minutes / 60);
                                const mins = minutes % 60;
                                return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`.trim();
                            };
                            const flightDetails = flightSegments.map((segment) => ({
                                departure: `${segment.origin}`,
                                arrival: `${segment.destination}`,
                                duration: formatDuration(parseInt(segment.duration, 10)),
                                details: {
                                    class: `CLASS: ${segment.class}`,
                                    departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
                                    lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
                                },
                                airline: {
                                    name: segment.airline,
                                    image: `${constants_1.PROJECT_IMAGE_URL}/${segment.airline_logo}`,
                                    flight_number: segment.flight_number,
                                },
                                cabin: segment.class,
                                departure_date: lib_1.default.formatAMPM(new Date(segment.departure_date.toISOString().split('T')[0] +
                                    'T' +
                                    segment.departure_time.split('+')[0])),
                            }));
                            const flightBookingPdfData = {
                                date_of_issue: new Date().toISOString().split('T')[0],
                                bookingId: checkFlightBooking[0].booking_ref,
                                bookingStatus: checkFlightBooking[0].booking_status,
                                pnr: ((_h = checkFlightBooking[0].pnr_code) === null || _h === void 0 ? void 0 : _h.startsWith('NZB')) &&
                                    ((_j = checkFlightBooking[0].pnr_code) === null || _j === void 0 ? void 0 : _j.length) > 6
                                    ? 'N/A'
                                    : String(checkFlightBooking[0].pnr_code),
                                airlinePnr: checkFlightBooking[0].airline_pnr,
                                numberOfPassengers: flightTravelers.length,
                                journeyType: checkFlightBooking[0].journey_type,
                                segments: flightDetails,
                                passengers: flightTravelers.map((traveler, index) => ({
                                    name: String(traveler.reference).toUpperCase() +
                                        ' ' +
                                        traveler.first_name +
                                        ' ' +
                                        traveler.last_name,
                                    gender: traveler.gender,
                                    dob: traveler.date_of_birth,
                                    phone: traveler.contact_number,
                                    reference: traveler.reference,
                                    ticket: ticketIssueRes.data ? ticketIssueRes.data[index] : '',
                                    type: traveler.type,
                                    passport_number: traveler.passport_number,
                                    frequent_flyer_number: traveler.frequent_flyer_number,
                                })),
                                agency: {
                                    email: (_k = checkFlightBooking[0]) === null || _k === void 0 ? void 0 : _k.agency_email,
                                    phone: (_l = checkFlightBooking[0]) === null || _l === void 0 ? void 0 : _l.agency_phone,
                                    address: (_m = checkFlightBooking[0]) === null || _m === void 0 ? void 0 : _m.agency_address,
                                    photo: `${constants_1.PROJECT_IMAGE_URL}/${(_o = checkFlightBooking[0]) === null || _o === void 0 ? void 0 : _o.agency_logo}`,
                                    name: (_p = checkFlightBooking[0]) === null || _p === void 0 ? void 0 : _p.agency_name,
                                },
                                baggage_information: {
                                    route: checkFlightBooking[0].route,
                                    check_in: flightSegments
                                        .map((segment) => {
                                        return `${segment.flight_number} (${segment.airline}) - Baggage info: ${segment.baggage}`;
                                    })
                                        .join(','),
                                },
                            };
                            const bookingEmailSubService = new sendBookingMailSupport_service_1.SendBookingEmailService();
                            //admin
                            yield Promise.all([
                                bookingEmailSubService.sendFlightTicketIssuedEmail({
                                    flightBookTemplateData,
                                    flightBookingPdfData,
                                    bookingId: (_q = checkFlightBooking[0]) === null || _q === void 0 ? void 0 : _q.booking_ref,
                                    email: constants_1.PROJECT_EMAIL_API_1,
                                }),
                                //agent
                                bookingEmailSubService.sendFlightTicketIssuedEmail({
                                    flightBookTemplateData,
                                    flightBookingPdfData,
                                    bookingId: (_r = checkFlightBooking[0]) === null || _r === void 0 ? void 0 : _r.booking_ref,
                                    email: checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
                                }),
                            ]);
                        }
                    }
                    else {
                        //ticket hold
                        const formatDuration = (minutes) => {
                            const hrs = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`.trim();
                        };
                        const flightDetails = flightSegments.map((segment) => ({
                            departure: `${segment.origin}`,
                            arrival: `${segment.destination}`,
                            duration: formatDuration(parseInt(segment.duration, 10)),
                            details: {
                                class: `CLASS: ${segment.class}`,
                                departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
                                lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
                            },
                            airline: {
                                name: segment.airline,
                                image: `${constants_1.PROJECT_IMAGE_URL}/${segment.airline_logo}`,
                                flight_number: segment.flight_number,
                            },
                            cabin: segment.class,
                            departure_date: lib_1.default.formatAMPM(new Date(segment.departure_date.toISOString().split('T')[0] +
                                'T' +
                                segment.departure_time.split('+')[0])),
                        }));
                        yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref} | B2B`, (0, flightBookingHoldTemplate_1.flightBookStatusTemplate)({
                            bookingId: checkFlightBooking[0].booking_ref,
                            airline: flightSegments[0].airline,
                            segments: flightDetails,
                            journeyType: checkFlightBooking[0].journey_type,
                            numberOfPassengers: flightTravelers.length,
                            route: checkFlightBooking[0].route,
                            status: flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                            name: checkFlightBooking[0].created_by + ' (' + checkFlightBooking[0].agency_name + ')',
                        }));
                        yield lib_1.default.sendEmail(checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email, `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref}`, (0, flightBookingHoldTemplate_1.flightBookStatusTemplate)({
                            bookingId: checkFlightBooking[0].booking_ref,
                            airline: flightSegments[0].airline,
                            segments: flightDetails,
                            journeyType: checkFlightBooking[0].journey_type,
                            numberOfPassengers: flightTravelers.length,
                            route: checkFlightBooking[0].route,
                            status: flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                            name: checkFlightBooking[0].created_by + ' (' + checkFlightBooking[0].agency_name + ')',
                        }));
                    }
                }
                else {
                    return ticketIssueRes;
                    // //insert into pending ticket issuance
                    // await flightBookingSubService.insertPendingTicketIssue({
                    //   booking_id: Number(booking_id),
                    //   agency_id,
                    //   payable_amount: checkFlightBooking[0].payable_amount,
                    //   booking_ref: checkFlightBooking[0].booking_ref,
                    //   payment_type,
                    //   invoice_id: checkFlightBooking[0].invoice_id,
                    //   user_id,
                    //   agency_logo: checkFlightBooking[0].agency_logo,
                    //   api: checkFlightBooking[0].api,
                    //   route: checkFlightBooking[0].route,
                    //   departure_date: flightSegments[0].departure_date,
                    //   email: checkFlightBooking[0].user_email,
                    //   journey_type: checkFlightBooking[0].journey_type,
                    //   total_passenger: checkFlightBooking[0].total_passenger,
                    //   details: checkTicketIssueBlock
                    //     ? 'issue blocked was enabled'
                    //     : checkFlightBooking[0].api === CUSTOM_API
                    //       ? 'Custom API was enabled'
                    //       : `got an error from ${checkFlightBooking[0].api} API`,
                    //   partial_payment_percentage,
                    // });
                    // return {
                    //   success: true,
                    //   code: this.StatusCode.HTTP_OK,
                    //   message: 'Ticket is being processed',
                    // };
                }
                return ticketIssueRes;
            }));
        });
    }
}
exports.default = AgentFlightService;
