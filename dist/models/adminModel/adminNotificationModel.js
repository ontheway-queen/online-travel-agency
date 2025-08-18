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
exports.AdminNotificationModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class AdminNotificationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //insert notification
    insertNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("notification")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get notifications
    getNotifications(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("notification as nn")
                .withSchema(this.ADMIN_SCHEMA)
                .select("nn.id", "nn.message", "nn.type", "nn.ref_id", "nn.created_at", this.db.raw("CASE WHEN ns.notification_id IS NOT NULL THEN true ELSE false END as read"))
                .leftJoin("notification_seen as ns", (join) => {
                join
                    .on("ns.notification_id", "nn.id")
                    .andOn("ns.user_id", this.db.raw("?", [payload.user_id]));
            })
                .orderBy("nn.id", "desc")
                .limit(payload.limit || 20)
                .offset(payload.skip || 0);
            const total = yield this.db("notification")
                .withSchema(this.ADMIN_SCHEMA)
                .count("id as total");
            return { data, total: (_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //insert notification seen
    insertNotificationSeen(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("notification_seen")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload);
        });
    }
    //check notification seen
    checkNotificationSeen(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("notification_seen")
                .withSchema(this.ADMIN_SCHEMA)
                .select("*")
                .where(payload);
        });
    }
}
exports.AdminNotificationModel = AdminNotificationModel;
