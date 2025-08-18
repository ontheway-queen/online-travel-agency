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
exports.PaymentService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const invoiceTemplate_1 = require("../../../utils/templates/invoiceTemplate");
const loanTemplate_1 = require("../../../utils/templates/loanTemplate");
class PaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //Get Invoice List B2C
    getB2CInvoiceList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentModel = this.Model.paymentModel();
            const { limit, skip, due, userId } = req.query;
            const data = yield paymentModel.getInvoice({
                limit,
                skip,
                due,
                userId: Number(userId),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single invoice B2C
    getB2CSingleInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: invoice_id } = req.params;
            const paymentModel = this.Model.paymentModel();
            const data = yield paymentModel.singleInvoice({ id: invoice_id });
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
            else if (data[0].ref_type === "umrah") {
                const umrahModel = this.Model.umrahPackageBookinModel();
                const umrah_res = yield umrahModel.getSingleBooking(data[0].ref_id);
                umrah_data = {
                    package_name: umrah_res.package_name,
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
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
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
    // loan
    giveAgencyLoan(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const body = req.body;
                const agencyModel = this.Model.agencyModel(trx);
                const model = this.Model.AgencyLoanModel(trx);
                const getAgency = yield agencyModel.getSingleAgency(body.agency_id);
                if (!getAgency.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Agency not found.",
                    };
                }
                body.loan_given_by = id;
                body.type = constants_1.LOAN_TYPE.loan;
                // Insert loan data
                yield model.insertAgencyLoan(body);
                //insert balance
                yield agencyModel.insertAgencyLedger({
                    agency_id: body.agency_id,
                    amount: body.amount,
                    type: "credit",
                    details: body.details,
                });
                //update agency
                yield agencyModel.updateAgency({ loan: Number(getAgency[0].loan) + Number(body.amount) }, body.agency_id);
                // send email notification
                yield Promise.all([
                    lib_1.default.sendEmail(getAgency[0].email, `Loan of BDT ${body.amount} has been given to your agency`, (0, loanTemplate_1.template_onLoanGiven_send_to_agency)({
                        title: "Loan Given",
                        amount: body.amount,
                        date: new Date().toLocaleString(),
                        remarks: body.details,
                        agency_name: getAgency[0].agency_name,
                        logo: `${constants_1.PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
                    })),
                    lib_1.default.sendEmail([
                        constants_1.PROJECT_EMAIL_ACCOUNT_1
                    ], `Loan of BDT ${body.amount} has been given to - ${getAgency[0].agency_name}`, (0, loanTemplate_1.template_onLoanGiven_send_to_admin)({
                        title: "Loan Given",
                        amount: body.amount,
                        date: new Date().toLocaleString(),
                        remarks: body.details,
                        agency_name: getAgency[0].agency_name,
                        logo: `${constants_1.PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
                    })),
                ]);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Loan given successfully.",
                };
            }));
        });
    }
    //get only loan agencies
    getAgenciesWithLoan(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            query.loan = true; // filter agencies with loan
            const agencyModel = this.Model.agencyModel();
            const { data, total } = yield agencyModel.getAgency(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    //get agency loan history
    getAgencyLoanHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.AgencyLoanModel();
            const { from_date, to_date, limit, skip, agency_id, type } = req.query;
            const params = {
                from_date,
                to_date,
                limit: limit ? Number(limit) : undefined,
                skip: skip ? Number(skip) : undefined,
                agency_id,
                type,
            };
            const data = yield model.getAllLoanHistory(params);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //adjust loan
    adjustAgencyLoan(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const agencyModel = this.Model.agencyModel(trx);
                const model = this.Model.AgencyLoanModel(trx);
                const getAgency = yield agencyModel.getSingleAgency(body.agency_id);
                if (!getAgency.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Agency not found.",
                    };
                }
                if (getAgency[0].loan < body.amount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Loan amount exceeds agency's current loan.",
                    };
                }
                //check balance
                const currentBalance = yield agencyModel.getTotalBalance(body.agency_id);
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
                }, body.agency_id);
                yield agencyModel.updateAgency({
                    loan: Number(getAgency[0].loan) - Number(body.amount),
                }, body.agency_id);
                // Insert loan adjustment data
                yield model.insertAgencyLoan({
                    agency_id: body.agency_id,
                    amount: body.amount,
                    type: constants_1.LOAN_TYPE.repayment,
                    details: body.details,
                    date: body.date || new Date(),
                });
                //insert balance
                yield agencyModel.insertAgencyLedger({
                    agency_id: body.agency_id,
                    amount: body.amount,
                    type: "debit",
                    details: body.details,
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
    //=============================== Loan Request ============================//
    //get loan request
    getLoanRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.AgencyLoanModel();
            const query = req.query;
            const data = yield model.getLoanRequest(Object.assign({}, query), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //update loan req
    updateLoanRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: adminId } = req.admin;
                const { id: requestId } = req.params;
                const body = req.body;
                const loanModel = this.Model.AgencyLoanModel();
                const agencyModel = this.Model.agencyModel(trx);
                const loanRequest = yield loanModel.getLoanRequest({
                    id: Number(requestId),
                });
                const requestData = loanRequest.data[0];
                if (!requestData) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (requestData.status !== "Pending") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Cannot update this request",
                    };
                }
                const agencyData = yield agencyModel.getSingleAgency(requestData.agency_id);
                const agency = agencyData[0];
                if (!agency) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Agency not found.",
                    };
                }
                yield loanModel.updateLoanRequest(body, Number(requestId));
                if (body.status === "Approved") {
                    const loanAmount = requestData.amount;
                    const agencyId = requestData.agency_id;
                    const approvalNote = body.note ||
                        `Loan request has been approved for the agency: '${agency.email}'`;
                    const loanDetails = {
                        loan_given_by: adminId,
                        type: constants_1.LOAN_TYPE.loan,
                        agency_id: agencyId,
                        amount: loanAmount,
                        date: new Date(new Date().toDateString()),
                        details: approvalNote,
                    };
                    yield loanModel.insertAgencyLoan(loanDetails);
                    yield agencyModel.insertAgencyLedger({
                        agency_id: agencyId,
                        amount: loanAmount,
                        type: "credit",
                        details: approvalNote,
                    });
                    const updatedLoan = Number(agency.loan) + Number(loanAmount);
                    yield agencyModel.updateAgency({ loan: updatedLoan }, agencyId);
                    const logoUrl = `${constants_1.PROJECT_IMAGE_URL}/${agency.agency_logo}`;
                    const formattedDate = new Date().toLocaleString();
                    yield Promise.all([
                        lib_1.default.sendEmail(agency.email, `Loan of BDT ${loanAmount} has been given to your agency`, (0, loanTemplate_1.template_onLoanGiven_send_to_agency)({
                            title: "Loan Given",
                            amount: loanAmount,
                            date: formattedDate,
                            remarks: approvalNote,
                            agency_name: agency.agency_name,
                            logo: logoUrl,
                        })),
                        lib_1.default.sendEmail([
                            constants_1.PROJECT_EMAIL_ACCOUNT_1
                        ], `Loan of BDT ${loanAmount} has been given to - ${agency.agency_name}`, (0, loanTemplate_1.template_onLoanGiven_send_to_admin)({
                            title: "Loan Given",
                            amount: loanAmount,
                            date: formattedDate,
                            remarks: approvalNote,
                            agency_name: agency.agency_name,
                            logo: logoUrl,
                        })),
                    ]);
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: "Loan request has been approved and processed.",
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Loan request has been updated.",
                };
            }));
        });
    }
    clearPartialPaymentDue(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const paymentModel = this.Model.btobPaymentModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const { id: invoice_id } = req.params;
                const checkInvoice = yield paymentModel.singleInvoice(Number(invoice_id));
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
                const agencyBalance = yield agencyModel.getTotalBalance(checkInvoice[0].agency_id);
                if (Number(agencyBalance) < due) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "There is insufficient balance in your account",
                    };
                }
                //debit amount from the agency
                yield agencyModel.insertAgencyLedger({
                    agency_id: checkInvoice[0].agency_id,
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
                    lib_1.default.sendEmail(checkInvoice[0].agency_email, `Your invoice due of BDT ${due} has been cleared`, (0, invoiceTemplate_1.template_onInvoiceDueClear_send_to_agent)({
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
                    message: "Partial payment due has been cleared successfully.",
                };
            }));
        });
    }
    // payment link
    createPaymentLink(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.commonModel(trx);
                const paymentModel = this.Model.paymentModel(trx);
                const { id } = req.admin;
                const body = req.body;
                body.created_by = id;
                if (body.link_type === constants_1.PANEL_TYPE.b2c) {
                    const invoice_data = yield paymentModel.getLastInvoice({});
                    let invoice_number = 0;
                    if (invoice_data.data.length) {
                        invoice_number = Number(invoice_data.data[0].invoice_number.split("-")[1]);
                    }
                    else {
                        invoice_number = 0;
                    }
                    invoice_number =
                        `${constants_1.PROJECT_CODE}IC-` +
                            (invoice_number + 1).toString().padStart(7, "0");
                    const invoice = yield paymentModel.insertInvoice({
                        user_id: body.target_id,
                        ref_type: "payment-link",
                        total_amount: body.amount,
                        due: body.amount,
                        details: `An invoice has been created for the payment link`,
                        invoice_number,
                    });
                    body.invoice_id = invoice[0].id;
                }
                const res = yield model.insertPaymentLink(body);
                const singlePaymentLink = yield model.getSinglePaymentLink({
                    id: res[0].id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({}, res[0]), { invoice_number: singlePaymentLink.invoice_number, target_name: singlePaymentLink.target_name }),
                };
            }));
        });
    }
    // get payment link
    getAllPaymentLink(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.commonModel();
            const query = req.query;
            const data = yield model.getAllPaymentLinks(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
}
exports.PaymentService = PaymentService;
