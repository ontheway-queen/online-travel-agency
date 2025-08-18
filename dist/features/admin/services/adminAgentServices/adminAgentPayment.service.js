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
exports.AdminAgentPaymentService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AdminAgentPaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //get invoice B2B
    getB2BInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.btobPaymentModel();
            const query = req.query;
            const data = yield model.getInvoice(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single invoice B2B
    getB2BSingleInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.btobPaymentModel();
            const { id: invoice_id } = req.params;
            const data = yield model.singleInvoice(Number(invoice_id));
            let flight_data = {};
            if (data[0].ref_type === constants_1.INVOICE_TYPE_FLIGHT) {
                const flightModel = this.Model.b2bFlightBookingModel();
                const flight_res = yield flightModel.getSingleFlightBooking({
                    id: data[0].ref_id,
                });
                flight_data = {
                    base_fare: flight_res[0].base_fare,
                    total_tax: flight_res[0].total_tax,
                    ait: flight_res[0].ait,
                    discount: flight_res[0].discount,
                    pnr_code: flight_res[0].pnr_code,
                    payable_amount: flight_res[0].payable_amount,
                    journey_type: flight_res[0].journey_type,
                    total_passenger: flight_res[0].total_passenger,
                    route: flight_res[0].route,
                };
            }
            const money_receipt = yield model.getMoneyReceipt(Number(invoice_id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data[0]), { flight_data, money_receipt: money_receipt.length ? money_receipt : [] }),
            };
        });
    }
    // b2b partial payment list
    getPartialPaymentList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.btobPaymentModel();
            const query = req.query;
            const { data, total } = yield model.getPartialPaymentInvoiceList(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
            };
        });
    }
}
exports.AdminAgentPaymentService = AdminAgentPaymentService;
