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
exports.AdminReportService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminReportService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getB2CPaymentTransactionReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqQuery = req.query;
            const reportModel = this.Model.ReportModel();
            const result = yield reportModel.getB2CPaymentTransactionReport(reqQuery);
            const modifiedResult = result.data.map((item) => {
                return {
                    id: item.id,
                    amount: item.amount,
                    payment_time: item.payment_time,
                    transaction_id: item.transaction_id,
                    payment_type: item.payment_type,
                    details: item.details,
                    payment_id: item.payment_id,
                    payment_by: item.payment_by,
                    payment_gateway: item.payment_gateway,
                    invoice_id: item.invoice_id,
                    ref_type: item.ref_type,
                    invoice_number: item.invoice_number,
                    booking_ref: item.flight_booking_ref || item.visa_booking_ref || item.tour_booking_ref,
                    booking_id: item.flight_booking_id || item.visa_booking_id || item.tour_booking_id,
                    username: item.username,
                    first_name: item.first_name,
                    last_name: item.last_name,
                };
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: modifiedResult,
                total: result.total,
            };
        });
    }
    getB2BTopUpReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqQuery = req.query;
            const reportModel = this.Model.ReportModel();
            const result = yield reportModel.getB2BTopUpReport(reqQuery);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: result.data,
                total: result.total,
            };
        });
    }
    getB2BLedgerReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqQuery = req.query;
            const reportModel = this.Model.ReportModel();
            const result = yield reportModel.getB2BLedgerReport(reqQuery);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: result.data,
                total: result.total,
            };
        });
    }
    getB2BSalesReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const reqQuery = req.query;
                const reportModel = this.Model.ReportModel(trx);
                const flightModel = this.Model.b2bFlightBookingModel(trx);
                const invoiceModel = this.Model.btobPaymentModel(trx);
                const result = yield reportModel.getB2BSalesReport(reqQuery);
                const modifiedResult = yield Promise.all(result.data.map((item) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e;
                    const [segments, travelers, money_receipt] = yield Promise.all([
                        flightModel.getFlightSegment(item.booking_id),
                        flightModel.getFlightBookingTraveler(item.booking_id),
                        invoiceModel.getMoneyReceipt(item.invoice_id),
                    ]);
                    return {
                        booking_id: item.booking_id,
                        booking_ref: item.booking_ref,
                        booking_date: item.booking_date,
                        journey_type: item.journey_type,
                        departure_date: (_a = segments[0]) === null || _a === void 0 ? void 0 : _a.departure_date,
                        arrival_date: (_b = segments[segments.length - 1]) === null || _b === void 0 ? void 0 : _b.arrival_date,
                        airline: (_c = segments[0]) === null || _c === void 0 ? void 0 : _c.airline,
                        flight_number: (_d = segments[0]) === null || _d === void 0 ? void 0 : _d.flight_number,
                        class: (_e = segments[0]) === null || _e === void 0 ? void 0 : _e.class,
                        pax_info: travelers.map((traveler) => {
                            return {
                                pax_name: `${String(traveler.reference).toUpperCase()} ${traveler.first_name} ${traveler.last_name}`,
                                pax_type: traveler.type,
                                ticket_number: traveler.ticket_number,
                            };
                        }),
                        vendor_price: item.vendor_price,
                        partial_payment: item.partial_payment,
                        status: item.status,
                        pnr_code: item.pnr_code,
                        route: item.route,
                        total_passenger: item.total_passenger,
                        base_fare: item.base_fare,
                        total_tax: item.total_tax,
                        ait: item.ait,
                        convenience_fee: item.convenience_fee,
                        payable_amount: item.payable_amount,
                        api: item.api,
                        agency_name: item.agency_name,
                        invoice_number: item.invoice_number,
                        money_receipt: money_receipt,
                    };
                })));
                console.log('result length', modifiedResult.length);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: modifiedResult,
                    total: result.total,
                };
            }));
        });
    }
    getB2BTicketWiseReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqQuery = req.query;
            const reportModel = this.Model.ReportModel();
            const result = yield reportModel.getB2BTicketWiseReport(reqQuery);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: result.data,
                total: result.total,
            };
        });
    }
    getB2BFlightBookingReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqQuery = req.query;
            const reportModel = this.Model.ReportModel();
            const result = yield reportModel.getB2BFlightBookingReport(reqQuery);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: result.data,
                total: result.total,
            };
        });
    }
    getB2CFlightBookingReport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqQuery = req.query;
            const reportModel = this.Model.ReportModel();
            const result = yield reportModel.getB2CFlightBookingReport(reqQuery);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: result.data,
                total: result.total,
            };
        });
    }
}
exports.AdminReportService = AdminReportService;
