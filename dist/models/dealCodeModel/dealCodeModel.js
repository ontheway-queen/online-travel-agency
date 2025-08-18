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
class DealCodeModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deal_code")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    update(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deal_code")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deal_code")
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getAll(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("deal_code")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "deal_code", "api", "created_at", "status")
                .where((qb) => {
                if (query.api) {
                    qb.andWhere("api", query.api);
                }
                if (query.status !== undefined) {
                    qb.andWhere("status", query.status);
                }
                if (query.deal_code) {
                    qb.andWhere("deal_code", query.deal_code);
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy("id", "desc");
            let total = [];
            if (is_total) {
                total = yield this.db("deal_code")
                    .withSchema(this.DBO_SCHEMA)
                    .count("id as total")
                    .where((qb) => {
                    if (query.api) {
                        qb.andWhere("api", query.api);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere("status", query.status);
                    }
                    if (query.deal_code) {
                        qb.andWhere("deal_code", query.deal_code);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingle(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("deal_code")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where({ id });
        });
    }
}
exports.default = DealCodeModel;
