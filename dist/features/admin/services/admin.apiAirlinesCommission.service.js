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
exports.AdminApiAirlinesCommissionService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const database_1 = require("../../../app/database");
class AdminApiAirlinesCommissionService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Get API
    getAllApi(_req) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiAirComModel = this.Model.apiAirlinesCommissionModel();
            const data = yield apiAirComModel.getFlightAPI({});
            return {
                success: true,
                data,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // Update API Airlines Commission
    updateAPIAirlinesCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id } = req.admin;
                const { id } = req.params;
                const { api_status, add, remove, update } = req.body;
                const apiAirComModel = this.Model.apiAirlinesCommissionModel(trx);
                if (api_status !== undefined) {
                    yield apiAirComModel.updateFlightAPI(Number(id), api_status);
                }
                if (add) {
                    const addPayload = [];
                    for (const addItem of add) {
                        const { airlines, com_domestic, com_from_dac, com_mode, com_soto, com_to_dac, com_type, } = addItem;
                        for (const airline of airlines) {
                            // Check if the airline already exists
                            const existingRecord = yield apiAirComModel.getAPIAirlinesCommission({
                                airline,
                                set_flight_api_id: Number(id),
                            });
                            // If exists, update the airline
                            if (existingRecord.data.length) {
                                yield apiAirComModel.updateAPIAirlinesCommission(existingRecord.data[0].key, {
                                    com_domestic,
                                    com_from_dac,
                                    com_mode,
                                    com_soto,
                                    com_to_dac,
                                    com_type,
                                    updated_by: user_id,
                                });
                            }
                            // Else, add the airline
                            else {
                                addPayload.push({
                                    set_flight_api_id: Number(id),
                                    created_by: user_id,
                                    airline,
                                    com_domestic,
                                    com_from_dac,
                                    com_mode,
                                    com_soto,
                                    com_to_dac,
                                    com_type,
                                });
                            }
                        }
                    }
                    // Insert the remaining records
                    if (addPayload.length) {
                        yield apiAirComModel.insertAPIAirlinesCommission(addPayload);
                    }
                }
                if (update) {
                    for (const updateItem of update) {
                        const { id } = updateItem, restBody = __rest(updateItem, ["id"]);
                        yield apiAirComModel.updateAPIAirlinesCommission(id, Object.assign(Object.assign({}, restBody), { updated_by: user_id }));
                    }
                }
                if (remove) {
                    yield apiAirComModel.deleteAPIAirlinesCommission(remove);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    // Get API Airlines Commission
    getAPIAirlinesCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const { id } = req.params;
            const apiAirComModel = this.Model.apiAirlinesCommissionModel();
            const { data, total } = yield apiAirComModel.getAPIAirlinesCommission(Object.assign(Object.assign({}, query), { set_flight_api_id: Number(id) }));
            return {
                success: true,
                data,
                total,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.AdminApiAirlinesCommissionService = AdminApiAirlinesCommissionService;
