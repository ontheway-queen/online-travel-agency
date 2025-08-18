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
exports.TrackingService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class TrackingService extends abstract_service_1.default {
    constructor() {
        super();
        this.model = this.Model.TrackingModel();
    }
    createTracking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tracking_name, status, tracking_id_1, tracking_id_2 } = req.body;
            const tracking = yield this.model.createTraking({
                tracking_name,
                status,
                tracking_id_1,
                tracking_id_2
            });
            if (!tracking)
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                };
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    updateTracking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, tracking_name, status, tracking_id_1, tracking_id_2 } = req.body;
            const tracking = yield this.model.updateTracking({
                tracking_name,
                status,
                tracking_id_1,
                tracking_id_2,
            }, id);
            if (!tracking)
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                };
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    getSingleTracking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const singleTracking = yield this.model.getSingleTracking(id);
            // console.log(singleTracking)
            if (!singleTracking.length)
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: singleTracking
            };
        });
    }
}
exports.TrackingService = TrackingService;
