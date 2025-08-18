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
exports.BtoCFlightBookingSubService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const adminNotificationSubService_1 = require("../../../admin/services/subServices/adminNotificationSubService");
const sendBookingMailSupport_service_1 = require("../../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service");
const sabreFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const customError_1 = __importDefault(require("../../../../utils/lib/customError"));
const verteilFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service"));
const tripjackFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service"));
const flightBookingHoldTemplate_1 = require("../../../../utils/templates/flightBookingHoldTemplate");
class BtoCFlightBookingSubService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    //generate unique booking number
    generateUniqueBookingNumber(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.btocFlightBookingModel(trx);
            const bookingNumber = yield model.getAdminAllFlightBooking({ limit: '1' });
            const currentDate = lib_1.default.getFormattedDate(new Date());
            let booking_id = `${constants_1.PROJECT_CODE}FC-${currentDate.year + currentDate.month + currentDate.day}-`;
            if (!bookingNumber.data.length) {
                booking_id += '00001';
            }
            else {
                const lastBookingRef = bookingNumber.data[0].booking_ref.split('-')[2];
                const nextNumber = lastBookingRef == '99999'
                    ? '00001'
                    : (parseInt(lastBookingRef, 10) + 1).toString().padStart(5, '0');
                booking_id += nextNumber;
            }
            return booking_id;
        });
    }
    //check eligibility of booking
    checkEligibilityOfBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //check if passport has provided for international flight
            if (payload.is_domestic_flight === false) {
                const passport_number = !payload.passenger.some((p) => p.passport_number == null);
                if (!passport_number) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: 'Passport number is required for international flight',
                    };
                }
            }
            //check if booking block is true
            if (payload.booking_block === true) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'This flight cannot be booked now. Please contact us for more information.',
                };
            }
            // Get all passengers' first names, last names, passports, email, phone
            const passengers = payload.passenger.map((p) => ({
                first_name: p.first_name,
                last_name: p.last_name,
                passport: p.passport_number,
                email: p.contact_email,
                phone: p.contact_number,
            }));
            // Batch check if any passenger already booked this flight
            const flightModel = this.Model.btocFlightBookingModel(this.trx);
            const existingBooking = yield flightModel.checkFlightBooking({
                route: payload.route,
                departure_date: payload.departure_date,
                flight_number: payload.flight_number,
                passengers,
                status: [
                    flightConstants_1.FLIGHT_BOOKING_CONFIRMED,
                    flightConstants_1.FLIGHT_TICKET_ISSUE,
                    flightConstants_1.FLIGHT_BOOKING_IN_PROCESS,
                    flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                    flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                ],
            });
            if (existingBooking > 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'This flight is already booked with the same passenger information',
                };
            }
            const cancelledBooking = yield flightModel.checkFlightBooking({
                route: payload.route,
                departure_date: payload.departure_date,
                flight_number: payload.flight_number,
                passengers,
                status: [flightConstants_1.FLIGHT_BOOKING_CANCELLED],
            });
            if (cancelledBooking >= 2) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'You have already cancelled this booking 2 times',
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
            };
        });
    }
    //insert flight booking data
    insertFlightBookingData(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const data = payload.flight_details;
            const flightBookingModel = this.Model.btocFlightBookingModel(this.trx);
            const base_fare = data.fare.base_fare;
            const total_tax = data.fare.total_tax;
            const ait = data.fare.ait;
            let payable_amount = data.fare.payable;
            let discount = data.fare.discount;
            const convenience_fee = Number(data.fare.payable) * (1.5 / 100);
            const refundable = payload.refundable;
            const { flights, leg_description, journey_type: JourneyType } = data;
            let journey_type = flightConstants_1.JOURNEY_TYPE_ONE_WAY;
            if (JourneyType === '2') {
                journey_type = flightConstants_1.JOURNEY_TYPE_ROUND_TRIP;
            }
            if (JourneyType === '3') {
                journey_type = flightConstants_1.JOURNEY_TYPE_MULTI_CITY;
            }
            const route = lib_1.default.getRouteOfFlight(leg_description);
            const booking_ref = yield this.generateUniqueBookingNumber(this.trx);
            //insert flight booking
            const res = yield flightBookingModel.insertFlightBooking({
                booking_id: booking_ref,
                pnr_code: payload === null || payload === void 0 ? void 0 : payload.pnr,
                api_booking_ref: payload.api_booking_ref,
                total_passenger: payload.passengers.length,
                user_id: payload.user_id,
                base_fare,
                journey_type,
                payable_amount,
                total_tax,
                ait,
                convenience_fee,
                discount,
                refundable,
                api: payload.api,
                route,
                airline_pnr: payload.airline_pnr,
                last_time: payload.last_time,
                status: payload.status,
                vendor_price: payload.flight_details.fare.vendor_price,
                platform: payload.platform
            });
            const booking_code = lib_1.default.getBookingCodeOfFlight(data.availability);
            let booking_code_index = 0;
            let baggage = data.availability[0].segments[0].passenger[0].baggage_info;
            const flightSegment = [];
            const flightDetails = [];
            const segmentBody = [];
            const oldFlights = (_a = payload.old_revalidate_data) === null || _a === void 0 ? void 0 : _a.flights;
            flights.forEach((flight) => {
                flight.options.forEach((option) => {
                    var _a, _b;
                    const flight_class = lib_1.default.getFlightClass(booking_code, booking_code_index, data.availability[0]);
                    booking_code_index++;
                    //flight segment to send in the email confirmation template
                    flightSegment.push({
                        departure: `${(_a = option.departure.city) === null || _a === void 0 ? void 0 : _a.split('-')[0]}(${option.departure.airport_code}) - ${lib_1.default.formatAMPM(new Date(option.departure.date +
                            "T" +
                            (option.departure.time)))}`,
                        arrival: `${(_b = option.arrival.city) === null || _b === void 0 ? void 0 : _b.split('-')[0]}(${option.arrival.airport_code}) - ${lib_1.default.formatAMPM(new Date(option.arrival.date +
                            "T" +
                            (option.arrival.time)))}`,
                        airline: `${option.carrier.carrier_marketing_airline} - ${option.carrier.carrier_marketing_code} ${option.carrier.carrier_marketing_flight_number}`,
                        cabin: flight_class,
                    });
                    //flight segment to generate the booking pdf
                    flightDetails.push({
                        departure: option.departure.airport +
                            ' (' +
                            option.departure.city +
                            ',' +
                            option.departure.city_code +
                            ')',
                        arrival: option.arrival.airport +
                            ' (' +
                            option.arrival.city +
                            ',' +
                            option.arrival.city_code +
                            ')',
                        duration: lib_1.default.formatDuration(Number(option.elapsedTime)),
                        details: {
                            class: flight_class,
                            departure: option.departure.airport + ' (' + option.departure.city + ')',
                            lands_in: option.arrival.airport + ' (' + option.arrival.city + ')',
                        },
                        airline: {
                            name: option.carrier.carrier_marketing_airline,
                            image: `${constants_1.PROJECT_IMAGE_URL}/${option.carrier.carrier_marketing_logo}`,
                            flight_number: option.carrier.carrier_marketing_flight_number,
                        },
                        cabin: flight_class,
                        departure_date: lib_1.default.formatAMPM(new Date(option.departure.date.toString().split('T')[0] + "T" + option.departure.time.toString().split('+')[0]))
                    });
                    // Find the matching option in old_revalidate_data
                    let segment_key = option.id;
                    if (oldFlights) {
                        const oldFlight = oldFlights.find(f => f.id === flight.id);
                        const oldOption = oldFlight === null || oldFlight === void 0 ? void 0 : oldFlight.options.find(o => o.carrier.carrier_marketing_code === option.carrier.carrier_marketing_code &&
                            o.departure.airport_code === option.departure.airport_code &&
                            o.arrival.airport_code === option.arrival.airport_code &&
                            o.departure.date === option.departure.date &&
                            o.arrival.date === option.arrival.date);
                        if (oldOption) {
                            segment_key = oldOption.id;
                        }
                    }
                    //flight segment to insert in the database
                    segmentBody.push({
                        flight_booking_id: res[0].id,
                        segment_key: segment_key,
                        airline: option.carrier.carrier_marketing_airline,
                        airline_logo: option.carrier.carrier_marketing_logo,
                        arrival_date: option.arrival.date,
                        airline_code: option.carrier.carrier_marketing_code,
                        arrival_time: option.arrival.time,
                        departure_date: option.departure.date,
                        departure_time: option.departure.time,
                        baggage,
                        class: flight_class,
                        destination: option.arrival.airport +
                            ' (' +
                            option.arrival.city +
                            ',' +
                            option.arrival.city_code +
                            ')',
                        flight_number: `${option.carrier.carrier_marketing_flight_number}`,
                        origin: option.departure.airport +
                            ' (' +
                            option.departure.city +
                            ',' +
                            option.departure.city_code +
                            ')',
                        aircraft: option.carrier.carrier_aircraft_name,
                        duration: String(option.elapsedTime),
                        departure_terminal: option.departure.terminal,
                        arrival_terminal: option.arrival.terminal,
                    });
                });
            });
            yield flightBookingModel.insertFlightSegment(segmentBody);
            //insert traveler
            const save_travelers = [];
            let travelerBody;
            const travelerDetails = [];
            const passengerTypeCount = {};
            travelerBody = payload.passengers.map((obj) => {
                var _a, _b, _c, _d;
                //traveler details to generate the booking pdf
                travelerDetails.push({
                    name: String(obj === null || obj === void 0 ? void 0 : obj.reference).toUpperCase() + ' ' + obj.first_name + ' ' + obj.last_name,
                    reference: obj.reference,
                    type: obj.type,
                    gender: obj.gender,
                    dob: obj.date_of_birth,
                    phone: obj.contact_number,
                    passport_number: obj.passport_number,
                    frequent_flyer_number: obj.frequent_flyer_number,
                });
                //traveler details to insert in the database
                const { key, save_information, reference, contact_email, contact_number, last_name, _ref } = obj, rest = __rest(obj, ["key", "save_information", "reference", "contact_email", "contact_number", "last_name", "_ref"]);
                for (const file of payload.files) {
                    if (((_a = file.fieldname) === null || _a === void 0 ? void 0 : _a.split('-')[0]) === 'visa' && ((_b = file.fieldname) === null || _b === void 0 ? void 0 : _b.split('-')[1]) == key) {
                        rest['visa_file'] = file.filename;
                        obj.visa_file = file.filename;
                    }
                    else if (((_c = file.fieldname) === null || _c === void 0 ? void 0 : _c.split('-')[0]) === 'passport' &&
                        ((_d = file.fieldname) === null || _d === void 0 ? void 0 : _d.split('-')[1]) == key) {
                        rest['passport_file'] = file.filename;
                        obj.passport_file = file.filename;
                    }
                }
                if (save_information === true) {
                    save_travelers.push(Object.assign({ title: reference, sur_name: last_name, mobile_number: contact_number, email: contact_email, user_id: payload.user_id, visa_file: obj.visa_file, passport_file: obj.passport_file }, rest));
                }
                if (passengerTypeCount[obj.type]) {
                    passengerTypeCount[obj.type] += 1;
                }
                else {
                    passengerTypeCount[obj.type] = 1;
                }
                return Object.assign(Object.assign({}, rest), { last_name,
                    contact_number, title: reference, email: contact_email, flight_booking_id: res[0].id, passenger_key: key });
            });
            yield flightBookingModel.insertFlightTraveler(travelerBody);
            if (save_travelers.length) {
                yield this.Model.travelerModel(this.trx).insertTraveler(save_travelers);
            }
            yield flightBookingModel.insertFlightBookingTracking({
                flight_booking_id: res[0].id,
                details: payload.details,
            });
            //ssr
            if (payload.ssr && payload.ssr.length) {
                const ssr_payload = payload.ssr.map((elm) => {
                    return {
                        traveler_key: String(elm.passenger_key),
                        segment_key: String(elm.segment_id),
                        code: elm.code,
                        type: elm.type,
                        amount: elm.price,
                        description: elm.desc,
                        booking_id: res[0].id
                    };
                });
                yield flightBookingModel.createFlightBookingSSR(ssr_payload);
            }
            const bookingDetails = yield flightBookingModel.getSingleFlightBooking({
                id: res[0].id,
            });
            const flightBookTemplateData = {
                bookingId: booking_ref,
                airline: data.carrier_name,
                segments: flightSegment,
                numberOfPassengers: payload.passengers.length,
                route: route || '',
                journeyType: journey_type,
                totalAmount: payable_amount,
                name: payload.name,
                pnr: ((_b = payload.pnr) === null || _b === void 0 ? void 0 : _b.startsWith('NZB')) && ((_c = payload.pnr) === null || _c === void 0 ? void 0 : _c.length) > 6 ? 'N/A' : String(payload.pnr),
            };
            let checkInDetails = [];
            data.availability[0].segments[0].passenger.forEach((passenger) => {
                let typeLabel = '';
                switch (passenger.type) {
                    case 'ADT':
                        typeLabel = 'Adult';
                        break;
                    case 'INF':
                        typeLabel = 'Infant';
                        break;
                    default:
                        typeLabel = 'Child';
                        break;
                }
                if (passenger.baggage_count > 0) {
                    checkInDetails.push(`${typeLabel} Check-in: ${passenger.baggage_count} ${passenger.baggage_unit}`);
                }
            });
            const fareDetails = {
                passenger_type: Object.keys(passengerTypeCount)
                    .map((type) => `${type}(${passengerTypeCount[type]})`)
                    .join(', '),
                quantity: payload.passengers.length,
                base_fare: base_fare,
                discount: discount,
                taxes: total_tax,
                total: payable_amount,
            };
            //flight booking pdf
            const flightBookingPdfData = {
                date_of_issue: new Date(bookingDetails[0].created_at).toISOString().split('T')[0],
                bookingId: booking_ref,
                bookingStatus: bookingDetails[0].booking_status,
                pnr: ((_d = payload.pnr) === null || _d === void 0 ? void 0 : _d.startsWith('NZB')) && ((_e = payload.pnr) === null || _e === void 0 ? void 0 : _e.length) > 6 ? 'N/A' : String(payload.pnr),
                airlinePnr: payload.airline_pnr || '-',
                route: route,
                numberOfPassengers: payload.passengers.length,
                journeyType: journey_type,
                segments: flightDetails,
                passengers: travelerDetails,
                fare: fareDetails,
                baggage_information: {
                    route: route,
                    check_in: checkInDetails.join(', '),
                },
            };
            const bookingEmailSubService = new sendBookingMailSupport_service_1.SendBookingEmailService();
            yield bookingEmailSubService.sendFlightBookingEmail({
                flightBookingPdfData,
                flightBookTemplateData,
                email: payload.email,
                bookingId: booking_ref,
                panel: "B2C"
            });
            //send notification to admin
            const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(this.trx);
            yield adminNotificationSubService.insertNotification({
                message: `A flight has been booked through B2C. Booking ID: ${booking_ref}.`,
                ref_id: res[0].id,
                type: constants_1.NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING,
            });
            return {
                booking_id: res[0].id,
                booking_ref,
            };
        });
    }
    //update from api
    updateFromApi(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //sabre
            if (payload.singleBookData[0].status === flightConstants_1.FLIGHT_BOOKING_CONFIRMED ||
                payload.singleBookData[0].status === flightConstants_1.FLIGHT_BOOKING_IN_PROCESS ||
                payload.singleBookData[0].status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                if (payload.singleBookData[0].api === flightConstants_1.SABRE_API) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(this.trx);
                    const res = yield sabreSubService.GRNUpdate({
                        pnr: payload.singleBookData[0].pnr_code,
                        booking_status: payload.singleBookData[0].status,
                    });
                    if (res.success &&
                        (res.status !== payload.singleBookData[0].status ||
                            payload.singleBookData[0].last_time !== res.last_time ||
                            payload.singleBookData[0].airline_pnr !== res.airline_pnr)) {
                        this.updateBooking({
                            booking_id: Number(payload.booking_id),
                            last_time: res.last_time || undefined,
                            status: res.status || undefined,
                            ticket_number: res.ticket_number || undefined,
                            airline_pnr: res.airline_pnr || undefined,
                        });
                    }
                }
            }
        });
    }
    //update booking
    updateBooking(_a) {
        return __awaiter(this, arguments, void 0, function* ({ status, booking_id, ticket_number, last_time, airline_pnr, }) {
            const model = this.Model.btocFlightBookingModel();
            yield model.updateBooking({ status, last_time, airline_pnr }, booking_id);
            if (ticket_number.length) {
                const getTraveler = yield model.getFlightTraveler(Number(booking_id));
                for (let i = 0; i < getTraveler.length; i++) {
                    yield model.updateTravelers({ ticket_number: ticket_number === null || ticket_number === void 0 ? void 0 : ticket_number[i] }, getTraveler[i].id);
                }
            }
        });
    }
    checkDirectFlightBookingPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { commission_set_id, api_name, airline } = payload;
            const commissionSetFlightApiModel = this.Model.commissionSetModel(this.trx);
            const setFlightApis = yield commissionSetFlightApiModel.getSetFlightAPI({
                set_id: commission_set_id,
                api_name,
            });
            if (!setFlightApis.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.SET_FLIGHT_API_ID_NOT_FOUND,
                };
            }
            const setFlightApiId = (_a = setFlightApis === null || setFlightApis === void 0 ? void 0 : setFlightApis[0]) === null || _a === void 0 ? void 0 : _a.id;
            if (!setFlightApiId) {
                return {
                    booking_block: false,
                };
            }
            const apiAirlinesBlockModel = this.Model.apiAirlinesBlockModel(this.trx);
            const [flightCommissionData] = yield apiAirlinesBlockModel.getAirlineBlock(airline, setFlightApiId, true);
            return {
                booking_block: (_b = flightCommissionData === null || flightCommissionData === void 0 ? void 0 : flightCommissionData.booking_block) !== null && _b !== void 0 ? _b : false,
            };
        });
    }
    //ticket issue sub service
    ticketIssueSubService(booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const flightBookingModel = this.Model.btocFlightBookingModel(this.trx);
            //check booking info
            const [checkFlightBooking, flightSegments, flightTravelers] = yield Promise.all([
                flightBookingModel.getSingleFlightBooking({
                    id: Number(booking_id),
                }),
                flightBookingModel.getFlightSegment(Number(booking_id)),
                flightBookingModel.getFlightTraveler(Number(booking_id)),
            ]);
            if (!checkFlightBooking.length) {
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2C Ticket issue Response`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2C',
                    metadata: {
                        message: "No booking has been found with this ID",
                        payload: { booking_id },
                        response: checkFlightBooking,
                    },
                });
                throw new customError_1.default('No booking has been found with this ID', this.StatusCode.HTTP_NOT_FOUND);
            }
            if (![flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_BOOKING_IN_PROCESS].includes(checkFlightBooking[0].status)) {
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2C Ticket issue Response`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2C',
                    metadata: {
                        message: "Booking status is not valid for issue. Contact support",
                        payload: { booking_id },
                        response: checkFlightBooking,
                    },
                });
                throw new customError_1.default('Booking status is not valid for issue. Contact support', this.StatusCode.HTTP_NOT_FOUND);
            }
            let ticketIssueRes = {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: this.ResMsg.HTTP_BAD_REQUEST,
                data: [],
            };
            const getTraveler = yield flightBookingModel.getFlightTraveler(Number(booking_id));
            if (checkFlightBooking[0].api === flightConstants_1.SABRE_API) {
                const travelerSet = new Set(getTraveler.map((elem) => elem.type));
                const unique_traveler = travelerSet.size;
                //sabre
                const sabreSubService = new sabreFlightSupport_service_1.default(this.trx);
                ticketIssueRes = yield sabreSubService.TicketIssueService({
                    pnr: checkFlightBooking[0].pnr_code,
                    unique_traveler,
                });
            }
            else if (checkFlightBooking[0].api === flightConstants_1.VERTEIL_API) {
                const segmentDetails = yield flightBookingModel.getFlightSegment(Number(booking_id));
                const travelerDetails = yield flightBookingModel.getFlightTraveler(Number(booking_id));
                const verteilSubService = new verteilFlightSupport_service_1.default(this.trx);
                ticketIssueRes = yield verteilSubService.TicketIssueService({
                    airlineCode: segmentDetails[0].airline_code,
                    oldFare: { vendor_total: checkFlightBooking[0].vendor_price.net_fare },
                    passengers: travelerDetails,
                    pnr: checkFlightBooking[0].pnr_code,
                });
            }
            else if (checkFlightBooking[0].api === flightConstants_1.TRIPJACK_API) {
                const tripjackSubService = new tripjackFlightSupport_service_1.default(this.trx);
                ticketIssueRes = yield tripjackSubService.TicketIssueService({
                    api_booking_ref: checkFlightBooking[0].api_booking_ref,
                    vendor_total_price: checkFlightBooking[0].vendor_price.gross_fare,
                });
                const getBooking = yield tripjackSubService.RetrieveBookingService(checkFlightBooking[0].api_booking_ref);
                ticketIssueRes.data = getBooking.ticket_numbers;
            }
            if (ticketIssueRes.success === true) {
                //update booking
                yield flightBookingModel.updateBooking({
                    status: ((_a = ticketIssueRes.data) === null || _a === void 0 ? void 0 : _a.length) === 0 ? flightConstants_1.FLIGHT_BOOKING_ON_HOLD : flightConstants_1.FLIGHT_TICKET_ISSUE,
                    ticket_issued_on: new Date(),
                }, Number(booking_id));
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
                //update ticket number
                if (getTraveler.length !== ((_b = ticketIssueRes.data) === null || _b === void 0 ? void 0 : _b.length)) {
                    yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref} | B2C`, (0, flightBookingHoldTemplate_1.flightBookStatusTemplate)({
                        bookingId: checkFlightBooking[0].booking_ref,
                        airline: flightSegments[0].airline,
                        segments: flightDetails,
                        journeyType: checkFlightBooking[0].journey_type,
                        numberOfPassengers: flightTravelers.length,
                        route: checkFlightBooking[0].route,
                        status: flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                        name: checkFlightBooking[0].first_name + ' ' + checkFlightBooking[0].last_name,
                    }));
                    yield lib_1.default.sendEmail(checkFlightBooking[0].email, `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref}`, (0, flightBookingHoldTemplate_1.flightBookStatusTemplate)({
                        bookingId: checkFlightBooking[0].booking_ref,
                        airline: flightSegments[0].airline,
                        segments: flightDetails,
                        journeyType: checkFlightBooking[0].journey_type,
                        numberOfPassengers: flightTravelers.length,
                        route: checkFlightBooking[0].route,
                        status: flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                        name: checkFlightBooking[0].first_name + ' ' + checkFlightBooking[0].last_name,
                    }));
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Ticket has been issued. Ticket numbers have not generated yet.',
                    };
                }
                yield Promise.all(ticketIssueRes.data.map((ticket_num, ind) => flightBookingModel.updateTravelers({ ticket_number: ticket_num }, getTraveler[ind].id)));
                if (((_c = ticketIssueRes.data) === null || _c === void 0 ? void 0 : _c.length) && ((_d = ticketIssueRes.data) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                    const flightBookingPdfData = {
                        date_of_issue: new Date().toISOString().split('T')[0],
                        bookingId: checkFlightBooking[0].booking_ref,
                        bookingStatus: checkFlightBooking[0].booking_status,
                        pnr: ((_e = checkFlightBooking[0].pnr_code) === null || _e === void 0 ? void 0 : _e.startsWith('NZB')) &&
                            ((_f = checkFlightBooking[0].pnr_code) === null || _f === void 0 ? void 0 : _f.length) > 6
                            ? 'N/A'
                            : String(checkFlightBooking[0].pnr_code),
                        airlinePnr: checkFlightBooking[0].airline_pnr,
                        numberOfPassengers: flightTravelers.length,
                        journeyType: checkFlightBooking[0].journey_type,
                        segments: flightDetails,
                        passengers: flightTravelers.map((traveler, index) => ({
                            name: String(traveler.title).toUpperCase() +
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
                        baggage_information: {
                            route: checkFlightBooking[0].route,
                            check_in: flightSegments
                                .map((segment) => {
                                return `${segment.flight_number} (${segment.airline}) - Baggage info: ${segment.baggage}`;
                            })
                                .join(','),
                        },
                    };
                    // send email notification
                    const bookingEmailSubService = new sendBookingMailSupport_service_1.SendBookingEmailService();
                    yield bookingEmailSubService.sendFlightTicketIssuedEmail({
                        flightBookTemplateData: {
                            travel_date: flightSegments[0].departure_date,
                            ticket_numbers: ticketIssueRes.data || [],
                            journey_type: checkFlightBooking[0].journey_type,
                            payable_amount: checkFlightBooking[0].payable_amount,
                            route: checkFlightBooking[0].route,
                            total_passenger: checkFlightBooking[0].total_passenger,
                            due_amount: checkFlightBooking[0].due,
                        },
                        flightBookingPdfData: flightBookingPdfData,
                        bookingId: (_g = checkFlightBooking[0]) === null || _g === void 0 ? void 0 : _g.booking_ref,
                        email: checkFlightBooking[0].email,
                        panel: 'B2C',
                    });
                }
            }
            else {
                //update booking
                yield flightBookingModel.updateBooking({
                    status: flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                    ticket_issued_on: new Date(),
                }, Number(booking_id));
                const flightDetails = flightSegments.map((segment) => ({
                    departure: `${segment.origin}`,
                    arrival: `${segment.destination}`,
                    airline: {
                        name: segment.airline,
                        image: `${constants_1.PROJECT_IMAGE_URL}/${segment.airline_logo}`,
                        flight_number: segment.flight_number,
                    },
                    cabin: segment.class,
                    departure_date: lib_1.default.formatAMPM(new Date(segment.departure_date.toISOString().split('T')[0] +
                        'T' +
                        segment.departure_time.split('+')[0]))
                }));
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Ticket is in process for Booking ID: ${checkFlightBooking[0].booking_ref} | B2C`, (0, flightBookingHoldTemplate_1.flightBookStatusTemplate)({
                    bookingId: checkFlightBooking[0].booking_ref,
                    airline: flightSegments[0].airline,
                    segments: flightDetails,
                    journeyType: checkFlightBooking[0].journey_type,
                    numberOfPassengers: flightTravelers.length,
                    route: checkFlightBooking[0].route,
                    status: flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                    name: checkFlightBooking[0].first_name + ' ' + checkFlightBooking[0].last_name,
                }));
                yield lib_1.default.sendEmail(checkFlightBooking[0].email, `Ticket is in process for Booking ID: ${checkFlightBooking[0].booking_ref}`, (0, flightBookingHoldTemplate_1.flightBookStatusTemplate)({
                    bookingId: checkFlightBooking[0].booking_ref,
                    airline: flightSegments[0].airline,
                    segments: flightDetails,
                    journeyType: checkFlightBooking[0].journey_type,
                    numberOfPassengers: flightTravelers.length,
                    route: checkFlightBooking[0].route,
                    status: flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                    name: checkFlightBooking[0].first_name + ' ' + checkFlightBooking[0].last_name,
                }));
            }
        });
    }
}
exports.BtoCFlightBookingSubService = BtoCFlightBookingSubService;
