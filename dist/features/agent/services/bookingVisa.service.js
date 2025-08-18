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
exports.B2BVisaService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const visaApplicationEmail_1 = require("../../../utils/templates/visaApplicationEmail");
const payment_service_1 = require("./subServices/payment.service");
class B2BVisaService extends abstract_service_1.default {
    //create visa application
    createVisaApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, agency_id, name, email: user_email, agency_logo, } = req.agency;
                const model = this.Model.VisaModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const body = req.body;
                const { visa_id } = body;
                const data = yield model.single(visa_id, true);
                if (!data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const payable = Number(data[0].processing_fee) * Number(body.traveler);
                //check balance
                const balance = yield agencyModel.getTotalBalance(agency_id);
                if (Number(payable) > Number(balance)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "There is insufficient balance in agency account",
                    };
                }
                //get booking_ref id & increase the number of entry by one
                const last_entry = yield this.Model.lastServiceEntryModel(trx).getLastRefId({ type: constants_1.INVOICE_TYPE_VISA });
                const booking_ref_id = `${constants_1.PROJECT_CODE}-V-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
                yield this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: constants_1.INVOICE_TYPE_VISA });
                const files = req.files || [];
                const application_body = {
                    agency_id: agency_id,
                    agent_id: id,
                    visa_id: visa_id,
                    from_date: body.from_date,
                    to_date: body.to_date,
                    traveler: body.traveler,
                    visa_fee: data[0].visa_fee,
                    processing_fee: data[0].processing_fee,
                    payable: payable,
                    application_date: new Date(),
                    contact_email: body.contact_email,
                    contact_number: body.contact_number,
                    whatsapp_number: body.whatsapp_number,
                    nationality: body.nationality,
                    residence: body.residence,
                    booking_ref: booking_ref_id
                };
                const create_application = yield model.b2bCreateApplication(application_body);
                if (create_application.length) {
                    let traveler_body = [];
                    traveler_body = body.passengers.map((obj) => {
                        var _a;
                        const { key } = obj, rest = __rest(obj, ["key"]);
                        let required_fields = {};
                        for (const file of files) {
                            if (((_a = file.fieldname) === null || _a === void 0 ? void 0 : _a.split("-")[1]) == key) {
                                required_fields[file.fieldname.split("-")[0]] = file.filename;
                            }
                        }
                        rest.required_fields = required_fields;
                        return Object.assign(Object.assign({}, rest), { application_id: create_application[0].id });
                    });
                    yield model.b2bCreateTraveler(traveler_body);
                    //debit amount
                    yield agencyModel.insertAgencyLedger({
                        agency_id: agency_id,
                        type: "debit",
                        amount: payable,
                        details: `Debit for visa application - application ID: ${booking_ref_id}.`,
                    });
                    //tracking body
                    const tracking_body = [{
                            application_id: create_application[0].id,
                            status: "pending",
                            details: `${name} has applied for the visa`,
                        },
                        {
                            application_id: create_application[0].id,
                            status: "paid",
                            details: `${name} has paid ${payable}/= for the processing fee`,
                        }];
                    yield model.b2bCreateTracking(tracking_body);
                    //invoice
                    yield new payment_service_1.BookingPaymentService(trx).createInvoice({
                        agency_id,
                        user_id: id,
                        ref_id: create_application[0].id,
                        ref_type: constants_1.INVOICE_TYPE_VISA,
                        total_amount: payable,
                        due: 0,
                        details: `Invoice has been created for visa application id ${booking_ref_id} (only processing fee has been applied)`,
                        user_name: name,
                        email: user_email,
                        total_travelers: body.traveler,
                        travelers_type: constants_1.TRAVELER_TYPE_PASSENGERS,
                        bookingId: booking_ref_id,
                        agency_logo
                    });
                    //send notification to admin
                    const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                    yield adminNotificationSubService.insertNotification({
                        message: `New Application for Visa from B2B. Application ID: ${booking_ref_id}`,
                        ref_id: create_application[0].id,
                        type: constants_1.NOTIFICATION_TYPE_B2B_VISA_APPLICATION,
                    });
                    // send email notification
                    yield Promise.all([
                        lib_1.default.sendEmail(constants_1.PROJECT_EMAIL_API_1, `Received a new visa application - ${data[0].country_name} - ${data[0].visa_mode || ""}`, (0, visaApplicationEmail_1.template_onCreateVisaApp_sent_to_admin)({
                            name: name,
                            visaMode: data[0].visa_mode,
                            destination: data[0].country_name,
                            numOfTravellers: Number(body.traveler),
                            applicationId: booking_ref_id,
                            price: payable,
                            logo: constants_1.PROJECT_IMAGE_URL + "/" + agency_logo,
                        })),
                        lib_1.default.sendEmail(user_email, `Your visa application for ${data[0].country_name} (${data[0].visa_mode || ""}) has been created`, (0, visaApplicationEmail_1.template_onCreateVisaApp_sent_to_agent)({
                            name: name,
                            visaMode: data[0].visa_mode,
                            destination: data[0].country_name,
                            numOfTravellers: Number(body.traveler),
                            applicationId: booking_ref_id,
                            price: payable,
                            logo: constants_1.PROJECT_IMAGE_URL + "/" + agency_logo,
                        })),
                    ]);
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_SUCCESSFUL,
                        message: this.ResMsg.HTTP_SUCCESSFUL,
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                    };
                }
            }));
        });
    }
    //get list
    getApplicationList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.agency;
            const model = this.Model.VisaModel();
            const { limit, skip } = req.query;
            const data = yield model.getB2BApplication({
                agent_id: id,
                limit: limit ? Number(limit) : 100,
                skip: skip ? Number(skip) : 0,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single
    getSingleApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: agent_id } = req.agency;
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.b2bSingleApplication(Number(id), agent_id);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const traveler_data = yield model.b2bTravelerList(Number(id));
            const tracking_data = yield model.b2bTrackingList(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data[0]), { traveler_data, tracking_data }),
            };
        });
    }
}
exports.B2BVisaService = B2BVisaService;
