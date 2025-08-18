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
const bkashApiEndpoints_1 = require("../../../utils/miscellaneous/bkashApiEndpoints");
const redis_1 = require("../../../app/redis");
const constants_1 = require("../../../utils/miscellaneous/constants");
const qs_1 = __importDefault(require("qs"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const BtoCFlightBookingSubService_1 = require("../../b2c/services/subServices/BtoCFlightBookingSubService");
const paymentTemplate_1 = require("../../../utils/templates/paymentTemplate");
class PublicCommonBkashService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    // Get bkash grand token
    getBkashToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_BASE_URL, BKASH_USERNAME, BKASH_PASSWORD } = config_1.default;
                const payload = {
                    app_key: BKASH_APP_KEY,
                    app_secret: BKASH_APP_SECRET,
                };
                const response = yield axios_1.default.post(`${BKASH_BASE_URL}${bkashApiEndpoints_1.GRAND_TOKEN}`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        username: BKASH_USERNAME,
                        password: BKASH_PASSWORD,
                    },
                    maxBodyLength: Infinity,
                });
                const { refresh_token } = response.data;
                const authModel = this.Model.commonModel();
                yield authModel.updateEnv('bkash_refresh_token', refresh_token);
            }
            catch (error) {
                console.error('Error fetching bKash token:', error);
            }
        });
    }
    // Get bKash ID token using refresh token
    getBkashIdTokenByRefreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'bkash_id_token';
            const cachedToken = yield (0, redis_1.getRedis)(cacheKey);
            const model = this.Model.commonModel();
            if (cachedToken) {
                console.log('Using cached bKash ID token:', cachedToken);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { id_token: cachedToken },
                };
            }
            const refresh_token = yield model.getEnv('bkash_refresh_token');
            try {
                const { BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_BASE_URL, BKASH_USERNAME, BKASH_PASSWORD } = config_1.default;
                const payload = {
                    app_key: BKASH_APP_KEY,
                    app_secret: BKASH_APP_SECRET,
                    refresh_token,
                };
                const response = yield axios_1.default.post(`${BKASH_BASE_URL}${bkashApiEndpoints_1.REFRESH_TOKEN}`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        username: BKASH_USERNAME,
                        password: BKASH_PASSWORD,
                    },
                    maxBodyLength: Infinity,
                });
                const { id_token } = response.data;
                // Cache token for 1 hour
                yield (0, redis_1.setRedis)(cacheKey, id_token, 3600);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { id_token },
                };
            }
            catch (error) {
                console.error('Error fetching bKash ID token:', error);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: 'Something went wrong while fetching bKash ID token.',
                };
            }
        });
    }
    // Execute bKash payment API
    executeBkashPaymentApi(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_token, paymentID } = params;
                const response = yield axios_1.default.post(`${config_1.default.BKASH_BASE_URL}${bkashApiEndpoints_1.EXECUTE_PAYMENT}`, { paymentID }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: id_token,
                        'X-App-Key': config_1.default.BKASH_APP_KEY,
                    },
                    maxBodyLength: Infinity,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: response.data,
                };
            }
            catch (error) {
                console.error('Error executing bKash payment:', error);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: 'Something went wrong while executing bKash payment.',
                };
            }
        });
    }
    // Query bKash payment API
    BkashQueryPaymentApi(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_token, paymentID } = params;
                const response = yield axios_1.default.post(`${config_1.default.BKASH_BASE_URL}${bkashApiEndpoints_1.QUERY_PAYMENT}`, { paymentID }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: id_token,
                        'X-App-Key': config_1.default.BKASH_APP_KEY,
                    },
                    maxBodyLength: Infinity,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: response.data,
                };
            }
            catch (error) {
                console.error('Error querying bKash payment:', error);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: 'Something went wrong while querying bKash payment.',
                };
            }
        });
    }
    B2cBkashCallbackUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { paymentID, status } = req.query;
                const invoiceModel = this.Model.paymentModel(trx);
                if (!paymentID || !status) {
                    throw new Error('Invalid query parameters.');
                }
                if (status === 'success') {
                    const { data: tokenData } = yield this.getBkashIdTokenByRefreshToken();
                    const idToken = tokenData === null || tokenData === void 0 ? void 0 : tokenData.id_token;
                    if (!idToken)
                        throw new Error('Failed to retrieve bKash ID token.');
                    const { data: executePayment } = yield this.executeBkashPaymentApi({
                        id_token: idToken,
                        paymentID: paymentID,
                    });
                    const handleSuccessPayment = (paymentResponse) => __awaiter(this, void 0, void 0, function* () {
                        const invoiceNumber = paymentResponse.merchantInvoiceNumber;
                        const [checkInvoice] = yield invoiceModel.singleInvoice({
                            invoice_number: invoiceNumber,
                        });
                        console.log({ checkInvoice });
                        //get actual amount by deducting the BKASH percentage from the total paid amount
                        const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(paymentResponse.amount, constants_1.BKASH_PERCENTAGE, 'subtract').toFixed(2));
                        const remainDue = Math.max(Number(checkInvoice.due) - actual_amount, 0);
                        yield invoiceModel.updateInvoice({ due: remainDue }, checkInvoice.id);
                        let details = '';
                        let emailTitle = `Payment has been done for invoice ${checkInvoice.invoice_number} | B2C`;
                        if ((checkInvoice === null || checkInvoice === void 0 ? void 0 : checkInvoice.ref_type) === constants_1.INVOICE_TYPE_FLIGHT) {
                            yield new BtoCFlightBookingSubService_1.BtoCFlightBookingSubService(trx).ticketIssueSubService(checkInvoice.ref_id);
                            //update convenience fee
                            yield this.Model.btocFlightBookingModel(trx).updateBooking({ convenience_fee: (Number(paymentResponse.amount) * constants_1.BKASH_PERCENTAGE) / 100 }, checkInvoice.ref_id);
                            const flightModel = this.Model.btocFlightBookingModel(trx);
                            const flight = yield flightModel.getSingleFlightBooking({ id: checkInvoice.ref_id });
                            emailTitle = `Payment has been done for invoice ${checkInvoice.invoice_number} | Booking ID : ${flight[0].booking_ref} | PNR : ${flight[0].pnr_code} | B2C`;
                            details = `Type: Flight <br> Booking ID: ${flight[0].booking_ref} <br> PNR: ${flight[0].airline_pnr}`;
                        }
                        else if ((checkInvoice === null || checkInvoice === void 0 ? void 0 : checkInvoice.ref_type) === constants_1.INVOICE_TYPE_TOUR) {
                            const tourModel = this.Model.tourPackageBookingModel(trx);
                            yield tourModel.updateSingleBooking(checkInvoice.ref_id, {
                                status: constants_1.BOOKING_STATUS.BOOKED,
                            });
                            const getSingleBooking = yield tourModel.getSingleBookingInfo(checkInvoice.ref_id);
                            details = `Type: Tour <br> Booking ID: ${getSingleBooking[0].ref_id}`;
                        }
                        else if ((checkInvoice === null || checkInvoice === void 0 ? void 0 : checkInvoice.ref_type) === constants_1.INVOICE_TYPE_UMRAH) {
                            const umrahModel = this.Model.umrahPackageBookinModel(trx);
                            yield umrahModel.updateSingleBooking(checkInvoice.ref_id, {
                                status: constants_1.BOOKING_STATUS.BOOKED,
                            });
                            const getSingleBooking = yield umrahModel.getSingleBooking(checkInvoice.ref_id);
                            details = `Type: Umrah <br> Booking ID: ${getSingleBooking[0].ref_id}`;
                        }
                        else if ((checkInvoice === null || checkInvoice === void 0 ? void 0 : checkInvoice.ref_type) === constants_1.INVOICE_TYPE_VISA) {
                            const visaModel = this.Model.VisaModel(trx);
                            yield visaModel.b2cUpdateApplication(constants_1.BOOKING_STATUS.BOOKED, checkInvoice.ref_id);
                            const getSingleApplication = yield visaModel.b2cSingleApplication(checkInvoice.ref_id);
                            details = `Type: Visa <br> Application ID: ${getSingleApplication[0].id}`;
                        }
                        console.log("paymentResponse", paymentResponse);
                        yield invoiceModel.createMoneyReceipt({
                            invoice_id: checkInvoice.id,
                            amount: actual_amount,
                            payment_time: paymentResponse.paymentExecuteTime,
                            transaction_id: paymentResponse.trxID,
                            payment_type: 'Bkash',
                            details: 'Payment has been made using bKash',
                            payment_id: paymentResponse.paymentID,
                            payment_by: paymentResponse.payerAccount,
                            payment_gateway: 'Bkash',
                        });
                        //send mail
                        yield lib_1.default.sendEmail([
                            constants_1.PROJECT_EMAIL_ACCOUNT_1
                        ], emailTitle, (0, paymentTemplate_1.paymentSuccessTemplate)({
                            name: checkInvoice.first_name + ' ' + checkInvoice.last_name,
                            amount: actual_amount,
                            gatewayCharge: constants_1.BKASH_PERCENTAGE,
                            paymentMethod: 'BKASH',
                            invoiceId: checkInvoice.invoice_number,
                            paymentTime: paymentResponse.paymentExecuteTime,
                            transactionId: paymentResponse.trxID,
                            paymentType: 'Bkash',
                            paymentUsing: paymentResponse.payerAccount,
                            email: checkInvoice.email,
                            phone_number: checkInvoice.phone_number,
                            details
                        }));
                        yield lib_1.default.sendEmail(checkInvoice.email, `Payment has been done for invoice ${checkInvoice.invoice_number}`, (0, paymentTemplate_1.paymentSuccessTemplate)({
                            name: checkInvoice.first_name + ' ' + checkInvoice.last_name,
                            amount: actual_amount,
                            gatewayCharge: constants_1.BKASH_PERCENTAGE,
                            paymentMethod: 'BKASH',
                            invoiceId: checkInvoice.invoice_number,
                            paymentTime: paymentResponse.paymentExecuteTime,
                            transactionId: paymentResponse.trxID,
                            paymentType: 'Bkash',
                            paymentUsing: paymentResponse.payerAccount,
                            email: checkInvoice.email,
                            phone_number: checkInvoice.phone_number,
                            details
                        }));
                        const queryString = qs_1.default.stringify(Object.assign(Object.assign({}, paymentResponse), { actual_amount, gateway_charge_percentage: constants_1.BKASH_PERCENTAGE, invoice_id: checkInvoice.id }));
                        return res.redirect(`${constants_1.BKASH_SUCCESS_PAGE}?${queryString}`);
                    });
                    if (executePayment && executePayment.statusCode === '0000') {
                        return yield handleSuccessPayment(executePayment);
                    }
                    const { data: queryPaymentData } = yield this.BkashQueryPaymentApi({
                        id_token: idToken,
                        paymentID: paymentID,
                    });
                    if ((queryPaymentData === null || queryPaymentData === void 0 ? void 0 : queryPaymentData.statusCode) === '0000') {
                        return yield handleSuccessPayment(queryPaymentData);
                    }
                    else {
                        const queryString = qs_1.default.stringify(queryPaymentData);
                        return res.redirect(`${constants_1.BKASH_FAILED_PAGE}?${queryString}`);
                    }
                }
                else if (status === 'cancel') {
                    return res.redirect(constants_1.BKASH_CANCEL_PAGE);
                }
                else if (status === 'failure') {
                    return res.redirect(constants_1.BKASH_FAILED_PAGE);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    // b2b bkash callback url
    B2bBkashCallbackUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { paymentID, status } = req.query;
                const agency_model = this.Model.agencyModel(trx);
                if (!paymentID || !status) {
                    throw new Error('Invalid query parameters.');
                }
                if (status === 'success') {
                    // get bkash grand token
                    const { data: token_Data } = yield this.getBkashIdTokenByRefreshToken();
                    if (!(token_Data === null || token_Data === void 0 ? void 0 : token_Data.id_token)) {
                        throw new Error('Failed to retrieve bKash ID token.');
                    }
                    const { data: executePayment } = yield this.executeBkashPaymentApi({
                        id_token: token_Data.id_token,
                        paymentID: paymentID,
                    });
                    if (executePayment) {
                        const redirectData = Object.assign({}, executePayment);
                        if ((executePayment === null || executePayment === void 0 ? void 0 : executePayment.statusCode) === '0000') {
                            const tran_id = (_a = executePayment === null || executePayment === void 0 ? void 0 : executePayment.merchantInvoiceNumber) === null || _a === void 0 ? void 0 : _a.split('-');
                            const agency = yield agency_model.getSingleAgency(tran_id[1]);
                            if (!agency.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_NOT_FOUND,
                                    message: 'Invalid agency ID',
                                };
                            }
                            //get actual amount by deducting the BKASH percentage from the total paid amount
                            const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(executePayment.amount, constants_1.BKASH_PERCENTAGE, 'subtract').toFixed(2));
                            yield agency_model.insertAgencyLedger({
                                agency_id: tran_id[1],
                                type: 'credit',
                                amount: actual_amount,
                                created_by: tran_id[2],
                                details: `Amount has been credited using Bkash, PAYMENT ID: ${executePayment.paymentID}. Transaction ID: ${executePayment.trxID}. Bkash Number: ${executePayment.payerAccount}. Gateway charge: ${constants_1.BKASH_PERCENTAGE}`,
                                payment_gateway: 'Bkash',
                                topup: true,
                            });
                            //send mail
                            yield lib_1.default.sendEmail([
                                constants_1.PROJECT_EMAIL_ACCOUNT_1
                            ], `Top-up of amount ${actual_amount}`, (0, paymentTemplate_1.agentTopUpSuccessTemplate)({
                                agencyName: agency[0].agency_name,
                                amount: actual_amount,
                                gatewayCharge: constants_1.BKASH_PERCENTAGE,
                                paymentMethod: 'BKASH',
                                paymentTime: executePayment.paymentExecuteTime,
                                transactionId: executePayment.trxID,
                                paymentType: 'Bkash',
                                paymentUsing: executePayment.payerAccount,
                            }));
                            yield lib_1.default.sendEmail(agency[0].email, `Top-up of amount ${actual_amount}`, (0, paymentTemplate_1.agentTopUpSuccessTemplate)({
                                agencyName: agency[0].agency_name,
                                amount: actual_amount,
                                gatewayCharge: constants_1.BKASH_PERCENTAGE,
                                paymentMethod: 'BKASH',
                                paymentTime: executePayment.paymentExecuteTime,
                                transactionId: executePayment.trxID,
                                paymentType: 'Bkash',
                                paymentUsing: executePayment.payerAccount,
                            }));
                            return res.redirect(`${constants_1.AGENT_RECHARGE_PAGE}?amount=${executePayment.amount}&actual_amount=${actual_amount}&gateway_charge_percentage=${constants_1.BKASH_PERCENTAGE}&status=${status}$paymentExecuteTime=${executePayment.paymentExecuteTime}&statusMessage=${encodeURIComponent(executePayment.statusMessage)}`);
                        }
                        else {
                            return res.redirect(`${constants_1.AGENT_RECHARGE_PAGE}?status=${status}&statusMessage=${encodeURIComponent(executePayment.errorsMessage)}`);
                        }
                    }
                    else {
                        const { data: query_payment_data } = yield this.BkashQueryPaymentApi({
                            id_token: token_Data.id_token,
                            paymentID: paymentID,
                        });
                        if ((query_payment_data === null || query_payment_data === void 0 ? void 0 : query_payment_data.statusCode) === '0000') {
                            const tran_id = (_b = query_payment_data === null || query_payment_data === void 0 ? void 0 : query_payment_data.merchantInvoiceNumber) === null || _b === void 0 ? void 0 : _b.split('-');
                            const agency = yield agency_model.getSingleAgency(tran_id[1]);
                            if (!agency.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_NOT_FOUND,
                                    message: 'Invalid agency ID',
                                };
                            }
                            //get actual amount by deducting the BKASH percentage from the total paid amount
                            const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(query_payment_data.amount, constants_1.BKASH_PERCENTAGE, 'subtract').toFixed(2));
                            yield agency_model.insertAgencyLedger({
                                agency_id: tran_id[1],
                                type: 'credit',
                                amount: actual_amount,
                                created_by: tran_id[2],
                                details: `Amount has been credited using Bkash, PAYMENT ID: ${query_payment_data.paymentID}. Transaction ID: ${query_payment_data.trxID}. Bkash Number: ${query_payment_data.payerAccount}. Gateway charge: ${constants_1.BKASH_PERCENTAGE}`,
                                topup: true,
                                payment_gateway: 'Bkash'
                            });
                            //send mail
                            yield lib_1.default.sendEmail([
                                constants_1.PROJECT_EMAIL_ACCOUNT_1
                            ], `Top-up of amount ${actual_amount}`, (0, paymentTemplate_1.agentTopUpSuccessTemplate)({
                                agencyName: agency[0].agency_name,
                                amount: actual_amount,
                                gatewayCharge: constants_1.BKASH_PERCENTAGE,
                                paymentMethod: 'BKASH',
                                paymentTime: query_payment_data.paymentExecuteTime,
                                transactionId: query_payment_data.trxID,
                                paymentType: 'Bkash',
                                paymentUsing: query_payment_data.payerAccount,
                            }));
                            yield lib_1.default.sendEmail(agency[0].email, `Top-up of amount ${actual_amount}`, (0, paymentTemplate_1.agentTopUpSuccessTemplate)({
                                agencyName: agency[0].agency_name,
                                amount: actual_amount,
                                gatewayCharge: constants_1.BKASH_PERCENTAGE,
                                paymentMethod: 'BKASH',
                                paymentTime: query_payment_data.paymentExecuteTime,
                                transactionId: query_payment_data.trxID,
                                paymentType: 'Bkash',
                                paymentUsing: query_payment_data.payerAccount,
                            }));
                            return res.redirect(`${constants_1.AGENT_RECHARGE_PAGE}?amount=${query_payment_data.amount}&actual_amount=${actual_amount}&gateway_charge_percentage=${constants_1.BKASH_PERCENTAGE}status=${status}$paymentExecuteTime=${query_payment_data.paymentExecuteTime}&statusMessage=${encodeURIComponent(query_payment_data.statusMessage)}`);
                        }
                        else {
                            console.log('error', query_payment_data);
                            return res.redirect(`${constants_1.AGENT_RECHARGE_PAGE}?&status=${status}&statusMessage=${encodeURIComponent(query_payment_data.errorMessage)}`);
                        }
                    }
                }
                else if (status === 'cancel') {
                    return res.redirect(`${constants_1.AGENT_RECHARGE_PAGE}?status=${status}&statusMessage=${encodeURIComponent('The payment has been canceled.')}`);
                }
                else if (status === 'failure') {
                    return res.redirect(`${constants_1.AGENT_RECHARGE_PAGE}?status=${status}&statusMessage=${encodeURIComponent('The payment has failed.')}`);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = PublicCommonBkashService;
