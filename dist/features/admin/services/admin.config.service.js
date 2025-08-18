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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminConfigService extends abstract_service_1.default {
    //create city
    createCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.commonModel();
            const data = yield model.getAllCity({
                country_id: req.body.country_id,
                name: req.body.name,
            });
            if (data.length) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_CONFLICT,
                };
            }
            const res = yield model.insertCity(req.body);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data: res[0].id,
            };
        });
    }
    //insert visa type
    insertVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Model.VisaModel().insertVisaType(Object.assign(Object.assign({}, req.body), { created_by: req.admin.id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //get all visa type
    getAllVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.VisaModel().getAllVisaType();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    //delete visa type
    deleteVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Model.VisaModel().deleteVisaType(parseInt(req.params.id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    //insert visa type
    insertVisaMode(req) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Model.VisaModel().insertVisaMode(Object.assign(Object.assign({}, req.body), { created_by: req.admin.id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //get all visa type
    getAllVisaMode(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.VisaModel().getAllVisaMode();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    //delete visa type
    deleteVisaMode(req) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Model.VisaModel().deleteVisaMode(parseInt(req.params.id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    //get notification
    getNotification(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.admin;
            const model = this.Model.adminNotificationModel();
            const query = req.query;
            query.user_id = id.toString();
            const data = yield model.getNotifications(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //insert notification seen
    insertNotificationSeen(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.admin;
            const model = this.Model.adminNotificationModel();
            const { notification_id } = req.body;
            if (!notification_id) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                    message: this.ResMsg.HTTP_UNPROCESSABLE_ENTITY,
                };
            }
            const checkNotification = yield model.checkNotificationSeen({
                notification_id,
                user_id: id,
            });
            if (!checkNotification.length) {
                yield model.insertNotificationSeen({ notification_id, user_id: id });
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
            };
        });
    }
    //get error logs
    getErrorLogs(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.errorLogsModel();
            const data = yield model.get(req.query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get audit trail
    getAuditTrail(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.adminAuditTrailModel();
            const data = yield model.getAudit(req.query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get search history
    getSearchHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.SearchHistoryModel();
            const { type, from_date, to_date, limit, skip, user_type, agency_id } = req.query;
            let data = {
                total: 0,
                data: [],
            };
            if (type === "flight") {
                data = yield model.getFlightSearchHistory({
                    from_date: from_date,
                    to_date: to_date,
                    limit: limit,
                    skip: skip,
                    user_type: user_type,
                    agency_id: agency_id,
                }, true);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //insert airline
    insertAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = req.files || [];
            if (files === null || files === void 0 ? void 0 : files.length) {
                req.body[files[0].fieldname] = files[0].filename;
            }
            const body = req.body;
            const model = this.Model.commonModel();
            const insert_airline = yield model.insertAirline(body);
            if (insert_airline.length) {
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
    //update airline
    updateAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airlines_id = req.params.id;
            const files = req.files || [];
            if (files === null || files === void 0 ? void 0 : files.length) {
                req.body[files[0].fieldname] = files[0].filename;
            }
            const body = req.body;
            const model = this.Model.commonModel();
            yield model.updateAirlines(body, Number(airlines_id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    //delete airline
    deleteAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airlines_id = req.params.id;
            const model = this.Model.commonModel();
            const del_airline = yield model.deleteAirlines(Number(airlines_id));
            if (del_airline > 0) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                };
            }
        });
    }
    //insert airport
    insertAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const model = this.Model.commonModel();
            const checkAirport = yield model.getAllAirport({ code: body.iata_code }, false);
            // console.log({ body });
            if (checkAirport.data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Airport code already exist.",
                };
            }
            yield model.insertAirport(body);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //get all airport
    getAllAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { country_id, name, limit, skip } = req.query;
            const model = this.Model.commonModel();
            const get_airport = yield model.getAllAirport({ country_id, name, limit, skip }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: parseInt(get_airport.total),
                data: get_airport.data,
            };
        });
    }
    //update airport
    updateAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airport_id = req.params.id;
            const body = req.body;
            const model = this.Model.commonModel();
            const update_airport = yield model.updateAirport(body, Number(airport_id));
            if (update_airport > 0) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                };
            }
        });
    }
    //delete airport
    deleteAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airport_id = req.params.id;
            const model = this.Model.commonModel();
            const del_airport = yield model.deleteAirport(Number(airport_id));
            if (del_airport > 0) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                };
            }
        });
    }
}
exports.default = AdminConfigService;
