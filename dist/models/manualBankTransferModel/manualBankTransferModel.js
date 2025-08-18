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
exports.ManualBankTransferModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ManualBankTransferModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create manual bank transfer
    createManualBankTransfer(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('manual_bank_transfer')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get manual bank transfer list
    getManualBankTransferList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('manual_bank_transfer as mbt')
                .withSchema(this.BTOC_SCHEMA)
                .select('mbt.id', 'mbt.amount', 'mbt.bank_name', 'mbt.transfer_date', 'mbt.invoice_copy', 'mbt.status', 'mbt.created_at', 'mbt.invoice_id', 'inv.ref_type', 'usr.username', 'usr.first_name', 'usr.last_name')
                .where((qb) => {
                if (payload.status) {
                    qb.where('mbt.status', payload.status);
                }
                if (payload.user_id) {
                    qb.where('mbt.user_id', payload.user_id);
                }
                if (payload.from_date) {
                    qb.where('mbt.created_at', '>=', payload.from_date);
                }
                if (payload.to_date) {
                    qb.where('mbt.created_at', '<=', payload.to_date);
                }
                if (payload.amount) {
                    qb.where('mbt.amount', '>=', payload.amount);
                }
            })
                .joinRaw('LEFT JOIN b2c.users as usr ON mbt.user_id = usr.id')
                .joinRaw('LEFT JOIN b2c.invoice as inv ON mbt.invoice_id = inv.id')
                .groupBy('mbt.user_id', 'mbt.id', 'inv.id', 'usr.username', 'usr.first_name', 'usr.last_name')
                .orderBy('mbt.id', 'desc')
                .limit(payload.limit || 100)
                .offset(payload.skip || 0);
            const total = yield this.db('manual_bank_transfer')
                .withSchema(this.BTOC_SCHEMA)
                .count('id as total')
                .where((qb) => {
                if (payload.status) {
                    qb.where('status', payload.status);
                }
                if (payload.user_id) {
                    qb.where('user_id', payload.user_id);
                }
                if (payload.from_date) {
                    qb.where('created_at', '>=', payload.from_date);
                }
                if (payload.to_date) {
                    qb.where('created_at', '<=', payload.to_date);
                }
                if (payload.amount) {
                    qb.where('mbt.amount', '>=', payload.amount);
                }
            });
            return { data, total };
        });
    }
    //get single manual bank transfer
    getSingleManualBankTransfer(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('manual_bank_transfer')
                .withSchema(this.BTOC_SCHEMA)
                .select('*')
                .where((qb) => {
                if (payload.user_id) {
                    qb.where('user_id', payload.user_id);
                }
                if (payload.id) {
                    qb.where('id', payload.id);
                }
                if (payload.invoice_id) {
                    qb.where('invoice_id', payload.invoice_id);
                }
                if (payload.status) {
                    qb.where('status', payload.status);
                }
            });
            return data;
        });
    }
    //update manual bank transfer
    updateManualBankTransfer(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('manual_bank_transfer')
                .withSchema(this.BTOC_SCHEMA)
                .update(payload)
                .where({ id })
                .returning('*');
        });
    }
}
exports.ManualBankTransferModel = ManualBankTransferModel;
