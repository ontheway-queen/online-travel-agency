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
exports.AdminDealCodeService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminDealCodeService extends abstract_service_1.default {
    create(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { deal_code, api } = req.body;
                const { id: user_id } = req.admin;
                const model = this.Model.DealCodeModel(trx);
                const checkDealCode = yield model.getAll({ deal_code, api });
                if (checkDealCode.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "This deal code already exists for this API"
                    };
                }
                const res = yield model.create({
                    deal_code,
                    api,
                    created_by: user_id
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Deal code has been created",
                    data: {
                        id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id
                    }
                };
            }));
        });
    }
    getAll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.DealCodeModel();
            const data = yield model.getAll(query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data.data,
                total: data.total
            };
        });
    }
    update(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DealCodeModel();
            const { id } = req.params;
            const body = req.body;
            const getDealCode = yield model.getSingle(Number(id));
            if (!getDealCode.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            }
            if (body.deal_code) {
                const checkDealCode = yield model.getAll({ deal_code: body.deal_code, api: getDealCode[0].api });
                if (checkDealCode.data.length && checkDealCode.data[0].id != id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "This deal code already exists for this API"
                    };
                }
            }
            yield model.update(body, Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Successfully updated"
            };
        });
    }
    delete(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DealCodeModel();
            const { id } = req.params;
            const getDealCode = yield model.getSingle(Number(id));
            if (!getDealCode.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            }
            yield model.delete(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Deal code has been deleted"
            };
        });
    }
}
exports.AdminDealCodeService = AdminDealCodeService;
