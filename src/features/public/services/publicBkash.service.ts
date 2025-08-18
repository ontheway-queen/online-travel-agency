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
  INVOICE_TYPE_FLIGHT,
  INVOICE_TYPE_TOUR,
  INVOICE_TYPE_UMRAH,
  INVOICE_TYPE_VISA,
  PROJECT_EMAIL_ACCOUNT_1,

} from '../../../utils/miscellaneous/constants';
import qs from 'qs';
import { FLIGHT_BOOKING_PROCESSING } from '../../../utils/miscellaneous/flightMiscellaneous/flightConstants';
import Lib from '../../../utils/lib/lib';
import { BtoCFlightBookingSubService } from '../../b2c/services/subServices/BtoCFlightBookingSubService';
import {
  agentTopUpSuccessTemplate,
  paymentSuccessTemplate,
} from '../../../utils/templates/paymentTemplate';

export default class PublicCommonBkashService extends AbstractServices {
  private trx?: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  // Get bkash grand token
  public async getBkashToken(): Promise<void> {
    try {
      const { BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_BASE_URL, BKASH_USERNAME, BKASH_PASSWORD } =
        config;

      const payload = {
        app_key: BKASH_APP_KEY,
        app_secret: BKASH_APP_SECRET,
      };

      const response = await axios.post(`${BKASH_BASE_URL}${GRAND_TOKEN}`, payload, {
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
      await authModel.updateEnv('bkash_refresh_token', refresh_token);
    } catch (error) {
      console.error('Error fetching bKash token:', error);
    }
  }

  // Get bKash ID token using refresh token
  public async getBkashIdTokenByRefreshToken() {
    const cacheKey = 'bkash_id_token';
    const cachedToken = await getRedis(cacheKey);
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

    const refresh_token = await model.getEnv('bkash_refresh_token');

    try {
      const { BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_BASE_URL, BKASH_USERNAME, BKASH_PASSWORD } =
        config;

      const payload = {
        app_key: BKASH_APP_KEY,
        app_secret: BKASH_APP_SECRET,
        refresh_token,
      };

      const response = await axios.post(`${BKASH_BASE_URL}${REFRESH_TOKEN}`, payload, {
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
      await setRedis(cacheKey, id_token, 3600);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { id_token },
      };
    } catch (error) {
      console.error('Error fetching bKash ID token:', error);
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: 'Something went wrong while fetching bKash ID token.',
      };
    }
  }

  // Execute bKash payment API
  public async executeBkashPaymentApi(params: { id_token: string; paymentID: string }) {
    try {
      const { id_token, paymentID } = params;

      const response = await axios.post(
        `${config.BKASH_BASE_URL}${EXECUTE_PAYMENT}`,
        { paymentID },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: id_token,
            'X-App-Key': config.BKASH_APP_KEY,
          },
          maxBodyLength: Infinity,
        }
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: response.data,
      };
    } catch (error) {
      console.error('Error executing bKash payment:', error);
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: 'Something went wrong while executing bKash payment.',
      };
    }
  }

  // Query bKash payment API
  public async BkashQueryPaymentApi(params: { id_token: string; paymentID: string }) {
    try {
      const { id_token, paymentID } = params;

      const response = await axios.post(
        `${config.BKASH_BASE_URL}${QUERY_PAYMENT}`,
        { paymentID },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: id_token,
            'X-App-Key': config.BKASH_APP_KEY,
          },
          maxBodyLength: Infinity,
        }
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: response.data,
      };
    } catch (error) {
      console.error('Error querying bKash payment:', error);
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: 'Something went wrong while querying bKash payment.',
      };
    }
  }

  public async B2cBkashCallbackUrl(req: Request, res: Response) {
    return await this.db.transaction(async (trx) => {
      const { paymentID, status } = req.query;
      const invoiceModel = this.Model.paymentModel(trx);

      if (!paymentID || !status) {
        throw new Error('Invalid query parameters.');
      }

      if (status === 'success') {
        const { data: tokenData } = await this.getBkashIdTokenByRefreshToken();
        const idToken = tokenData?.id_token;
        if (!idToken) throw new Error('Failed to retrieve bKash ID token.');

        const { data: executePayment } = await this.executeBkashPaymentApi({
          id_token: idToken,
          paymentID: paymentID as string,
        });

        const handleSuccessPayment = async (paymentResponse: any) => {
          const invoiceNumber = paymentResponse.merchantInvoiceNumber;

          const [checkInvoice] = await invoiceModel.singleInvoice({
            invoice_number: invoiceNumber,
          });
          console.log({ checkInvoice });

          //get actual amount by deducting the BKASH percentage from the total paid amount
          const actual_amount = parseFloat(
            Lib.calculateAdjustedAmount(
              paymentResponse.amount,
              BKASH_PERCENTAGE,
              'subtract'
            ).toFixed(2)
          );

          const remainDue = Math.max(Number(checkInvoice.due) - actual_amount, 0);

          await invoiceModel.updateInvoice({ due: remainDue }, checkInvoice.id);

          let details = '';
          let emailTitle = `Payment has been done for invoice ${checkInvoice.invoice_number} | B2C`;

          if (checkInvoice?.ref_type === INVOICE_TYPE_FLIGHT) {
            await new BtoCFlightBookingSubService(trx).ticketIssueSubService(checkInvoice.ref_id);
            //update convenience fee
            await this.Model.btocFlightBookingModel(trx).updateBooking({ convenience_fee: (Number(paymentResponse.amount) * BKASH_PERCENTAGE) / 100 }, checkInvoice.ref_id);

            const flightModel = this.Model.btocFlightBookingModel(trx);
            const flight = await flightModel.getSingleFlightBooking({ id: checkInvoice.ref_id });
            emailTitle = `Payment has been done for invoice ${checkInvoice.invoice_number} | Booking ID : ${flight[0].booking_ref} | PNR : ${flight[0].pnr_code} | B2C`;
            details = `Type: Flight <br> Booking ID: ${flight[0].booking_ref} <br> PNR: ${flight[0].airline_pnr}`
          } else if (checkInvoice?.ref_type === INVOICE_TYPE_TOUR) {
            const tourModel = this.Model.tourPackageBookingModel(trx);
            await tourModel.updateSingleBooking(checkInvoice.ref_id, {
              status: BOOKING_STATUS.BOOKED,
            });
            const getSingleBooking = await tourModel.getSingleBookingInfo(checkInvoice.ref_id);
            details = `Type: Tour <br> Booking ID: ${getSingleBooking[0].ref_id}`;
          } else if (checkInvoice?.ref_type === INVOICE_TYPE_UMRAH) {
            const umrahModel = this.Model.umrahPackageBookinModel(trx);
            await umrahModel.updateSingleBooking(checkInvoice.ref_id, {
              status: BOOKING_STATUS.BOOKED,
            });
            const getSingleBooking = await umrahModel.getSingleBooking(checkInvoice.ref_id);
            details = `Type: Umrah <br> Booking ID: ${getSingleBooking[0].ref_id}`;
          } else if (checkInvoice?.ref_type === INVOICE_TYPE_VISA) {
            const visaModel = this.Model.VisaModel(trx);
            await visaModel.b2cUpdateApplication(BOOKING_STATUS.BOOKED, checkInvoice.ref_id);
            const getSingleApplication = await visaModel.b2cSingleApplication(checkInvoice.ref_id);
            details = `Type: Visa <br> Application ID: ${getSingleApplication[0].id}`;
          }

          console.log("paymentResponse", paymentResponse);

          await invoiceModel.createMoneyReceipt({
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
          await Lib.sendEmail(
            [
              PROJECT_EMAIL_ACCOUNT_1
            ],
            emailTitle,
            paymentSuccessTemplate({
              name: checkInvoice.first_name + ' ' + checkInvoice.last_name,
              amount: actual_amount,
              gatewayCharge: BKASH_PERCENTAGE,
              paymentMethod: 'BKASH',
              invoiceId: checkInvoice.invoice_number,
              paymentTime: paymentResponse.paymentExecuteTime,
              transactionId: paymentResponse.trxID,
              paymentType: 'Bkash',
              paymentUsing: paymentResponse.payerAccount,
              email: checkInvoice.email,
              phone_number: checkInvoice.phone_number,
              details
            })
          );
          await Lib.sendEmail(
            checkInvoice.email,
            `Payment has been done for invoice ${checkInvoice.invoice_number}`,
            paymentSuccessTemplate({
              name: checkInvoice.first_name + ' ' + checkInvoice.last_name,
              amount: actual_amount,
              gatewayCharge: BKASH_PERCENTAGE,
              paymentMethod: 'BKASH',
              invoiceId: checkInvoice.invoice_number,
              paymentTime: paymentResponse.paymentExecuteTime,
              transactionId: paymentResponse.trxID,
              paymentType: 'Bkash',
              paymentUsing: paymentResponse.payerAccount,
              email: checkInvoice.email,
              phone_number: checkInvoice.phone_number,
              details
            })
          );

          const queryString = qs.stringify({
            ...paymentResponse,
            actual_amount,
            gateway_charge_percentage: BKASH_PERCENTAGE,
            invoice_id: checkInvoice.id,
          });

          return res.redirect(`${BKASH_SUCCESS_PAGE}?${queryString}`);
        };

        if (executePayment && executePayment.statusCode === '0000') {
          return await handleSuccessPayment(executePayment);
        }

        const { data: queryPaymentData } = await this.BkashQueryPaymentApi({
          id_token: idToken,
          paymentID: paymentID as string,
        });

        if (queryPaymentData?.statusCode === '0000') {
          return await handleSuccessPayment(queryPaymentData);
        } else {
          const queryString = qs.stringify(queryPaymentData);
          return res.redirect(`${BKASH_FAILED_PAGE}?${queryString}`);
        }
      } else if (status === 'cancel') {
        return res.redirect(BKASH_CANCEL_PAGE);
      } else if (status === 'failure') {
        return res.redirect(BKASH_FAILED_PAGE);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  // b2b bkash callback url
  public async B2bBkashCallbackUrl(req: Request, res: Response) {
    return await this.db.transaction(async (trx) => {
      const { paymentID, status } = req.query;

      const agency_model = this.Model.agencyModel(trx);

      if (!paymentID || !status) {
        throw new Error('Invalid query parameters.');
      }

      if (status === 'success') {
        // get bkash grand token
        const { data: token_Data } = await this.getBkashIdTokenByRefreshToken();
        if (!token_Data?.id_token) {
          throw new Error('Failed to retrieve bKash ID token.');
        }

        const { data: executePayment } = await this.executeBkashPaymentApi({
          id_token: token_Data.id_token,
          paymentID: paymentID as string,
        });

        if (executePayment) {
          const redirectData = {
            ...executePayment,
          };

          if (executePayment?.statusCode === '0000') {
            const tran_id = executePayment?.merchantInvoiceNumber?.split('-');
            const agency = await agency_model.getSingleAgency(tran_id[1]);

            if (!agency.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: 'Invalid agency ID',
              };
            }

            //get actual amount by deducting the BKASH percentage from the total paid amount
            const actual_amount = parseFloat(
              Lib.calculateAdjustedAmount(
                executePayment.amount,
                BKASH_PERCENTAGE,
                'subtract'
              ).toFixed(2)
            );

            await agency_model.insertAgencyLedger({
              agency_id: tran_id[1],
              type: 'credit',
              amount: actual_amount,
              created_by: tran_id[2],
              details: `Amount has been credited using Bkash, PAYMENT ID: ${executePayment.paymentID}. Transaction ID: ${executePayment.trxID}. Bkash Number: ${executePayment.payerAccount}. Gateway charge: ${BKASH_PERCENTAGE}`,
              payment_gateway: 'Bkash',
              topup: true,
            });

            //send mail
            await Lib.sendEmail(
              [
                PROJECT_EMAIL_ACCOUNT_1
              ],
              `Top-up of amount ${actual_amount}`,
              agentTopUpSuccessTemplate({
                agencyName: agency[0].agency_name,
                amount: actual_amount,
                gatewayCharge: BKASH_PERCENTAGE,
                paymentMethod: 'BKASH',
                paymentTime: executePayment.paymentExecuteTime,
                transactionId: executePayment.trxID,
                paymentType: 'Bkash',
                paymentUsing: executePayment.payerAccount,
              })
            );
            await Lib.sendEmail(
              agency[0].email,
              `Top-up of amount ${actual_amount}`,
              agentTopUpSuccessTemplate({
                agencyName: agency[0].agency_name,
                amount: actual_amount,
                gatewayCharge: BKASH_PERCENTAGE,
                paymentMethod: 'BKASH',
                paymentTime: executePayment.paymentExecuteTime,
                transactionId: executePayment.trxID,
                paymentType: 'Bkash',
                paymentUsing: executePayment.payerAccount,
              })
            );

            return res.redirect(
              `${AGENT_RECHARGE_PAGE}?amount=${executePayment.amount
              }&actual_amount=${actual_amount}&gateway_charge_percentage=${BKASH_PERCENTAGE}&status=${status}$paymentExecuteTime=${executePayment.paymentExecuteTime
              }&statusMessage=${encodeURIComponent(executePayment.statusMessage)}`
            );
          } else {
            return res.redirect(
              `${AGENT_RECHARGE_PAGE}?status=${status}&statusMessage=${encodeURIComponent(
                executePayment.errorsMessage
              )}`
            );
          }
        } else {
          const { data: query_payment_data } = await this.BkashQueryPaymentApi({
            id_token: token_Data.id_token,
            paymentID: paymentID as string,
          });

          if (query_payment_data?.statusCode === '0000') {
            const tran_id = query_payment_data?.merchantInvoiceNumber?.split('-');
            const agency = await agency_model.getSingleAgency(tran_id[1]);

            if (!agency.length) {
              return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: 'Invalid agency ID',
              };
            }

            //get actual amount by deducting the BKASH percentage from the total paid amount
            const actual_amount = parseFloat(
              Lib.calculateAdjustedAmount(
                query_payment_data.amount,
                BKASH_PERCENTAGE,
                'subtract'
              ).toFixed(2)
            );

            await agency_model.insertAgencyLedger({
              agency_id: tran_id[1],
              type: 'credit',
              amount: actual_amount,
              created_by: tran_id[2],
              details: `Amount has been credited using Bkash, PAYMENT ID: ${query_payment_data.paymentID}. Transaction ID: ${query_payment_data.trxID}. Bkash Number: ${query_payment_data.payerAccount}. Gateway charge: ${BKASH_PERCENTAGE}`,
              topup: true,
              payment_gateway: 'Bkash'
            });

            //send mail
            await Lib.sendEmail(
              [
                PROJECT_EMAIL_ACCOUNT_1
              ],
              `Top-up of amount ${actual_amount}`,
              agentTopUpSuccessTemplate({
                agencyName: agency[0].agency_name,
                amount: actual_amount,
                gatewayCharge: BKASH_PERCENTAGE,
                paymentMethod: 'BKASH',
                paymentTime: query_payment_data.paymentExecuteTime,
                transactionId: query_payment_data.trxID,
                paymentType: 'Bkash',
                paymentUsing: query_payment_data.payerAccount,
              })
            );
            await Lib.sendEmail(
              agency[0].email,
              `Top-up of amount ${actual_amount}`,
              agentTopUpSuccessTemplate({
                agencyName: agency[0].agency_name,
                amount: actual_amount,
                gatewayCharge: BKASH_PERCENTAGE,
                paymentMethod: 'BKASH',
                paymentTime: query_payment_data.paymentExecuteTime,
                transactionId: query_payment_data.trxID,
                paymentType: 'Bkash',
                paymentUsing: query_payment_data.payerAccount,
              })
            );

            return res.redirect(
              `${AGENT_RECHARGE_PAGE}?amount=${query_payment_data.amount
              }&actual_amount=${actual_amount}&gateway_charge_percentage=${BKASH_PERCENTAGE}status=${status}$paymentExecuteTime=${query_payment_data.paymentExecuteTime
              }&statusMessage=${encodeURIComponent(query_payment_data.statusMessage)}`
            );
          } else {
            console.log('error', query_payment_data);
            return res.redirect(

              `${AGENT_RECHARGE_PAGE}?&status=${status}&statusMessage=${encodeURIComponent(
                query_payment_data.errorMessage
              )}`
            );
          }
        }
      } else if (status === 'cancel') {
        return res.redirect(
          `${AGENT_RECHARGE_PAGE}?status=${status}&statusMessage=${encodeURIComponent(
            'The payment has been canceled.'
          )}`
        );
      } else if (status === 'failure') {
        return res.redirect(
          `${AGENT_RECHARGE_PAGE}?status=${status}&statusMessage=${encodeURIComponent(
            'The payment has failed.'
          )}`
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
