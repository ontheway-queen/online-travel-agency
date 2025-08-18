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
exports.BtoBFlightBookingSubService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const ticketIssueTemplates_1 = require("../../../../utils/templates/ticketIssueTemplates");
const adminNotificationSubService_1 = require("../../../admin/services/subServices/adminNotificationSubService");
const sabreFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const sendBookingMailSupport_service_1 = require("../../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service");
class BtoBFlightBookingSubService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    //generate unique booking number
    generateUniqueBookingNumber(trx) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.b2bFlightBookingModel(trx);
            const bookingNumber = yield model.getAllFlightBooking({ limit: '1' });
            const currentDate = lib_1.default.getFormattedDate(new Date());
            let booking_id = `${constants_1.PROJECT_CODE}FB-${currentDate.year + currentDate.month + currentDate.day}-`;
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
    //check if the agency has enough balance for ticket issue
    checkAgencyBalanceForTicketIssue(body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (body.payment_type === 'full') {
                if (Number(body.ticket_price) > Number(body.agency_balance)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'There is insufficient balance in your account',
                    };
                }
            }
            else if (body.payment_type === 'partial') {
                if (Number(body.ticket_price) * Number(body.partial_payment_percentage) >
                    Number(body.agency_balance)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'There is insufficient balance in your account',
                    };
                }
            }
            return { success: true, code: this.StatusCode.HTTP_OK };
        });
    }
    //update data after ticket issue
    updateDataAfterTicketIssue(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const flightBookingModel = this.Model.b2bFlightBookingModel(this.trx);
            const agencyModel = this.Model.agencyModel(this.trx);
            const paymentModel = this.Model.btobPaymentModel(this.trx);
            //update status of the booking
            yield flightBookingModel.updateBooking({
                status: body.status || flightConstants_1.FLIGHT_TICKET_ISSUE,
                ticket_issued_on: new Date(),
            }, body.booking_id);
            yield flightBookingModel.insertFlightBookingTracking({
                flight_booking_id: body.booking_id,
                details: `Ticket has been issued by ${body.issued_by}. Payment type - ${body.payment_type} payment`,
            });
            const checkPayment = yield paymentModel.singleInvoice(body.invoice_id);
            let paid_amount = Number(checkPayment[0].total_amount) - checkPayment[0].due;
            if (Number(checkPayment[0].total_amount) === Number(checkPayment[0].due)) {
                //debit amount from the agency
                paid_amount =
                    body.payment_type === 'full'
                        ? body.payable_amount
                        : body.payable_amount * Number(body.partial_payment_percentage);
                yield agencyModel.insertAgencyLedger({
                    agency_id: body.agency_id,
                    type: 'debit',
                    amount: paid_amount,
                    details: `Debit for ticket issuance - Booking ID: ${body.booking_ref} with ${body.payment_type} payment`,
                });
                //update due
                yield paymentModel.updateInvoice({ due: Number(body.payable_amount) - Number(paid_amount) }, body.invoice_id);
                //create money receipt
                yield paymentModel.createMoneyReceipt({
                    amount: paid_amount,
                    invoice_id: body.invoice_id,
                    details: `${body.payment_type} payment has been done for booking id ${body.booking_ref}`,
                    user_id: body.user_id,
                });
            }
            //update ticket number
            if (body.ticket_number &&
                body.travelers_info &&
                body.travelers_info.length === body.ticket_number.length) {
                yield Promise.all(body.ticket_number.map((ticket_num, ind) => flightBookingModel.updateFlightBookingTraveler({ ticket_number: ticket_num }, body.travelers_info ? body.travelers_info[ind].id : 0)));
            }
        });
    }
    //pending ticket issuance
    insertPendingTicketIssue(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                console.log(body);
                const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const paymentModel = this.Model.btobPaymentModel(trx);
                // await flightBookingModel.insertPendingTicketIssuance({
                //   booking_id: Number(body.booking_id),
                //   user_id: body.user_id,
                //   api: body.api,
                // });
                //update status of the booking
                yield flightBookingModel.updateBooking({
                    status: flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                    ticket_issued_on: new Date(),
                }, body.booking_id);
                yield flightBookingModel.insertFlightBookingTracking({
                    flight_booking_id: body.booking_id,
                    details: `Booking status ${flightConstants_1.FLIGHT_TICKET_IN_PROCESS} (${body.details}). Payment type - ${body.payment_type} payment`,
                });
                const checkPayment = yield paymentModel.singleInvoice(body.invoice_id);
                let paid_amount = Number(checkPayment[0].total_amount) - checkPayment[0].due;
                if (Number(checkPayment[0].total_amount) === Number(checkPayment[0].due)) {
                    //debit amount from the agency
                    paid_amount =
                        body.payment_type === 'full'
                            ? body.payable_amount
                            : body.payable_amount * body.partial_payment_percentage;
                    yield agencyModel.insertAgencyLedger({
                        agency_id: body.agency_id,
                        type: 'debit',
                        amount: paid_amount,
                        details: `Debit for ticket issuance - Booking ID: ${body.booking_ref} with ${body.payment_type} payment`,
                    });
                    //update due
                    yield paymentModel.updateInvoice({ due: Number(body.payable_amount) - Number(paid_amount) }, body.invoice_id);
                    //create money receipt
                    yield paymentModel.createMoneyReceipt({
                        amount: paid_amount,
                        invoice_id: body.invoice_id,
                        details: `${body.payment_type} payment has been done for booking id ${body.booking_ref}`,
                        user_id: body.user_id,
                    });
                }
                const due = Number(body.payable_amount) - Number(paid_amount);
                const flightBookTemplateData = {
                    travel_date: body.departure_date,
                    ticket_numbers: [],
                    journey_type: body.journey_type,
                    payable_amount: body.payable_amount,
                    route: body.route,
                    total_passenger: body.total_passenger,
                    due_amount: due,
                    logo: `${constants_1.PROJECT_IMAGE_URL}/${body.agency_logo}`,
                };
                //send email to admin and agent
                //admin
                yield lib_1.default.sendEmail(constants_1.PROJECT_EMAIL_API_1, `Ticket in process for Booking ID: ${body.booking_ref}`, (0, ticketIssueTemplates_1.template_onTicketInProcess)(flightBookTemplateData));
                //agent
                yield lib_1.default.sendEmail(body.email, `Ticket in process for Booking ID: ${body.booking_ref}`, (0, ticketIssueTemplates_1.template_onTicketInProcess)(flightBookTemplateData));
            }));
        });
    }
    //cancel booking
    cancelBooking(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const flightBookingModel = this.Model.b2bFlightBookingModel(this.trx);
            //update the status to cancelled
            yield flightBookingModel.updateBooking({ status: flightConstants_1.FLIGHT_BOOKING_CANCELLED, cancelled_by: body.cancelled_by }, body.booking_id);
            yield flightBookingModel.insertFlightBookingTracking({
                flight_booking_id: body.booking_id,
                details: `Booking has been cancelled by ${body.cancelled_from}`,
            });
            //get invoice
            const invoice = yield this.Model.btobPaymentModel(this.trx).singleInvoice(body.invoice_id);
            if (!invoice.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: 'No invoice has been found',
                };
            }
            const total_amount = invoice[0].total_amount;
            const due = invoice[0].due;
            const paid_amount = Number(total_amount) - Number(due);
            if (paid_amount > 0) {
                //return the amount
                yield this.Model.agencyModel(this.trx).insertAgencyLedger({
                    agency_id: invoice[0].agency_id,
                    amount: paid_amount,
                    type: 'credit',
                    details: `Flight booking - ${body.booking_ref} has been cancelled. Paid amount ${paid_amount} has been returned to the account.`,
                });
            }
            //delete invoice
            if (body.invoice_id) {
                yield this.Model.btobPaymentModel(this.trx).updateInvoice({ status: false }, body.invoice_id);
            }
        });
    }
    //check ticket issue block
    checkTicketIssueBlock(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            //get commission set id
            const agency_info = yield this.Model.agencyModel(this.trx).getSingleAgency(body.agency_id);
            //get set flight api id
            const apiData = yield this.Model.commissionSetModel(this.trx).getSetFlightAPI({
                set_id: agency_info[0].commission_set_id,
                api_name: body.api,
            });
            const set_flight_api_id = (_a = apiData === null || apiData === void 0 ? void 0 : apiData[0]) === null || _a === void 0 ? void 0 : _a.id;
            if (!set_flight_api_id) {
                return false;
            }
            //check ticket issue block
            const checkAirline = yield this.Model.apiAirlinesBlockModel(this.trx).getAirlineBlock(body.airline, set_flight_api_id, true);
            if (checkAirline.length) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    //update from api
    updateFromAPI(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const model = this.Model.b2bFlightBookingModel(this.trx);
            const { data, booking_id, traveler, segment } = payload;
            let booking_status;
            let ticket_numbers = [];
            if ([flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_TICKET_ISSUE, flightConstants_1.FLIGHT_TICKET_IN_PROCESS].includes(data[0].booking_status)) {
                if (data[0].api === constants_1.SABRE_API) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(this.trx);
                    const res = yield sabreSubService.GRNUpdate({
                        pnr: data[0].pnr_code,
                        booking_status: data[0].booking_status,
                    });
                    booking_status = res.status;
                    ticket_numbers = res.ticket_number;
                    if (res.success &&
                        (res.status !== data[0].booking_status ||
                            data[0].last_time !== res.last_time ||
                            data[0].airline_pnr !== res.airline_pnr)) {
                        this.updateBooking({
                            booking_id: Number(booking_id),
                            last_time: res.last_time || undefined,
                            status: res.status || undefined,
                            ticket_number: res.ticket_number || undefined,
                            airline_pnr: res.airline_pnr || undefined,
                        });
                    }
                }
            }
            if (data[0].booking_status !== flightConstants_1.FLIGHT_TICKET_ISSUE && booking_status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                const bookingEmailSubService = new sendBookingMailSupport_service_1.SendBookingEmailService();
                yield bookingEmailSubService.sendFlightTicketIssuedEmail({
                    flightBookTemplateData: {
                        travel_date: segment[0].departure_date,
                        ticket_numbers,
                        journey_type: data[0].journey_type,
                        payable_amount: data[0].payable_amount,
                        route: data[0].route,
                        total_passenger: data[0].total_passenger,
                        due_amount: data[0].due,
                    },
                    flightBookingPdfData: {
                        date_of_issue: new Date(data[0].ticket_issued_on || data[0].booking_created_at)
                            .toISOString()
                            .split('T')[0],
                        bookingId: data[0].booking_ref,
                        bookingStatus: data[0].booking_status,
                        pnr: ((_a = data[0].pnr_code) === null || _a === void 0 ? void 0 : _a.startsWith('NZB')) && ((_b = data[0].pnr_code) === null || _b === void 0 ? void 0 : _b.length) > 6
                            ? 'N/A'
                            : String(data[0].pnr_code),
                        airlinePnr: data[0].airline_pnr,
                        route: data[0].route,
                        totalPassenger: data[0].total_passenger,
                        journeyType: data[0].journey_type,
                        segments: segment.map((seg) => ({
                            departure: seg.origin,
                            arrival: seg.destination,
                            duration: seg.duration,
                            details: {
                                class: seg.class,
                                departure: seg.origin.split('(')[0].trim(),
                                lands_in: seg.destination.split('(')[0].trim(),
                            },
                            airline: {
                                name: seg.airline,
                                image: `${constants_1.PROJECT_IMAGE_URL}/${seg.airline_logo}`,
                                flight_number: seg.flight_number,
                            },
                            cabin: seg.class,
                            departure_date: seg.departure_date.toISOString().split('T')[0] +
                                ' ' +
                                seg.departure_time.split('+')[0],
                        })),
                        passengers: traveler.map((t, index) => ({
                            name: `${t.reference} ${t.first_name} ${t.last_name}`,
                            passport_number: t.passport_number,
                            frequent_flyer_number: t.frequent_flyer_number,
                            ticket: (ticket_numbers === null || ticket_numbers === void 0 ? void 0 : ticket_numbers[index]) || '',
                        })),
                        baggage_information: {
                            route: data[0].route,
                            check_in: segment
                                .map((seg) => `${seg.flight_number} (${seg.airline}) - Baggage info: ${seg.baggage}`)
                                .join(', '),
                        },
                        agency: {
                            email: (_c = data[0]) === null || _c === void 0 ? void 0 : _c.agency_email,
                            phone: (_d = data[0]) === null || _d === void 0 ? void 0 : _d.agency_phone,
                            address: (_e = data[0]) === null || _e === void 0 ? void 0 : _e.agency_address,
                            photo: `${constants_1.PROJECT_IMAGE_URL}/${(_f = data[0]) === null || _f === void 0 ? void 0 : _f.agency_logo}`,
                            name: (_g = data[0]) === null || _g === void 0 ? void 0 : _g.agency_name,
                        },
                    },
                    bookingId: (_h = data[0]) === null || _h === void 0 ? void 0 : _h.booking_ref,
                    email: data[0].user_email,
                });
            }
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
            yield model.insertFlightBookingTracking({
                flight_booking_id: booking_id,
                details: `Booking has been updated automatically using retrieve API`,
            });
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
            const flightModel = this.Model.b2bFlightBookingModel(this.trx);
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
                    message: 'Booking has been cancelled 2 times with the same information',
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
            };
        });
    }
    checkDirectFlightBookingPermission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
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
            const setFlightApiId = setFlightApis[0].id;
            const apiAirlinesBlockModel = this.Model.apiAirlinesBlockModel(this.trx);
            const [flightCommissionData] = yield apiAirlinesBlockModel.getAirlineBlock(airline, setFlightApiId, true);
            return {
                booking_block: (_a = flightCommissionData === null || flightCommissionData === void 0 ? void 0 : flightCommissionData.booking_block) !== null && _a !== void 0 ? _a : false,
            };
        });
    }
    //insert flight booking data
    insertFlightBookingData(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const data = payload.flight_details;
            const flightBookingModel = this.Model.b2bFlightBookingModel(this.trx);
            const base_fare = data.fare.base_fare;
            const total_tax = data.fare.total_tax;
            const ait = data.fare.ait;
            let payable_amount = data.fare.payable;
            let discount = data.fare.discount;
            const convenience_fee = payload.convenience_fee;
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
            if (payload.api === flightConstants_1.TRIPJACK_API) {
            }
            //insert flight booking
            const res = yield flightBookingModel.insertFlightBooking({
                booking_id: booking_ref,
                pnr_code: payload.pnr,
                api_booking_ref: payload.api_booking_ref,
                total_passenger: payload.passengers.length,
                agency_id: payload.agency_id,
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
                created_by: payload.created_by,
                status: payload.status,
                vendor_price: payload.flight_details.fare.vendor_price,
                partial_payment: data.partial_payment,
            });
            if (payload.fare_rules) {
                yield flightBookingModel.insertFlightFareRules({
                    flight_booking_id: res[0].id,
                    rule_text: payload.fare_rules,
                });
            }
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
                        departure: `${(_a = option.departure.city) === null || _a === void 0 ? void 0 : _a.split('-')[0]}(${option.departure.airport_code}) - ${option.departure.date}, ${lib_1.default.convertToLocaleString(option.departure.time)}`,
                        arrival: `${(_b = option.arrival.city) === null || _b === void 0 ? void 0 : _b.split('-')[0]}(${option.arrival.airport_code}) - ${option.arrival.date}, ${lib_1.default.convertToLocaleString(option.arrival.time)}`,
                        airline: `${option.carrier.carrier_marketing_airline} - ${option.carrier.carrier_marketing_code} ${option.carrier.carrier_marketing_flight_number}`,
                        cabin: flight_class,
                    });
                    //flight segment to generate the booking pdf
                    flightDetails.push({
                        departure: `${option.departure.city} ${option.departure.airport_code} ${option.departure.terminal}`,
                        arrival: `${option.arrival.city} ${option.arrival.airport_code} ${option.arrival.terminal}`,
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
                        departure_date: lib_1.default.formatAMPM(new Date(option.departure.date.toString().split('T')[0] +
                            'T' +
                            option.departure.time.toString().split('+')[0])),
                    });
                    // Find the matching option in old_revalidate_data
                    let segment_key = option.id;
                    if (oldFlights) {
                        const oldFlight = oldFlights.find((f) => f.id === flight.id);
                        const oldOption = oldFlight === null || oldFlight === void 0 ? void 0 : oldFlight.options.find((o) => o.carrier.carrier_marketing_code === option.carrier.carrier_marketing_code &&
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
                    name: String(obj.reference).toUpperCase() + ' ' + obj.first_name + ' ' + obj.last_name,
                    reference: obj.reference,
                    type: obj.type,
                    gender: obj.gender,
                    dob: obj.date_of_birth,
                    phone: obj.contact_number,
                    passport_number: obj.passport_number,
                    frequent_flyer_number: obj.frequent_flyer_number,
                });
                //traveler details to insert in the database
                const { key, save_information, reference, contact_email, contact_number, last_name, passport_expiry_date, _ref } = obj, rest = __rest(obj, ["key", "save_information", "reference", "contact_email", "contact_number", "last_name", "passport_expiry_date", "_ref"]);
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
                    save_travelers.push(Object.assign({ reference: reference, sur_name: last_name, phone: contact_number, email: contact_email, agency_id: payload.agency_id, visa_file: obj.visa_file, passport_file: obj.passport_file, passport_expire_date: passport_expiry_date }, rest));
                }
                if (passengerTypeCount[obj.type]) {
                    passengerTypeCount[obj.type] += 1;
                }
                else {
                    passengerTypeCount[obj.type] = 1;
                }
                return Object.assign(Object.assign({}, rest), { last_name, phone: contact_number, reference, email: contact_email, flight_booking_id: res[0].id, passport_expiry_date, passenger_key: key });
            });
            yield flightBookingModel.insertFlightTraveler(travelerBody);
            if (save_travelers.length) {
                yield this.Model.agencyModel(this.trx).insertTraveler(save_travelers);
            }
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
                        booking_id: res[0].id,
                    };
                });
                yield flightBookingModel.createFlightBookingSSR(ssr_payload);
            }
            yield flightBookingModel.insertFlightBookingTracking({
                flight_booking_id: res[0].id,
                details: payload.details,
            });
            //send mail to the agent
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
                date_of_issue: 'N/A',
                bookingId: booking_ref,
                bookingStatus: bookingDetails[0].booking_status,
                pnr: String(payload.pnr),
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
                panel: "B2B"
            });
            //send notification to admin
            const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(this.trx);
            yield adminNotificationSubService.insertNotification({
                message: `A flight has been booked through B2B. Booking ID: ${booking_ref}`,
                ref_id: res[0].id,
                type: constants_1.NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
            });
            return {
                booking_id: res[0].id,
                booking_ref,
            };
        });
    }
}
exports.BtoBFlightBookingSubService = BtoBFlightBookingSubService;
