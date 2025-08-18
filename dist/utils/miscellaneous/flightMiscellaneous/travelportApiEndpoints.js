"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TravelportApiEndPoints {
}
TravelportApiEndPoints.FLIGHT_SEARCH_ENDPOINT = '/catalog/search/catalogproductofferings'; //flight search
TravelportApiEndPoints.FLIGHT_REVALIDATE_ENDPOINT = '/price/offers/buildfromcatalogproductofferings'; //flight revalidate
TravelportApiEndPoints.CREATE_WORKBENCH_ENDPOINT = '/book/session/reservationworkbench'; //flight booking
TravelportApiEndPoints.ADD_OFFER_PREFIX_ENDPOINT = '/book/airoffer/reservationworkbench'; //flight booking
TravelportApiEndPoints.ADD_OFFER_POSTFIX_ENDPOINT = '/offers/buildfromcatalogproductofferings'; //flight booking
TravelportApiEndPoints.ADD_TRAVELER_PREFIX_ENDPOINT = '/book/traveler/reservationworkbench'; //flight booking
TravelportApiEndPoints.ADD_TRAVELER_POSTFIX_ENDPOINT = '/travelers'; //flight booking
TravelportApiEndPoints.COMMIT_WORKBENCH_ENDPOINT = '/book/reservation/reservations'; //flight booking
TravelportApiEndPoints.RETRIEVE_BOOKING_ENDPOINT = '/book/reservation/reservations'; //flight booking
TravelportApiEndPoints.CANCEL_BOOKING_PREFIX_ENDPOINT = '/receipt/reservations'; //booking cancel
TravelportApiEndPoints.CANCEL_BOOKING_POSTFIX_ENDPOINT = '/receipts'; //booking cancel
exports.default = TravelportApiEndPoints;
