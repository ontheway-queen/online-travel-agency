import { Knex } from 'knex';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import axios from 'axios';
import {
    EXECUTE_PAYMENT,
    GRAND_TOKEN,
    QUERY_PAYMENT,
    REFRESH_TOKEN,
} from '../../../utils/miscellaneous/bkashApiEndpoints';
import { getRedis, setRedis } from '../../../app/redis';
import { Request, Response } from 'express';
import {
    AGENT_RECHARGE_PAGE,
    BKASH_CANCEL_PAGE,
    BKASH_FAILED_PAGE,
    BKASH_PERCENTAGE,
    BKASH_SUCCESS_PAGE,
    BOOKING_STATUS,
    BRAC_PERCENTAGE,
    BTOB_URL,
    CLIENT_URL,
    ERROR_LEVEL_INFO,
    INVOICE_TYPE_FLIGHT,
    INVOICE_TYPE_TOUR,
    INVOICE_TYPE_UMRAH,
    INVOICE_TYPE_VISA,
    PROJECT_EMAIL_ACCOUNT_1,
    SERVER_URL,
    SSL_PERCENTAGE,
} from '../../../utils/miscellaneous/constants';
import qs from 'qs';
import { FLIGHT_BOOKING_PROCESSING } from '../../../utils/miscellaneous/flightMiscellaneous/flightConstants';
import Lib from '../../../utils/lib/lib';
import { BtoCFlightBookingSubService } from '../../b2c/services/subServices/BtoCFlightBookingSubService';
import {
    agentTopUpSuccessTemplate,
    paymentSuccessTemplate,
} from '../../../utils/templates/paymentTemplate';
import { number } from 'joi';

export default class PublicSSLService extends AbstractServices {
    private trx?: Knex.Transaction;
    constructor(trx?: Knex.Transaction) {
        super();
        this.trx = trx;
    }

    public async createSSLSession(payload: {
        total_amount: number;
        currency: string;
        tran_id: string;
        cus_name: string;
        cus_email: string;
        cus_add1: string;
        cus_city: string;
        cus_country: string;
        cus_phone: string;
        product_name: string;
        product_profile?: number | string;
        panel: 'b2b' | 'b2c';
    }) {
        try {

            const ssl_body = {
                ...payload,
                store_id: config.SSL_STORE_ID,
                store_passwd: config.SSL_STORE_PASSWORD,
                success_url: `${SERVER_URL}/payment/${payload.panel}/ssl/success`,
                fail_url: `${SERVER_URL}/payment/${payload.panel}/ssl/failed`,
                cancel_url: `${SERVER_URL}/payment/${payload.panel}/ssl/cancelled`,
                shipping_method: "no",
                product_category: "General",
                product_profile: "General"
            }

            const response: any = await axios.post(`${config.SSL_URL}/gwprocess/v4/api.php`, qs.stringify(ssl_body),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

            if (response?.data?.status === "SUCCESS") {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    redirect_url: response.data.redirectGatewayURL
                }
            } else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: "Something went wrong with SSL payment!"
                }
            }

        } catch (err) {
            console.log('SSL ERROR', err);
            return {
                success: false,
                code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                message: "Something went wrong with SSL payment"
            }
        }
    }

    public async b2bPaymentSuccess(req: Request) {
        return await this.db.transaction(async (trx) => {
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
                    redirect_url: `${BTOB_URL}/payment/top_up?status=failed`,
                };
            }
            //confirm payment
            const ssl_response: any = await axios.post(`${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`);
            await this.Model.errorLogsModel().insert({
                level: ERROR_LEVEL_INFO,
                message: `B2B SSL Payment Response`,
                url: ``,
                http_method: 'POST',
                source: 'B2B',
                user_id: tran_id[1],
                metadata: {
                    api: 'SSL',
                    endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                    payload: tran_id,
                    response: ssl_response.data,
                },
            });
            if (!['VALID'].includes(ssl_response?.data?.status)) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Unverified transaction',
                    redirect_url: `${BTOB_URL}/payment/top_up?status=failed`
                }
            }

            // get single agency
            const agency_model = this.Model.agencyModel(trx);

            const agency = await agency_model.getSingleAgency(tran_id[1]);

            if (!agency.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: 'Invalid agency ID',
                    redirect_url: `${BTOB_URL}/payment/top_up?status=failed`,
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

            await agency_model.insertAgencyLedger({
                agency_id: agency[0].id,
                type: 'credit',
                amount: actual_amount,
                details: `Credit load has been made using SSL payment gateway. Using : ${cardNumber}. Transaction id : ${transactionId}. gateway charge: ${SSL_PERCENTAGE}`,
                topup: true,
                payment_gateway: 'SSL',
            });

            const redirectParams = new URLSearchParams({
                amount: ssl_response.data.store_amount,
                credit_load: actual_amount.toString(),
                ssl_percentage: SSL_PERCENTAGE.toString(),
                date: paymentTime.toString(),
                transaction_id: transactionId,
                payment_type: paymentType,
            }).toString();
            //send mail
            await Lib.sendEmail(
                [
                    PROJECT_EMAIL_ACCOUNT_1
                ],
                `Top-up of amount ${actual_amount}`,
                agentTopUpSuccessTemplate({
                    agencyName: agency[0].agency_name,
                    amount: actual_amount,
                    gatewayCharge: SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    paymentTime: paymentTime.toString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                })
            );
            await Lib.sendEmail(
                agency[0].email,
                `Top-up of amount ${actual_amount}`,
                agentTopUpSuccessTemplate({
                    agencyName: agency[0].agency_name,
                    amount: actual_amount,
                    gatewayCharge: SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    paymentTime: paymentTime.toString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                })
            );

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Payment successful',
                redirect_url: `${BTOB_URL}/payment/top_up?status=success`,
            };
        });
    }

    public async b2bPaymentFailed(req: Request) {
        return await this.db.transaction(async (trx) => {
            const body = req.body;
            console.log({ body });
            const tran_id = body.tran_id.split("-");
            await this.Model.errorLogsModel().insert({
                level: ERROR_LEVEL_INFO,
                message: `B2B SSL Payment Failed`,
                url: ``,
                http_method: 'POST',
                source: 'B2B',
                user_id: tran_id[1],
                metadata: {
                    api: 'SSL',
                    endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                    payload: tran_id,
                    response: req.body,
                },
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Transaction failed',
                redirect_url: `${BTOB_URL}/payment/top_up?status=failed`
            }
        });
    }

    public async b2bPaymentCancelled(req: Request) {
        return await this.db.transaction(async (trx) => {
            const body = req.body;
            console.log({ body });
            const tran_id = body.tran_id.split("-");
            await this.Model.errorLogsModel().insert({
                level: ERROR_LEVEL_INFO,
                message: `B2B SSL Payment Cancelled`,
                url: ``,
                http_method: 'POST',
                source: 'B2B',
                user_id: tran_id[1],
                metadata: {
                    api: 'SSL',
                    endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                    payload: tran_id,
                    response: req.body,
                },
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Transaction cancelled',
                redirect_url: `${BTOB_URL}/payment/top_up?status=failed`
            }
        });
    }

    public async b2cPaymentSuccess(req: Request) {
        return this.db.transaction(async (trx) => {
            const body = req.body;
            console.log({ body });
            const tran_id = body.tran_id.split(" ");
            console.log({ tran_id });
            if (!tran_id[1]) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Invalid invoice number',
                    redirect_url: `${CLIENT_URL}/payment-failed`,
                };
            }
            //confirm payment
            const ssl_response: any = await axios.post(`${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`);
            await this.Model.errorLogsModel().insert({
                level: ERROR_LEVEL_INFO,
                message: `B2C SSL Payment Response`,
                url: ``,
                http_method: 'POST',
                source: 'B2C',
                user_id: tran_id[2],
                metadata: {
                    api: 'SSL',
                    endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                    payload: tran_id,
                    response: ssl_response.data,
                },
            });
            if (!['VALID'].includes(ssl_response?.data?.status)) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Unverified transaction',
                    redirect_url: `${CLIENT_URL}/payment-failed`
                }
            }

            const paymentModel = this.Model.paymentModel(trx);
            const invoice = await paymentModel.getSingleInvoiceByInvoiceNumber(tran_id[1]);
            console.log({ invoice });
            if (!invoice.length) {
                await this.Model.errorLogsModel().insert({
                    level: ERROR_LEVEL_INFO,
                    message: `B2C SSL Payment Response`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2C',
                    user_id: tran_id[2],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: ssl_response.data,
                    },
                });
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'No invoice has been found with this id',
                    redirect_url: `${CLIENT_URL}/paymentFail`,
                };
            }

            // check if Reference ID already validated or not
            if (invoice.length && Number(invoice[0]?.due) <= 0) {
                await this.Model.errorLogsModel().insert({
                    level: ERROR_LEVEL_INFO,
                    message: `B2C SSL Payment Response`,
                    url: ``,
                    http_method: 'POST',
                    source: 'B2C',
                    user_id: tran_id[2],
                    metadata: {
                        api: 'SSL',
                        endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                        payload: tran_id,
                        response: ssl_response.data,
                    },
                });
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Reference ID already validated',
                    redirect_url: `${CLIENT_URL}/paymentFail`,
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

            await paymentModel.updateInvoice({ due: remainDue }, invoice[0].id);

            // Create money receipt
            await paymentModel.createMoneyReceipt({
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

            if (invoice[0].ref_type === INVOICE_TYPE_FLIGHT) {
                await new BtoCFlightBookingSubService(trx).ticketIssueSubService(invoice[0].ref_id);

                //update convenience fee
                await this.Model.btocFlightBookingModel(trx).updateBooking({ convenience_fee: Number(ssl_response.data.amount) - actual_amount }, invoice[0].ref_id);

                const flightModel = this.Model.btocFlightBookingModel(trx);
                const flight = await flightModel.getSingleFlightBooking({ id: invoice[0].ref_id });
                emailTitle = `Payment has been done for invoice ${invoice[0].invoice_number} | Booking ID : ${flight[0].booking_ref} | PNR : ${flight[0].pnr_code} | B2C`;
                details = `Type: Flight <br> Booking ID: ${flight[0].booking_ref} <br> PNR: ${flight[0].airline_pnr}`
            } else if (invoice[0].ref_type === INVOICE_TYPE_TOUR) {
                const tourModel = this.Model.tourPackageBookingModel(trx);
                await tourModel.updateSingleBooking(invoice[0].ref_id, {
                    status: BOOKING_STATUS.BOOKED,
                });
                const getSingleBooking = await tourModel.getSingleBookingInfo(invoice[0].ref_id);
                details = `Type: Tour <br> Booking ID: ${getSingleBooking[0].ref_id}`;
            } else if (invoice[0].ref_type === INVOICE_TYPE_UMRAH) {
                const umrahModel = this.Model.umrahPackageBookinModel(trx);
                await umrahModel.updateSingleBooking(invoice[0].ref_id, {
                    status: BOOKING_STATUS.BOOKED,
                });
                const getSingleBooking = await umrahModel.getSingleBooking(invoice[0].ref_id);
                details = `Type: Umrah <br> Booking ID: ${getSingleBooking[0].ref_id}`;
            } else if (invoice[0].ref_type === INVOICE_TYPE_VISA) {
                const visaModel = this.Model.VisaModel(trx);
                await visaModel.b2cUpdateApplication(BOOKING_STATUS.BOOKED, invoice[0].ref_id);
                const getSingleApplication = await visaModel.b2cSingleApplication(invoice[0].ref_id);
                details = `Type: Visa <br> Application ID: ${getSingleApplication[0].id}`;
            }

            const redirectParams = new URLSearchParams({
                amount: ssl_response.data.amount.toString(),
                actual_amount: actual_amount.toString(),
                ssl_percentage: SSL_PERCENTAGE.toString(),
                payment_time: paymentTime.toISOString(),
                transaction_id: transactionId,
                payment_type: paymentType,
                invoice_number: invoice[0].invoice_number.toString(),
                invoice_id: invoice[0].id,
            }).toString();

            //send mail
            await Lib.sendEmail(
                [
                    PROJECT_EMAIL_ACCOUNT_1
                ],
                emailTitle,
                paymentSuccessTemplate({
                    name: invoice[0].first_name + ' ' + invoice[0].last_name,
                    amount: actual_amount,
                    gatewayCharge: SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    invoiceId: invoice[0].invoice_number,
                    paymentTime: paymentTime.toISOString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                    email: invoice[0].email,
                    phone_number: invoice[0].phone_number,
                    details
                })
            );
            await Lib.sendEmail(
                invoice[0].email,
                `Payment has been done for invoice ${invoice[0].invoice_number}`,
                paymentSuccessTemplate({
                    name: invoice[0].first_name + ' ' + invoice[0].last_name,
                    amount: actual_amount,
                    gatewayCharge: SSL_PERCENTAGE,
                    paymentMethod: 'SSL',
                    invoiceId: invoice[0].invoice_number,
                    paymentTime: paymentTime.toISOString(),
                    transactionId,
                    paymentType,
                    paymentUsing: cardNumber,
                    email: invoice[0].email,
                    phone_number: invoice[0].phone_number,
                    details
                })
            );

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Payment successful',
                redirect_url: `${CLIENT_URL}/paymentSuccess?${redirectParams}`,
            };
        });
    }

    public async b2cPaymentFailed(req: Request) {
        return await this.db.transaction(async (trx) => {
            const body = req.body;
            console.log({ body });
            const tran_id = body.tran_id.split("-");
            await this.Model.errorLogsModel().insert({
                level: ERROR_LEVEL_INFO,
                message: `B2C SSL Payment Failed`,
                url: ``,
                http_method: 'POST',
                source: 'B2C',
                user_id: tran_id[2],
                metadata: {
                    api: 'SSL',
                    endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                    payload: tran_id,
                    response: req.body,
                },
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Transaction failed',
                redirect_url: `${CLIENT_URL}/paymentFail`
            }
        });
    }

    public async b2cPaymentCancelled(req: Request) {
        return await this.db.transaction(async (trx) => {
            const body = req.body;
            console.log({ body });
            const tran_id = body.tran_id.split("-");
            await this.Model.errorLogsModel().insert({
                level: ERROR_LEVEL_INFO,
                message: `B2C SSL Payment Cancelled`,
                url: ``,
                http_method: 'POST',
                source: 'B2C',
                user_id: tran_id[1],
                metadata: {
                    api: 'SSL',
                    endpoint: `${config.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body?.val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`,
                    payload: tran_id,
                    response: req.body,
                },
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Transaction cancelled',
                redirect_url: `${CLIENT_URL}/paymentCancel`
            }
        });
    }
}
