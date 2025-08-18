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
const b2cFlight_service_1 = __importDefault(require("../services/b2cFlight.service"));
const b2cFlight_validator_1 = __importDefault(require("../utils/validators/b2cFlight.validator"));
class B2CFlightController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new b2cFlight_service_1.default();
        this.validator = new b2cFlight_validator_1.default();
        // Search flight
        this.flightSearch = this.asyncWrapper.wrap({ bodySchema: this.validator.flightSearchSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.flightSearch(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //flight search using sse
        this.FlightSearchSSE = this.asyncWrapper.SSEwrap({ querySchema: this.validator.flightSearchSSESchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            // Set up SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            // Function to send SSE events
            const sendEvent = (event, data) => {
                res.write(`event: ${event}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };
            try {
                sendEvent('start', { message: 'Flight search has been started.' });
                // Pass `sendEvent` to your service to enable SSE updates
                yield this.services.FlightSearchSSE(req, res);
                // Close the SSE connection when the operation completes
                sendEvent('end', { message: 'Flight search completed successfully.' });
                res.end();
            }
            catch (error) {
                // Handle errors and notify the client
                sendEvent('error', { message: 'An error occurred during flight search.', error });
                res.end();
            }
        }));
        // revalidate flight
        this.flightRevalidate = this.asyncWrapper.wrap({ querySchema: this.validator.flightRevalidateSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.flightRevalidate(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get flight fare rules
        this.getFlightFareRule = this.asyncWrapper.wrap({ querySchema: this.validator.flightRevalidateSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getFlightFareRule(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // flight booking (with passport and visa file)
        this.flightBooking = this.asyncWrapper.wrap({ bodySchema: this.validator.pnrCreateSchemaV2 }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.flightBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // flight booking cancel
        this.flightBookingCancel = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.flightBookingCancel(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //flight booking list
        this.getFlightBookingList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getFlightBookingList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //flight booking single
        this.getSingleFlightBooking = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getSingleFlightBooking(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.default = B2CFlightController;
