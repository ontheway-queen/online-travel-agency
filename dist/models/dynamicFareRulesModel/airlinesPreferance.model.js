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
class AirlinesPreferenceModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Airlines Preference
    createAirlinePreference(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines_preference')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    updateAirlinePreference(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines_preference')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteAirlinePreference(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines_preference')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getAirlinesPreferences(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines_preference')
                .withSchema(this.DBO_SCHEMA)
                .select('airlines_preference.*', 'airlines.name as airline_name', 'airlines.logo as airline_logo')
                .joinRaw(`
        LEFT JOIN airlines 
        ON airlines.code = airlines_preference.airlines_code
      `)
                .where((qb) => {
                qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
                if (query.airlines_code) {
                    qb.andWhere('airlines_code', query.airlines_code);
                }
                if (query.pref_type) {
                    qb.andWhere('airlines_preference.preference_type', query.pref_type);
                }
                if (query.status !== undefined) {
                    qb.andWhere('airlines_preference.status', query.status);
                }
                if (query.filter) {
                    qb.andWhere((qqb) => {
                        qqb
                            .orWhere('airlines_code', query.filter)
                            .orWhereILike('airlines.name', `%${query.filter}%`);
                    });
                }
            })
                .orderBy('airlines_preference.id', query.order_by || 'desc');
        });
    }
    getAirlinePrefCodes(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines_preference')
                .withSchema(this.DBO_SCHEMA)
                .select('airlines_code as Code')
                .where((qb) => {
                qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
                if (query.airlines_code) {
                    qb.andWhere('airlines_code', query.airlines_code);
                }
                if (query.pref_type) {
                    qb.andWhere('preference_type', query.pref_type);
                }
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.from_dac !== undefined) {
                    qb.andWhere('from_dac', query.from_dac);
                }
                if (query.to_dac !== undefined) {
                    qb.andWhere('to_dac', query.to_dac);
                }
                if (query.domestic !== undefined) {
                    qb.andWhere('domestic', query.domestic);
                }
                if (query.soto !== undefined) {
                    qb.andWhere('soto', query.soto);
                }
            });
        });
    }
    getAirlinePreferenceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('airlines_preference')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
}
exports.default = AirlinesPreferenceModel;
