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
const verteilFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service"));
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const BtoCFlightBookingSubService_1 = require("./subServices/BtoCFlightBookingSubService");
const invoice_service_1 = require("./subServices/invoice.service");
const tripjackFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class B2CFlightService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Flight search
    flightSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const apiAirlinesCommission = this.Model.commissionSetModel(trx);
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);
                //get btoc commission set id
                const commission_set_res = yield dynamicFareModel.getB2CCommission();
                if (!commission_set_res.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No commission set has been set for b2c",
                    };
                }
                // const commission_set_id = commission_set_data[0].id;
                const commission_set_id = commission_set_res[0].commission_set_id;
                const apiData = yield dynamicFareModel.getSuppliers({
                    set_id: commission_set_id,
                    status: true,
                });
                // Route block codes will be written here. Then Find all the airlines and send with booking block or full block to ResFormatter. if no airlines found just route full block then don't call ResFormatter just return empty array. If just booking block then send empty array to resFormatter of airlines and write booking block to every itins
                // const block_routes = await flightRouteConfigModel.getBlockRoute({
                //   status: true,
                //   departure:
                //     body.OriginDestinationInformation[0].OriginLocation.LocationCode,
                //   arrival:
                //     body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
                //   one_way:
                //     body.JourneyType === "1" || body.JourneyType === "3"
                //       ? true
                //       : undefined,
                //   round_trip: body.JourneyType === "2" ? true : undefined,
                // });
                // //if full block is true then return empty array
                // if (block_routes.data[0]?.full_block) {
                //   return {
                //     success: true,
                //     code: this.StatusCode.HTTP_OK,
                //     message: this.ResMsg.HTTP_OK,
                //     data: {
                //       search_id: "",
                //       journey_type: body.JourneyType,
                //       leg_descriptions: [],
                //       total: 0,
                //       results: [],
                //     },
                //   };
                // }
                //if booking block is true then make the variable true
                let booking_block = false;
                // if (block_routes.data[0]?.booking_block) {
                //   booking_block = true;
                // }
                let sabre_set_flight_api_id = 0;
                let verteil_set_flight_api_id = 0;
                let tripjack_set_flight_api_id = 0;
                apiData.forEach((item) => {
                    if (item.api === constants_1.SABRE_API) {
                        sabre_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.VERTEIL_API) {
                        verteil_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.TRIPJACK_API) {
                        tripjack_set_flight_api_id = item.id;
                    }
                });
                const search_id = (0, uuid_1.v4)();
                let sabreData = [];
                let verteilData = [];
                let tripjackData = [];
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    sabreData = yield sabreSubService.FlightSearch({
                        booking_block: booking_block,
                        reqBody: body,
                        dynamic_fare_supplier_id: sabre_set_flight_api_id,
                        search_id,
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
                // Add Leg Description with response data
                const leg_descriptions = body.OriginDestinationInformation.map((OrDeInfo) => {
                    return {
                        departureDate: OrDeInfo.DepartureDateTime,
                        departureLocation: OrDeInfo.OriginLocation.LocationCode,
                        arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
                    };
                });
                const results = [...sabreData, ...verteilData, ...tripjackData];
                const responseData = {
                    search_id,
                    journey_type: body.JourneyType,
                    leg_descriptions,
                    total: results.length,
                    results: results,
                };
                //save data to redis
                const dataForStore = {
                    reqBody: body,
                    response: responseData,
                };
                yield (0, redis_1.setRedis)(search_id, dataForStore);
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
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const JourneyType = req.query.JourneyType;
                const OriginDestinationInformation = req.query
                    .OriginDestinationInformation;
                const PassengerTypeQuantity = req.query.PassengerTypeQuantity;
                const body = {
                    JourneyType,
                    OriginDestinationInformation,
                    PassengerTypeQuantity,
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
                });
                const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);
                //get btoc commission set id
                const commission_set_res = yield dynamicFareModel.getB2CCommission();
                if (!commission_set_res.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No commission set has been set for b2c",
                    };
                }
                // const commission_set_id = commission_set_data[0].id;
                const commission_set_id = commission_set_res[0].commission_set_id;
                const apiData = yield dynamicFareModel.getSuppliers({
                    set_id: commission_set_id,
                    status: true,
                });
                console.log({ apiData, commission_set_id });
                // Route block codes will be written here. Then Find all the airlines and send with booking block or full block to ResFormatter. if no airlines found just route full block then don't call ResFormatter just return empty array. If just booking block then send empty array to resFormatter of airlines and write booking block to every itins
                const block_routes = yield flightRouteConfigModel.getBlockRoute({
                    status: true,
                    departure: body.OriginDestinationInformation[0].OriginLocation.LocationCode,
                    arrival: body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
                    one_way: body.JourneyType === "1" || body.JourneyType === "3"
                        ? true
                        : undefined,
                    round_trip: body.JourneyType === "2" ? true : undefined,
                });
                // Return empty data if full block is true
                if ((_a = block_routes.data[0]) === null || _a === void 0 ? void 0 : _a.full_block) {
                    res.write(`data: ${JSON.stringify({
                        search_id: "",
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
                apiData.forEach((item) => {
                    if (item.api === constants_1.SABRE_API) {
                        sabre_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.VERTEIL_API) {
                        verteil_set_flight_api_id = item.id;
                    }
                    if (item.api === flightConstants_1.TRIPJACK_API) {
                        tripjack_set_flight_api_id = item.id;
                    }
                });
                // Generate search ID
                const search_id = (0, uuid_1.v4)();
                res.write("event: search_info\n");
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
                    console.log({ reqb: JSON.stringify(body) });
                    // Update Redis after receiving results
                    yield (0, redis_1.setRedis)(search_id, { reqBody: body, response: responseData });
                });
                const tasks = [];
                if (sabre_set_flight_api_id) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    tasks.push(sendResults("Sabre", () => __awaiter(this, void 0, void 0, function* () {
                        return sabreSubService.FlightSearch({
                            booking_block: booking_block,
                            reqBody: JSON.parse(JSON.stringify(body)),
                            dynamic_fare_supplier_id: sabre_set_flight_api_id,
                            search_id,
                        });
                    })));
                }
                if (verteil_set_flight_api_id) {
                    const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                    tasks.push(sendResults("Verteil", () => __awaiter(this, void 0, void 0, function* () {
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
                    tasks.push(sendResults("Tripjack", () => __awaiter(this, void 0, void 0, function* () {
                        return tripjackSubService.FlightSearchService({
                            booking_block,
                            reqBody: JSON.parse(JSON.stringify(body)),
                            dynamic_fare_supplier_id: tripjack_set_flight_api_id,
                        });
                    })));
                }
                // Run all tasks in parallel
                yield Promise.all(tasks);
            }));
        });
    }
    // Flight Revalidate
    flightRevalidate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { flight_id, search_id } = req.query;
                const data = yield this.flightSubRevalidate(search_id, flight_id);
                if (data) {
                    yield (0, redis_1.setRedis)(`${flightConstants_1.FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
                    return {
                        success: true,
                        message: "Ticket has been revalidated successfully!",
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
    flightSubRevalidate(search_id, flight_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                //get data from redis using the search id
                const retrievedData = yield (0, redis_1.getRedis)(search_id);
                if (!retrievedData) {
                    return null;
                }
                const retrieveResponse = retrievedData.response;
                const foundItem = retrieveResponse.results.find((item) => item.flight_id === flight_id);
                // console.log("fount Item",foundItem)
                if (!foundItem) {
                    return null;
                }
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                //get btoc commission set id
                const commission_set_res = yield dynamicFareModel.getB2CCommission();
                // const commission_set_id = commission_set_data[0].id;
                const commission_set_id = commission_set_res[0].commission_set_id;
                const apiData = yield dynamicFareModel.getSuppliers({
                    set_id: commission_set_id,
                    status: true,
                    api_name: foundItem.api,
                });
                // console.log({apiData});
                let booking_block = foundItem.booking_block;
                if (foundItem.api === constants_1.SABRE_API) {
                    //SABRE REVALIDATE
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    const formattedReqBody = yield sabreSubService.SabreFlightRevalidate(retrievedData.reqBody, foundItem, apiData[0].id, flight_id, booking_block, search_id);
                    formattedReqBody[0].leg_description =
                        retrievedData.response.leg_descriptions;
                    return formattedReqBody[0];
                }
                else if (foundItem.api === flightConstants_1.VERTEIL_API) {
                    const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                    const formattedReqBody = yield verteilSubService.FlightRevalidateService({
                        search_id: search_id,
                        reqBody: retrievedData.reqBody,
                        oldData: foundItem,
                        dynamic_fare_supplier_id: apiData[0].id,
                    });
                    return formattedReqBody[0];
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
                else {
                    return null;
                }
            }));
        });
    }
    //Flight booking with passport and visa file
    flightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, first_name, last_name, email, phone_number } = req.user;
                console.log({ body: req.body });
                const body = req.body;
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const data = yield this.flightSubRevalidate(body.search_id, body.flight_id);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //checking eligibility for booking
                const flightBookingSubService = new BtoCFlightBookingSubService_1.BtoCFlightBookingSubService(trx);
                const checkEligibilityOfBooking = yield flightBookingSubService.checkEligibilityOfBooking({
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
                //get btoc commission set id
                const commission_set_res = yield dynamicFareModel.getB2CCommission();
                const commission_set_id = commission_set_res[0].commission_set_id;
                if ("direct_ticket_issue" in data && data.direct_ticket_issue === true) {
                    throw new customError_1.default("This flight cannot be booked", 400);
                }
                // //check if the booking is block
                // const directBookingPermission =
                //   await flightBookingSubService.checkDirectFlightBookingPermission({
                //     commission_set_id: commission_set_id,
                //     api_name: data.api,
                //     airline: data.carrier_code,
                //   });
                // if (directBookingPermission.success === false) {
                //   return directBookingPermission;
                // }
                const directBookingPermission = {
                    booking_block: false,
                };
                //old revalidate data
                const revalidate_data = yield (0, redis_1.getRedis)(`${flightConstants_1.FLIGHT_REVALIDATE_REDIS_KEY}${body.flight_id}`);
                let airline_pnr;
                let refundable = data.refundable;
                let status = flightConstants_1.FLIGHT_BOOKING_CONFIRMED;
                let details = "";
                let api = data.api;
                let gds_pnr = null;
                let api_booking_ref = null;
                let ticket_issue_last_time = null;
                if (directBookingPermission.booking_block === false) {
                    if ("api" in data && data.api === constants_1.SABRE_API) {
                        const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                        gds_pnr = yield sabreSubService.FlightBookingService({
                            body,
                            user_info: { id, name: first_name, email, phone: phone_number },
                            revalidate_data: data,
                        });
                        //get airline pnr, refundable status
                        const grnData = yield sabreSubService.GRNUpdate({
                            pnr: gds_pnr,
                        });
                        airline_pnr = grnData.airline_pnr;
                        refundable = grnData.refundable;
                        details = `Flight has been booked using ${constants_1.SABRE_API}-${config_1.default.SABRE_USERNAME.split("-")[1]} API`;
                        ticket_issue_last_time = grnData.last_time;
                    }
                    else if ("api" in data && data.api === flightConstants_1.VERTEIL_API) {
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
                    }
                    else if (data.api === flightConstants_1.TRIPJACK_API) {
                        const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                        const res = yield tripjackSubService.FlightBookingService({
                            booking_payload: body,
                            revalidate_data,
                            direct_issue: false,
                            ssr: body.ssr,
                        });
                        if (res) {
                            const retrieveBooking = yield tripjackSubService.RetrieveBookingService(revalidate_data.api_search_id);
                            gds_pnr = retrieveBooking.gds_pnr;
                            if (data.fare.vendor_price) {
                                data.fare.vendor_price.gross_fare = retrieveBooking.gross_fare;
                            }
                            airline_pnr = retrieveBooking.airline_pnr;
                            api_booking_ref = revalidate_data.api_search_id;
                        }
                        details = `Flight has been booked using ${flightConstants_1.TRIPJACK_API} API`;
                    }
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
                    http_method: "POST",
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: "Flight booking revalidate data",
                    url: "/flight/booking",
                    user_id: id,
                    source: "B2C",
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
                if (body.ssr && body.ssr.length) {
                    body.ssr.map((elm) => {
                        data.fare.payable += elm.price;
                    });
                }
                //insert booking data
                const { booking_id, booking_ref } = yield flightBookingSubService.insertFlightBookingData({
                    pnr: gds_pnr,
                    flight_details: data,
                    passengers: body.passengers,
                    user_id: id,
                    api_booking_ref: api_booking_ref,
                    airline_pnr,
                    refundable,
                    name: first_name + " " + last_name,
                    email,
                    files: req.files || [],
                    last_time: ticket_issue_last_time,
                    status,
                    api,
                    details,
                    ssr: body.ssr,
                    old_revalidate_data: revalidate_data,
                    platform: req.get('User-Agent')
                });
                //delete the log after successful booking
                yield this.Model.errorLogsModel(trx).delete(log_res[0].id);
                //create invoice and send invoice mail
                const invoiceSubService = new invoice_service_1.BtoCInvoiceService(trx);
                const invoice = yield invoiceSubService.createInvoice({
                    user_id: id,
                    ref_id: booking_id,
                    ref_type: constants_1.INVOICE_TYPE_FLIGHT,
                    total_amount: data.fare.payable,
                    due: data.fare.payable,
                    details: `Invoice has been created for flight id ${booking_ref}`,
                    user_name: first_name + " " + last_name,
                    email: email,
                    total_travelers: body.passengers.length,
                    travelers_type: constants_1.TRAVELER_TYPE_PASSENGERS,
                    bookingId: booking_ref,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    invoice_id: invoice[0].id,
                    invoice_number: invoice[0].invoice_number,
                    total_amount: data.fare.payable,
                    message: "Redirecting to the payment gateway",
                };
            }));
        });
    }
    //Flight booking cancel
    flightBookingCancel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id } = req.user;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.btocFlightBookingModel(trx);
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                //check booking info
                const checkFlightBooking = yield flightBookingModel.getSingleFlightBooking({
                    user_id,
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
                if (checkFlightBooking[0].api === constants_1.SABRE_API) {
                    //sabre
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    yield sabreSubService.SabreBookingCancelService({
                        pnr: checkFlightBooking[0].pnr_code,
                    });
                    cancelBookingRes.success = true;
                    cancelBookingRes.message =
                        "Flight booking has been cancelled successfully";
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
                        type: constants_1.NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING,
                    });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Please contact with the support team to cancel this booking",
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
                    yield this.Model.paymentModel(trx).updateInvoice({ status: false }, checkFlightBooking[0].invoice_id);
                    //send notification to admin
                    yield adminNotificationSubService.insertNotification({
                        message: `A flight booking has been cancelled from B2C. Booking id ${checkFlightBooking[0].booking_ref}`,
                        ref_id: Number(booking_id),
                        type: constants_1.NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING,
                    });
                }
                return cancelBookingRes;
            }));
        });
    }
    // booking list
    getFlightBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id } = req.user;
                const { limit, skip } = req.query;
                const flightBookingModel = this.Model.btocFlightBookingModel(trx);
                const bookingList = yield flightBookingModel.getFlightBookingList({
                    user_id,
                    limit,
                    skip,
                    statusNot: flightConstants_1.FLIGHT_BOOKING_CONFIRMED
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: bookingList.data,
                    total: bookingList.total,
                };
            }));
        });
    }
    //single booking info
    getSingleFlightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const { id: user_id, email: user_email } = req.user;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.btocFlightBookingModel(trx);
                const singleBookData = yield flightBookingModel.getSingleFlightBooking({
                    user_id,
                    id: Number(booking_id),
                    statusNot: flightConstants_1.FLIGHT_BOOKING_CONFIRMED,
                });
                const segment = yield flightBookingModel.getFlightSegment(Number(booking_id));
                const traveler = yield flightBookingModel.getFlightTraveler(Number(booking_id));
                if (!singleBookData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (singleBookData[0].pnr_code) {
                    //update from api
                    yield new BtoCFlightBookingSubService_1.BtoCFlightBookingSubService(trx).updateFromApi({
                        singleBookData,
                        booking_id: Number(booking_id),
                        traveler,
                        segment,
                    });
                }
                if (((_b = (_a = singleBookData === null || singleBookData === void 0 ? void 0 : singleBookData[0]) === null || _a === void 0 ? void 0 : _a.pnr_code) === null || _b === void 0 ? void 0 : _b.startsWith("NZB")) &&
                    ((_d = (_c = singleBookData === null || singleBookData === void 0 ? void 0 : singleBookData[0]) === null || _c === void 0 ? void 0 : _c.pnr_code) === null || _d === void 0 ? void 0 : _d.length) > 6) {
                    singleBookData[0].pnr_code = "N/A";
                }
                //get ssr
                const ssr = yield flightBookingModel.getFlightBookingSSR(Number(booking_id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({}, singleBookData[0]), { segment,
                        traveler,
                        ssr }),
                };
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
                // if (foundItem.api === TRIPJACK_API) {
                //   const tripjackSubService = new TripjackFlightSupportService(trx);
                //   res = await tripjackSubService.FareRulesService({ api_search_id: foundItem.api_search_id });
                // }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: res ? res : constants_1.FLIGHT_FARE_RESPONSE,
                };
            }));
        });
    }
}
exports.default = B2CFlightService;
