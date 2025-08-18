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
exports.AdminCurrencyService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminCurrencyService extends abstract_service_1.default {
    getApiList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.CurrencyModel(trx);
                const res = yield model.getApiList(req.query.type);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: res
                };
            }));
        });
    }
    createApiWiseCurrency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { id: userId } = req.admin;
                const model = this.Model.CurrencyModel(trx);
                const body = req.body;
                const check_entry = yield model.getApiWise({ filter: body.api_id });
                if (check_entry.length > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Currency already exists for this api"
                    };
                }
                const res = yield model.createApiWise(Object.assign(Object.assign({}, body), { created_by: userId }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Api wise currency has been created",
                    data: {
                        id: (_a = res === null || res === void 0 ? void 0 : res[0]) === null || _a === void 0 ? void 0 : _a.id
                    }
                };
            }));
        });
    }
    getApiWiseCurrency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.CurrencyModel(trx);
                const query = req.query;
                const res = yield model.getApiWise(query);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: res
                };
            }));
        });
    }
    updateApiWiseCurrency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.CurrencyModel(trx);
                const body = req.body;
                const id = parseInt(req.params.id);
                const res = yield model.updateApiWise(body, id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Api wise currency has been updated",
                };
            }));
        });
    }
    deleteApiWiseCurrency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.CurrencyModel(trx);
                const id = parseInt(req.params.id);
                yield model.deleteApiWise(id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Api wise currency has been deleted",
                };
            }));
        });
    }
}
exports.AdminCurrencyService = AdminCurrencyService;
