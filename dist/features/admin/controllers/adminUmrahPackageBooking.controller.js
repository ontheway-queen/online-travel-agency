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
exports.AdminUmrahPackageBookingController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const tourPackage_validator_1 = __importDefault(require("../../b2c/utils/validators/tourPackage.validator"));
const adminUmrahPackageBooking_service_1 = require("../services/adminUmrahPackageBooking.service");
const admin_umrahpackage_validator_1 = require("../utils/validators/admin.umrahpackage.validator");
class AdminUmrahPackageBookingController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new adminUmrahPackageBooking_service_1.AdminUmrahPackageBookingService();
        this.validator = new admin_umrahpackage_validator_1.UmrahPackageValidator();
        this.btoCValidator = new tourPackage_validator_1.default();
        // get all tour package booking list
        this.getAllUmrahPackageBooking = this.asyncWrapper.wrap({ querySchema: this.validator.umrahPackageBookingFilterQueryValidator }, 
        // null,
        (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllUmrahPackageBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //get single tour package booking info
        this.getSingleUmrahPackageBookingInfo = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getSingleBookingInfo(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //update tour package booking
        this.updateUmrahPackage = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.umrahPackageBookingUpdate
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateUmrahPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
    }
}
exports.AdminUmrahPackageBookingController = AdminUmrahPackageBookingController;
