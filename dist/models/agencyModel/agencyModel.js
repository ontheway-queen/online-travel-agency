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
exports.AgencyModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class AgencyModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create agency
    createAgency(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agency_info")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    //create agency user
    createAgencyUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("btob_user")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get agency
    getAgency(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db(`${this.AGENT_SCHEMA}.agency_info  as ai`)
                .select("ai.id", "ai.agency_logo", "ai.agency_name", "ai.email", "ai.phone", "ai.status", "ai.created_at", "ai.commission_set_id", "ai.agency_ref_number", "cs.name as commission_set_name", "ai.loan", this.db.raw(`
(
  SELECT 
    COALESCE(SUM(CASE WHEN ad.type = 'credit' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN ad.type = 'debit' THEN amount ELSE 0 END), 0) 
  AS balance 
  FROM agent.agency_ledger as ad
  WHERE ai.id = ad.agency_id
) AS balance
`))
                .leftJoin(`${this.DBO_SCHEMA}.dynamic_fare_set as cs`, "cs.id", "ai.commission_set_id")
                .where((qb) => {
                if (payload.name) {
                    qb.andWhereILike("agency_name", `%${payload.name}%`);
                    qb.orWhereILike("email", `%${payload.name}%`);
                    qb.orWhereILike("phone", `%${payload.name}%`);
                    qb.orWhereILike("cs.name", `%${payload.name}%`);
                }
                if (payload.status !== undefined) {
                    qb.andWhere("ai.status", payload.status);
                }
                if (payload.ref_id) {
                    qb.andWhere("ref_id", payload.ref_id);
                }
                if (payload.loan) {
                    qb.andWhere("ai.loan", ">", 0);
                }
            })
                .orderBy("id", "desc")
                .limit(payload.limit || 100)
                .offset(payload.skip || 0);
            let total = [];
            total = yield this.db("agency_info")
                .withSchema(this.AGENT_SCHEMA)
                .count("* as total")
                .where((qb) => {
                if (payload.name) {
                    qb.andWhereILike("agency_name", `%${payload.name}%`);
                    qb.orWhereILike("email", `%${payload.name}%`);
                    qb.orWhereILike("phone", `%${payload.name}%`);
                }
                if (payload.status !== undefined) {
                    qb.andWhere("status", payload.status);
                }
                if (payload.ref_id) {
                    qb.andWhere("ref_id", payload.ref_id);
                }
                if (payload.loan) {
                    qb.andWhere("loan", ">", 0);
                }
            });
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    checkAgency(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db(`${this.AGENT_SCHEMA}.agency_info  as ai`)
                .select("ai.id", "ai.agency_logo", "ai.agency_name", "ai.email", "ai.phone", "ai.status", "ai.created_at", "ai.commission_set_id", "ai.agency_ref_number", "cs.name as commission_set_name", "ai.loan")
                .leftJoin(`${this.DBO_SCHEMA}.dynamic_fare_set as cs`, "cs.id", "ai.commission_set_id")
                .where((qb) => {
                if (payload.name) {
                    qb.andWhereILike("agency_name", `%${payload.name}%`);
                    qb.orWhereILike("email", `%${payload.name}%`);
                    qb.orWhereILike("phone", `%${payload.name}%`);
                    qb.orWhereILike("cs.name", `%${payload.name}%`);
                }
                if (payload.status !== undefined) {
                    qb.andWhere("ai.status", payload.status);
                }
                if (payload.ref_id) {
                    qb.andWhere("ref_id", payload.ref_id);
                }
                if (payload.loan) {
                    qb.andWhere("ai.loan", ">", 0);
                }
                if (payload.commission_set_id) {
                    qb.andWhere("ai.commission_set_id", payload.commission_set_id);
                }
                if (payload.id) {
                    qb.andWhere("ai.id", payload.id);
                }
                if (payload.email) {
                    qb.andWhere("ai.email", payload.email);
                }
            })
                .orderBy("id", "desc")
                .limit(payload.limit || 100)
                .offset(payload.skip || 0);
            let total = [];
            total = yield this.db("agency_info")
                .withSchema(this.AGENT_SCHEMA)
                .count("* as total")
                .where((qb) => {
                if (payload.name) {
                    qb.andWhereILike("agency_name", `%${payload.name}%`);
                    qb.orWhereILike("email", `%${payload.name}%`);
                    qb.orWhereILike("phone", `%${payload.name}%`);
                }
                if (payload.status !== undefined) {
                    qb.andWhere("status", payload.status);
                }
                if (payload.ref_id) {
                    qb.andWhere("ref_id", payload.ref_id);
                }
                if (payload.loan) {
                    qb.andWhere("loan", ">", 0);
                }
                if (payload.email) {
                    qb.andWhere("email", payload.email);
                }
            });
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // Check agency by api key
    checkAgencyByAPIKey(api_key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("btob_user AS bu")
                .withSchema(this.AGENT_SCHEMA)
                .leftJoin("agency_info AS ai", "bu.agency_id", "ai.id")
                .select("bu.id", "bu.name", "bu.email", "bu.mobile_number", "bu.photo", "bu.status AS user_status", "bu.agency_id", "ai.agency_logo", "ai.agency_name", "ai.status AS agency_status", "ai.commission_set_id", "ai.ref_id", "ai.address")
                .andWhere("ai.external_api", true)
                .andWhere("ai.api_key", api_key)
                .first();
        });
    }
    //get single agency
    getSingleAgency(id, ref_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(`${this.AGENT_SCHEMA}.agency_info as ai`)
                .select("ai.*", "cs.name as commission_set_name", "ua.email as kam_email")
                .leftJoin(`${this.DBO_SCHEMA}.dynamic_fare_set as cs`, "cs.id", "ai.commission_set_id")
                .leftJoin(`${this.ADMIN_SCHEMA}.user_admin as ua`, "ua.id", "ai.kam")
                .where("ai.id", id)
                .andWhere((qb) => {
                if (ref_id) {
                    qb.andWhere("ai.ref_id", ref_id);
                }
            });
        });
    }
    //get user
    getUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("btob_user")
                .withSchema(this.AGENT_SCHEMA)
                .select("id", "name", "email", "mobile_number", "photo", "status", "socket_id")
                .where("agency_id", payload.agency_id)
                .orderBy("id", "desc")
                .limit(payload.limit || 100)
                .offset(payload.skip || 0);
        });
    }
    //update agency
    updateAgency(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agency_info")
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //update agency user
    updateAgencyUser(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("btob_user")
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //get single user
    getSingleUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("btob_user as user")
                .withSchema(this.AGENT_SCHEMA)
                .select("user.*", "ai.agency_name", "ai.agency_logo", "ai.email as agency_email", "ai.phone as agency_phone", "ai.loan", "ai.status as agency_status")
                .leftJoin(this.db
                .withSchema(this.AGENT_SCHEMA)
                .table("agency_info")
                .select()
                .as("ai"), "user.agency_id", "ai.id")
                .where((qb) => {
                if (payload.email) {
                    qb.where("user.email", payload.email);
                }
                if (payload.id) {
                    qb.where("user.id", payload.id);
                }
                if (payload.agency_id) {
                    qb.where("user.agency_id", payload.agency_id);
                }
                if (payload.status !== undefined) {
                    qb.where("user.status", payload.status);
                }
            });
        });
    }
    //insert agency deposit request
    insertAgencyDepositRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agency_deposit_request")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    //update agency deposit request
    updateAgencyDepositRequest(payload_1, _a) {
        return __awaiter(this, arguments, void 0, function* (payload, { id, agency_id }) {
            return yield this.db("agency_deposit_request")
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id })
                .andWhere({ agency_id });
        });
    }
    //get agency deposit request
    getAllAgencyDepositRequest(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, status, limit, skip, }) {
            const data = yield this.db("agency_deposit_request as adr")
                .withSchema(this.AGENT_SCHEMA)
                .select("adr.*", "ai.agency_name", "ai.agency_logo", "ai.phone as agency_phone")
                .join("agency_info as ai", "adr.agency_id", "ai.id")
                .where(function () {
                if (agency_id) {
                    this.andWhere("adr.agency_id", agency_id);
                }
                if (status) {
                    this.andWhere("adr.status", status);
                }
            })
                .limit(limit || 100)
                .offset(skip || 0)
                .orderBy("adr.id", "desc");
            const total = yield this.db("agency_deposit_request as adr")
                .withSchema(this.AGENT_SCHEMA)
                .count("adr.id as total")
                .where(function () {
                if (agency_id) {
                    this.andWhere("adr.agency_id", agency_id);
                }
                if (status) {
                    this.andWhere("adr.status", status);
                }
            });
            return { data, total: parseInt(total[0].total) };
        });
    }
    // get single deposit
    getSingleDeposit(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id }) {
            return yield this.db("agency_deposit_request as adr")
                .withSchema(this.AGENT_SCHEMA)
                .select("adr.*", "ai.agency_name", "ai.agency_logo", "ai.email as agency_email", "ai.phone as agency_phone")
                .join("agency_info as ai", "adr.agency_id", "ai.id")
                .where("adr.id", id);
        });
    }
    //insert agency ledger
    insertAgencyLedger(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agency_ledger")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get total balance
    getTotalBalance(agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db(`${this.AGENT_SCHEMA}.agency_ledger`)
                .select(this.db.raw(`
        (
          SELECT 
            SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) - 
            SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) 
          AS balance 
          FROM ${this.AGENT_SCHEMA}.agency_ledger 
          WHERE agency_id = ?
        ) AS balance
        `, [agency_id]))
                .first();
            if (data) {
                return Number(data.balance);
            }
            else {
                return 0;
            }
        });
    }
    //get agency transactions
    getAgencyTransactions(params_1) {
        return __awaiter(this, arguments, void 0, function* (params, need_total = true) {
            var _a;
            const data = yield this.db(`${this.AGENT_SCHEMA}.agency_ledger as ad`)
                .select("ad.id", "ad.type", "ad.amount", "ad.date", "ad.details", "ad.payment_slip_file", "a.username as deposited_by", this.db.raw(`(SELECT SUM(CASE WHEN acl.type = ? THEN acl.amount ELSE 0 END) - SUM(CASE WHEN acl.type = ? THEN acl.amount ELSE 0 END) as balance FROM agent.agency_ledger AS acl where acl.agency_id = ad.agency_id and acl.id <= ad.id and acl.agency_id = ? ) as last_balance`, ["credit", "debit", params.agency_id]))
                .leftJoin("admin.user_admin AS a", "ad.created_by", "a.id")
                .where((qb) => {
                qb.andWhere("ad.agency_id", params.agency_id);
                if (params.start_date && params.end_date) {
                    qb.andWhereBetween("ad.date", [params.start_date, params.end_date]);
                }
                if (params.type) {
                    qb.andWhere("ad.type", params.type);
                }
                if (params.search) {
                    qb.andWhere("ad.details", "like", `%${params.search}%`);
                }
            })
                .orderBy("ad.id", "desc")
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0);
            let total = [];
            if (need_total) {
                total = yield this.db("agent.agency_ledger as ad")
                    .count("* AS total")
                    .where((qb) => {
                    qb.andWhere("ad.agency_id", params.agency_id);
                    if (params.start_date && params.end_date) {
                        qb.andWhereBetween("ad.date", [params.start_date, params.end_date]);
                    }
                    if (params.type) {
                        qb.andWhere("ad.type", params.type);
                    }
                    if (params.search) {
                        qb.andWhere("ad.details", "like", `%${params.search}%`);
                    }
                });
            }
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //get all transactions
    getAllTransaction(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("agency_ledger as ad")
                .withSchema(this.AGENT_SCHEMA)
                .select("ad.id", "ad.type", "ai.agency_name", "ad.amount", "ad.date", "a.first_name as deposited_by", "bu.name as credited_by", "ad.details")
                .join("agency_info as ai", "ai.id", "ad.agency_id")
                .joinRaw(`left join ${this.ADMIN_SCHEMA}.user_admin as a on ad.admin_id = a.id`)
                .leftJoin("btob_user AS bu", "ad.created_by", "bu.id")
                .where((qb) => {
                if (params.from_date && params.to_date) {
                    qb.andWhereBetween("ad.date", [params.from_date, params.to_date]);
                }
                if (params.agency_id) {
                    qb.andWhere("ad.agency_id", params.agency_id);
                }
            })
                .limit(params.limit || 100)
                .offset(params.skip || 0)
                .orderBy("ad.id", "desc");
            const total = yield this.db("agency_ledger as ad")
                .withSchema(this.AGENT_SCHEMA)
                .count("ad.id as total")
                .where((qb) => {
                if (params.from_date && params.to_date) {
                    qb.andWhereBetween("ad.date", [params.from_date, params.to_date]);
                }
            });
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //insert b2b traveler
    insertTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agent.travelers").insert(payload, "id");
        });
    }
    // get all travelers
    getAllTravelers(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, agency_id, name, status } = payload;
            const dtbs = this.db("agent.travelers");
            if (limit && skip) {
                dtbs.limit(parseInt(limit));
                dtbs.offset(parseInt(skip));
            }
            const data = yield dtbs
                .select("travelers.id", "reference", "first_name as mid_name", "sur_name", this.db.raw(`
                CASE 
                    WHEN gender = 'M' THEN 'M' 
                    WHEN gender = 'F' THEN 'F' 
                    ELSE gender 
                END as gender
                `), "phone", "date_of_birth", "email", "type", "passport_number", "passport_expire_date", "country_id", "city", "frequent_flyer_airline", "frequent_flyer_number", "con.name as country", "visa_file", "passport_file", "nationality", "issuing_country")
                .leftJoin("public.country as con", "con.id", "travelers.country_id")
                .where({ agency_id })
                .andWhere(function () {
                if (name) {
                    this.andWhereRaw("LOWER(CONCAT(first_name, ' ', sur_name)) LIKE LOWER(?)", [`%${name.toLowerCase()}%`]);
                }
                if (status !== undefined) {
                    this.andWhere("status", status);
                }
            });
            const total = yield this.db("agent.travelers")
                .count("id as total")
                .where({ agency_id })
                .andWhere(function () {
                if (name) {
                    this.andWhereRaw("LOWER(CONCAT(first_name, ' ', sur_name)) LIKE LOWER(?)", [`%${name.toLowerCase()}%`]);
                }
                if (status !== undefined) {
                    this.andWhere("status", status);
                }
            });
            return { data, total: parseInt(total[0].total) };
        });
    }
    //   update travelers
    updateTravelers(agency_id, id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("travelers")
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({
                agency_id,
            })
                .andWhere({ id });
        });
    }
    // get single travelers
    getSingleTravelers(agency_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agent.travelers")
                .select("travelers.id", "reference", "first_name as mid_name", "sur_name", this.db.raw(`
          CASE 
            WHEN gender = 'M' THEN 'M' 
            WHEN gender = 'F' THEN 'F' 
            ELSE gender 
          END as gender
        `), "phone", "date_of_birth", "email", "type", "passport_number", "passport_expire_date", "country_id", "city", "frequent_flyer_airline", "frequent_flyer_number", "con.name as country", "visa_file", "passport_file", "nationality", "issuing_country")
                .leftJoin("public.country as con", "con.id", "travelers.country_id")
                .where({ agency_id })
                .andWhere("travelers.id", id);
        });
    }
    //delete travelers
    deleteTraveler(agency_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agent.travelers")
                .delete()
                .where({ agency_id })
                .andWhere({ id });
        });
    }
    //dashboard
    agentDashboard(agent_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentDate = new Date();
            const currentYear = new Date().getFullYear();
            const daily_booking_amount = yield this.db("flight_booking")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
              SUM(CASE WHEN status = 'issued' THEN payable_amount ELSE 0 END) AS daily_issue_amount,
              SUM(CASE WHEN status = 'reissued' THEN payable_amount ELSE 0 END) AS daily_reissue_amount,
              SUM(CASE WHEN status = 'refund' THEN payable_amount ELSE 0 END) AS daily_refund_amount
              `))
                .where("created_by", agent_id)
                .andWhereRaw("DATE(created_at) = ?", [currentDate])
                .first();
            const monthly_booking_amount = yield this.db("flight_booking")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
              SUM(CASE WHEN status = 'issued' THEN payable_amount ELSE 0 END) AS monthly_issue_amount,
              SUM(CASE WHEN status = 'reissued' THEN payable_amount ELSE 0 END) AS monthly_reissue_amount,
              SUM(CASE WHEN status = 'refund' THEN payable_amount ELSE 0 END) AS monthly_refund_amount
              `))
                .where("created_by", agent_id)
                .andWhereRaw("DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)")
                .first();
            const total_booking = yield this.db("flight_booking")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
                  COUNT(*) AS total,
                  COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
                  COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
                  COUNT(*) FILTER (WHERE status = 'issued') AS total_issued
                  `))
                .first()
                .where("created_by", agent_id);
            const booking_graph = yield this.db("flight_booking")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
              TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
              COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
              COUNT(*) FILTER (WHERE status = 'issued') AS total_issued
          `))
                .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
                .andWhere("created_by", agent_id)
                .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
                .orderByRaw("MIN(created_at)");
            return {
                total_booking: Object.assign(Object.assign(Object.assign({}, total_booking), daily_booking_amount), monthly_booking_amount),
                booking_graph,
            };
        });
    }
    //total agencies count
    totalAgenciesCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const agency_info = yield this.db("agency_info")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = true) as active,
      COUNT(*) FILTER (WHERE status = false) as inactive`))
                .first();
            const pending_agency = yield this.db("b2b_registration_request")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
        COUNT(*) FILTER (WHERE state = 'pending') as pending,
        COUNT(*) FILTER (WHERE state = 'approved') as approved,
        COUNT(*) FILTER (WHERE state = 'rejected') as rejected`))
                .first();
            return {
                total_agency: agency_info.total,
                active_agency: agency_info.active,
                inactive_agency: agency_info.inactive,
                pending_agency: pending_agency.pending,
                approved_agency: pending_agency.approved,
                rejected_agency: pending_agency.rejected,
            };
        });
    }
    //get top agencies
    getTopAgencies() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db(`${this.AGENT_SCHEMA}.agency_info  as ai`)
                .select("ai.id", "ai.agency_logo", "ai.agency_name", "ai.email", "ai.phone", "ai.created_at", "cs.name as commission_set_name", this.db.raw(`
  (
    SELECT 
      COALESCE(SUM(CASE WHEN ad.type = 'debit' THEN amount ELSE 0 END), 0) 
    AS total_purchased 
    FROM agent.agency_ledger as ad
    WHERE ai.id = ad.agency_id
  ) AS total_purchased
  `))
                .leftJoin(`${this.DBO_SCHEMA}.dynamic_fare_set as cs`, "cs.id", "ai.commission_set_id")
                .orderBy("total_purchased", "desc")
                .limit(5);
            return data;
        });
    }
    // get last agency transaction
    getLastAgencyTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("agency_ledger")
                .withSchema(this.AGENT_SCHEMA)
                .select("id")
                .orderBy("id", "desc")
                .limit(1);
            return data[0];
        });
    }
}
exports.AgencyModel = AgencyModel;
