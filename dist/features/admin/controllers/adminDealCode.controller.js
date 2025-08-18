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
exports.AdminDealCodeController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const adminDealCode_service_1 = require("../services/adminDealCode.service");
const adminDealCode_validator_1 = require("../utils/validators/adminDealCode.validator");
class AdminDealCodeController extends abstract_controller_1.default {
    constructor() {
        super(...arguments);
        this.service = new adminDealCode_service_1.AdminDealCodeService();
        this.validator = new adminDealCode_validator_1.AdminDealCodeValidator();
        this.create = this.asyncWrapper.wrap({ bodySchema: this.validator.create }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.create(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAll = this.asyncWrapper.wrap({ querySchema: this.validator.get }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAll(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.update = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.update,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.update(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.delete = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.delete(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.AdminDealCodeController = AdminDealCodeController;
