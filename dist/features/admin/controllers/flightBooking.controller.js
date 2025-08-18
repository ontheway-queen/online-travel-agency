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
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const flightBooking_service_1 = __importDefault(require("../services/flightBooking.service"));
const adminB2CFlight_validator_1 = require("../utils/validators/adminB2CValidators/adminB2CFlight.validator");
class adminFlightBookingController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new flightBooking_service_1.default();
        this.validator = new adminB2CFlight_validator_1.AdminB2CFlightValidator();
        // get all flight booking
        this.getAllFlightBooking = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllFlightBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get single flight booking
        this.getSingleFlightBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleFlightBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // issue ticket
        this.issueTicket = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.ticketIssue(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // cancel flight booking
        this.cancelFlightBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamStringValidator("id") }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.cancelFlightBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // update blocked booking controller
        this.updateBlockedBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateBlockedBookingValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateBlockedBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //update booking
        this.updateBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateBooking,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //refetch
        this.fetchDataFromAPI = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.fetchDataFromAPI(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //edit booking info
        this.editBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.editBookingInfo
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.editBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //send mail
        this.sendBookingMail = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.sendBookingMail(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //Manual booking
        this.manualBooking = this.asyncWrapper.wrap({
            bodySchema: this.validator.manualBookingSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.manualBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get pnr details
        this.getPnrDetails = this.asyncWrapper.wrap({
            bodySchema: this.validator.PnrDetails,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPnrDetails(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.default = adminFlightBookingController;
