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
exports.AgencyNotificationSubService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const socket_1 = require("../../../../app/socket");
class AgencyNotificationSubService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    //insert notification
    insertNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationModel = this.Model.agencyNotificationModel(this.trx);
            //insert notification to database
            const res = yield notificationModel.insertNotification(payload);
            //send notification to socket
            const getAgentsInfo = yield this.Model.agencyModel(this.trx).getUser({ agency_id: payload.agency_id, limit: 9999999 });
            const agent_socket_ids = (getAgentsInfo === null || getAgentsInfo === void 0 ? void 0 : getAgentsInfo.map((socket_ids) => socket_ids.socket_id)) || [];
            socket_1.io.to(agent_socket_ids).emit('notification', {
                id: res[0].id,
                message: payload.message,
                type: payload.type,
                ref_id: payload.ref_id,
                created_at: new Date(),
                read: false
            });
        });
    }
}
exports.AgencyNotificationSubService = AgencyNotificationSubService;
