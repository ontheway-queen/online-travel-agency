export default class SabreAPIEndpoints {
  static readonly TICKET_ISSUE_ENDPOINT = '/v1.3.0/air/ticket';
  static readonly FLIGHT_BOOKING_ENDPOINT =
    '/v2.5.0/passenger/records?mode=create';
  static readonly CANCEL_BOOKING_ENDPOINT = '/v1/trip/orders/cancelBooking';
  static readonly GET_TOKEN_ENDPOINT = '/v3/auth/token';
  static readonly GET_BOOKING_ENDPOINT = '/v1/trip/orders/getBooking';
  static readonly FLIGHT_REVALIDATE_ENDPOINT = '/v5/shop/flights/revalidate';
  static readonly FLIGHT_SEARCH_ENDPOINT = '/v4/offers/shop';
  static readonly FLIGHT_SEARCH_ENDPOINT_V5 = '/v5/offers/shop';
}
