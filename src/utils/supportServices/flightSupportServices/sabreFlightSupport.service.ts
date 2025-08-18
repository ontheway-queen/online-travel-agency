import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../config/config";
import { IGetAirlinesPreferenceQuery } from "../../interfaces/dynamicFareRulesModelInterface/airlinesPreferenceModel.interface";
import CustomError from "../../lib/customError";
import { convertDateTime } from "../../lib/dateTimeFormatter";
import FlightUtils from "../../lib/flightLib/commonFlightUtils";
import SabreRequests from "../../lib/flightLib/sabreRequest";
import Lib from "../../lib/lib";
import {
  ERROR_LEVEL_WARNING,
  PROJECT_EMAIL_API_1,
} from "../../miscellaneous/constants";
import {
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_REFUNDED,
  FLIGHT_BOOKING_VOID,
  FLIGHT_TICKET_ISSUE,
  ROUTE_TYPE,
  SABRE_API,
  SABRE_FLIGHT_ITINS,
} from "../../miscellaneous/flightMiscellaneous/flightConstants";
import SabreAPIEndpoints from "../../miscellaneous/flightMiscellaneous/sabreApiEndpoints";
import { IFlightBookingRequestBody } from "../../supportTypes/flightBookingTypes/commonFlightBookingTypes";
import {
  IFlightAvailability,
  IFlightDataAvailabilitySegment,
  IFlightSearchReqBody,
  IFormattedFlight,
  IFormattedFlightItinerary,
  IFormattedFlightOption,
} from "../../supportTypes/flightSupportTypes/commonFlightTypes";
import {
  IBaggageAndAvailabilityAllSeg,
  IBaggageAndAvailabilityAllSegSegmentDetails,
  IContactNumber,
  IFormattedArrival,
  IFormattedCarrier,
  IFormattedDeparture,
  IFormattedLegDesc,
  IFormattedScheduleDesc,
  ILegDescOption,
  ISabreNewPassenger,
  ISabreResponseResult,
  ISabreRetrieveDataResponse,
  ISecureFlight,
  OriginDestinationInformation,
} from "../../supportTypes/flightSupportTypes/sabreFlightTypes";
import { CommonFlightSupport } from "./commonFlightSupport.service";
import { getRedis, setRedis } from "../../../app/redis";

export default class SabreFlightService extends AbstractServices {
  private trx: Knex.Transaction;
  private request = new SabreRequests();
  private flightUtils = new FlightUtils();
  private flightSupport: CommonFlightSupport;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
    this.flightSupport = new CommonFlightSupport(trx);
  }

  ////////////==================FLIGHT SEARCH (START)=========================///////////
  // Flight Search Request formatter
  private async FlightReqFormatterV5(
    body: IFlightSearchReqBody,
    dynamic_fare_supplier_id: number,
    route_type: "FROM_DAC" | "TO_DAC" | "DOMESTIC" | "SOTO",
    search_id: string
  ) {
    const AirlinesPrefModel = this.Model.AirlinesPreferenceModel(this.trx);
    const dealCodeModel = this.Model.DealCodeModel(this.trx);

    const prefAirlinesQuery: IGetAirlinesPreferenceQuery = {
      dynamic_fare_supplier_id,
      pref_type: "PREFERRED",
      status: true,
    };

    const { data: getAllDealCodes } = await dealCodeModel.getAll({
      api: SABRE_API,
      status: true,
    });

    const AccountCode = getAllDealCodes
      .map((item: { deal_code: string }) => {
        if (typeof item.deal_code !== "string") return null;
        return {
          Code: item.deal_code,
        };
      })
      .filter(Boolean);

    if (AccountCode.length) {
      await setRedis(`dealcode:${search_id}`, AccountCode);
    }

    const PriceRequestInformation = {
      AccountCode,
    };

    if (route_type === ROUTE_TYPE.DOMESTIC) {
      prefAirlinesQuery.domestic = true;
    } else if (route_type === ROUTE_TYPE.FROM_DAC) {
      prefAirlinesQuery.from_dac = true;
    } else if (route_type === ROUTE_TYPE.TO_DAC) {
      prefAirlinesQuery.to_dac = true;
    } else if (route_type === ROUTE_TYPE.SOTO) {
      prefAirlinesQuery.soto = true;
    }

    // Get preferred airlines
    const cappingAirlinesRaw: { Code: string }[] =
      await AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);

    const preferredAirlines: string[] = cappingAirlinesRaw.map((el) => el.Code);

    let finalAirlineCodes: string[] = [];

    if (body.airline_code?.length) {
      const requestedAirlines: string[] = body.airline_code.map(
        (el) => el.Code
      );

      if (preferredAirlines.length) {
        // Use common values only
        finalAirlineCodes = requestedAirlines.filter((code) =>
          preferredAirlines.includes(code)
        );
        if (finalAirlineCodes.length === 0) {
          return false;
        }
      } else {
        // No preferred, use all requested
        finalAirlineCodes = requestedAirlines;
      }
    } else {
      if (preferredAirlines.length) {
        // Only preferred exist
        finalAirlineCodes = preferredAirlines;
      }
    }

    // Return in the format: { Code: string }[]
    const airlines: { Code: string }[] = finalAirlineCodes.map((code) => ({
      Code: code,
    }));

    const originDestinationInfo: OriginDestinationInformation[] = [];
    body.OriginDestinationInformation.forEach((item) => {
      let cabin = "Y";
      switch (item.TPA_Extensions.CabinPref.Cabin) {
        case "1":
          cabin = "Y";
          break;
        case "2":
          cabin = "S";
          break;
        case "3":
          cabin = "C";
          break;
        case "4":
          cabin = "F";
          break;

        default:
          break;
      }
      originDestinationInfo.push({
        ...item,
        TPA_Extensions: {
          CabinPref: {
            Cabin: cabin,
            PreferLevel: item.TPA_Extensions.CabinPref.PreferLevel,
          },
        },
      });
    });

    const reqBody = {
      OTA_AirLowFareSearchRQ: {
        Version: "5",
        POS: {
          Source: [
            {
              PseudoCityCode: config.SABRE_USERNAME.split("-")[1],
              RequestorID: {
                Type: "1",
                ID: "1",
                CompanyName: {
                  Code: "TN",
                  content: "TN",
                },
              },
            },
          ],
        },
        AvailableFlightsOnly: true,
        OriginDestinationInformation: originDestinationInfo,
        TravelPreferences: {
          VendorPref: airlines?.length ? airlines : undefined,
          TPA_Extensions: {
            LongConnectTime: {
              Enable: true,
              Max: 1439,
              Min: 59,
            },
            XOFares: {
              Value: true,
            },
            KeepSameCabin: {
              Enabled: true,
            },
          },
        },
        TravelerInfoSummary: {
          SeatsRequested: [1],
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: body.PassengerTypeQuantity,
            },
          ],
          PriceRequestInformation: PriceRequestInformation,
        },
        TPA_Extensions: {
          IntelliSellTransaction: {
            RequestType: {
              Name: SABRE_FLIGHT_ITINS,
            },
          },
        },
      },
    };

    return reqBody;
  }

  // Flight search service
  public async FlightSearch({
    dynamic_fare_supplier_id,
    booking_block,
    reqBody,
    search_id,
  }: {
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    booking_block: boolean;
    search_id: string;
  }) {
    let route_type = this.flightSupport.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });

    const flightRequestBody = await this.FlightReqFormatterV5(
      reqBody,
      dynamic_fare_supplier_id,
      route_type,
      search_id
    );
    // console.log({ flightRequestBody: JSON.stringify(flightRequestBody) });
    const response = await this.request.postRequest(
      SabreAPIEndpoints.FLIGHT_SEARCH_ENDPOINT_V5,
      flightRequestBody
    );
    // return [response];

    if (!response) {
      return [];
    }
    if (response.groupedItineraryResponse.statistics.itineraryCount === 0) {
      return [];
    }

    const result = await this.FlightSearchResFormatter({
      data: response.groupedItineraryResponse,
      reqBody: reqBody,
      dynamic_fare_supplier_id,
      booking_block,
      route_type,
    });
    // console.log({result});
    return result;
  }

  // Flight search Response formatter
  private async FlightSearchResFormatter({
    dynamic_fare_supplier_id,
    booking_block,
    data,
    reqBody,
    flight_id,
    route_type,
  }: {
    data: ISabreResponseResult;
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    booking_block: boolean;
    flight_id?: string;
    route_type: "FROM_DAC" | "TO_DAC" | "DOMESTIC" | "SOTO";
  }) {
    const commonModel = this.Model.commonModel(this.trx);
    const AirlinesPreferenceModel = this.Model.AirlinesPreferenceModel(
      this.trx
    );

    const getBlockedAirlinesPayload: IGetAirlinesPreferenceQuery = {
      dynamic_fare_supplier_id,
      pref_type: "BLOCKED",
      status: true,
    };

    if (route_type === ROUTE_TYPE.DOMESTIC) {
      getBlockedAirlinesPayload.domestic = true;
    } else if (route_type === ROUTE_TYPE.FROM_DAC) {
      getBlockedAirlinesPayload.from_dac = true;
    } else if (route_type === ROUTE_TYPE.TO_DAC) {
      getBlockedAirlinesPayload.to_dac = true;
    } else {
      getBlockedAirlinesPayload.soto = true;
    }

    const blockedAirlines: { Code: string }[] =
      await AirlinesPreferenceModel.getAirlinePrefCodes(
        getBlockedAirlinesPayload
      );

    const api_currency = await this.Model.CurrencyModel(
      this.trx
    ).getApiWiseCurrencyByName(SABRE_API, "FLIGHT");

    const OriginDest = reqBody.OriginDestinationInformation;

    const scheduleDesc: IFormattedScheduleDesc[] = [];

    for (const item of data.scheduleDescs) {
      const dAirport = await commonModel.getAirport(item.departure.airport);
      const AAirport = await commonModel.getAirport(item.arrival.airport);
      const DCity = await commonModel.getCity(item.departure.city);
      const ACity = await commonModel.getCity(item.arrival.city);
      const marketing_airline = await commonModel.getAirlines(
        item.carrier.marketing
      );
      const aircraft = await commonModel.getAircraft(
        item.carrier.equipment.code
      );
      let operating_airline = marketing_airline;

      if (item.carrier.marketing !== item.carrier.operating) {
        operating_airline = await commonModel.getAirlines(
          item.carrier.operating
        );
      }

      const departure: IFormattedDeparture = {
        airport_code: item.departure.airport,
        city_code: item.departure.city,
        airport: dAirport,
        city: DCity,
        country: item.departure.country,
        terminal: item.departure.terminal,
        time: item.departure.time,
        date: "",
        date_adjustment: item.departure.dateAdjustment,
      };

      const arrival: IFormattedArrival = {
        airport: AAirport,
        city: ACity,
        airport_code: item.arrival.airport,
        city_code: item.arrival.city,
        country: item.arrival.country,
        time: item.arrival.time,
        terminal: item.arrival.terminal,
        date: "",
        date_adjustment: item.arrival.dateAdjustment,
      };

      const carrier: IFormattedCarrier = {
        carrier_marketing_code: item.carrier.marketing,
        carrier_marketing_airline: marketing_airline.name,
        carrier_marketing_logo: marketing_airline.logo,
        carrier_marketing_flight_number: String(
          item.carrier.marketingFlightNumber
        ),
        carrier_operating_code: item.carrier.operating,
        carrier_operating_airline: operating_airline.name,
        carrier_operating_logo: operating_airline.logo,
        carrier_operating_flight_number: String(
          item.carrier.operatingFlightNumber
        ),
        carrier_aircraft_code: aircraft.code,
        carrier_aircraft_name: aircraft.name,
      };

      const new_item: IFormattedScheduleDesc = {
        id: item.id,
        elapsedTime: item.elapsedTime,
        stopCount: item.stopCount,
        message: item.message,
        message_type: item.messageType,
        total_miles_flown: item.totalMilesFlown,
        departure,
        arrival,
        carrier,
      };
      scheduleDesc.push(new_item);
    }

    const legDesc: IFormattedLegDesc[] = data.legDescs.map((leg) => {
      const schedules = leg.schedules;

      const options: ILegDescOption[] = [];

      for (const schedule of schedules) {
        const founded = scheduleDesc.find((item) => item.id === schedule.ref);

        if (founded) {
          options.push({
            ...founded,
            departureDateAdjustment: schedule.departureDateAdjustment,
          });
        }
      }

      return {
        id: leg.id,
        elapsed_time: leg.elapsedTime,
        options,
      };
    });

    const itineraryGroup = data.itineraryGroups[0];

    const itineraries: IFormattedFlightItinerary[] = [];

    for (let i = 0; i < itineraryGroup.itineraries.length; i++) {
      const itinerary = itineraryGroup.itineraries[i];
      const fare = itinerary.pricingInformation[0].fare;

      const validatingCarrier = await commonModel.getAirlines(
        fare.validatingCarrierCode
      );
      if (
        blockedAirlines.find((ba) => ba.Code === fare.validatingCarrierCode)
      ) {
        continue;
      }
      const passenger_lists: ISabreNewPassenger[] = [];
      let refundable: boolean =
        !fare.passengerInfoList[0].passengerInfo.nonRefundable;

      const baggageAndAvailabilityAllSeg: IBaggageAndAvailabilityAllSeg[] = [];

      const legsDesc: IFormattedFlight[] = this.newGetLegsDesc(
        itinerary.legs,
        legDesc,
        OriginDest
      );

      const ait = Math.round(
        ((Number(fare.totalFare.equivalentAmount) +
          Number(fare.totalFare.totalTaxAmount)) /
          100) *
        0.3
      );

      const new_fare = {
        base_fare: fare.totalFare.equivalentAmount,
        total_tax: Number(fare.totalFare.totalTaxAmount),
        ait,
        discount: 0,
        payable: Number(
          (
            Number(fare.totalFare.equivalentAmount) +
            Number(fare.totalFare.totalTaxAmount) +
            ait
          ).toFixed(2)
        ),
        tax_fare: [] as { code: string; amount: number }[][],
        vendor_price: {
          base_fare: fare.totalFare.equivalentAmount,
          tax: fare.totalFare.totalTaxAmount,
          charge: 0,
          discount: 0,
          gross_fare: Number(fare.totalFare.totalPrice),
          net_fare: Number(fare.totalFare.totalPrice),
        },
      };

      new_fare.base_fare *= api_currency;
      new_fare.total_tax *= api_currency;
      new_fare.payable *= api_currency;
      new_fare.ait *= api_currency;

      let partial_payment: {
        partial_payment: boolean;
        payment_percentage: any;
        travel_date_from_now: any;
      } = {
        partial_payment: false,
        payment_percentage: 100,
        travel_date_from_now: 0,
      };

      if (route_type === ROUTE_TYPE.DOMESTIC) {
        //domestic
        partial_payment = await this.Model.PartialPaymentRuleModel(
          this.trx
        ).getPartialPaymentCondition({
          flight_api_name: SABRE_API,
          airline: fare.validatingCarrierCode,
          refundable,
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
          domestic: true,
        });
      } else if (route_type === ROUTE_TYPE.FROM_DAC) {
        //from dac
        partial_payment = await this.Model.PartialPaymentRuleModel(
          this.trx
        ).getPartialPaymentCondition({
          flight_api_name: SABRE_API,
          airline: fare.validatingCarrierCode,
          from_dac: true,
          refundable,
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
        });
      } else if (route_type === ROUTE_TYPE.TO_DAC) {
        //to dac
        partial_payment = await this.Model.PartialPaymentRuleModel(
          this.trx
        ).getPartialPaymentCondition({
          flight_api_name: SABRE_API,
          airline: fare.validatingCarrierCode,
          to_dac: true,
          refundable,
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
        });
      } else {
        //soto
        partial_payment = await this.Model.PartialPaymentRuleModel(
          this.trx
        ).getPartialPaymentCondition({
          flight_api_name: SABRE_API,
          airline: fare.validatingCarrierCode,
          refundable,
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
          soto: true,
        });
      }

      //tax fare
      const tax_fare = fare.passengerInfoList.map((elm) => {
        return elm.passengerInfo.taxes.map((tax) => {
          // Find matching taxDesc by ref
          const taxDesc = data.taxDescs.find(desc => desc.id === tax.ref);
          return {
            code: taxDesc?.code ?? 'UNKNOWN',
            amount: taxDesc?.amount ?? 0
          };
        });
      });

      new_fare.tax_fare = tax_fare;

      let { tax_markup, tax_commission } = await this.flightSupport.calculateFlightTaxMarkup({
        dynamic_fare_supplier_id,
        tax: tax_fare,
        route_type,
        airline: fare.validatingCarrierCode,
      });
      tax_commission = tax_commission * api_currency;
      tax_markup = tax_markup * api_currency;

      let total_segments = 0;
      legsDesc.map((elm) => {
        elm.options.map((elm2) => {
          total_segments++;
        });
      });

      const { markup, commission, pax_markup } =
        await this.flightSupport.calculateFlightMarkup({
          dynamic_fare_supplier_id,
          airline: fare.validatingCarrierCode,
          flight_class: this.flightUtils.getClassFromId(
            reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
              .Cabin
          ),
          base_fare: fare.totalFare.equivalentAmount,
          total_segments,
          route_type,
        });

      let pax_count = 0;

      reqBody.PassengerTypeQuantity.map((reqPax) => {
        pax_count += reqPax.Quantity;
      });

      for (const passenger of fare.passengerInfoList) {
        const passenger_info = passenger.passengerInfo;
        refundable = !passenger_info.nonRefundable;

        const segmentDetails: IBaggageAndAvailabilityAllSegSegmentDetails[] =
          [];

        let legInd = 0;
        let segInd = 0;
        let segments: any[] = [];

        for (let i = 0; i < passenger_info.fareComponents.length; i++) {
          const pfd = passenger_info.fareComponents[i];

          for (let j = 0; j < pfd.segments.length; j++) {
            const segd = pfd.segments[j];
            const segment = segd?.segment;
            if (segment !== undefined) {
              const meal_type = Lib.getMeal(segment?.mealCode || "");
              const cabin_type = Lib.getCabin(segment?.cabinCode || "");
              segments.push({
                id: j + 1,
                name: `Segment-${j + 1}`,
                meal_type: meal_type?.name,
                meal_code: meal_type?.code,
                cabin_code: cabin_type?.code,
                cabin_type: cabin_type?.name,
                booking_code: segment?.bookingCode,
                available_seat: segment?.seatsAvailable,
                available_break: segment?.availabilityBreak,
                available_fare_break: segment?.fareBreakPoint,
              });
            }
            segInd++;
          }

          let newBaggage: any = {};

          if (passenger_info.baggageInformation) {
            const baggage = passenger_info.baggageInformation[i];
            if (baggage) {
              const allowance_id = baggage?.allowance?.ref;
              newBaggage = data.baggageAllowanceDescs.find(
                (all_item) => all_item.id === allowance_id
              );
            }
          }

          //all the segments are in one fareComponents object for each leg
          if (
            pfd.endAirport ===
            reqBody.OriginDestinationInformation[legInd].DestinationLocation
              .LocationCode
          ) {
            legInd++;
            segInd = 0;
          }
          //segments are in different fareComponents object for each leg
          else {
            continue;
          }

          segmentDetails.push({
            id: i + 1,
            from_airport:
              reqBody.OriginDestinationInformation[legInd - 1].OriginLocation
                .LocationCode,
            to_airport:
              reqBody.OriginDestinationInformation[legInd - 1]
                .DestinationLocation.LocationCode,
            segments,
            baggage: newBaggage?.id
              ? {
                id: newBaggage?.id,
                unit: newBaggage.unit || "pieces",
                count: newBaggage.weight || newBaggage.pieceCount,
              }
              : {
                id: 1,
                unit: "N/A",
                count: "N/A",
              },
          });
          segments = [];
        }

        baggageAndAvailabilityAllSeg.push({
          passenger_type: passenger.passengerInfo.passengerType,
          passenger_count: passenger.passengerInfo.passengerNumber,
          segmentDetails,
        });

        const base_fare =
          Number(passenger_info.passengerTotalFare.equivalentAmount) *
          api_currency +
          pax_markup * passenger_info.passengerNumber;

        const tax =
          Number(passenger_info.passengerTotalFare.totalTaxAmount) *
          api_currency;

        const per_pax_markup =
          ((markup + tax_markup) / pax_count) *
          Number(passenger.passengerInfo.passengerNumber) +
          pax_markup * Number(passenger.passengerInfo.passengerNumber);
        const new_passenger: ISabreNewPassenger = {
          type: passenger_info.passengerType,
          number: passenger_info.passengerNumber,
          fare: {
            tax,
            base_fare: Number((base_fare + per_pax_markup).toFixed(2)),
            total_fare: Number((base_fare + per_pax_markup + tax).toFixed(2)),
          },
        };

        passenger_lists.push(new_passenger);
      }

      const availability: IFlightAvailability[] = [];

      baggageAndAvailabilityAllSeg.forEach((item) => {
        const { segmentDetails } = item;
        segmentDetails.forEach((item2) => {
          const foundData = availability.find(
            (avItem) =>
              avItem.from_airport === item2.from_airport &&
              avItem.to_airport === item2.to_airport
          );

          if (foundData) {
            const { segments } = foundData;
            item2.segments.forEach((item3) => {
              const segmentFound = segments.find(
                (segs) => item3.name === segs.name
              );

              if (segmentFound) {
                const passenger = segmentFound.passenger.find(
                  (pas) => pas.type === item.passenger_type
                );

                if (!passenger) {
                  segmentFound.passenger.push({
                    type: item.passenger_type,
                    count: item.passenger_count,
                    meal_type: item3.meal_type,
                    meal_code: item3.meal_code,
                    cabin_code: item3.cabin_code,
                    cabin_type: item3.cabin_type,
                    booking_code: item3.booking_code,
                    available_seat: item3.available_seat,
                    available_break: item3.available_break,
                    available_fare_break: item3.available_fare_break,
                    baggage_info: `${item2.baggage.count} ${item2.baggage.unit}`,
                  });
                }
              } else {
                segments.push({
                  name: item3.name,
                  passenger: [
                    {
                      type: item.passenger_type,
                      count: item.passenger_count,
                      meal_type: item3.meal_type,
                      meal_code: item3.meal_code,
                      cabin_code: item3.cabin_code,
                      cabin_type: item3.cabin_type,
                      booking_code: item3.booking_code,
                      available_seat: item3.available_seat,
                      available_break: item3.available_break,
                      available_fare_break: item3.available_fare_break,
                      baggage_info: `${item2.baggage.count} ${item2.baggage.unit}`,
                    },
                  ],
                });
              }
            });
          } else {
            const segments: IFlightDataAvailabilitySegment[] = [];

            item2.segments.forEach((item3) => {
              segments.push({
                name: item3.name,
                passenger: [
                  {
                    type: item.passenger_type,
                    count: item.passenger_count,
                    meal_type: item3.meal_type,
                    meal_code: item3.meal_code,
                    cabin_code: item3.cabin_code,
                    cabin_type: item3.cabin_type,
                    booking_code: item3.booking_code,
                    available_seat: item3.available_seat,
                    available_break: item3.available_break,
                    available_fare_break: item3.available_fare_break,
                    baggage_info: `${item2.baggage.count} ${item2.baggage.unit}`,
                  },
                ],
              });
            });
            availability.push({
              from_airport: item2.from_airport,
              to_airport: item2.to_airport,
              segments,
            });
          }
        });
      });

      const total_pax_markup = pax_markup * pax_count;

      new_fare.base_fare += markup;
      new_fare.base_fare += total_pax_markup;
      new_fare.base_fare += tax_markup;
      new_fare.discount += commission;
      new_fare.discount += tax_commission;

      new_fare.payable =
        Number(new_fare.base_fare) +
        new_fare.total_tax +
        new_fare.ait -
        Number(new_fare.discount);

      const itinery: IFormattedFlightItinerary = {
        flight_id: flight_id || uuidv4(),
        api_search_id: "",
        booking_block,
        partial_payment,
        direct_ticket_issue: false,
        price_changed: false,
        domestic_flight: route_type === ROUTE_TYPE.DOMESTIC,
        journey_type: reqBody.JourneyType,
        api: SABRE_API,
        fare: new_fare,
        refundable,
        carrier_code: fare.validatingCarrierCode,
        carrier_name: validatingCarrier.name,
        carrier_logo: validatingCarrier.logo,
        ticket_last_date: fare.lastTicketDate,
        ticket_last_time: fare.lastTicketTime,
        flights: legsDesc,
        passengers: passenger_lists,
        availability,
        leg_description: [],
      };

      itineraries.push(itinery);
    }

    return itineraries;
  }

  ///==================FLIGHT SEARCH (END)=========================///

  //////==================FLIGHT REVALIDATE (START)=========================//////
  //sabre flight revalidate service
  public async SabreFlightRevalidate(
    reqBody: IFlightSearchReqBody,
    retrieved_response: IFormattedFlightItinerary,
    dynamic_fare_supplier_id: number,
    flight_id: string,
    booking_block: boolean,
    search_id: string
  ) {
    const revalidate_req_body = await this.RevalidateFlightReqFormatter(
      reqBody,
      retrieved_response,
      search_id
    );
    const route_type = this.flightSupport.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });

    const response = await this.request.postRequest(
      SabreAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
      revalidate_req_body
    );
    // console.log({response: JSON.stringify(response)});
    if (!response) {
      throw new CustomError("An error occurred", 400);
    }

    if (response.groupedItineraryResponse?.statistics.itineraryCount === 0) {
      throw new CustomError(`The flight is not available.`, 404);
    }
    const data = await this.FlightSearchResFormatter({
      booking_block,
      reqBody,
      data: response.groupedItineraryResponse,
      dynamic_fare_supplier_id,
      flight_id,
      route_type,
    });

    return data;
  }

  // Revalidate Flight Request Formatter
  public async RevalidateFlightReqFormatter(
    reqBody: IFlightSearchReqBody,
    retrieved_response: IFormattedFlightItinerary,
    search_id: string
  ) {
    let cabin = "Y";
    switch (
    reqBody.OriginDestinationInformation[0]?.TPA_Extensions?.CabinPref?.Cabin
    ) {
      case "1":
        cabin = "Y";
        break;
      case "2":
        cabin = "S";
        break;
      case "3":
        cabin = "C";
        break;
      case "4":
        cabin = "F";
        break;

      default:
        break;
    }
    const OriginDestinationInformation =
      reqBody.OriginDestinationInformation.map((item, index) => {
        const req_depart_air = item.OriginLocation.LocationCode;
        const flights: any[] = [];
        const flight = retrieved_response.flights[index];
        const carrierCode = retrieved_response.carrier_code;

        const depart_time = flight.options[0].departure.time;
        const depart_air = flight.options[0].departure.airport_code;
        const depart_city = flight.options[0].departure.city_code;
        if ([depart_air, depart_city].includes(req_depart_air)) {
          for (const option of flight.options) {
            const DepartureDateTime = convertDateTime(
              option.departure.date,
              option.departure.time
            );
            const ArrivalDateTime = convertDateTime(
              option.arrival.date,
              option.arrival.time
            );

            const flight_data = {
              Number: Number(option?.carrier.carrier_marketing_flight_number),
              ClassOfService: new FlightUtils().getCabinCodeForRevalidate(
                reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref
                  .Cabin
              ),
              DepartureDateTime,
              ArrivalDateTime,
              Type: "A",
              OriginLocation: {
                LocationCode: option?.departure.airport_code,
              },
              DestinationLocation: {
                LocationCode: option?.arrival.airport_code,
              },
              Airline: {
                Marketing: option?.carrier.carrier_marketing_code,
                Operating: option?.carrier.carrier_operating_code,
              },
            };

            flights.push(flight_data);
          }
          const origin_destination_info = {
            RPH: item.RPH,
            DepartureDateTime: convertDateTime(
              item.DepartureDateTime,
              depart_time
            ),

            OriginLocation: item["OriginLocation"],
            DestinationLocation: item["DestinationLocation"],
            TPA_Extensions: {
              Flight: flights,
            },
          };

          return origin_destination_info;
        }
      });

    const PassengerTypeQuantity = reqBody.PassengerTypeQuantity.map((item) => {
      const passenger_info = {
        Code: item.Code,
        Quantity: item.Quantity,
        TPA_Extensions: {
          VoluntaryChanges: {
            Match: "Info",
          },
        },
      };
      return passenger_info;
    });

    const dealCodes = await getRedis(`dealcode:${search_id}`);

    const PriceRequestInformation: any = {};

    if (dealCodes && Array.isArray(dealCodes) && dealCodes.length > 0) {
      PriceRequestInformation.AccountCode = dealCodes;
    }

    const request_body = {
      OTA_AirLowFareSearchRQ: {
        POS: {
          Source: [
            {
              PseudoCityCode: config.SABRE_USERNAME.split("-")[1],
              RequestorID: {
                Type: "1",
                ID: "1",
                CompanyName: {
                  Code: "TN",
                },
              },
            },
          ],
        },
        OriginDestinationInformation: OriginDestinationInformation,
        TPA_Extensions: {
          IntelliSellTransaction: {
            CompressResponse: {
              Value: false,
            },
            RequestType: {
              Name: "50ITINS",
            },
          },
        },
        TravelerInfoSummary: {
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: PassengerTypeQuantity,
            },
          ],
          SeatsRequested: [1],
          ...(Object.keys(PriceRequestInformation).length > 0 && {
            PriceRequestInformation,
          }),
        },
        TravelPreferences: {
          TPA_Extensions: {
            DataSources: {
              NDC: "Disable",
              ATPCO: "Enable",
              LCC: "Disable",
            },
            VerificationItinCallLogic: {
              AlwaysCheckAvailability: true,
              Value: "L",
            },
          },
        },
        Version: "5",
      },
    };
    return request_body;
  }

  ///==================FLIGHT REVALIDATE (END)=========================///

  /////////==================FLIGHT BOOKING (START)=========================/////////
  //pnr create request formatter
  private async pnrReqBody(
    body: IFlightBookingRequestBody,
    foundItem: IFormattedFlightItinerary,
    user_info: { email: string; phone: string; name: string }
  ) {
    const formattedDate = (dateString: string | Date) =>
      `${String(new Date(dateString).getDate()).padStart(2, "0")}${new Date(
        dateString
      )
        .toLocaleString("default", { month: "short" })
        .toUpperCase()}${String(new Date(dateString).getFullYear()).slice(-2)}`;
    const monthDiff = (date: string | Date): string => {
      const diff = Math.ceil(
        (new Date().getTime() - new Date(date).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
      );
      return String(diff).padStart(2, "0");
    };

    const passengers = body.passengers;
    const filteredPassengers = passengers.filter(
      (passenger) => passenger.type !== "INF"
    );
    const passengerLength = filteredPassengers.length;

    const SecureFlight: ISecureFlight[] = [];
    const AdvancePassenger: any[] = [];
    const Service = [];
    const ContactNumber: IContactNumber[] = [];

    Service.push({
      SSR_Code: "CTCM",
      Text: user_info.phone,
      PersonName: {
        NameNumber: "1.1",
      },
      SegmentNumber: "A",
    });

    Service.push({
      SSR_Code: "OTHS",
      Text: user_info.name,
      PersonName: {
        NameNumber: "1.1",
      },
      SegmentNumber: "A",
    });

    Service.push({
      SSR_Code: "CTCE",
      Text: PROJECT_EMAIL_API_1.replace("@", "//"),
      PersonName: {
        NameNumber: "1.1",
      },
      SegmentNumber: "A",
    });

    ContactNumber.push({
      NameNumber: "1.1",
      Phone: user_info.phone,
      PhoneUseType: "M",
    });

    const Email: any[] = [];

    Email.push({
      NameNumber: "1.1",
      Address: PROJECT_EMAIL_API_1,
      Type: "CC",
    });

    let inf_ind = 1;

    const PersonName = await Promise.all(
      passengers.map(async (item, index) => {
        const name_number = `${index + 1}.1`;

        const secure_fl_data = {
          PersonName: {
            NameNumber: item.type === "INF" ? inf_ind + ".1" : name_number,
            DateOfBirth: item.date_of_birth ? String(item.date_of_birth)?.split("T")[0] : undefined,
            Gender: item.gender
              ? item.type === "INF" && item.gender === "Male"
                ? "MI"
                : item.type === "INF" && item.gender === "Female"
                  ? "FI"
                  : item.gender[0]
              : undefined,
            GivenName: item.first_name,
            Surname: item.last_name,
          },
          SegmentNumber: "A",
          VendorPrefs: {
            Airline: {
              Hosted: false,
            },
          },
        };

        if (item.type.startsWith("C")) {
          Service.push({
            SSR_Code: "CHLD",
            Text: formattedDate(item.date_of_birth || ''),
            PersonName: {
              NameNumber: name_number,
            },
            SegmentNumber: "A",
          });
        }

        if (item.type === "INF") {
          Service.push({
            SSR_Code: "INFT",
            Text:
              item.first_name +
              "/" +
              item.last_name +
              "/" +
              formattedDate(item.date_of_birth || ''),
            PersonName: {
              NameNumber: inf_ind + ".1",
            },
            SegmentNumber: "A",
          });
        }

        SecureFlight.push(secure_fl_data);

        if (item.passport_number) {
          item.issuing_country = item.nationality;
          const issuing_country: {
            id: number;
            name: string;
            iso: string;
            iso3: string;
          }[] = await this.Model.commonModel().getAllCountry({
            id: Number(item.issuing_country),
          });
          let nationality: {
            id: number;
            name: string;
            iso: string;
            iso3: string;
          }[] = issuing_country;
          if (item.nationality !== item.issuing_country) {
            nationality = await this.Model.commonModel().getAllCountry({
              id: Number(item.nationality),
            });
          }

          AdvancePassenger.push({
            Document: {
              IssueCountry: issuing_country[0].iso3,
              NationalityCountry: nationality[0].iso3,
              ExpirationDate: String(item.passport_expiry_date)?.split("T")[0],
              Number: item.passport_number,
              Type: "P",
            },
            PersonName: {
              Gender:
                item.type === "INF" && item.gender === "Male"
                  ? "MI"
                  : item.type === "INF" && item.gender === "Female"
                    ? "FI"
                    : item.gender[0],
              GivenName: item.first_name,
              Surname: item.last_name,
              DateOfBirth: item.date_of_birth ? String(item.date_of_birth)?.split("T")[0] : undefined,
              NameNumber: item.type === "INF" ? inf_ind + ".1" : name_number,
            },
            SegmentNumber: "A",
          });
        }

        const person = {
          NameNumber: name_number,
          NameReference:
            item.type === "INF"
              ? "I" + monthDiff(item.date_of_birth || '')
              : item.type === "ADT"
                ? ""
                : item.type,
          GivenName: item.first_name + " " + item.reference,
          Surname: item.last_name,
          PassengerType: item.type,
          Infant: item.type === "INF" ? true : false,
        };

        if (item.type === "INF") {
          inf_ind++;
        }
        return person;
      })
    );

    const flight = foundItem;

    let passenger_qty = 0;

    const PassengerType = flight.passengers.map((passenger: any) => {
      passenger_qty = passenger.number;

      return {
        Code: passenger.type,
        Quantity: String(passenger_qty),
      };
    });

    // flight segments
    const FlightSegment = [];
    const booking_code =
      flight.availability?.flatMap((avElem) =>
        avElem?.segments?.map(
          (segElem) => segElem?.passenger?.[0]?.booking_code
        )
      ) || [];
    let booking_code_index = 0;

    for (const item of flight.flights) {
      for (const option of item.options) {
        const mar_code = option.carrier.carrier_marketing_code;

        const segment = {
          ArrivalDateTime: this.flightUtils.convertDateTime(
            String(option.arrival.date),
            option.arrival.time
          ),
          DepartureDateTime: this.flightUtils.convertDateTime(
            String(option.departure.date),
            option.departure.time
          ),

          FlightNumber: String(option.carrier.carrier_marketing_flight_number),
          NumberInParty: String(passengerLength),
          ResBookDesigCode: booking_code?.[booking_code_index],
          Status: "NN",
          DestinationLocation: {
            LocationCode: option.arrival.airport_code,
          },
          MarketingAirline: {
            Code: mar_code,
            FlightNumber: String(
              option.carrier.carrier_marketing_flight_number
            ),
          },
          OriginLocation: {
            LocationCode: option.departure.airport_code,
          },
        };
        FlightSegment.push(segment);
        booking_code_index++;
      }
    }

    const dealCodes = await getRedis(`dealcode:${body.search_id}`);
    const formateCode = dealCodes?.map((dealCode: { Code: string }) => {
      return dealCode.Code;
    });

    const request_body = {
      CreatePassengerNameRecordRQ: {
        version: "2.5.0",
        targetCity: config.SABRE_USERNAME.split("-")[1],
        haltOnAirPriceError: true,
        TravelItineraryAddInfo: {
          AgencyInfo: {
            Address: {
              AddressLine: "OTA",
              CityName: "DHAKA BANGLADESH",
              CountryCode: "BD",
              PostalCode: "1213",
              StateCountyProv: {
                StateCode: "BD",
              },
              StreetNmbr: "DHAKA",
            },
            Ticketing: {
              TicketType: "7TAW",
            },
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber,
            },
            Email,
            PersonName,
          },
        },
        AirBook: {
          HaltOnStatus: [
            {
              Code: "HL",
            },
            {
              Code: "KK",
            },
            {
              Code: "LL",
            },
            {
              Code: "NN",
            },
            {
              Code: "NO",
            },
            {
              Code: "UC",
            },
            {
              Code: "US",
            },
          ],
          OriginDestinationInformation: {
            FlightSegment,
          },
          RedisplayReservation: {
            NumAttempts: 5,
            WaitInterval: 1000,
          },
        },
        AirPrice: [
          {
            PriceRequestInformation: {
              Retain: true,
              OptionalQualifiers: {
                FOP_Qualifiers: {
                  BasicFOP: {
                    Type: "CASH",
                  },
                },

                PricingQualifiers: {
                  ...(formateCode?.length
                    ? { Account: { Code: formateCode } }
                    : {}),
                  PassengerType,
                },
              },
            },
          },
        ],
        SpecialReqDetails: {
          SpecialService: {
            SpecialServiceInfo: {
              AdvancePassenger,
              SecureFlight,
              Service,
            },
          },
        },
        PostProcessing: {
          EndTransaction: {
            Source: {
              ReceivedFrom: "WEB",
            },
            Email: {
              Ind: true,
            },
          },
          RedisplayReservation: {
            waitInterval: 1000,
          },
        },
      },
    };

    return request_body;
  }

  //flight booking service
  public async FlightBookingService({
    body,
    user_info,
    revalidate_data,
  }: {
    body: IFlightBookingRequestBody;
    user_info: {
      id: number;
      email: string;
      name: string;
      phone: string;
      agency_id?: number;
    };
    revalidate_data: IFormattedFlightItinerary;
  }) {
    const requestBody = await this.pnrReqBody(body, revalidate_data, {
      email: user_info.email,
      phone: user_info.phone,
      name: user_info.name,
    });

    const response = await this.request.postRequest(
      SabreAPIEndpoints.FLIGHT_BOOKING_ENDPOINT,
      requestBody
    );
    if (!response) {
      throw new CustomError(
        "Please contact support team with flight information",
        this.StatusCode.HTTP_INTERNAL_SERVER_ERROR
      );
    }
    if (
      response?.CreatePassengerNameRecordRS?.ApplicationResults?.status !==
      "Complete"
    ) {
      throw new CustomError(
        "Please contact support team with flight information",
        this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        ERROR_LEVEL_WARNING,
        {
          api: SABRE_API,
          endpoint: SabreAPIEndpoints.FLIGHT_BOOKING_ENDPOINT,
          payload: requestBody,
          response: response?.CreatePassengerNameRecordRS?.ApplicationResults,
        }
      );
    }

    //return GDS PNR
    return response?.CreatePassengerNameRecordRS?.ItineraryRef?.ID as string;
  }

  ///==================FLIGHT BOOKING (END)=========================///

  ////////==================TICKET ISSUE (START)=========================//////////
  // // ticket issue req formatter
  private SabreTicketIssueReqFormatter(pnrId: string, unique_traveler: number) {
    let Record: any[] = [];
    for (let i = 1; i <= unique_traveler; i++) {
      Record.push({
        Number: i,
      });
    }
    return {
      AirTicketRQ: {
        version: "1.3.0",
        targetCity: config.SABRE_USERNAME.split("-")[1],
        DesignatePrinter: {
          Printers: {
            Ticket: {
              CountryCode: "BD",
            },
            Hardcopy: {
              LNIATA: config.SABRE_LNIATA_CODE,
            },
            InvoiceItinerary: {
              LNIATA: config.SABRE_LNIATA_CODE,
            },
          },
        },
        Itinerary: {
          ID: pnrId,
        },
        Ticketing: [
          {
            MiscQualifiers: {
              Commission: {
                Percent: 7,
              },
            },
            PricingQualifiers: {
              PriceQuote: [
                {
                  Record,
                },
              ],
            },
          },
        ],
        PostProcessing: {
          EndTransaction: {
            Source: {
              ReceivedFrom: "SABRE WEB",
            },
            Email: {
              eTicket: {
                PDF: {
                  Ind: true,
                },
                Ind: true,
              },
              PersonName: {
                NameNumber: "1.1",
              },
              Ind: true,
            },
          },
        },
      },
    };
  }

  //ticket issue service
  public async TicketIssueService({
    pnr,
    unique_traveler,
  }: {
    pnr: string;
    unique_traveler: number;
  }) {
    const ticketReqBody = this.SabreTicketIssueReqFormatter(
      pnr,
      unique_traveler
    );
    const response = await this.request.postRequest(
      SabreAPIEndpoints.TICKET_ISSUE_ENDPOINT,
      ticketReqBody
    );

    if (response?.AirTicketRS?.ApplicationResults?.status === "Complete") {
      const retrieve_booking = await this.request.postRequest(
        SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
        {
          confirmationId: pnr,
        }
      );

      if (!retrieve_booking || !retrieve_booking?.flightTickets) {
        await this.Model.errorLogsModel().insert({
          level: ERROR_LEVEL_WARNING,
          message: "Error from sabre while ticket issue",
          url: SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
          http_method: "POST",
          metadata: {
            api: SABRE_API,
            endpoint: SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
            payload: { confirmationId: pnr },
            response: retrieve_booking,
          },
        });
        return {
          success: true,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: "Please contact support team with flight information",
          error: retrieve_booking?.errors,
        };
      }

      const ticket_number = [];
      for (let i = 0; i < retrieve_booking.flightTickets.length; i++) {
        ticket_number.push(retrieve_booking.flightTickets[i].number);
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Ticket has been issued",
        data: ticket_number,
      };
    } else {
      await this.Model.errorLogsModel().insert({
        level: ERROR_LEVEL_WARNING,
        message: "Error from sabre while ticket issue",
        url: SabreAPIEndpoints.TICKET_ISSUE_ENDPOINT,
        http_method: "POST",
        metadata: {
          api: SABRE_API,
          endpoint: SabreAPIEndpoints.TICKET_ISSUE_ENDPOINT,
          payload: ticketReqBody,
          response: response,
        },
      });
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: "An error occurred while issuing the ticket",
        error: response?.errors,
      };
    }
  }

  ///==================TICKET ISSUE (END)=========================///

  /////////==================BOOKING CANCEL (START)=========================//////////
  //sabre booking cancel req formatter
  private SabreBookingCancelReqFormatter(pnr: string) {
    return {
      confirmationId: pnr,
      retrieveBooking: true,
      cancelAll: true,
      errorHandlingPolicy: "ALLOW_PARTIAL_CANCEL",
    };
  }

  //sabre booking cancel service
  public async SabreBookingCancelService({ pnr }: { pnr: string }) {
    //cancel booking req formatter
    const cancelBookingBody = this.SabreBookingCancelReqFormatter(pnr);
    const response = await this.request.postRequest(
      SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
      cancelBookingBody
    );
    //if there is error then return
    if (!response || response.errors) {
      // await this.Model.errorLogsModel(trx).insert({
      //   level: ERROR_LEVEL_WARNING,
      //   message: 'Error from sabre while cancel booking',
      //   url: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
      //   http_method: 'POST',
      //   metadata: {
      //     api: SABRE_API,
      //     endpoint: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
      //     payload: cancelBookingBody,
      //     response: response,
      //   },
      //   source,
      // });
      throw new CustomError(
        "An error occurred while cancelling the booking",
        this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        ERROR_LEVEL_WARNING,
        {
          api: SABRE_API,
          endpoint: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
          payload: cancelBookingBody,
          response: response,
        }
      );
      // return {
      //   success: false,
      //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
      //   message: 'An error occurred while cancelling the booking',
      //   error: response?.errors,
      // };
    }

    return {
      success: true,
    };
  }

  ///==================BOOKING CANCEL (END)=========================///

  /////==================GET BOOKING(START)=========================//////////////
  public async GRNUpdate({
    pnr,
    booking_status,
  }: {
    pnr: string;
    booking_status?: string;
  }) {
    const response = await this.request.postRequest(
      SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
      {
        confirmationId: pnr?.trim(),
      }
    );

    let status = booking_status;
    let ticket_number = [];
    let last_time = null;
    let airline_pnr = null;
    let refundable = false;
    let fare_rules: string | undefined;

    if (response) {
      //pnr status
      if (
        response?.flightTickets?.[0]?.ticketStatusName?.toLowerCase() ===
        FLIGHT_BOOKING_VOID
      ) {
        status = FLIGHT_BOOKING_VOID;
      } else if (
        response?.flightTickets?.[0]?.ticketStatusName?.toLowerCase() ===
        FLIGHT_BOOKING_REFUNDED
      ) {
        status = FLIGHT_BOOKING_REFUNDED;
      } else if (response?.isTicketed) {
        status = FLIGHT_TICKET_ISSUE;
        //get ticket number
        for (let i = 0; i < response?.flightTickets?.length; i++) {
          ticket_number.push(response?.flightTickets[i].number as string);
        }
      } else {
        if (
          response?.bookingId &&
          response?.startDate === undefined &&
          response?.endDate === undefined
        ) {
          status = FLIGHT_BOOKING_CANCELLED;
        }
      }
      //get last time of ticket issue
      response?.specialServices?.map((elem: any) => {
        if (elem.code === "ADTK") {
          last_time = elem.message;
        }
      });

      //get airline pnr
      airline_pnr =
        [
          ...new Set(
            response?.flights
              ?.map((flight: { confirmationId: any }) => flight?.confirmationId)
              .filter((id: any) => id)
          ),
        ].join(", ") || "";

      //get refundable status
      refundable = response?.fareRules?.[0]?.isRefundable;
      //fare rules
      response?.fareRules?.forEach((rule: any) => {
        const origin = rule?.originAirportCode || 'N/A';
        const destination = rule?.destinationAirportCode || 'N/A';
        const airline = rule?.owningAirlineCode || 'N/A';

        fare_rules += `<h3>Fare Rules for ${origin} ➔ ${destination} (${airline})</h3>`;

        // Refund rules
        if (rule?.isRefundable) {
          fare_rules += `<h4>Refund Charges:</h4>`;

          const refundPenalties = rule?.refundPenalties || [];
          if (refundPenalties.length > 0) {
            refundPenalties.forEach((penalty: { applicability: string; penalty: { amount: string; currencyCode: string; }; hasNoShowCost: any; noShowPenalty: { amount: string; currencyCode: string; }; }) => {
              const applicability = penalty?.applicability?.replace('_', ' ') || 'N/A';
              const amount = penalty?.penalty?.amount || 'N/A';
              const currency = penalty?.penalty?.currencyCode || '';

              fare_rules += `
          <p><strong>When:</strong> ${applicability}</p>
          <p><strong>Refund Penalty:</strong> ${amount} ${currency}</p>
        `;

              if (penalty?.hasNoShowCost && penalty?.noShowPenalty) {
                const noShowAmount = penalty?.noShowPenalty?.amount || 'N/A';
                const noShowCurrency = penalty?.noShowPenalty?.currencyCode || '';
                fare_rules += `<p><strong>No-Show Penalty:</strong> ${noShowAmount} ${noShowCurrency}</p>`;
              }
            });
          } else {
            fare_rules += `<p>No refund penalties specified.</p>`;
          }

        } else {
          fare_rules += `<p>This fare is non-refundable.</p>`;
        }

        // Reissue rules
        if (rule?.isChangeable) {
          fare_rules += `<h4>Reissue (Exchange) Charges:</h4>`;

          const exchangePenalties = rule?.exchangePenalties || [];
          if (exchangePenalties.length > 0) {
            exchangePenalties.forEach((penalty: { applicability: string; penalty: { amount: string; currencyCode: string; }; hasNoShowCost: any; noShowPenalty: { amount: string; currencyCode: string; }; }) => {
              const applicability = penalty?.applicability?.replace('_', ' ') || 'N/A';
              const amount = penalty?.penalty?.amount || 'N/A';
              const currency = penalty?.penalty?.currencyCode || '';

              fare_rules += `
          <p><strong>When:</strong> ${applicability}</p>
          <p><strong>Change Penalty:</strong> ${amount} ${currency}</p>
        `;

              if (penalty?.hasNoShowCost && penalty?.noShowPenalty) {
                const noShowAmount = penalty?.noShowPenalty?.amount || 'N/A';
                const noShowCurrency = penalty?.noShowPenalty?.currencyCode || '';
                fare_rules += `<p><strong>No-Show Penalty:</strong> ${noShowAmount} ${noShowCurrency}</p>`;
              }
            });
          } else {
            fare_rules += `<p>No reissue penalties specified.</p>`;
          }

        } else {
          fare_rules += `<p>This fare is not changeable.</p>`;
        }

        fare_rules += `<hr />`; // Optional: Add a separator
      });
    }
    return {
      success: response ? true : false,
      status,
      ticket_number,
      last_time,
      airline_pnr,
      refundable,
      fare_rules
    };
  }

  public async pnrShare(pnr: string, dynamic_fare_supplier_id: number) {
    const sabre_response: ISabreRetrieveDataResponse | null =
      await this.request.postRequest(SabreAPIEndpoints.GET_BOOKING_ENDPOINT, {
        confirmationId: pnr,
      });

    if (!sabre_response) {
      throw new CustomError("PNR not found", this.StatusCode.HTTP_NOT_FOUND);
    }

    if (!sabre_response.flights || !Array.isArray(sabre_response.flights)) {
      throw new CustomError(
        "PNR not found",
        this.StatusCode.HTTP_BAD_REQUEST
      );
    }

    const commonModel = this.Model.commonModel(this.trx);

    const airports: string[] = [];
    const leg_description = sabre_response?.journeys?.map((item: any) => {
      airports.push(item?.firstAirportCode);
      airports.push(item?.lastAirportCode);
      return {
        departureLocation: item?.firstAirportCode,
        arrivalLocation: item?.lastAirportCode,
      };
    });

    const route_type = this.flightSupport.routeTypeFinder({
      airportsPayload: airports,
    });

    const airline_code = sabre_response.fares?.[0]?.airlineCode;

    //fare
    const { markup, commission } =
      await this.flightSupport.calculateFlightMarkup({
        dynamic_fare_supplier_id,
        airline: airline_code,
        flight_class: sabre_response.flights[0].cabinTypeName,
        base_fare: sabre_response?.payments?.flightTotals?.[0]?.subtotal,
        total_segments: sabre_response?.flights.length,
        route_type,
      });

    const ait = Math.round(
      (Number(sabre_response?.payments?.flightTotals?.[0].total) / 100) * 0.3
    );
    const fare = {
      base_fare:
        Number(sabre_response?.payments?.flightTotals?.[0]?.subtotal) + markup,
      total_tax: Number(sabre_response?.payments?.flightTotals?.[0]?.taxes),
      ait,
      discount: commission,
      payable:
        Number(sabre_response?.payments?.flightTotals?.[0]?.total) +
        markup +
        ait +
        markup -
        commission,
      vendor_price: {
        base_fare: Number(
          sabre_response?.payments?.flightTotals?.[0]?.subtotal
        ),
        tax: Number(sabre_response?.payments?.flightTotals?.[0]?.taxes),
        charge: 0,
        discount: 0,
        gross_fare: Number(sabre_response?.payments?.flightTotals?.[0]?.total),
        net_fare: Number(sabre_response?.payments?.flightTotals?.[0]?.total),
      },
    };

    //flights
    const flights = await Promise.all(
      sabre_response.journeys.map(async (journey, journeyIndex) => {
        const flightGroup = sabre_response.flights.slice(
          sabre_response.flights.findIndex(
            (_, i) =>
              i ===
              sabre_response.flights.findIndex(
                (f) =>
                  f.fromAirportCode === journey.firstAirportCode &&
                  f.departureDate === journey.departureDate
              )
          ),
          sabre_response.flights.findIndex(
            (_, i) =>
              i ===
              sabre_response.flights.findIndex(
                (f) =>
                  f.toAirportCode === journey.lastAirportCode &&
                  f.departureDate === journey.departureDate
              )
          ) + 1
        );

        const options = await Promise.all(
          flightGroup.map(async (flight, index) => {
            const dAirport = await commonModel.getAirportDetails(
              flight.fromAirportCode
            );
            const AAirport = await commonModel.getAirportDetails(
              flight.toAirportCode
            );

            return {
              id: index + 1,
              elapsedTime: flight.durationInMinutes,
              stopCount: 0,
              total_miles_flown: flight.distanceInMiles,
              departure: {
                airport_code: flight.fromAirportCode,
                city_code: flight.fromAirportCode,
                airport: dAirport.airport_name,
                city: dAirport.city_name,
                country: dAirport.country,
                terminal: flight.departureTerminalName,
                time: flight.departureTime,
                date: flight.departureDate,
              },
              arrival: {
                airport: AAirport.airport_name,
                city: AAirport.city_name,
                airport_code: flight.toAirportCode,
                city_code: flight.toAirportCode,
                country: AAirport.country,
                time: flight.arrivalTime,
                date: flight.arrivalDate,
              },
              carrier: {
                carrier_marketing_code: flight.airlineCode,
                carrier_marketing_airline: flight.airlineName,
                carrier_marketing_logo: "",
                carrier_marketing_flight_number: String(flight.flightNumber),
                carrier_operating_code: flight.operatingAirlineCode,
                carrier_operating_airline: flight.operatingAirlineName,
                carrier_operating_logo: "",
                carrier_operating_flight_number: String(
                  flight.operatingFlightNumber
                ),
                carrier_aircraft_code: flight.aircraftTypeCode,
                carrier_aircraft_name: flight.aircraftTypeName,
              },
            };
          })
        );

        return {
          id: journeyIndex + 1,
          stoppage: journey.numberOfFlights - 1,
          elapsed_time: options.reduce((sum, o) => sum + o.elapsedTime, 0),
          layover_time:
            options.length > 1
              ? options.slice(1).map((opt, i) => {
                const prev = options[i];
                const layover =
                  new Date(
                    `${opt.departure.date}T${opt.departure.time}`
                  ).getTime() -
                  new Date(
                    `${prev.arrival.date}T${prev.arrival.time}`
                  ).getTime();
                return Math.floor(layover / 60000); // in minutes
              })
              : [0],
          options,
        };
      })
    );

    //availability
    const availability = sabre_response.journeys.map(
      (journey, journeyIndex) => {
        const journeyFlights = sabre_response.flights.filter(
          (flight) =>
            flight.departureDate === journey.departureDate &&
            flight.travelerIndices.length > 0 && // ensure the flight belongs to a traveler
            flight.fromAirportCode === journey.firstAirportCode
        );

        return {
          from_airport: journey.firstAirportCode,
          to_airport: journey.lastAirportCode,
          segments: journeyFlights.map((flight, index) => {
            const offer = sabre_response.fareOffers.find((fo) =>
              fo.flights.some((f) => f.itemId === flight.itemId)
            );

            return {
              name: `Segment-${index + 1}`,
              passenger: flight.travelerIndices.map((travelerIndex) => {
                const traveler = sabre_response.travelers[travelerIndex];
                const fare = sabre_response.fares.find(
                  (f) =>
                    Array.isArray(f.fareConstruction) &&
                    f.fareConstruction.some(
                      (fc) =>
                        Array.isArray(fc.flights) &&
                        fc.flights.some((ff) => ff.itemId === flight.itemId)
                    )
                );

                const baggage =
                  offer?.cabinBaggageAllowance?.totalWeightInKilograms ||
                  fare?.fareConstruction?.find(
                    (fc) =>
                      Array.isArray(fc.flights) &&
                      fc.flights.some((ff) => ff.itemId === flight.itemId)
                  )?.checkedBaggageAllowance?.totalWeightInKilograms ||
                  0;

                return {
                  type: traveler?.passengerCode,
                  count: 1,
                  cabin_code: flight.cabinTypeCode,
                  cabin_type: flight.cabinTypeName,
                  booking_code: flight.bookingClass,
                  available_seat: flight.numberOfSeats,
                  available_break: true,
                  baggage_info: `${baggage} kg`,
                };
              }),
            };
          }),
        };
      }
    );

    //passengers fare
    const passengers = [];

    const travelerTypeCounts: Record<string, number> = {};

    sabre_response.travelers.forEach((traveler) => {
      let type = traveler.passengerCode;

      if (type.startsWith("C")) {
        type = "CHD";
      }

      if (!travelerTypeCounts[type]) {
        travelerTypeCounts[type] = 0;
      }
      travelerTypeCounts[type]++;
    });

    for (const [type, number] of Object.entries(travelerTypeCounts)) {
      // Map CHD back to CNN to find the correct fare
      const fareMatchType = type === "CHD" ? "CNN" : type;

      const fare = sabre_response.fares.find(
        (f) => f.pricedTravelerType === fareMatchType
      );

      if (fare) {
        const subtotal = parseFloat(fare.totals.subtotal);
        const tax = parseFloat(fare.totals.taxes);
        const total = parseFloat(fare.totals.total);

        passengers.push({
          type,
          number,
          fare: {
            base_fare: subtotal,
            tax,
            total_fare: total,
          },
        });
      }
    }

    //journey type
    let journey_type = "3";
    if (sabre_response.journeys.length === 1) {
      journey_type = "1";
    } else if (
      sabre_response.journeys.length === 2 &&
      sabre_response.journeys[0].lastAirportCode ===
      sabre_response.journeys[1].firstAirportCode &&
      sabre_response.journeys[0].firstAirportCode ===
      sabre_response.journeys[1].lastAirportCode
    ) {
      journey_type = "2";
    }

    //airline pnr
    const confirmationIds = [
      ...new Set(sabre_response.flights.map((flight) => flight.confirmationId)),
    ];

    const airline_pnr = confirmationIds.join(",");

    //ticket issue last time
    let last_time: string | null = null;
    sabre_response?.specialServices?.map((elem: any) => {
      if (elem.code === "ADTK") {
        last_time = elem.message;
      }
    });

    //status
    let status = FLIGHT_BOOKING_CONFIRMED;
    if (sabre_response.isTicketed) {
      status = FLIGHT_TICKET_ISSUE;
    } else if (
      sabre_response.startDate === undefined &&
      sabre_response.endDate === undefined
    ) {
      status = FLIGHT_BOOKING_CANCELLED;
    }

    //passenger booking data
    const passenger_data = await Promise.all(
      sabre_response?.travelers?.map(async (elem, ind) => {
        const givenName = elem.givenName.split(" ");
        let reference = "";

        //split reference from given name
        if (givenName.length > 0) {
          const lastPart = givenName[givenName.length - 1].toLowerCase();
          const titles = [
            "mr",
            "ms",
            "mrs",
            "miss",
            "mstr",
            "master",
            "mi",
            "fi",
            "misses",
          ];
          if (titles.includes(lastPart)) {
            reference = lastPart;
            givenName.pop();
          } else {
            reference = "";
          }
        }

        //get date of birth and gender from secure flight passenger data
        let date_of_birth;
        let gender;
        let passport_number;
        let passport_expiry_date;
        let nationality;
        let issuing_country;
        if (elem.type === "INFANT") {
          const matchingTraveler = sabre_response?.travelers?.find(
            (trav: any) =>
              trav.identityDocuments?.some(
                (identity_elem: {
                  documentType: string;
                  gender: string;
                  givenName: string;
                  surname: string;
                }) =>
                  identity_elem.documentType ===
                  "SECURE_FLIGHT_PASSENGER_DATA" &&
                  identity_elem.gender?.startsWith("I") &&
                  identity_elem.givenName === givenName.join(" ") &&
                  identity_elem.surname === elem.surname
              )
          );
          if (matchingTraveler) {
            const matchedDocument = matchingTraveler?.identityDocuments?.find(
              (identity_elem: { documentType: string; gender: string }) =>
                identity_elem.documentType === "SECURE_FLIGHT_PASSENGER_DATA" &&
                identity_elem.gender?.startsWith("I")
            );

            date_of_birth = matchedDocument?.birthDate;
            gender = matchedDocument?.gender.split("_")[1];

            const matchedPassportDocument =
              matchingTraveler?.identityDocuments?.find(
                (identity_elem: { documentType: string; gender: string }) =>
                  identity_elem.documentType === "PASSPORT" &&
                  identity_elem.gender?.startsWith("I")
              );

            passport_number = matchedPassportDocument?.documentNumber;
            passport_expiry_date = matchedPassportDocument?.expiryDate;
            issuing_country = matchedPassportDocument?.issuingCountryCode;
            nationality = matchedPassportDocument?.residenceCountryCode;
          }
        } else {
          const secure_flight_data = elem.identityDocuments?.find(
            (identity_elem: { documentType: string }) =>
              identity_elem.documentType === "SECURE_FLIGHT_PASSENGER_DATA"
          );
          date_of_birth = secure_flight_data?.birthDate;
          gender = secure_flight_data?.gender;

          const passport_info = elem.identityDocuments?.find(
            (identity_elem: { documentType: string }) =>
              identity_elem.documentType === "PASSPORT"
          );
          passport_number = passport_info?.documentNumber;
          passport_expiry_date = passport_info?.expiryDate;
          issuing_country = passport_info?.issuingCountryCode;
          nationality = passport_info?.residenceCountryCode;
        }
        const issuing_country_data = await commonModel.getCountryByIso({
          iso3: issuing_country,
        });

        const nationality_data = await commonModel.getCountryByIso({
          iso3: nationality,
        });
        return {
          key: String(ind),
          type: elem.passengerCode,
          reference: reference.toUpperCase() as
            | "Mr"
            | "Mrs"
            | "Ms"
            | "Miss"
            | "MSTR",
          first_name: givenName.join(" "),
          last_name: elem.surname,
          phone: elem.phones?.[0].number,
          date_of_birth: String(date_of_birth),
          gender: String(gender) as "Male" | "Female",
          email: elem.emails?.[0],
          passport_number,
          passport_expiry_date: passport_expiry_date
            ? new Date(passport_expiry_date)
            : undefined,
          issuing_country: issuing_country_data?.id,
          nationality: nationality_data?.id,
        };
      })
    );

    return {
      flight_details: {
        flight_id: "",
        api_search_id: "",
        booking_block: false,
        domestic_flight: false,
        journey_type,
        api: SABRE_API,
        fare,
        refundable: sabre_response.fareRules[0].isRefundable,
        carrier_code: "",
        carrier_name: "",
        carrier_logo: "",
        ticket_last_date: "",
        ticket_last_time: "",
        flights,
        passengers,
        availability,
        leg_description,
      } as IFormattedFlightItinerary,
      gds_pnr: sabre_response.request.confirmationId,
      airline_pnr,
      last_time,
      status,
      passenger_data,
    };
  }
  /////==================GET BOOKING(END)=========================//////////////

  /////////==================UTILS (START)=========================//////////
  // Get legs desc
  private newGetLegsDesc(
    legItems: {
      ref: number;
    }[],
    legDesc: IFormattedLegDesc[],
    OriginDest: OriginDestinationInformation[]
  ) {
    const legsDesc: IFormattedFlight[] = [];
    for (const [index, leg_item] of legItems.entries()) {
      const leg_id = leg_item.ref;

      const legs = legDesc.find(
        (legDecs: IFormattedLegDesc) => legDecs.id === leg_id
      );

      if (legs) {
        const options: IFormattedFlightOption[] = [];

        const date = OriginDest[index].DepartureDateTime;

        for (const option of legs.options) {
          const { departureDateAdjustment, ...rest } = option;
          let departure_date = new Date(date);
          if (departureDateAdjustment) {
            departure_date.setDate(
              departure_date.getDate() + Number(departureDateAdjustment)
            );
          }

          let year = departure_date.getFullYear();
          let month = String(departure_date.getMonth() + 1).padStart(2, "0");
          let day = String(departure_date.getDate()).padStart(2, "0");

          const departureDate = `${year}-${month}-${day}`;

          const arrivalDate = new Date(departureDate);

          if (option.arrival.date_adjustment) {
            arrivalDate.setDate(
              arrivalDate.getDate() + option.arrival.date_adjustment
            );
          }

          const arrivalYear = arrivalDate.getFullYear();
          const arrivalMonth = String(arrivalDate.getMonth() + 1).padStart(
            2,
            "0"
          );
          const arrivalDay = String(arrivalDate.getDate()).padStart(2, "0");

          const formattedArrivalDate = `${arrivalYear}-${arrivalMonth}-${arrivalDay}`;

          options.push({
            ...rest,
            departure: {
              ...option.departure,
              date: departureDate,
            },
            arrival: {
              ...option.arrival,
              date: formattedArrivalDate,
            },
          });
        }

        const layoverTime = this.getNewLayoverTime(options as any);

        legsDesc.push({
          id: legs.id,
          stoppage: options.length - 1,
          elapsed_time: legs.elapsed_time,
          layover_time: layoverTime,
          options,
        });
      }
    }
    return legsDesc;
  }

  // Get layover time
  private getNewLayoverTime = (options: any[]) => {
    const layoverTime = options.map((item, index) => {
      let firstArrival = options[index].arrival.time;
      let secondDeparture = options[index + 1]?.departure?.time;

      let layoverTimeString = 0;

      if (secondDeparture) {
        const startDate = new Date(`2020-01-01T${firstArrival}`);

        let endDate = new Date(`2020-01-01T${secondDeparture}`);

        if (endDate < startDate) {
          endDate = new Date(`2020-01-02T${secondDeparture}`);
          // Calculate the difference in milliseconds
          const differenceInMilliseconds =
            endDate.getTime() - startDate.getTime();

          // Convert the difference minutes
          layoverTimeString = Math.abs(differenceInMilliseconds / (1000 * 60));
        } else {
          const layoverTimeInMilliseconds =
            endDate.getTime() - startDate.getTime();

          layoverTimeString = Math.abs(layoverTimeInMilliseconds) / (1000 * 60);
        }
      }

      return layoverTimeString;
    });
    return layoverTime;
  };
  ///==================UTILS (END)=========================///
}
