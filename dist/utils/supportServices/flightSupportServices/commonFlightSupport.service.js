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
exports.CommonFlightSupport = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../lib/lib"));
const constants_1 = require("../../miscellaneous/constants");
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
class CommonFlightSupport extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    //insert flight search history
    insertFlightSearchHistory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { JourneyType, OriginDestinationInformation, PassengerTypeQuantity, airline_code, } = payload.search_body;
            let journey_type = "One Way";
            if (JourneyType === "2") {
                journey_type = "Round Trip";
            }
            else if (JourneyType === "3") {
                journey_type = "Multi City";
            }
            const selected_cabin = OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin;
            let cabin;
            if (selected_cabin === "1") {
                cabin = "Economy";
            }
            else if (selected_cabin === "2") {
                cabin = "Premium Economy";
            }
            else if (selected_cabin === "3") {
                cabin = "Business";
            }
            else {
                cabin = "First Class";
            }
            let total_adult = 0;
            let total_child = 0;
            let total_infant = 0;
            PassengerTypeQuantity.map((elm) => {
                if (elm.Code.startsWith("A")) {
                    total_adult += elm.Quantity;
                }
                else if (elm.Code.startsWith("C")) {
                    total_child += elm.Quantity;
                }
                else if (elm.Code.startsWith("I")) {
                    total_infant += elm.Quantity;
                }
            });
            const route = lib_1.default.getRouteOfFlight(payload.leg_description);
            const journey_date = lib_1.default.getJourneyDatesOfFlight(payload.leg_description);
            let preferred_airlines = "";
            if (airline_code && airline_code.length) {
                preferred_airlines = airline_code.map((elm) => elm.Code).join(",");
            }
            const user_type = payload.agency_id ? "Agent" : "User";
            const model = this.Model.SearchHistoryModel(this.trx);
            yield model.createFlightSearchHistory({
                user_type,
                agency_id: payload.agency_id,
                searched_by: payload.user_id,
                journey_type,
                flight_class: cabin,
                total_adult,
                total_child,
                total_infant,
                route,
                journey_date,
                preferred_airlines,
                request_body: payload.search_body,
            });
        });
    }
    //calculate convenience fee and discount
    calculateFlightMarkup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ airline, base_fare, flight_class, dynamic_fare_supplier_id, route_type, total_segments, }) {
            const dynamicFareModel = this.Model.DynamicFareModel(this.trx);
            let markup = 0;
            let commission = 0;
            let pax_markup = 0;
            const getFareMarkupQuery = {
                dynamic_fare_supplier_id,
                airline,
                flight_class,
            };
            if (route_type === "DOMESTIC") {
                getFareMarkupQuery.domestic = true;
            }
            else if (route_type === "FROM_DAC") {
                getFareMarkupQuery.from_dac = true;
            }
            else if (route_type === "TO_DAC") {
                getFareMarkupQuery.to_dac = true;
            }
            else {
                getFareMarkupQuery.soto = true;
            }
            //get airline wise fare
            const supplier_airline_fare = yield dynamicFareModel.getSupplierAirlinesFares(getFareMarkupQuery);
            //       console.log({getFareMarkupQuery});
            //  console.log({supplier_airline_fare});
            if (supplier_airline_fare.length) {
                if (supplier_airline_fare[0].markup_type === "FLAT") {
                    markup += Number(supplier_airline_fare[0].markup);
                }
                else if (supplier_airline_fare[0].markup_type === "PER") {
                    markup +=
                        Number(base_fare) * (Number(supplier_airline_fare[0].markup) / 100);
                }
                if (supplier_airline_fare[0].commission_type === "FLAT") {
                    commission += Number(supplier_airline_fare[0].commission);
                }
                else if (supplier_airline_fare[0].commission_type === "PER") {
                    commission +=
                        Number(base_fare) *
                            (Number(supplier_airline_fare[0].commission) / 100);
                }
                if (supplier_airline_fare[0].segment_markup_type === "FLAT") {
                    markup +=
                        Number(supplier_airline_fare[0].segment_markup) * total_segments;
                }
                else if (supplier_airline_fare[0].segment_markup_type === "PER") {
                    markup +=
                        Number(base_fare) *
                            (Number(supplier_airline_fare[0].segment_markup) / 100) *
                            total_segments;
                }
                if (supplier_airline_fare[0].segment_commission_type === "FLAT") {
                    commission +=
                        Number(supplier_airline_fare[0].segment_commission) * total_segments;
                }
                else if (supplier_airline_fare[0].segment_commission_type === "PER") {
                    commission +=
                        Number(base_fare) *
                            (Number(supplier_airline_fare[0].segment_commission) / 100) *
                            total_segments;
                }
                if (supplier_airline_fare[0].pax_markup) {
                    pax_markup += Number(supplier_airline_fare[0].pax_markup);
                }
            }
            else {
                //get default fare for the current API if separate commission not exist
                const dynamic_fare_supplier = yield dynamicFareModel.getSuppliers({
                    id: dynamic_fare_supplier_id,
                    status: true,
                });
                if (dynamic_fare_supplier.length) {
                    if (dynamic_fare_supplier[0].commission_type === "FLAT") {
                        commission += Number(dynamic_fare_supplier[0].commission);
                    }
                    else if (dynamic_fare_supplier[0].commission_type === "PER") {
                        commission +=
                            Number(base_fare) *
                                (Number(dynamic_fare_supplier[0].commission) / 100);
                    }
                    if (dynamic_fare_supplier[0].markup_type === "FLAT") {
                        markup += Number(dynamic_fare_supplier[0].markup);
                    }
                    else if (dynamic_fare_supplier[0].markup_type === "PER") {
                        markup +=
                            Number(base_fare) * (Number(dynamic_fare_supplier[0].markup) / 100);
                    }
                    if (dynamic_fare_supplier[0].pax_markup) {
                        pax_markup += Number(dynamic_fare_supplier[0].pax_markup);
                    }
                    if (dynamic_fare_supplier[0].segment_markup_type === "FLAT") {
                        markup +=
                            Number(dynamic_fare_supplier[0].segment_markup) * total_segments;
                    }
                    else if (dynamic_fare_supplier[0].segment_markup_type === "PER") {
                        markup +=
                            Number(base_fare) *
                                (Number(dynamic_fare_supplier[0].segment_markup) / 100) *
                                total_segments;
                    }
                    if (dynamic_fare_supplier[0].segment_commission_type === "FLAT") {
                        commission +=
                            Number(dynamic_fare_supplier[0].segment_commission) *
                                total_segments;
                    }
                    else if (dynamic_fare_supplier[0].segment_commission_type === "PER") {
                        commission +=
                            Number(base_fare) *
                                (Number(dynamic_fare_supplier[0].segment_commission) / 100) *
                                total_segments;
                    }
                }
            }
            return {
                markup: Number(Number(markup).toFixed(2)),
                commission: Number(Number(commission).toFixed(2)),
                pax_markup: Number(Number(pax_markup).toFixed(2)),
            };
        });
    }
    //calculate tax markup and commission
    calculateFlightTaxMarkup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, tax, route_type, airline }) {
            const getFareMarkupQuery = {
                dynamic_fare_supplier_id
            };
            const dynamicFareModel = this.Model.DynamicFareModel(this.trx);
            if (route_type === "DOMESTIC") {
                getFareMarkupQuery.domestic = true;
            }
            else if (route_type === "FROM_DAC") {
                getFareMarkupQuery.from_dac = true;
            }
            else if (route_type === "TO_DAC") {
                getFareMarkupQuery.to_dac = true;
            }
            else {
                getFareMarkupQuery.soto = true;
            }
            let markup = 0;
            let commission = 0;
            for (const taxItem of tax) {
                for (const tax_elm of taxItem) {
                    const supplier_data = yield dynamicFareModel.getFareRulesConditions(Object.assign(Object.assign({}, getFareMarkupQuery), { tax_name: tax_elm.code.substring(0, 2), airline }));
                    if (supplier_data.length) {
                        if (supplier_data[0].markup_type === "FLAT") {
                            markup += Number(supplier_data[0].markup);
                        }
                        else if (supplier_data[0].markup_type === "PER") {
                            markup +=
                                Number(tax_elm.amount) * (Number(supplier_data[0].markup) / 100);
                        }
                        if (supplier_data[0].commission_type === "FLAT") {
                            commission += Number(supplier_data[0].commission);
                        }
                        else if (supplier_data[0].commission_type === "PER") {
                            commission +=
                                Number(tax_elm.amount) * (Number(supplier_data[0].commission) / 100);
                        }
                    }
                }
            }
            return {
                tax_markup: Number(markup),
                tax_commission: Number(commission),
            };
        });
    }
    // find route type
    routeTypeFinder({ airportsPayload, originDest, }) {
        let route_type = flightConstants_1.ROUTE_TYPE.SOTO;
        let airports = [];
        if (originDest) {
            originDest.forEach((item) => {
                airports.push(item.OriginLocation.LocationCode);
                airports.push(item.DestinationLocation.LocationCode);
            });
        }
        else if (airportsPayload) {
            airports = airportsPayload;
        }
        if (airports.every((airport) => constants_1.BD_AIRPORT.includes(airport))) {
            route_type = flightConstants_1.ROUTE_TYPE.DOMESTIC;
        }
        else if (constants_1.BD_AIRPORT.includes(airports[0])) {
            route_type = flightConstants_1.ROUTE_TYPE.FROM_DAC;
        }
        else if (airports.some((code) => constants_1.BD_AIRPORT.includes(code))) {
            route_type = flightConstants_1.ROUTE_TYPE.TO_DAC;
        }
        else {
            route_type = flightConstants_1.ROUTE_TYPE.SOTO;
        }
        return route_type;
    }
}
exports.CommonFlightSupport = CommonFlightSupport;
