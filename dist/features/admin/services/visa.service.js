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
exports.AdminVisaService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
class AdminVisaService extends abstract_service_1.default {
    //create visa
    createVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.admin;
            const file = req.files || [];
            const model = this.Model.VisaModel();
            const body = req.body;
            body.created_by = id;
            if (file) {
                const image = file[0].filename;
                body.image = image;
                const create = yield model.create(body);
                if (create.length) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_SUCCESSFUL,
                        message: this.ResMsg.HTTP_SUCCESSFUL,
                    };
                }
            }
            //send email to admin
            yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], `visa has been created`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                title: "Visa has been created",
                details: {
                    details: `New visa has been created`
                }
            }));
            return {
                success: false,
                code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
            };
        });
    }
    //get visa
    getVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.VisaModel();
            const data = yield model.get(req.query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single visa
    getSingleVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.single(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data[0],
            };
        });
    }
    //update visa
    updateVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const file = req.files || [];
            if (file.length) {
                const model = this.Model.VisaModel();
                const visa = yield model.single(Number(id));
                yield this.manageFile.deleteFromCloud(visa.image);
                const res = yield model.update(Object.assign(Object.assign({}, req.body), { image: file[0].filename }), Number(id));
                if (res) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: req.body,
                    };
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
                const model = this.Model.VisaModel();
                const res = yield model.update(req.body, Number(id));
                if (res) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: req.body,
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
            }
        });
    }
    //////-------b2c-----------//
    //get b2c applications
    getB2CApplications(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.VisaModel();
            const data = yield model.getB2CApplication(req.query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get b2c single application
    getB2CSingleApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const paymentModel = this.Model.paymentModel();
            const data = yield model.b2cSingleApplication(Number(id));
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const traveler_data = yield model.b2cTravelerList(Number(id));
            const tracking_data = yield model.b2cTrackingList(Number(id));
            const invoice_data = yield paymentModel.getInvoiceByBookingId(Number(id), 'visa');
            const payment_data = ((_a = invoice_data === null || invoice_data === void 0 ? void 0 : invoice_data[0]) === null || _a === void 0 ? void 0 : _a.id) ? yield paymentModel.singleMoneyReceipt(invoice_data[0].id) : [];
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { traveler_data,
                    tracking_data,
                    invoice_data,
                    payment_data }),
            };
        });
    }
    //create b2c tracking of application
    createB2CTrackingOfApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.b2cSingleApplication(Number(id));
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            req.body.application_id = id;
            const create_tracking = yield model.b2cCreateTracking(req.body);
            if (create_tracking.length) {
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], `B2C visa has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: "B2C visa has been updated",
                    details: {
                        details: `Visa application id ${id} has been updated`
                    }
                }));
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
        });
    }
    //--------b2b-----------//
    //get b2b applications
    getB2BApplications(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.VisaModel();
            const data = yield model.getB2BApplication(req.query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get b2b single application
    getB2BSingleApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.b2bSingleApplication(Number(id));
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
    //create b2b tracking of application
    createB2BTrackingOfApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.b2bSingleApplication(Number(id));
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            req.body.application_id = id;
            const create_tracking = yield model.b2bCreateTracking(req.body);
            //send email to admin
            yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], `B2B visa has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                title: "B2B visa has been updated",
                details: {
                    details: `Visa application id ${id} has been updated`
                }
            }));
            if (create_tracking.length) {
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
        });
    }
}
exports.AdminVisaService = AdminVisaService;
