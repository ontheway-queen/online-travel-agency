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
exports.SearchHistoryModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class SearchHistoryModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createFlightSearchHistory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_search_history")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    getFlightSearchHistory(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = this.db("dbo.flight_search_history as fsh")
                .leftJoin("agent.agency_info as ai", "fsh.agency_id", "ai.id")
                .leftJoin("agent.btob_user as bu", "fsh.searched_by", "bu.id")
                .leftJoin("b2c.users as u", "fsh.searched_by", "u.id")
                .select("fsh.id", "fsh.user_type", "fsh.searched_at", "fsh.journey_type", "fsh.flight_class", "fsh.total_adult", "fsh.total_child", "fsh.total_infant", "fsh.route", "fsh.journey_date", "fsh.preferred_airlines", "fsh.request_body", this.db.raw(`
      CASE 
        WHEN fsh.user_type = 'Agent' THEN ai.agency_name
        WHEN fsh.user_type = 'User' THEN CONCAT(u.first_name, ' ', u.last_name)
        ELSE NULL
      END as source_name
    `))
                .modify((qb) => {
                if (query.from_date && query.to_date) {
                    console.log({ query });
                    qb.whereRaw("DATE(fsh.searched_at) BETWEEN ? AND ?", [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                if (query.agency_id) {
                    qb.andWhere("fsh.agency_id", query.agency_id);
                }
                if (query.user_type) {
                    qb.andWhere("fsh.user_type", query.user_type);
                }
            })
                .orderBy("fsh.id", "desc");
            if (query.limit) {
                data.limit(+data.limit);
            }
            if (query.skip) {
                data.offset(+query.skip);
            }
            let total = [];
            if (is_total) {
                total = yield this.db("dbo.flight_search_history as fsh")
                    .count("fsh.id as total")
                    .modify((qb) => {
                    if (query.from_date && query.to_date) {
                        console.log({ query });
                        qb.whereRaw("DATE(fsh.searched_at) BETWEEN ? AND ?", [
                            query.from_date,
                            query.to_date,
                        ]);
                    }
                    if (query.agency_id) {
                        qb.andWhere("fsh.agency_id", query.agency_id);
                    }
                    if (query.user_type) {
                        qb.andWhere("fsh.user_type", query.user_type);
                    }
                });
            }
            return {
                data: yield data,
                total: (_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
}
exports.SearchHistoryModel = SearchHistoryModel;
