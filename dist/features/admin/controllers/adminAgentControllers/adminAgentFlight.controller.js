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
const abstract_controller_1 = __importDefault(require("../../../../abstract/abstract.controller"));
const adminAgentFlight_service_1 = __importDefault(require("../../services/adminAgentServices/adminAgentFlight.service"));
const adminAgentFlight_validator_1 = require("../../utils/validators/adminAgentValidators/adminAgentFlight.validator");
class AdminAgentFlightController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new adminAgentFlight_service_1.default();
        this.validator = new adminAgentFlight_validator_1.AdminAgentFlightValidator();
        // flight booking cancel
        this.flightBookingCancel = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.flightBookingCancel(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get booking list
        this.getBookingList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getBookingList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get booking single
        this.getBookingSingle = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getBookingSingle(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // ticket issue
        this.ticketIssue = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.ticketIssue(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // reminder to issue ticket
        this.reminderBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.reminderBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //update booking
        this.updateBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateBooking,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //get pending ticket issuance list
        this.getPendingTicketIssuance = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getPendingTicketIssuance(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //update pending ticket issuance
        this.updateTicketIssuance = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updatePendingTicketIssuance,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateTicketIssuance(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // update blocked booking controller
        this.updateBlockedBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateBlockedBookingValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateBlockedBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //pnr share
        this.pnrShare = this.asyncWrapper.wrap({
            bodySchema: this.validator.pnrShare,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.pnrShare(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get pnr details
        this.getPnrDetails = this.asyncWrapper.wrap({
            bodySchema: this.validator.PnrDetails,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getPnrDetails(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //Manual booking
        this.manualBooking = this.asyncWrapper.wrap({
            bodySchema: this.validator.manualBookingSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.manualBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //refetch
        this.fetchDataFromAPI = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.fetchDataFromAPI(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //refetch
        this.editBooking = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.editBookingInfo,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.editBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //send mail
        this.sendBookingMail = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.sendBookingMail(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.default = AdminAgentFlightController;
