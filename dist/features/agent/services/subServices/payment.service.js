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
exports.BookingPaymentService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../../config/config"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const qs_1 = __importDefault(require("qs"));
const invoiceTemplate_1 = require("../../../../utils/templates/invoiceTemplate");
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
class BookingPaymentService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx || {};
    }
    //ssl payment
    sslPayment(body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const ssl_body = Object.assign(Object.assign({}, body), { store_id: config_1.default.SSL_STORE_ID, store_passwd: config_1.default.SSL_STORE_PASSWORD, success_url: `${constants_1.SERVER_URL}/payment/success`, fail_url: `${constants_1.SERVER_URL}/payment/failed`, cancel_url: `${constants_1.SERVER_URL}/payment/cancelled`, shipping_method: "no", product_category: "General", product_profile: "General" });
                const response = yield axios_1.default.post(`${config_1.default.SSL_URL}/gwprocess/v4/api.php`, qs_1.default.stringify(ssl_body), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                if (((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.status) === "SUCCESS") {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        redirect_url: response.data.redirectGatewayURL,
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: "Something went wrong!",
                    };
                }
            }
            catch (err) {
                console.log("SSL ERROR", err);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: "Something went wrong",
                };
            }
        });
    }
    //create invoice
    createInvoice(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentModel = this.Model.btobPaymentModel(this.trx);
            const invoice_data = yield paymentModel.getLastInvoice({});
            let invoice_number;
            if (invoice_data.data.length) {
                invoice_number = Number(invoice_data.data[0].invoice_number.split("-")[1]);
            }
            else {
                invoice_number = 0;
            }
            invoice_number =
                `${constants_1.PROJECT_CODE}-` + (invoice_number + 1).toString().padStart(7, "0");
            const invoice = yield paymentModel.insertInvoice({
                agency_id: data.agency_id,
                user_id: data.user_id,
                ref_id: data.ref_id,
                ref_type: data.ref_type,
                total_amount: data.total_amount,
                due: data.due,
                details: data.details,
                invoice_number,
                due_clear_last_day: data.due_clear_last_day
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
            yield lib_1.default.sendEmail(data.email, `Invoice for Your ${invoiceFor} id: ${data.bookingId} | ${constants_1.PROJECT_NAME}`, (0, invoiceTemplate_1.invoiceTemplate)(invoiceMailData));
            return invoice;
        });
    }
}
exports.BookingPaymentService = BookingPaymentService;
