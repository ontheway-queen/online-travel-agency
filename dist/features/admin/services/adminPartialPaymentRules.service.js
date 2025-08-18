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
exports.AdminPartialPaymentRuleService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminPartialPaymentRuleService extends abstract_service_1.default {
    create(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { flight_api_id, airline, from_dac, to_dac, one_way = true, round_trip = true, travel_date_from_now, payment_percentage, domestic, soto, payment_before, note } = req.body;
                const { id: user_id } = req.admin;
                const model = this.Model.PartialPaymentRuleModel(trx);
                const res = yield model.create({
                    flight_api_id,
                    airline,
                    from_dac,
                    to_dac,
                    one_way,
                    round_trip,
                    travel_date_from_now,
                    payment_percentage,
                    created_by: user_id,
                    domestic,
                    soto,
                    payment_before,
                    note
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Partial payment rule has been created",
                    data: {
                        id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id,
                    },
                };
            }));
        });
    }
    getAll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.PartialPaymentRuleModel();
            const data = yield model.getAll(query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    update(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.PartialPaymentRuleModel();
            const { id } = req.params;
            const body = req.body;
            const rule = yield model.getSingle(Number(id));
            if (!rule.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.update(body, Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Partial payment rule has been updated",
            };
        });
    }
    delete(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.PartialPaymentRuleModel();
            const { id } = req.params;
            const rule = yield model.getSingle(Number(id));
            if (!rule.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.delete(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Partial payment rule has been deleted",
            };
        });
    }
    getFlightAPIs(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.apiAirlinesCommissionModel();
            const flightAPIs = yield model.getFlightAPI({});
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: flightAPIs,
            };
        });
    }
}
exports.AdminPartialPaymentRuleService = AdminPartialPaymentRuleService;
