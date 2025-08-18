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
exports.ApiSetCommissionModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ApiSetCommissionModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Create Set Commission
    createCommissionSet(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('commission_set')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // Get Set Commission
    getCommissionSet(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, status, exact_name, }) {
            return yield this.db('commission_set')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (name) {
                    qb.andWhereILike('name', `%${name}%`);
                }
                if (exact_name) {
                    qb.andWhere('name', exact_name);
                }
                if (status !== undefined) {
                    qb.andWhere('status', status);
                }
            });
        });
    }
    // Get single commission set
    getSingleCommissionSet(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('commission_set')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                qb.andWhere('id', id);
                if (status !== undefined) {
                    qb.andWhere('status', status);
                }
            });
        });
    }
    // Update commission set
    updateCommissionSet(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('commission_set')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where('id', id);
        });
    }
    // delete commission set
    deleteCommissionSet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('commission_set')
                .withSchema(this.DBO_SCHEMA)
                .del()
                .where('id', id);
        });
    }
    // Create Set Flight API
    createSetFlightAPI(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('set_flight_api')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    // GET Set Flight API
    getSetFlightAPI(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, status, set_id, api_id, api_name, }) {
            return yield this.db('set_flight_api AS sfa')
                .withSchema(this.DBO_SCHEMA)
                .select('sfa.id', 'sfa.status', 'sfa.api_id', 'fa.api AS api_name', 'fa.logo AS api_logo')
                .leftJoin('supplier AS fa', 'sfa.api_id', 'fa.id')
                .where((qb) => {
                qb.andWhere('sfa.set_id', set_id);
                if (id) {
                    qb.andWhere('sfa.id', id);
                }
                if (api_id) {
                    qb.andWhere('sfa.api_id', api_id);
                }
                if (status !== undefined) {
                    qb.andWhere('sfa.status', status);
                }
                if (api_name) {
                    qb.andWhere('fa.api', api_name);
                }
            })
                .orderBy("sfa.id", 'asc');
        });
    }
    // Update set flight api
    updateSetFlightAPI(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('set_flight_api')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where('id', id);
        });
    }
    // Delete set flight api
    deleteSetFlightAPI(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('set_flight_api')
                .withSchema(this.DBO_SCHEMA)
                .del()
                .where('id', id);
        });
    }
    //get btoc commission
    getBtoCCommission() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("btoc_commission as bc")
                .withSchema(this.DBO_SCHEMA)
                .join("commission_set as cs", "cs.id", "bc.commission_set_id")
                .select("bc.id", "bc.commission_set_id", "cs.name");
        });
    }
    //upsert btoc commission set
    upsertBtoCCommission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db("btoc_commission")
                .withSchema(this.DBO_SCHEMA)
                .update(payload);
            if (!res) {
                yield this.db("btoc_commission")
                    .withSchema(this.DBO_SCHEMA)
                    .insert(payload);
            }
        });
    }
}
exports.ApiSetCommissionModel = ApiSetCommissionModel;
