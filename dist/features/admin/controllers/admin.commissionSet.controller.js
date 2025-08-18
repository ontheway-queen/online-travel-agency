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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCommissionSetController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const admin_commissionSet_service_1 = require("../services/admin.commissionSet.service");
const admin_commissionSet_validator_1 = __importDefault(require("../utils/validators/admin.commissionSet.validator"));
class AdminCommissionSetController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new admin_commissionSet_service_1.AdminCommissionSetService();
        this.validator = new admin_commissionSet_validator_1.default();
        // Create Commission set
        this.createCommissionSet = this.asyncWrapper.wrap({ bodySchema: this.validator.createCommissionSetSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createCommissionSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // Get commission set
        this.getCommissionSet = this.asyncWrapper.wrap({ querySchema: this.validator.getCommissionSetSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getCommissionSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // Get single commission set
        this.getSingleCommissionSet = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleCommissionSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // Update set Commission
        this.updateCommissionSet = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateCommissionSetSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateCommissionSet(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // upsert btoc set Commission
        this.upsertBtoCCommission = this.asyncWrapper.wrap({
            bodySchema: this.validator.upsertBtoCCommissionSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.upsertBtoCCommission(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // get btoc set Commission
        this.getBtoCCommission = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getBtoCCommission(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.AdminCommissionSetController = AdminCommissionSetController;
