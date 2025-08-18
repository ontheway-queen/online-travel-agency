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
const constants_1 = require("../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class B2BPaymentModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert invoice model
    insertInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "*");
        });
    }
    //get invoice
    getInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userId, limit, skip, due, invoice_id } = payload;
            const data = yield this.db("agent.invoice as inv")
                .select("inv.id", "us.name as username", "inv.total_amount", "inv.ref_id", "inv.ref_type", "inv.due", "inv.refund_amount", "inv.invoice_number", "inv.details", "ai.agency_name", "ai.agency_logo", "ai.email as agency_email", "ai.phone as agency_phone", "ai.address as agency_address")
                .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
                .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
                .orderBy("inv.id", "desc")
                .limit(limit || 100)
                .offset(skip || 0)
                .where((qb) => {
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (due === "true") {
                    qb.andWhereNot("inv.due", 0);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (payload.agency_id) {
                    qb.andWhere("inv.agency_id", payload.agency_id);
                }
            })
                .andWhere("inv.status", true);
            let count = [];
            count = yield this.db("agent.invoice as inv")
                .count("inv.id as total")
                .where((qb) => {
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (due === "true") {
                    qb.andWhereNot("inv.due", 0);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (payload.agency_id) {
                    qb.andWhere("inv.agency_id", payload.agency_id);
                }
            })
                .andWhere("inv.status", true);
            return { data, total: Number((_a = count[0]) === null || _a === void 0 ? void 0 : _a.total) };
        });
    }
    //get last invoice
    getLastInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, due, invoice_id } = payload;
            const data = yield this.db("agent.invoice as inv")
                .select("inv.id", "us.name as username", "inv.total_amount", "inv.ref_id", "inv.ref_type", "inv.due", "inv.refund_amount", "inv.invoice_number", "inv.details", "ai.agency_name", "ai.agency_logo", "ai.email as agency_email", "ai.phone as agency_phone", "ai.address as agency_address")
                .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
                .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
                .orderBy("inv.id", "desc")
                .limit(1)
                .where((qb) => {
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (due === "true") {
                    qb.andWhereNot("inv.due", 0);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (payload.agency_id) {
                    qb.andWhere("inv.agency_id", payload.agency_id);
                }
            });
            return { data };
        });
    }
    //get single invoice
    singleInvoice(id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("agent.invoice as inv")
                .select("inv.id", "us.name as username", "inv.total_amount", "inv.refund_amount", "inv.ref_id", "inv.ref_type", "inv.due", "inv.invoice_number", "inv.details", "inv.created_at", "inv.agency_id", "ai.agency_name", "ai.agency_logo", "ai.email as agency_email", "ai.phone as agency_phone", "ai.address as agency_address")
                .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
                .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
                .where("inv.id", id)
                .andWhere((qb) => {
                if (agency_id) {
                    qb.andWhere("inv.agency_id", agency_id);
                }
            })
                .andWhere("inv.status", true);
        });
    }
    //update invoice
    updateInvoice(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db("invoice")
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //create money receipt
    createMoneyReceipt(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get money receipts
    getMoneyReceipt(invoice_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.AGENT_SCHEMA)
                .select("*")
                .where({ invoice_id });
        });
    }
    //get due invoices for flight booking
    getPartialPaymentDueInvoices() {
        return __awaiter(this, void 0, void 0, function* () {
            const subquery = this.db("agent.flight_segment as fs")
                .select("fs.departure_date", "fs.departure_time", "fs.flight_booking_id")
                .select(this.db.raw("ROW_NUMBER() OVER (PARTITION BY fs.flight_booking_id ORDER BY fs.departure_date ASC) as rn"))
                .as("fs");
            const data = yield this.db("flight_booking as fb")
                .withSchema(this.AGENT_SCHEMA)
                .select("fb.id", "fb.booking_id as booking_ref", "fb.route", "ai.agency_name", "ai.phone as agency_phone", "ai.agency_logo", "ai.email as agency_email", "ai.address as agency_address", "inv.due", "inv.due_clear_last_day", "fs.departure_date", "fs.departure_time", "fb.payable_amount", "fb.pnr_code")
                .join("invoice as inv", "inv.ref_id", "fb.id")
                .join("agency_info as ai", "ai.id", "fb.agency_id")
                .leftJoin(subquery, "fs.flight_booking_id", "fb.id")
                .whereNotNull("inv.due_clear_last_day")
                .andWhere("fs.rn", "=", this.db.raw("1"))
                .where("inv.ref_type", constants_1.INVOICE_TYPE_FLIGHT)
                .andWhere("inv.due", ">", 0)
                .andWhere("fb.status", flightConstants_1.FLIGHT_TICKET_ISSUE)
                .andWhereRaw("inv.due_clear_last_day::DATE = CURRENT_DATE");
            return data;
        });
    }
    // partial payment history
    getPartialPaymentInvoiceList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userId, limit, skip, due, invoice_id, agency_id } = payload;
            const data = yield this.db("agent.invoice as inv")
                .select("inv.id", "us.name as username", "inv.total_amount", "inv.ref_id", "inv.ref_type", "inv.due", "inv.refund_amount", "inv.created_at as booking_date", "inv.invoice_number", "inv.details", "ai.agency_name", "ai.agency_logo", "fb.pnr_code", "ai.email as agency_email", "ai.phone as agency_phone", "ai.address as agency_address", "fb.booking_id", "inv.due_clear_last_day", this.db.raw("COALESCE(inv.total_amount - inv.due, 0) as paid_amount"), this.db.raw("MIN(fs.departure_date) as travel_date"))
                .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
                .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
                .joinRaw(`
        LEFT JOIN agent.flight_booking as fb
        ON fb.id = inv.ref_id
        AND inv.ref_type = 'flight'
      `)
                .joinRaw(`
        LEFT JOIN agent.flight_segment as fs
        ON fs.flight_booking_id = fb.id
      `)
                .where((qb) => {
                qb.whereIn("fb.status", [
                    flightConstants_1.FLIGHT_TICKET_ISSUE,
                    flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                    flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                ]);
                qb.andWhere("inv.due", ">", 0);
                qb.andWhere(this.db.raw("inv.total_amount - inv.due > 0"));
                qb.andWhere("inv.status", true);
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (agency_id) {
                    qb.andWhere("inv.agency_id", agency_id);
                }
            })
                .groupBy([
                "inv.id",
                "us.name",
                "inv.total_amount",
                "inv.ref_id",
                "inv.ref_type",
                "inv.due",
                "inv.refund_amount",
                "inv.invoice_number",
                "inv.details",
                "fb.pnr_code",
                "ai.agency_name",
                "ai.agency_logo",
                "ai.email",
                "ai.phone",
                "ai.address",
                "fb.booking_id",
            ])
                .orderBy("inv.id", "desc")
                .limit(limit || 100)
                .offset(skip || 0);
            let count = [];
            count = yield this.db("agent.invoice as inv")
                .count("inv.id as total")
                .joinRaw(`
        LEFT JOIN agent.flight_booking as fb
        ON fb.id = inv.ref_id
        AND inv.ref_type = 'flight'
      `)
                .where((qb) => {
                qb.whereIn("fb.status", [
                    flightConstants_1.FLIGHT_TICKET_ISSUE,
                    flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                    flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                ]);
                qb.andWhere("inv.due", ">", 0);
                qb.andWhere(this.db.raw("inv.total_amount - inv.due > 0"));
                qb.andWhere("inv.status", true);
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (agency_id) {
                    qb.andWhere("inv.agency_id", agency_id);
                }
            });
            return { data, total: Number((_a = count[0]) === null || _a === void 0 ? void 0 : _a.total) };
        });
    }
    // partial payment total due
    getPartialPaymentTotalDue(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userId, invoice_id, agency_id } = payload;
            let totalDue = yield this.db("agent.invoice as inv")
                .sum("inv.due as total_due")
                .joinRaw(`
    LEFT JOIN agent.flight_booking as fb 
    ON fb.id = inv.ref_id 
    AND inv.ref_type = 'flight'
  `)
                .where((qb) => {
                qb.whereIn("fb.status", [
                    flightConstants_1.FLIGHT_TICKET_ISSUE,
                    flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                    flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
                ]);
                qb.andWhere("inv.due", ">", 0);
                qb.andWhere(this.db.raw("inv.total_amount - inv.due > 0"));
                qb.andWhere("inv.status", true);
                if (userId) {
                    qb.andWhere("inv.user_id", userId);
                }
                if (invoice_id) {
                    qb.andWhere("inv.id", invoice_id);
                }
                if (agency_id) {
                    qb.andWhere("inv.agency_id", agency_id);
                }
            });
            return { total_due: Number((_a = totalDue[0]) === null || _a === void 0 ? void 0 : _a.total_due) || 0 };
        });
    }
    //get total partial payment due agency wise
    agencyWisePartialPaymentDue() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("invoice as inv")
                .withSchema(this.AGENT_SCHEMA)
                .select("ai.id as agency_id", "ai.agency_name", "ai.agency_logo", "ai.email", "ai.phone")
                .sum("inv.due as total_due")
                .join("agency_info as ai", "ai.id", "inv.agency_id")
                .join("flight_booking as fb", "fb.id", "inv.ref_id")
                .whereIn("fb.status", [
                flightConstants_1.FLIGHT_TICKET_ISSUE,
                flightConstants_1.FLIGHT_BOOKING_ON_HOLD,
                flightConstants_1.FLIGHT_TICKET_IN_PROCESS,
            ])
                .andWhere("inv.due", ">", 0)
                .andWhere("inv.ref_type", "flight")
                .andWhere("inv.status", true)
                .groupBy("ai.id", "ai.agency_name", "ai.agency_logo", "ai.email", "ai.phone");
            return data;
        });
    }
}
exports.default = B2BPaymentModel;
