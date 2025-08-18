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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class AdminModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //get single admin
    getSingleAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin as ua")
                .select("ua.*", "rl.name as role", "rl.id as role_id")
                .withSchema(this.ADMIN_SCHEMA)
                .leftJoin("roles as rl", "rl.id", "ua.role_id")
                .where((qb) => {
                if (payload.id) {
                    qb.where("ua.id", payload.id);
                }
                if (payload.email) {
                    qb.orWhere("email", payload.email);
                }
                if (payload.phone_number) {
                    qb.orWhere("phone_number", payload.phone_number);
                }
                if (payload.username) {
                    qb.orWhere("username", payload.username);
                }
            });
        });
    }
    //update user admin
    updateUserAdmin(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin")
                .withSchema(this.ADMIN_SCHEMA)
                .update(payload)
                .where((qb) => {
                if (where.id) {
                    qb.where("id", where.id);
                }
                if (where.email) {
                    qb.where("email", where.email);
                }
            });
        });
    }
    //create admin
    createAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("user_admin")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get all admin
    getAllAdmin(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("user_admin as ua")
                .withSchema(this.ADMIN_SCHEMA)
                .select("ua.id", "ua.username", "ua.first_name", "ua.last_name", "ua.email", "ua.phone_number", "ua.photo", "rl.name as role", "ua.status", "ua.socket_id")
                .leftJoin("roles as rl", "rl.id", "ua.role_id")
                .where((qb) => {
                if (query.filter) {
                    qb.where((qbc) => {
                        qbc.where("ua.username", "ilike", `%${query.filter}%`);
                        qbc.orWhere("ua.email", "ilike", `%${query.filter}%`);
                        qbc.orWhere("ua.phone_number", "ilike", `%${query.filter}%`);
                    });
                }
                if (query.role) {
                    qb.andWhere("rl.id", query.role);
                }
                if (query.status === "true" || query.status === "false") {
                    qb.andWhere("ua.status", query.status);
                }
            })
                .orderBy("ua.id", "desc")
                .limit(query.limit ? query.limit : 100)
                .offset(query.skip ? query.skip : 0);
            let total = [];
            if (is_total) {
                total = yield this.db("user_admin as ua")
                    .withSchema(this.ADMIN_SCHEMA)
                    .count("ua.id as total")
                    .join("roles as rl", "rl.id", "ua.role_id")
                    .where((qb) => {
                    if (query.filter) {
                        qb.where((qbc) => {
                            qbc.where("ua.username", "ilike", `%${query.filter}%`);
                            qbc.orWhere("ua.email", "ilike", `%${query.filter}%`);
                            qbc.orWhere("ua.phone_number", "ilike", `%${query.filter}%`);
                        });
                    }
                    if (query.role) {
                        qb.andWhere("rl.id", query.role);
                    }
                    if (query.status === "true" || query.status === "false") {
                        qb.andWhere("ua.status", query.status);
                    }
                });
            }
            return {
                data: data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    //get last  admin Id
    getLastAdminID() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("user_admin")
                .withSchema(this.ADMIN_SCHEMA)
                .select("id")
                .orderBy("id", "desc")
                .limit(1);
            return data.length ? data[0].id : 0;
        });
    }
    //dashboard
    adminDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const total_booking = yield this.db("flight_booking")
                .withSchema(this.BTOC_SCHEMA)
                .select(this.db.raw(`
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
              COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
              COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
              COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
              `))
                .first();
            const total_booking_b2b = yield this.db("flight_booking")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
              COUNT(*) AS total_b2b,
              COUNT(*) FILTER (WHERE status = 'pending') AS b2b_total_pending,
              COUNT(*) FILTER (WHERE status = 'booking-cancelled') AS b2b_total_cancelled,
              COUNT(*) FILTER (WHERE status = 'issued') AS b2b_total_issued
              `))
                .first();
            const currentYear = new Date().getFullYear();
            const booking_graph = yield this.db("flight_booking")
                .withSchema(this.BTOC_SCHEMA)
                .select(this.db.raw(`
          TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
          COUNT(*) FILTER (WHERE status = 'booking-cancelled') AS total_cancelled,
          COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
          COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
      `))
                .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
                .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
                .orderByRaw("MIN(created_at)");
            const booking_graph_b2b = yield this.db("flight_booking")
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
          TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
          COUNT(*) FILTER (WHERE status = 'booking-cancelled') AS total_cancelled,
          COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
          COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
      `))
                .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
                .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
                .orderByRaw("MIN(created_at)");
            return {
                total_booking: Object.assign(Object.assign({}, total_booking), total_booking_b2b),
                booking_graph,
                booking_graph_b2b,
            };
        });
    }
    //upload banner
    uploadBannerImage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("banner_images")
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload);
        });
    }
    //get banner image
    getBannerImage() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("banner_images")
                .withSchema(this.ADMIN_SCHEMA)
                .select("id", "banner_image", "status");
        });
    }
    //update Image Status
    updateImageStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("banner_images")
                .withSchema(this.ADMIN_SCHEMA)
                .where({ id: id })
                .update({
                status: this.db.raw("NOT status"),
            });
        });
    }
    //get active banner image only
    getActiveBannerImage() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("banner_images")
                .withSchema(this.ADMIN_SCHEMA)
                .select("id", "banner_image", "status")
                .where("status", "=", "true");
        });
    }
    //search booking info
    searchBookingInfo(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const b2bFlightResult = this.db("flight_booking as fb")
                .withSchema(this.AGENT_SCHEMA)
                .select("fb.id", "fb.booking_id as ref_id", "fb.pnr_code", "fb.route", "fb.payable_amount", "fb.created_at", "fb.total_passenger", this.db.raw("'b2b-flight' as type"), "fb.status")
                .leftJoin("flight_booking_traveler as fbt", "fbt.flight_booking_id", "fb.id")
                .joinRaw("left join agent.invoice inv on inv.ref_id = fb.id and inv.ref_type = 'flight'")
                .where((qb) => {
                if (filter) {
                    qb.andWhere((qb) => {
                        qb.whereILike("fb.booking_id", `${filter}%`);
                        qb.orWhereILike("fb.pnr_code", `${filter}%`);
                        qb.orWhereILike("fbt.ticket_number", `${filter}%`);
                        qb.orWhereILike("inv.invoice_number", `${filter}%`);
                    });
                }
            });
            const b2cFlightResult = this.db("flight_booking as fb")
                .withSchema(this.BTOC_SCHEMA)
                .select("fb.id", "fb.booking_id as booking_ref", "fb.pnr_code", "fb.route", "fb.payable_amount", "fb.created_at", "fb.total_passenger", this.db.raw("'b2c-flight' as type"), "fb.status")
                .leftJoin("flight_booking_traveler as fbt", "fbt.flight_booking_id", "fb.id")
                .joinRaw("left join b2c.invoice inv on inv.ref_id = fb.id and inv.ref_type = 'flight'")
                .where((qb) => {
                if (filter) {
                    qb.andWhere((qb) => {
                        qb.whereILike("fb.booking_id", `${filter}%`);
                        qb.orWhereILike("fb.pnr_code", `${filter}%`);
                        qb.orWhereILike("fbt.ticket_number", `${filter}%`);
                        qb.orWhereILike("inv.invoice_number", `${filter}%`);
                    });
                }
            });
            const b2bVisaResult = this.db(`${this.AGENT_SCHEMA}.visa_application as va`)
                .join(`${this.SERVICE_SCHEMA}.visa`, "visa.id", "va.visa_id")
                .leftJoin(`${this.PUBLIC_SCHEMA}.country`, "country.id", "visa.country_id")
                .joinRaw("left join agent.invoice inv on inv.ref_id = va.id and inv.ref_type = 'visa'")
                .select("va.id", "va.booking_ref", this.db.raw("null as pnr_code"), "country.name as route", "va.payable as payable_amount", "va.application_date as created_at", "va.traveler as total_passenger", this.db.raw("'b2b-visa' as type"), this.db.raw("null as status"))
                .where((qb) => {
                if (filter) {
                    qb.whereILike("va.booking_ref", `${filter}%`);
                    qb.orWhereILike("inv.invoice_number", `${filter}%`);
                }
            });
            const b2cVisaResult = this.db(`${this.BTOC_SCHEMA}.visa_application as va`)
                .join(`${this.SERVICE_SCHEMA}.visa`, "visa.id", "va.visa_id")
                .leftJoin(`${this.PUBLIC_SCHEMA}.country`, "country.id", "visa.country_id")
                .joinRaw("left join b2c.invoice inv on inv.ref_id = va.id and inv.ref_type = 'visa'")
                .select("va.id", "va.booking_ref", this.db.raw("null as pnr_code"), "country.name as route", "va.payable as payable_amount", "va.application_date as created_at", "va.traveler as total_passenger", this.db.raw("'b2c-visa' as type"), this.db.raw("null as status"))
                .where((qb) => {
                if (filter) {
                    qb.whereILike("va.booking_ref", `${filter}%`);
                    qb.orWhereILike("inv.invoice_number", `${filter}%`);
                }
            });
            const b2cTourResult = this.db(`${this.BTOC_SCHEMA}.tour_package_booking as tpb`)
                .join(`${this.SERVICE_SCHEMA}.tour_package as tp`, "tp.id", "tpb.tour_id")
                .leftJoin(`${this.PUBLIC_SCHEMA}.city`, "city.id", "tp.city_id")
                .joinRaw("left join b2c.invoice inv on inv.ref_id = tpb.id and inv.ref_type = 'tour'")
                .select("tpb.id", "tpb.booking_ref", this.db.raw("null as pnr_code"), "city.name as route", this.db.raw(`
          ROUND(
            CASE 
              WHEN tpb.discount_type = 'FLAT' 
              THEN ((COALESCE(tpb.traveler_adult, 0) * COALESCE(tpb.adult_price, 0)) +  
                    (COALESCE(tpb.traveler_child, 0) * COALESCE(tpb.child_price, 0)) - 
                    COALESCE(tpb.discount, 0)) 
              ELSE (((COALESCE(tpb.traveler_adult, 0) * COALESCE(tpb.adult_price, 0)) +  
                     (COALESCE(tpb.traveler_child, 0) * COALESCE(tpb.child_price, 0))) - 
                    (((COALESCE(tpb.traveler_adult, 0) * COALESCE(tpb.adult_price, 0)) +  
                      (COALESCE(tpb.traveler_child, 0) * COALESCE(tpb.child_price, 0))) * COALESCE(tpb.discount, 0) / 100.0)) 
            END, 2
          ) AS payable_amount
        `), "tpb.created_at", this.db.raw("(tpb.traveler_adult + tpb.traveler_child) AS total_passenger"), this.db.raw("'b2c-tour' as type"), "tpb.status")
                .where((qb) => {
                if (filter) {
                    qb.whereILike("tpb.booking_ref", `${filter}%`);
                    qb.orWhereILike("inv.invoice_number", `${filter}%`);
                }
            });
            return this.db
                .unionAll([
                b2bFlightResult,
                b2cFlightResult,
                b2bVisaResult,
                b2cVisaResult,
                b2cTourResult,
            ])
                .limit(20);
        });
    }
}
exports.default = AdminModel;
