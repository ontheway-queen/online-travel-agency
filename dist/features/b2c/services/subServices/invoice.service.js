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
exports.BtoCInvoiceService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class BtoCInvoiceService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    //create invoice
    createInvoice(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentModel = this.Model.paymentModel(this.trx);
            const invoice_data = yield paymentModel.getLastInvoice({});
            let invoice_number;
            if (invoice_data.data.length) {
                invoice_number = Number(invoice_data.data[0].invoice_number.split("-")[1]);
            }
            else {
                invoice_number = 0;
            }
            invoice_number =
                `${constants_1.PROJECT_CODE}IC-` + (invoice_number + 1).toString().padStart(7, "0");
            const invoice = yield paymentModel.insertInvoice({
                user_id: data.user_id,
                ref_id: data.ref_id,
                ref_type: data.ref_type,
                total_amount: data.total_amount,
                due: data.due,
                details: data.details,
                invoice_number,
            });
            const invoiceMailData = {
                name: data.user_name,
                invoiceNumber: invoice_number,
                bookingType: data.ref_type,
                date: new Date(invoice[0].created_at).toLocaleString(),
                totalTravelers: data.total_travelers,
                JType: data.travelers_type,
                totalAmount: data.total_amount,
            };
            let invoiceFor;
            if (data.ref_type === constants_1.INVOICE_TYPE_FLIGHT) {
                invoiceFor = "Flight Booking";
            }
            else if (data.ref_type === constants_1.INVOICE_TYPE_VISA) {
                invoiceFor = "Visa Application";
            }
            else if (data.ref_type === constants_1.INVOICE_TYPE_UMRAH) {
                invoiceFor = "Umrah Package Booking";
            }
            else if (data.ref_type === constants_1.INVOICE_TYPE_TOUR) {
                invoiceFor = "Tour Package Booking";
            }
            // await Lib.sendEmail(
            //   data.email,
            //   `Invoice for Your ${invoiceFor} id: ${data.bookingId} | ${PROJECT_NAME}`,
            //   invoiceTemplate(invoiceMailData)
            // );
            return invoice;
        });
    }
}
exports.BtoCInvoiceService = BtoCInvoiceService;
