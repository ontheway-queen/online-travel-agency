import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
// import RequestFormatter from '../../../utils/lib/requestFomatter';
import axios from 'axios';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import {
  BOOKING_STATUS,
  BRAC_PERCENTAGE,
  BTOB_URL,
  BTOC_PAYMENT_TYPE,
  CLIENT_URL,
  ERROR_LEVEL_INFO,
  INVOICE_TYPE_FLIGHT,
  INVOICE_TYPE_TOUR,
  INVOICE_TYPE_UMRAH,
  INVOICE_TYPE_VISA,
  PROJECT_EMAIL_ACCOUNT_1,

} from '../../../utils/miscellaneous/constants';
import {
  FLIGHT_BOOKING_PAID,
  FLIGHT_BOOKING_PROCESSING,
} from '../../../utils/miscellaneous/flightMiscellaneous/flightConstants';
import { invoiceTemplate } from '../../../utils/templates/invoiceTemplate';
import { moneyReceiptTemplate } from '../../../utils/templates/moneyReceiptTemplate';
import { tourBookingTemplate } from '../../../utils/templates/tourBookingTemplate';
import { visaApplicationEmail } from '../../../utils/templates/visaApplicationEmail';
import { createHash, createHmac } from 'crypto';
import { BtoCFlightBookingSubService } from '../../b2c/services/subServices/BtoCFlightBookingSubService';
import {
  agentTopUpSuccessTemplate,
  paymentSuccessTemplate,
} from '../../../utils/templates/paymentTemplate';
const crypto = require('crypto');

// import { TICKET_ISSUE_ENDPOINT } from '../../../utils/miscellaneous/sabreApiEndpoints';
// import SabreRequests from '../../../utils/lib/sabreRequest';
// import TicketIssueService from '../../b2c/services/ticketIssue.service';

class PublicPaymentService extends AbstractServices {
  // private requestFormatter = new RequestFormatter();
  // private ticketIssueService = new TicketIssueService();
  // private sabreRequest = new SabreRequests();

  constructor() {
    super();
  }

  // payment failed
  public async paymentFailed(req: Request) {
    return this.db.transaction(async (trx) => {
      const { tran_id, value_a } = req.body;

      if (!tran_id || tran_id.split('-').length !== 2) {
        if (value_a === 'true') {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Unverified Transaction',
          };
        } else {
          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: 'Unverified Transaction',
            redirect_url: `${CLIENT_URL}/paymentFail`,
          };
        }
      }

      const [paymentType, invoiceId] = tran_id.split('-');
      const paymentModel = this.Model.paymentModel(trx);
      const invoice = await paymentModel.singleInvoice(invoiceId);

      if (invoice[0]?.total_amount === invoice[0]?.due) {
        if (invoice[0].ref_type === 'visa') {
          const model = this.Model.VisaModel(trx);
          const data = await model.deleteApplication(invoice[0].ref_id);
          await paymentModel.deleteInvoice(invoiceId);
        } else if (invoice[0].ref_type === 'tour') {
          const model = this.Model.tourPackageBookingModel(trx);
          await model.deleteTourPackageBook(invoice[0].ref_id);
          await paymentModel.deleteInvoice(invoiceId);
        }
      }

      if (value_a === 'true') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Payment Failed',
        };
      } else {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'Payment Failed',
          redirect_url: `${CLIENT_URL}/paymentFail`,
        };
      }
    });
  }

  //payment success
  public async paymentSuccess(req: Request) {
    return this.db.transaction(async (trx) => {
      const { tran_id, val_id, value_a, amount, tran_date, bank_tran_id, card_issuer, card_type } =
        req.body;

      const [paymentType, invoiceId] = tran_id.split('-');

      if (paymentType === BTOC_PAYMENT_TYPE) {
        const paymentModel = this.Model.paymentModel(trx);
        const invoice = await paymentModel.singleInvoice(invoiceId);

        if (!invoice.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Invoice not found',
            redirect_url: `${CLIENT_URL}/paymentFail`,
          };
        }

        // SSL validation request
        const sslValidationUrl = `${config.SSL_URL}/validator/api/validationserverAPI.php`;
        const sslResponse = await axios.post(
          `${sslValidationUrl}?val_id=${val_id}&store_id=${config.SSL_STORE_ID}&store_passwd=${config.SSL_STORE_PASSWORD}&format=json`
        );

        if (!['VALID', 'VALIDATED'].includes(sslResponse?.data?.status)) {
          if (value_a === 'true') {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: 'Unverified transaction',
            };
          } else {
            return {
              success: true,
              code: this.StatusCode.HTTP_OK,
              message: 'Unverified transaction',
              redirect_url: `${CLIENT_URL}/paymentFail`,
            };
          }
        }

        // const remain_due_amount = invoice[0].due - amount;
        const remain_due_amount = Number(invoice[0].due) - Number(sslResponse.data.store_amount); //actual amount is without 2.5% of SSL

        await paymentModel.updateInvoice({ due: remain_due_amount }, invoiceId);

        // Create money receipt
        await paymentModel.createMoneyReceipt({
          invoice_id: invoiceId,
          // amount: amount,
          amount: sslResponse.data.store_amount,
          payment_time: tran_date,
          transaction_id: bank_tran_id,
          payment_type: card_issuer,
          details: 'Payment has been made using payment gateway.',
        });

        // Update booking status
        if (invoice[0].ref_type === 'tour') {
          const tourModel = this.Model.tourPackageBookingModel(trx);
          await tourModel.updateSingleBooking(invoice[0].ref_id, {
            status: 'PROCESSING',
          });

          const singleBooking = await tourModel.getSingleBookingInfo(invoice[0].ref_id);

          if (invoice[0].due === invoice[0].total_amount) {
            const tourBookingMailData: {
              name: string;
              tourType: string;
              city: string;
              adult_travelers: number;
              child_travelers: number;
              travelDate: string;
              totalAmount: number;
            } = {
              name: singleBooking.first_name,
              tourType:
                String(singleBooking.tour_type).charAt(0).toUpperCase() +
                String(singleBooking.tour_type).slice(1).toLowerCase(),
              city: singleBooking.city_name,
              adult_travelers: singleBooking.traveler_adult,
              child_travelers: singleBooking.traveler_child,
              travelDate: new Date(singleBooking.travel_date).toLocaleString(),
              totalAmount: invoice[0].total_amount,
            };

            await Lib.sendEmail(
              singleBooking.email,
              `Your Tour Booking Confirmation - Booking ID: ${singleBooking.id}`,
              tourBookingTemplate(tourBookingMailData)
            );

            const invoiceMailData: {
              name: string;
              invoiceNumber: string;
              bookingType: string;
              date: string;
              totalTravelers: number;
              JType: string;
              totalAmount: number;
            } = {
              name: singleBooking.first_name,
              invoiceNumber: invoice[0].invoice_number,
              bookingType: invoice[0].ref_type,
              date: new Date(invoice[0].created_at).toLocaleString(),
              totalTravelers: singleBooking.traveler_adult + singleBooking.traveler_child,
              JType: 'Travelers',
              totalAmount: invoice[0].total_amount,
            };

            await Lib.sendEmail(
              singleBooking.email,
              `Invoice for Your Tour Booking ID : ${singleBooking.id} | online travel agency`,
              invoiceTemplate(invoiceMailData)
            );
          }
          const moneyReceiptMailData: {
            name: string;
            invoiceNumber: string;
            transactionId: string;
            paymentTime: string;
            amount: number;
            paymentMethod: string;
            paymentGateway: string;
          } = {
            name: singleBooking.first_name,
            invoiceNumber: invoice[0].invoice_number,
            transactionId: bank_tran_id,
            paymentTime: new Date(tran_date).toLocaleString(),
            // amount: amount,
            amount: sslResponse.data.store_amount,
            paymentMethod: card_issuer,
            paymentGateway: 'Payment has been made using payment gateway.',
          };

          await Lib.sendEmail(
            singleBooking.email,
            `Money Receipt for Your Visa Application ID : ${singleBooking.id} | online travel agency`,
            moneyReceiptTemplate(moneyReceiptMailData)
          );
        } else if (invoice[0].ref_type === 'umrah') {
          const umrahModel = this.Model.umrahPackageBookinModel(trx);
          await umrahModel.updateSingleBooking(invoice[0].ref_id, {
            status: 'PROCESSING',
          });
        } else if (invoice[0].ref_type === 'visa') {
          const visaModel = this.Model.VisaModel(trx);
          await visaModel.b2cUpdateApplication('PROCESSING', invoice[0].ref_id);
          // const data = await visaModel.single(invoice[0].ref_id, true);

          const singleApplication = await visaModel.b2cSingleApplication(invoice[0].ref_id);

          if (invoice[0].due === invoice[0].total_amount) {
            const visaApplicationMailData = {
              name: singleApplication.first_name + ' ' + singleApplication.last_name,
              visaType: singleApplication.type,
              destination:
                String(singleApplication.country_name).charAt(0).toUpperCase() +
                String(singleApplication.country_name).slice(1).toLowerCase(),
              numOfTravellers: singleApplication.traveler,
              applicationId: singleApplication.id,
              price: singleApplication.payable,
            };

            await Lib.sendEmail(
              singleApplication.email,
              `Your Visa Application Confirmation - Application ID: ${singleApplication.id}`,
              visaApplicationEmail(visaApplicationMailData)
            );

            const invoiceMailData = {
              name: singleApplication.first_name + ' ' + singleApplication.last_name,
              invoiceNumber: invoice[0].invoice_number,
              bookingType: invoice[0].ref_type,
              date: new Date(invoice[0].created_at).toLocaleString(),
              totalTravelers: singleApplication.traveler,
              JType: 'Travelers',
              totalAmount: invoice[0].total_amount,
            };

            await Lib.sendEmail(
              singleApplication.email,
              `Invoice for Your Visa Application ID : ${singleApplication.id} | online travel agency`,
              invoiceTemplate(invoiceMailData)
            );
          }

          const moneyReceiptMailData: {
            name: string;
            invoiceNumber: string;
            transactionId: string;
            paymentTime: string;
            amount: number;
            paymentMethod: string;
            paymentGateway: string;
          } = {
            name: singleApplication.first_name + ' ' + singleApplication.last_name,
            invoiceNumber: invoice[0].invoice_number,
            transactionId: bank_tran_id,
            paymentTime: new Date(tran_date).toLocaleString(),
            // amount: amount,
            amount: sslResponse.data.store_amount,
            paymentMethod: card_issuer,
            paymentGateway: 'Payment has been made using payment gateway.',
          };

          await Lib.sendEmail(
            singleApplication.email,
            `Money Receipt for Your Visa Application ID : ${singleApplication.id} | online travel agency`,
            moneyReceiptTemplate(moneyReceiptMailData)
          );
        } else if (invoice[0].ref_type === 'flight') {
          const flightModel = this.Model.btocFlightBookingModel(trx);
          await flightModel.updateBooking({ status: FLIGHT_BOOKING_PAID }, invoice[0].ref_id);

          const bookingData = await flightModel.getSingleFlightBooking({
            id: invoice[0].ref_id,
          });

          const moneyReceiptMailData = {
            name: bookingData[0].first_name + ' ' + bookingData[0].last_name,
            invoiceNumber: invoice[0].invoice_number,
            transactionId: bank_tran_id,
            paymentTime: new Date(tran_date).toLocaleString(),
            // amount: amount,
            amount: sslResponse.data.store_amount,
            paymentMethod: card_issuer,
            paymentGateway: 'Payment has been made using payment gateway.',
          };

          await Lib.sendEmail(
            bookingData[0].email,
            `Money Receipt for Your Flight Booking ID : ${bookingData[0].id} | online travel agency`,
            moneyReceiptTemplate(moneyReceiptMailData)
          );
        }

        // Redirect URL with query parameters or return success response
        // console.log("isApp",value_a === 'true');
        if (value_a === 'true') {
          const successData = {
            // amount: amount.toString(),
            amount: sslResponse.data.store_amount,
            payment_time: tran_date,
            transaction_id: bank_tran_id,
            payment_type: card_type,
            invoice_id: invoice[0].id.toString(),
          };
          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: 'Payment has been successful',
            data: successData,
          };
        } else {
          const redirectParams = new URLSearchParams({
            // amount: amount.toString(),,
            amount: sslResponse.data.store_amount,
            payment_time: tran_date,
            transaction_id: bank_tran_id,
            payment_type: card_type,
            invoice_id: invoice[0].id.toString(),
          }).toString();

          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: 'Payment has been successful',
            redirect_url: `${CLIENT_URL}/paymentSuccess?${redirectParams}`,
          };
        }
      }

      if (value_a === 'true') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Invalid payment type',
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Invalid payment type',
          redirect_url: `${CLIENT_URL}/paymentFail`,
        };
      }
    });
  }

  // payment cancelled
  public async paymentCancelled(req: Request) {
    return this.db.transaction(async (trx) => {
      const { tran_id, value_a } = req.body;
      if (!tran_id || tran_id.split('-').length !== 2) {
        if (value_a === 'true') {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Unverified Transaction',
          };
        } else {
          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: 'Unverified Transaction',
            redirect_url: `${CLIENT_URL}/paymentCancel`,
          };
        }
      }

      const [paymentType, invoiceId] = tran_id.split('-');
      const paymentModel = this.Model.paymentModel(trx);
      const invoice = await paymentModel.singleInvoice(invoiceId);

      if (invoice[0].total_amount === invoice[0].due) {
        if (invoice[0].ref_type === 'visa') {
          const model = this.Model.VisaModel(trx);
          const data = await model.deleteApplication(invoice[0].ref_id);
          await paymentModel.deleteInvoice(invoiceId);
        } else if (invoice[0].ref_type === 'tour') {
          const model = this.Model.tourPackageBookingModel(trx);
          await model.deleteTourPackageBook(invoice[0].ref_id);
          await paymentModel.deleteInvoice(invoiceId);
        }
      }

      if (value_a === 'true') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Payment cancelled',
        };
      } else {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'Payment cancelled',
          redirect_url: `${CLIENT_URL}/paymentCancel`,
        };
      }
    });
  }

  //payment confirm (BRAC BANK)
  public async b2cBracBankPaymentConfirm(req: Request) {
    return this.db.transaction(async (trx) => {
      const { ref_id } = req.params as unknown as {
        ref_id: string;
      };
      console.log({ brac_response: req.body });
      const paymentModel = this.Model.paymentModel(trx);
      const invoice = await paymentModel.getSingleInvoiceByInvoiceNumber(ref_id);
      console.log({ invoice });
      if (!invoice.length) {
        await this.Model.errorLogsModel().insert({
          level: ERROR_LEVEL_INFO,
          message: `B2C Brac Payment Response`,
          url: ``,
          http_method: 'POST',
          source: 'B2C',
          user_id: invoice[0].user_id,
          metadata: {
            message: "No invoice has been found with this id",
            payload: { ref_id },
            response: invoice,
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
          message: `B2C Brac Payment Response`,
          url: ``,
          http_method: 'POST',
          source: 'B2C',
          user_id: invoice[0].user_id,
          metadata: {
            message: "Reference ID already validated",
            payload: { ref_id },
            response: invoice,
          },
        });
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Reference ID already validated',
          redirect_url: `${CLIENT_URL}/paymentFail`,
        };
      }

      await this.Model.errorLogsModel().insert({
        level: ERROR_LEVEL_INFO,
        message: `B2C Brac Payment Response`,
        url: ``,
        http_method: 'POST',
        source: 'B2C',
        user_id: invoice[0].user_id,
        metadata: {
          api: 'BRAC',
          endpoint: ``,
          payload: { ref_id },
          response: req.body,
        },
      });

      if (
        req.body.decision !== 'ACCEPT' ||
        req.body.auth_response !== '00' ||
        req.body.reason_code !== '100'
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Transaction failed',
          redirect_url: `${CLIENT_URL}/paymentFail`,
        };
      }

      const calculatedSignature = sign(req.body);
      const isValid = req.body.signature === calculatedSignature;
      console.log({ isValid });
      if (isValid) {
        //get actual amount by deducting the BRAC percentage from the total paid amount
        const actual_amount = parseFloat(
          Lib.calculateAdjustedAmount(req.body.auth_amount, BRAC_PERCENTAGE, 'subtract').toFixed(2)
        );

        // Accessing submitTimeUtc (payment time)
        const paymentTimeUTC = new Date(
          req.body.auth_time.slice(0, 10) +
          'T' +
          req.body.auth_time.slice(11, 17).replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') +
          'Z'
        )
          .toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: false })
          .replace(',', '');
        const [datePart, timePart] = paymentTimeUTC.split(' ');

        // Extract parts
        const [day, month, year] = datePart.split('/');

        // Build ISO string manually
        const isoString = `${year}-${month}-${day}T${timePart}+06:00`;

        // Create Date
        const paymentTime = new Date(isoString).toISOString();

        // Accessing the transaction ID
        const transactionId = req.body.transaction_id;

        // Accessing the payment type
        const paymentType = req.body.card_type_name;

        //Accessing the card number
        const cardNumber = req.body.req_card_number;

        const remainDue = Math.max(Number(invoice[0].due) - actual_amount, 0);

        await paymentModel.updateInvoice({ due: remainDue }, invoice[0].id);

        // Create money receipt
        await paymentModel.createMoneyReceipt({
          invoice_id: invoice[0].id,
          amount: actual_amount,
          payment_time: paymentTime,
          transaction_id: transactionId,
          payment_type: paymentType,
          details: 'Payment has been made using brac bank payment gateway.',
          payment_by: cardNumber,
          payment_gateway: 'Brac',
        });

        let emailTitle = `Payment has been done for invoice ${invoice[0].invoice_number} | B2C`;
        let details = '';

        if (invoice[0].ref_type === INVOICE_TYPE_FLIGHT) {
          await new BtoCFlightBookingSubService(trx).ticketIssueSubService(invoice[0].ref_id);
          //update convenience fee
          await this.Model.btocFlightBookingModel(trx).updateBooking({ convenience_fee: (Number(req.body.auth_amount) * BRAC_PERCENTAGE) / 100 }, invoice[0].ref_id);

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
          amount: req.body.auth_amount.toString(),
          actual_amount: actual_amount.toString(),
          brac_percentage: BRAC_PERCENTAGE.toString(),
          payment_time: paymentTime,
          transaction_id: transactionId,
          payment_type: paymentType,
          invoice_number: invoice[0].invoice_number.toString(),
          invoice_id: invoice[0].id,
        }).toString();

        //send mail
        await Lib.sendEmail(
          [
            PROJECT_EMAIL_ACCOUNT_1,
      
          ],
          emailTitle,
          paymentSuccessTemplate({
            name: invoice[0].first_name + ' ' + invoice[0].last_name,
            amount: actual_amount,
            gatewayCharge: BRAC_PERCENTAGE,
            paymentMethod: 'CARD',
            invoiceId: invoice[0].invoice_number,
            paymentTime: paymentTime,
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
            gatewayCharge: BRAC_PERCENTAGE,
            paymentMethod: 'CARD',
            invoiceId: invoice[0].invoice_number,
            paymentTime: paymentTime,
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
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Payment fail',
          redirect_url: `${CLIENT_URL}/paymentFail`,
        };
      }
    });
  }

  //payment cancel (BRAC BANK)
  public async b2cBracBankPaymentCancel(req: Request) {
    const { ref_id } = req.params as unknown as {
      ref_id: string;
    };

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Payment has been cancelled',
      redirect_url: `${CLIENT_URL}/paymentCancel`,
    };
  }

  public async btobBracPaymentSuccess(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { ref_id, ag_id } = req.query as unknown as {
        ref_id: string;
        ag_id: number;
      };
      console.log({ params: req.params });
      console.log({ query: req.query });
      console.log({ body: req.body });

      await this.Model.errorLogsModel().insert({
        level: ERROR_LEVEL_INFO,
        message: `B2B Brac Payment Response`,
        url: ``,
        http_method: 'POST',
        source: 'B2B',
        user_id: ag_id,
        metadata: {
          api: 'BRAC',
          endpoint: ``,
          payload: { ref_id, ag_id },
          response: req.body,
        },
      });

      if (
        req.body.decision !== 'ACCEPT' ||
        req.body.auth_response !== '00' ||
        req.body.reason_code !== '100'
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Transaction failed',
          redirect_url: `${BTOB_URL}/payment-failed`,
        };
      }
      const calculatedSignature = sign(req.body);
      const isValid = req.body.signature === calculatedSignature;
      console.log({ isValid });
      if (isValid) {
        // get single agency
        const agency_model = this.Model.agencyModel(trx);

        const agency = await agency_model.getSingleAgency(ag_id);

        if (!agency.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Invalid agency ID',
            redirect_url: `${BTOB_URL}/payment-failed`,
          };
        }

        //get actual amount by deducting the BRAC percentage from the total paid amount
        const actual_amount = parseFloat(
          Lib.calculateAdjustedAmount(req.body.auth_amount, BRAC_PERCENTAGE, 'subtract').toFixed(2)
        );

        // Accessing submitTimeUtc (payment time)
        const paymentTimeUTC = new Date(
          req.body.auth_time.slice(0, 10) +
          'T' +
          req.body.auth_time.slice(11, 17).replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') +
          'Z'
        )
          .toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: false })
          .replace(',', '');
        const [datePart, timePart] = paymentTimeUTC.split(' ');

        // Extract parts
        const [day, month, year] = datePart.split('/');

        // Build ISO string manually
        const isoString = `${year}-${month}-${day}T${timePart}+06:00`;

        // Create Date
        const paymentTime = new Date(isoString).toISOString();

        // Accessing the transaction ID
        const transactionId = req.body.transaction_id;

        // Accessing the payment type
        const paymentType = req.body.card_type_name;

        //Accessing the card number
        const cardNumber = req.body.req_card_number;

        await agency_model.insertAgencyLedger({
          agency_id: agency[0].id,
          type: 'credit',
          amount: actual_amount,
          details: `Credit load has been made using Brac Bank's payment gateway. card number : ${cardNumber}. Transaction id : ${transactionId}. gateway charge: ${BRAC_PERCENTAGE}`,
          topup: true,
          payment_gateway: 'Brac',
        });

        const redirectParams = new URLSearchParams({
          amount: req.body.auth_amount.toString(),
          credit_load: actual_amount.toString(),
          brac_percentage: BRAC_PERCENTAGE.toString(),
          date: paymentTime,
          transaction_id: transactionId,
          payment_type: paymentType,
        }).toString();

        //send mail
        await Lib.sendEmail(
          [
            PROJECT_EMAIL_ACCOUNT_1,
      
          ],
          `Top-up of amount ${actual_amount}`,
          agentTopUpSuccessTemplate({
            agencyName: agency[0].agency_name,
            amount: actual_amount,
            gatewayCharge: BRAC_PERCENTAGE,
            paymentMethod: 'CARD',
            paymentTime: paymentTime,
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
            gatewayCharge: BRAC_PERCENTAGE,
            paymentMethod: 'CARD',
            paymentTime: paymentTime,
            transactionId,
            paymentType,
            paymentUsing: cardNumber,
          })
        );

        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'Payment successful',
          redirect_url: `${BTOB_URL}/payment-succeeded?${redirectParams}`,
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Payment failed',
          redirect_url: `${BTOB_URL}/payment-failed`,
        };
      }
    });
  }

  // payment cancelled for btob brac payment
  public async btobBracPaymentCancelled(req: Request) {
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Payment cancelled',
      redirect_url: `${BTOB_URL}/payment-failed`,
    };
  }

  // payment failed for btob brac payment
  public async btobBracPaymentFailed(req: Request) {
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Payment Failed',
      redirect_url: `${BTOB_URL}/payment-failed`,
    };
  }

  // get single payment link
  public async getSinglePaymentLink(req: Request) {
    const model = this.Model.commonModel();
    const id = +req.params.id;
    const data = await model.getSinglePaymentLink({ id });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }
}

function sign(params: string) {
  return signData(buildDataToSign(params), config.BRAC_VALIDATION_SECRET_KEY);
}

function signData(data: any, secretKey: string) {
  return crypto.createHmac('sha256', secretKey).update(data).digest('base64');
}

function buildDataToSign(params: any) {
  const signedFieldNames = params.signed_field_names.split(',');
  const dataToSign = signedFieldNames.map((field: string | number) => `${field}=${params[field]}`);
  return dataToSign.join(',');
}

export default PublicPaymentService;
