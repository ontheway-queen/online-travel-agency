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
class PaymentModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert invoice model
    insertInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "*");
        });
    }
    //get invoice
    getInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userId, limit, skip, due, invoice_id } = payload;
            const data = yield this.db("b2c.invoice as inv")
                .select("inv.id", "us.username", "us.first_name", "us.last_name", "us.email", "us.phone_number", "inv.total_amount", "inv.ref_id", "inv.ref_type", "inv.due", "inv.invoice_number", "inv.details", "inv.refund_amount")
                .leftJoin("b2c.users as us", "us.id", "inv.user_id")
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
            })
                .andWhere("inv.status", true);
            let count = [];
            count = yield this.db("b2c.invoice as inv")
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
            })
                .andWhere("inv.status", true);
            return { data, total: Number((_a = count[0]) === null || _a === void 0 ? void 0 : _a.total) };
        });
    }
    //get last invoice
    getLastInvoice(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, due, invoice_id } = payload;
            const data = yield this.db("b2c.invoice as inv")
                .select("inv.id", "us.username", "us.first_name", "us.last_name", "us.email", "us.phone_number", "inv.total_amount", "inv.ref_id", "inv.ref_type", "inv.due", "inv.invoice_number", "inv.details", "inv.refund_amount")
                .leftJoin("b2c.users as us", "us.id", "inv.user_id")
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
            });
            return { data };
        });
    }
    //get single invoice
    singleInvoice(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, invoice_number, user_id } = query;
            return yield this.db(`${this.BTOC_SCHEMA}.invoice as inv`)
                .join(`${this.BTOC_SCHEMA}.users as us`, "us.id", "inv.user_id")
                .select("inv.id", "inv.ref_id", "inv.ref_type", "inv.total_amount", "inv.due", "inv.details", "inv.invoice_number", "inv.created_at", "us.first_name", "us.last_name", "us.email", "us.phone_number")
                .andWhere((qb) => {
                if (user_id) {
                    qb.andWhere("inv.user_id", user_id);
                }
                if (id) {
                    qb.andWhere("inv.id", id);
                }
                if (invoice_number) {
                    qb.andWhere("inv.invoice_number", invoice_number);
                }
            })
                .andWhere("inv.status", true);
        });
    }
    //get invoice by booking Id
    getInvoiceByBookingId(booking_id, ref_type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(`${this.BTOC_SCHEMA}.invoice as inv`)
                .select("inv.id", "inv.ref_id", "inv.ref_type", "inv.total_amount", "inv.due", "inv.details", "inv.invoice_number", "inv.created_at")
                .where("inv.ref_id", booking_id)
                .andWhere("inv.ref_type", ref_type);
        });
    }
    deleteInvoice(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(id);
            return yield this.db("invoice")
                .withSchema(this.BTOC_SCHEMA)
                .where({ id })
                .del();
        });
    }
    //update invoice
    updateInvoice(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db("invoice")
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //create money receipt
    createMoneyReceipt(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, "*");
        });
    }
    //get single money receipt
    singleMoneyReceipt(invoice_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("money_receipt")
                .withSchema(this.BTOC_SCHEMA)
                .select("amount", "payment_time", "transaction_id", "payment_type", "details", "payment_id", "invoice_id", "payment_by")
                .where({ invoice_id });
        });
    }
    // create payment try
    createPaymentTry(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(payload);
            return yield this.db("payment_try")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload)
                .returning("id");
        });
    }
    // get payment try
    getSinglePaymentTry(id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("dbo.payment_try AS bpt")
                .select("bpt.id", "bpt.status", "bpt.booking_id", "bpt.user_id", "fb.payable_amount", "fb.pnr_code", "fb.status")
                .join("booking.flight_booking AS fb", "bpt.booking_id", "fb.id")
                .andWhere("bpt.user_id", user_id)
                .andWhere("bpt.id", id);
        });
    }
    // update payment try
    updatePaymentTry(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("dbo.payment_try").update(payload).where({ id });
        });
    }
    //get transactions
    getTransactions(userId, limit, skip, booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("invoice as inv")
                .withSchema(this.BTOC_SCHEMA)
                .select("inv.id", "bu.name", "bu.email", "bu.mobile_number", "inv.total_amount", "inv.booking_id", "inv.session_id", "inv.type", "inv.bank_tran_id", "inv.transaction_date", "fb.pnr_code", "fb.status", "fb.base_fare", "fb.total_tax", "fb.payable_amount", "fb.ait", "fb.discount", "fb.total_passenger", "fb.journey_type")
                .leftJoin("flight_booking as fb", "inv.booking_id", "fb.id")
                .leftJoin("btob_user as bu", "inv.created_by_agency_user_id", "bu.id")
                .where((qb) => {
                if (userId) {
                    qb.andWhere("inv.created_by_agency_user_id", userId);
                }
                if (booking_id) {
                    qb.andWhere("inv.booking_id", booking_id);
                }
            })
                .orderBy("inv.id", "desc")
                .limit(limit || 100)
                .offset(skip || 0);
            let count = [];
            count = yield this.db("invoice as inv")
                .withSchema(this.BTOC_SCHEMA)
                .count("inv.id as total")
                .leftJoin("flight_booking as fb", "inv.booking_id", "fb.id")
                .where((qb) => {
                if (userId) {
                    qb.andWhere("inv.created_by_agency_user_id", userId);
                }
                if (booking_id) {
                    qb.andWhere("inv.booking_id", booking_id);
                }
            });
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    // get single invoice by invoice number
    getSingleInvoiceByInvoiceNumber(invoice_number) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("invoice")
                .withSchema(this.BTOC_SCHEMA)
                .leftJoin("users", "users.id", "invoice.user_id")
                .select("invoice.*", "users.email", "users.first_name", "users.last_name", "users.phone_number")
                .where({ invoice_number });
        });
    }
}
exports.default = PaymentModel;
