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
exports.AdminApiAirlinesBlockService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminApiAirlinesBlockService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //create
    create(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const model = this.Model.apiAirlinesBlockModel(trx);
                const body = req.body;
                const exists = yield model.checkEntryExists(body.airline, body.set_flight_api_id);
                if (exists) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "One or more airlines already have an entry for this flight API ID",
                    };
                }
                const insertData = body.airline.map((airline) => ({
                    airline,
                    set_flight_api_id: body.set_flight_api_id,
                    created_by: id,
                    issue_block: body.issue_block,
                    booking_block: body.booking_block,
                }));
                const res = yield model.insert(insertData);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    //get all
    get(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.apiAirlinesBlockModel();
            const query = req.query;
            const data = yield model.get(Object.assign(Object.assign({}, query), { set_flight_api_id: Number(id) }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //update
    update(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const model = this.Model.apiAirlinesBlockModel(trx);
                const body = req.body;
                body.updated_at = new Date();
                body.updated_by = id;
                const { id: block_id } = req.params;
                yield model.update(body, Number(block_id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    //delete
    delete(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const model = this.Model.apiAirlinesBlockModel(trx);
                const { id: block_id } = req.params;
                yield model.delete(Number(block_id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.AdminApiAirlinesBlockService = AdminApiAirlinesBlockService;
