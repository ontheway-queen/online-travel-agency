import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  IB2BFlightBookingQueryInterface,
  IB2BLedgerReportQueryInterface,
  IB2bSalesQueryInterface,
  IB2BTicketWiseQueryInterface,
  IB2BTopUpQueryInterface,
  IB2CFlightBookingQueryInterface,
  IB2CTransactionQueryInterface,
} from '../utils/types/admin.report.interface';

export class AdminReportService extends AbstractServices {
  constructor() {
    super();
  }

  public async getB2CPaymentTransactionReport(req: Request) {
    const reqQuery = req.query as unknown as IB2CTransactionQueryInterface;

    const reportModel = this.Model.ReportModel();

    const result = await reportModel.getB2CPaymentTransactionReport(reqQuery);

    const modifiedResult = result.data.map((item) => {
      return {
        id: item.id,
        amount: item.amount,
        payment_time: item.payment_time,
        transaction_id: item.transaction_id,
        payment_type: item.payment_type,
        details: item.details,
        payment_id: item.payment_id,
        payment_by: item.payment_by,
        payment_gateway: item.payment_gateway,
        invoice_id: item.invoice_id,
        ref_type: item.ref_type,
        invoice_number: item.invoice_number,
        booking_ref: item.flight_booking_ref || item.visa_booking_ref || item.tour_booking_ref,
        booking_id: item.flight_booking_id || item.visa_booking_id || item.tour_booking_id,
        username: item.username,
        first_name: item.first_name,
        last_name: item.last_name,
      };
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: modifiedResult,
      total: result.total,
    };
  }

  public async getB2BTopUpReport(req: Request) {
    const reqQuery = req.query as unknown as IB2BTopUpQueryInterface;

    const reportModel = this.Model.ReportModel();
    const result = await reportModel.getB2BTopUpReport(reqQuery);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: result.data,
      total: result.total,
    };
  }

  public async getB2BLedgerReport(req: Request) {
    const reqQuery = req.query as unknown as IB2BLedgerReportQueryInterface;

    const reportModel = this.Model.ReportModel();

    const result = await reportModel.getB2BLedgerReport(reqQuery);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: result.data,
      total: result.total,
    };
  }

  public async getB2BSalesReport(req: Request) {
    return this.db.transaction(async (trx) => {
      const reqQuery = req.query as unknown as IB2bSalesQueryInterface;

      const reportModel = this.Model.ReportModel(trx);
      const flightModel = this.Model.b2bFlightBookingModel(trx);
      const invoiceModel = this.Model.btobPaymentModel(trx);
      const result = await reportModel.getB2BSalesReport(reqQuery);

      const modifiedResult = await Promise.all(
        result.data.map(async (item) => {
          const [segments, travelers, money_receipt] = await Promise.all([
            flightModel.getFlightSegment(item.booking_id),
            flightModel.getFlightBookingTraveler(item.booking_id),
            invoiceModel.getMoneyReceipt(item.invoice_id),
          ]);

          return {
            booking_id: item.booking_id,
            booking_ref: item.booking_ref,
            booking_date: item.booking_date,
            journey_type: item.journey_type,
            departure_date: segments[0]?.departure_date,
            arrival_date: segments[segments.length - 1]?.arrival_date,
            airline: segments[0]?.airline,
            flight_number: segments[0]?.flight_number,
            class: segments[0]?.class,
            pax_info: travelers.map((traveler) => {
              return {
                pax_name: `${String(traveler.reference).toUpperCase()} ${traveler.first_name} ${traveler.last_name
                  }`,
                pax_type: traveler.type,
                ticket_number: traveler.ticket_number,
              };
            }),
            vendor_price: item.vendor_price,
            partial_payment: item.partial_payment,
            status: item.status,
            pnr_code: item.pnr_code,
            route: item.route,
            total_passenger: item.total_passenger,
            base_fare: item.base_fare,
            total_tax: item.total_tax,
            ait: item.ait,
            convenience_fee: item.convenience_fee,
            payable_amount: item.payable_amount,
            api: item.api,
            agency_name: item.agency_name,
            invoice_number: item.invoice_number,
            money_receipt: money_receipt,
          };
        })
      );

      console.log('result length', modifiedResult.length);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: modifiedResult,
        total: result.total,
      };
    });
  }

  public async getB2BTicketWiseReport(req: Request) {
    const reqQuery = req.query as unknown as IB2BTicketWiseQueryInterface;
    const reportModel = this.Model.ReportModel();
    const result = await reportModel.getB2BTicketWiseReport(reqQuery);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: result.data,
      total: result.total,
    };
  }

  public async getB2BFlightBookingReport(req: Request) {
    const reqQuery = req.query as unknown as IB2BFlightBookingQueryInterface;
    const reportModel = this.Model.ReportModel();
    const result = await reportModel.getB2BFlightBookingReport(reqQuery);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: result.data,
      total: result.total,
    };
  }

  public async getB2CFlightBookingReport(req: Request) {
    const reqQuery = req.query as unknown as IB2CFlightBookingQueryInterface;
    const reportModel = this.Model.ReportModel();
    const result = await reportModel.getB2CFlightBookingReport(reqQuery);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: result.data,
      total: result.total,
    };
  }
}
