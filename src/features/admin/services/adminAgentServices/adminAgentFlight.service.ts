import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  CUSTOM_API,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_TICKET_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  JOURNEY_TYPE_MULTI_CITY,
  JOURNEY_TYPE_ONE_WAY,
  JOURNEY_TYPE_ROUND_TRIP,
  PENDING_TICKET_ISSUANCE_STATUS,
  SABRE_API,
  TRIPJACK_API,
  VERTEIL_API,
} from '../../../../utils/miscellaneous/flightMiscellaneous/flightConstants';
import SabreFlightService from '../../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import { BtoBFlightBookingSubService } from '../../../agent/services/subServices/BtoBFlightBookingSubService';
import Lib from '../../../../utils/lib/lib';
import { template_onCancelFlightBooking_send_to_agent } from '../../../../utils/templates/flightBookingCancelTemplates';
import {
  INVOICE_TYPE_FLIGHT,
  PROJECT_IMAGE_URL,
  TRAVELER_TYPE_PASSENGERS,
  PROJECT_EMAIL_API_1,

} from '../../../../utils/miscellaneous/constants';
import { SendBookingEmailService } from '../../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service';
import CustomError from '../../../../utils/lib/customError';
import { IBlockedBookingUPdatePayload } from '../../../../utils/interfaces/flight/flightBookingInterface';
import VerteilFlightService from '../../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service';
import TripjackFlightSupportService from '../../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service';
import { IFormattedFlightItinerary } from '../../../../utils/supportTypes/flightSupportTypes/commonFlightTypes';
import { IFlightBookingPassengerReqBody } from '../../../../utils/supportTypes/flightBookingTypes/commonFlightBookingTypes';
import { BookingPaymentService } from '../../../agent/services/subServices/payment.service';
import {
  IAdminAgentFlightManualBookingPayload,
  IEditBookingPayload,
} from '../../utils/types/adminAgentTypes/adminAgentFlight.type';
import { email_template_to_send_notification } from '../../../../utils/templates/adminNotificationTemplate';
import { flightBookStatusTemplate } from '../../../../utils/templates/flightBookingHoldTemplate';

export default class AdminAgentFlightService extends AbstractServices {
  constructor() {
    super();
  }
  //Flight booking cancel
  public async flightBookingCancel(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: user_id } = req.admin;
      const { id: booking_id } = req.params;
      const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
      //check booking info
      const checkFlightBooking = await flightBookingModel.getSingleFlightBooking({
        id: Number(booking_id),
        status: [FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_IN_PROCESS],
      });
      if (!checkFlightBooking.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      let cancelBookingRes: {
        success: boolean;
        code: number;
        message: string;
      } = {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };

      if (checkFlightBooking[0].api === SABRE_API) {
        //sabre
        const sabreSubService = new SabreFlightService(trx);
        await sabreSubService.SabreBookingCancelService({
          pnr: checkFlightBooking[0].pnr_code,
        });
        cancelBookingRes.success = true;
        cancelBookingRes.message = 'Booking has been cancelled successfully';
        cancelBookingRes.code = this.StatusCode.HTTP_OK;
      } else if (checkFlightBooking[0].api === VERTEIL_API) {
        const segmentDetails = await flightBookingModel.getFlightSegment(Number(booking_id));
        const verteilSubService = new VerteilFlightService(trx);
        cancelBookingRes = await verteilSubService.OrderCancelService({
          airlineCode: segmentDetails[0].airline_code,
          pnr: checkFlightBooking[0].pnr_code,
        });
      } else if (checkFlightBooking[0].api === CUSTOM_API) {
        cancelBookingRes.success = true;
        cancelBookingRes.message = 'Booking has been cancelled successfully';
      } else if (checkFlightBooking[0].api === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        cancelBookingRes = await tripjackSubService.CancelBookingService(
          checkFlightBooking[0].api_booking_ref,
          checkFlightBooking[0].airline_pnr
        );
      }

      //if cancellation is successful, update the booking status
      if (cancelBookingRes.success === true) {
        // await flightBookingModel.updateBooking(
        //   { status: FLIGHT_BOOKING_CANCEL, cancelled_by: user_id },
        //   Number(booking_id)
        // );
        // //delete invoice
        // if (checkFlightBooking[0].invoice_id) {
        //   await this.Model.btobPaymentModel(trx).updateInvoice(
        //     { status: false },
        //     checkFlightBooking[0].invoice_id
        //   );
        // }
        const subService = new BtoBFlightBookingSubService(trx);
        await subService.cancelBooking({
          booking_id: Number(booking_id),
          booking_ref: checkFlightBooking[0].booking_ref,
          cancelled_by: user_id,
          invoice_id: checkFlightBooking[0].invoice_id,
          cancelled_from: 'ADMIN',
        });

        // await Lib.sendEmail(
        //   checkFlightBooking[0].user_email ||
        //     checkFlightBooking[0].agency_email,
        //   `Your flight booking (${checkFlightBooking[0].route}) has been Cancelled`,
        //   template_onCancelFlightBooking_send_to_agent({
        //     pnr:
        //       checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
        //       checkFlightBooking[0].pnr_code?.length > 6
        //         ? 'N/A'
        //         : String(checkFlightBooking[0].pnr_code),
        //     journey_type: checkFlightBooking[0].journey_type,
        //     payable_amount: checkFlightBooking[0].payable_amount,
        //     route: checkFlightBooking[0].route,
        //     total_passenger: checkFlightBooking[0].total_passenger,
        //   })
        // );

        await Lib.sendEmail(
          [PROJECT_EMAIL_API_1],
          `Your flight booking (${checkFlightBooking[0].route}) has been Cancelled`,
          template_onCancelFlightBooking_send_to_agent({
            pnr:
              checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
                checkFlightBooking[0].pnr_code?.length > 6
                ? 'N/A'
                : String(checkFlightBooking[0].pnr_code),
            journey_type: checkFlightBooking[0].journey_type,
            payable_amount: checkFlightBooking[0].payable_amount,
            route: checkFlightBooking[0].route,
            total_passenger: checkFlightBooking[0].total_passenger,
          })
        );
      }

      return cancelBookingRes;
    });
  }

  //get list of booking
  public async getBookingList(req: Request) {
    const query = req.query;
    const model = this.Model.b2bFlightBookingModel();
    const data = await model.getAllFlightBooking({ ...query });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  //get single booking
  public async getBookingSingle(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id } = req.params;
      const model = this.Model.b2bFlightBookingModel(trx);
      const data = await model.getSingleFlightBooking({
        id: Number(booking_id),
      });
      const segment = await model.getFlightSegment(Number(booking_id));
      const traveler = await model.getFlightBookingTraveler(Number(booking_id));
      const tracking = await model.getFlightBookingTracking(Number(booking_id));

      const fare_rules = await model.getFlightFareRules({ flight_booking_id: Number(booking_id) });

      //update data from external api
      await new BtoBFlightBookingSubService(trx).updateFromAPI({
        data,
        booking_id,
        segment,
        traveler,
      });

      let due_clear_last_day: string | undefined = undefined;

      const travel_date_from_now = data[0].partial_payment?.travel_date_from_now;
      if (typeof travel_date_from_now === 'number' && travel_date_from_now > 0) {
        due_clear_last_day = new Date(
          new Date(segment[0].departure_date).setDate(
            new Date(segment[0].departure_date).getDate() - travel_date_from_now
          )
        )
          .toISOString()
          .split('T')[0];
        data[0].partial_payment.travel_date_from_now = due_clear_last_day;
      }

      const balance = await this.Model.agencyModel(trx).getTotalBalance(Number(data[0].agency_id));
      data[0].balance = balance;

      const ssr = await model.getFlightBookingSSR(Number(booking_id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: { ...data[0], segment, traveler, tracking, ssr, fare_rules },
      };
    });
  }

  //Ticket Issue
  public async ticketIssue(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id } = req.params;
      const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      //check booking info
      const [checkFlightBooking, flightSegments, flightTravelers] = await Promise.all([
        flightBookingModel.getSingleFlightBooking({
          id: Number(booking_id),
          status: [FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_IN_PROCESS],
        }),
        flightBookingModel.getFlightSegment(Number(booking_id)),
        flightBookingModel.getFlightBookingTraveler(Number(booking_id)),
      ]);

      if (!checkFlightBooking.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      // //check balance
      // const balance = await agencyModel.getTotalDeposit(
      //   checkFlightBooking[0].agency_id
      // );

      // // console.log({ balance });

      // if (Number(checkFlightBooking[0].payable_amount) > Number(balance)) {
      //   return {
      //     success: false,
      //     code: this.StatusCode.HTTP_BAD_REQUEST,
      //     message: "There is insufficient balance in agency account",
      //   };
      // }

      let ticketIssueRes: {
        success: boolean;
        code: number;
        message: string;
        data?: string[];
        ticket_status?: string;
      } = {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
        data: [],
      };

      const getTraveler = await flightBookingModel.getFlightBookingTraveler(Number(booking_id));

      if (checkFlightBooking[0].api === SABRE_API) {
        const travelerSet = new Set(getTraveler.map((elem) => elem.type));
        const unique_traveler = travelerSet.size;
        //sabre
        const sabreSubService = new SabreFlightService(trx);
        ticketIssueRes = await sabreSubService.TicketIssueService({
          pnr: checkFlightBooking[0].pnr_code,
          unique_traveler,
        });
      } else if (checkFlightBooking[0].api === VERTEIL_API) {
        const segmentDetails = await flightBookingModel.getFlightSegment(Number(booking_id));
        const travelerDetails = await flightBookingModel.getFlightBookingTraveler(
          Number(booking_id)
        );
        const verteilSubService = new VerteilFlightService(trx);
        ticketIssueRes = await verteilSubService.TicketIssueService({
          airlineCode: segmentDetails[0].airline_code,
          oldFare: {
            vendor_total: checkFlightBooking[0].vendor_price.net_fare,
          },
          passengers: travelerDetails,
          pnr: checkFlightBooking[0].pnr_code,
        });
      } else if (checkFlightBooking[0].api === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        ticketIssueRes = await tripjackSubService.TicketIssueService({
          api_booking_ref: checkFlightBooking[0].api_booking_ref,
          vendor_total_price: checkFlightBooking[0].vendor_price.gross_fare,
        });
        const getBooking = await tripjackSubService.RetrieveBookingService(
          checkFlightBooking[0].api_booking_ref
        );
        ticketIssueRes.data = getBooking.ticket_numbers;
      }

      //if issue is successful, update the booking status and debit the amount
      if (ticketIssueRes.success === true) {
        //update booking data
        const flightBookingSubService = new BtoBFlightBookingSubService(trx);
        await flightBookingSubService.updateDataAfterTicketIssue({
          booking_id: Number(booking_id),
          agency_id: checkFlightBooking[0].agency_id,
          payable_amount: checkFlightBooking[0].payable_amount,
          booking_ref: checkFlightBooking[0].booking_ref,
          payment_type: 'full',
          invoice_id: checkFlightBooking[0].invoice_id,
          ticket_number: ticketIssueRes.data,
          travelers_info: getTraveler,
          user_id: checkFlightBooking[0].user_id,
          status: ticketIssueRes.data?.length === 0 ? FLIGHT_BOOKING_ON_HOLD : FLIGHT_TICKET_ISSUE,
          issued_by: 'ADMIN',
          partial_payment_percentage: 0,
        });

        //if status was ticket-in-process, then approve the request for pending ticket issuance
        if (checkFlightBooking[0].booking_status === FLIGHT_TICKET_IN_PROCESS) {
          await flightBookingModel.updateTicketIssuance(
            {
              status: PENDING_TICKET_ISSUANCE_STATUS.APPROVED,
              updated_at: new Date(),
            },
            { booking_id: Number(booking_id) }
          );
        }

        if (ticketIssueRes.data?.length && ticketIssueRes.data?.length > 0) {
          const travelers = flightTravelers.map((traveler) => ({
            type: traveler.type,
          }));

          const travelerCount = travelers.reduce<Record<string, number>>((acc, traveler) => {
            acc[traveler.type] = (acc[traveler.type] || 0) + 1;
            return acc;
          }, {});

          const formattedPassengerType = Object.entries(travelerCount)
            .map(([type, count]) => `${type}(${count})`)
            .join(', ');

          const formatDuration = (minutes: number) => {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''
              }`.trim();
          };

          const flightDetails = flightSegments.map((segment) => ({
            departure: `${segment.origin}`,
            arrival: `${segment.destination}`,
            duration: formatDuration(parseInt(segment.duration, 10)),
            details: {
              class: `CLASS: ${segment.class}`,
              departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
              lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
            },
            airline: {
              name: segment.airline,
              image: `${PROJECT_IMAGE_URL}/${segment.airline_logo}`,
              flight_number: segment.flight_number,
            },
            cabin: segment.class,
            departure_date: Lib.formatAMPM(
              new Date(
                segment.departure_date.toISOString().split('T')[0] +
                'T' +
                segment.departure_time.split('+')[0]
              )
            ),
          }));

          const flightBookingPdfData = {
            date_of_issue: new Date().toISOString().split('T')[0],
            bookingId: checkFlightBooking[0].booking_ref,
            bookingStatus: checkFlightBooking[0].booking_status,
            pnr:
              checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
                checkFlightBooking[0].pnr_code?.length > 6
                ? 'N/A'
                : String(checkFlightBooking[0].pnr_code),
            airlinePnr: checkFlightBooking[0].airline_pnr,
            numberOfPassengers: flightTravelers.length,
            journeyType: checkFlightBooking[0].journey_type,
            segments: flightDetails,
            passengers: flightTravelers.map((traveler, index) => ({
              name:
                String(traveler?.reference).toUpperCase() +
                ' ' +
                traveler.first_name +
                ' ' +
                traveler.last_name,
              gender: traveler.gender,
              dob: traveler.date_of_birth,
              phone: traveler.contact_number,
              reference: traveler.reference,
              ticket: ticketIssueRes.data ? ticketIssueRes.data[index] : '',
              type: traveler.type,
              passport_number: traveler.passport_number,
              frequent_flyer_number: traveler.frequent_flyer_number,
            })),

            agency: {
              email: checkFlightBooking[0]?.agency_email,
              phone: checkFlightBooking[0]?.agency_phone,
              address: checkFlightBooking[0]?.agency_address,
              photo: `${PROJECT_IMAGE_URL}/${checkFlightBooking[0]?.agency_logo}`,
              name: checkFlightBooking[0]?.agency_name,
            },
            baggage_information: {
              route: checkFlightBooking[0].route,
              check_in: flightSegments
                .map((segment) => {
                  return `${segment.flight_number} (${segment.airline}) - Baggage info: ${segment.baggage}`;
                })
                .join(','),
            },
          };

          // send email notification
          const bookingEmailSubService = new SendBookingEmailService();
          await bookingEmailSubService.sendFlightTicketIssuedEmail({
            flightBookTemplateData: {
              travel_date: flightSegments[0].departure_date,
              ticket_numbers: ticketIssueRes.data || [],
              journey_type: checkFlightBooking[0].journey_type,
              payable_amount: checkFlightBooking[0].payable_amount,
              route: checkFlightBooking[0].route,
              total_passenger: checkFlightBooking[0].total_passenger,
              due_amount: checkFlightBooking[0].due,
            },
            flightBookingPdfData: flightBookingPdfData,
            bookingId: booking_id,
            email: checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
          });
        } else {
          //ticket hold
          const formatDuration = (minutes: number) => {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''
              }`.trim();
          };
          const flightDetails = flightSegments.map((segment) => ({
            departure: `${segment.origin}`,
            arrival: `${segment.destination}`,
            duration: formatDuration(parseInt(segment.duration, 10)),
            details: {
              class: `CLASS: ${segment.class}`,
              departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
              lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
            },
            airline: {
              name: segment.airline,
              image: `${PROJECT_IMAGE_URL}/${segment.airline_logo}`,
              flight_number: segment.flight_number as string,
            },
            cabin: segment.class,
            departure_date: Lib.formatAMPM(
              new Date(
                segment.departure_date.toISOString().split('T')[0] +
                'T' +
                segment.departure_time.split('+')[0]
              )
            ),
          }));
          await Lib.sendEmail(
            [PROJECT_EMAIL_API_1],
            `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref} | B2B`,
            flightBookStatusTemplate({
              bookingId: checkFlightBooking[0].booking_ref,
              airline: flightSegments[0].airline,
              segments: flightDetails,
              journeyType: checkFlightBooking[0].journey_type,
              numberOfPassengers: flightTravelers.length,
              route: checkFlightBooking[0].route,
              status: FLIGHT_BOOKING_ON_HOLD,
              name: checkFlightBooking[0].created_by + ' (' + checkFlightBooking[0].agency_name + ')',
            })
          );
          await Lib.sendEmail(
            checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
            `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref}`,
            flightBookStatusTemplate({
              bookingId: checkFlightBooking[0].booking_ref,
              airline: flightSegments[0].airline,
              segments: flightDetails,
              journeyType: checkFlightBooking[0].journey_type,
              numberOfPassengers: flightTravelers.length,
              route: checkFlightBooking[0].route,
              status: FLIGHT_BOOKING_ON_HOLD,
              name: checkFlightBooking[0].created_by + ' (' + checkFlightBooking[0].agency_name + ')',
            })
          );
        }
      }

      // insert audit trail
      // await this.Model.auditTrailModel(trx).createBtoBAudit({
      //   agency_id,
      //   type: "update",
      //   created_by: user_id,
      //   details: `Ticket issued for booking ID: ${booking_id}.`,
      // });

      // Insert audit trail

      return ticketIssueRes;
    });
  }

  //update booking
  public async updateBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params as unknown as { id: number };
      const {
        status,
        deduction_amount,
        gds_pnr,
        payment,
        airline_pnr,
        ticket_numbers,
        ticket_issue_last_time,
      } = req.body as {
        status: string;
        deduction_amount: number;
        gds_pnr: string;
        airline_pnr: string;
        ticket_numbers: {
          traveler_id: number;
          ticket_number: string;
        }[];
        ticket_issue_last_time: string;
        payment: boolean;
      };
      const b2bBookingModel = this.Model.b2bFlightBookingModel(trx);
      const booking_data = await b2bBookingModel.getSingleFlightBooking({ id });
      //check the booking
      if (!booking_data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      //update status
      if (status !== booking_data[0].booking_status) {
        await b2bBookingModel.updateBooking(
          {
            status,
            pnr_code: gds_pnr,
            airline_pnr,
            last_time: ticket_issue_last_time,
          },
          id
        );
      }

      //refund amount
      if (deduction_amount && deduction_amount > 0) {
        const invoice_id = booking_data[0].invoice_id;
        const invoiceModel = this.Model.btobPaymentModel(trx);
        const getInvoice = await invoiceModel.getInvoice({ invoice_id });
        //check the invoice
        if (!getInvoice.data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.HTTP_NOT_FOUND,
          };
        }

        //check if already refunded
        if (getInvoice.data[0].refund_amount) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: 'Amount has been refunded already',
          };
        }

        //paid amount
        const paidAmount = Number(getInvoice.data[0].total_amount) - Number(getInvoice.data[0].due);
        //check if the paid amount is less then the deducted amount
        if (Number(paidAmount) < Number(deduction_amount)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Deduction amount is less then the paid amount',
          };
        }
        const returnAmount = Number(paidAmount) - Number(deduction_amount);
        //update invoice due, refund amount
        await invoiceModel.updateInvoice({ refund_amount: deduction_amount, due: 0 }, invoice_id);
        //credit amount to agency
        const agencyModel = this.Model.agencyModel(trx);
        await agencyModel.insertAgencyLedger({
          agency_id: booking_data[0].agency_id,
          amount: returnAmount,
          type: 'credit',
          details: `Amount refunded for booking id ${booking_data[0].booking_ref} invoice id ${getInvoice.data[0].invoice_number}`,
        });
      }

      //ticket issue
      if (status === FLIGHT_TICKET_ISSUE) {
        const invoiceModel = this.Model.btobPaymentModel(trx);
        const { invoice_id, agency_id, booking_ref, user_id } = booking_data[0];
        const { data: [invoice] = [] } = await invoiceModel.getInvoice({
          invoice_id,
        });

        if (payment) {
          if (!invoice) {
            throw new CustomError('No invoice found', this.StatusCode.HTTP_NOT_FOUND);
          }

          if (invoice.due > 0) {
            const agencyModel = this.Model.agencyModel(trx);
            const balance = await agencyModel.getTotalBalance(agency_id);

            if (balance < invoice.due) {
              throw new CustomError(
                this.ResMsg.INSUFFICIENT_AGENCY_BALANCE,
                this.StatusCode.HTTP_BAD_REQUEST
              );
            }

            await invoiceModel.updateInvoice({ due: 0 }, invoice_id);

            await invoiceModel.createMoneyReceipt({
              amount: invoice.due,
              invoice_id,
              details: `payment has been done for booking id ${booking_ref}`,
              user_id: user_id,
            });

            await agencyModel.insertAgencyLedger({
              agency_id,
              amount: invoice.due,
              type: 'debit',
              details: `Amount deducted for ticket issuance — Booking ID ${booking_ref}, Invoice ID ${invoice.invoice_number}`,
            });
          }
        }
      }

      if (ticket_numbers?.length) {
        await Promise.all(
          ticket_numbers.map(({ ticket_number, traveler_id }) =>
            b2bBookingModel.updateFlightBookingTraveler({ ticket_number }, traveler_id)
          )
        );
      }

      await b2bBookingModel.insertFlightBookingTracking({
        flight_booking_id: Number(id),
        details: `Booking has been updated manually. Status - ${status}`,
      });

      //send email to admin
      await Lib.sendEmail(
        [PROJECT_EMAIL_API_1],
        `Agency booking has been updated`,
        email_template_to_send_notification({
          title: 'Agency booking has been updated',
          details: {
            details: `Agency booking has been updated manually to ${status}`,
          },
        })
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  // Add a reminder to issue the flight
  public async reminderBooking(req: Request) {
    const { id: booking_id } = req.params;
    const flightBookingModel = this.Model.b2bFlightBookingModel();
    //check booking info
    const [checkFlightBooking, flightSegments, flightTravelers] = await Promise.all([
      flightBookingModel.getSingleFlightBooking({
        id: Number(booking_id),
        status: [FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_IN_PROCESS],
      }),
      flightBookingModel.getFlightSegment(Number(booking_id)),
      flightBookingModel.getFlightBookingTraveler(Number(booking_id)),
    ]);

    if (!checkFlightBooking.length) {
      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    }

    if (
      checkFlightBooking[0].booking_status === FLIGHT_BOOKING_CONFIRMED ||
      checkFlightBooking[0].booking_status === FLIGHT_BOOKING_IN_PROCESS
    ) {
      const formatDuration = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''
          }`.trim();
      };

      const flightDetails = flightSegments.map((segment) => ({
        departure: `${segment.origin}`,
        arrival: `${segment.destination}`,
        duration: formatDuration(parseInt(segment.duration, 10)),
        details: {
          class: `CLASS: ${segment.class}`,
          departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
          lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
        },
        airline: {
          name: segment.airline,
          image: `${PROJECT_IMAGE_URL}/${segment.airline_logo}`,
          flight_number: segment.flight_number,
        },
        cabin: segment.class,
        departure_date: Lib.formatAMPM(
          new Date(
            segment.departure_date.toISOString().split('T')[0] +
            'T' +
            segment.departure_time.split('+')[0]
          )
        ),
      }));

      const flightBookingPdfData = {
        date_of_issue: new Date().toISOString().split('T')[0],
        bookingId: checkFlightBooking[0].booking_ref,
        bookingStatus: checkFlightBooking[0].booking_status,
        pnr:
          checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
            checkFlightBooking[0].pnr_code?.length > 6
            ? 'N/A'
            : String(checkFlightBooking[0].pnr_code),
        airlinePnr: checkFlightBooking[0].airline_pnr,
        numberOfPassengers: flightTravelers.length,
        journeyType: checkFlightBooking[0].journey_type,
        segments: flightDetails,
        passengers: flightTravelers.map((traveler, index) => ({
          name:
            String(traveler?.reference).toUpperCase() +
            ' ' +
            traveler.first_name +
            ' ' +
            traveler.last_name,
          gender: traveler.gender,
          dob: traveler.date_of_birth,
          phone: traveler.contact_number,
          reference: traveler.reference,
          ticket: traveler.ticket_number ? traveler.ticket_number : '',
          type: traveler.type,
          passport_number: traveler.passport_number,
          frequent_flyer_number: traveler.frequent_flyer_number,
        })),

        agency: {
          email: checkFlightBooking[0]?.agency_email,
          phone: checkFlightBooking[0]?.agency_phone,
          address: checkFlightBooking[0]?.agency_address,
          photo: `${PROJECT_IMAGE_URL}/${checkFlightBooking[0]?.agency_logo}`,
          name: checkFlightBooking[0]?.agency_name,
        },
        baggage_information: {
          route: checkFlightBooking[0].route,
          check_in: flightSegments
            .map((segment) => {
              return `${segment.flight_number} (${segment.airline}) - Baggage info: ${segment.baggage}`;
            })
            .join(','),
        },
      };

      // send email notification
      const bookingEmailSubService = new SendBookingEmailService();
      await bookingEmailSubService.sendReminderToIssueTicket({
        flightBookTemplateData: {
          travel_date: flightSegments[0].departure_date,
          ticket_numbers: [],
          journey_type: checkFlightBooking[0].journey_type,
          payable_amount: checkFlightBooking[0].payable_amount,
          route: checkFlightBooking[0].route,
          total_passenger: checkFlightBooking[0].total_passenger,
          due_amount: checkFlightBooking[0].due,
        },
        flightBookingPdfData: flightBookingPdfData,
        bookingId: checkFlightBooking[0].booking_ref,
        last_time: checkFlightBooking[0].last_time,
        email: checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
      });
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'A reminder has been sent ',
    };
  }

  //get all pending ticket issuance request
  public async getPendingTicketIssuance(req: Request) {
    const model = this.Model.b2bFlightBookingModel();
    const data = await model.getPendingTicketIssuance(req.query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  //update pending ticket issuance request
  public async updateTicketIssuance(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.b2bFlightBookingModel(trx);
      const id = req.params.id;
      const { status, ticket_numbers } = req.body;
      //get ticket issuance data
      const data = await model.getPendingTicketIssuance({ id: Number(id) });
      if (!data.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      //update pending ticket issuance
      await model.updateTicketIssuance({ status, updated_at: new Date() }, { id: Number(id) });

      //update booking status
      if (status === PENDING_TICKET_ISSUANCE_STATUS.APPROVED) {
        await model.updateBooking({ status: FLIGHT_TICKET_ISSUE }, data.data[0].booking_id);
        //update ticket
        if (ticket_numbers && ticket_numbers.length) {
          await Promise.all(
            ticket_numbers.map((elem: { ticket_number: string; traveler_id: number }) =>
              model.updateFlightBookingTraveler(
                { ticket_number: elem.ticket_number },
                elem.traveler_id
              )
            )
          );
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  //update blocked booking
  public async updateBlockedBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params as unknown as { id: number };
      const payload = req.body as IBlockedBookingUPdatePayload;
      const adminId = (req.admin as { id: number }).id;

      const b2bBookingModel = this.Model.b2bFlightBookingModel(trx);
      const invoiceModel = this.Model.btobPaymentModel(trx);

      const [booking] = await b2bBookingModel.getSingleFlightBooking({ id });
      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { invoice_id, agency_id, booking_ref, user_id, booking_status } = booking;

      if (![FLIGHT_BOOKING_IN_PROCESS].includes(booking_status)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: `Booking update is not allowed. The booking is already in '${booking_status}' status.`,
        };
      }

      if (payload.status === FLIGHT_TICKET_ISSUE) {
        const { data: [invoice] = [] } = await invoiceModel.getInvoice({
          invoice_id,
        });

        if (!invoice) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.HTTP_NOT_FOUND,
          };
        }

        if (!invoice.due) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: 'There is no due amount for the invoice.',
          };
        }

        const agencyModel = this.Model.agencyModel(trx);
        const balance = await agencyModel.getTotalBalance(agency_id);

        if (balance < invoice.total_amount) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.INSUFFICIENT_AGENCY_BALANCE,
          };
        }

        if (payload.ticket_numbers?.length) {
          await Promise.all(
            payload.ticket_numbers.map(({ ticket_number, traveler_id }) =>
              b2bBookingModel.updateFlightBookingTraveler({ ticket_number }, traveler_id)
            )
          );
        }

        await invoiceModel.updateInvoice({ due: 0 }, invoice_id);

        await invoiceModel.createMoneyReceipt({
          amount: invoice.total_amount,
          invoice_id,
          details: `payment has been done for booking id ${booking_ref}`,
          user_id: user_id,
        });

        await agencyModel.insertAgencyLedger({
          agency_id,
          amount: invoice.total_amount,
          type: 'debit',
          details: `Amount deducted for ticket issuance — Booking ID ${booking_ref}, Invoice ID ${invoice.invoice_number}`,
        });
      }

      if (payload.status === FLIGHT_BOOKING_CANCELLED) {
        await invoiceModel.updateInvoice({ status: false }, invoice_id);
      }

      await b2bBookingModel.updateBooking(
        {
          status: payload.status,
          last_time: payload.last_time,
          airline_pnr: payload.airline_pnr,
          pnr_code: payload.pnr_code,
          api_booking_ref: payload.api_booking_ref,
          cancelled_by: payload.status === FLIGHT_BOOKING_CANCELLED ? adminId : undefined,
        },
        id
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  //pnr share
  public async pnrShare(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, pnr, supplier_booking_ref, supplier } = req.body;
      const model = this.Model.b2bFlightBookingModel(trx);
      const agency_model = this.Model.agencyModel(trx);
      const agency_info = await agency_model.getSingleAgency(agency_id);
      if (!agency_info?.[0]?.commission_set_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No markup set has been found for this agency. Please set a markup first.',
        };
      }

      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      const set_flight_api_id = await dynamicFareModel.getSuppliers({
        set_id: agency_info[0].commission_set_id,
        status: true,
        api_name: supplier,
      });

      if (!set_flight_api_id.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: `For this markup set ${supplier} is not active. Please active the API first.`,
        };
      }

      //check pnr or api booking id if it already exists
      const check_pnr = await model.getAllFlightBooking({
        limit: '1',
        skip: '0',
        pnr,
        api_booking_ref: supplier_booking_ref
      });

      if (check_pnr.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'PNR already exists',
        };
      }
      let res: {
        flight_details: IFormattedFlightItinerary;
        gds_pnr: string;
        airline_pnr: string;
        last_time?: string | null;
        status: string;
        passenger_data: IFlightBookingPassengerReqBody[];
      };

      if (supplier === SABRE_API) {
        const sabreSubService = new SabreFlightService(trx);
        res = await sabreSubService.pnrShare(pnr, set_flight_api_id[0].id);
      } else if (supplier === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        res = await tripjackSubService.pnrShareService(supplier_booking_ref, set_flight_api_id[0].id);
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No supplier has been found with this name',
        };
      }
      //insert booking data
      const subServices = new BtoBFlightBookingSubService(trx);
      const { booking_id, booking_ref } = await subServices.insertFlightBookingData({
        pnr: res.gds_pnr,
        flight_details: res.flight_details,
        passengers: res.passenger_data,
        api_booking_ref: '',
        airline_pnr: res.airline_pnr,
        refundable: res.flight_details.refundable,
        name: agency_info[0].agency_name,
        email: agency_info[0].email,
        last_time: String(res.last_time),
        agency_id,
        files: [],
        status: res.status,
        api: res.flight_details.api,
        details: `Booking has been created using PNR Share`,
        convenience_fee: 0,
      });

      //invoice
      const invoiceSubService = new BookingPaymentService(trx);
      await invoiceSubService.createInvoice({
        agency_id,
        ref_id: booking_id,
        ref_type: INVOICE_TYPE_FLIGHT,
        total_amount: res.flight_details.fare.payable,
        due: res.flight_details.fare.payable,
        details: `Invoice has been created for flight Id ${booking_ref}`,
        user_name: agency_info[0].agency_name,
        email: agency_info[0].email,
        total_travelers: res.passenger_data.length,
        travelers_type: TRAVELER_TYPE_PASSENGERS,
        bookingId: booking_ref,
        agency_logo: agency_info[0].agency_logo,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'PNR has been inserted',
        data: {
          id: booking_id,
        },
      };
    });
  }

  // get Pnr Details
  public async getPnrDetails(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, pnr, gds } = req.body;
      const model = this.Model.b2bFlightBookingModel(trx);
      const agency_model = this.Model.agencyModel(trx);
      const agency_info = await agency_model.getSingleAgency(agency_id);
      if (!agency_info?.[0]?.commission_set_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No markup set has been found for this agency. Please set a markup first.',
        };
      }

      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      const set_flight_api_id = await dynamicFareModel.getSuppliers({
        set_id: agency_info[0].commission_set_id,
        status: true,
        api_name: gds,
      });

      if (!set_flight_api_id.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: `For this markup set ${gds} is not active. Please active the API first.`,
        };
      }

      //check pnr if it already exists
      const check_pnr = await model.getAllFlightBooking({
        limit: '1',
        skip: '0',
        pnr,
      });

      if (check_pnr.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'PNR already exists',
        };
      }
      let res: {
        flight_details: IFormattedFlightItinerary;
        gds_pnr: string;
        airline_pnr: string;
        last_time?: string | null;
        status: string;
        passenger_data: IFlightBookingPassengerReqBody[];
      };

      if (gds === SABRE_API) {
        const sabreSubService = new SabreFlightService(trx);
        res = await sabreSubService.pnrShare(pnr, set_flight_api_id[0].id);
      } else if (gds === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        res = await tripjackSubService.pnrShareService(pnr, set_flight_api_id[0].id);
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No GDS has been found with this name',
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { ...res, agency_id },
      };
    });
  }

  public async manualBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const body = req.body as IAdminAgentFlightManualBookingPayload;
      const model = this.Model.b2bFlightBookingModel(trx);
      const agency_model = this.Model.agencyModel(trx);
      const agency_info = await agency_model.getSingleAgency(body.agency_id);
      if (!agency_info.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No agency has been found with this ID',
        };
      }

      const ticket_price = body.base_fare + body.total_tax + body.ait;
      const payable_amount = ticket_price + body.convenience_fee + body.markup - body.discount;

      if (body.status === FLIGHT_TICKET_ISSUE && body.payment !== 'paid') {
        //check balance
        const agencyBalance = await agency_model.getTotalBalance(body.agency_id);
        const flightBookingSubService = new BtoBFlightBookingSubService(trx);
        const checkBalance = await flightBookingSubService.checkAgencyBalanceForTicketIssue({
          agency_balance: agencyBalance,
          ticket_price: payable_amount,
          payment_type: body.payment,
          partial_payment_percentage: Number(body.partial_payment_rules?.payment_percentage) / 100,
        });
        if (checkBalance.success === false) {
          return checkBalance;
        }
      }

      let vendor_price:
        | (typeof body.vendor_price & { gross_fare: number; net_fare: number })
        | undefined = undefined;
      if (body.vendor_price) {
        vendor_price = {
          ...body.vendor_price,
          gross_fare: body.vendor_price.base_fare + body.vendor_price.tax,
          net_fare:
            body.vendor_price.base_fare +
            body.vendor_price.tax +
            body.vendor_price.charge -
            body.vendor_price.discount,
        };
      }
      const route = Lib.getRouteOfFlight(body.leg_description);
      const booking_ref = await new BtoBFlightBookingSubService().generateUniqueBookingNumber(trx);

      const booking_id = await model.insertFlightBooking({
        agency_id: body.agency_id,
        pnr_code: body.pnr_code,
        total_passenger: body.travelers.length,
        base_fare: Number(body.base_fare + body.markup),
        total_tax: body.total_tax,
        payable_amount,
        ait: body.ait,
        discount: body.discount,
        convenience_fee: body.convenience_fee,
        refundable: body.refundable,
        api: body.api,
        journey_type: body.journey_type,
        route,
        booking_id: booking_ref,
        airline_pnr: body.airline_pnr,
        api_booking_ref: body.api_booking_ref,
        last_time: body.last_time,
        status: body.status,
        vendor_price,
        markup: {
          base_fare: body.base_fare,
          markup: body.markup,
        },
        manual_booking: true,
        ticket_issued_on: body.status === FLIGHT_TICKET_ISSUE ? new Date() : undefined
      });

      const segments = await Promise.all(
        body.flights.map(async (flight) => {
          const airline_details = await this.Model.commonModel(trx).getAirlineDetails(
            flight.airline_code
          );
          const dAirport = await this.Model.commonModel(trx).getAirportDetails(flight.origin);
          const AAirport = await this.Model.commonModel(trx).getAirportDetails(flight.destination);
          return {
            flight_booking_id: booking_id[0].id,
            airline: airline_details.airline_name,
            airline_logo: airline_details.airline_logo,
            airline_code: flight.airline_code,
            departure_date: flight.departure_date,
            departure_time: flight.departure_time,
            departure_terminal: flight.departure_terminal,
            arrival_date: flight.arrival_date,
            arrival_time: flight.arrival_time,
            arrival_terminal: flight.arrival_terminal,
            baggage: flight.baggage,
            class: flight.class,
            origin:
              dAirport.airport_name + ' (' + dAirport.city_name + ',' + dAirport.city_code + ')',
            destination:
              AAirport.airport_name + ' (' + AAirport.city_name + ',' + AAirport.city_code + ')',
            flight_number: flight.flight_number,
            aircraft: flight.aircraft,
            duration: String(
              (new Date(`${flight.arrival_date}T${flight.arrival_time}`).getTime() -
                new Date(`${flight.departure_date}T${flight.departure_time}`).getTime()) /
              60000
            ),
          };
        })
      );

      await model.insertFlightSegment(segments);

      const files = (req.files as Express.Multer.File[]) || [];

      const travelers = body.travelers.map((traveler) => {
        const { key, ...rest } = traveler;
        for (const file of files) {
          if (file.fieldname?.split('-')[0] === 'visa' && file.fieldname?.split('-')[1] == key) {
            rest['visa_file'] = file.filename;
          } else if (
            file.fieldname?.split('-')[0] === 'passport' &&
            file.fieldname?.split('-')[1] == key
          ) {
            rest['passport_file'] = file.filename;
          }
        }
        return {
          flight_booking_id: booking_id[0].id,
          ...rest,
        };
      });

      await model.insertFlightTraveler(travelers);

      let paid_amount = 0;
      let due = payable_amount;
      if (body.status === FLIGHT_TICKET_ISSUE) {
        if (body.payment === 'full') {
          paid_amount = payable_amount;
          due = 0;
        } else if (body.payment === 'partial') {
          paid_amount =
            (payable_amount * Number(body.partial_payment_rules?.payment_percentage)) / 100;
          due = payable_amount - paid_amount;
        } else if (body.payment === 'paid') {
          due = 0;
        }
      }

      //invoice
      const invoiceSubService = new BookingPaymentService(trx);
      const invoice = await invoiceSubService.createInvoice({
        agency_id: body.agency_id,
        ref_id: booking_id[0].id,
        ref_type: INVOICE_TYPE_FLIGHT,
        total_amount: payable_amount,
        due: due,
        details: `Invoice has been created for flight Id ${booking_ref}`,
        user_name: agency_info[0].agency_name,
        email: agency_info[0].email,
        total_travelers: body.travelers.length,
        travelers_type: TRAVELER_TYPE_PASSENGERS,
        bookingId: booking_ref,
        agency_logo: agency_info[0].agency_logo,
        due_clear_last_day: body.partial_payment_rules?.payment_last_day || undefined,
      });

      //debit amount
      if (body.status === FLIGHT_TICKET_ISSUE && body.payment !== 'paid') {
        await agency_model.insertAgencyLedger({
          agency_id: body.agency_id,
          type: 'debit',
          amount: paid_amount,
          details: `Debit for ticket issuance - Booking ID: ${booking_ref} with ${body.payment} payment`,
        });
      }

      await model.insertFlightBookingTracking({
        flight_booking_id: booking_id[0].id,
        details: `Manual booking has been created. Status - ${body.status}`,
      });

      //send email to admin
      await Lib.sendEmail(
        [PROJECT_EMAIL_API_1],
        `Manual booking has been created`,
        email_template_to_send_notification({
          title: 'Manual booking has been created',
          details: {
            details: `A new booking has been created for agency: ${agency_info[0].agency_name}. Booking ID: ${booking_ref}`,
          },
        })
      );
      //send mail to agency
      await Lib.sendEmail(
        agency_info[0].email,
        `A new booking has been created`,
        email_template_to_send_notification({
          title: 'A new booking has been created kindly check the details',
          details: {
            details: `A new booking has been created with Booking ID: ${booking_ref}`,
          },
        })
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Manual booking has been created',
        data: {
          id: booking_id[0].id,
        },
      };
    });
  }

  //booking split
  public async bookingSplit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: user_id } = req.admin;
      const { id } = req.params;
      const bookingModel = this.Model.b2bFlightBookingModel(trx);
      const getBooking = await bookingModel.getSingleFlightBooking({
        id: Number(id),
      });
      if (!getBooking.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
    });
  }

  //fetch data from API
  public async fetchDataFromAPI(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.b2bFlightBookingModel(trx);
      const { id } = req.params as unknown as { id: number };
      const booking_details = await model.getSingleFlightBooking({ id });

      if (!booking_details.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      let status = booking_details[0].booking_status;
      let ticket_numbers: string[] = [];
      let airline_pnr = booking_details[0].airline_pnr;
      let gds_pnr = booking_details[0].pnr_code;
      let ticket_issue_last_time = booking_details[0].last_time;

      if (booking_details[0].api === SABRE_API) {
        const sabreSubService = new SabreFlightService(trx);
        const res = await sabreSubService.GRNUpdate({ pnr: gds_pnr });

        if (!res.success) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'No data has been found from the SABRE API',
          };
        }

        status = res.status;
        ticket_numbers = res.ticket_number;
        airline_pnr = res.airline_pnr;
        ticket_issue_last_time = res.last_time;
      } else if (booking_details[0].api === VERTEIL_API) {
        const segmentData = await model.getFlightSegment(id);
        const passengerData = await model.getFlightBookingTraveler(id);
        const verteilSubService = new VerteilFlightService(trx);
        const res = await verteilSubService.OrderRetrieveService({
          airlineCode: segmentData[0].airline_code,
          pnr: booking_details[0].pnr_code,
          passengers: passengerData,
        });

        if (!res.success) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'No data has been found from the VERTEIL API',
          };
        }

        if (res.flightTickets && res.flightTickets.length) {
          res.flightTickets.map((elm) => {
            ticket_numbers.push(elm.number);
          });
        }
        gds_pnr = res.pnr_code;
        airline_pnr = res.pnr_code;
        ticket_issue_last_time = res.paymentTimeLimit;
      } else if (booking_details[0].api === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        const res = await tripjackSubService.RetrieveBookingService(
          booking_details[0].api_booking_ref
        );

        status = res.status;
        ticket_numbers = res.ticket_numbers;
        gds_pnr = res.gds_pnr;
        airline_pnr = res.airline_pnr;
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Custom API cannot be fetched!',
        };
      }

      // update booking data
      const effectiveAirlinePnr = airline_pnr || booking_details[0].airline_pnr;
      const effectiveGdsPnr = gds_pnr || booking_details[0].pnr_code;

      const needsUpdate =
        status !== booking_details[0].booking_status ||
        effectiveAirlinePnr !== booking_details[0].airline_pnr ||
        effectiveGdsPnr !== booking_details[0].pnr_code ||
        ticket_issue_last_time !== booking_details[0].last_time;

      if (needsUpdate) {
        await model.updateBooking(
          {
            status,
            last_time: ticket_issue_last_time,
            airline_pnr: effectiveAirlinePnr,
            pnr_code: effectiveGdsPnr,
          },
          id
        );
      }

      // update ticket numbers
      if (ticket_numbers.length) {
        const travelers = await model.getFlightBookingTraveler(id);

        for (let i = 0; i < travelers.length; i++) {
          const currentTicket = travelers[i].ticket_number;
          const newTicket = ticket_numbers[i];
          if (newTicket && newTicket !== currentTicket) {
            await model.updateFlightBookingTraveler({ ticket_number: newTicket }, travelers[i].id);
          }
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Booking data has been fetched from API',
      };
    });
  }

  public async editBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id } = req.params;
      const model = this.Model.b2bFlightBookingModel(trx);

      const get_booking = await model.getSingleFlightBooking({
        id: Number(booking_id),
      });
      if (!get_booking.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const body = req.body as IEditBookingPayload;

      if (body.pnr_code || body.airline_pnr || body.last_time || body.status) {
        let ticket_issued_on = undefined;
        if (!get_booking[0].ticket_issued_on && body.status === FLIGHT_TICKET_ISSUE) {
          ticket_issued_on = new Date();
        }
        await model.updateBooking(
          {
            pnr_code: body.pnr_code,
            airline_pnr: body.airline_pnr,
            last_time: body.last_time,
            status: body.status,
            ticket_issued_on,
          },
          Number(booking_id)
        );
      }

      if (body.segments && body.segments.length) {
        await Promise.all(
          body.segments.map(async (elem) => {
            const { id, ...rest } = elem;
            const checkData = await model.getFlightSegment(Number(booking_id), elem.id);
            if (!checkData.length) {
              throw new CustomError('Segment not found', 404);
            }
            await model.updateSegments(rest, id);
          })
        );
      }

      if (body.travelers && body.travelers.length) {
        await Promise.all(
          body.travelers.map(async (elem) => {
            const { id, title, contact_number, ...rest } = elem;
            const checkData = await model.getFlightBookingTraveler(Number(booking_id), elem.id);
            if (!checkData.length) {
              throw new CustomError('Traveler not found', 404);
            }
            await model.updateFlightBookingTraveler(
              { ...rest, phone: contact_number, reference: title },
              id
            );
          })
        );
      }

      if (body.partial_payment || body.payment_last_date || body.payment_percentage) {
        await model.updateBooking(
          {
            partial_payment: {
              partial_payment: body.partial_payment,
              payment_percentage: body.payment_percentage,
              travel_date_from_now: body.payment_last_date,
            },
          },
          Number(booking_id)
        );
        if (body.payment_last_date) {
          await this.Model.btobPaymentModel(trx).updateInvoice(
            {
              due_clear_last_day: body.payment_last_date,
            },
            get_booking[0].invoice_id
          );
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Booking has been updated',
      };
    });
  }

  public async sendBookingMail(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id } = req.params;
      const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
      //check booking info
      const [checkFlightBooking, flightSegments, flightTravelers] = await Promise.all([
        flightBookingModel.getSingleFlightBooking({
          id: Number(booking_id),
        }),
        flightBookingModel.getFlightSegment(Number(booking_id)),
        flightBookingModel.getFlightBookingTraveler(Number(booking_id)),
      ]);

      if (!checkFlightBooking.length) {
        throw new CustomError(
          'No booking has been found with this ID',
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      const formatDuration = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''
          }`.trim();
      };

      const flightDetails = flightSegments.map((segment) => ({
        departure: `${segment.origin}`,
        arrival: `${segment.destination}`,
        duration: formatDuration(parseInt(segment.duration, 10)),
        details: {
          class: `CLASS: ${segment.class}`,
          departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
          lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
        },
        airline: {
          name: segment.airline,
          image: `${PROJECT_IMAGE_URL}/${segment.airline_logo}`,
          flight_number: segment.flight_number as string,
        },
        cabin: segment.class,
        departure_date: Lib.formatAMPM(
          new Date(
            segment.departure_date.toISOString().split('T')[0] +
            'T' +
            segment.departure_time.split('+')[0]
          )
        ),
      }));

      const flightBookingPdfData = {
        date_of_issue: new Date().toISOString().split('T')[0],
        bookingId: checkFlightBooking[0].booking_ref,
        bookingStatus: checkFlightBooking[0].booking_status,
        airlinePnr: checkFlightBooking[0].airline_pnr,
        numberOfPassengers: flightTravelers.length,
        journeyType: checkFlightBooking[0].journey_type,
        segments: flightDetails,
        passengers: flightTravelers.map((traveler, index) => ({
          name:
            String(traveler.reference).toUpperCase() +
            ' ' +
            traveler.first_name +
            ' ' +
            traveler.last_name,
          gender: traveler.gender,
          dob: traveler.date_of_birth,
          phone: traveler.contact_number,
          reference: traveler.reference,
          type: traveler.type,
          passport_number: traveler.passport_number,
          frequent_flyer_number: traveler.frequent_flyer_number,
        })),
        baggage_information: {
          route: checkFlightBooking[0].route,
          check_in: flightSegments
            .map((segment) => {
              return `${segment.flight_number} (${segment.airline}) - Baggage info: ${segment.baggage}`;
            })
            .join(','),
        },
      };

      // send email notification
      const bookingEmailSubService = new SendBookingEmailService();
      await bookingEmailSubService.sendFlightDetailsEmail({
        flightBookingPdfData: flightBookingPdfData,
        bookingId: checkFlightBooking[0]?.booking_ref,
        email: checkFlightBooking[0].email,
        name: checkFlightBooking[0].agency_name,
        status: checkFlightBooking[0].booking_status,
        pnr: checkFlightBooking[0].pnr_code,
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Mail has been send',
      };
    });
  }
}
