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
exports.AdminFlightRouteConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminFlightRouteConfigService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Create routes commission
    createRoutesCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { routes } = req.body;
            const { id: commission_set_id } = req.params;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            const commissionSetModel = this.Model.commissionSetModel();
            const checkSetCommission = yield commissionSetModel.getSingleCommissionSet(Number(commission_set_id));
            if (!checkSetCommission.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const payload = routes.map((item) => {
                return Object.assign(Object.assign({}, item), { commission_set_id: Number(commission_set_id) });
            });
            yield flightConfigModel.insertSetRoutesCommission(payload);
            return {
                status: true,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                code: this.StatusCode.HTTP_SUCCESSFUL,
            };
        });
    }
    // Get routes commission
    getRoutesCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const { id: commission_set_id } = req.params;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            const { data, total } = yield flightConfigModel.getSetRoutesCommission(Object.assign(Object.assign({}, query), { commission_set_id: Number(commission_set_id) }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    // Update routes commission
    updateRoutesCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const { commission_set_id, id } = req.params;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            yield flightConfigModel.updateSetRoutesCommission(body, Number(id), Number(commission_set_id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // Delete routes commission
    deleteRoutesCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { commission_set_id, id } = req.params;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            yield flightConfigModel.deleteSetRoutesCommission(Number(id), Number(commission_set_id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // Insert block route
    insertBlockRoute(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { routes } = req.body;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            yield flightConfigModel.insertBlockRoute(routes);
            return {
                status: true,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                code: this.StatusCode.HTTP_SUCCESSFUL,
            };
        });
    }
    // Get block routes
    getBlockRoutes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            const { data, total } = yield flightConfigModel.getBlockRoute(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    // Update block routes
    updateBlockRoutes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const body = req.body;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            yield flightConfigModel.updateBlockRoute(body, Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // Delete block routes
    deleteBlockRoutes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const flightConfigModel = this.Model.flightRouteConfigModel();
            yield flightConfigModel.deleteBlockRoute(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.AdminFlightRouteConfigService = AdminFlightRouteConfigService;
