import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import multiAPIFlightService from './b2cFlight.service';
import { IFlightBookingPassengerReqBody } from '../../../utils/supportTypes/flightBookingTypes/commonFlightBookingTypes';

export default class BookingRequestService extends AbstractServices {
  constructor() {
    super();
  }

  //Flight booking request
  public async flightBookingRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.user;
      const body = req.body;
      const revalidate_data =
        await new multiAPIFlightService().flightSubRevalidate(
          body.search_id,
          body.flight_id
        );
      if (!revalidate_data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // create pnr
      const flightBookingModel = this.Model.btocBookingRequestModel(trx);

      const base_fare = revalidate_data.fare.base_fare;
      const total_tax = revalidate_data.fare.total_tax;
      // const ait = revalidate_data.fare.ait;
      const discount = revalidate_data.fare.discount;
      const convenience_fee = 0;
      const payable_amount = revalidate_data.fare.payable;
      const refundable = revalidate_data.refundable === true ? 1 : 0;
      let ticket_issue_last_time: any = undefined;
      if (
        revalidate_data.ticket_last_date &&
        revalidate_data.ticket_last_time
      ) {
        ticket_issue_last_time =
          String(revalidate_data.ticket_last_date) +
          ' ' +
          String(revalidate_data.ticket_last_time);
      }

      const { flights, leg_description } = revalidate_data;
      let journey_type = 'One way';

      if (leg_description.length == 2) {
        journey_type = 'Round Trip';
      }

      if (leg_description.length > 2) {
        journey_type = 'Multi City';
      }

      const route = leg_description.map((item: any) => {
        return item.departureLocation;
      });

      //insert flight booking
      const res = await flightBookingModel.insert({
        total_passenger: body.passengers.length,
        user_id: id,
        base_fare,
        journey_type,
        payable_amount,
        total_tax,
        ticket_issue_last_time,
        convenience_fee,
        discount,
        refundable,
        api: revalidate_data.api,
        route:
          route.join('-') +
          '-' +
          leg_description[leg_description.length - 1].arrivalLocation,
      });

      //insert segment
      let flight_class = `${revalidate_data.availability[0].segments[0].passenger[0].cabin_type}(${revalidate_data.availability[0].segments[0].passenger[0].booking_code})`;
      let baggage = `${revalidate_data.availability[0].segments[0].passenger[0].baggage_info}`;

      const segmentBody: any[] = [];

      flights.forEach((flight: any) => {
        flight.options.forEach((option: any) => {
          segmentBody.push({
            booking_request_id: res[0].id,
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
            flight_number: `${option.carrier.carrier_marketing_code} ${option.carrier.carrier_marketing_flight_number}`,
            origin:
              option.departure.airport +
              ' (' +
              option.departure.city +
              ',' +
              option.departure.city_code +
              ')',
          });
        });
      });

      await flightBookingModel.insertSegment(segmentBody);

      //insert traveler
      let travelerBody: any[] = [];
      travelerBody = body.passengers.map(
        (obj: IFlightBookingPassengerReqBody) => {
          const { reference, contact_email, ...rest } = obj;
          return {
            ...rest,
            title: reference,
            email: contact_email,
            booking_request_id: res[0].id,
          };
        }
      );

      await flightBookingModel.insertTraveler(travelerBody);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Booking request completed',
      };
    });
  }

  //get list of booking req
  public async getBookingReqList(req: Request) {
    const { id } = req.user;
    const model = this.Model.btocBookingRequestModel();
    const data = await model.get({ user_id: id });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  //get single booking req
  public async getBookingReqSingle(req: Request) {
    const { id } = req.user;
    const { id: booking_id } = req.params;
    const model = this.Model.btocBookingRequestModel();
    const data = await model.getSingle({ user_id: id, id: Number(booking_id) });
    const segment = await model.getSegment(Number(booking_id));
    const traveler = await model.getTraveler(Number(booking_id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { ...data[0], segment, traveler },
    };
  }
}
