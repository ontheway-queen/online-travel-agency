"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SabreAPIEndpoints {
}
SabreAPIEndpoints.TICKET_ISSUE_ENDPOINT = '/v1.3.0/air/ticket';
SabreAPIEndpoints.FLIGHT_BOOKING_ENDPOINT = '/v2.5.0/passenger/records?mode=create';
SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT = '/v1/trip/orders/cancelBooking';
SabreAPIEndpoints.GET_TOKEN_ENDPOINT = '/v3/auth/token';
SabreAPIEndpoints.GET_BOOKING_ENDPOINT = '/v1/trip/orders/getBooking';
SabreAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT = '/v5/shop/flights/revalidate';
SabreAPIEndpoints.FLIGHT_SEARCH_ENDPOINT = '/v4/offers/shop';
SabreAPIEndpoints.FLIGHT_SEARCH_ENDPOINT_V5 = '/v5/offers/shop';
exports.default = SabreAPIEndpoints;
