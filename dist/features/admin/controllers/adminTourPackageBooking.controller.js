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
exports.AdminTourPackageBookingController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const tourPackage_validator_1 = require("../utils/validators/tourPackage.validator");
const tourPackage_validator_2 = __importDefault(require("../../b2c/utils/validators/tourPackage.validator"));
const adminTourPackageBooking_service_1 = require("../services/adminTourPackageBooking.service");
class AdminTourPackageBookingController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new adminTourPackageBooking_service_1.AdminTourPackageBookingService();
        this.validator = new tourPackage_validator_1.TourPackageValidator();
        this.btoCValidator = new tourPackage_validator_2.default();
        // get all tour package booking list
        this.getAllTourPackageBooking = this.asyncWrapper.wrap({ querySchema: this.validator.tourPackageBookingFilterQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllTourPackageBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //get single tour package booking info
        this.getSingleTourPackageBookingInfo = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getSingleBookingInfo(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //update tour package booking
        this.updateTourPackage = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.btoCValidator.tourPackageBookingUpdate,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateTourPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        // get all tour package booking list b2b
        this.getAllTourPackageBookingB2B = this.asyncWrapper.wrap({ querySchema: this.validator.tourPackageBookingFilterQueryValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllTourPackageBookingB2B(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //get single tour package booking info b2b
        this.getSingleBookingInfoB2B = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getSingleBookingInfoB2B(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //update tour package booking b2b
        this.updateTourPackageB2B = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.btoCValidator.tourPackageBookingUpdateB2B,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateTourPackageB2B(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
    }
}
exports.AdminTourPackageBookingController = AdminTourPackageBookingController;
