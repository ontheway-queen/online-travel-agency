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
exports.TrackingModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class TrackingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //Create Tracking
    createTraking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("tracking_settings")
                .withSchema("services")
                .insert(payload)
                .onConflict("tracking_name")
                .merge();
        });
    }
    //Update Tracking
    updateTracking(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("tracking_settings")
                .withSchema("services")
                .update(payload)
                .where("id", id);
        });
    }
    //Get Single Tracking
    getSingleTracking(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("tracking_settings")
                .withSchema("services")
                .where("id", id)
                .select("tracking_name", "status", "tracking_id_1", "tracking_id_2");
        });
    }
}
exports.TrackingModel = TrackingModel;
