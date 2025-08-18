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
exports.APIAirlineCommissionModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class APIAirlineCommissionModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // GET Flight API
    getFlightAPI(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, name, status, }) {
            return yield this.db("supplier")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                if (id) {
                    qb.andWhere("id", id);
                }
                if (name) {
                    qb.andWhere("name", name);
                }
                if (status !== undefined) {
                    qb.andWhere("status", status);
                }
            });
        });
    }
    // Update Flight API
    updateFlightAPI(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("set_flight_api")
                .withSchema(this.DBO_SCHEMA)
                .update({ status })
                .where({ id });
        });
    }
    // Get Only API active Airlines
    getAPIActiveAirlines(set_flight_api_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("api_airlines_commission")
                .withSchema(this.DBO_SCHEMA)
                .select("airline AS Code")
                .andWhere("set_flight_api_id", set_flight_api_id)
                .andWhere("status", true);
        });
    }
    //get Only api active airlines with Code and Name
    getAPIActiveAirlinesName(set_flight_api_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("dbo.api_airlines_commission")
                .select("airline AS Code", "airlines.name AS Name")
                .andWhere("set_flight_api_id", set_flight_api_id)
                .andWhere("status", true)
                .leftJoin("public.airlines", "api_airlines_commission.airline", "airlines.code");
        });
    }
    // Get API Airlines Commission
    getAPIAirlinesCommission(_a) {
        return __awaiter(this, arguments, void 0, function* ({ airline, set_flight_api_id, status, api_status, limit, skip, }, need_total = true) {
            var _b;
            const data = yield this.db("api_airlines_commission AS aac")
                .withSchema(this.DBO_SCHEMA)
                .select("aac.id AS key", "aac.airline", "airlines.name as airline_name", "airlines.logo as airline_logo", "aac.com_domestic", "aac.com_from_dac", "aac.com_to_dac", "aac.com_soto", "aac.com_type", "aac.com_mode", "aac.status", "aac.booking_block", "aac.issue_block", this.db.raw(`CONCAT(cad.first_name, ' ', cad.last_name) AS created_by`), this.db.raw(`CONCAT(uad.first_name, ' ', uad.last_name) AS updated_by`), "aac.updated_at As last_updated_at", "aac.set_flight_api_id", "fa.api_name", "fa.api_logo")
                // Need to create view with set flight api and flight api
                .joinRaw("left join ?? on ?? = ??", [
                "admin.user_admin AS cad",
                "aac.created_by",
                "cad.id",
            ])
                .joinRaw("left join ?? on ?? = ??", [
                "admin.user_admin AS uad",
                "aac.updated_by",
                "uad.id",
            ])
                .leftJoin("set_flight_api_view AS fa", "aac.set_flight_api_id", "fa.id")
                .joinRaw("left join ?? on ?? = ??", ["public.airlines", "aac.airline", "airlines.code"])
                .where((qb) => {
                if (api_status) {
                    qb.andWhere("fa.status", api_status);
                }
                if (set_flight_api_id) {
                    qb.andWhere("aac.set_flight_api_id", set_flight_api_id);
                }
                if (airline) {
                    qb.andWhere("aac.airline", airline);
                }
                if (status !== undefined) {
                    qb.andWhere("aac.status", status);
                }
            })
                .limit(limit ? Number(limit) : 100)
                .offset(skip ? Number(skip) : 0);
            let total = [];
            if (need_total) {
                total = yield this.db("api_airlines_commission AS aac")
                    .withSchema(this.DBO_SCHEMA)
                    .count("aac.id AS total")
                    .leftJoin("supplier AS fa", "aac.set_flight_api_id", "fa.id")
                    .where((qb) => {
                    if (api_status) {
                        qb.andWhere("fa.status", api_status);
                    }
                    if (set_flight_api_id) {
                        qb.andWhere("aac.set_flight_api_id", set_flight_api_id);
                    }
                    if (airline) {
                        qb.andWhere("aac.airline", airline);
                    }
                    if (status !== undefined) {
                        qb.andWhere("aac.status", status);
                    }
                });
            }
            return { data, total: (_b = total[0]) === null || _b === void 0 ? void 0 : _b.total };
        });
    }
    // Insert API Airlines Commission
    insertAPIAirlinesCommission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("api_airlines_commission")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    // Update API Airlines Commission
    updateAPIAirlinesCommission(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db("api_airlines_commission")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // Delete API Airlines commission
    deleteAPIAirlinesCommission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("api_airlines_commission")
                .withSchema(this.DBO_SCHEMA)
                .del()
                .where((qb) => {
                if (typeof id === "number") {
                    qb.andWhere("id", id);
                }
                else {
                    qb.whereIn("id", id);
                }
            });
        });
    }
}
exports.APIAirlineCommissionModel = APIAirlineCommissionModel;
