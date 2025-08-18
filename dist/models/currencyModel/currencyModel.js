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
class CurrencyModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createApiWise(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_wise_currency')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateApiWise(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_wise_currency')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteApiWise(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_wise_currency')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getApiWise(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('api_wise_currency as awc')
                .withSchema(this.DBO_SCHEMA)
                .select('awc.id', 'awc.api_id', 'awc.api_currency', 'awc.currency_value', 'cpl.api_name', 'awc.type')
                .leftJoin('currency_api_list as cpl', 'cpl.id', 'awc.api_id')
                .where((qb) => {
                if (query.filter) {
                    qb.andWhere('api_id', query.filter);
                }
            })
                .orderBy('id', 'asc');
            return data;
        });
    }
    getApiList(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('currency_api_list')
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'api_name')
                .orderBy('id', 'asc')
                .where({ type });
        });
    }
    getApiWiseCurrencyByName(api_name, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('api_wise_currency as awc')
                .withSchema(this.DBO_SCHEMA)
                .leftJoin('currency_api_list as cpl', 'cpl.id', 'awc.api_id')
                .select('awc.currency_value')
                .where('cpl.api_name', api_name)
                .andWhere('awc.type', type);
            if (data.length) {
                return Number(data[0].currency_value);
            }
            else {
                return 1;
            }
        });
    }
}
exports.default = CurrencyModel;
