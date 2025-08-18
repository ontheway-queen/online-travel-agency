export default class TripjackApiEndpoints {
    static readonly FLIGHT_SEARCH_ENDPOINT = '/fms/v1/air-search-all';
    static readonly FLIGHT_REVALIDATE_ENDPOINT = '/fms/v1/review';
    static readonly FARE_RULES_ENDPOINT = '/fms/v2/farerule';
    static readonly FLIGHT_BOOKING_ENDPOINT = '/oms/v1/air/book';
    static readonly CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT = '/oms/v1/air/fare-validate';
    static readonly TICKET_ISSUE_ENDPOINT = '/oms/v1/air/confirm-book';
    static readonly RETRIEVE_BOOKING_ENDPOINT = '/oms/v1/booking-details';
    static readonly CANCEL_BOOKING_ENDPOINT = '/oms/v1/air/unhold';
}