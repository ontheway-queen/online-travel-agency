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
exports.ApiAirlinesBlockModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class ApiAirlinesBlockModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //insert
    insert(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_airlines_block')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //update
    update(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_airlines_block')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_airlines_block')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    //get
    get(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('api_airlines_block as aab')
                .withSchema(this.DBO_SCHEMA)
                .select('aab.id', 'aab.airline as airline_code', 'ai.name as airline_name', 'ai.logo as airline_logo', 'aab.issue_block', 'aab.booking_block', 'aab.status')
                .leftJoin('airlines as ai', 'ai.code', 'aab.airline')
                .where((qb) => {
                if (payload.filter) {
                    qb.andWhereILike('aab.airline', `${payload.filter}`);
                    qb.orWhereILike('ai.name', `${payload.filter}%`);
                }
            })
                .andWhere('aab.set_flight_api_id', payload.set_flight_api_id)
                .limit(payload.limit || 100)
                .offset(payload.skip || 0)
                .orderBy('aab.id', 'desc');
            const total = yield this.db('api_airlines_block as aab')
                .withSchema(this.DBO_SCHEMA)
                .count('aab.id as total')
                .leftJoin('airlines as ai', 'ai.code', 'aab.airline')
                .where((qb) => {
                if (payload.filter) {
                    qb.andWhereILike('aab.airline', `${payload.filter}`);
                    qb.orWhereILike('ai.name', `${payload.filter}%`);
                }
            });
            return { data, total: (_a = total === null || total === void 0 ? void 0 : total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //single
    getAirlineBlock(airline, set_flight_api_id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('api_airlines_block as aab')
                .withSchema(this.DBO_SCHEMA)
                .select('aab.id', 'aab.airline as airline_code', 'aab.issue_block', 'aab.booking_block', 'aab.status')
                .where('aab.airline', airline)
                .andWhere('aab.set_flight_api_id', set_flight_api_id)
                .andWhere((qb) => {
                if (status != undefined) {
                    qb.andWhere('aab.status', status);
                }
            });
        });
    }
    //check entry
    checkEntryExists(airlines, set_flight_api_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db('api_airlines_block as aab')
                .withSchema(this.DBO_SCHEMA)
                .select('aab.id')
                .whereIn('aab.airline', airlines)
                .andWhere('aab.set_flight_api_id', set_flight_api_id)
                .first();
            return !!result;
        });
    }
}
exports.ApiAirlinesBlockModel = ApiAirlinesBlockModel;
