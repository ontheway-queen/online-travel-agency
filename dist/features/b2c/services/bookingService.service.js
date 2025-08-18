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
exports.BtoCBookingService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const bookingSupportTemplate_1 = require("../../../utils/templates/bookingSupportTemplate");
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
class BtoCBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //create support
    createSupport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, first_name, last_name, username } = req.user;
                const { booking_id, support_type, ticket_number, message, is_booking_supported, } = req.body;
                const booking_model = this.Model.btocFlightBookingModel(trx);
                let booking_ref;
                if (booking_id) {
                    const booking_data = yield booking_model.getSingleFlightBooking({
                        id: Number(booking_id),
                        user_id: id,
                    });
                    if (!booking_data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.HTTP_NOT_FOUND,
                        };
                    }
                    booking_ref = booking_data[0].booking_ref;
                }
                const support_model = this.Model.btocBookingSupportModel(trx);
                // insert support
                const support_res = yield support_model.insertSupport({
                    booking_id: booking_id ? Number(booking_id) : undefined,
                    user_id: Number(id),
                    support_type,
                    created_by: id,
                    is_booking_supported,
                });
                const ticket_body = ticket_number === null || ticket_number === void 0 ? void 0 : ticket_number.map((element) => {
                    return {
                        support_id: support_res[0].id,
                        traveler_id: element.traveler_id,
                        ticket_number: element.ticket_number,
                    };
                });
                if (ticket_body && ticket_body.length > 0) {
                    // insert support ticket
                    yield support_model.insertSupportTicket(ticket_body);
                }
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
                // insert support message
                yield support_model.insertSupportMessage({
                    support_id: support_res[0].id,
                    message,
                    attachment: attachmentsJSON,
                    sender: "user",
                    sender_id: id,
                });
                //send mail
                yield lib_1.default.sendEmail(constants_1.PROJECT_EMAIL_API_1, `B2C Support Created for booking id ${booking_ref} | ${constants_1.PROJECT_NAME}`, (0, bookingSupportTemplate_1.BookingSupportTemplate)({
                    bookingId: booking_ref,
                    supportType: support_type,
                    createdBy: username,
                    createdAt: new Date().toLocaleString(),
                    messages: [
                        {
                            sender: username,
                            sentAt: new Date().toLocaleString(),
                            content: message,
                        },
                    ],
                }));
                //send notification to admin
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({
                    message: `A new support has been created from B2C.`,
                    ref_id: support_res[0].id,
                    type: constants_1.NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: { id: support_res[0].id, attachmentsJSON },
                };
            }));
        });
    }
    //get list
    getList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: user_id } = req.user;
            const { limit, skip, status } = req.query;
            const model = this.Model.btocBookingSupportModel();
            const data = yield model.getList(user_id, status, limit, skip);
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
            const { id: user_id } = req.user;
            const { limit, skip } = req.query;
            const { id: support_id } = req.params;
            const model = this.Model.btocBookingSupportModel();
            const support_data = yield model.getSingleSupport({
                id: Number(support_id),
                user_id,
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
                data: Object.assign(Object.assign({}, support_data[0]), { ticket_data, total_message: message_data.total, message_data: message_data.data }),
            };
        });
    }
    //create message
    createMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, username } = req.user;
                const { id: support_id } = req.params;
                const model = this.Model.btocBookingSupportModel(trx);
                const support_data = yield model.getSingleSupport({
                    id: Number(support_id),
                    user_id: Number(id),
                    notStatus: "closed",
                });
                if (!support_data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
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
                    sender: "user",
                    sender_id: id,
                });
                //update last message time
                yield model.updateSupport({ last_message_at: new Date() }, Number(support_id));
                const booking_model = this.Model.btocFlightBookingModel(trx);
                const booking_data = yield booking_model.getSingleFlightBooking({
                    id: Number(support_data[0].booking_id),
                });
                //send mail
                yield lib_1.default.sendEmail(constants_1.PROJECT_EMAIL_API_1, `New incoming message from B2C support for booking id ${booking_data[0].booking_ref} | ${constants_1.PROJECT_NAME}`, (0, bookingSupportTemplate_1.BookingSupportTemplate)({
                    bookingId: booking_data[0].booking_ref,
                    supportType: support_data[0].support_type,
                    createdBy: username,
                    createdAt: support_data[0].created_at,
                    messages: [
                        {
                            sender: username,
                            sentAt: new Date().toLocaleString(),
                            content: req.body.message,
                        },
                    ],
                }));
                //send notification to admin
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({
                    message: `A new incoming message from B2C booking support - ${req.body.message}`,
                    ref_id: Number(support_id),
                    type: constants_1.NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: attachmentsJSON,
                };
            }));
        });
    }
}
exports.BtoCBookingService = BtoCBookingService;
