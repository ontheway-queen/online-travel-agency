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
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const flightConstants_1 = require("../../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const sabreFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service"));
const BtoBFlightBookingSubService_1 = require("../../../agent/services/subServices/BtoBFlightBookingSubService");
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
const flightBookingCancelTemplates_1 = require("../../../../utils/templates/flightBookingCancelTemplates");
const constants_1 = require("../../../../utils/miscellaneous/constants");
const sendBookingMailSupport_service_1 = require("../../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service");
const customError_1 = __importDefault(require("../../../../utils/lib/customError"));
const verteilFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service"));
const tripjackFlightSupport_service_1 = __importDefault(require("../../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service"));
const payment_service_1 = require("../../../agent/services/subServices/payment.service");
const adminNotificationTemplate_1 = require("../../../../utils/templates/adminNotificationTemplate");
const flightBookingHoldTemplate_1 = require("../../../../utils/templates/flightBookingHoldTemplate");
class AdminAgentFlightService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //Flight booking cancel
    flightBookingCancel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { id: user_id } = req.admin;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
                //check booking info
                const checkFlightBooking = yield flightBookingModel.getSingleFlightBooking({
                    id: Number(booking_id),
                    status: [flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_TICKET_IN_PROCESS],
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
                    cancelBookingRes.success = true;
                    cancelBookingRes.message = 'Booking has been cancelled successfully';
                }
                else if (checkFlightBooking[0].api === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    cancelBookingRes = yield tripjackSubService.CancelBookingService(checkFlightBooking[0].api_booking_ref, checkFlightBooking[0].airline_pnr);
                }
                //if cancellation is successful, update the booking status
                if (cancelBookingRes.success === true) {
                    // await flightBookingModel.updateBooking(
                    //   { status: FLIGHT_BOOKING_CANCEL, cancelled_by: user_id },
                    //   Number(booking_id)
                    // );
                    // //delete invoice
                    // if (checkFlightBooking[0].invoice_id) {
                    //   await this.Model.btobPaymentModel(trx).updateInvoice(
                    //     { status: false },
                    //     checkFlightBooking[0].invoice_id
                    //   );
                    // }
                    const subService = new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx);
                    yield subService.cancelBooking({
                        booking_id: Number(booking_id),
                        booking_ref: checkFlightBooking[0].booking_ref,
                        cancelled_by: user_id,
                        invoice_id: checkFlightBooking[0].invoice_id,
                        cancelled_from: 'ADMIN',
                    });
                    // await Lib.sendEmail(
                    //   checkFlightBooking[0].user_email ||
                    //     checkFlightBooking[0].agency_email,
                    //   `Your flight booking (${checkFlightBooking[0].route}) has been Cancelled`,
                    //   template_onCancelFlightBooking_send_to_agent({
                    //     pnr:
                    //       checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
                    //       checkFlightBooking[0].pnr_code?.length > 6
                    //         ? 'N/A'
                    //         : String(checkFlightBooking[0].pnr_code),
                    //     journey_type: checkFlightBooking[0].journey_type,
                    //     payable_amount: checkFlightBooking[0].payable_amount,
                    //     route: checkFlightBooking[0].route,
                    //     total_passenger: checkFlightBooking[0].total_passenger,
                    //   })
                    // );
                    yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Your flight booking (${checkFlightBooking[0].route}) has been Cancelled`, (0, flightBookingCancelTemplates_1.template_onCancelFlightBooking_send_to_agent)({
                        pnr: ((_a = checkFlightBooking[0].pnr_code) === null || _a === void 0 ? void 0 : _a.startsWith('NZB')) &&
                            ((_b = checkFlightBooking[0].pnr_code) === null || _b === void 0 ? void 0 : _b.length) > 6
                            ? 'N/A'
                            : String(checkFlightBooking[0].pnr_code),
                        journey_type: checkFlightBooking[0].journey_type,
                        payable_amount: checkFlightBooking[0].payable_amount,
                        route: checkFlightBooking[0].route,
                        total_passenger: checkFlightBooking[0].total_passenger,
                    }));
                }
                return cancelBookingRes;
            }));
        });
    }
    //get list of booking
    getBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.b2bFlightBookingModel();
            const data = yield model.getAllFlightBooking(Object.assign({}, query));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    //get single booking
    getBookingSingle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id: booking_id } = req.params;
                const model = this.Model.b2bFlightBookingModel(trx);
                const data = yield model.getSingleFlightBooking({
                    id: Number(booking_id),
                });
                const segment = yield model.getFlightSegment(Number(booking_id));
                const traveler = yield model.getFlightBookingTraveler(Number(booking_id));
                const tracking = yield model.getFlightBookingTracking(Number(booking_id));
                const fare_rules = yield model.getFlightFareRules({ flight_booking_id: Number(booking_id) });
                //update data from external api
                yield new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx).updateFromAPI({
                    data,
                    booking_id,
                    segment,
                    traveler,
                });
                let due_clear_last_day = undefined;
                const travel_date_from_now = (_a = data[0].partial_payment) === null || _a === void 0 ? void 0 : _a.travel_date_from_now;
                if (typeof travel_date_from_now === 'number' && travel_date_from_now > 0) {
                    due_clear_last_day = new Date(new Date(segment[0].departure_date).setDate(new Date(segment[0].departure_date).getDate() - travel_date_from_now))
                        .toISOString()
                        .split('T')[0];
                    data[0].partial_payment.travel_date_from_now = due_clear_last_day;
                }
                const balance = yield this.Model.agencyModel(trx).getTotalBalance(Number(data[0].agency_id));
                data[0].balance = balance;
                const ssr = yield model.getFlightBookingSSR(Number(booking_id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, data[0]), { segment, traveler, tracking, ssr, fare_rules }),
                };
            }));
        });
    }
    //Ticket Issue
    ticketIssue(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                //check booking info
                const [checkFlightBooking, flightSegments, flightTravelers] = yield Promise.all([
                    flightBookingModel.getSingleFlightBooking({
                        id: Number(booking_id),
                        status: [flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_TICKET_IN_PROCESS],
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
                // //check balance
                // const balance = await agencyModel.getTotalDeposit(
                //   checkFlightBooking[0].agency_id
                // );
                // // console.log({ balance });
                // if (Number(checkFlightBooking[0].payable_amount) > Number(balance)) {
                //   return {
                //     success: false,
                //     code: this.StatusCode.HTTP_BAD_REQUEST,
                //     message: "There is insufficient balance in agency account",
                //   };
                // }
                let ticketIssueRes = {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                    data: [],
                };
                const getTraveler = yield flightBookingModel.getFlightBookingTraveler(Number(booking_id));
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
                //if issue is successful, update the booking status and debit the amount
                if (ticketIssueRes.success === true) {
                    //update booking data
                    const flightBookingSubService = new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx);
                    yield flightBookingSubService.updateDataAfterTicketIssue({
                        booking_id: Number(booking_id),
                        agency_id: checkFlightBooking[0].agency_id,
                        payable_amount: checkFlightBooking[0].payable_amount,
                        booking_ref: checkFlightBooking[0].booking_ref,
                        payment_type: 'full',
                        invoice_id: checkFlightBooking[0].invoice_id,
                        ticket_number: ticketIssueRes.data,
                        travelers_info: getTraveler,
                        user_id: checkFlightBooking[0].user_id,
                        status: ((_a = ticketIssueRes.data) === null || _a === void 0 ? void 0 : _a.length) === 0 ? flightConstants_1.FLIGHT_BOOKING_ON_HOLD : flightConstants_1.FLIGHT_TICKET_ISSUE,
                        issued_by: 'ADMIN',
                        partial_payment_percentage: 0,
                    });
                    //if status was ticket-in-process, then approve the request for pending ticket issuance
                    if (checkFlightBooking[0].booking_status === flightConstants_1.FLIGHT_TICKET_IN_PROCESS) {
                        yield flightBookingModel.updateTicketIssuance({
                            status: flightConstants_1.PENDING_TICKET_ISSUANCE_STATUS.APPROVED,
                            updated_at: new Date(),
                        }, { booking_id: Number(booking_id) });
                    }
                    if (((_b = ticketIssueRes.data) === null || _b === void 0 ? void 0 : _b.length) && ((_c = ticketIssueRes.data) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                        const travelers = flightTravelers.map((traveler) => ({
                            type: traveler.type,
                        }));
                        const travelerCount = travelers.reduce((acc, traveler) => {
                            acc[traveler.type] = (acc[traveler.type] || 0) + 1;
                            return acc;
                        }, {});
                        const formattedPassengerType = Object.entries(travelerCount)
                            .map(([type, count]) => `${type}(${count})`)
                            .join(', ');
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
                            pnr: ((_d = checkFlightBooking[0].pnr_code) === null || _d === void 0 ? void 0 : _d.startsWith('NZB')) &&
                                ((_e = checkFlightBooking[0].pnr_code) === null || _e === void 0 ? void 0 : _e.length) > 6
                                ? 'N/A'
                                : String(checkFlightBooking[0].pnr_code),
                            airlinePnr: checkFlightBooking[0].airline_pnr,
                            numberOfPassengers: flightTravelers.length,
                            journeyType: checkFlightBooking[0].journey_type,
                            segments: flightDetails,
                            passengers: flightTravelers.map((traveler, index) => ({
                                name: String(traveler === null || traveler === void 0 ? void 0 : traveler.reference).toUpperCase() +
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
                                email: (_f = checkFlightBooking[0]) === null || _f === void 0 ? void 0 : _f.agency_email,
                                phone: (_g = checkFlightBooking[0]) === null || _g === void 0 ? void 0 : _g.agency_phone,
                                address: (_h = checkFlightBooking[0]) === null || _h === void 0 ? void 0 : _h.agency_address,
                                photo: `${constants_1.PROJECT_IMAGE_URL}/${(_j = checkFlightBooking[0]) === null || _j === void 0 ? void 0 : _j.agency_logo}`,
                                name: (_k = checkFlightBooking[0]) === null || _k === void 0 ? void 0 : _k.agency_name,
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
                            bookingId: booking_id,
                            email: checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
                        });
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
                // insert audit trail
                // await this.Model.auditTrailModel(trx).createBtoBAudit({
                //   agency_id,
                //   type: "update",
                //   created_by: user_id,
                //   details: `Ticket issued for booking ID: ${booking_id}.`,
                // });
                // Insert audit trail
                return ticketIssueRes;
            }));
        });
    }
    //update booking
    updateBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { status, deduction_amount, gds_pnr, payment, airline_pnr, ticket_numbers, ticket_issue_last_time, } = req.body;
                const b2bBookingModel = this.Model.b2bFlightBookingModel(trx);
                const booking_data = yield b2bBookingModel.getSingleFlightBooking({ id });
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
                    yield b2bBookingModel.updateBooking({
                        status,
                        pnr_code: gds_pnr,
                        airline_pnr,
                        last_time: ticket_issue_last_time,
                    }, id);
                }
                //refund amount
                if (deduction_amount && deduction_amount > 0) {
                    const invoice_id = booking_data[0].invoice_id;
                    const invoiceModel = this.Model.btobPaymentModel(trx);
                    const getInvoice = yield invoiceModel.getInvoice({ invoice_id });
                    //check the invoice
                    if (!getInvoice.data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.HTTP_NOT_FOUND,
                        };
                    }
                    //check if already refunded
                    if (getInvoice.data[0].refund_amount) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: 'Amount has been refunded already',
                        };
                    }
                    //paid amount
                    const paidAmount = Number(getInvoice.data[0].total_amount) - Number(getInvoice.data[0].due);
                    //check if the paid amount is less then the deducted amount
                    if (Number(paidAmount) < Number(deduction_amount)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Deduction amount is less then the paid amount',
                        };
                    }
                    const returnAmount = Number(paidAmount) - Number(deduction_amount);
                    //update invoice due, refund amount
                    yield invoiceModel.updateInvoice({ refund_amount: deduction_amount, due: 0 }, invoice_id);
                    //credit amount to agency
                    const agencyModel = this.Model.agencyModel(trx);
                    yield agencyModel.insertAgencyLedger({
                        agency_id: booking_data[0].agency_id,
                        amount: returnAmount,
                        type: 'credit',
                        details: `Amount refunded for booking id ${booking_data[0].booking_ref} invoice id ${getInvoice.data[0].invoice_number}`,
                    });
                }
                //ticket issue
                if (status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                    const invoiceModel = this.Model.btobPaymentModel(trx);
                    const { invoice_id, agency_id, booking_ref, user_id } = booking_data[0];
                    const { data: [invoice] = [] } = yield invoiceModel.getInvoice({
                        invoice_id,
                    });
                    if (payment) {
                        if (!invoice) {
                            throw new customError_1.default('No invoice found', this.StatusCode.HTTP_NOT_FOUND);
                        }
                        if (invoice.due > 0) {
                            const agencyModel = this.Model.agencyModel(trx);
                            const balance = yield agencyModel.getTotalBalance(agency_id);
                            if (balance < invoice.due) {
                                throw new customError_1.default(this.ResMsg.INSUFFICIENT_AGENCY_BALANCE, this.StatusCode.HTTP_BAD_REQUEST);
                            }
                            yield invoiceModel.updateInvoice({ due: 0 }, invoice_id);
                            yield invoiceModel.createMoneyReceipt({
                                amount: invoice.due,
                                invoice_id,
                                details: `payment has been done for booking id ${booking_ref}`,
                                user_id: user_id,
                            });
                            yield agencyModel.insertAgencyLedger({
                                agency_id,
                                amount: invoice.due,
                                type: 'debit',
                                details: `Amount deducted for ticket issuance — Booking ID ${booking_ref}, Invoice ID ${invoice.invoice_number}`,
                            });
                        }
                    }
                }
                if (ticket_numbers === null || ticket_numbers === void 0 ? void 0 : ticket_numbers.length) {
                    yield Promise.all(ticket_numbers.map(({ ticket_number, traveler_id }) => b2bBookingModel.updateFlightBookingTraveler({ ticket_number }, traveler_id)));
                }
                yield b2bBookingModel.insertFlightBookingTracking({
                    flight_booking_id: Number(id),
                    details: `Booking has been updated manually. Status - ${status}`,
                });
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Agency booking has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'Agency booking has been updated',
                    details: {
                        details: `Agency booking has been updated manually to ${status}`,
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
    // Add a reminder to issue the flight
    reminderBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const { id: booking_id } = req.params;
            const flightBookingModel = this.Model.b2bFlightBookingModel();
            //check booking info
            const [checkFlightBooking, flightSegments, flightTravelers] = yield Promise.all([
                flightBookingModel.getSingleFlightBooking({
                    id: Number(booking_id),
                    status: [flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_TICKET_IN_PROCESS],
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
            if (checkFlightBooking[0].booking_status === flightConstants_1.FLIGHT_BOOKING_CONFIRMED ||
                checkFlightBooking[0].booking_status === flightConstants_1.FLIGHT_BOOKING_IN_PROCESS) {
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
                    pnr: ((_a = checkFlightBooking[0].pnr_code) === null || _a === void 0 ? void 0 : _a.startsWith('NZB')) &&
                        ((_b = checkFlightBooking[0].pnr_code) === null || _b === void 0 ? void 0 : _b.length) > 6
                        ? 'N/A'
                        : String(checkFlightBooking[0].pnr_code),
                    airlinePnr: checkFlightBooking[0].airline_pnr,
                    numberOfPassengers: flightTravelers.length,
                    journeyType: checkFlightBooking[0].journey_type,
                    segments: flightDetails,
                    passengers: flightTravelers.map((traveler, index) => ({
                        name: String(traveler === null || traveler === void 0 ? void 0 : traveler.reference).toUpperCase() +
                            ' ' +
                            traveler.first_name +
                            ' ' +
                            traveler.last_name,
                        gender: traveler.gender,
                        dob: traveler.date_of_birth,
                        phone: traveler.contact_number,
                        reference: traveler.reference,
                        ticket: traveler.ticket_number ? traveler.ticket_number : '',
                        type: traveler.type,
                        passport_number: traveler.passport_number,
                        frequent_flyer_number: traveler.frequent_flyer_number,
                    })),
                    agency: {
                        email: (_c = checkFlightBooking[0]) === null || _c === void 0 ? void 0 : _c.agency_email,
                        phone: (_d = checkFlightBooking[0]) === null || _d === void 0 ? void 0 : _d.agency_phone,
                        address: (_e = checkFlightBooking[0]) === null || _e === void 0 ? void 0 : _e.agency_address,
                        photo: `${constants_1.PROJECT_IMAGE_URL}/${(_f = checkFlightBooking[0]) === null || _f === void 0 ? void 0 : _f.agency_logo}`,
                        name: (_g = checkFlightBooking[0]) === null || _g === void 0 ? void 0 : _g.agency_name,
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
                // send email notification
                const bookingEmailSubService = new sendBookingMailSupport_service_1.SendBookingEmailService();
                yield bookingEmailSubService.sendReminderToIssueTicket({
                    flightBookTemplateData: {
                        travel_date: flightSegments[0].departure_date,
                        ticket_numbers: [],
                        journey_type: checkFlightBooking[0].journey_type,
                        payable_amount: checkFlightBooking[0].payable_amount,
                        route: checkFlightBooking[0].route,
                        total_passenger: checkFlightBooking[0].total_passenger,
                        due_amount: checkFlightBooking[0].due,
                    },
                    flightBookingPdfData: flightBookingPdfData,
                    bookingId: checkFlightBooking[0].booking_ref,
                    last_time: checkFlightBooking[0].last_time,
                    email: checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
                });
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'A reminder has been sent ',
            };
        });
    }
    //get all pending ticket issuance request
    getPendingTicketIssuance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.b2bFlightBookingModel();
            const data = yield model.getPendingTicketIssuance(req.query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    //update pending ticket issuance request
    updateTicketIssuance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.b2bFlightBookingModel(trx);
                const id = req.params.id;
                const { status, ticket_numbers } = req.body;
                //get ticket issuance data
                const data = yield model.getPendingTicketIssuance({ id: Number(id) });
                if (!data.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                //update pending ticket issuance
                yield model.updateTicketIssuance({ status, updated_at: new Date() }, { id: Number(id) });
                //update booking status
                if (status === flightConstants_1.PENDING_TICKET_ISSUANCE_STATUS.APPROVED) {
                    yield model.updateBooking({ status: flightConstants_1.FLIGHT_TICKET_ISSUE }, data.data[0].booking_id);
                    //update ticket
                    if (ticket_numbers && ticket_numbers.length) {
                        yield Promise.all(ticket_numbers.map((elem) => model.updateFlightBookingTraveler({ ticket_number: elem.ticket_number }, elem.traveler_id)));
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
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
                const b2bBookingModel = this.Model.b2bFlightBookingModel(trx);
                const invoiceModel = this.Model.btobPaymentModel(trx);
                const [booking] = yield b2bBookingModel.getSingleFlightBooking({ id });
                if (!booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { invoice_id, agency_id, booking_ref, user_id, booking_status } = booking;
                if (![flightConstants_1.FLIGHT_BOOKING_IN_PROCESS].includes(booking_status)) {
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
                    if (!invoice.due) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: 'There is no due amount for the invoice.',
                        };
                    }
                    const agencyModel = this.Model.agencyModel(trx);
                    const balance = yield agencyModel.getTotalBalance(agency_id);
                    if (balance < invoice.total_amount) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.INSUFFICIENT_AGENCY_BALANCE,
                        };
                    }
                    if ((_a = payload.ticket_numbers) === null || _a === void 0 ? void 0 : _a.length) {
                        yield Promise.all(payload.ticket_numbers.map(({ ticket_number, traveler_id }) => b2bBookingModel.updateFlightBookingTraveler({ ticket_number }, traveler_id)));
                    }
                    yield invoiceModel.updateInvoice({ due: 0 }, invoice_id);
                    yield invoiceModel.createMoneyReceipt({
                        amount: invoice.total_amount,
                        invoice_id,
                        details: `payment has been done for booking id ${booking_ref}`,
                        user_id: user_id,
                    });
                    yield agencyModel.insertAgencyLedger({
                        agency_id,
                        amount: invoice.total_amount,
                        type: 'debit',
                        details: `Amount deducted for ticket issuance — Booking ID ${booking_ref}, Invoice ID ${invoice.invoice_number}`,
                    });
                }
                if (payload.status === flightConstants_1.FLIGHT_BOOKING_CANCELLED) {
                    yield invoiceModel.updateInvoice({ status: false }, invoice_id);
                }
                yield b2bBookingModel.updateBooking({
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
    //pnr share
    pnrShare(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { agency_id, pnr, supplier_booking_ref, supplier } = req.body;
                const model = this.Model.b2bFlightBookingModel(trx);
                const agency_model = this.Model.agencyModel(trx);
                const agency_info = yield agency_model.getSingleAgency(agency_id);
                if (!((_a = agency_info === null || agency_info === void 0 ? void 0 : agency_info[0]) === null || _a === void 0 ? void 0 : _a.commission_set_id)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'No markup set has been found for this agency. Please set a markup first.',
                    };
                }
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const set_flight_api_id = yield dynamicFareModel.getSuppliers({
                    set_id: agency_info[0].commission_set_id,
                    status: true,
                    api_name: supplier,
                });
                if (!set_flight_api_id.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: `For this markup set ${supplier} is not active. Please active the API first.`,
                    };
                }
                //check pnr or api booking id if it already exists
                const check_pnr = yield model.getAllFlightBooking({
                    limit: '1',
                    skip: '0',
                    pnr,
                    api_booking_ref: supplier_booking_ref
                });
                if (check_pnr.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'PNR already exists',
                    };
                }
                let res;
                if (supplier === flightConstants_1.SABRE_API) {
                    const sabreSubService = new sabreFlightSupport_service_1.default(trx);
                    res = yield sabreSubService.pnrShare(pnr, set_flight_api_id[0].id);
                }
                else if (supplier === flightConstants_1.TRIPJACK_API) {
                    const tripjackSubService = new tripjackFlightSupport_service_1.default(trx);
                    res = yield tripjackSubService.pnrShareService(supplier_booking_ref, set_flight_api_id[0].id);
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No supplier has been found with this name',
                    };
                }
                //insert booking data
                const subServices = new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx);
                const { booking_id, booking_ref } = yield subServices.insertFlightBookingData({
                    pnr: res.gds_pnr,
                    flight_details: res.flight_details,
                    passengers: res.passenger_data,
                    api_booking_ref: '',
                    airline_pnr: res.airline_pnr,
                    refundable: res.flight_details.refundable,
                    name: agency_info[0].agency_name,
                    email: agency_info[0].email,
                    last_time: String(res.last_time),
                    agency_id,
                    files: [],
                    status: res.status,
                    api: res.flight_details.api,
                    details: `Booking has been created using PNR Share`,
                    convenience_fee: 0,
                });
                //invoice
                const invoiceSubService = new payment_service_1.BookingPaymentService(trx);
                yield invoiceSubService.createInvoice({
                    agency_id,
                    ref_id: booking_id,
                    ref_type: constants_1.INVOICE_TYPE_FLIGHT,
                    total_amount: res.flight_details.fare.payable,
                    due: res.flight_details.fare.payable,
                    details: `Invoice has been created for flight Id ${booking_ref}`,
                    user_name: agency_info[0].agency_name,
                    email: agency_info[0].email,
                    total_travelers: res.passenger_data.length,
                    travelers_type: constants_1.TRAVELER_TYPE_PASSENGERS,
                    bookingId: booking_ref,
                    agency_logo: agency_info[0].agency_logo,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'PNR has been inserted',
                    data: {
                        id: booking_id,
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
                const model = this.Model.b2bFlightBookingModel(trx);
                const agency_model = this.Model.agencyModel(trx);
                const agency_info = yield agency_model.getSingleAgency(agency_id);
                if (!((_a = agency_info === null || agency_info === void 0 ? void 0 : agency_info[0]) === null || _a === void 0 ? void 0 : _a.commission_set_id)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'No markup set has been found for this agency. Please set a markup first.',
                    };
                }
                const dynamicFareModel = this.Model.DynamicFareModel(trx);
                const set_flight_api_id = yield dynamicFareModel.getSuppliers({
                    set_id: agency_info[0].commission_set_id,
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
                const check_pnr = yield model.getAllFlightBooking({
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
    manualBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const body = req.body;
                const model = this.Model.b2bFlightBookingModel(trx);
                const agency_model = this.Model.agencyModel(trx);
                const agency_info = yield agency_model.getSingleAgency(body.agency_id);
                if (!agency_info.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'No agency has been found with this ID',
                    };
                }
                const ticket_price = body.base_fare + body.total_tax + body.ait;
                const payable_amount = ticket_price + body.convenience_fee + body.markup - body.discount;
                if (body.status === flightConstants_1.FLIGHT_TICKET_ISSUE && body.payment !== 'paid') {
                    //check balance
                    const agencyBalance = yield agency_model.getTotalBalance(body.agency_id);
                    const flightBookingSubService = new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService(trx);
                    const checkBalance = yield flightBookingSubService.checkAgencyBalanceForTicketIssue({
                        agency_balance: agencyBalance,
                        ticket_price: payable_amount,
                        payment_type: body.payment,
                        partial_payment_percentage: Number((_a = body.partial_payment_rules) === null || _a === void 0 ? void 0 : _a.payment_percentage) / 100,
                    });
                    if (checkBalance.success === false) {
                        return checkBalance;
                    }
                }
                let vendor_price = undefined;
                if (body.vendor_price) {
                    vendor_price = Object.assign(Object.assign({}, body.vendor_price), { gross_fare: body.vendor_price.base_fare + body.vendor_price.tax, net_fare: body.vendor_price.base_fare +
                            body.vendor_price.tax +
                            body.vendor_price.charge -
                            body.vendor_price.discount });
                }
                const route = lib_1.default.getRouteOfFlight(body.leg_description);
                const booking_ref = yield new BtoBFlightBookingSubService_1.BtoBFlightBookingSubService().generateUniqueBookingNumber(trx);
                const booking_id = yield model.insertFlightBooking({
                    agency_id: body.agency_id,
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
                    markup: {
                        base_fare: body.base_fare,
                        markup: body.markup,
                    },
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
                    const { key } = traveler, rest = __rest(traveler, ["key"]);
                    for (const file of files) {
                        if (((_a = file.fieldname) === null || _a === void 0 ? void 0 : _a.split('-')[0]) === 'visa' && ((_b = file.fieldname) === null || _b === void 0 ? void 0 : _b.split('-')[1]) == key) {
                            rest['visa_file'] = file.filename;
                        }
                        else if (((_c = file.fieldname) === null || _c === void 0 ? void 0 : _c.split('-')[0]) === 'passport' &&
                            ((_d = file.fieldname) === null || _d === void 0 ? void 0 : _d.split('-')[1]) == key) {
                            rest['passport_file'] = file.filename;
                        }
                    }
                    return Object.assign({ flight_booking_id: booking_id[0].id }, rest);
                });
                yield model.insertFlightTraveler(travelers);
                let paid_amount = 0;
                let due = payable_amount;
                if (body.status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
                    if (body.payment === 'full') {
                        paid_amount = payable_amount;
                        due = 0;
                    }
                    else if (body.payment === 'partial') {
                        paid_amount =
                            (payable_amount * Number((_b = body.partial_payment_rules) === null || _b === void 0 ? void 0 : _b.payment_percentage)) / 100;
                        due = payable_amount - paid_amount;
                    }
                    else if (body.payment === 'paid') {
                        due = 0;
                    }
                }
                //invoice
                const invoiceSubService = new payment_service_1.BookingPaymentService(trx);
                const invoice = yield invoiceSubService.createInvoice({
                    agency_id: body.agency_id,
                    ref_id: booking_id[0].id,
                    ref_type: constants_1.INVOICE_TYPE_FLIGHT,
                    total_amount: payable_amount,
                    due: due,
                    details: `Invoice has been created for flight Id ${booking_ref}`,
                    user_name: agency_info[0].agency_name,
                    email: agency_info[0].email,
                    total_travelers: body.travelers.length,
                    travelers_type: constants_1.TRAVELER_TYPE_PASSENGERS,
                    bookingId: booking_ref,
                    agency_logo: agency_info[0].agency_logo,
                    due_clear_last_day: ((_c = body.partial_payment_rules) === null || _c === void 0 ? void 0 : _c.payment_last_day) || undefined,
                });
                //debit amount
                if (body.status === flightConstants_1.FLIGHT_TICKET_ISSUE && body.payment !== 'paid') {
                    yield agency_model.insertAgencyLedger({
                        agency_id: body.agency_id,
                        type: 'debit',
                        amount: paid_amount,
                        details: `Debit for ticket issuance - Booking ID: ${booking_ref} with ${body.payment} payment`,
                    });
                }
                yield model.insertFlightBookingTracking({
                    flight_booking_id: booking_id[0].id,
                    details: `Manual booking has been created. Status - ${body.status}`,
                });
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Manual booking has been created`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'Manual booking has been created',
                    details: {
                        details: `A new booking has been created for agency: ${agency_info[0].agency_name}. Booking ID: ${booking_ref}`,
                    },
                }));
                //send mail to agency
                yield lib_1.default.sendEmail(agency_info[0].email, `A new booking has been created`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
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
    //booking split
    bookingSplit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id } = req.admin;
                const { id } = req.params;
                const bookingModel = this.Model.b2bFlightBookingModel(trx);
                const getBooking = yield bookingModel.getSingleFlightBooking({
                    id: Number(id),
                });
                if (!getBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
            }));
        });
    }
    //fetch data from API
    fetchDataFromAPI(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.b2bFlightBookingModel(trx);
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
                    const passengerData = yield model.getFlightBookingTraveler(id);
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
                    const travelers = yield model.getFlightBookingTraveler(id);
                    for (let i = 0; i < travelers.length; i++) {
                        const currentTicket = travelers[i].ticket_number;
                        const newTicket = ticket_numbers[i];
                        if (newTicket && newTicket !== currentTicket) {
                            yield model.updateFlightBookingTraveler({ ticket_number: newTicket }, travelers[i].id);
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
                const model = this.Model.b2bFlightBookingModel(trx);
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
                    if (!get_booking[0].ticket_issued_on && body.status === flightConstants_1.FLIGHT_TICKET_ISSUE) {
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
                            throw new customError_1.default('Segment not found', 404);
                        }
                        yield model.updateSegments(rest, id);
                    })));
                }
                if (body.travelers && body.travelers.length) {
                    yield Promise.all(body.travelers.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        const { id, title, contact_number } = elem, rest = __rest(elem, ["id", "title", "contact_number"]);
                        const checkData = yield model.getFlightBookingTraveler(Number(booking_id), elem.id);
                        if (!checkData.length) {
                            throw new customError_1.default('Traveler not found', 404);
                        }
                        yield model.updateFlightBookingTraveler(Object.assign(Object.assign({}, rest), { phone: contact_number, reference: title }), id);
                    })));
                }
                if (body.partial_payment || body.payment_last_date || body.payment_percentage) {
                    yield model.updateBooking({
                        partial_payment: {
                            partial_payment: body.partial_payment,
                            payment_percentage: body.payment_percentage,
                            travel_date_from_now: body.payment_last_date,
                        },
                    }, Number(booking_id));
                    if (body.payment_last_date) {
                        yield this.Model.btobPaymentModel(trx).updateInvoice({
                            due_clear_last_day: body.payment_last_date,
                        }, get_booking[0].invoice_id);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Booking has been updated',
                };
            }));
        });
    }
    sendBookingMail(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id: booking_id } = req.params;
                const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
                //check booking info
                const [checkFlightBooking, flightSegments, flightTravelers] = yield Promise.all([
                    flightBookingModel.getSingleFlightBooking({
                        id: Number(booking_id),
                    }),
                    flightBookingModel.getFlightSegment(Number(booking_id)),
                    flightBookingModel.getFlightBookingTraveler(Number(booking_id)),
                ]);
                if (!checkFlightBooking.length) {
                    throw new customError_1.default('No booking has been found with this ID', this.StatusCode.HTTP_NOT_FOUND);
                }
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
                    status: checkFlightBooking[0].booking_status,
                    pnr: checkFlightBooking[0].pnr_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Mail has been send',
                };
            }));
        });
    }
}
exports.default = AdminAgentFlightService;
