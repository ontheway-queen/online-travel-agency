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
exports.AdminAirlinesPreferenceService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminAirlinesPreferenceService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createAirlinePreference(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.AirlinesPreferenceModel(trx);
                const { body } = req.body;
                const payload = [];
                for (const elm of body) {
                    const airlineCodes = elm.airlines_code
                        .split(',')
                        .map((code) => code.trim().toUpperCase());
                    for (const code of airlineCodes) {
                        const check_duplicate = yield model.getAirlinesPreferences({
                            dynamic_fare_supplier_id: elm.dynamic_fare_supplier_id,
                            airlines_code: code,
                        });
                        if (check_duplicate.length) {
                            throw new customError_1.default(`Airline (${code}) already exists for this set`, this.StatusCode.HTTP_CONFLICT);
                        }
                        else {
                            payload.push({
                                airlines_code: code,
                                domestic: elm.domestic,
                                dynamic_fare_supplier_id: elm.dynamic_fare_supplier_id,
                                from_dac: elm.from_dac,
                                to_dac: elm.to_dac,
                                preference_type: elm.preference_type,
                                soto: elm.soto,
                            });
                        }
                    }
                }
                yield model.createAirlinePreference(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Airline preference created',
                };
            }));
        });
    }
    getAirlinesPreferences(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dynamic_fare_supplier_id, pref_type, filter, status } = req.query;
            const model = this.Model.AirlinesPreferenceModel();
            const data = yield model.getAirlinesPreferences({
                dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
                pref_type,
                status: Boolean(status),
                filter,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateAirlinePreference(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.AirlinesPreferenceModel();
            const { id } = req.params;
            const body = req.body;
            const existing = yield model.getAirlinePreferenceById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateAirlinePreference(Number(id), body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Airline preference updated',
            };
        });
    }
    deleteAirlinePreference(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.AirlinesPreferenceModel();
            const { id } = req.params;
            const existing = yield model.getAirlinePreferenceById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteAirlinePreference(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Airline preference deleted',
            };
        });
    }
}
exports.AdminAirlinesPreferenceService = AdminAirlinesPreferenceService;
