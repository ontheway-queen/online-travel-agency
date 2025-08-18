export default class TravelportApiEndPoints {
    static readonly FLIGHT_SEARCH_ENDPOINT = '/catalog/search/catalogproductofferings'; //flight search
    static readonly FLIGHT_REVALIDATE_ENDPOINT = '/price/offers/buildfromcatalogproductofferings'; //flight revalidate
    static readonly CREATE_WORKBENCH_ENDPOINT = '/book/session/reservationworkbench'; //flight booking
    static readonly ADD_OFFER_PREFIX_ENDPOINT = '/book/airoffer/reservationworkbench'; //flight booking
    static readonly ADD_OFFER_POSTFIX_ENDPOINT = '/offers/buildfromcatalogproductofferings'; //flight booking
    static readonly ADD_TRAVELER_PREFIX_ENDPOINT = '/book/traveler/reservationworkbench'; //flight booking
    static readonly ADD_TRAVELER_POSTFIX_ENDPOINT = '/travelers'; //flight booking
    static readonly COMMIT_WORKBENCH_ENDPOINT = '/book/reservation/reservations'; //flight booking
    static readonly RETRIEVE_BOOKING_ENDPOINT = '/book/reservation/reservations'; //flight booking
    static readonly CANCEL_BOOKING_PREFIX_ENDPOINT = '/receipt/reservations'; //booking cancel
    static readonly CANCEL_BOOKING_POSTFIX_ENDPOINT = '/receipts'; //booking cancel
  }
  