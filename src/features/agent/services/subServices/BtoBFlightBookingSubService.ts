import { Knex } from 'knex';
import AbstractServices from '../../../../abstract/abstract.service';
import { IInsertFlightSegmentPayload } from '../../../../utils/interfaces/agent/b2bFlightBookingInterface';
import Lib from '../../../../utils/lib/lib';
import {
  NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
  PROJECT_CODE,
  PROJECT_EMAIL_API_1,
  PROJECT_IMAGE_URL,
  SABRE_API,
} from '../../../../utils/miscellaneous/constants';
import {
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_TICKET_ISSUE,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_TICKET_IN_PROCESS,
  JOURNEY_TYPE_ONE_WAY,
  JOURNEY_TYPE_ROUND_TRIP,
  JOURNEY_TYPE_MULTI_CITY,
  TRIPJACK_API,
} from '../../../../utils/miscellaneous/flightMiscellaneous/flightConstants';
import { template_onTicketInProcess } from '../../../../utils/templates/ticketIssueTemplates';
import { AdminNotificationSubService } from '../../../admin/services/subServices/adminNotificationSubService';
import {
  IFormattedFlight,
  IFormattedFlightItinerary,
  IFormattedFlightOption,
} from '../../../../utils/supportTypes/flightSupportTypes/commonFlightTypes';
import SabreFlightService from '../../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import { SendBookingEmailService } from '../../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service';
import {
  ICheckDirectBookingPermissionPayload,
  IFlightBookingPassengerReqBody,
} from '../../../../utils/supportTypes/flightBookingTypes/commonFlightBookingTypes';

export class BtoBFlightBookingSubService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx || ({} as Knex.Transaction);
  }
  //generate unique booking number
  public async generateUniqueBookingNumber(trx: Knex.Transaction) {
    const model = this.Model.b2bFlightBookingModel(trx);
    const bookingNumber = await model.getAllFlightBooking({ limit: '1' });
    const currentDate = Lib.getFormattedDate(new Date());
    let booking_id = `${PROJECT_CODE}FB-${currentDate.year + currentDate.month + currentDate.day}-`;
    if (!bookingNumber.data.length) {
      booking_id += '00001';
    } else {
      const lastBookingRef = bookingNumber.data[0].booking_ref.split('-')[2];
      const nextNumber =
        lastBookingRef == '99999'
          ? '00001'
          : (parseInt(lastBookingRef, 10) + 1).toString().padStart(5, '0');
      booking_id += nextNumber;
    }

    return booking_id;
  }

  //check if the agency has enough balance for ticket issue
  public async checkAgencyBalanceForTicketIssue(body: {
    agency_balance: number;
    ticket_price: number;
    payment_type: 'partial' | 'full';
    partial_payment_percentage?: number;
  }) {
    if (body.payment_type === 'full') {
      if (Number(body.ticket_price) > Number(body.agency_balance)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'There is insufficient balance in your account',
        };
      }
    } else if (body.payment_type === 'partial') {
      if (
        Number(body.ticket_price) * Number(body.partial_payment_percentage) >
        Number(body.agency_balance)
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'There is insufficient balance in your account',
        };
      }
    }
    return { success: true, code: this.StatusCode.HTTP_OK };
  }

  //update data after ticket issue
  public async updateDataAfterTicketIssue(body: {
    booking_id: number;
    status?: string;
    agency_id: number;
    user_id: number;
    payable_amount: number;
    booking_ref: string;
    payment_type: 'full' | 'partial';
    invoice_id: number;
    ticket_number?: string[];
    travelers_info?: { id: number }[];
    issued_by: 'AGENT' | 'ADMIN';
    partial_payment_percentage?: number;
  }) {
    const flightBookingModel = this.Model.b2bFlightBookingModel(this.trx);
    const agencyModel = this.Model.agencyModel(this.trx);
    const paymentModel = this.Model.btobPaymentModel(this.trx);
    //update status of the booking
    await flightBookingModel.updateBooking(
      {
        status: body.status || FLIGHT_TICKET_ISSUE,
        ticket_issued_on: new Date(),
      },
      body.booking_id
    );

    await flightBookingModel.insertFlightBookingTracking({
      flight_booking_id: body.booking_id,
      details: `Ticket has been issued by ${body.issued_by}. Payment type - ${body.payment_type} payment`,
    });

    const checkPayment = await paymentModel.singleInvoice(body.invoice_id);
    let paid_amount = Number(checkPayment[0].total_amount) - checkPayment[0].due;
    if (Number(checkPayment[0].total_amount) === Number(checkPayment[0].due)) {
      //debit amount from the agency
      paid_amount =
        body.payment_type === 'full'
          ? body.payable_amount
          : body.payable_amount * Number(body.partial_payment_percentage);
      await agencyModel.insertAgencyLedger({
        agency_id: body.agency_id,
        type: 'debit',
        amount: paid_amount,
        details: `Debit for ticket issuance - Booking ID: ${body.booking_ref} with ${body.payment_type} payment`,
      });

      //update due
      await paymentModel.updateInvoice(
        { due: Number(body.payable_amount) - Number(paid_amount) },
        body.invoice_id
      );

      //create money receipt
      await paymentModel.createMoneyReceipt({
        amount: paid_amount,
        invoice_id: body.invoice_id,
        details: `${body.payment_type} payment has been done for booking id ${body.booking_ref}`,
        user_id: body.user_id,
      });
    }

    //update ticket number
    if (
      body.ticket_number &&
      body.travelers_info &&
      body.travelers_info.length === body.ticket_number.length
    ) {
      await Promise.all(
        body.ticket_number.map((ticket_num: string, ind: number) =>
          flightBookingModel.updateFlightBookingTraveler(
            { ticket_number: ticket_num },
            body.travelers_info ? body.travelers_info[ind].id : 0
          )
        )
      );
    }
  }

  //pending ticket issuance
  public async insertPendingTicketIssue(body: {
    booking_id: number;
    agency_id: number;
    user_id: number;
    payable_amount: number;
    booking_ref: string;
    payment_type: 'full' | 'partial';
    invoice_id: number;
    departure_date: Date;
    journey_type: string;
    route: string;
    total_passenger: number;
    agency_logo: string;
    email: string;
    api: string;
    details: string;
    partial_payment_percentage: number;
  }) {
    return await this.db.transaction(async (trx) => {
      console.log(body);
      const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      const paymentModel = this.Model.btobPaymentModel(trx);

      // await flightBookingModel.insertPendingTicketIssuance({
      //   booking_id: Number(body.booking_id),
      //   user_id: body.user_id,
      //   api: body.api,
      // });

      //update status of the booking
      await flightBookingModel.updateBooking(
        {
          status: FLIGHT_TICKET_IN_PROCESS,
          ticket_issued_on: new Date(),
        },
        body.booking_id
      );

      await flightBookingModel.insertFlightBookingTracking({
        flight_booking_id: body.booking_id,
        details: `Booking status ${FLIGHT_TICKET_IN_PROCESS} (${body.details}). Payment type - ${body.payment_type} payment`,
      });

      const checkPayment = await paymentModel.singleInvoice(body.invoice_id);
      let paid_amount = Number(checkPayment[0].total_amount) - checkPayment[0].due;
      if (Number(checkPayment[0].total_amount) === Number(checkPayment[0].due)) {
        //debit amount from the agency
        paid_amount =
          body.payment_type === 'full'
            ? body.payable_amount
            : body.payable_amount * body.partial_payment_percentage;
        await agencyModel.insertAgencyLedger({
          agency_id: body.agency_id,
          type: 'debit',
          amount: paid_amount,
          details: `Debit for ticket issuance - Booking ID: ${body.booking_ref} with ${body.payment_type} payment`,
        });

        //update due
        await paymentModel.updateInvoice(
          { due: Number(body.payable_amount) - Number(paid_amount) },
          body.invoice_id
        );

        //create money receipt
        await paymentModel.createMoneyReceipt({
          amount: paid_amount,
          invoice_id: body.invoice_id,
          details: `${body.payment_type} payment has been done for booking id ${body.booking_ref}`,
          user_id: body.user_id,
        });
      }

      const due = Number(body.payable_amount) - Number(paid_amount);
      const flightBookTemplateData = {
        travel_date: body.departure_date,
        ticket_numbers: [],
        journey_type: body.journey_type,
        payable_amount: body.payable_amount,
        route: body.route,
        total_passenger: body.total_passenger,
        due_amount: due,
        logo: `${PROJECT_IMAGE_URL}/${body.agency_logo}`,
      };

      //send email to admin and agent
      //admin
      await Lib.sendEmail(
        PROJECT_EMAIL_API_1,
        `Ticket in process for Booking ID: ${body.booking_ref}`,
        template_onTicketInProcess(flightBookTemplateData)
      );
      //agent
      await Lib.sendEmail(
        body.email,
        `Ticket in process for Booking ID: ${body.booking_ref}`,
        template_onTicketInProcess(flightBookTemplateData)
      );
    });
  }

  //cancel booking
  public async cancelBooking(body: {
    booking_id: number;
    cancelled_by: number;
    invoice_id: number;
    booking_ref: string;
    cancelled_from: 'AGENT' | 'ADMIN';
  }) {
    const flightBookingModel = this.Model.b2bFlightBookingModel(this.trx);
    //update the status to cancelled
    await flightBookingModel.updateBooking(
      { status: FLIGHT_BOOKING_CANCELLED, cancelled_by: body.cancelled_by },
      body.booking_id
    );

    await flightBookingModel.insertFlightBookingTracking({
      flight_booking_id: body.booking_id,
      details: `Booking has been cancelled by ${body.cancelled_from}`,
    });

    //get invoice
    const invoice = await this.Model.btobPaymentModel(this.trx).singleInvoice(body.invoice_id);
    if (!invoice.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: 'No invoice has been found',
      };
    }

    const total_amount = invoice[0].total_amount;
    const due = invoice[0].due;

    const paid_amount = Number(total_amount) - Number(due);
    if (paid_amount > 0) {
      //return the amount
      await this.Model.agencyModel(this.trx).insertAgencyLedger({
        agency_id: invoice[0].agency_id,
        amount: paid_amount,
        type: 'credit',
        details: `Flight booking - ${body.booking_ref} has been cancelled. Paid amount ${paid_amount} has been returned to the account.`,
      });
    }
    //delete invoice
    if (body.invoice_id) {
      await this.Model.btobPaymentModel(this.trx).updateInvoice({ status: false }, body.invoice_id);
    }
  }

  //check ticket issue block
  public async checkTicketIssueBlock(body: { agency_id: number; api: string; airline: string }) {
    //get commission set id
    const agency_info = await this.Model.agencyModel(this.trx).getSingleAgency(body.agency_id);

    //get set flight api id
    const apiData = await this.Model.commissionSetModel(this.trx).getSetFlightAPI({
      set_id: agency_info[0].commission_set_id,
      api_name: body.api,
    });

    const set_flight_api_id = apiData?.[0]?.id;

    if (!set_flight_api_id) {
      return false;
    }
    //check ticket issue block
    const checkAirline = await this.Model.apiAirlinesBlockModel(this.trx).getAirlineBlock(
      body.airline,
      set_flight_api_id,
      true
    );

    if (checkAirline.length) {
      return true;
    } else {
      return false;
    }
  }

  //update from api
  public async updateFromAPI(payload: {
    data: any[];
    booking_id: string;
    traveler: any[];
    segment: any[];
  }) {
    const model = this.Model.b2bFlightBookingModel(this.trx);
    const { data, booking_id, traveler, segment } = payload;
    let booking_status;
    let ticket_numbers: string[] = [];

    if (
      [FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_ISSUE, FLIGHT_TICKET_IN_PROCESS].includes(
        data[0].booking_status
      )
    ) {
      if (data[0].api === SABRE_API) {
        const sabreSubService = new SabreFlightService(this.trx);
        const res = await sabreSubService.GRNUpdate({
          pnr: data[0].pnr_code,
          booking_status: data[0].booking_status,
        });

        booking_status = res.status;
        ticket_numbers = res.ticket_number;

        if (
          res.success &&
          (res.status !== data[0].booking_status ||
            data[0].last_time !== res.last_time ||
            data[0].airline_pnr !== res.airline_pnr)
        ) {
          this.updateBooking({
            booking_id: Number(booking_id),
            last_time: res.last_time || undefined,
            status: res.status || undefined,
            ticket_number: res.ticket_number || undefined,
            airline_pnr: res.airline_pnr || undefined,
          });
        }
      }
    }

    if (data[0].booking_status !== FLIGHT_TICKET_ISSUE && booking_status === FLIGHT_TICKET_ISSUE) {
      const bookingEmailSubService = new SendBookingEmailService();
      await bookingEmailSubService.sendFlightTicketIssuedEmail({
        flightBookTemplateData: {
          travel_date: segment[0].departure_date,
          ticket_numbers,
          journey_type: data[0].journey_type,
          payable_amount: data[0].payable_amount,
          route: data[0].route,
          total_passenger: data[0].total_passenger,
          due_amount: data[0].due,
        },
        flightBookingPdfData: {
          date_of_issue: new Date(data[0].ticket_issued_on || data[0].booking_created_at)
            .toISOString()
            .split('T')[0],
          bookingId: data[0].booking_ref,
          bookingStatus: data[0].booking_status,
          pnr:
            data[0].pnr_code?.startsWith('NZB') && data[0].pnr_code?.length > 6
              ? 'N/A'
              : String(data[0].pnr_code),
          airlinePnr: data[0].airline_pnr,
          route: data[0].route,
          totalPassenger: data[0].total_passenger,
          journeyType: data[0].journey_type,
          segments: segment.map((seg) => ({
            departure: seg.origin,
            arrival: seg.destination,
            duration: seg.duration,
            details: {
              class: seg.class,
              departure: seg.origin.split('(')[0].trim(),
              lands_in: seg.destination.split('(')[0].trim(),
            },
            airline: {
              name: seg.airline,
              image: `${PROJECT_IMAGE_URL}/${seg.airline_logo}`,
              flight_number: seg.flight_number,
            },
            cabin: seg.class,
            departure_date:
              seg.departure_date.toISOString().split('T')[0] +
              ' ' +
              seg.departure_time.split('+')[0],
          })),
          passengers: traveler.map((t, index) => ({
            name: `${t.reference} ${t.first_name} ${t.last_name}`,
            passport_number: t.passport_number,
            frequent_flyer_number: t.frequent_flyer_number,
            ticket: ticket_numbers?.[index] || '',
          })),
          baggage_information: {
            route: data[0].route,
            check_in: segment
              .map((seg) => `${seg.flight_number} (${seg.airline}) - Baggage info: ${seg.baggage}`)
              .join(', '),
          },
          agency: {
            email: data[0]?.agency_email,
            phone: data[0]?.agency_phone,
            address: data[0]?.agency_address,
            photo: `${PROJECT_IMAGE_URL}/${data[0]?.agency_logo}`,
            name: data[0]?.agency_name,
          },
        },
        bookingId: data[0]?.booking_ref,
        email: data[0].user_email,
      });
    }
  }

  //update booking
  public async updateBooking({
    status,
    booking_id,
    ticket_number,
    last_time,
    airline_pnr,
  }: {
    status?: string;
    booking_id: number;
    ticket_number: string[];
    last_time?: string | null;
    airline_pnr?: string;
  }) {
    const model = this.Model.b2bFlightBookingModel();
    await model.updateBooking({ status, last_time, airline_pnr }, booking_id);
    if (ticket_number.length) {
      const getTraveler = await model.getFlightBookingTraveler(Number(booking_id));
      for (let i = 0; i < getTraveler.length; i++) {
        await model.updateFlightBookingTraveler(
          { ticket_number: ticket_number?.[i] },
          getTraveler[i].id
        );
      }
    }

    await model.insertFlightBookingTracking({
      flight_booking_id: booking_id,
      details: `Booking has been updated automatically using retrieve API`,
    });
  }

  //check eligibility of booking
  public async checkEligibilityOfBooking(payload: {
    booking_block: boolean;
    route: string;
    departure_date: string | Date;
    flight_number: string;
    is_domestic_flight: boolean;
    passenger: IFlightBookingPassengerReqBody[];
  }) {
    //check if passport has provided for international flight
    if (payload.is_domestic_flight === false) {
      const passport_number = !payload.passenger.some((p) => p.passport_number == null);
      if (!passport_number) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: 'Passport number is required for international flight',
        };
      }
    }

    //check if booking block is true
    if (payload.booking_block === true) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'This flight cannot be booked now. Please contact us for more information.',
      };
    }

    // Get all passengers' first names, last names, passports, email, phone
    const passengers = payload.passenger.map((p) => ({
      first_name: p.first_name,
      last_name: p.last_name,
      passport: p.passport_number,
      email: p.contact_email,
      phone: p.contact_number,
    }));

    // Batch check if any passenger already booked this flight
    const flightModel = this.Model.b2bFlightBookingModel(this.trx);
    const existingBooking = await flightModel.checkFlightBooking({
      route: payload.route,
      departure_date: payload.departure_date,
      flight_number: payload.flight_number,
      passengers,
      status: [
        FLIGHT_BOOKING_CONFIRMED,
        FLIGHT_TICKET_ISSUE,
        FLIGHT_BOOKING_IN_PROCESS,
        FLIGHT_BOOKING_ON_HOLD,
        FLIGHT_TICKET_IN_PROCESS,
      ],
    });

    if (existingBooking > 0) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'This flight is already booked with the same passenger information',
      };
    }

    const cancelledBooking = await flightModel.checkFlightBooking({
      route: payload.route,
      departure_date: payload.departure_date,
      flight_number: payload.flight_number,
      passengers,
      status: [FLIGHT_BOOKING_CANCELLED],
    });
    if (cancelledBooking >= 2) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: 'Booking has been cancelled 2 times with the same information',
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
    };
  }

  public async checkDirectFlightBookingPermission(payload: ICheckDirectBookingPermissionPayload) {
    const { commission_set_id, api_name, airline } = payload;

    const commissionSetFlightApiModel = this.Model.commissionSetModel(this.trx);
    const setFlightApis = await commissionSetFlightApiModel.getSetFlightAPI({
      set_id: commission_set_id,
      api_name,
    });

    if (!setFlightApis.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.SET_FLIGHT_API_ID_NOT_FOUND,
      };
    }

    const setFlightApiId = setFlightApis[0].id;

    const apiAirlinesBlockModel = this.Model.apiAirlinesBlockModel(this.trx);
    const [flightCommissionData] = await apiAirlinesBlockModel.getAirlineBlock(
      airline,
      setFlightApiId,
      true
    );

    return {
      booking_block: flightCommissionData?.booking_block ?? false,
    };
  }

  //insert flight booking data
  public async insertFlightBookingData(payload: {
    pnr?: string | null;
    flight_details: IFormattedFlightItinerary;
    created_by?: number;
    api_booking_ref?: string | null;
    passengers: IFlightBookingPassengerReqBody[];
    airline_pnr?: string | null;
    name: string;
    email: string;
    refundable: boolean;
    last_time: string | null;
    files: any[];
    agency_id: number;
    status: string;
    api: string;
    details: string;
    convenience_fee: number;
    fare_rules?: string | null;
    ssr?: {
      passenger_key: number;
      segment_id: string;
      code: string;
      type: 'meal' | 'baggage';
      price: number;
      desc: string;
    }[];
    old_revalidate_data?: IFormattedFlightItinerary;
  }) {
    const data = payload.flight_details;
    const flightBookingModel = this.Model.b2bFlightBookingModel(this.trx);
    const base_fare = data.fare.base_fare;
    const total_tax = data.fare.total_tax;
    const ait = data.fare.ait;
    let payable_amount = data.fare.payable;
    let discount = data.fare.discount;
    const convenience_fee = payload.convenience_fee;
    const refundable = payload.refundable;

    const { flights, leg_description, journey_type: JourneyType } = data;
    let journey_type = JOURNEY_TYPE_ONE_WAY;

    if (JourneyType === '2') {
      journey_type = JOURNEY_TYPE_ROUND_TRIP;
    }

    if (JourneyType === '3') {
      journey_type = JOURNEY_TYPE_MULTI_CITY;
    }

    const route = Lib.getRouteOfFlight(leg_description);

    const booking_ref = await this.generateUniqueBookingNumber(this.trx);

    if (payload.api === TRIPJACK_API) {
    }

    //insert flight booking
    const res = await flightBookingModel.insertFlightBooking({
      booking_id: booking_ref,
      pnr_code: payload.pnr,
      api_booking_ref: payload.api_booking_ref,
      total_passenger: payload.passengers.length,
      agency_id: payload.agency_id,
      base_fare,
      journey_type,
      payable_amount,
      total_tax,
      ait,
      convenience_fee,
      discount,
      refundable,
      api: payload.api,
      route,
      airline_pnr: payload.airline_pnr,
      last_time: payload.last_time,
      created_by: payload.created_by,
      status: payload.status,
      vendor_price: payload.flight_details.fare.vendor_price,
      partial_payment: data.partial_payment,
    });

    if (payload.fare_rules) {
      await flightBookingModel.insertFlightFareRules({
        flight_booking_id: res[0].id,
        rule_text: payload.fare_rules,
      });
    }

    const booking_code = Lib.getBookingCodeOfFlight(data.availability);
    let booking_code_index = 0;

    let baggage = data.availability[0].segments[0].passenger[0].baggage_info;

    const flightSegment: {
      departure: string;
      arrival: string;
      airline: string;
      cabin: string;
    }[] = [];
    const flightDetails: any = [];
    const segmentBody: IInsertFlightSegmentPayload[] = [];
    const oldFlights = payload.old_revalidate_data?.flights;
    (flights as IFormattedFlight[]).forEach((flight) => {
      flight.options.forEach((option: IFormattedFlightOption) => {
        const flight_class = Lib.getFlightClass(
          booking_code,
          booking_code_index,
          data.availability[0]
        );
        booking_code_index++;
        //flight segment to send in the email confirmation template
        flightSegment.push({
          departure: `${option.departure.city?.split('-')[0]}(${option.departure.airport_code}) - ${option.departure.date
            }, ${Lib.convertToLocaleString(option.departure.time)}`,
          arrival: `${option.arrival.city?.split('-')[0]}(${option.arrival.airport_code}) - ${option.arrival.date
            }, ${Lib.convertToLocaleString(option.arrival.time)}`,
          airline: `${option.carrier.carrier_marketing_airline} - ${option.carrier.carrier_marketing_code} ${option.carrier.carrier_marketing_flight_number}`,
          cabin: flight_class,
        });

        //flight segment to generate the booking pdf
        flightDetails.push({
          departure: `${option.departure.city} ${option.departure.airport_code} ${option.departure.terminal}`,
          arrival: `${option.arrival.city} ${option.arrival.airport_code} ${option.arrival.terminal}`,
          duration: Lib.formatDuration(Number(option.elapsedTime)),
          details: {
            class: flight_class,
            departure: option.departure.airport + ' (' + option.departure.city + ')',
            lands_in: option.arrival.airport + ' (' + option.arrival.city + ')',
          },
          airline: {
            name: option.carrier.carrier_marketing_airline,
            image: `${PROJECT_IMAGE_URL}/${option.carrier.carrier_marketing_logo}`,
            flight_number: option.carrier.carrier_marketing_flight_number,
          },
          cabin: flight_class,
          departure_date: Lib.formatAMPM(
            new Date(
              option.departure.date.toString().split('T')[0] +
              'T' +
              option.departure.time.toString().split('+')[0]
            )
          ),
        });

        // Find the matching option in old_revalidate_data
        let segment_key = option.id;
        if (oldFlights) {
          const oldFlight = oldFlights.find((f) => f.id === flight.id);
          const oldOption = oldFlight?.options.find(
            (o) =>
              o.carrier.carrier_marketing_code === option.carrier.carrier_marketing_code &&
              o.departure.airport_code === option.departure.airport_code &&
              o.arrival.airport_code === option.arrival.airport_code &&
              o.departure.date === option.departure.date &&
              o.arrival.date === option.arrival.date
          );

          if (oldOption) {
            segment_key = oldOption.id;
          }
        }
        //flight segment to insert in the database
        segmentBody.push({
          flight_booking_id: res[0].id,
          segment_key: segment_key,
          airline: option.carrier.carrier_marketing_airline,
          airline_logo: option.carrier.carrier_marketing_logo,
          arrival_date: option.arrival.date,
          airline_code: option.carrier.carrier_marketing_code,
          arrival_time: option.arrival.time,
          departure_date: option.departure.date,
          departure_time: option.departure.time,
          baggage,
          class: flight_class,
          destination:
            option.arrival.airport +
            ' (' +
            option.arrival.city +
            ',' +
            option.arrival.city_code +
            ')',
          flight_number: `${option.carrier.carrier_marketing_flight_number}`,
          origin:
            option.departure.airport +
            ' (' +
            option.departure.city +
            ',' +
            option.departure.city_code +
            ')',
          aircraft: option.carrier.carrier_aircraft_name,
          duration: String(option.elapsedTime),
          departure_terminal: option.departure.terminal,
          arrival_terminal: option.arrival.terminal,
        });
      });
    });

    await flightBookingModel.insertFlightSegment(segmentBody);
    //insert traveler
    const save_travelers: any = [];
    let travelerBody;
    const travelerDetails: any = [];
    const passengerTypeCount: { [key: string]: number } = {};
    travelerBody = payload.passengers.map((obj: IFlightBookingPassengerReqBody) => {
      //traveler details to generate the booking pdf
      travelerDetails.push({
        name: String(obj.reference).toUpperCase() + ' ' + obj.first_name + ' ' + obj.last_name,
        reference: obj.reference,
        type: obj.type,
        gender: obj.gender,
        dob: obj.date_of_birth,
        phone: obj.contact_number,
        passport_number: obj.passport_number,
        frequent_flyer_number: obj.frequent_flyer_number,
      });
      //traveler details to insert in the database
      const {
        key,
        save_information,
        reference,
        contact_email,
        contact_number,
        last_name,
        passport_expiry_date,
        _ref,
        ...rest
      } = obj;
      for (const file of payload.files) {
        if (file.fieldname?.split('-')[0] === 'visa' && file.fieldname?.split('-')[1] == key) {
          rest['visa_file'] = file.filename;
          obj.visa_file = file.filename;
        } else if (
          file.fieldname?.split('-')[0] === 'passport' &&
          file.fieldname?.split('-')[1] == key
        ) {
          rest['passport_file'] = file.filename;
          obj.passport_file = file.filename;
        }
      }
      if (save_information === true) {
        save_travelers.push({
          reference: reference,
          sur_name: last_name,
          phone: contact_number,
          email: contact_email,
          agency_id: payload.agency_id,
          visa_file: obj.visa_file,
          passport_file: obj.passport_file,
          passport_expire_date: passport_expiry_date,
          ...rest,
        });
      }
      if (passengerTypeCount[obj.type]) {
        passengerTypeCount[obj.type] += 1;
      } else {
        passengerTypeCount[obj.type] = 1;
      }
      return {
        ...rest,
        last_name,
        phone: contact_number,
        reference,
        email: contact_email,
        flight_booking_id: res[0].id,
        passport_expiry_date,
        passenger_key: key
      };
    });
    await flightBookingModel.insertFlightTraveler(travelerBody);
    if (save_travelers.length) {
      await this.Model.agencyModel(this.trx).insertTraveler(save_travelers);
    }

    //ssr
    if (payload.ssr && payload.ssr.length) {
      const ssr_payload = payload.ssr.map((elm) => {
        return {
          traveler_key: String(elm.passenger_key),
          segment_key: String(elm.segment_id),
          code: elm.code,
          type: elm.type,
          amount: elm.price,
          description: elm.desc,
          booking_id: res[0].id,
        };
      });
      await flightBookingModel.createFlightBookingSSR(ssr_payload);
    }

    await flightBookingModel.insertFlightBookingTracking({
      flight_booking_id: res[0].id,
      details: payload.details,
    });
    //send mail to the agent
    const bookingDetails = await flightBookingModel.getSingleFlightBooking({
      id: res[0].id,
    });
    const flightBookTemplateData = {
      bookingId: booking_ref,
      airline: data.carrier_name,
      segments: flightSegment,
      numberOfPassengers: payload.passengers.length,
      route: route || '',
      journeyType: journey_type,
      totalAmount: payable_amount,
      name: payload.name,
      pnr: payload.pnr?.startsWith('NZB') && payload.pnr?.length > 6 ? 'N/A' : String(payload.pnr),
    };

    let checkInDetails: string[] = [];

    data.availability[0].segments[0].passenger.forEach((passenger: any) => {
      let typeLabel = '';

      switch (passenger.type) {
        case 'ADT':
          typeLabel = 'Adult';
          break;
        case 'INF':
          typeLabel = 'Infant';
          break;
        default:
          typeLabel = 'Child';
          break;
      }

      if (passenger.baggage_count > 0) {
        checkInDetails.push(
          `${typeLabel} Check-in: ${passenger.baggage_count} ${passenger.baggage_unit}`
        );
      }
    });

    const fareDetails = {
      passenger_type: Object.keys(passengerTypeCount)
        .map((type) => `${type}(${passengerTypeCount[type]})`)
        .join(', '),
      quantity: payload.passengers.length,
      base_fare: base_fare,
      discount: discount,
      taxes: total_tax,
      total: payable_amount,
    };

    //flight booking pdf
    const flightBookingPdfData = {
      date_of_issue: 'N/A',
      bookingId: booking_ref,
      bookingStatus: bookingDetails[0].booking_status,
      pnr: String(payload.pnr),
      airlinePnr: payload.airline_pnr || '-',
      route: route,
      numberOfPassengers: payload.passengers.length,
      journeyType: journey_type,
      segments: flightDetails,
      passengers: travelerDetails,
      fare: fareDetails,
      baggage_information: {
        route: route,
        check_in: checkInDetails.join(', '),
      },
    };
    const bookingEmailSubService = new SendBookingEmailService();
    await bookingEmailSubService.sendFlightBookingEmail({
      flightBookingPdfData,
      flightBookTemplateData,
      email: payload.email,
      bookingId: booking_ref,
      panel: "B2B"
    });
    //send notification to admin
    const adminNotificationSubService = new AdminNotificationSubService(this.trx);
    await adminNotificationSubService.insertNotification({
      message: `A flight has been booked through B2B. Booking ID: ${booking_ref}`,
      ref_id: res[0].id,
      type: NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
    });
    return {
      booking_id: res[0].id,
      booking_ref,
    };
  }
}
