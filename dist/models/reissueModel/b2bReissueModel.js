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
exports.B2BReissueRequestModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class B2BReissueRequestModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createReissueRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reissue_request")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    createReissueRequestTickets(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reissue_request_tickets")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    updateReissueRequest(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reissue_request")
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    getReissueRequestList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("view_reissue_request")
                .withSchema(this.AGENT_SCHEMA)
                .select("id", 'ref_no', 'booking_id', 'booking_ref', 'status', 'api', 'staff_status', 'staff_name', 'reason', 'created_at', 'staff_id', 'reissue_amount', 'convenience_fee')
                .where((qb) => {
                if (query.status) {
                    qb.andWhere("status", query.status);
                }
                if (query.staff_status) {
                    qb.andWhere("staff_status", query.staff_status);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween("created_at", [query.from_date, query.to_date]);
                }
                if (query.agency_id) {
                    qb.andWhere("agency_id", query.agency_id);
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy("id", "desc");
            let total = [];
            if (is_total) {
                total = yield this.db("view_reissue_request")
                    .withSchema(this.AGENT_SCHEMA)
                    .count("id as total")
                    .where((qb) => {
                    if (query.status) {
                        qb.andWhere("status", query.status);
                    }
                    if (query.staff_status) {
                        qb.andWhere("staff_status", query.staff_status);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween("created_at", [query.from_date, query.to_date]);
                    }
                    if (query.agency_id) {
                        qb.andWhere("agency_id", query.agency_id);
                    }
                });
            }
            return {
                data,
                total: (_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.total
            };
        });
    }
    getSingleReissueRequest(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("view_reissue_request")
                .withSchema(this.AGENT_SCHEMA)
                .select("*")
                .where((qb) => {
                if (where.id) {
                    qb.andWhere("id", where.id);
                }
                if (where.booking_id) {
                    qb.andWhere("booking_id", where.booking_id);
                }
                if (where.agency_id) {
                    qb.andWhere("agency_id", where.agency_id);
                }
            });
        });
    }
    getReissueRequestTickets(reissue_request_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("reissue_request_tickets")
                .withSchema(this.AGENT_SCHEMA)
                .select("*")
                .where({ reissue_request_id });
        });
    }
}
exports.B2BReissueRequestModel = B2BReissueRequestModel;
