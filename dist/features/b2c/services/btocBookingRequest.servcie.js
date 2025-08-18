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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const b2cFlight_service_1 = __importDefault(require("./b2cFlight.service"));
class BookingRequestService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //Flight booking request
    flightBookingRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.user;
                const body = req.body;
                const revalidate_data = yield new b2cFlight_service_1.default().flightSubRevalidate(body.search_id, body.flight_id);
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
                let ticket_issue_last_time = undefined;
                if (revalidate_data.ticket_last_date &&
                    revalidate_data.ticket_last_time) {
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
                const route = leg_description.map((item) => {
                    return item.departureLocation;
                });
                //insert flight booking
                const res = yield flightBookingModel.insert({
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
                    route: route.join('-') +
                        '-' +
                        leg_description[leg_description.length - 1].arrivalLocation,
                });
                //insert segment
                let flight_class = `${revalidate_data.availability[0].segments[0].passenger[0].cabin_type}(${revalidate_data.availability[0].segments[0].passenger[0].booking_code})`;
                let baggage = `${revalidate_data.availability[0].segments[0].passenger[0].baggage_info}`;
                const segmentBody = [];
                flights.forEach((flight) => {
                    flight.options.forEach((option) => {
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
                            destination: option.arrival.airport +
                                ' (' +
                                option.arrival.city +
                                ',' +
                                option.arrival.city_code +
                                ')',
                            flight_number: `${option.carrier.carrier_marketing_code} ${option.carrier.carrier_marketing_flight_number}`,
                            origin: option.departure.airport +
                                ' (' +
                                option.departure.city +
                                ',' +
                                option.departure.city_code +
                                ')',
                        });
                    });
                });
                yield flightBookingModel.insertSegment(segmentBody);
                //insert traveler
                let travelerBody = [];
                travelerBody = body.passengers.map((obj) => {
                    const { reference, contact_email } = obj, rest = __rest(obj, ["reference", "contact_email"]);
                    return Object.assign(Object.assign({}, rest), { title: reference, email: contact_email, booking_request_id: res[0].id });
                });
                yield flightBookingModel.insertTraveler(travelerBody);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Booking request completed',
                };
            }));
        });
    }
    //get list of booking req
    getBookingReqList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.user;
            const model = this.Model.btocBookingRequestModel();
            const data = yield model.get({ user_id: id });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    //get single booking req
    getBookingReqSingle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.user;
            const { id: booking_id } = req.params;
            const model = this.Model.btocBookingRequestModel();
            const data = yield model.getSingle({ user_id: id, id: Number(booking_id) });
            const segment = yield model.getSegment(Number(booking_id));
            const traveler = yield model.getTraveler(Number(booking_id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data[0]), { segment, traveler }),
            };
        });
    }
}
exports.default = BookingRequestService;
