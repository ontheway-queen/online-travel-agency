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
class SpecialOfferModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert speacial offer
    insertSpecialOffer(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('special_offer')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // update special offer
    updateSpecialOffer(query, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('special_offer AS sp')
                .withSchema(this.SERVICE_SCHEMA)
                .update(payload, 'id')
                .where((qb) => {
                if (query.id) {
                    qb.andWhere('sp.id', query.id);
                }
            });
        });
    }
    // delete single special offer
    deleteSingleSpecialOffer(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('special_offer AS sp')
                .withSchema(this.SERVICE_SCHEMA)
                .del('id')
                .where((qb) => {
                if (query.id) {
                    qb.andWhere('sp.id', query.id);
                }
            });
        });
    }
    // get single speacial offer
    getSingleSpecialOffer(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, panel } = query;
            return yield this.db('special_offer AS sp')
                .withSchema(this.SERVICE_SCHEMA)
                .select('sp.id', 'sp.title', 'sp.description', 'sp.photo', 'sp.type', 'sp.status', 'sp.created_by AS created_by_id', 'sp.video', 'sp.panel', this.db.raw("concat(ad.first_name, ' ', ad.last_name) AS created_by_name"), 'sp.created_at')
                .joinRaw('LEFT JOIN admin.user_admin AS ad ON sp.created_by = ad.id')
                .where((qb) => {
                if (id) {
                    qb.andWhere('sp.id', id);
                }
                if (panel) {
                    if (Array.isArray(panel)) {
                        qb.whereIn('sp.panel', panel);
                    }
                    else {
                        qb.andWhere('sp.panel', panel);
                    }
                }
            });
        });
    }
    //  get speacial offers
    getSpecialOffers(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.db('special_offer AS sp')
                .withSchema(this.SERVICE_SCHEMA)
                .select('sp.id', 'sp.title', 'sp.description', 'sp.photo', 'sp.type', 'sp.status', 'sp.video', 'sp.created_by AS created_by_id', this.db.raw("concat(ad.first_name, ' ', ad.last_name) AS created_by_name"), 'sp.created_at', "sp.panel")
                .joinRaw('LEFT JOIN admin.user_admin AS ad ON sp.created_by = ad.id')
                .where((qb) => {
                if (params.key) {
                    qb.andWhere((subQuery) => {
                        subQuery.orWhereILike('sp.description', `%${params.key}%`);
                        subQuery.orWhereILike('sp.title', `%${params.key}%`);
                    });
                }
                if (params.type) {
                    qb.andWhere('sp.type', params.type);
                }
                if (params.status) {
                    qb.andWhere('sp.status', params.status);
                }
                if (params.panel) {
                    if (Array.isArray(params.panel)) {
                        qb.whereIn('sp.panel', params.panel);
                    }
                    else {
                        qb.andWhere('sp.panel', params.panel);
                    }
                }
            })
                .orderBy('sp.created_at', 'desc');
            if (params.limit) {
                data.limit(params.limit);
            }
            if (params.skip) {
                data.offset(params.skip);
            }
            const total = yield this.db('special_offer AS sp')
                .withSchema(this.SERVICE_SCHEMA)
                .count('id as total')
                .where((qb) => {
                if (params.key) {
                    qb.andWhere((subQuery) => {
                        subQuery.orWhereILike('sp.description', `%${params.key}%`);
                        subQuery.orWhereILike('sp.title', `%${params.key}%`);
                    });
                }
                if (params.type) {
                    qb.andWhere('sp.type', params.type);
                }
                if (params.status) {
                    qb.andWhere('sp.status', params.status);
                }
                if (params.panel) {
                    if (Array.isArray(params.panel)) {
                        qb.whereIn('sp.panel', params.panel);
                    }
                    else {
                        qb.andWhere('sp.panel', params.panel);
                    }
                }
            });
            return {
                data: yield data,
                total: total[0].total,
            };
        });
    }
}
exports.default = SpecialOfferModel;
