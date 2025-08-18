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
exports.UmrahPackageController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const admin_umrahpackage_service_1 = require("../services/admin.umrahpackage.service");
const admin_umrahpackage_validator_1 = require("../utils/validators/admin.umrahpackage.validator");
class UmrahPackageController extends abstract_controller_1.default {
    constructor() {
        super();
        this.umrahPackageService = new admin_umrahpackage_service_1.UmrahPackageService();
        this.validators = new admin_umrahpackage_validator_1.UmrahPackageValidator();
        this.createUmrahPackage = this.asyncWrapper.wrap({
            bodySchema: this.validators.createUmrahPackageBodyValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.umrahPackageService.createUmrahPackage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        this.getAllUmrahPackage = this.asyncWrapper.wrap({
            querySchema: this.validators.getAllUmrahPackageQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.umrahPackageService.getAllUmrahPackage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        this.getSingleUmrahPackage = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.umrahPackageService.getSingleUmrahPackage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        this.updateUmrahPackage = this.asyncWrapper.wrap({
            bodySchema: this.validators.updateUmrahPackageBodyValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.umrahPackageService.updateUmrahPackage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        this.getIncludeExcludeItems = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.umrahPackageService.getIncludeExcludeItems(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createDetailDescription = this.asyncWrapper.wrap({
            bodySchema: this.validators.createDetailDescriptionBodyValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.umrahPackageService.createDetailDescription(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.UmrahPackageController = UmrahPackageController;
