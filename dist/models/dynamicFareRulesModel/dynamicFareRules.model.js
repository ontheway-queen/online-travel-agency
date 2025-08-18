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
class DynamicFareModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Dynamic Fare Set
    createSet(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateSet(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteSet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getSets(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'name', 'created_by', 'created_at')
                .where((qb) => {
                if (name) {
                    qb.andWhere({ name });
                }
            })
                .orderBy('id', 'desc');
        });
    }
    getSetById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
    // Dynamic Fare Supplier
    createSupplier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateSupplier(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteSupplier(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getSuppliers(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { set_id, supplier_id, status } = payload;
            return yield this.db('dynamic_fare_supplier as dfs')
                .withSchema(this.DBO_SCHEMA)
                .select('dfs.*', 'supplier.api', 'supplier.logo')
                .leftJoin('supplier', 'supplier.id', 'dfs.supplier_id')
                .where((qb) => {
                if (set_id) {
                    qb.andWhere({ set_id });
                }
                if (supplier_id) {
                    qb.andWhere({ supplier_id });
                }
                if (status !== undefined) {
                    qb.andWhere('dfs.status', status);
                }
                if (payload.id) {
                    qb.andWhere('dfs.id', payload.id);
                }
                if (payload.api_name) {
                    qb.andWhere('supplier.api', payload.api_name);
                }
            })
                .orderBy('dfs.id', payload.order_by || 'desc');
        });
    }
    getSupplierById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
    // Supplier Airlines Dynamic Fare
    createSupplierAirlinesFare(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    updateSupplierAirlinesFare(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteSupplierAirlinesFare(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getSupplierAirlinesFares(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .select('supplier_airlines_dynamic_fare.*', 'airlines.name as airline_name', 'airlines.logo as airline_logo')
                .joinRaw(`
      LEFT JOIN airlines 
      ON airlines.code = supplier_airlines_dynamic_fare.airline
    `)
                .where((qb) => {
                qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
                if (query.airline) {
                    qb.andWhere('supplier_airlines_dynamic_fare.airline', query.airline);
                }
                if (query.flight_class) {
                    qb.andWhere('supplier_airlines_dynamic_fare.flight_class', query.flight_class);
                }
                if (query.from_dac !== undefined) {
                    qb.andWhere('from_dac', query.from_dac);
                }
                if (query.to_dac !== undefined) {
                    qb.andWhere('to_dac', query.to_dac);
                }
                if (query.soto !== undefined) {
                    qb.andWhere('soto', query.soto);
                }
                if (query.domestic !== undefined) {
                    qb.andWhere('domestic', query.domestic);
                }
            })
                .orderBy('supplier_airlines_dynamic_fare.id', query.order_by || 'desc');
        });
    }
    getSupplierAirlinesFareById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
    // Dynamic Fare Tax
    createFareTax(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateFareTax(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteFareTax(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getFareTaxes(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .select('dynamic_fare_tax.*', 'airlines.name as airline_name', 'airlines.logo as airline_logo')
                .joinRaw(`
      LEFT JOIN airlines 
      ON airlines.code = dynamic_fare_tax.airline
    `)
                .where((qb) => {
                qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
                if (query.airline) {
                    qb.andWhere('dynamic_fare_tax.airline', query.airline);
                }
                if (query.tax_name) {
                    qb.andWhere('tax_name', query.tax_name);
                }
            })
                .orderBy('dynamic_fare_tax.id', query.order_by || 'desc');
        });
    }
    getFareRulesConditions(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
                qb.andWhere('airline', query.airline);
                qb.andWhere('tax_name', query.tax_name);
                if (query.from_dac !== undefined) {
                    qb.andWhere('from_dac', query.from_dac);
                }
                if (query.to_dac !== undefined) {
                    qb.andWhere('to_dac', query.to_dac);
                }
                if (query.soto !== undefined) {
                    qb.andWhere('soto', query.soto);
                }
                if (query.domestic !== undefined) {
                    qb.andWhere('domestic', query.domestic);
                }
            })
                .andWhere('status', true);
        });
    }
    getFareTaxById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
    //get b2c commission
    getB2CCommission() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('btoc_commission as bc')
                .withSchema(this.DBO_SCHEMA)
                .join('dynamic_fare_set as cs', 'cs.id', 'bc.commission_set_id')
                .select('bc.id', 'bc.commission_set_id', 'cs.name');
        });
    }
    //upsert b2c commission set
    upsertB2CCommission(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.db('btoc_commission')
                .withSchema(this.DBO_SCHEMA)
                .update(payload);
            if (!res) {
                yield this.db('btoc_commission')
                    .withSchema(this.DBO_SCHEMA)
                    .insert(payload);
            }
        });
    }
    //get supplier list
    getSupplierList(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (type) {
                    qb.andWhere({ type });
                }
            });
        });
    }
}
exports.default = DynamicFareModel;
