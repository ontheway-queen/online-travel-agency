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
exports.BookingPaymentServices = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const payment_service_1 = require("./subServices/payment.service");
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const config_1 = __importDefault(require("../../../config/config"));
const publicBkash_service_1 = __importDefault(require("../../public/services/publicBkash.service"));
const bkashApiEndpoints_1 = require("../../../utils/miscellaneous/bkashApiEndpoints");
const axios_1 = __importDefault(require("axios"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const publicSSL_service_1 = __importDefault(require("../../public/services/publicSSL.service"));
class BookingPaymentServices extends abstract_service_1.default {
    constructor() {
        super(...arguments);
        this.subServices = new payment_service_1.BookingPaymentService();
        this.common_service = new publicBkash_service_1.default();
    }
    //create payment
    createPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: user_id, first_name, email, phone_number } = req.user;
            const { invoice_id } = req.params;
            const { isApp } = req.body;
            const paymentModel = this.Model.paymentModel();
            const invoice = yield paymentModel.singleInvoice({
                id: Number(invoice_id),
                user_id,
            });
            if (!invoice.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: `Invoice does not exists`,
                };
            }
            let amount;
            if (invoice[0].due === invoice[0].total_amount &&
                (invoice[0].ref_type === "visa" || invoice[0].ref_type === "tour")) {
                amount = lib_1.default.getPaymentAmount(Number(invoice[0].due) * 0.2, constants_1.SSL_PERCENTAGE);
            }
            else {
                amount = lib_1.default.getPaymentAmount(invoice[0].due, constants_1.SSL_PERCENTAGE);
            }
            if (invoice[0].ref_type === "flight") {
                const manualBankTransferModel = this.Model.manualBankTransferModel();
                const data = yield manualBankTransferModel.getSingleManualBankTransfer({
                    invoice_id: invoice_id,
                    user_id: req.user.id,
                    status: "pending",
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "A payment associated with this invoice is already pending.",
                    };
                }
            }
            if (isApp) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: {
                        tran_id: `${constants_1.BTOC_PAYMENT_TYPE}-${invoice_id}`,
                    },
                };
            }
            return yield this.subServices.sslPayment({
                total_amount: amount,
                currency: "BDT",
                tran_id: `${constants_1.BTOC_PAYMENT_TYPE}-${invoice_id}`,
                value_a: isApp,
                cus_name: first_name,
                cus_email: email,
                cus_add1: "Dhaka",
                cus_city: "Dhaka",
                cus_country: "Bangladesh",
                cus_phone: phone_number,
                product_name: "st",
            });
        });
    }
    // Create bKash payment
    createBkashPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const model = this.Model.paymentModel(trx);
                    const { invoice_id, amount } = req.body;
                    const { id: userId, phone_number } = req.user;
                    const [invoice] = yield model.singleInvoice({
                        id: invoice_id,
                    });
                    if (!invoice) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invoice not found",
                        };
                    }
                    if (invoice.due <= 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "The invoice is already fully paid.",
                        };
                    }
                    if (invoice.ref_type === "flight") {
                        const manualBankTransferModel = this.Model.manualBankTransferModel();
                        const data = yield manualBankTransferModel.getSingleManualBankTransfer({
                            invoice_id: invoice_id,
                            user_id: req.user.id,
                            status: "pending",
                        });
                        if (data.length) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_CONFLICT,
                                message: "A payment associated with this invoice is already pending.",
                            };
                        }
                    }
                    const baseAmount = amount || invoice.due;
                    const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(baseAmount, constants_1.BKASH_PERCENTAGE, "add").toFixed(2));
                    const paymentBody = {
                        mode: "0011",
                        payerReference: phone_number,
                        callbackURL: constants_1.CALLBACK_URL,
                        merchantAssociationInfo: config_1.default.MERCHANT_ASSOCIATION_INFO,
                        amount: actual_amount.toString(),
                        currency: "BDT",
                        intent: "sale",
                        merchantInvoiceNumber: invoice.invoice_number,
                    };
                    // Get bKash ID token
                    const { data: tokenData } = yield this.common_service.getBkashIdTokenByRefreshToken();
                    console.log('tokenData', tokenData);
                    const idToken = tokenData === null || tokenData === void 0 ? void 0 : tokenData.id_token;
                    if (!idToken)
                        throw new Error("Failed to retrieve bKash ID token.");
                    // Send payment request to bKash
                    const response = yield axios_1.default.post(`${config_1.default.BKASH_BASE_URL}${bkashApiEndpoints_1.CREATE_PAYMENT}`, paymentBody, {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: idToken,
                            "X-App-Key": config_1.default.BKASH_APP_KEY,
                        },
                    });
                    const responseData = response.data;
                    // Check if bKash responded with success
                    if (responseData.statusCode !== "0000") {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `bKash payment initiation failed: ${responseData.statusMessage}`,
                        };
                    }
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: responseData,
                        message: "Payment created successfully.",
                    };
                }
                catch (error) {
                    console.error("Error creating bKash payment:", error);
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: "Failed to create bKash payment.",
                    };
                }
            }));
        });
    }
    //create ssl payment
    createSSLPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const model = this.Model.paymentModel(trx);
                    const { invoice_id } = req.params;
                    const { id: userId, phone_number, first_name, last_name, email } = req.user;
                    const [invoice] = yield model.singleInvoice({
                        id: invoice_id,
                        user_id: userId,
                    });
                    if (!invoice) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "Invoice not found",
                        };
                    }
                    if (Number(invoice.due) <= 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "The invoice is already fully paid.",
                        };
                    }
                    //SSL Service
                    const sslService = new publicSSL_service_1.default();
                    return yield sslService.createSSLSession({
                        total_amount: lib_1.default.getPaymentAmount(invoice.due, constants_1.SSL_PERCENTAGE),
                        currency: 'BDT',
                        tran_id: `b2c ${invoice.invoice_number} ${userId}`,
                        cus_name: `${first_name} ${last_name}`,
                        cus_email: email,
                        cus_add1: 'Dhaka',
                        cus_city: 'Dhaka',
                        cus_country: 'Bangladesh',
                        cus_phone: phone_number,
                        product_name: 'payment',
                        panel: 'b2c',
                    });
                }
                catch (error) {
                    console.error("Error creating payment:", error);
                    throw new customError_1.default("Something went wrong. Please try again later.", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                }
            }));
        });
    }
    //get transaction
    getTransaction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.user;
            const model = this.Model.paymentModel();
            const { limit, skip, booking_id } = req.query;
            const data = yield model.getTransactions(id, limit, skip, booking_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get invoice list
    getInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.user;
            console.log({ id });
            const paymentModel = this.Model.paymentModel();
            const { limit, skip, due } = req.query;
            const data = yield paymentModel.getInvoice({
                userId: id,
                limit,
                skip,
                due,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //single invoice
    singleInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: user_id } = req.user;
            console.log({ user_id });
            const { id: invoice_id } = req.params;
            const paymentModel = this.Model.paymentModel();
            const data = yield paymentModel.singleInvoice({ id: invoice_id, user_id });
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: `Invoice not found`,
                };
            }
            let flight_data = {};
            let visa_data = {};
            let tour_data = {};
            let umrah_data = {};
            //get data if ref type is flight
            if (data[0].ref_type === "flight") {
                const flightModel = this.Model.btocFlightBookingModel();
                const flight_res = yield flightModel.getSingleFlightBooking({
                    id: data[0].ref_id,
                });
                const segment_data = yield flightModel.getFlightSegment(data[0].ref_id);
                // let route: string = "";
                // segment_data.map((elem: any) => {
                //   route += elem.origin.split("-")[2] + " - ";
                // });
                // route += segment_data[segment_data.length - 1].destination.split("-")[2];
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
            //get data if ref type is visa
            else if (data[0].ref_type === "visa") {
                const visaModel = this.Model.VisaModel();
                const visa_res = yield visaModel.b2cSingleApplication(data[0].ref_id);
                visa_data = {
                    country_name: visa_res.country_name,
                    visa_fee: visa_res.visa_fee,
                    processing_fee: visa_res.processing_fee,
                    payable: visa_res.payable,
                    total_passenger: visa_res.traveler,
                };
            }
            //get data if ref type is tour
            else if (data[0].ref_type === "tour") {
                const tourModel = this.Model.tourPackageBookingModel();
                const tour_res = yield tourModel.getSingleBookingInfo(data[0].ref_id);
                // console.log({ tour_res });
                tour_data = {
                    tour_name: tour_res.title,
                    country_name: tour_res.country_name,
                    traveler_adult: tour_res.traveler_adult,
                    traveler_child: tour_res.traveler_child,
                    adult_price: tour_res.adult_price,
                    child_price: tour_res.child_price,
                    discount: tour_res.discount,
                    discount_type: tour_res.discount_type,
                };
            }
            //get data if ref type is umrah
            else if (data[0].ref_type === "umrah") {
                const umrahModel = this.Model.umrahPackageBookinModel();
                const umrah_res = yield umrahModel.getSingleBooking(data[0].ref_id);
                // console.log({ umrah_res });
                umrah_data = {
                    umrah_name: umrah_res.package_name,
                    traveler_adult: umrah_res.traveler_adult,
                    traveler_child: umrah_res.traveler_child,
                    price_per_person: umrah_res.price_per_person,
                    discount: umrah_res.discount,
                    discount_type: umrah_res.discount_type,
                };
            }
            const money_receipt = yield paymentModel.singleMoneyReceipt(invoice_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data[0]), { flight_data,
                    visa_data,
                    tour_data,
                    umrah_data, money_receipt: money_receipt.length ? money_receipt : [] }),
            };
        });
    }
}
exports.BookingPaymentServices = BookingPaymentServices;
