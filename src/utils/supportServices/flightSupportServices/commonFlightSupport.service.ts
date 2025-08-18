import { Knex } from "knex";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../lib/lib";
import {
  IFlightSearchReqBody,
  IOriginDestinationInformationPayload,
  IPassengerTypeQuantityPayload,
} from "../../supportTypes/flightSupportTypes/commonFlightTypes";
import {
  BD_AIRPORT,
  COM_MODE_INCREASE,
  COM_TYPE_PER,
} from "../../miscellaneous/constants";
import { ROUTE_TYPE } from "../../miscellaneous/flightMiscellaneous/flightConstants";
import { IGetSupplierAirlinesDynamicFareQuery } from "../../interfaces/dynamicFareRulesModelInterface/dynamicFareRulesModel.interface";

export class CommonFlightSupport extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  //insert flight search history
  public async insertFlightSearchHistory(payload: {
    search_body: IFlightSearchReqBody;
    leg_description: {
      departureLocation: string;
      departureDate: string;
      arrivalLocation: string;
    }[];
    agency_id?: number;
    user_id?: number;
  }) {
    const {
      JourneyType,
      OriginDestinationInformation,
      PassengerTypeQuantity,
      airline_code,
    } = payload.search_body;
    let journey_type: "One Way" | "Round Trip" | "Multi City" = "One Way";
    if (JourneyType === "2") {
      journey_type = "Round Trip";
    } else if (JourneyType === "3") {
      journey_type = "Multi City";
    }

    const selected_cabin =
      OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin;
    let cabin: "Economy" | "Premium Economy" | "Business" | "First Class";
    if (selected_cabin === "1") {
      cabin = "Economy";
    } else if (selected_cabin === "2") {
      cabin = "Premium Economy";
    } else if (selected_cabin === "3") {
      cabin = "Business";
    } else {
      cabin = "First Class";
    }

    let total_adult = 0;
    let total_child = 0;
    let total_infant = 0;

    PassengerTypeQuantity.map((elm) => {
      if (elm.Code.startsWith("A")) {
        total_adult += elm.Quantity;
      } else if (elm.Code.startsWith("C")) {
        total_child += elm.Quantity;
      } else if (elm.Code.startsWith("I")) {
        total_infant += elm.Quantity;
      }
    });

    const route = Lib.getRouteOfFlight(payload.leg_description);
    const journey_date = Lib.getJourneyDatesOfFlight(payload.leg_description);
    let preferred_airlines = "";
    if (airline_code && airline_code.length) {
      preferred_airlines = airline_code.map((elm) => elm.Code).join(",");
    }

    const user_type = payload.agency_id ? "Agent" : "User";
    const model = this.Model.SearchHistoryModel(this.trx);
    await model.createFlightSearchHistory({
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
  }

  //calculate convenience fee and discount
  public async calculateFlightMarkup({
    airline,
    base_fare,
    flight_class,
    dynamic_fare_supplier_id,
    route_type,
    total_segments,
  }: {
    dynamic_fare_supplier_id: number;
    airline: string;
    flight_class: string;
    base_fare: number;
    total_segments: number;
    route_type: "SOTO" | "FROM_DAC" | "TO_DAC" | "DOMESTIC";
  }) {
    const dynamicFareModel = this.Model.DynamicFareModel(this.trx);

    let markup = 0;
    let commission = 0;
    let pax_markup = 0;

    const getFareMarkupQuery: IGetSupplierAirlinesDynamicFareQuery = {
      dynamic_fare_supplier_id,
      airline,
      flight_class,
    };

    if (route_type === "DOMESTIC") {
      getFareMarkupQuery.domestic = true;
    } else if (route_type === "FROM_DAC") {
      getFareMarkupQuery.from_dac = true;
    } else if (route_type === "TO_DAC") {
      getFareMarkupQuery.to_dac = true;
    } else {
      getFareMarkupQuery.soto = true;
    }

    //get airline wise fare
    const supplier_airline_fare =
      await dynamicFareModel.getSupplierAirlinesFares(getFareMarkupQuery);
    //       console.log({getFareMarkupQuery});
    //  console.log({supplier_airline_fare});
    if (supplier_airline_fare.length) {
      if (supplier_airline_fare[0].markup_type === "FLAT") {
        markup += Number(supplier_airline_fare[0].markup);
      } else if (supplier_airline_fare[0].markup_type === "PER") {
        markup +=
          Number(base_fare) * (Number(supplier_airline_fare[0].markup) / 100);
      }

      if (supplier_airline_fare[0].commission_type === "FLAT") {
        commission += Number(supplier_airline_fare[0].commission);
      } else if (supplier_airline_fare[0].commission_type === "PER") {
        commission +=
          Number(base_fare) *
          (Number(supplier_airline_fare[0].commission) / 100);
      }

      if (supplier_airline_fare[0].segment_markup_type === "FLAT") {
        markup +=
          Number(supplier_airline_fare[0].segment_markup) * total_segments;
      } else if (supplier_airline_fare[0].segment_markup_type === "PER") {
        markup +=
          Number(base_fare) *
          (Number(supplier_airline_fare[0].segment_markup) / 100) *
          total_segments;
      }

      if (supplier_airline_fare[0].segment_commission_type === "FLAT") {
        commission +=
          Number(supplier_airline_fare[0].segment_commission) * total_segments;
      } else if (supplier_airline_fare[0].segment_commission_type === "PER") {
        commission +=
          Number(base_fare) *
          (Number(supplier_airline_fare[0].segment_commission) / 100) *
          total_segments;
      }

      if (supplier_airline_fare[0].pax_markup) {
        pax_markup += Number(supplier_airline_fare[0].pax_markup);
      }
    } else {
      //get default fare for the current API if separate commission not exist
      const dynamic_fare_supplier = await dynamicFareModel.getSuppliers({
        id: dynamic_fare_supplier_id,
        status: true,
      });

      if (dynamic_fare_supplier.length) {
        if (dynamic_fare_supplier[0].commission_type === "FLAT") {
          commission += Number(dynamic_fare_supplier[0].commission);
        } else if (dynamic_fare_supplier[0].commission_type === "PER") {
          commission +=
            Number(base_fare) *
            (Number(dynamic_fare_supplier[0].commission) / 100);
        }

        if (dynamic_fare_supplier[0].markup_type === "FLAT") {
          markup += Number(dynamic_fare_supplier[0].markup);
        } else if (dynamic_fare_supplier[0].markup_type === "PER") {
          markup +=
            Number(base_fare) * (Number(dynamic_fare_supplier[0].markup) / 100);
        }

        if (dynamic_fare_supplier[0].pax_markup) {
          pax_markup += Number(dynamic_fare_supplier[0].pax_markup);
        }

        if (dynamic_fare_supplier[0].segment_markup_type === "FLAT") {
          markup +=
            Number(dynamic_fare_supplier[0].segment_markup) * total_segments;
        } else if (dynamic_fare_supplier[0].segment_markup_type === "PER") {
          markup +=
            Number(base_fare) *
            (Number(dynamic_fare_supplier[0].segment_markup) / 100) *
            total_segments;
        }

        if (dynamic_fare_supplier[0].segment_commission_type === "FLAT") {
          commission +=
            Number(dynamic_fare_supplier[0].segment_commission) *
            total_segments;
        } else if (dynamic_fare_supplier[0].segment_commission_type === "PER") {
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
  }

  //calculate tax markup and commission
  public async calculateFlightTaxMarkup({
    dynamic_fare_supplier_id,
    tax,
    route_type,
    airline
  }: {
    dynamic_fare_supplier_id: number;
    tax: { code: string; amount: number }[][];
    route_type: "SOTO" | "FROM_DAC" | "TO_DAC" | "DOMESTIC";
    airline: string;
  }) {
    const getFareMarkupQuery: IGetSupplierAirlinesDynamicFareQuery = {
      dynamic_fare_supplier_id
    };
    const dynamicFareModel = this.Model.DynamicFareModel(this.trx);
    if (route_type === "DOMESTIC") {
      getFareMarkupQuery.domestic = true;
    } else if (route_type === "FROM_DAC") {
      getFareMarkupQuery.from_dac = true;
    } else if (route_type === "TO_DAC") {
      getFareMarkupQuery.to_dac = true;
    } else {
      getFareMarkupQuery.soto = true;
    }
    let markup = 0;
    let commission = 0;

    for (const taxItem of tax) {
      for (const tax_elm of taxItem) {
        const supplier_data = await dynamicFareModel.getFareRulesConditions({
          ...getFareMarkupQuery,
          tax_name: tax_elm.code.substring(0, 2),
          airline
        });

        if (supplier_data.length) {
          if (supplier_data[0].markup_type === "FLAT") {
            markup += Number(supplier_data[0].markup);
          } else if (supplier_data[0].markup_type === "PER") {
            markup +=
              Number(tax_elm.amount) * (Number(supplier_data[0].markup) / 100);
          }

          if (supplier_data[0].commission_type === "FLAT") {
            commission += Number(supplier_data[0].commission);
          } else if (supplier_data[0].commission_type === "PER") {
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
  }

  // find route type
  public routeTypeFinder({
    airportsPayload,
    originDest,
  }: {
    originDest?: IOriginDestinationInformationPayload[];
    airportsPayload?: string[];
  }) {
    let route_type: "SOTO" | "FROM_DAC" | "TO_DAC" | "DOMESTIC" =
      ROUTE_TYPE.SOTO;

    let airports: string[] = [];

    if (originDest) {
      originDest.forEach((item) => {
        airports.push(item.OriginLocation.LocationCode);
        airports.push(item.DestinationLocation.LocationCode);
      });
    } else if (airportsPayload) {
      airports = airportsPayload;
    }

    if (airports.every((airport) => BD_AIRPORT.includes(airport))) {
      route_type = ROUTE_TYPE.DOMESTIC;
    } else if (BD_AIRPORT.includes(airports[0])) {
      route_type = ROUTE_TYPE.FROM_DAC;
    } else if (airports.some((code) => BD_AIRPORT.includes(code))) {
      route_type = ROUTE_TYPE.TO_DAC;
    } else {
      route_type = ROUTE_TYPE.SOTO;
    }

    return route_type;
  }
}
