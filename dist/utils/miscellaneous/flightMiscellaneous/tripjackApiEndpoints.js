"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TripjackApiEndpoints {
}
TripjackApiEndpoints.FLIGHT_SEARCH_ENDPOINT = '/fms/v1/air-search-all';
TripjackApiEndpoints.FLIGHT_REVALIDATE_ENDPOINT = '/fms/v1/review';
TripjackApiEndpoints.FARE_RULES_ENDPOINT = '/fms/v2/farerule';
TripjackApiEndpoints.FLIGHT_BOOKING_ENDPOINT = '/oms/v1/air/book';
TripjackApiEndpoints.CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT = '/oms/v1/air/fare-validate';
TripjackApiEndpoints.TICKET_ISSUE_ENDPOINT = '/oms/v1/air/confirm-book';
TripjackApiEndpoints.RETRIEVE_BOOKING_ENDPOINT = '/oms/v1/booking-details';
TripjackApiEndpoints.CANCEL_BOOKING_ENDPOINT = '/oms/v1/air/unhold';
exports.default = TripjackApiEndpoints;
