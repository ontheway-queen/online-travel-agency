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
exports.AdminCommissionSetService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminCommissionSetService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Create Commission set
    createCommissionSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const { api, name } = req.body;
                const commissionSetModel = this.Model.commissionSetModel(trx);
                const apiAirlinesCommissionModel = this.Model.apiAirlinesCommissionModel(trx);
                const checkName = yield commissionSetModel.getCommissionSet({
                    exact_name: name,
                });
                if (checkName.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Name already exist!",
                    };
                }
                const newCommissionSet = yield commissionSetModel.createCommissionSet({
                    created_by: id,
                    name,
                });
                const PrePayload = [];
                for (const item of api) {
                    const { api_id, airlines } = item, rest = __rest(item, ["api_id", "airlines"]);
                    const checkExisting = PrePayload.find((singlePayload) => singlePayload.api_id === api_id);
                    const commissions = [];
                    if (checkExisting) {
                        airlines.forEach((airline) => {
                            commissions.push(Object.assign({ airline }, rest));
                        });
                        checkExisting.commissions = [
                            ...checkExisting.commissions,
                            ...commissions,
                        ];
                    }
                    else {
                        airlines.forEach((airline) => {
                            commissions.push(Object.assign({ airline }, rest));
                        });
                        PrePayload.push({
                            api_id,
                            set_id: newCommissionSet[0].id,
                            commissions,
                        });
                    }
                }
                for (const item of PrePayload) {
                    const { api_id, set_id, commissions } = item;
                    const checkApi = yield apiAirlinesCommissionModel.getFlightAPI({
                        id: api_id,
                    });
                    if (!checkApi.length) {
                        throw new customError_1.default(`Invalid api id: ${api_id}`, this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                    const newSetFlightApi = yield commissionSetModel.createSetFlightAPI({
                        api_id,
                        set_id,
                    });
                    const airlinesCommissionPayload = commissions.map((commission) => {
                        return Object.assign(Object.assign({}, commission), { set_flight_api_id: newSetFlightApi[0].id, created_by: id });
                    });
                    yield apiAirlinesCommissionModel.insertAPIAirlinesCommission(airlinesCommissionPayload);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    // Get commission set
    getCommissionSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const commissionSetModel = this.Model.commissionSetModel();
            const data = yield commissionSetModel.getCommissionSet(query);
            return {
                success: true,
                data,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // Get single commission set
    getSingleCommissionSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const commissionSetModel = this.Model.commissionSetModel();
            const commissionSetData = yield commissionSetModel.getSingleCommissionSet(Number(id));
            if (!commissionSetData.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const setFlightAPIData = yield commissionSetModel.getSetFlightAPI({
                set_id: Number(id),
            });
            return {
                success: true,
                data: {
                    id: commissionSetData[0].id,
                    name: commissionSetData[0].name,
                    status: commissionSetData[0].status,
                    api: setFlightAPIData,
                },
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // Update Set commission
    updateCommissionSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { name, add, update } = req.body;
                const { id } = req.params;
                const commissionSetModel = this.Model.commissionSetModel(trx);
                const checkComSet = yield commissionSetModel.getSingleCommissionSet(Number(id));
                if (!checkComSet.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (name) {
                    yield commissionSetModel.updateCommissionSet({ name }, Number(id));
                }
                if (add) {
                    for (const item of add) {
                        const checkSetFlightApi = yield commissionSetModel.getSetFlightAPI({
                            set_id: Number(id),
                            api_id: item,
                        });
                        if (checkSetFlightApi.length) {
                            throw new customError_1.default(`Api id ${item} already exist with this set`, this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                        }
                        yield commissionSetModel.createSetFlightAPI({
                            api_id: item,
                            set_id: Number(id),
                        });
                    }
                }
                if (update) {
                    for (const item of update) {
                        const { id, status } = item;
                        yield commissionSetModel.updateSetFlightAPI({ status }, id);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    //upsert btoc commission
    upsertBtoCCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.commissionSetModel();
            const { commission_set_id } = req.body;
            yield model.upsertBtoCCommission({ commission_set_id });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //get btoc commission
    getBtoCCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.commissionSetModel();
            const data = yield model.getBtoCCommission();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data,
            };
        });
    }
}
exports.AdminCommissionSetService = AdminCommissionSetService;
