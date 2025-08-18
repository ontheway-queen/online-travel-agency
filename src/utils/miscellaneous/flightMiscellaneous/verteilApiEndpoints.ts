export default class VerteilAPIEndpoints {
  static readonly GET_TOKEN_ENDPOINT = '/oauth2/token?grant_type=client_credentials&scope=api';
  static readonly FLIGHT_SEARCH_ENDPOINT = 'airShopping';
  static readonly FLIGHT_REVALIDATE_ENDPOINT = 'flightPrice';
  static readonly FLIGHT_BOOK_ENDPOINT = 'OrderCreate';
  static readonly GET_BOOKING_ENDPOINT = 'OrderRetrieve';
  static readonly ORDER_RESHOP_ENDPOINT = 'RepriceOrder';
  static readonly ORDER_RESHOP_HEADER_ENDPOINT = 'OrderReshop';
  static readonly ACCEPT_REPRICE_OFFER_ENDPOINT = 'AcceptRepricedOrder';
  static readonly ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT = 'OrderChange';
  static readonly BOOKING_CANCEL_ENDPOINT = 'OrderCancel';
}
