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
exports.BookingVisaService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const constants_1 = require("../../../utils/miscellaneous/constants");
class BookingVisaService extends abstract_service_1.default {
    //create visa application
    createVisaApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, first_name, last_name, email } = req.user;
                const model = this.Model.VisaModel(trx);
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
                const payable = (Number(data[0].visa_fee) + Number(data[0].processing_fee)) *
                    Number(body.traveler);
                //get booking_ref id & increase the number of entry by one
                const last_entry = yield this.Model.lastServiceEntryModel(trx).getLastRefId({ type: constants_1.INVOICE_TYPE_VISA });
                const booking_ref_id = `${constants_1.PROJECT_CODE}-V-${(Number(last_entry) + 1)
                    .toString()
                    .padStart(5, "0")}`;
                yield this.Model.lastServiceEntryModel(trx).incrementLastRefId({
                    type: constants_1.INVOICE_TYPE_VISA,
                });
                const files = req.files || [];
                const application_body = {
                    user_id: id,
                    visa_id: visa_id,
                    // from_date: body.from_date,
                    // to_date: body.to_date,
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
                    booking_ref: booking_ref_id,
                };
                //b2c create application
                const create_application = yield model.b2cCreateApplication(application_body);
                const passengers_parse = body.passengers;
                // const imgFiles: any = {};
                // for (let i = 0; i < passengers_parse.length; i++) {
                //   for (let j = 0; j < files.length; j++) {
                //     if (passengers_parse[i].passport_number === files[j].fieldname) {
                //       imgFiles[passengers_parse[i].passport_number] = files[j].filename;
                //     }
                //   }
                // }
                //b2c create traveler
                if (create_application.length) {
                    // let traveler_body: ICreateAppTravelerPayload[] = [];
                    // traveler_body = body?.passengers.map((obj: any) => {
                    //   return {
                    //     ...obj,
                    //     application_id: create_application[0].id,
                    //     passport_img: imgFiles[obj.passport_number],
                    //   };
                    // });
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
                    yield model.b2cCreateTraveler(traveler_body);
                    const tracking_body = {
                        application_id: create_application[0].id,
                        status: "pending",
                        details: `${first_name} ${last_name} has applied for the visa`,
                    };
                    yield model.b2cCreateTracking(tracking_body);
                    //create invoice
                    const paymentModel = this.Model.paymentModel(trx);
                    const invoice_data = yield paymentModel.getInvoice({ limit: 1 });
                    let invoice_number;
                    if (invoice_data.data.length) {
                        invoice_number = Number(invoice_data.data[0].invoice_number.split("-")[1]);
                    }
                    else {
                        invoice_number = 0;
                    }
                    invoice_number =
                        `${constants_1.PROJECT_CODE}IC-` +
                            (invoice_number + 1).toString().padStart(7, "0");
                    const invoice = yield paymentModel.insertInvoice({
                        user_id: id,
                        ref_id: create_application[0].id,
                        ref_type: "visa",
                        total_amount: payable,
                        due: payable,
                        details: `Invoice has been created for visa application id ${create_application[0].id}`,
                        invoice_number,
                    });
                    //send notification to admin
                    const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                    yield adminNotificationSubService.insertNotification({
                        message: `New Application for Visa from B2C. Application ID: ${create_application[0].id}`,
                        ref_id: create_application[0].id,
                        type: constants_1.NOTIFICATION_TYPE_B2C_VISA_APPLICATION,
                    });
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Visa application created successfully",
                        invoiceId: invoice[0].id,
                        invoice_number: invoice[0].invoice_number,
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
            const { id } = req.user;
            // console.log(req.user);
            const model = this.Model.VisaModel();
            const { limit, skip } = req.query;
            const data = yield model.getB2CApplication({
                user_id: id,
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
            const { id: user_id } = req.user;
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.b2cSingleApplication(Number(id), user_id);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            // console.log(data);
            const traveler_data = yield model.b2cTravelerList(Number(id));
            const tracking_data = yield model.b2cTrackingList(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { traveler_data, tracking_data }),
            };
        });
    }
}
exports.BookingVisaService = BookingVisaService;
