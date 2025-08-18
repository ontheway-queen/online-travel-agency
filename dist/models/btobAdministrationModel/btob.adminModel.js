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
class BtobAdminModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //update agency user
    updateAgencyUser(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('btob_user')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //get single user
    getSingleUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('btob_user')
                .withSchema(this.AGENT_SCHEMA)
                .select('*')
                .where((qb) => {
                if (payload.email) {
                    qb.where('email', payload.email);
                }
                if (payload.id) {
                    qb.where('id', payload.id);
                }
            });
        });
    }
    //get single admin
    getSingleAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('btob_user as bu')
                .select('bu.*', 'rl.name as role', 'rl.id as role_id')
                .withSchema(this.AGENT_SCHEMA)
                .leftJoin('roles as rl', 'rl.id', 'bu.role_id')
                .where((qb) => {
                if (payload.id) {
                    qb.where('bu.id', payload.id);
                }
                if (payload.email) {
                    qb.orWhere('email', payload.email);
                }
                if (payload.phone_number) {
                    qb.orWhere('phone_number', payload.phone_number);
                }
                if (payload.username) {
                    qb.orWhere('username', payload.username);
                }
            });
        });
    }
    //update user admin
    updateUserAdmin(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('btob_user')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where((qb) => {
                if (where.id) {
                    qb.where('id', where.id);
                }
                if (where.email) {
                    qb.where('email', where.email);
                }
            });
        });
    }
    //create admin
    createAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('btob_user')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get all admin
    getAllAdmin(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false, agency_id) {
            var _a;
            const data = yield this.db('btob_user as ua')
                .withSchema(this.AGENT_SCHEMA)
                .select('ua.id', 'ua.email', 'ua.mobile_number', 'ua.photo', 'rl.name as role', 'ua.status')
                .leftJoin('roles as rl', 'rl.id', 'ua.role_id')
                .where((qb) => {
                if (query.filter) {
                    qb.where((qbc) => {
                        qbc.where('ua.name', 'ilike', `%${query.filter}%`);
                        qbc.orWhere('ua.email', 'ilike', `%${query.filter}%`);
                        qbc.orWhere('ua.mobile_number', 'ilike', `%${query.filter}%`);
                    });
                }
                if (query.role) {
                    qb.andWhere('rl.id', query.role);
                }
                if (query.status === 'true' || query.status === 'false') {
                    qb.andWhere('ua.status', query.status);
                }
            })
                .andWhere('ua.agency_id', agency_id)
                .orderBy('ua.id', 'desc')
                .limit(query.limit ? query.limit : 100)
                .offset(query.skip ? query.skip : 0);
            let total = [];
            if (is_total) {
                total = yield this.db('btob_user as ua')
                    .withSchema(this.AGENT_SCHEMA)
                    .count('ua.id as total')
                    .join('roles as rl', 'rl.id', 'ua.role_id')
                    .where((qb) => {
                    if (query.filter) {
                        qb.where((qbc) => {
                            qbc.where('ua.name', 'ilike', `%${query.filter}%`);
                            qbc.orWhere('ua.email', 'ilike', `%${query.filter}%`);
                            qbc.orWhere('ua.mobile_number', 'ilike', `%${query.filter}%`);
                        });
                    }
                    if (query.role) {
                        qb.andWhere('rl.id', query.role);
                    }
                    if (query.status === 'true' || query.status === 'false') {
                        qb.andWhere('ua.status', query.status);
                    }
                })
                    .andWhere('ua.agency_id', agency_id);
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
            const data = yield this.db('btob_user')
                .withSchema(this.AGENT_SCHEMA)
                .select('id')
                .orderBy('id', 'desc')
                .limit(1);
            return data.length ? data[0].id : 0;
        });
    }
    //dashboard
    adminDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const total_booking = yield this.db('flight_booking')
                .withSchema(this.BTOC_SCHEMA)
                .select(this.db.raw(`
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
              COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
              COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
              COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
              `))
                .first();
            const total_booking_b2b = yield this.db('flight_booking')
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
              COUNT(*) AS total_b2b,
              COUNT(*) FILTER (WHERE status = 'pending') AS b2b_total_pending,
              COUNT(*) FILTER (WHERE status = 'cancelled') AS b2b_total_cancelled,
              COUNT(*) FILTER (WHERE status = 'issued') AS b2b_total_issued
              `))
                .first();
            const currentYear = new Date().getFullYear();
            const booking_graph = yield this.db('flight_booking')
                .withSchema(this.BTOC_SCHEMA)
                .select(this.db.raw(`
          TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
          COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
          COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
          COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
      `))
                .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
                .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
                .orderByRaw('MIN(created_at)');
            const booking_graph_b2b = yield this.db('flight_booking')
                .withSchema(this.AGENT_SCHEMA)
                .select(this.db.raw(`
          TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
          COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
          COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
          COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
      `))
                .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
                .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
                .orderByRaw('MIN(created_at)');
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
            return yield this.db('banner_images')
                .withSchema(this.ADMIN_SCHEMA)
                .insert(payload);
        });
    }
    //get banner image
    getBannerImage() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('banner_images')
                .withSchema(this.ADMIN_SCHEMA)
                .select('id', 'banner_image', 'status');
        });
    }
    //update Image Status
    updateImageStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('banner_images')
                .withSchema(this.ADMIN_SCHEMA)
                .where({ id: id })
                .update({
                status: this.db.raw('NOT status'),
            });
        });
    }
    //get active banner image only
    getActiveBannerImage() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('banner_images')
                .withSchema(this.ADMIN_SCHEMA)
                .select('id', 'banner_image', 'status')
                .where('status', '=', 'true');
        });
    }
}
exports.default = BtobAdminModel;
