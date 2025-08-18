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
exports.FlightRoutesConfigModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class FlightRoutesConfigModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Insert set routes commission
    insertSetRoutesCommission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('set_routes_commission')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // Get set routes commission
    getSetRoutesCommission(_a) {
        return __awaiter(this, arguments, void 0, function* ({ arrival, departure, one_way, round_trip, status, limit, skip, commission_set_id, }, need_total = true) {
            var _b;
            const data = yield this.db('set_routes_commission')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                qb.andWhere({ commission_set_id });
                if (arrival) {
                    qb.andWhere({ arrival });
                }
                if (departure) {
                    qb.andWhere({ departure });
                }
                if (one_way) {
                    qb.andWhere({ one_way });
                }
                if (round_trip) {
                    qb.andWhere({ round_trip });
                }
                if (status) {
                    qb.andWhere({ status });
                }
            })
                .limit(limit ? Number(limit) : 100)
                .offset(skip ? Number(skip) : 0);
            let total = [];
            if (need_total) {
                total = yield this.db('set_routes_commission')
                    .withSchema(this.DBO_SCHEMA)
                    .select('id AS total')
                    .where((qb) => {
                    qb.andWhere({ commission_set_id });
                    if (arrival) {
                        qb.andWhere({ arrival });
                    }
                    if (departure) {
                        qb.andWhere({ departure });
                    }
                    if (one_way) {
                        qb.andWhere({ one_way });
                    }
                    if (round_trip) {
                        qb.andWhere({ round_trip });
                    }
                    if (status) {
                        qb.andWhere({ status });
                    }
                });
            }
            return {
                data,
                total: (_b = total[0]) === null || _b === void 0 ? void 0 : _b.total,
            };
        });
    }
    // Update set routes commission
    updateSetRoutesCommission(payload, id, commission_set_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('set_routes_commission')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id })
                .andWhere({ commission_set_id });
        });
    }
    // Delete Set routes commission
    deleteSetRoutesCommission(id, commission_set_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('set_routes_commission')
                .withSchema(this.DBO_SCHEMA)
                .del()
                .andWhere({ id })
                .andWhere({ commission_set_id });
        });
    }
    // Insert Block route
    insertBlockRoute(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('route_block')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    // Update block route
    updateBlockRoute(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('route_block')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    // Get block route
    getBlockRoute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ airline, status, arrival, booking_block, departure, full_block, one_way, round_trip, limit, skip, }, need_total = true) {
            var _b;
            const data = yield this.db('route_block')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (status !== undefined) {
                    qb.andWhere('status', status);
                }
                if (airline) {
                    qb.andWhere('airline', airline);
                }
                if (arrival && departure) {
                    qb.andWhere('arrival', arrival).andWhere('departure', departure);
                }
                if (booking_block !== undefined) {
                    qb.andWhere('booking_block', booking_block);
                }
                if (full_block !== undefined) {
                    qb.andWhere('full_block', full_block);
                }
                if (one_way !== undefined) {
                    qb.andWhere('one_way', one_way);
                }
                if (round_trip !== undefined) {
                    qb.andWhere('round_trip', round_trip);
                }
            })
                .limit(limit ? Number(limit) : 100)
                .offset(skip ? Number(skip) : 0);
            let total = [];
            if (need_total) {
                total = yield this.db('route_block')
                    .withSchema(this.DBO_SCHEMA)
                    .select('*')
                    .where((qb) => {
                    if (status !== undefined) {
                        qb.andWhere('status', status);
                    }
                    if (airline) {
                        qb.andWhere('airline', airline);
                    }
                    if (arrival && departure) {
                        qb.andWhere('arrival', arrival).andWhere('departure', departure);
                    }
                    if (booking_block !== undefined) {
                        qb.andWhere('booking_block', booking_block);
                    }
                    if (full_block !== undefined) {
                        qb.andWhere('full_block', full_block);
                    }
                    if (one_way !== undefined) {
                        qb.andWhere('one_way', one_way);
                    }
                    if (round_trip !== undefined) {
                        qb.andWhere('round_trip', round_trip);
                    }
                });
            }
            return { data, total: (_b = total[0]) === null || _b === void 0 ? void 0 : _b.total };
        });
    }
    // Delete block route
    deleteBlockRoute(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('route_block')
                .withSchema(this.DBO_SCHEMA)
                .del()
                .where({ id });
        });
    }
}
exports.FlightRoutesConfigModel = FlightRoutesConfigModel;
