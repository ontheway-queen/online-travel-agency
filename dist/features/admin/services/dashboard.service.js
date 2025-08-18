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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminDashboardService extends abstract_service_1.default {
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
    get(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const b2bBookingModel = this.Model.b2bFlightBookingModel(trx);
                const b2bBookingData = yield b2bBookingModel.totalBookingsCount();
                const b2cBookingModel = this.Model.btocFlightBookingModel(trx);
                const b2cBookingData = yield b2cBookingModel.totalBookingsCount();
                const b2bBookingSupport = this.Model.btobBookingSupportModel(trx);
                const b2bBookingSupportData = yield b2bBookingSupport.totalSupportCount();
                const b2cBookingSupport = this.Model.btocBookingSupportModel(trx);
                const b2cBookingSupportData = yield b2cBookingSupport.totalSupportCount();
                const agencyModel = this.Model.agencyModel(trx);
                const agencyData = yield agencyModel.totalAgenciesCount();
                const b2bBookingGraph = yield b2bBookingModel.monthlyBookingsGraphForCurrentYear();
                const b2cBookingGraph = yield b2cBookingModel.monthlyBookingsGraphForCurrentYear();
                const topAgencies = yield agencyModel.getTopAgencies();
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
                        b2b_yearly_booking_graph: b2bBookingGraph,
                        b2c_yearly_booking_graph: b2cBookingGraph,
                        top_agencies: topAgencies,
                    },
                };
            }));
        });
    }
    //booking search
    bookingSearch(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.adminModel();
            const filter = req.query.filter;
            if (!filter) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: []
                };
            }
            const data = yield model.searchBookingInfo(filter);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data
            };
        });
    }
}
exports.default = AdminDashboardService;
