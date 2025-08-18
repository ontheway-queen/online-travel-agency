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
const flightConstants_1 = require("../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class B2BFlightBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // get all flight booking
    getAllFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, user_id, agency_id, status, from_date, to_date, name, pnr, api_booking_ref } = payload;
            const baseQuery = this.db('agent.flight_booking as fb')
                .leftJoin('agent.btob_user as us', 'us.id', 'fb.created_by')
                .leftJoin('agent.agency_info as ai', 'ai.id', 'fb.agency_id')
                .leftJoin('admin.user_admin as ua', 'ua.id', 'ai.kam');
            const dataQuery = baseQuery
                .clone()
                .select('fb.id as booking_id', 'ai.id as agency_id', 'ai.agency_name as agency_name', 'us.name as created_by', 'ua.username as kam_name', 'fb.pnr_code', 'fb.airline_pnr', 'ai.email as agency_email', 'fb.total_passenger', 'fb.created_at as booking_created_at', 'fb.status as booking_status', 'fb.payable_amount', 'fb.journey_type', 'fb.api', 'fb.route', 'fb.booking_id as booking_ref', 'fb.partial_payment', 'fb.last_time', this.db('flight_segment as fs')
                .withSchema(this.AGENT_SCHEMA)
                .select('fs.departure_date')
                .whereRaw('fs.flight_booking_id = fb.id')
                .orderBy('fs.departure_date', 'asc')
                .limit(1)
                .as('departure_date'))
                .where(function () {
                if (user_id)
                    this.andWhere('fb.created_by', user_id);
                if (status)
                    this.andWhere('fb.status', status);
                if (from_date && to_date)
                    this.andWhereBetween('fb.created_at', [from_date, to_date]);
                if (agency_id)
                    this.andWhere('fb.agency_id', agency_id);
                if (pnr)
                    this.andWhere('fb.pnr_code', pnr);
                if (api_booking_ref)
                    this.andWhere('fb.api_booking_ref', api_booking_ref);
                if (name) {
                    this.andWhere(function () {
                        this.where('us.name', 'ilike', `%${name.trim()}%`)
                            .orWhere('ai.agency_name', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.pnr_code', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.booking_id', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.airline_pnr', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.api', 'ilike', `%${name.trim()}`)
                            .orWhere('fb.route', 'ilike', `%${name.trim()}`)
                            .orWhere('ai.email', 'ilike', `%${name.trim()}`);
                    });
                }
            })
                .orderBy('fb.id', 'desc')
                .limit(limit ? parseInt(limit) : 100)
                .offset(skip ? parseInt(skip) : 0);
            const data = yield dataQuery;
            const totalQuery = baseQuery
                .clone()
                .count('fb.id as total')
                .where(function () {
                if (user_id)
                    this.andWhere('fb.created_by', user_id);
                if (status)
                    this.andWhere('fb.status', status);
                if (from_date && to_date)
                    this.andWhereBetween('fb.created_at', [from_date, to_date]);
                if (agency_id)
                    this.andWhere('fb.agency_id', agency_id);
                if (pnr)
                    this.andWhere('fb.pnr_code', pnr);
                if (name) {
                    this.andWhere(function () {
                        this.where('us.name', 'ilike', `%${name.trim()}%`)
                            .orWhere('ai.agency_name', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.pnr_code', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.booking_id', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.airline_pnr', 'ilike', `%${name.trim()}%`)
                            .orWhere('fb.api', 'ilike', `%${name.trim()}`)
                            .orWhere('fb.route', 'ilike', `%${name.trim()}`)
                            .orWhere('ai.email', 'ilike', `%${name.trim()}`)
                            .orWhereExists(function () {
                            this.select('*')
                                .from('agent.flight_booking_traveler as fbt')
                                .whereRaw('fbt.flight_booking_id = fb.id')
                                .andWhere(function () {
                                this.where('fbt.email', 'ilike', `%${name.trim()}%`);
                            });
                        });
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
    getSingleFlightBooking(wherePayload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pnr_code, id, status, user_id, agency_id } = wherePayload;
            return yield this.db('agent.flight_booking as fb')
                .select('fb.id as booking_id', 'us.name as created_by', 'ua.username as kam_name', 'fb.created_by as user_id', 'us.email as user_email', 'ai.agency_name', 'ai.agency_logo', 'ai.email as agency_email', 'ai.phone as agency_phone', 'ai.address as agency_address', 'ai.id as agency_id', 'fb.pnr_code', 'fb.total_passenger', 'fb.created_at as booking_created_at', 'fb.status as booking_status', 'fb.payable_amount', 'fb.base_fare', 'fb.total_tax', 'fb.ait', 'fb.convenience_fee', 'fb.discount', 'fb.journey_type', 'fb.route', 'fb.api', 'fb.last_time', 'fb.booking_id as booking_ref', 'fb.airline_pnr', 'in.due', 'in.id as invoice_id', 'fb.api_booking_ref', 'fb.refundable', 'fb.ticket_issued_on', 'fb.vendor_price', 'fb.partial_payment', 'fb.markup', this.db.raw('"in"."total_amount" - "in"."due" as "paid_amount"'))
                .leftJoin('agent.btob_user as us', 'us.id', 'fb.created_by')
                .leftJoin('agent.agency_info as ai', 'ai.id', 'fb.agency_id')
                .leftJoin('agent.invoice as in', 'in.ref_id', 'fb.id')
                .leftJoin('admin.user_admin as ua', 'ua.id', 'ai.kam')
                .where(function () {
                this.andWhere({ 'fb.id': id });
                if (pnr_code) {
                    this.andWhere({ 'fb.pnr_code': pnr_code });
                }
                if (status) {
                    if (Array.isArray(status)) {
                        this.whereIn('fb.status', status);
                    }
                    else {
                        this.andWhere({ 'fb.status': status });
                    }
                }
                if (user_id) {
                    this.andWhere({ 'fb.created_by': user_id });
                }
                if (agency_id) {
                    this.andWhere({ 'fb.agency_id': agency_id });
                }
            });
        });
    }
    //get flight segment
    getFlightSegment(flight_booking_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_segment as seg')
                .withSchema(this.AGENT_SCHEMA)
                .select('seg.*')
                .where({ flight_booking_id })
                .andWhere((qb) => {
                if (id) {
                    qb.andWhere({ id });
                }
            })
                .orderBy('seg.id', 'asc');
        });
    }
    //get fight travelers
    getFlightBookingTraveler(flight_booking_id, traveler_ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agent.flight_booking_traveler as tr')
                .select('tr.id', 'tr.reference', 'tr.first_name', 'tr.last_name', 'tr.type', 'tr.date_of_birth', 'tr.gender', 'tr.phone as contact_number', 'tr.email', 'tr.passport_number', 'tr.passport_expiry_date', 'tr.ticket_number', 'con.name as nationality', 'con2.name as issuing_country', 'frequent_flyer_airline', 'frequent_flyer_number', 'tr.visa_file', 'tr.passport_file')
                .leftJoin('public.country as con', 'con.id', 'tr.nationality')
                .leftJoin('public.country as con2', 'con2.id', 'tr.issuing_country')
                .where({ flight_booking_id })
                .andWhere(function () {
                if (traveler_ids !== undefined) {
                    const ids = Array.isArray(traveler_ids) ? traveler_ids : [traveler_ids];
                    this.whereIn('tr.id', ids);
                }
            })
                .orderBy('tr.id', 'asc');
        });
    }
    //get flight fare rules
    getFlightFareRules(_a) {
        return __awaiter(this, arguments, void 0, function* ({ flight_booking_id, }) {
            return yield this.db('flight_fare_rules as fr')
                .withSchema(this.AGENT_SCHEMA)
                .select('fr.flight_booking_id', 'fr.rule_text')
                .where({ flight_booking_id })
                .orderBy('fr.id', 'asc')
                .first();
        });
    }
    // insert flight booking
    insertFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log("payload", payload);
            return yield this.db('flight_booking').withSchema(this.AGENT_SCHEMA).insert(payload, 'id');
        });
    }
    //insert flight fare rules
    insertFlightFareRules(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_fare_rules').withSchema(this.AGENT_SCHEMA).insert(payload, 'id');
        });
    }
    // insert flight segment
    insertFlightSegment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_segment').withSchema(this.AGENT_SCHEMA).insert(payload);
        });
    }
    // insert flight traveler
    insertFlightTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_traveler')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // update flight booking traveler
    updateFlightBookingTraveler(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_traveler')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //update segments
    updateSegments(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('flight_segment').withSchema(this.AGENT_SCHEMA).update(payload).where({ id });
        });
    }
    //update booking
    updateBooking(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // get single issue ticket
    getSingleIssueTicket(flight_booking_id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agent.flight_ticket_issue').select('*').where({ flight_booking_id });
        });
    }
    //get ticket segment
    getTicketSegment(flight_booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agent.flight_ticket_issue_segment')
                .select('*')
                .where({ flight_booking_id });
        });
    }
    //search pnr/ticket no/booking id
    searchBookingInfo(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking as fb')
                .withSchema(this.AGENT_SCHEMA)
                .select('fb.id', 'fb.booking_id as booking_ref', 'fb.created_at', 'fb.journey_type', 'fb.route', 'fb.pnr_code', 'fb.status', 'fb.payable_amount')
                .leftJoin('flight_booking_traveler as fbt', 'fbt.flight_booking_id', 'fb.id')
                .where('fb.agency_id', payload.agency_id)
                .andWhere((qb) => {
                qb.whereILike('fb.booking_id', `${payload.filter}%`);
                qb.orWhereILike('fb.pnr_code', `${payload.filter}%`);
                qb.orWhereILike('fbt.ticket_number', `${payload.filter}%`);
            })
                .limit(20);
        });
    }
    //insert pending ticket issuance
    insertPendingTicketIssuance(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('pending_flight_ticket_issuance')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get pending ticket issuance
    getPendingTicketIssuance(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('pending_flight_ticket_issuance as pti')
                .withSchema(this.AGENT_SCHEMA)
                .select('pti.id', 'fb.id as booking_id', 'fb.booking_id as booking_ref', 'fb.pnr_code', 'fb.total_passenger', 'fb.route', 'fb.payable_amount', 'pti.api', 'fb.status as booking_status', 'pti.status as ticket_request_status', 'pti.created_at')
                .join('flight_booking as fb', 'fb.id', 'pti.booking_id')
                .where((qb) => {
                if (payload.filter) {
                    qb.andWhere((qbc) => {
                        qbc
                            .where('fb.pnr_code', 'ilike', `${payload.filter}%`)
                            .orWhere('fb.booking_id', 'ilike', `${payload.filter}%`);
                    });
                }
                if (payload.api) {
                    qb.andWhere('pti.api', payload.api);
                }
                if (payload.status) {
                    qb.andWhere('pti.status', payload.status);
                }
                if (payload.id) {
                    qb.andWhere('pti.id', payload.id);
                }
            })
                .limit(payload.limit || 100)
                .offset(payload.skip || 0)
                .orderBy('pti.id', 'desc');
            const total = yield this.db('pending_flight_ticket_issuance as pti')
                .withSchema(this.AGENT_SCHEMA)
                .count('pti.id as total')
                .join('flight_booking as fb', 'fb.id', 'pti.booking_id')
                .where((qb) => {
                if (payload.filter) {
                    qb.andWhere((qbc) => {
                        qbc
                            .where('fb.pnr_code', 'ilike', `${payload.filter}%`)
                            .orWhere('fb.booking_id', 'ilike', `${payload.filter}%`);
                    });
                }
                if (payload.api) {
                    qb.andWhere('pti.api', payload.api);
                }
                if (payload.status) {
                    qb.andWhere('pti.status', payload.status);
                }
            });
            return { data, total: parseInt(total === null || total === void 0 ? void 0 : total[0].total) };
        });
    }
    //update ticket issuance
    updateTicketIssuance(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db('pending_flight_ticket_issuance')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where((qb) => {
                if (where.id) {
                    qb.andWhere('id', where.id);
                }
                if (where.booking_id) {
                    qb.andWhere('booking_id', where.booking_id);
                }
            });
        });
    }
    //check flight booking
    checkFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const query = this.db('flight_booking as fb')
                .withSchema(this.AGENT_SCHEMA)
                .join('flight_segment as fs', 'fs.flight_booking_id', 'fb.id')
                .join('flight_booking_traveler as fbt', 'fbt.flight_booking_id', 'fb.id')
                .countDistinct('fb.id as total')
                .where('fb.route', payload.route)
                .andWhere(function () {
                if (Array.isArray(payload.status)) {
                    this.whereIn('fb.status', payload.status);
                }
                else {
                    this.andWhere({ 'fb.status': payload.status });
                }
            })
                .andWhere('fs.departure_date', payload.departure_date)
                .andWhere('fs.flight_number', payload.flight_number)
                .where((qb) => {
                payload.passengers.forEach((p, index) => {
                    if (index === 0) {
                        qb.where(function () {
                            this.whereRaw('LOWER(fbt.first_name) = ?', [p.first_name.toLowerCase()])
                                .andWhereRaw('LOWER(fbt.last_name) = ?', [p.last_name.toLowerCase()])
                                .andWhere((subQb) => {
                                var _a, _b, _c;
                                subQb
                                    .whereNotNull('fbt.passport_number')
                                    .orWhere('fbt.passport_number', (_a = p.passport) !== null && _a !== void 0 ? _a : null);
                                subQb.whereNotNull('fbt.email').orWhere('fbt.email', (_b = p.email) !== null && _b !== void 0 ? _b : null);
                                subQb.whereNotNull('fbt.phone').orWhere('fbt.phone', (_c = p.phone) !== null && _c !== void 0 ? _c : null);
                            });
                        });
                    }
                    else {
                        qb.orWhere(function () {
                            this.whereRaw('LOWER(fbt.first_name) = ?', [p.first_name.toLowerCase()])
                                .andWhereRaw('LOWER(fbt.last_name) = ?', [p.last_name.toLowerCase()])
                                .andWhere((subQb) => {
                                var _a, _b, _c;
                                subQb
                                    .whereNotNull('fbt.passport_number')
                                    .orWhere('fbt.passport_number', (_a = p.passport) !== null && _a !== void 0 ? _a : null);
                                subQb.whereNotNull('fbt.email').orWhere('fbt.email', (_b = p.email) !== null && _b !== void 0 ? _b : null);
                                subQb.whereNotNull('fbt.phone').orWhere('fbt.phone', (_c = p.phone) !== null && _c !== void 0 ? _c : null);
                            });
                        });
                    }
                });
            })
                .first();
            return Number((_b = (_a = (yield query)) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
        });
    }
    //total bookings count
    totalBookingsCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('flight_booking')
                .withSchema(this.AGENT_SCHEMA)
                .whereRaw("DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)")
                .select(this.db.raw(`COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_TICKET_ISSUE}') as issued,
        COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_REFUNDED}') as refunded,
        COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_VOID}') as voided,
        COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_CONFIRMED}') as pending,
        COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_ON_HOLD}') as ticket_hold,
        COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_TICKET_IN_PROCESS}') as ticket_in_process,
        COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_CANCELLED}') as booking_cancelled`))
                .first();
            return data;
        });
    }
    //booking graph for current year
    monthlyBookingsGraphForCurrentYear() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('flight_booking')
                .withSchema(this.AGENT_SCHEMA)
                .whereRaw('EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)')
                .select(this.db.raw(`TO_CHAR(created_at, 'Month') AS month`), this.db.raw(`DATE_TRUNC('month', created_at) AS month_start`), this.db.raw(`COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_TICKET_ISSUE}') as issued`), this.db.raw(`COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_REFUNDED}') as refunded`), this.db.raw(`COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_VOID}') as voided`), this.db.raw(`COUNT(*) FILTER (WHERE status = '${flightConstants_1.FLIGHT_BOOKING_CANCELLED}') as booking_cancelled`))
                .groupByRaw("TO_CHAR(created_at, 'Month'), DATE_TRUNC('month', created_at)")
                .orderBy('month_start');
            return data.map((row) => ({
                month: row.month.trim(),
                issued: parseInt(row.issued, 10),
                refunded: parseInt(row.refunded, 10),
                voided: parseInt(row.voided, 10),
                booking_cancelled: parseInt(row.booking_cancelled, 10),
            }));
        });
    }
    insertFlightBookingTracking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_tracking')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getFlightBookingTracking(flight_booking_id, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_tracking')
                .withSchema(this.AGENT_SCHEMA)
                .select('*')
                .where({ flight_booking_id })
                .andWhere((qb) => {
                if (id) {
                    qb.andWhere({ id });
                }
            });
        });
    }
    createFlightBookingSSR(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_ssr').withSchema(this.AGENT_SCHEMA).insert(payload, 'id');
        });
    }
    getFlightBookingSSR(flight_booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('flight_booking_ssr as fbss')
                .withSchema(this.AGENT_SCHEMA)
                .leftJoin('flight_segment as fbs', function () {
                this.on('fbss.segment_key', '=', 'fbs.segment_key').andOn('fbs.flight_booking_id', '=', 'fbss.booking_id');
            })
                .leftJoin('flight_booking_traveler as fbt', function () {
                this.on('fbss.traveler_key', '=', 'fbt.passenger_key').andOn('fbt.flight_booking_id', '=', 'fbss.booking_id');
            })
                .select('fbss.id', 'fbs.origin', 'fbs.destination', 'fbt.reference as title', 'fbt.first_name', 'fbt.last_name', 'fbss.amount', 'fbss.description')
                .where('fbss.booking_id', flight_booking_id);
            return data;
        });
    }
}
exports.default = B2BFlightBookingModel;
