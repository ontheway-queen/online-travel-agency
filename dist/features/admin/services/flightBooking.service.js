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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const flightBookingCancelTemplates_1 = require("../../../utils/templates/flightBookingCancelTemplates");
const BtoCFlightBookingSubService_1 = require("../../b2c/services/subServices/BtoCFlightBookingSubService");
const sabreFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const sendBookingMailSupport_service_1 = require("../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service");
const verteilFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service"));
const tripjackFlightSupport_service_1 = __importDefault(require("../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service"));
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
const invoice_service_1 = require("../../b2c/services/subServices/invoice.service");
class adminFlightBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get all flight booking
    getAllFlightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status, limit, skip, from_date, to_date, name } = req.query;
            const flightBookingModel = this.Model.btocFlightBookingModel();
            const { data, total } = yield flightBookingModel.getAdminAllFlightBooking({
                limit: limit,
                skip: skip,
                status: status,
                from_date: from_date,
                to_date: to_date,
                name: name,
            });
            return {
                success: true,
                data,
                total,
                code: this.StatusCode.HTTP_OK,
            };
        });
    }
    // get single flight booking
    getSingleFlightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const model = this.Model.btocFlightBookingModel();
                const checkBooking = yield model.getSingleFlightBooking({
                    id: Number(id),
                });
                if (!checkBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const getTraveler = yield model.getFlightTraveler(Number(id));
                const getSegments = yield model.getFlightSegment(Number(id));
                const paymentModel = this.Model.paymentModel();
                const invoiceData = yield paymentModel.getInvoiceByBookingId(Number(id), 'flight');
                //update from api
                yield new BtoCFlightBookingSubService_1.BtoCFlightBookingSubService(trx).updateFromApi({
                    singleBookData: checkBooking,
                    booking_id: Number(id),
                    traveler: getTraveler,
                    segment: getSegments,
                });
                //get ssr
                const ssr = yield model.getFlightBookingSSR(Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, checkBooking[0]), { invoice_id: invoiceData.length ? invoiceData[0].id : null, segments: getSegments, traveler: getTraveler, ssr }),
                };
            }));
        });
    }
    // cancel flight booking
    cancelFlightBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const flightBookingModel = this.Model.btocFlightBookingModel(trx);
                const { id: booking_id } = req.params;
                let { id } = req.admin;
                // console.log("booking ID :", booking_id);
                const checkFlightBooking = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(booking_id),
                });
                // console.log(checkFlightBooking);
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
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    yield sabreSubService.SabreBookingCancelService({
                        pnr: checkFlightBooking[0].pnr_code,
                    });
                    cancelBookingRes.success = true;
                    cancelBookingRes.message = "Booking has been cancelled";
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
                    cancelBookingRes.success = true;
                }
                else if (checkFlightBooking[0].api === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    cancelBookingRes = yield tripjackSubService.CancelBookingService(checkFlightBooking[0].api_booking_ref, checkFlightBooking[0].airline_pnr);
                }
                if (cancelBookingRes.success === true) {
                    yield flightBookingModel.updateBooking({ status: flightConstants_1.FLIGHT_BOOKING_CANCELLED }, parseInt(booking_id));
                    //delete invoice
                    yield this.Model.paymentModel(trx).updateInvoice({ status: false }, checkFlightBooking[0].invoice_id);
                    // send email
                    yield lib_1.default.sendEmail(checkFlightBooking[0].email, `Your ${checkFlightBooking[0].route} flight booking has been canceled`, (0, flightBookingCancelTemplates_1.template_onCancelFlightBooking_send_to_user)({
                        journey_type: checkFlightBooking[0].journey_type,
                        payable_amount: checkFlightBooking[0].payable_amount,
                        pnr: ((_a = checkFlightBooking[0].pnr_code) === null || _a === void 0 ? void 0 : _a.startsWith("NZB")) &&
                            ((_b = checkFlightBooking[0].pnr_code) === null || _b === void 0 ? void 0 : _b.length) > 6
                            ? "N/A"
                            : String(checkFlightBooking[0].pnr_code),
                        route: checkFlightBooking[0].route,
                        total_passenger: checkFlightBooking[0].total_passenger,
                    }));
                    yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Your ${checkFlightBooking[0].route} flight booking has been canceled`, (0, flightBookingCancelTemplates_1.template_onCancelFlightBooking_send_to_user)({
                        journey_type: checkFlightBooking[0].journey_type,
                        payable_amount: checkFlightBooking[0].payable_amount,
                        pnr: ((_c = checkFlightBooking[0].pnr_code) === null || _c === void 0 ? void 0 : _c.startsWith("NZB")) &&
                            ((_d = checkFlightBooking[0].pnr_code) === null || _d === void 0 ? void 0 : _d.length) > 6
                            ? "N/A"
                            : String(checkFlightBooking[0].pnr_code),
                        route: checkFlightBooking[0].route,
                        total_passenger: checkFlightBooking[0].total_passenger,
                    }));
                }
                return cancelBookingRes;
            }));
        });
    }
    //ticket issue
    ticketIssue(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.btocFlightBookingModel(trx);
                //check booking info
                const [checkFlightBooking, flightSegments, flightTravelers] = yield Promise.all([
                    flightBookingModel.getSingleFlightBooking({
                        id: Number(booking_id),
                    }),
                    flightBookingModel.getFlightSegment(Number(booking_id)),
                    flightBookingModel.getFlightTraveler(Number(booking_id)),
                ]);
                // console.log(checkFlightBooking);
                if (!checkFlightBooking.length) {
                    return {
                        success: false,
                        message: 'Payment for the booking is still pending.',
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                let ticketIssueRes = {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                    data: [],
                };
                const getTraveler = yield flightBookingModel.getFlightTraveler(Number(booking_id));
                // console.log('get traveler', getTraveler);
                // console.log('called--------------------------------------');
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
                    const travelerDetails = yield flightBookingModel.getFlightTraveler(Number(booking_id));
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
                // console.log('ticket Issue Response', ticketIssueRes);
                // console.log('------------called again -------------------------------');
                //if issue is successful, update the booking status
                if (ticketIssueRes.success === true) {
                    //update booking
                    yield flightBookingModel.updateBooking({
                        status: ((_a = ticketIssueRes.data) === null || _a === void 0 ? void 0 : _a.length) === 0
                            ? flightConstants_1.FLIGHT_BOOKING_ON_HOLD
                            : flightConstants_1.FLIGHT_TICKET_ISSUE,
                        ticket_issued_on: new Date(),
                    }, Number(booking_id));
                    //update ticket number
                    if (getTraveler.length !== ((_b = ticketIssueRes.data) === null || _b === void 0 ? void 0 : _b.length)) {
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_OK,
                            message: 'Ticket has been issued. Ticket numbers have not generated yet.',
                        };
                    }
                    yield Promise.all(ticketIssueRes.data.map((ticket_num, ind) => flightBookingModel.updateTravelers({ ticket_number: ticket_num }, getTraveler[ind].id)));
                    if (((_c = ticketIssueRes.data) === null || _c === void 0 ? void 0 : _c.length) && ((_d = ticketIssueRes.data) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                        const travelers = flightTravelers.map((traveler) => ({
                            type: traveler.type,
                        }));
                        const travelerCount = travelers.reduce((acc, traveler) => {
                            acc[traveler.type] = (acc[traveler.type] || 0) + 1;
                            return acc;
                        }, {});
                        const formatDuration = (minutes) => {
                            const hrs = Math.floor(minutes / 60);
                            const mins = minutes % 60;
                            return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? "s" : ""} ` : ""}${mins > 0 ? `${mins} minute${mins > 1 ? "s" : ""}` : ""}`.trim();
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
                            departure_date: lib_1.default.formatAMPM(new Date(segment.departure_date.toISOString().split("T")[0] +
                                "T" +
                                segment.departure_time.split("+")[0])),
                        }));
                        const flightBookingPdfData = {
                            date_of_issue: new Date().toISOString().split('T')[0],
                            bookingId: checkFlightBooking[0].booking_ref,
                            bookingStatus: checkFlightBooking[0].booking_status,
                            pnr: ((_e = checkFlightBooking[0].pnr_code) === null || _e === void 0 ? void 0 : _e.startsWith("NZB")) &&
                                ((_f = checkFlightBooking[0].pnr_code) === null || _f === void 0 ? void 0 : _f.length) > 6
                                ? "N/A"
                                : String(checkFlightBooking[0].pnr_code),
                            airlinePnr: checkFlightBooking[0].airline_pnr,
                            numberOfPassengers: flightTravelers.length,
                            journeyType: checkFlightBooking[0].journey_type,
                            segments: flightDetails,
                            passengers: flightTravelers.map((traveler, index) => ({
                                name: traveler.first_name + ' ' + traveler.last_name,
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
                        });
                    }
                }
                return ticketIssueRes;
            }));
        });
    }
    //update blocked booking
    updateBlockedBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id } = req.params;
                const payload = req.body;
                const adminId = req.admin.id;
                const b2cFlightBookingModel = this.Model.btocFlightBookingModel(trx);
                const invoiceModel = this.Model.paymentModel(trx);
                const [booking] = yield b2cFlightBookingModel.getSingleFlightBooking({
                    id,
                });
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { invoice_id, booking_ref, status: booking_status } = booking;
                if (![flightConstants_1.FLIGHT_BOOKING_IN_PROCESS, flightConstants_1.FLIGHT_BOOKING_PAID, flightConstants_1.FLIGHT_BOOKING_CONFIRMED].includes(booking_status)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: `Booking update is not allowed. The booking is already in '${booking_status}' status.`,
                    };
                }
                if (payload.status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                    const { data: [invoice] = [] } = yield invoiceModel.getInvoice({
                        invoice_id,
                    });
                    if (!invoice) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.HTTP_NOT_FOUND,
                        };
                    }
                    if (Number(invoice.due) > 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: `Since there is a due amount for the booking, make sure the payment is cleared before issuing it. the BookingId: '${booking_ref}'`,
                        };
                    }
                    if ((_a = payload.ticket_numbers) === null || _a === void 0 ? void 0 : _a.length) {
                        yield Promise.all(payload.ticket_numbers.map(({ ticket_number, traveler_id }) => b2cFlightBookingModel.updateTravelers({ ticket_number }, traveler_id)));
                    }
                }
                if (payload.status === flightConstants_1.FLIGHT_BOOKING_CANCELLED) {
                    yield invoiceModel.updateInvoice({ status: false }, invoice_id);
                }
                yield b2cFlightBookingModel.updateBooking({
                    status: payload.status,
                    last_time: payload.last_time,
                    airline_pnr: payload.airline_pnr,
                    pnr_code: payload.pnr_code,
                    api_booking_ref: payload.api_booking_ref,
                    cancelled_by: payload.status === flightConstants_1.FLIGHT_BOOKING_CANCELLED ? adminId : undefined,
                }, id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    //update booking
    updateBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { status, deduction_amount, gds_pnr, airline_pnr, ticket_numbers, ticket_issue_last_time, } = req.body;
                const btocBookingModel = this.Model.btocFlightBookingModel(trx);
                const booking_data = yield btocBookingModel.getSingleFlightBooking({
                    id,
                });
                //check the booking
                if (!booking_data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //update status
                if (status !== booking_data[0].booking_status) {
                    yield btocBookingModel.updateBooking({
                        status,
                        pnr_code: gds_pnr,
                        airline_pnr,
                        last_time: ticket_issue_last_time,
                    }, id);
                }
                //refund amount
                if (deduction_amount) {
                    const invoice_id = booking_data[0].invoice_id;
                    const invoiceModel = this.Model.paymentModel(trx);
                    const getInvoice = yield invoiceModel.getInvoice({ invoice_id });
                    //check the invoice
                    if (!getInvoice.data.length) {
                        throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                    }
                    //check if already refunded
                    if (getInvoice.data[0].refund_amount) {
                        throw new customError_1.default("Amount has been refunded already", this.StatusCode.HTTP_CONFLICT);
                    }
                    //paid amount
                    const paidAmount = Number(getInvoice.data[0].total_amount) - Number(getInvoice.data[0].due);
                    //check if the paid amount is less then the deducted amount
                    if (Number(paidAmount) < Number(deduction_amount)) {
                        throw new customError_1.default("Deduction amount is less then the paid amount", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    //update invoice due, refund amount
                    yield invoiceModel.updateInvoice({ refund_amount: deduction_amount }, invoice_id);
                }
                //ticket issue
                if (status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                    if (ticket_numbers === null || ticket_numbers === void 0 ? void 0 : ticket_numbers.length) {
                        yield Promise.all(ticket_numbers.map(({ ticket_number, traveler_id }) => btocBookingModel.updateTravelers({ ticket_number }, traveler_id)));
                    }
                }
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `B2C booking has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'B2C booking has been updated',
                    details: {
                        details: `B2C booking ${booking_data[0].booking_ref} has been updated to ${status}`,
                    },
                }));
                yield lib_1.default.sendEmail(booking_data[0].booking_data, `B2C booking has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'B2C booking has been updated',
                    details: {
                        details: `B2C booking ${booking_data[0].booking_ref} has been updated to ${status}`,
                    },
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    //fetch data from API
    fetchDataFromAPI(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.btocFlightBookingModel(trx);
                const { id } = req.params;
                const booking_details = yield model.getSingleFlightBooking({ id });
                if (!booking_details.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                let status = booking_details[0].booking_status;
                let ticket_numbers = [];
                let airline_pnr = booking_details[0].airline_pnr;
                let gds_pnr = booking_details[0].pnr_code;
                let ticket_issue_last_time = booking_details[0].last_time;
                if (booking_details[0].api === flightConstants_1.SABRE_API) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    const res = yield sabreSubService.GRNUpdate({ pnr: gds_pnr });
                    if (!res.success) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'No data has been found from the SABRE API',
                        };
                    }
                    status = res.status;
                    ticket_numbers = res.ticket_number;
                    airline_pnr = res.airline_pnr;
                    ticket_issue_last_time = res.last_time;
                }
                else if (booking_details[0].api === flightConstants_1.VERTEIL_API) {
                    const segmentData = yield model.getFlightSegment(id);
                    const passengerData = yield model.getFlightTraveler(id);
                    const verteilSubService = new verteilFlightSupport_service_1.default(trx);
                    const res = yield verteilSubService.OrderRetrieveService({
                        airlineCode: segmentData[0].airline_code,
                        pnr: booking_details[0].pnr_code,
                        passengers: passengerData,
                    });
                    if (!res.success) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'No data has been found from the VERTEIL API',
                        };
                    }
                    if (res.flightTickets && res.flightTickets.length) {
                        res.flightTickets.map((elm) => {
                            ticket_numbers.push(elm.number);
                        });
                    }
                    gds_pnr = res.pnr_code;
                    airline_pnr = res.pnr_code;
                    ticket_issue_last_time = res.paymentTimeLimit;
                }
                else if (booking_details[0].api === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    const res = yield tripjackSubService.RetrieveBookingService(booking_details[0].api_booking_ref);
                    status = res.status;
                    ticket_numbers = res.ticket_numbers;
                    gds_pnr = res.gds_pnr;
                    airline_pnr = res.airline_pnr;
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Custom API cannot be fetched!',
                    };
                }
                // update booking data
                const effectiveAirlinePnr = airline_pnr || booking_details[0].airline_pnr;
                const effectiveGdsPnr = gds_pnr || booking_details[0].pnr_code;
                const needsUpdate = status !== booking_details[0].booking_status ||
                    effectiveAirlinePnr !== booking_details[0].airline_pnr ||
                    effectiveGdsPnr !== booking_details[0].pnr_code ||
                    ticket_issue_last_time !== booking_details[0].last_time;
                if (needsUpdate) {
                    yield model.updateBooking({
                        status,
                        last_time: ticket_issue_last_time,
                        airline_pnr: effectiveAirlinePnr,
                        pnr_code: effectiveGdsPnr,
                    }, id);
                }
                // update ticket numbers
                if (ticket_numbers.length) {
                    const travelers = yield model.getFlightTraveler(id);
                    for (let i = 0; i < travelers.length; i++) {
                        const currentTicket = travelers[i].ticket_number;
                        const newTicket = ticket_numbers[i];
                        if (newTicket && newTicket !== currentTicket) {
                            yield model.updateTravelers({ ticket_number: newTicket }, travelers[i].id);
                        }
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Booking data has been fetched from API',
                };
            }));
        });
    }
    editBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: booking_id } = req.params;
                const model = this.Model.btocFlightBookingModel(trx);
                const get_booking = yield model.getSingleFlightBooking({
                    id: Number(booking_id),
                });
                if (!get_booking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const body = req.body;
                if (body.pnr_code || body.airline_pnr || body.last_time || body.status) {
                    let ticket_issued_on = undefined;
                    if (!get_booking[0].ticket_issued_on &&
                        body.status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                        ticket_issued_on = new Date();
                    }
                    yield model.updateBooking({
                        pnr_code: body.pnr_code,
                        airline_pnr: body.airline_pnr,
                        last_time: body.last_time,
                        status: body.status,
                        ticket_issued_on,
                    }, Number(booking_id));
                }
                if (body.segments && body.segments.length) {
                    yield Promise.all(body.segments.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        const { id } = elem, rest = __rest(elem, ["id"]);
                        const checkData = yield model.getFlightSegment(Number(booking_id), elem.id);
                        if (!checkData.length) {
                            throw new customError_1.default("Segment not found", 404);
                        }
                        yield model.updateSegments(rest, id);
                    })));
                }
                if (body.travelers && body.travelers.length) {
                    yield Promise.all(body.travelers.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        const { id } = elem, rest = __rest(elem, ["id"]);
                        const checkData = yield model.getFlightTraveler(Number(booking_id), elem.id);
                        if (!checkData.length) {
                            throw new customError_1.default("Traveler not found", 404);
                        }
                        yield model.updateTravelers(rest, id);
                    })));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Booking has been updated",
                };
            }));
        });
    }
    sendBookingMail(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.btocFlightBookingModel(trx);
                //check booking info
                const [checkFlightBooking, flightSegments, flightTravelers] = yield Promise.all([
                    flightBookingModel.getSingleFlightBooking({
                        id: Number(booking_id),
                    }),
                    flightBookingModel.getFlightSegment(Number(booking_id)),
                    flightBookingModel.getFlightTraveler(Number(booking_id)),
                ]);
                if (!checkFlightBooking.length) {
                    throw new customError_1.default("No booking has been found with this ID", this.StatusCode.HTTP_NOT_FOUND);
                }
                const formatDuration = (minutes) => {
                    const hrs = Math.floor(minutes / 60);
                    const mins = minutes % 60;
                    return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? "s" : ""} ` : ""}${mins > 0 ? `${mins} minute${mins > 1 ? "s" : ""}` : ""}`.trim();
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
                    departure_date: lib_1.default.formatAMPM(new Date(segment.departure_date.toISOString().split("T")[0] +
                        "T" +
                        segment.departure_time.split("+")[0])),
                }));
                const flightBookingPdfData = {
                    date_of_issue: new Date().toISOString().split('T')[0],
                    bookingId: checkFlightBooking[0].booking_ref,
                    bookingStatus: checkFlightBooking[0].booking_status,
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
                yield bookingEmailSubService.sendFlightDetailsEmail({
                    flightBookingPdfData: flightBookingPdfData,
                    bookingId: (_a = checkFlightBooking[0]) === null || _a === void 0 ? void 0 : _a.booking_ref,
                    email: checkFlightBooking[0].email,
                    name: checkFlightBooking[0].agency_name,
                    status: checkFlightBooking[0].status,
                    pnr: checkFlightBooking[0].prn_code
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Mail has been send",
                };
            }));
        });
    }
    manualBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const model = this.Model.btocFlightBookingModel(trx);
                const userModel = this.Model.userModel(trx);
                const getUser = yield userModel.getProfileDetails({ id: body.user_id });
                if (!getUser.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const ticket_price = body.base_fare + body.total_tax + body.ait;
                const payable_amount = ticket_price + body.convenience_fee + body.markup - body.discount;
                let vendor_price = undefined;
                if (body.vendor_price) {
                    vendor_price = Object.assign(Object.assign({}, body.vendor_price), { gross_fare: body.vendor_price.base_fare + body.vendor_price.tax, net_fare: body.vendor_price.base_fare +
                            body.vendor_price.tax +
                            body.vendor_price.charge -
                            body.vendor_price.discount });
                }
                const route = lib_1.default.getRouteOfFlight(body.leg_description);
                const booking_ref = yield new BtoCFlightBookingSubService_1.BtoCFlightBookingSubService().generateUniqueBookingNumber(trx);
                const booking_id = yield model.insertFlightBooking({
                    user_id: body.user_id,
                    pnr_code: body.pnr_code,
                    total_passenger: body.travelers.length,
                    base_fare: Number(body.base_fare + body.markup),
                    total_tax: body.total_tax,
                    payable_amount,
                    ait: body.ait,
                    discount: body.discount,
                    convenience_fee: body.convenience_fee,
                    refundable: body.refundable,
                    api: body.api,
                    journey_type: body.journey_type,
                    route,
                    booking_id: booking_ref,
                    airline_pnr: body.airline_pnr,
                    api_booking_ref: body.api_booking_ref,
                    last_time: body.last_time,
                    status: body.status,
                    vendor_price,
                    manual_booking: true,
                    ticket_issued_on: body.status === flightConstants_1.FLIGHT_TICKET_ISSUE ? new Date() : undefined
                });
                const segments = yield Promise.all(body.flights.map((flight) => __awaiter(this, void 0, void 0, function* () {
                    const airline_details = yield this.Model.commonModel(trx).getAirlineDetails(flight.airline_code);
                    const dAirport = yield this.Model.commonModel(trx).getAirportDetails(flight.origin);
                    const AAirport = yield this.Model.commonModel(trx).getAirportDetails(flight.destination);
                    return {
                        flight_booking_id: booking_id[0].id,
                        airline: airline_details.airline_name,
                        airline_logo: airline_details.airline_logo,
                        airline_code: flight.airline_code,
                        departure_date: flight.departure_date,
                        departure_time: flight.departure_time,
                        departure_terminal: flight.departure_terminal,
                        arrival_date: flight.arrival_date,
                        arrival_time: flight.arrival_time,
                        arrival_terminal: flight.arrival_terminal,
                        baggage: flight.baggage,
                        class: flight.class,
                        origin: dAirport.airport_name + ' (' + dAirport.city_name + ',' + dAirport.city_code + ')',
                        destination: AAirport.airport_name + ' (' + AAirport.city_name + ',' + AAirport.city_code + ')',
                        flight_number: flight.flight_number,
                        aircraft: flight.aircraft,
                        duration: String((new Date(`${flight.arrival_date}T${flight.arrival_time}`).getTime() -
                            new Date(`${flight.departure_date}T${flight.departure_time}`).getTime()) /
                            60000),
                    };
                })));
                yield model.insertFlightSegment(segments);
                const files = req.files || [];
                const travelers = body.travelers.map((traveler) => {
                    var _a, _b, _c, _d;
                    const { key, reference, phone } = traveler, rest = __rest(traveler, ["key", "reference", "phone"]);
                    for (const file of files) {
                        if (((_a = file.fieldname) === null || _a === void 0 ? void 0 : _a.split('-')[0]) === 'visa' && ((_b = file.fieldname) === null || _b === void 0 ? void 0 : _b.split('-')[1]) == key) {
                            rest['visa_file'] = file.filename;
                        }
                        else if (((_c = file.fieldname) === null || _c === void 0 ? void 0 : _c.split('-')[0]) === 'passport' &&
                            ((_d = file.fieldname) === null || _d === void 0 ? void 0 : _d.split('-')[1]) == key) {
                            rest['passport_file'] = file.filename;
                        }
                    }
                    return Object.assign({ flight_booking_id: booking_id[0].id, title: reference, contact_number: phone }, rest);
                });
                yield model.insertFlightTraveler(travelers);
                let paid_amount = 0;
                let due = payable_amount;
                if (body.status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                    if (body.paid === true) {
                        paid_amount = payable_amount;
                        due = 0;
                    }
                }
                //create invoice and send invoice mail
                const invoiceSubService = new invoice_service_1.BtoCInvoiceService(trx);
                const invoice = yield invoiceSubService.createInvoice({
                    user_id: body.user_id,
                    ref_id: booking_id[0].id,
                    ref_type: constants_1.INVOICE_TYPE_FLIGHT,
                    total_amount: payable_amount,
                    due,
                    details: `Invoice has been created for flight Id ${booking_ref}`,
                    user_name: getUser[0].first_name + " " + getUser[0].last_name,
                    email: getUser[0].email,
                    total_travelers: body.travelers.length,
                    travelers_type: constants_1.TRAVELER_TYPE_PASSENGERS,
                    bookingId: booking_ref,
                });
                yield model.insertFlightBookingTracking({
                    flight_booking_id: booking_id[0].id,
                    details: `Manual booking has been created. Status - ${body.status}`,
                });
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Manual booking has been created`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'Manual booking has been created',
                    details: {
                        details: `A new booking has been created for user ${getUser[0].first_name + " " + getUser[0].last_name}. Booking ID: ${booking_ref}`,
                    },
                }));
                //send mail to agency
                yield lib_1.default.sendEmail(getUser[0].email, `A new booking has been created`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'A new booking has been created kindly check the details',
                    details: {
                        details: `A new booking has been created with Booking ID: ${booking_ref}`,
                    },
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Manual booking has been created',
                    data: {
                        id: booking_id[0].id,
                    },
                };
            }));
        });
    }
    // get Pnr Details
    getPnrDetails(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { agency_id, pnr, gds } = req.body;
                const model = this.Model.btocFlightBookingModel(trx);
                const b2cMarkup = yield this.Model.DynamicFareModel(trx).getB2CCommission();
                if (!((_a = b2cMarkup === null || b2cMarkup === void 0 ? void 0 : b2cMarkup[0]) === null || _a === void 0 ? void 0 : _a.commission_set_id)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'No markup set has been found for B2C. Please set a markup first.',
                    };
                }
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const set_flight_api_id = yield dynamicFareModel.getSuppliers({
                    set_id: b2cMarkup[0].commission_set_id,
                    status: true,
                    api_name: gds,
                });
                if (!set_flight_api_id.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: `For this markup set ${gds} is not active. Please active the API first.`,
                    };
                }
                //check pnr if it already exists
                const check_pnr = yield model.getAdminAllFlightBooking({
                    limit: '1',
                    skip: '0',
                    pnr,
                });
                if (check_pnr.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'PNR already exists',
                    };
                }
                let res;
                if (gds === flightConstants_1.SABRE_API) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    res = yield sabreSubService.pnrShare(pnr, set_flight_api_id[0].id);
                }
                else if (gds === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    res = yield tripjackSubService.pnrShareService(pnr, set_flight_api_id[0].id);
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No GDS has been found with this name',
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({}, res), { agency_id }),
                };
            }));
        });
    }
}
exports.default = adminFlightBookingService;
