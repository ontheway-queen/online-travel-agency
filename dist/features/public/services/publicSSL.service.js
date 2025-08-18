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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const qs_1 = __importDefault(require("qs"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const BtoCFlightBookingSubService_1 = require("../../b2c/services/subServices/BtoCFlightBookingSubService");
const paymentTemplate_1 = require("../../../utils/templates/paymentTemplate");
class PublicSSLService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    createSSLSession(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const ssl_body = Object.assign(Object.assign({}, payload), { store_id: config_1.default.SSL_STORE_ID, store_passwd: config_1.default.SSL_STORE_PASSWORD, success_url: `${constants_1.SERVER_URL}/payment/${payload.panel}/ssl/success`, fail_url: `${constants_1.SERVER_URL}/payment/${payload.panel}/ssl/failed`, cancel_url: `${constants_1.SERVER_URL}/payment/${payload.panel}/ssl/cancelled`, shipping_method: "no", product_category: "General", product_profile: "General" });
                const response = yield axios_1.default.post(`${config_1.default.SSL_URL}/gwprocess/v4/api.php`, qs_1.default.stringify(ssl_body), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                if (((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.status) === "SUCCESS") {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        redirect_url: response.data.redirectGatewayURL
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: "Something went wrong with SSL payment!"
                    };
                }
            }
            catch (err) {
                console.log('SSL ERROR', err);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: "Something went wrong with SSL payment"
                };
            }
        });
    }
    b2bPaymentSuccess(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const body = req.body;
                console.log({ body });
                // return body
                const tran_id = body.tran_id.split("-");
                console.log({ tran_id });
                if (isNaN(Number(tran_id[1]))) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Invalid agency ID',
                        redirect_url: `${constants_1.BTOB_URL}/payment/top_up?status=failed`,
                    };
                }
                //confirm payment
                const ssl_response = yield axios_1.default.post(`${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`);
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2B SSL Payment Response`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2B',
                    user_id: tran_id[1],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: ssl_response.data,
                    },
                });
                if (!['VALID'].includes((_a = ssl_response === null || ssl_response === void 0 ? void 0 : ssl_response.data) === null || _a === void 0 ? void 0 : _a.status)) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Unverified transaction',
                        redirect_url: `${constants_1.BTOB_URL}/payment/top_up?status=failed`
                    };
                }
                // get single agency
                const agency_model = this.Model.agencyModel(trx);
                const agency = yield agency_model.getSingleAgency(tran_id[1]);
                if (!agency.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Invalid agency ID',
                        redirect_url: `${constants_1.BTOB_URL}/payment/top_up?status=failed`,
                    };
                }
                const actual_amount = Number(ssl_response.data.store_amount);
                // Create Date
                const paymentTime = new Date(ssl_response.data.tran_date.replace(' ', 'T') + 'Z');
                // Accessing the transaction ID
                const transactionId = ssl_response.data.bank_tran_id;
                // Accessing the payment type
                const paymentType = ssl_response.data.card_type;
                //Accessing the card number
                const cardNumber = ssl_response.data.card_no;
                yield agency_model.insertAgencyLedger({
                    agency_id: agency[0].id,
                    type: 'credit',
                    amount: actual_amount,
                    details: `Credit load has been made using SSL payment gateway. Using : ${cardNumber}. Transaction id : ${transactionId}. gateway charge: ${constants_1.SSL_PERCENTAGE}`,
                    topup: true,
                    payment_gateway: 'SSL',
                });
                const redirectParams = new URLSearchParams({
                    amount: ssl_response.data.store_amount,
                    credit_load: actual_amount.toString(),
                    ssl_percentage: constants_1.SSL_PERCENTAGE.toString(),
                    date: paymentTime.toString(),
                    transaction_id: transactionId,
                    payment_type: paymentType,
                }).toString();
                //send mail
                yield lib_1.default.sendEmail([
                    constants_1.PROJECT_EMAIL_ACCOUNT_1
                ], `Top-up of amount ${actual_amount}`, (0, paymentTemplate_1.agentTopUpSuccessTemplate)({
                    agencyName: agency[0].agency_name,
                    amount: actual_amount,
                    gatewayCharge: constants_1.SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    paymentTime: paymentTime.toString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                }));
                yield lib_1.default.sendEmail(agency[0].email, `Top-up of amount ${actual_amount}`, (0, paymentTemplate_1.agentTopUpSuccessTemplate)({
                    agencyName: agency[0].agency_name,
                    amount: actual_amount,
                    gatewayCharge: constants_1.SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    paymentTime: paymentTime.toString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Payment successful',
                    redirect_url: `${constants_1.BTOB_URL}/payment/top_up?status=success`,
                };
            }));
        });
    }
    b2bPaymentFailed(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                console.log({ body });
                const tran_id = body.tran_id.split("-");
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2B SSL Payment Failed`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2B',
                    user_id: tran_id[1],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: req.body,
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Transaction failed',
                    redirect_url: `${constants_1.BTOB_URL}/payment/top_up?status=failed`
                };
            }));
        });
    }
    b2bPaymentCancelled(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                console.log({ body });
                const tran_id = body.tran_id.split("-");
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2B SSL Payment Cancelled`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2B',
                    user_id: tran_id[1],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: req.body,
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Transaction cancelled',
                    redirect_url: `${constants_1.BTOB_URL}/payment/top_up?status=failed`
                };
            }));
        });
    }
    b2cPaymentSuccess(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const body = req.body;
                console.log({ body });
                const tran_id = body.tran_id.split(" ");
                console.log({ tran_id });
                if (!tran_id[1]) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Invalid invoice number',
                        redirect_url: `${constants_1.CLIENT_URL}/payment-failed`,
                    };
                }
                //confirm payment
                const ssl_response = yield axios_1.default.post(`${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`);
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2C SSL Payment Response`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2C',
                    user_id: tran_id[2],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: ssl_response.data,
                    },
                });
                if (!['VALID'].includes((_a = ssl_response === null || ssl_response === void 0 ? void 0 : ssl_response.data) === null || _a === void 0 ? void 0 : _a.status)) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Unverified transaction',
                        redirect_url: `${constants_1.CLIENT_URL}/payment-failed`
                    };
                }
                const paymentModel = this.Model.paymentModel(trx);
                const invoice = yield paymentModel.getSingleInvoiceByInvoiceNumber(tran_id[1]);
                console.log({ invoice });
                if (!invoice.length) {
                    yield this.Model.errorLogsModel().insert({
                        level: constants_1.ERROR_LEVEL_INFO,
                        message: `B2C SSL Payment Response`,
                        url: ``,
                        http_method: 'POST',
                        source: 'B2C',
                        user_id: tran_id[2],
                        metadata: {
                            api: 'SSL',
                            endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                            payload: tran_id,
                            response: ssl_response.data,
                        },
                    });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No invoice has been found with this id',
                        redirect_url: `${constants_1.CLIENT_URL}/paymentFail`,
                    };
                }
                // check if Reference ID already validated or not
                if (invoice.length && Number((_b = invoice[0]) === null || _b === void 0 ? void 0 : _b.due) <= 0) {
                    yield this.Model.errorLogsModel().insert({
                        level: constants_1.ERROR_LEVEL_INFO,
                        message: `B2C SSL Payment Response`,
                        url: ``,
                        http_method: 'POST',
                        source: 'B2C',
                        user_id: tran_id[2],
                        metadata: {
                            api: 'SSL',
                            endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                            payload: tran_id,
                            response: ssl_response.data,
                        },
                    });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Reference ID already validated',
                        redirect_url: `${constants_1.CLIENT_URL}/paymentFail`,
                    };
                }
                const actual_amount = Number(ssl_response.data.store_amount);
                // Create Date
                const paymentTime = new Date(ssl_response.data.tran_date.replace(' ', 'T') + 'Z');
                // Accessing the transaction ID
                const transactionId = ssl_response.data.bank_tran_id;
                // Accessing the payment type
                const paymentType = ssl_response.data.card_type;
                //Accessing the card number
                const cardNumber = ssl_response.data.card_no;
                const remainDue = Math.max(Number(invoice[0].due) - actual_amount, 0);
                yield paymentModel.updateInvoice({ due: remainDue }, invoice[0].id);
                // Create money receipt
                yield paymentModel.createMoneyReceipt({
                    invoice_id: invoice[0].id,
                    amount: actual_amount,
                    payment_time: paymentTime.toISOString(),
                    transaction_id: transactionId,
                    payment_type: paymentType,
                    details: 'Payment has been made using SSL payment gateway.',
                    payment_by: cardNumber,
                    payment_gateway: 'SSL',
                });
                let emailTitle = `Payment has been done for invoice ${invoice[0].invoice_number} | B2C`;
                let details = '';
                if (invoice[0].ref_type === constants_1.INVOICE_TYPE_FLIGHT) {
                    yield new BtoCFlightBookingSubService_1.BtoCFlightBookingSubService(trx).ticketIssueSubService(invoice[0].ref_id);
                    //update convenience fee
                    yield this.Model.btocFlightBookingModel(trx).updateBooking({ convenience_fee: Number(ssl_response.data.amount) - actual_amount }, invoice[0].ref_id);
                    const flightModel = this.Model.btocFlightBookingModel(trx);
                    const flight = yield flightModel.getSingleFlightBooking({ id: invoice[0].ref_id });
                    emailTitle = `Payment has been done for invoice ${invoice[0].invoice_number} | Booking ID : ${flight[0].booking_ref} | PNR : ${flight[0].pnr_code} | B2C`;
                    details = `Type: Flight <br> Booking ID: ${flight[0].booking_ref} <br> PNR: ${flight[0].airline_pnr}`;
                }
                else if (invoice[0].ref_type === constants_1.INVOICE_TYPE_TOUR) {
                    const tourModel = this.Model.tourPackageBookingModel(trx);
                    yield tourModel.updateSingleBooking(invoice[0].ref_id, {
                        status: constants_1.BOOKING_STATUS.BOOKED,
                    });
                    const getSingleBooking = yield tourModel.getSingleBookingInfo(invoice[0].ref_id);
                    details = `Type: Tour <br> Booking ID: ${getSingleBooking[0].ref_id}`;
                }
                else if (invoice[0].ref_type === constants_1.INVOICE_TYPE_UMRAH) {
                    const umrahModel = this.Model.umrahPackageBookinModel(trx);
                    yield umrahModel.updateSingleBooking(invoice[0].ref_id, {
                        status: constants_1.BOOKING_STATUS.BOOKED,
                    });
                    const getSingleBooking = yield umrahModel.getSingleBooking(invoice[0].ref_id);
                    details = `Type: Umrah <br> Booking ID: ${getSingleBooking[0].ref_id}`;
                }
                else if (invoice[0].ref_type === constants_1.INVOICE_TYPE_VISA) {
                    const visaModel = this.Model.VisaModel(trx);
                    yield visaModel.b2cUpdateApplication(constants_1.BOOKING_STATUS.BOOKED, invoice[0].ref_id);
                    const getSingleApplication = yield visaModel.b2cSingleApplication(invoice[0].ref_id);
                    details = `Type: Visa <br> Application ID: ${getSingleApplication[0].id}`;
                }
                const redirectParams = new URLSearchParams({
                    amount: ssl_response.data.amount.toString(),
                    actual_amount: actual_amount.toString(),
                    ssl_percentage: constants_1.SSL_PERCENTAGE.toString(),
                    payment_time: paymentTime.toISOString(),
                    transaction_id: transactionId,
                    payment_type: paymentType,
                    invoice_number: invoice[0].invoice_number.toString(),
                    invoice_id: invoice[0].id,
                }).toString();
                //send mail
                yield lib_1.default.sendEmail([
                    constants_1.PROJECT_EMAIL_ACCOUNT_1
                ], emailTitle, (0, paymentTemplate_1.paymentSuccessTemplate)({
                    name: invoice[0].first_name + ' ' + invoice[0].last_name,
                    amount: actual_amount,
                    gatewayCharge: constants_1.SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    invoiceId: invoice[0].invoice_number,
                    paymentTime: paymentTime.toISOString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                    email: invoice[0].email,
                    phone_number: invoice[0].phone_number,
                    details
                }));
                yield lib_1.default.sendEmail(invoice[0].email, `Payment has been done for invoice ${invoice[0].invoice_number}`, (0, paymentTemplate_1.paymentSuccessTemplate)({
                    name: invoice[0].first_name + ' ' + invoice[0].last_name,
                    amount: actual_amount,
                    gatewayCharge: constants_1.SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    invoiceId: invoice[0].invoice_number,
                    paymentTime: paymentTime.toISOString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                    email: invoice[0].email,
                    phone_number: invoice[0].phone_number,
                    details
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Payment successful',
                    redirect_url: `${constants_1.CLIENT_URL}/paymentSuccess?${redirectParams}`,
                };
            }));
        });
    }
    b2cPaymentFailed(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                console.log({ body });
                const tran_id = body.tran_id.split("-");
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2C SSL Payment Failed`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2C',
                    user_id: tran_id[2],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: req.body,
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Transaction failed',
                    redirect_url: `${constants_1.CLIENT_URL}/paymentFail`
                };
            }));
        });
    }
    b2cPaymentCancelled(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                console.log({ body });
                const tran_id = body.tran_id.split("-");
                yield this.Model.errorLogsModel().insert({
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: `B2C SSL Payment Cancelled`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2C',
                    user_id: tran_id[1],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: req.body,
                    },
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Transaction cancelled',
                    redirect_url: `${constants_1.CLIENT_URL}/paymentCancel`
                };
            }));
        });
    }
}
exports.default = PublicSSLService;
