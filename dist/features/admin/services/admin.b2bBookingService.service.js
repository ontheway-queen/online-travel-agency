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
exports.AdminBtoBBookingService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const bookingSupportTemplate_1 = require("../../../utils/templates/bookingSupportTemplate");
const agencyNotificationSubService_1 = require("../../agent/services/subServices/agencyNotificationSubService");
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
class AdminBtoBBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //get list
    getList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status } = req.query;
            const model = this.Model.btobBookingSupportModel();
            const data = yield model.getList(undefined, status, limit, skip);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get details
    getDetails(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip } = req.query;
            const { id: support_id } = req.params;
            const model = this.Model.btobBookingSupportModel();
            const support_data = yield model.getSingleSupport({
                id: Number(support_id),
            });
            if (!support_data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const ticket_data = yield model.getTickets(Number(support_id));
            const message_data = yield model.getMessages({
                limit,
                skip,
                support_id: Number(support_id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign(Object.assign({}, support_data[0]), support_data[1]), { ticket_data, total_message: message_data.total, message_data: message_data.data }),
            };
        });
    }
    //create message
    createMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { id } = req.admin;
                const { id: support_id } = req.params;
                const model = this.Model.btobBookingSupportModel(trx);
                const support_data = yield model.getSingleSupport({
                    id: Number(support_id),
                });
                const files = req.files || [];
                const attachments = [];
                if (files === null || files === void 0 ? void 0 : files.length) {
                    for (const element of files) {
                        let type = element.mimetype.split("/")[0];
                        if (type === "application") {
                            type = "file";
                        }
                        const file = element.filename;
                        attachments.push({ type, file });
                    }
                }
                const attachmentsJSON = JSON.stringify(attachments);
                yield model.insertSupportMessage({
                    support_id: Number(support_id),
                    message: req.body.message,
                    attachment: attachmentsJSON,
                    sender: "admin",
                    sender_id: id,
                });
                //update last message time
                yield model.updateSupport({
                    last_message_at: new Date(),
                    status: support_data[0].status === "pending" ? "processing" : undefined,
                }, Number(support_id));
                const agency = yield this.Model.agencyModel(trx).getSingleAgency(support_data[0].agency_id);
                const booking_model = this.Model.b2bFlightBookingModel(trx);
                const booking_data = yield booking_model.getSingleFlightBooking({
                    id: Number(support_data[0].booking_id),
                });
                //send notification
                const agencyNotificationSubService = new agencyNotificationSubService_1.AgencyNotificationSubService(trx);
                yield agencyNotificationSubService.insertNotification({
                    agency_id: support_data[0].agency_id,
                    message: `A new incoming message from booking support - ${req.body.message}`,
                    ref_id: Number(support_id),
                    type: constants_1.NOTIFICATION_TYPE_B2B_BOOKING_SUPPORT,
                });
                //send mail
                yield lib_1.default.sendEmail(support_data[0].created_by_email, `New incoming message from B2B support for booking id ${booking_data[0].booking_ref} | ${constants_1.PROJECT_NAME}`, (0, bookingSupportTemplate_1.BookingSupportTemplate)({
                    bookingId: booking_data[0].booking_ref,
                    supportType: support_data[0].support_type,
                    createdBy: (_a = agency[0]) === null || _a === void 0 ? void 0 : _a.agency_name,
                    createdAt: support_data[0].created_at,
                    messages: [
                        {
                            sender: "Admin",
                            sentAt: new Date().toLocaleString(),
                            content: req.body.message,
                        },
                    ],
                }));
                //send mail
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], `New incoming message from B2B support for booking id ${booking_data[0].booking_ref} | ${constants_1.PROJECT_NAME}`, (0, bookingSupportTemplate_1.BookingSupportTemplate)({
                    bookingId: booking_data[0].booking_ref,
                    supportType: support_data[0].support_type,
                    createdBy: (_b = agency[0]) === null || _b === void 0 ? void 0 : _b.agency_name,
                    createdAt: support_data[0].created_at,
                    messages: [
                        {
                            sender: "Admin",
                            sentAt: new Date().toLocaleString(),
                            content: req.body.message,
                        },
                    ],
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: attachmentsJSON,
                };
            }));
        });
    }
    //close support
    closeSupport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: user_id } = req.admin;
            const { id: support_id } = req.params;
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.btobBookingSupportModel(trx);
                const booking_model = this.Model.b2bFlightBookingModel(trx);
                const support_data = yield model.getSingleSupport({
                    id: Number(support_id),
                });
                if (!support_data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { refund_amount, status } = req.body;
                if (status === constants_1.booking_support_status.adjusted) {
                    if (support_data[0].support_type === "Refund") {
                        yield model.updateSupport({
                            status,
                            refund_amount,
                            adjust_at: new Date(),
                            adjusted_by: user_id,
                        }, Number(support_id));
                        yield booking_model.updateBooking({
                            status: flightConstants_1.FLIGHT_BOOKING_REFUNDED,
                        }, support_data[0].booking_id);
                    }
                    else {
                        if (support_data[0].support_type === "DateChange") {
                            yield booking_model.updateBooking({
                                status: flightConstants_1.FLIGHT_BOOKING_REISSUED,
                            }, support_data[0].booking_id);
                            yield model.updateSupport({
                                status,
                            }, Number(support_id));
                        }
                        else if (support_data[0].support_type === "VOID") {
                            yield booking_model.updateBooking({
                                status: flightConstants_1.FLIGHT_BOOKING_VOID,
                            }, support_data[0].booking_id);
                            yield model.updateSupport({
                                status,
                            }, Number(support_id));
                        }
                    }
                }
                else if (status === constants_1.booking_support_status.closed || status === constants_1.booking_support_status.rejected) {
                    yield model.updateSupport({
                        status,
                        closed_at: new Date(),
                        closed_by: user_id,
                    }, Number(support_id));
                }
                else {
                    yield model.updateSupport({
                        status,
                    }, Number(support_id));
                }
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], `B2B Booking support has been closed`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: "B2B Booking support has been closed",
                    details: {
                        details: `Booking support id ${support_id} has been closed`
                    }
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.AdminBtoBBookingService = AdminBtoBBookingService;
