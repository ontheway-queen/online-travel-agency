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
const invoiceTemplate_1 = require("../../../utils/templates/invoiceTemplate");
const loanTemplate_1 = require("../../../utils/templates/loanTemplate");
const config_1 = __importDefault(require("../../../config/config"));
const publicBkash_service_1 = __importDefault(require("../../public/services/publicBkash.service"));
const axios_1 = __importDefault(require("axios"));
const bkashApiEndpoints_1 = require("../../../utils/miscellaneous/bkashApiEndpoints");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const publicSSL_service_1 = __importDefault(require("../../public/services/publicSSL.service"));
class BookingPaymentServices extends abstract_service_1.default {
    constructor() {
        super(...arguments);
        this.subServices = new payment_service_1.BookingPaymentService();
        this.bkashPaymentService = new publicBkash_service_1.default();
    }
    //create payment
    CreateB2bBkashPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { id, name, email, mobile_number, agency_id } = req.agency;
                    const { amount } = req.body;
                    if (!amount) {
                        throw new customError_1.default("Give an amount to continue", this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                    // Prepare payment request body
                    const paymentBody = {
                        mode: "0011",
                        payerReference: mobile_number,
                        callbackURL: constants_1.B2b_CALLBACK_URL,
                        merchantAssociationInfo: config_1.default.MERCHANT_ASSOCIATION_INFO,
                        amount: amount.toString(),
                        currency: "BDT",
                        intent: "sale",
                        merchantInvoiceNumber: `${constants_1.CREDIT_LOAD}-${agency_id}-${id}`,
                    };
                    // Retrieve authorization token for bKash
                    const { data: token_Data } = yield this.bkashPaymentService.getBkashIdTokenByRefreshToken();
                    if (!(token_Data === null || token_Data === void 0 ? void 0 : token_Data.id_token)) {
                        throw new Error("Failed to retrieve bKash ID token.");
                    }
                    const axiosConfig = {
                        method: "POST",
                        url: `${config_1.default.BKASH_BASE_URL}${bkashApiEndpoints_1.CREATE_PAYMENT}`,
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: token_Data.id_token,
                            "X-App-Key": config_1.default.BKASH_APP_KEY,
                        },
                        data: JSON.stringify(paymentBody),
                    };
                    // Send payment request to bKash
                    const response = yield axios_1.default.request(axiosConfig);
                    // Check response and return formatted data
                    const { data } = response;
                    if (data.statusCode !== "0000") {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: `bKash payment initiation failed: ${data.statusMessage}`,
                        };
                    }
                    // Success: Return response data with success status
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data,
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
    createSSLPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, agency_name, email, mobile_number } = req.agency;
                const sslService = new publicSSL_service_1.default();
                const { amount } = req.body;
                return yield sslService.createSSLSession({
                    total_amount: lib_1.default.getPaymentAmount(amount, constants_1.SSL_PERCENTAGE),
                    currency: 'BDT',
                    tran_id: `agency-${agency_id}`,
                    cus_name: agency_name,
                    cus_email: email,
                    cus_add1: 'Dhaka',
                    cus_city: 'Dhaka',
                    cus_country: 'Bangladesh',
                    cus_phone: mobile_number,
                    product_name: 'top-up',
                    panel: 'b2b',
                });
            }));
        });
    }
    //get transaction
    getTransaction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.agencyModel();
            const { limit, skip, from_date, to_date, type } = req.query;
            const data = yield model.getAgencyTransactions({
                agency_id,
                start_date: from_date,
                end_date: to_date,
                limit: parseInt(limit),
                skip: parseInt(skip),
                type: type,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get invoice
    getInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.btobPaymentModel();
            const query = req.query;
            query.agency_id = agency_id.toString();
            const data = yield model.getInvoice(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single invoice
    getSingleInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.btobPaymentModel();
            const { id: invoice_id } = req.params;
            const data = yield model.singleInvoice(Number(invoice_id), agency_id);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "the invoice not found",
                };
            }
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
    //clear invoice due
    clearInvoiceDue(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, id: user_id, email: user_email } = req.agency;
                const paymentModel = this.Model.btobPaymentModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const { id: invoice_id } = req.params;
                const checkInvoice = yield paymentModel.singleInvoice(Number(invoice_id), agency_id);
                if (!checkInvoice.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const due = Number(checkInvoice[0].due);
                if (due <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "No due has been found with this invoice",
                    };
                }
                //check balance
                const agencyBalance = yield agencyModel.getTotalBalance(agency_id);
                if (Number(agencyBalance) < due) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "There is insufficient balance in your account",
                    };
                }
                //debit amount from the agency
                yield agencyModel.insertAgencyLedger({
                    agency_id: agency_id,
                    type: "debit",
                    amount: due,
                    details: `Due has been cleared for invoice id ${checkInvoice[0].invoice_number}`,
                });
                //clear due
                yield paymentModel.updateInvoice({ due: 0 }, Number(invoice_id));
                //create money receipt
                yield paymentModel.createMoneyReceipt({
                    amount: due,
                    invoice_id: Number(invoice_id),
                    details: `due has been cleared for invoice ${checkInvoice[0].invoice_number}`,
                    user_id: user_id,
                });
                // send email notification
                yield Promise.all([
                    lib_1.default.sendEmail([
                        constants_1.PROJECT_EMAIL_ACCOUNT_1,
                    ], `Invoice due of BDT ${due} has been cleared for ${checkInvoice[0].agency_name}`, (0, invoiceTemplate_1.template_onInvoiceDueClear_send_to_admin)({
                        title: "Invoice Due Cleared",
                        amount: due,
                        clearanceTime: new Date().toLocaleString(),
                        remarks: `Due has been cleared for invoice ${checkInvoice[0].invoice_number}`,
                        agency_name: checkInvoice[0].agency_name,
                    })),
                    lib_1.default.sendEmail(user_email, `Your invoice due of BDT ${due} has been cleared`, (0, invoiceTemplate_1.template_onInvoiceDueClear_send_to_agent)({
                        title: "Invoice Due Cleared",
                        amount: due,
                        clearanceTime: new Date().toLocaleString(),
                        remarks: `Due has been cleared for invoice ${checkInvoice[0].invoice_number}`,
                        agency_name: checkInvoice[0].agency_name,
                    })),
                ]);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Due has been cleared for this invoice",
                };
            }));
        });
    }
    // b2b partial payment list
    getPartialPaymentList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.btobPaymentModel();
            const { agency_id } = req.agency;
            const query = req.query;
            const { data, total } = yield model.getPartialPaymentInvoiceList(Object.assign(Object.assign({}, query), { agency_id }));
            const { total_due } = yield model.getPartialPaymentTotalDue(Object.assign(Object.assign({}, query), { agency_id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total,
                data,
                total_due,
            };
        });
    }
    // partial payment due
    getPartialPaymentTotalDue(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.btobPaymentModel();
            const { agency_id } = req.agency;
            const query = req.query;
            const { total_due } = yield model.getPartialPaymentTotalDue(Object.assign(Object.assign({}, query), { agency_id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: {
                    total_due,
                },
            };
        });
    }
    //clear loan
    clearLoan(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const { agency_id } = req.agency;
                const model = this.Model.AgencyLoanModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const getAgency = yield agencyModel.getSingleAgency(agency_id);
                if (getAgency[0].loan < body.amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Loan amount exceeds agency's current loan.",
                    };
                }
                //check balance
                const currentBalance = yield agencyModel.getTotalBalance(agency_id);
                if (currentBalance < body.amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Insufficient balance to adjust the loan.",
                    };
                }
                //update loan data
                yield agencyModel.updateAgency({
                    loan: Number(getAgency[0].loan) - Number(body.amount),
                }, agency_id);
                // Insert loan adjustment data
                yield model.insertAgencyLoan({
                    agency_id: agency_id,
                    amount: body.amount,
                    type: constants_1.LOAN_TYPE.repayment,
                    details: "Loan has been paid by the agency",
                    date: new Date(),
                });
                //insert balance
                yield agencyModel.insertAgencyLedger({
                    agency_id: agency_id,
                    amount: body.amount,
                    type: "debit",
                    details: "Loan repayment by the agency",
                });
                // send email notification
                yield Promise.all([
                    lib_1.default.sendEmail(getAgency[0].email, `Loan of BDT ${body.amount} has been adjusted from your agency`, (0, loanTemplate_1.template_onLoanRepayment_send_to_agency)({
                        title: "Loan Repayment",
                        amount: body.amount,
                        repaymentDate: new Date().toLocaleString(),
                        remarks: body.details,
                        agency_name: getAgency[0].agency_name,
                        logo: `${constants_1.PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
                    })),
                    lib_1.default.sendEmail([
                        constants_1.PROJECT_EMAIL_ACCOUNT_1,
                    ], `Loan of BDT ${body.amount} has been adjusted from agency ${getAgency[0].agency_name}`, (0, loanTemplate_1.template_onLoanRepayment_send_to_admin)({
                        title: "Loan Repayment",
                        amount: body.amount,
                        repaymentDate: new Date().toLocaleString(),
                        remarks: body.details,
                        agency_name: getAgency[0].agency_name,
                        logo: `${constants_1.PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
                    })),
                ]);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Loan adjusted successfully.",
                };
            }));
        });
    }
    //create deposit order by brac gateway
    createDepositOrderByBracGateway(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const getLastAgencyTransaction = yield this.Model.agencyModel().getLastAgencyTransaction();
            const ref_id = `${lib_1.default.generateAlphaNumericCode(9)}${parseInt(getLastAgencyTransaction.id) + 1}`;
            console.log({ ref_id });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    ref_id,
                    agency_id: req.agency.agency_id,
                },
            };
        });
    }
    //================================== LOAN REQUEST =========================================
    //create loan request
    createLoanRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, id: user_id, agency_name, agency_logo } = req.agency;
                const model = this.Model.AgencyLoanModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const check_pending_loan = yield model.getLoanRequest({
                    agency_id,
                    status: "Pending",
                });
                if (check_pending_loan.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "There is already a pending loan request. Contact the support team to know more info",
                    };
                }
                const agency = yield agencyModel.getSingleAgency(agency_id);
                const body = req.body;
                body.agency_id = agency_id;
                body.created_by = user_id;
                yield model.createLoanRequest(body);
                const logoUrl = `${constants_1.PROJECT_IMAGE_URL}/${agency[0].agency_logo}`;
                const formattedDate = new Date().toLocaleString();
                yield lib_1.default.sendEmail([
                    constants_1.PROJECT_EMAIL_ACCOUNT_1
                ], `Loan Request of BDT ${body.amount} submitted by - ${agency_name}`, (0, loanTemplate_1.template_onLoanRequest_send_to_admin)({
                    title: "Loan Request",
                    amount: body.amount,
                    date: formattedDate,
                    remarks: `'${agency_name}' has submitted a loan request for BDT ${body.amount}`,
                    agency_name: agency_name,
                    logo: logoUrl,
                    admin_url: constants_1.ADMIN_URL,
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Loan request has been submitted",
                };
            }));
        });
    }
    //get loan request
    getLoanRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.AgencyLoanModel();
            const query = req.query;
            const data = yield model.getLoanRequest(Object.assign(Object.assign({}, query), { agency_id }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get loan history
    getLoanHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.AgencyLoanModel();
            const query = req.query;
            const data = yield model.getAllLoanHistory(Object.assign(Object.assign({}, query), { agency_id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
}
exports.BookingPaymentServices = BookingPaymentServices;
