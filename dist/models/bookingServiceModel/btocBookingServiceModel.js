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
exports.BtoCBookingServiceModel = void 0;
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class BtoCBookingServiceModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //insert support
    insertSupport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('booking_support')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //insert support ticket
    insertSupportTicket(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('booking_support_tickets')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
    }
    // insert support message
    insertSupportMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('booking_support_messages')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload);
        });
    }
    //update support
    updateSupport(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('booking_support')
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //get list
    getList(user_id, status, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('booking_support as bs')
                .withSchema(this.BTOC_SCHEMA)
                .select('bs.id', 'bs.booking_id', 'fb.pnr_code', 'bs.support_type', 'bs.status', 'bs.created_at', 'u.username as created_by', 'ua.first_name as closed_by', this.db.raw(`string_agg(bst.ticket_number, ', ') as ticket_numbers`))
                .leftJoin('users as u', 'u.id', 'bs.created_by')
                .leftJoin('flight_booking as fb', 'fb.id', 'bs.booking_id')
                .joinRaw('left join admin.user_admin as ua on ua.id = bs.closed_by')
                .leftJoin('booking_support_tickets as bst', 'bs.id', 'bst.support_id')
                .groupBy('bs.id', 'bs.booking_id', 'fb.pnr_code', 'bs.support_type', 'bs.status', 'bs.created_at', 'u.username', 'bs.closed_by', 'ua.first_name')
                .where((qb) => {
                if (user_id) {
                    qb.andWhere('bs.user_id', user_id);
                }
                if (status) {
                    qb.andWhere('bs.status', status);
                }
            })
                .limit(limit || 100)
                .offset(skip || 0)
                .orderBy('bs.created_at', 'desc');
            const total = yield this.db('booking_support as bs')
                .withSchema(this.BTOC_SCHEMA)
                .count('* as total')
                .leftJoin('users as u', 'u.id', 'bs.created_by')
                .leftJoin('flight_booking as fb', 'fb.id', 'bs.booking_id')
                .joinRaw('left join admin.user_admin as ua on ua.id = bs.closed_by')
                .leftJoin('booking_support_tickets as bst', 'bs.id', 'bst.support_id')
                .groupBy('bs.id', 'bs.booking_id', 'fb.pnr_code', 'bs.support_type', 'bs.status', 'bs.created_at', 'u.username', 'bs.closed_by', 'ua.first_name')
                .where((qb) => {
                if (user_id) {
                    qb.andWhere('bs.user_id', user_id);
                }
                if (status) {
                    qb.andWhere('bs.status', status);
                }
            });
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //get single support
    getSingleSupport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('booking_support as bs')
                .withSchema(this.BTOC_SCHEMA)
                .select('bs.id', 'bs.booking_id', 'fb.pnr_code', 'bs.support_type', 'bs.status', 'bs.created_at', 'u.username as created_by', 'u.email as created_by_email', 'ua.first_name as closed_by', 'bs.refund_amount', 'bs.adjust_at', 'bs.adjusted_by')
                .leftJoin('users as u', 'u.id', 'bs.created_by')
                .leftJoin('flight_booking as fb', 'fb.id', 'bs.booking_id')
                .joinRaw('left join admin.user_admin as ua on ua.id = bs.closed_by')
                .where('bs.id', payload.id)
                .andWhere((qb) => {
                if (payload.user_id) {
                    qb.andWhere('bs.user_id', payload.user_id);
                }
                if (payload.notStatus) {
                    qb.andWhereNot('bs.status', payload.notStatus);
                }
            });
            const username = yield this.db('user_admin')
                .withSchema(this.ADMIN_SCHEMA)
                .select('first_name as adjusted_by')
                .where('id', (_a = data[0]) === null || _a === void 0 ? void 0 : _a.adjusted_by);
            return [data[0], username[0]];
        });
    }
    //get tickets of a support
    getTickets(support_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('booking_support_tickets as bst')
                .withSchema(this.AGENT_SCHEMA)
                .select('bst.id', 'fti.traveler_reference', 'fti.traveler_given_name', 'fti.traveler_surname', 'fti.reservation_code', 'fti.ticket_number')
                .join('flight_ticket_issue as fti', 'fti.id', 'bst.traveler_id')
                .where('bst.support_id', support_id);
        });
    }
    //get messages
    getMessages(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('booking_support_messages as bsm')
                .withSchema(this.BTOC_SCHEMA)
                .select('id', 'message', 'attachment', 'sender', 'created_at')
                .where('support_id', payload.support_id)
                .limit(payload.limit || 100)
                .offset(payload.skip || 0)
                .orderBy('id', 'desc');
            const total = yield this.db('booking_support_messages as bsm')
                .withSchema(this.BTOC_SCHEMA)
                .count('id as total')
                .where('support_id', payload.support_id);
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //total support count
    totalSupportCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("booking_support")
                .withSchema(this.AGENT_SCHEMA)
                .whereRaw("DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)")
                .select(this.db.raw(`COUNT(*) FILTER (WHERE status = '${constants_1.booking_support_status.pending}') as pending,
            COUNT(*) FILTER (WHERE status = '${constants_1.booking_support_status.processing}') as processing,
            COUNT(*) FILTER (WHERE status = '${constants_1.booking_support_status.adjusted}') as adjusted,
            COUNT(*) FILTER (WHERE status = '${constants_1.booking_support_status.closed}') as closed,
            COUNT(*) FILTER (WHERE status = '${constants_1.booking_support_status.rejected}') as rejected`))
                .first();
            return data;
        });
    }
}
exports.BtoCBookingServiceModel = BtoCBookingServiceModel;
