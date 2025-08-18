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
exports.TourPackageController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const tourPackage_validator_1 = require("../utils/validators/tourPackage.validator");
const adminTourPackage_service_1 = require("../services/adminTourPackage.service");
const tourPackageRequestBToC_validator_1 = __importDefault(require("../../b2c/utils/validators/tourPackageRequestBToC.validator"));
class TourPackageController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new adminTourPackage_service_1.TourPackageService();
        this.validator = new tourPackage_validator_1.TourPackageValidator();
        this.tourPackageRequestValidator = new tourPackageRequestBToC_validator_1.default();
        // create new tour package controller
        this.createTourPackage = this.asyncWrapper.wrap({ bodySchema: this.validator.createTourPackageSchemaV2 }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.createTourPackageV2(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        // get all tour packages
        this.getAllTourPackage = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllTourPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        // get single tour package
        this.getSingleTourPackage = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getSingleTourPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //update single tour package
        this.updateTourPackage = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateTourPackageSchemaV2,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateTourPackageV2(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //delete single tour package
        this.deleteSingleTourPackage = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.deleteTourPackage(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        //  get tour package requests
        this.getTourPackageRequest = this.asyncWrapper.wrap({ bodySchema: this.tourPackageRequestValidator.getTourPackageRequest }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getTourPackageRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
        // update tour package request
        this.updateTourPackageRequest = this.asyncWrapper.wrap({ bodySchema: this.tourPackageRequestValidator.updateTourPackageRequest }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateTourPackageRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.success) {
                res.status(code).json(rest);
            }
            else {
                this.error(rest.message, code);
            }
        }));
    }
}
exports.TourPackageController = TourPackageController;
