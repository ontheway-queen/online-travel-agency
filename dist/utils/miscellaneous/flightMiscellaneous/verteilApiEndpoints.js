"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VerteilAPIEndpoints {
}
VerteilAPIEndpoints.GET_TOKEN_ENDPOINT = '/oauth2/token?grant_type=client_credentials&scope=api';
VerteilAPIEndpoints.FLIGHT_SEARCH_ENDPOINT = 'airShopping';
VerteilAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT = 'flightPrice';
VerteilAPIEndpoints.FLIGHT_BOOK_ENDPOINT = 'OrderCreate';
VerteilAPIEndpoints.GET_BOOKING_ENDPOINT = 'OrderRetrieve';
VerteilAPIEndpoints.ORDER_RESHOP_ENDPOINT = 'RepriceOrder';
VerteilAPIEndpoints.ORDER_RESHOP_HEADER_ENDPOINT = 'OrderReshop';
VerteilAPIEndpoints.ACCEPT_REPRICE_OFFER_ENDPOINT = 'AcceptRepricedOrder';
VerteilAPIEndpoints.ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT = 'OrderChange';
VerteilAPIEndpoints.BOOKING_CANCEL_ENDPOINT = 'OrderCancel';
exports.default = VerteilAPIEndpoints;
