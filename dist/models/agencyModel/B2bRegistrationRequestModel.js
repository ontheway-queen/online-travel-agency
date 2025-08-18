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
exports.B2bRegistrationRequestModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class B2bRegistrationRequestModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Create B2B registration request
    createRegistrationRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("b2b_registration_request")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    // Update B2B registration request
    updateRegistrationRequest(query, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email } = query;
            return yield this.db("b2b_registration_request AS br")
                .withSchema(this.AGENT_SCHEMA)
                .where((qb) => {
                if (id) {
                    qb.andWhere("br.id", id);
                }
                if (email) {
                    qb.andWhere("br.email", email);
                }
            })
                .update(payload, "id");
        });
    }
    // Get all B2B registration requests
    getAllRegistrationRequests(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status, state, email, key } = query;
            const data = this.db("b2b_registration_request AS br")
                .withSchema(this.AGENT_SCHEMA)
                .select("br.id", "br.name", "br.email", "br.mobile_number", "br.photo", "br.status", "br.created_at", "br.address", "br.postal_code", "br.approved_by", "br.rejected_by", "br.rejected_reason", "br.state", "br.agency_name", "br.agency_logo", "br.agency_phone", "br.agency_email", "br.trade_license", "br.visiting_card")
                .where((qb) => {
                if (state) {
                    qb.andWhere("br.state", state);
                }
                if (status) {
                    qb.andWhere("br.status", status);
                }
                if (key) {
                    qb.andWhere((subQuery) => {
                        subQuery.orWhereILike("br.email", `%${key}%`);
                        subQuery.orWhereILike("br.name", `%${key}%`);
                    });
                }
            })
                .orderBy("id", "desc");
            if (limit) {
                data.limit(limit);
            }
            if (skip) {
                data.offset(skip);
            }
            const totals = yield this.db("b2b_registration_request AS br")
                .withSchema(this.AGENT_SCHEMA)
                .count("* as count")
                .where((qb) => {
                if (state) {
                    qb.andWhere("br.state", state);
                }
                if (status !== undefined) {
                    qb.andWhere("br.status", status);
                }
                if (key) {
                    qb.andWhere((subQuery) => {
                        subQuery.orWhereILike("br.email", `%${key}%`);
                        subQuery.orWhereILike("br.name", `%${key}%`);
                    });
                }
            });
            return {
                data: yield data,
                total: Number(totals[0].count),
            };
        });
    }
    // Get single B2B registration request
    getSingleRegistrationRequest(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email } = query;
            return yield this.db("b2b_registration_request AS br")
                .withSchema(this.AGENT_SCHEMA)
                .select("br.id", "br.name", "br.email", "br.mobile_number", "br.photo", "br.status", "br.created_at", "br.address", "br.postal_code", "br.approved_by", "br.rejected_by", "br.rejected_reason", "br.state", "br.agency_name", "br.agency_logo", "br.agency_phone", "br.agency_email", "br.trade_license", "br.visiting_card", this.db.raw("CONCAT(au1.first_name, ' ', au1.last_name) AS approved_by_name"), this.db.raw("CONCAT(au2.first_name, ' ', au2.last_name) AS rejected_by_name"))
                .joinRaw("LEFT JOIN admin.user_admin AS au1 ON au1.id = approved_by")
                .joinRaw("LEFT JOIN admin.user_admin AS au2 ON au2.id = rejected_by")
                .where((qb) => {
                if (id) {
                    qb.andWhere("br.id", id);
                }
                if (email) {
                    qb.andWhere("br.email", email);
                }
            })
                .first();
        });
    }
}
exports.B2bRegistrationRequestModel = B2bRegistrationRequestModel;
