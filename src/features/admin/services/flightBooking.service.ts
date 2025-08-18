import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

import {
  PROJECT_IMAGE_URL,
  PROJECT_EMAIL_API_1,

  INVOICE_TYPE_FLIGHT,
  TRAVELER_TYPE_PASSENGERS,
} from '../../../utils/miscellaneous/constants';
import {
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_PAID,
  FLIGHT_TICKET_ISSUE,
  FLIGHT_BOOKING_ON_HOLD,
  SABRE_API,
  CUSTOM_API,
  VERTEIL_API,
  TRIPJACK_API,
} from '../../../utils/miscellaneous/flightMiscellaneous/flightConstants';

import { IBlockedBookingUPdatePayload } from '../../../utils/interfaces/flight/flightBookingInterface';
import CustomError from '../../../utils/lib/customError';
import Lib from '../../../utils/lib/lib';
import { template_onCancelFlightBooking_send_to_user } from '../../../utils/templates/flightBookingCancelTemplates';
import { BtoCFlightBookingSubService } from '../../b2c/services/subServices/BtoCFlightBookingSubService';
import SabreFlightService from '../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import { SendBookingEmailService } from '../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service';
import VerteilFlightService from '../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service';
import TripjackFlightSupportService from '../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service';
import { email_template_to_send_notification } from '../../../utils/templates/adminNotificationTemplate';
import { IAdminB2CFlightManualBookingPayload, IEditBookingPayload } from '../utils/types/b2cFlight.interface';
import { BtoCInvoiceService } from '../../b2c/services/subServices/invoice.service';
import { IFormattedFlightItinerary } from '../../../utils/supportTypes/flightSupportTypes/commonFlightTypes';
import { IFlightBookingPassengerReqBody } from '../../../utils/supportTypes/flightBookingTypes/commonFlightBookingTypes';

class adminFlightBookingService extends AbstractServices {
  constructor() {
    super();
  }

  // get all flight booking
  public async getAllFlightBooking(req: Request) {
    const { status, limit, skip, from_date, to_date, name } = req.query;

    const flightBookingModel = this.Model.btocFlightBookingModel();

    const { data, total } = await flightBookingModel.getAdminAllFlightBooking({
      limit: limit as string,
      skip: skip as string,
      status: status as string,
      from_date: from_date as string,
      to_date: to_date as string,
      name: name as string,
    });

    return {
      success: true,
      data,
      total,
      code: this.StatusCode.HTTP_OK,
    };
  }

  // get single flight booking
  public async getSingleFlightBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;

      const model = this.Model.btocFlightBookingModel();

      const checkBooking = await model.getSingleFlightBooking({
        id: Number(id),
      });

      if (!checkBooking.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const getTraveler = await model.getFlightTraveler(Number(id));

      const getSegments = await model.getFlightSegment(Number(id));

      const paymentModel = this.Model.paymentModel();
      const invoiceData = await paymentModel.getInvoiceByBookingId(Number(id), 'flight');

      //update from api
      await new BtoCFlightBookingSubService(trx).updateFromApi({
        singleBookData: checkBooking,
        booking_id: Number(id),
        traveler: getTraveler,
        segment: getSegments,
      });

      //get ssr
      const ssr = await model.getFlightBookingSSR(Number(id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          ...checkBooking[0],
          invoice_id: invoiceData.length ? invoiceData[0].id : null,
          segments: getSegments,
          traveler: getTraveler,
          ssr
        },
      };
    });
  }

  // cancel flight booking
  public async cancelFlightBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const flightBookingModel = this.Model.btocFlightBookingModel(trx);
      const { id: booking_id } = req.params;
      let { id } = req.admin;

      // console.log("booking ID :", booking_id);

      const checkFlightBooking = await flightBookingModel.getSingleFlightBooking({
        id: Number(booking_id),
      });

      // console.log(checkFlightBooking);

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
        const sabreSubService = new SabreFlightService(trx);
        await sabreSubService.SabreBookingCancelService({
          pnr: checkFlightBooking[0].pnr_code,
        });
        cancelBookingRes.success = true;
        cancelBookingRes.message = "Booking has been cancelled";
        cancelBookingRes.code = this.StatusCode.HTTP_OK;
      } else if (checkFlightBooking[0].api === VERTEIL_API) {
        const segmentDetails = await flightBookingModel.getFlightSegment(
          Number(booking_id)
        );
        const verteilSubService = new VerteilFlightService(trx);
        cancelBookingRes = await verteilSubService.OrderCancelService({
          airlineCode: segmentDetails[0].airline_code,
          pnr: checkFlightBooking[0].pnr_code,
        });
      } else if (checkFlightBooking[0].api === CUSTOM_API) {
        cancelBookingRes.success = true;
      } else if (checkFlightBooking[0].api === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        cancelBookingRes = await tripjackSubService.CancelBookingService(
          checkFlightBooking[0].api_booking_ref,
          checkFlightBooking[0].airline_pnr
        );
      }

      if (cancelBookingRes.success === true) {
        await flightBookingModel.updateBooking(
          { status: FLIGHT_BOOKING_CANCELLED },
          parseInt(booking_id)
        );

        //delete invoice
        await this.Model.paymentModel(trx).updateInvoice(
          { status: false },
          checkFlightBooking[0].invoice_id
        );
        // send email
        await Lib.sendEmail(
          checkFlightBooking[0].email,
          `Your ${checkFlightBooking[0].route} flight booking has been canceled`,
          template_onCancelFlightBooking_send_to_user({
            journey_type: checkFlightBooking[0].journey_type,
            payable_amount: checkFlightBooking[0].payable_amount,
            pnr:
              checkFlightBooking[0].pnr_code?.startsWith("NZB") &&
                checkFlightBooking[0].pnr_code?.length > 6
                ? "N/A"
                : String(checkFlightBooking[0].pnr_code),
            route: checkFlightBooking[0].route,
            total_passenger: checkFlightBooking[0].total_passenger,
          })
        );
        await Lib.sendEmail(
          [PROJECT_EMAIL_API_1],
          `Your ${checkFlightBooking[0].route} flight booking has been canceled`,
          template_onCancelFlightBooking_send_to_user({
            journey_type: checkFlightBooking[0].journey_type,
            payable_amount: checkFlightBooking[0].payable_amount,
            pnr:
              checkFlightBooking[0].pnr_code?.startsWith("NZB") &&
                checkFlightBooking[0].pnr_code?.length > 6
                ? "N/A"
                : String(checkFlightBooking[0].pnr_code),
            route: checkFlightBooking[0].route,
            total_passenger: checkFlightBooking[0].total_passenger,
          })
        );
      }
      return cancelBookingRes;
    });
  }

  //ticket issue
  public async ticketIssue(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id } = req.params;
      const flightBookingModel = this.Model.btocFlightBookingModel(trx);

      //check booking info
      const [checkFlightBooking, flightSegments, flightTravelers] =
        await Promise.all([
          flightBookingModel.getSingleFlightBooking({
            id: Number(booking_id),
          }),
          flightBookingModel.getFlightSegment(Number(booking_id)),
          flightBookingModel.getFlightTraveler(Number(booking_id)),
        ]);

      // console.log(checkFlightBooking);

      if (!checkFlightBooking.length) {
        return {
          success: false,
          message: 'Payment for the booking is still pending.',
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }
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

      const getTraveler = await flightBookingModel.getFlightTraveler(Number(booking_id));

      // console.log('get traveler', getTraveler);
      // console.log('called--------------------------------------');

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
        const segmentDetails = await flightBookingModel.getFlightSegment(
          Number(booking_id)
        );
        const travelerDetails = await flightBookingModel.getFlightTraveler(
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

      // console.log('ticket Issue Response', ticketIssueRes);
      // console.log('------------called again -------------------------------');
      //if issue is successful, update the booking status
      if (ticketIssueRes.success === true) {
        //update booking
        await flightBookingModel.updateBooking(
          {
            status:
              ticketIssueRes.data?.length === 0
                ? FLIGHT_BOOKING_ON_HOLD
                : FLIGHT_TICKET_ISSUE,
            ticket_issued_on: new Date(),
          },
          Number(booking_id)
        );
        //update ticket number
        if (getTraveler.length !== ticketIssueRes.data?.length) {
          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: 'Ticket has been issued. Ticket numbers have not generated yet.',
          };
        }
        await Promise.all(
          ticketIssueRes.data.map((ticket_num: string, ind: number) =>
            flightBookingModel.updateTravelers({ ticket_number: ticket_num }, getTraveler[ind].id)
          )
        );

        if (ticketIssueRes.data?.length && ticketIssueRes.data?.length > 0) {
          const travelers = flightTravelers.map((traveler) => ({
            type: traveler.type,
          }));

          const travelerCount = travelers.reduce<Record<string, number>>(
            (acc, traveler) => {
              acc[traveler.type] = (acc[traveler.type] || 0) + 1;
              return acc;
            },
            {}
          );

          const formatDuration = (minutes: number) => {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? "s" : ""} ` : ""}${mins > 0 ? `${mins} minute${mins > 1 ? "s" : ""}` : ""
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
                segment.departure_date.toISOString().split("T")[0] +
                "T" +
                segment.departure_time.split("+")[0]
              )
            ),
          }));

          const flightBookingPdfData = {
            date_of_issue: new Date().toISOString().split('T')[0],
            bookingId: checkFlightBooking[0].booking_ref,
            bookingStatus: checkFlightBooking[0].booking_status,
            pnr:
              checkFlightBooking[0].pnr_code?.startsWith("NZB") &&
                checkFlightBooking[0].pnr_code?.length > 6
                ? "N/A"
                : String(checkFlightBooking[0].pnr_code),
            airlinePnr: checkFlightBooking[0].airline_pnr,
            numberOfPassengers: flightTravelers.length,
            journeyType: checkFlightBooking[0].journey_type,
            segments: flightDetails,
            passengers: flightTravelers.map((traveler, index) => ({
              name: traveler.first_name + ' ' + traveler.last_name,
              gender: traveler.gender,
              dob: traveler.date_of_birth,
              phone: traveler.contact_number,
              reference: traveler.reference,
              ticket: ticketIssueRes.data ? ticketIssueRes.data[index] : '',
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
            bookingId: checkFlightBooking[0]?.booking_ref,
            email: checkFlightBooking[0].email,
          });
        }
      }

      return ticketIssueRes;
    });
  }

  //update blocked booking
  public async updateBlockedBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params as unknown as { id: number };
      const payload = req.body as IBlockedBookingUPdatePayload;
      const adminId = (req.admin as { id: number }).id;

      const b2cFlightBookingModel = this.Model.btocFlightBookingModel(trx);
      const invoiceModel = this.Model.paymentModel(trx);

      const [booking] = await b2cFlightBookingModel.getSingleFlightBooking({
        id,
      });
      if (!booking) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { invoice_id, booking_ref, status: booking_status } = booking;

      if (
        ![FLIGHT_BOOKING_IN_PROCESS, FLIGHT_BOOKING_PAID, FLIGHT_BOOKING_CONFIRMED].includes(
          booking_status
        )
      ) {
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

        if (Number(invoice.due) > 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: `Since there is a due amount for the booking, make sure the payment is cleared before issuing it. the BookingId: '${booking_ref}'`,
          };
        }

        if (payload.ticket_numbers?.length) {
          await Promise.all(
            payload.ticket_numbers.map(({ ticket_number, traveler_id }) =>
              b2cFlightBookingModel.updateTravelers({ ticket_number }, traveler_id)
            )
          );
        }
      }

      if (payload.status === FLIGHT_BOOKING_CANCELLED) {
        await invoiceModel.updateInvoice({ status: false }, invoice_id);
      }

      await b2cFlightBookingModel.updateBooking(
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

  //update booking
  public async updateBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params as unknown as { id: number };
      const {
        status,
        deduction_amount,
        gds_pnr,
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
      };
      const btocBookingModel = this.Model.btocFlightBookingModel(trx);
      const booking_data = await btocBookingModel.getSingleFlightBooking({
        id,
      });
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
        await btocBookingModel.updateBooking(
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
      if (deduction_amount) {
        const invoice_id = booking_data[0].invoice_id;
        const invoiceModel = this.Model.paymentModel(trx);
        const getInvoice = await invoiceModel.getInvoice({ invoice_id });
        //check the invoice
        if (!getInvoice.data.length) {
          throw new CustomError(
            this.ResMsg.HTTP_NOT_FOUND,
            this.StatusCode.HTTP_NOT_FOUND
          );
        }

        //check if already refunded
        if (getInvoice.data[0].refund_amount) {
          throw new CustomError(
            "Amount has been refunded already",
            this.StatusCode.HTTP_CONFLICT
          );
        }

        //paid amount
        const paidAmount = Number(getInvoice.data[0].total_amount) - Number(getInvoice.data[0].due);
        //check if the paid amount is less then the deducted amount
        if (Number(paidAmount) < Number(deduction_amount)) {
          throw new CustomError(
            "Deduction amount is less then the paid amount",
            this.StatusCode.HTTP_BAD_REQUEST
          );
        }

        //update invoice due, refund amount
        await invoiceModel.updateInvoice({ refund_amount: deduction_amount }, invoice_id);
      }

      //ticket issue
      if (status === FLIGHT_TICKET_ISSUE) {
        if (ticket_numbers?.length) {
          await Promise.all(
            ticket_numbers.map(({ ticket_number, traveler_id }) =>
              btocBookingModel.updateTravelers({ ticket_number }, traveler_id)
            )
          );
        }
      }
      //send email to admin
      await Lib.sendEmail(
        [PROJECT_EMAIL_API_1],
        `B2C booking has been updated`,
        email_template_to_send_notification({
          title: 'B2C booking has been updated',
          details: {
            details: `B2C booking ${booking_data[0].booking_ref} has been updated to ${status}`,
          },
        })
      );
      await Lib.sendEmail(
        booking_data[0].booking_data,
        `B2C booking has been updated`,
        email_template_to_send_notification({
          title: 'B2C booking has been updated',
          details: {
            details: `B2C booking ${booking_data[0].booking_ref} has been updated to ${status}`,
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

  //fetch data from API
  public async fetchDataFromAPI(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.btocFlightBookingModel(trx);
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
        const passengerData = await model.getFlightTraveler(id);
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
        const travelers = await model.getFlightTraveler(id);

        for (let i = 0; i < travelers.length; i++) {
          const currentTicket = travelers[i].ticket_number;
          const newTicket = ticket_numbers[i];
          if (newTicket && newTicket !== currentTicket) {
            await model.updateTravelers({ ticket_number: newTicket }, travelers[i].id);
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
      const model = this.Model.btocFlightBookingModel(trx);

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
        if (
          !get_booking[0].ticket_issued_on &&
          body.status === FLIGHT_TICKET_ISSUE
        ) {
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
            const checkData = await model.getFlightSegment(
              Number(booking_id),
              elem.id
            );
            if (!checkData.length) {
              throw new CustomError("Segment not found", 404);
            }
            await model.updateSegments(rest, id);
          })
        );
      }

      if (body.travelers && body.travelers.length) {
        await Promise.all(
          body.travelers.map(async (elem) => {
            const { id, ...rest } = elem;
            const checkData = await model.getFlightTraveler(
              Number(booking_id),
              elem.id
            );
            if (!checkData.length) {
              throw new CustomError("Traveler not found", 404);
            }
            await model.updateTravelers(rest, id);
          })
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Booking has been updated",
      };
    });
  }

  public async sendBookingMail(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id } = req.params;
      const flightBookingModel = this.Model.btocFlightBookingModel(trx);
      //check booking info
      const [checkFlightBooking, flightSegments, flightTravelers] = await Promise.all([
        flightBookingModel.getSingleFlightBooking({
          id: Number(booking_id),
        }),
        flightBookingModel.getFlightSegment(Number(booking_id)),
        flightBookingModel.getFlightTraveler(Number(booking_id)),
      ]);

      if (!checkFlightBooking.length) {
        throw new CustomError(
          "No booking has been found with this ID",
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      const formatDuration = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? "s" : ""} ` : ""}${mins > 0 ? `${mins} minute${mins > 1 ? "s" : ""}` : ""
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
            segment.departure_date.toISOString().split("T")[0] +
            "T" +
            segment.departure_time.split("+")[0]
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
        status: checkFlightBooking[0].status,
        pnr: checkFlightBooking[0].prn_code
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Mail has been send",
      };
    });
  }

  public async manualBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const body = req.body as IAdminB2CFlightManualBookingPayload;
      const model = this.Model.btocFlightBookingModel(trx);
      const userModel = this.Model.userModel(trx);
      const getUser = await userModel.getProfileDetails({ id: body.user_id });
      if (!getUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const ticket_price = body.base_fare + body.total_tax + body.ait;
      const payable_amount = ticket_price + body.convenience_fee + body.markup - body.discount;


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
      const booking_ref = await new BtoCFlightBookingSubService().generateUniqueBookingNumber(trx);

      const booking_id = await model.insertFlightBooking({
        user_id: body.user_id,
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
        const { key, reference, phone, ...rest } = traveler;
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
          title: reference,
          contact_number: phone,
          ...rest,
        };
      });

      await model.insertFlightTraveler(travelers);

      let paid_amount = 0;
      let due = payable_amount;
      if (body.status === FLIGHT_TICKET_ISSUE) {
        if (body.paid === true) {
          paid_amount = payable_amount;
          due = 0;
        }
      }

      //create invoice and send invoice mail
      const invoiceSubService = new BtoCInvoiceService(trx);
      const invoice = await invoiceSubService.createInvoice({
        user_id: body.user_id,
        ref_id: booking_id[0].id,
        ref_type: INVOICE_TYPE_FLIGHT,
        total_amount: payable_amount,
        due,
        details: `Invoice has been created for flight Id ${booking_ref}`,
        user_name: getUser[0].first_name + " " + getUser[0].last_name,
        email: getUser[0].email,
        total_travelers: body.travelers.length,
        travelers_type: TRAVELER_TYPE_PASSENGERS,
        bookingId: booking_ref,
      });


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
            details: `A new booking has been created for user ${getUser[0].first_name + " " + getUser[0].last_name}. Booking ID: ${booking_ref}`,
          },
        })
      );
      //send mail to agency
      await Lib.sendEmail(
        getUser[0].email,
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

  // get Pnr Details
  public async getPnrDetails(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, pnr, gds } = req.body;
      const model = this.Model.btocFlightBookingModel(trx);
      const b2cMarkup = await this.Model.DynamicFareModel(trx).getB2CCommission();
      if (!b2cMarkup?.[0]?.commission_set_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No markup set has been found for B2C. Please set a markup first.',
        };
      }

      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      const set_flight_api_id = await dynamicFareModel.getSuppliers({
        set_id: b2cMarkup[0].commission_set_id,
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
      const check_pnr = await model.getAdminAllFlightBooking({
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
}

export default adminFlightBookingService;
