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
exports.LastServiceEntryModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class LastServiceEntryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //increment
    incrementLastRefId(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('last_service_entry')
                .withSchema(this.SERVICE_SCHEMA)
                .increment("last_ref_id")
                .where("service_type", payload.type);
        });
    }
    //get last entry
    getLastRefId(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("last_service_entry")
                .withSchema(this.SERVICE_SCHEMA)
                .select("last_ref_id")
                .where("service_type", payload.type);
            return (_a = data === null || data === void 0 ? void 0 : data[0]) === null || _a === void 0 ? void 0 : _a.last_ref_id;
        });
    }
}
exports.LastServiceEntryModel = LastServiceEntryModel;
