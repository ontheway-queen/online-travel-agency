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
exports.ReportModel = void 0;
const flightConstants_1 = require("../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ReportModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getB2CPaymentTransactionReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.db;
            let query = db('money_receipt as mr')
                .withSchema(this.BTOC_SCHEMA)
                .select('mr.id', 'mr.amount', 'mr.payment_time', 'mr.transaction_id', 'mr.payment_type', 'mr.details', 'mr.payment_id', 'mr.payment_by', 'mr.payment_gateway', 'mr.invoice_id', 'inv.ref_type', 'inv.invoice_number', 'fb.id as flight_booking_id', 'va.id as visa_booking_id', 'tpb.id as tour_booking_id', 'fb.booking_id as flight_booking_ref', 'va.booking_ref as visa_booking_ref', 'tpb.booking_ref as tour_booking_ref', 'u.username', 'u.first_name', 'u.last_name')
                .leftJoin('invoice as inv', 'mr.invoice_id', 'inv.id')
                .leftJoin('flight_booking as fb', function () {
                this.on('inv.ref_id', '=', 'fb.id').andOn('inv.ref_type', '=', db.raw(`'flight'`));
            })
                .leftJoin('visa_application as va', function () {
                this.on('inv.ref_id', '=', 'va.id').andOn('inv.ref_type', '=', db.raw(`'visa'`));
            })
                .leftJoin('tour_package_booking as tpb', function () {
                this.on('inv.ref_id', '=', 'tpb.id').andOn('inv.ref_type', '=', db.raw(`'tour'`));
            })
                .leftJoin('users as u', 'inv.user_id', 'u.id')
                .where((qb) => {
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('mr.payment_time', [payload.start_date, payload.end_date]);
                }
                if (payload.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .orWhere('fb.booking_id', payload.filter)
                            .orWhere('va.booking_ref', payload.filter)
                            .orWhere('tpb.booking_ref', payload.filter)
                            .orWhereILike('inv.invoice_number', `%${payload.filter}%`)
                            .orWhereILike('mr.payment_type', `%${payload.filter}%`);
                    });
                }
            })
                .orderBy('mr.id', 'desc')
                .limit(payload.limit)
                .offset(payload.skip);
            if (payload.limit !== undefined) {
                query = query.limit(payload.limit);
            }
            if (payload.skip !== undefined) {
                query = query.offset(payload.skip);
            }
            const res = yield query;
            const total = yield db('money_receipt as mr')
                .withSchema(this.BTOC_SCHEMA)
                .count('mr.id as total')
                .leftJoin('invoice as inv', 'mr.invoice_id', 'inv.id')
                .leftJoin('flight_booking as fb', function () {
                this.on('inv.ref_id', '=', 'fb.id').andOn('inv.ref_type', '=', db.raw(`'flight'`));
            })
                .leftJoin('visa_application as va', function () {
                this.on('inv.ref_id', '=', 'va.id').andOn('inv.ref_type', '=', db.raw(`'visa'`));
            })
                .leftJoin('tour_package_booking as tpb', function () {
                this.on('inv.ref_id', '=', 'tpb.id').andOn('inv.ref_type', '=', db.raw(`'tour'`));
            })
                .where((qb) => {
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('mr.payment_time', [payload.start_date, payload.end_date]);
                }
                if (payload.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .orWhere('fb.booking_id', payload.filter)
                            .orWhere('va.booking_ref', payload.filter)
                            .orWhere('tpb.booking_ref', payload.filter)
                            .orWhereILike('inv.invoice_number', `%${payload.filter}%`)
                            .orWhereILike('mr.payment_type', `%${payload.filter}%`);
                    });
                }
            });
            return { data: res, total: total[0].total };
        });
    }
    getB2BTopUpReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.db;
            let query = db('agency_ledger as al')
                .withSchema(this.AGENT_SCHEMA)
                .select('al.*', 'ai.agency_name')
                .leftJoin('agency_info as ai', 'al.agency_id', 'ai.id')
                .where((qb) => {
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('al.date', [payload.start_date, payload.end_date]);
                }
                if (payload.agency_id) {
                    qb.andWhere('al.agency_id', payload.agency_id);
                }
            })
                .andWhere('al.type', 'credit')
                .andWhere('al.topup', true)
                .orderBy('al.id', 'desc');
            if (payload.limit !== undefined) {
                query = query.limit(payload.limit);
            }
            if (payload.skip !== undefined) {
                query = query.offset(payload.skip);
            }
            const res = yield query;
            const total = yield db('agency_ledger as al')
                .withSchema(this.AGENT_SCHEMA)
                .count('al.id as total')
                .where((qb) => {
                if (payload.agency_id) {
                    qb.andWhere('al.agency_id', payload.agency_id);
                }
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('al.date', [payload.start_date, payload.end_date]);
                }
            })
                .andWhere('al.type', 'credit')
                .andWhere('al.topup', true);
            return { data: res, total: total[0].total };
        });
    }
    getB2BLedgerReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.db;
            const subqueryLedger = db('agent.agency_ledger as ad')
                .join('agent.agency_info as ai', 'ai.id', 'ad.agency_id')
                .select('ad.id', 'ad.agency_id', 'ai.agency_name', 'ad.amount', 'ad.date', 'ad.type', db.raw(`'ledger' as source`));
            const subqueryLoan = db('agent.agency_loan as al')
                .join('agent.agency_info as ai', 'ai.id', 'al.agency_id')
                .select('al.id', 'al.agency_id', 'ai.agency_name', 'al.amount', db.raw('al.created_at as date'), db.raw('al.type::text as type'), db.raw(`'Loan' as source`));
            const unionQuery = db.from((qb) => qb.unionAll([subqueryLedger, subqueryLoan]).as('m'));
            // 🔢 1. Total count query
            const totalQuery = db
                .with('m', unionQuery)
                .from('m')
                .where('m.agency_id', payload.agency_id)
                .count('* as total');
            const totalResult = yield totalQuery.first();
            const total = Number((totalResult === null || totalResult === void 0 ? void 0 : totalResult.total) || 0);
            // 📄 2. Main paginated query
            const finalQuery = db
                .with('m', subqueryLedger.unionAll(subqueryLoan))
                .select([
                'm.id',
                'm.agency_id',
                'm.agency_name',
                'm.amount',
                'm.date',
                'm.type',
                'm.source',
                // last_balance
                db.raw(`
      COALESCE(SUM(
        CASE
          WHEN m.source = 'ledger' AND m.type = 'credit' THEN m.amount
          WHEN m.source = 'ledger' AND m.type = 'debit' THEN -m.amount
          ELSE 0
        END
      ) OVER (
        PARTITION BY m.agency_id
        ORDER BY m.date, m.id
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ), 0) as last_balance
    `),
                // last_loan
                db.raw(`
      COALESCE(SUM(
        CASE
          WHEN m.source = 'Loan' AND m.type = 'Loan' THEN m.amount
          WHEN m.source = 'Loan' AND m.type = 'Repayment' THEN -m.amount
          ELSE 0
        END
      ) OVER (
        PARTITION BY m.agency_id
        ORDER BY m.date, m.id
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ), 0) as last_loan
    `),
                // current_balance
                db.raw(`
      COALESCE(SUM(
        CASE
          WHEN m.source = 'ledger' AND m.type = 'credit' THEN m.amount
          WHEN m.source = 'ledger' AND m.type = 'debit' THEN -m.amount
          ELSE 0
        END
      ) OVER (
        PARTITION BY m.agency_id
        ORDER BY m.date, m.id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ), 0) as current_balance
    `),
                // current_loan
                db.raw(`
      COALESCE(SUM(
        CASE
          WHEN m.source = 'Loan' AND m.type = 'Loan' THEN m.amount
          WHEN m.source = 'Loan' AND m.type = 'Repayment' THEN -m.amount
          ELSE 0
        END
      ) OVER (
        PARTITION BY m.agency_id
        ORDER BY m.date, m.id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ), 0) as current_loan
    `),
            ])
                .from('m')
                .orderBy([
                { column: 'm.agency_id', order: 'asc' },
                { column: 'm.date', order: 'asc' },
                { column: 'm.id', order: 'asc' },
            ])
                .where((qb) => {
                qb.where('m.agency_id', payload.agency_id);
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('m.date', [payload.start_date, payload.end_date]);
                }
            })
                .limit(payload.limit || 999999999999999)
                .offset(payload.skip || 0);
            const data = yield finalQuery;
            return {
                total,
                data,
            };
        });
    }
    getB2BSalesReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.db;
            let query = db('flight_booking as fb')
                .withSchema(this.AGENT_SCHEMA)
                .select('fb.id as booking_id', 'fb.booking_id as booking_ref', 'fb.created_at as booking_date', 'fb.journey_type', 'fb.status', 'fb.pnr_code', 'fb.route', 'fb.total_passenger', 'fb.base_fare', 'fb.total_tax', 'fb.ait', 'fb.discount', 'fb.convenience_fee', 'fb.payable_amount', 'fb.vendor_price', 'fb.partial_payment', 'fb.api', 'ai.agency_name', 'inv.invoice_number', 'inv.id as invoice_id')
                .leftJoin('agency_info as ai', 'fb.agency_id', 'ai.id')
                .leftJoin('invoice as inv', function () {
                this.on('fb.id', 'inv.ref_id').andOn('inv.ref_type', '=', db.raw(`'flight'`));
            })
                .where((qb) => {
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('fb.created_at', [payload.start_date, payload.end_date]);
                }
                if (payload.agency_id) {
                    qb.andWhere('fb.agency_id', payload.agency_id);
                }
                qb.andWhere('fb.status', flightConstants_1.FLIGHT_TICKET_ISSUE);
            });
            if (payload.limit !== undefined) {
                query = query.limit(payload.limit);
            }
            if (payload.skip !== undefined) {
                query = query.offset(payload.skip);
            }
            const res = yield query;
            const total = yield db('flight_booking as fb')
                .withSchema(this.AGENT_SCHEMA)
                .count('fb.id as total')
                .where((qb) => {
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('fb.created_at', [payload.start_date, payload.end_date]);
                }
                if (payload.agency_id) {
                    qb.andWhere('fb.agency_id', payload.agency_id);
                }
                if (payload.status) {
                    qb.andWhere('fb.status', payload.status);
                }
                qb.andWhere('fb.status', flightConstants_1.FLIGHT_TICKET_ISSUE);
            });
            return { data: res, total: total[0].total };
        });
    }
    getB2BTicketWiseReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const db = this.db;
            const report = yield db('agent.flight_booking_traveler as ft')
                .join('agent.flight_booking as fb', 'fb.id', 'ft.flight_booking_id')
                .join('agent.agency_info as ai', 'ai.id', 'fb.agency_id')
                .select('fb.booking_id as booking_key', 'fb.pnr_code as gds_pnr', db.raw(`concat(UPPER(ft.reference),' ', ft.first_name, ' ', ft.last_name) as traveler_name`), 'ft.ticket_number', db.raw('(fb.payable_amount / fb.total_passenger)::numeric(18,2) as estimated_fare'), 'fb.api', 'fb.route', 'fb.created_at as booking_date', 'fb.status', 'ai.agency_name')
                .where((qb) => {
                if (payload.agency_id) {
                    qb.andWhere('fb.agency_id', payload.agency_id);
                }
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('fb.created_at', [payload.start_date, payload.end_date]);
                }
                if (payload.filter) {
                    qb.andWhereILike('ft.ticket_number', `%${payload.filter}%`).orWhereILike('fb.booking_id', `%${payload.filter}%`);
                }
            })
                .andWhere('fb.status', flightConstants_1.FLIGHT_TICKET_ISSUE)
                .orderBy('fb.created_at', 'desc')
                .limit(payload.limit || 999999999999999)
                .offset(payload.skip || 0);
            const totalCount = yield db('agent.flight_booking_traveler as ft')
                .join('agent.flight_booking as fb', 'fb.id', 'ft.flight_booking_id')
                .join('agent.agency_info as ai', 'ai.id', 'fb.agency_id')
                .where((qb) => {
                if (payload.agency_id) {
                    qb.where('fb.agency_id', payload.agency_id);
                }
                if (payload.start_date && payload.end_date) {
                    qb.andWhereBetween('fb.created_at', [payload.start_date, payload.end_date]);
                }
                if (payload.filter) {
                    qb.andWhereILike('ft.ticket_number', `%${payload.filter}%`).orWhereILike('fb.booking_id', `%${payload.filter}%`);
                }
            })
                .andWhere('fb.status', flightConstants_1.FLIGHT_TICKET_ISSUE)
                .count({ total: '*' })
                .first();
            return { data: report, total: Number((_a = totalCount === null || totalCount === void 0 ? void 0 : totalCount.total) !== null && _a !== void 0 ? _a : 0) };
        });
    }
    getB2BFlightBookingReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, start_date, end_date, filter, status, agency_id } = payload;
            const baseQuery = this.db('agent.flight_booking as fb')
                .leftJoin('agent.btob_user as us', 'us.id', 'fb.created_by')
                .leftJoin('agent.agency_info as ai', 'ai.id', 'fb.agency_id')
                .leftJoin('admin.user_admin as ua', 'ua.id', 'ai.kam');
            const dataQuery = baseQuery
                .clone()
                .select('fb.id as booking_id', 'ai.id as agency_id', 'ai.agency_name as agency_name', 'us.name as created_by', 'ua.username as kam_name', 'fb.pnr_code', 'fb.airline_pnr', 'fb.total_passenger', 'fb.created_at as booking_created_at', 'fb.status as booking_status', 'fb.payable_amount', 'fb.journey_type', 'fb.api', 'fb.route', 'fb.booking_id as booking_ref', 'fb.partial_payment', 'fb.last_time', this.db('flight_segment as fs')
                .withSchema(this.AGENT_SCHEMA)
                .select('fs.departure_date')
                .whereRaw('fs.flight_booking_id = fb.id')
                .orderBy('fs.departure_date', 'asc')
                .limit(1)
                .as('departure_date'))
                .where(function () {
                if (status)
                    this.andWhere('fb.status', status);
                if (start_date && end_date)
                    this.andWhereBetween('fb.created_at', [start_date, end_date]);
                if (agency_id)
                    this.andWhere('fb.agency_id', agency_id);
                if (filter) {
                    this.andWhere(function () {
                        this.where('us.name', 'ilike', `%${filter.trim()}%`)
                            .orWhere('fb.api', 'ilike', `%${filter.trim()}`)
                            .orWhere('fb.route', 'ilike', `%${filter.trim()}`);
                    });
                }
            })
                .orderBy('fb.id', 'desc')
                .limit(limit || 99999999999999)
                .offset(skip || 0);
            const data = yield dataQuery;
            const totalQuery = baseQuery
                .clone()
                .count('fb.id as total')
                .where(function () {
                if (status)
                    this.andWhere('fb.status', status);
                if (start_date && end_date)
                    this.andWhereBetween('fb.created_at', [start_date, end_date]);
                if (agency_id)
                    this.andWhere('fb.agency_id', agency_id);
                if (filter) {
                    this.andWhere(function () {
                        this.where('us.name', 'ilike', `%${filter.trim()}%`)
                            .orWhere('fb.api', 'ilike', `%${filter.trim()}`)
                            .orWhere('fb.route', 'ilike', `%${filter.trim()}`);
                    });
                }
            });
            const totalResult = yield totalQuery;
            return {
                data,
                total: parseInt(totalResult[0].total),
            };
        });
    }
    getB2CFlightBookingReport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, start_date, end_date, filter, status, user_id } = payload;
            const baseQuery = this.db(`${this.BTOC_SCHEMA}.flight_booking as fb`)
                .leftJoin(`${this.BTOC_SCHEMA}.users as us`, 'us.id', 'fb.user_id');
            const dataQuery = baseQuery
                .clone()
                .select('fb.id as booking_id', this.db.raw(`CONCAT(us.first_name, ' ', us.last_name) AS user_id`), 'fb.pnr_code', 'fb.airline_pnr', 'fb.total_passenger', 'fb.created_at as booking_created_at', 'fb.status as booking_status', 'fb.payable_amount', 'fb.journey_type', 'fb.api', 'fb.route', 'fb.booking_id as booking_ref', 'fb.last_time', this.db('flight_segment as fs')
                .withSchema(this.AGENT_SCHEMA)
                .select('fs.departure_date')
                .whereRaw('fs.flight_booking_id = fb.id')
                .orderBy('fs.departure_date', 'asc')
                .limit(1)
                .as('departure_date'))
                .where(function () {
                if (status)
                    this.andWhere('fb.status', status);
                if (start_date && end_date)
                    this.andWhereBetween('fb.created_at', [start_date, end_date]);
                if (user_id)
                    this.andWhere('fb.user_id', user_id);
                if (filter) {
                    this.andWhere(function () {
                        this.where('fb.api', 'ilike', `%${filter.trim()}`)
                            .orWhere('fb.route', 'ilike', `%${filter.trim()}`);
                    });
                }
            })
                .orderBy('fb.id', 'desc')
                .limit(limit || 99999999999999)
                .offset(skip || 0);
            const data = yield dataQuery;
            const totalQuery = baseQuery
                .clone()
                .count('fb.id as total')
                .where(function () {
                if (status)
                    this.andWhere('fb.status', status);
                if (start_date && end_date)
                    this.andWhereBetween('fb.created_at', [start_date, end_date]);
                if (user_id)
                    this.andWhere('fb.user_id', user_id);
                if (filter) {
                    this.andWhere(function () {
                        this.where('fb.api', 'ilike', `%${filter.trim()}`)
                            .orWhere('fb.route', 'ilike', `%${filter.trim()}`);
                    });
                }
            });
            const totalResult = yield totalQuery;
            return {
                data,
                total: parseInt(totalResult[0].total),
            };
        });
    }
}
exports.ReportModel = ReportModel;
