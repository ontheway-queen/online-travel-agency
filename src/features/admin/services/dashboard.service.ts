import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";

class AdminDashboardService extends AbstractServices {
  // //dashboard
  // public async get(req: Request) {
  //   return await this.db.transaction(async (trx) => {
  //     const admin_model = this.Model.adminModel(trx);
  //     const booking_total_data = await admin_model.adminDashboard();
  //     // const booking_model = this.Model.bookingRequestModel();
  //     // const booking_data = await booking_model.get({limit:"5", status:'Pending'})
  //     const flight_model = this.Model.btocFlightBookingModel(trx);
  //     const b2b_flight_model = this.Model.b2bFlightBookingModel(trx);
  //     const booking_data = await flight_model.getAdminAllFlightBooking({
  //       limit: "5",
  //       skip: "0",
  //     });
  //     const b2b_booking_data = await b2b_flight_model.getAllFlightBooking({
  //       limit: "5",
  //       skip: "0",
  //     });
  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_OK,
  //       message: this.ResMsg.HTTP_OK,
  //       data: {
  //         booking_total: booking_total_data.total_booking,
  //         b2c_booking_data: booking_data.data,
  //         b2b_booking_data: b2b_booking_data.data,
  //         b2c_booking_graph: booking_total_data.booking_graph,
  //         b2b_booking_graph: booking_total_data.booking_graph_b2b,
  //       },
  //     };
  //   })
  // }

  //dashboard
  public async get(req: Request) {
    return await this.db.transaction(async (trx) => {
      const b2bBookingModel = this.Model.b2bFlightBookingModel(trx);
      const b2bBookingData = await b2bBookingModel.totalBookingsCount();
      const b2cBookingModel = this.Model.btocFlightBookingModel(trx);
      const b2cBookingData = await b2cBookingModel.totalBookingsCount();
      const b2bBookingSupport = this.Model.btobBookingSupportModel(trx);
      const b2bBookingSupportData = await b2bBookingSupport.totalSupportCount();
      const b2cBookingSupport = this.Model.btocBookingSupportModel(trx);
      const b2cBookingSupportData = await b2cBookingSupport.totalSupportCount();
      const agencyModel = this.Model.agencyModel(trx);
      const agencyData = await agencyModel.totalAgenciesCount();
      const b2bBookingGraph = await b2bBookingModel.monthlyBookingsGraphForCurrentYear();
      const b2cBookingGraph = await b2cBookingModel.monthlyBookingsGraphForCurrentYear();
      const topAgencies = await agencyModel.getTopAgencies();
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          b2b_monthly_booking_data: {
            issued: b2bBookingData.issued,
            refunded: b2bBookingData.refunded,
            voided: b2bBookingData.voided,
            pending: b2bBookingData.pending,
            ticket_hold: b2bBookingData.ticket_hold,
            ticket_in_process: b2bBookingData.ticket_in_process,
            booking_cancelled: b2bBookingData.booking_cancelled
          },
          b2c_monthly_booking_data: {
            issued: b2cBookingData.issued,
            refunded: b2cBookingData.refunded,
            voided: b2cBookingData.voided,
            pending: b2cBookingData.pending,
            ticket_hold: b2cBookingData.ticket_hold,
            ticket_in_process: b2cBookingData.ticket_in_process,
            booking_cancelled: b2cBookingData.booking_cancelled
          },
          b2b_monthly_booking_support_data: {
            pending: b2bBookingSupportData.pending,
            processing: b2bBookingSupportData.processing,
            adjusted: b2bBookingSupportData.adjusted,
            closed: b2bBookingSupportData.closed,
            rejected: b2bBookingSupportData.rejected
          },
          b2c_monthly_booking_support_data: {
            pending: b2cBookingSupportData.pending,
            processing: b2cBookingSupportData.processing,
            adjusted: b2cBookingSupportData.adjusted,
            closed: b2cBookingSupportData.closed,
            rejected: b2cBookingSupportData.rejected
          },
          agency_data: {
            total: agencyData.total_agency,
            active: agencyData.active_agency,
            inactive: agencyData.inactive_agency,
            pending: agencyData.pending_agency,
            rejected: agencyData.rejected_agency,
            approved: agencyData.approved_agency,
          },
          b2b_yearly_booking_graph:b2bBookingGraph,
          b2c_yearly_booking_graph:b2cBookingGraph,
          top_agencies: topAgencies,
        },
      }
    });
  }

  //booking search
  public async bookingSearch(req: Request) {
    const model = this.Model.adminModel();
    const filter = req.query.filter as string;
    if (!filter) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: []
      }
    }
    const data = await model.searchBookingInfo(filter);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data
    }
  }
}

export default AdminDashboardService;
