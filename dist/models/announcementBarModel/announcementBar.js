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
exports.AnnouncementBarModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class AnnouncementBarModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create announcement
    createAnnouncementBar(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("website_announcement_bar")
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get all announcement
    getAllAnnouncementBar(_a) {
        return __awaiter(this, arguments, void 0, function* ({ isActive, currentDate, type, }) {
            return yield this.db("website_announcement_bar")
                .withSchema(this.SERVICE_SCHEMA)
                .select("id", "message", "start_date", "end_date", "link", "is_active", "type")
                .where((qb) => {
                if (isActive != undefined) {
                    qb.andWhere("is_active", isActive);
                }
                if (currentDate) {
                    qb.andWhere("start_date", "<=", currentDate)
                        .andWhere(function () {
                        this.whereNull("end_date").orWhere("end_date", ">=", currentDate);
                    });
                }
                if (type) {
                    qb.andWhere("type", type);
                }
            })
                .orderBy("id", "desc");
        });
    }
    //get single announcement
    getSingeAnnouncementBar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("website_announcement_bar")
                .withSchema(this.SERVICE_SCHEMA)
                .where({ id })
                .first();
        });
    }
    //update announcement
    updateAnnouncementBar(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("website_announcement_bar")
                .withSchema(this.SERVICE_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete announcement
    deleteAnnouncementBar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("website_announcement_bar")
                .withSchema(this.SERVICE_SCHEMA)
                .del()
                .where({ id });
        });
    }
}
exports.AnnouncementBarModel = AnnouncementBarModel;
