import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import AbstractServices from '../../../abstract/abstract.service';
import CustomError from '../../../utils/lib/customError';
import CommonFlightUtils from '../../lib/flightLib/commonFlightUtils';
import TripjackRequests from '../../lib/flightLib/tripjackRequest';
import { BD_AIRPORT, ERROR_LEVEL_WARNING, PROJECT_EMAIL_API_1 } from '../../miscellaneous/constants';
import {
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_TICKET_ISSUE,
  ROUTE_TYPE,
  TRIPJACK_API,
} from '../../miscellaneous/flightMiscellaneous/flightConstants';
import TripjackApiEndpoints from '../../miscellaneous/flightMiscellaneous/tripjackApiEndpoints';
import { IFlightBookingRequestBody } from '../../supportTypes/flightBookingTypes/commonFlightBookingTypes';
import {
  IFlightAvailability,
  IFlightDataAvailabilitySegment,
  IFlightSearchReqBody,
  IFormattedFlight,
  IFormattedFlightItinerary,
  IFormattedFlightOption,
  IFormattedPassenger,
} from '../../supportTypes/flightSupportTypes/commonFlightTypes';
import {
  IFareDetails,
  IFlightSegmentInfo,
  ITripjackFlightBookingTravelerPayload,
  ITripjackFlightBookIssuePayload,
  ITripjackFlightResTotalPriceList,
  ITripjackFlightRevalidateReqBody,
  ITripjackFlightRevalidateResBody,
  ITripjackFlightSearchReqBody,
  ITripjackFlightSearchReqBodyRouteInfo,
  ITripjackFlightSearchResBody,
  ITripjackFlightSearchResults,
  ITripjackRetrieveBookingDetailsRes,
} from '../../supportTypes/flightSupportTypes/tripjackFlightTypes';
import { CommonFlightSupport } from './commonFlightSupport.service';
import FlightUtils from '../../lib/flightLib/commonFlightUtils';
import { IGetAirlinesPreferenceQuery } from '../../interfaces/dynamicFareRulesModelInterface/airlinesPreferenceModel.interface';

export default class TripjackFlightSupportService extends AbstractServices {
  private trx: Knex.Transaction;
  private request = new TripjackRequests();
  private flightUtils = new FlightUtils();
  private flightSupport: CommonFlightSupport;
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
    this.flightSupport = new CommonFlightSupport(trx);
  }

  /////==================FLIGHT SEARCH (START)=========================//////
  private async FlightSearchReqBodyFormatter(
    body: IFlightSearchReqBody,
    dynamic_fare_supplier_id: number,
    route_type: 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' | 'SOTO'
  ) {
    const AirlinesPrefModel = this.Model.AirlinesPreferenceModel(this.trx);

    const prefAirlinesQuery: IGetAirlinesPreferenceQuery = {
      dynamic_fare_supplier_id,
      pref_type: 'PREFERRED',
      status: true,
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

    // Preferred airlines
    const cappingAirlines: { Code: string }[] =
      await AirlinesPrefModel.getAirlinePrefCodes(prefAirlinesQuery);

    const PreferredAirlines: string[] = cappingAirlines.map((elm) => elm.Code);

    let finalAirlineCodes: string[] = [];

    if (body.airline_code?.length) {
      const reqAirlineCodes = body.airline_code.map((elm) => elm.Code);

      if (PreferredAirlines.length) {
        // Take common values between preferred and requested airlines
        finalAirlineCodes = reqAirlineCodes.filter((code) =>
          PreferredAirlines.includes(code)
        );
        if (finalAirlineCodes.length === 0) {
          return [];
        }
      } else {
        // If no preferred airlines, take all from request
        finalAirlineCodes = reqAirlineCodes;
      }
    } else {
      if (PreferredAirlines.length) {
        // No requested airlines, but preferred exists
        finalAirlineCodes = PreferredAirlines;
      }
    }

    // Convert to desired format: { code: 'XX' }[]
    const airlineCodeObjects: { code: string }[] = finalAirlineCodes.map(
      (code) => ({ code })
    );

    // cabin class
    const cabinMap: Record<
      string,
      'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
    > = {
      '1': 'ECONOMY',
      '2': 'PREMIUM_ECONOMY',
      '3': 'BUSINESS',
      '4': 'FIRST',
    };
    const cabinClass =
      cabinMap[
      body.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin
      ];

    // passenger info
    const paxInfo = body.PassengerTypeQuantity.reduce(
      (acc, { Code, Quantity }) => {
        if (Code.startsWith('A')) acc.ADULT += Quantity;
        else if (Code.startsWith('C')) acc.CHILD += Quantity;
        else if (Code.startsWith('I')) acc.INFANT += Quantity;
        return acc;
      },
      { ADULT: 0, CHILD: 0, INFANT: 0 }
    );
    const paxInfoStr = {
      ADULT: paxInfo.ADULT.toString(),
      CHILD: paxInfo.CHILD.toString(),
      INFANT: paxInfo.INFANT.toString(),
    };

    // flight route info
    const routeInfos: ITripjackFlightSearchReqBodyRouteInfo[] =
      body.OriginDestinationInformation.map((elm) => ({
        fromCityOrAirport: { code: elm.OriginLocation.LocationCode },
        toCityOrAirport: { code: elm.DestinationLocation.LocationCode },
        travelDate: elm.DepartureDateTime.split('T')[0],
      }));

    return {
      searchQuery: {
        cabinClass,
        paxInfo: paxInfoStr,
        routeInfos,
        preferredAirline: airlineCodeObjects?.length
          ? airlineCodeObjects
          : undefined,
      },
    } as ITripjackFlightSearchReqBody;
  }

  //combines all the results
  private combineTripInfos(
    tripInfos: ITripjackFlightSearchResBody['searchResult']['tripInfos']
  ): ITripjackFlightSearchResults[] {
    if (tripInfos.COMBO) return tripInfos.COMBO;
    if (
      tripInfos.ONWARD &&
      !tripInfos.RETURN &&
      Object.keys(tripInfos).length === 1
    )
      return tripInfos.ONWARD;

    const onwardKey = 'ONWARD';
    const returnKey = 'RETURN';

    const onwardFlights = tripInfos[onwardKey] ?? [];
    const returnFlights = tripInfos[returnKey] ?? [];

    // Handle dynamic keys (e.g., "0", "1") by collecting keys that are not ONWARD, RETURN, or COMBO
    const dynamicKeys = Object.keys(tripInfos).filter(
      (key) => !['ONWARD', 'RETURN', 'COMBO'].includes(key)
    );

    let combinations: ITripjackFlightSearchResults[] = [];

    const combineFlights = (
      onwardList: ITripjackFlightSearchResults[],
      returnList: ITripjackFlightSearchResults[]
    ) => {
      onwardList.forEach((onward) => {
        const onwardArrival = new Date(
          onward.sI[onward.sI.length - 1].at
        ).getTime();

        returnList.forEach((returnF) => {
          const returnDeparture = new Date(returnF.sI[0].dt).getTime();

          if (returnDeparture > onwardArrival) {
            // Combine segments
            const combinedSegments = [...onward.sI, ...returnF.sI];
            const combinedPrices: ITripjackFlightResTotalPriceList[] = [];

            onward.totalPriceList.forEach((onwardPrice) => {
              returnF.totalPriceList.forEach((returnPrice) => {
                if (!onwardPrice.fd || !returnPrice.fd) return;

                combinedPrices.push({
                  ...onwardPrice,
                  fd: {
                    ADULT: this.combineFareDetails(
                      onwardPrice.fd.ADULT,
                      returnPrice.fd.ADULT
                    ),
                    CHILD: this.combineFareDetails(
                      onwardPrice.fd.CHILD,
                      returnPrice.fd.CHILD
                    ),
                    INFANT: this.combineFareDetails(
                      onwardPrice.fd.INFANT,
                      returnPrice.fd.INFANT
                    ),
                  },
                  // Optional: add new fareIdentifier or id if needed
                  fareIdentifier: `${onwardPrice.fareIdentifier}+${returnPrice.fareIdentifier}`,
                  id: `${onwardPrice.id}+${returnPrice.id}`,
                });
              });
            });

            combinations.push({
              sI: combinedSegments,
              totalPriceList: combinedPrices,
              airFlowType: 'SEARCH',
            });
          }
        });
      });
    };

    if (onwardFlights.length && returnFlights.length) {
      combineFlights(onwardFlights, returnFlights);
    }

    // Handle dynamic leg-based multi-city trips
    if (dynamicKeys.length > 1) {
      const dynamicCombinations = this.combineDynamicLegs(
        tripInfos,
        dynamicKeys
      );
      if (dynamicCombinations.length) return dynamicCombinations;
    }

    return combinations.length
      ? combinations.slice(0, 10)
      : onwardFlights.slice(0, 10);
  }

  private async flightSearchResFormatter({
    booking_block,
    response,
    reqBody,
    dynamic_fare_supplier_id,
    route_type,
  }: {
    booking_block: boolean;
    response: ITripjackFlightSearchResults[];
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    route_type: 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' | 'SOTO';
  }) {
    const commonModel = this.Model.commonModel(this.trx);
    const api_currency = await this.Model.CurrencyModel(
      this.trx
    ).getApiWiseCurrencyByName(TRIPJACK_API, 'FLIGHT');

    const AirlinesPreferenceModel = this.Model.AirlinesPreferenceModel(
      this.trx
    );

    const getBlockedAirlinesPayload: IGetAirlinesPreferenceQuery = {
      dynamic_fare_supplier_id,
      pref_type: 'BLOCKED',
      status: true
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

    const paxInfo = reqBody.PassengerTypeQuantity.reduce(
      (acc, { Code, Quantity }) => {
        if (Code.startsWith('A')) acc.ADULT += Quantity;
        else if (Code.startsWith('C')) acc.CHILD += Quantity;
        else if (Code.startsWith('I')) acc.INFANT += Quantity;
        return acc;
      },
      { ADULT: 0, CHILD: 0, INFANT: 0 }
    );

    let pax_count = 0;

    reqBody.PassengerTypeQuantity.map((reqPax) => {
      pax_count += reqPax.Quantity;
    });

    const formattedResponse = [];

    for (const flight_elm of response) {
      const flight_segments = flight_elm.sI;
      const fare = {
        base_fare: 0,
        total_tax: 0,
        ait: 0,
        discount: 0,
        payable: 0,
        vendor_price: {},
      };

      const flight_code = flight_segments[0].fD.aI.code;

      if (blockedAirlines.find((ba) => ba.Code === flight_code)) {
        continue;
      }
      const career = await commonModel.getAirlines(flight_code);

      // Calculate fare and set passenger array
      fare.base_fare +=
        Number(flight_elm.totalPriceList[0].fd.ADULT?.fC.BF || 0) *
        paxInfo.ADULT;
      fare.base_fare +=
        Number(flight_elm.totalPriceList[0].fd.CHILD?.fC.BF || 0) *
        paxInfo.CHILD;
      fare.base_fare +=
        Number(flight_elm.totalPriceList[0].fd.INFANT?.fC.BF || 0) *
        paxInfo.INFANT;

      fare.total_tax +=
        Number(flight_elm.totalPriceList[0].fd.ADULT?.fC.TAF || 0) *
        paxInfo.ADULT;
      fare.total_tax +=
        Number(flight_elm.totalPriceList[0].fd.CHILD?.fC.TAF || 0) *
        paxInfo.CHILD;
      fare.total_tax +=
        Number(flight_elm.totalPriceList[0].fd.INFANT?.fC.TAF || 0) *
        paxInfo.INFANT;

      fare.payable +=
        Number(flight_elm.totalPriceList[0].fd.ADULT?.fC.NF || 0) *
        paxInfo.ADULT;
      fare.payable +=
        Number(flight_elm.totalPriceList[0].fd.CHILD?.fC.NF || 0) *
        paxInfo.CHILD;
      fare.payable +=
        Number(flight_elm.totalPriceList[0].fd.INFANT?.fC.NF || 0) *
        paxInfo.INFANT;

      fare.ait = Math.round(((fare.base_fare + fare.total_tax) / 100) * 0.3);

      fare.vendor_price = {
        base_fare: fare.base_fare,
        tax: fare.total_tax,
        charge: 0,
        discount: 0,
        gross_fare: fare.base_fare + fare.total_tax,
        net_fare: fare.payable,
      };

      fare.base_fare *= api_currency;
      fare.total_tax *= api_currency;
      fare.payable *= api_currency;
      fare.ait *= api_currency;

      const fareTypes: { key: keyof typeof paxInfo; type: string }[] = [
        { key: 'ADULT', type: 'ADT' },
        { key: 'CHILD', type: 'CHD' },
        { key: 'INFANT', type: 'INFANT' },
      ];

      //segment data
      let elapsed_time = 0;
      const paxSegment: IFormattedFlightOption[] = await Promise.all(
        flight_elm.sI.map(async (segment_elem) => {
          const marketing_airline = await commonModel.getAirlines(
            segment_elem.fD.aI.code
          );

          let operating_airline = marketing_airline;

          elapsed_time += Number(segment_elem.duration);

          const splittedDepDateTime = segment_elem.dt.split('T');
          const splittedArrDateTime = segment_elem.at.split('T');

          const dAirport = await commonModel.getAirport(segment_elem.da.code);
          const AAirport = await commonModel.getAirport(segment_elem.aa.code);

          const DCity = await commonModel.getCity(segment_elem.da.cityCode);
          const ACity = await commonModel.getCity(segment_elem.aa.cityCode);

          return {
            id: Number(segment_elem.id),
            elapsedTime: Number(segment_elem.duration),
            segmentGroup: segment_elem.sN,
            departure: {
              airport_code: segment_elem.da.code,
              airport: dAirport,
              city: DCity,
              city_code: segment_elem.da.cityCode,
              country: dAirport.country,
              terminal: segment_elem.da.terminal,
              date: splittedDepDateTime[0],
              time: splittedDepDateTime[1],
            },
            arrival: {
              airport_code: segment_elem.aa.code,
              airport: AAirport,
              city: ACity,
              city_code: segment_elem.aa.cityCode,
              country: AAirport.country,
              terminal: segment_elem.aa.terminal,
              date: splittedArrDateTime[0],
              time: splittedArrDateTime[1],
            },
            carrier: {
              carrier_marketing_code: segment_elem.fD.aI.code,
              carrier_marketing_airline: marketing_airline.name,
              carrier_marketing_logo: marketing_airline.logo,
              carrier_marketing_flight_number: segment_elem.fD.fN,
              carrier_operating_code: segment_elem.fD.aI.code,
              carrier_operating_airline: operating_airline.name,
              carrier_operating_logo: operating_airline.logo,
              carrier_operating_flight_number: segment_elem.fD.fN,
              carrier_aircraft_code: '',
              carrier_aircraft_name: '',
            },
          };
        })
      );

      //tax fare
      const tax_fare = Object.entries(flight_elm.totalPriceList[0].fd).map(([paxType, paxInfo]) => {
        const afC = paxInfo.afC?.TAF || {}; // The breakdown of taxes

        // Transform afC into the same format: [{ code, amount }]
        const taxes = Object.entries(afC).map(([code, amount]) => ({
          code,
          amount
        }));

        return taxes;
      });

      let { tax_markup, tax_commission } = await this.flightSupport.calculateFlightTaxMarkup({
        dynamic_fare_supplier_id,
        tax: tax_fare,
        route_type,
        airline: flight_code,
      });
      tax_commission = tax_commission * api_currency;
      tax_markup = tax_markup * api_currency;

      //calculate system markup
      const { markup, commission, pax_markup } = await new CommonFlightSupport(
        this.trx
      ).calculateFlightMarkup({
        dynamic_fare_supplier_id,
        airline: flight_code,
        base_fare: fare.base_fare,
        total_segments: paxSegment.length,
        flight_class: new CommonFlightUtils().getClassFromId(
          reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin
        ),
        route_type,
      });
      const total_pax_markup = pax_markup * pax_count;

      fare.base_fare += markup;
      fare.base_fare += total_pax_markup;
      fare.base_fare += tax_markup;
      fare.discount += commission;
      fare.discount += tax_commission;

      fare.payable =
        Number((Number(fare.base_fare) +
          fare.total_tax +
          fare.ait -
          Number(fare.discount)).toFixed(2));

      const passengers: IFormattedPassenger[] = fareTypes
        .filter(({ key }) => paxInfo[key] > 0)
        .map(({ key, type }) => {
          const fareData =
            (flight_elm.totalPriceList[0].fd[key]?.fC as {
              BF?: number;
              TAF?: number;
              TF?: number;
              NF?: number;
            }) || {};

          const per_pax_markup = ((markup + tax_markup) / pax_count) * Number(paxInfo[key]);

          const total_pax_markup = pax_markup * Number(paxInfo[key]);

          const paxBaseFare =
            Number(fareData.BF ?? 0) * api_currency +
            per_pax_markup +
            total_pax_markup;
          const paxTax = Number(fareData.TAF ?? 0) * api_currency;
          return {
            type,
            number: paxInfo[key],
            fare: {
              base_fare: Number(paxBaseFare.toFixed(2)),
              tax: paxTax,
              total_fare: Number((paxBaseFare + paxTax).toFixed(2)),
            },
          };
        });

      //calculate elapsed time, stoppage, segment data format
      let flights: {
        id: number;
        elapsed_time: number;
        stoppage: number;
        layover_time: number[];
        options: IFormattedFlightOption[];
      }[] = [];
      let segment_ind = -1;

      for (let i = 0; i < paxSegment.length; i++) {
        segment_ind =
          paxSegment[i].segmentGroup === 0 ? ++segment_ind : segment_ind;
        if (!flights[segment_ind]) {
          flights[segment_ind] = {
            id: 0,
            elapsed_time: 0,
            stoppage: -1,
            options: [],
            layover_time: [],
          };
        }
        flights[segment_ind].id = segment_ind + 1;
        flights[segment_ind].elapsed_time =
          Number(flights[segment_ind].elapsed_time) +
          Number(paxSegment[i].elapsedTime);
        flights[segment_ind].stoppage++;
        flights[segment_ind].options.push(paxSegment[i]);
        flights[segment_ind].layover_time =
          new CommonFlightUtils().getNewLayoverTime(
            flights[segment_ind].options
          );
      }

      let ticketLastDateTimeSplitted = ['', ''];

      const availability = flights.map((leg_elm) => {
        const segments = leg_elm.options.map((seg_elm, seg_ind) => {
          const passengerTypes: {
            key: keyof typeof paxInfo;
            label: string;
          }[] = [
              { key: 'ADULT', label: 'ADT' },
              { key: 'CHILD', label: 'CHD' },
              { key: 'INFANT', label: 'INF' },
            ];

          const av_passengers = passengerTypes
            .filter((pt) => paxInfo[pt.key] > 0)
            .map((pt) => {
              const fd = flight_elm.totalPriceList[0].fd[pt.key];
              const checkedBaggage = fd?.bI?.iB || '-';
              const cabinBaggage = fd?.bI?.cB || '-';

              return {
                type: pt.label,
                count: paxInfo[pt.key],
                meal_type: undefined,
                meal_code: undefined,
                cabin_code: '',
                cabin_type: fd?.cc || '',
                booking_code: fd?.cB || '',
                available_seat: fd?.sR ?? undefined,
                available_break: undefined,
                baggage_info: `Checked: ${checkedBaggage}, Cabin: ${cabinBaggage}`,
              };
            });

          return {
            name: `Segment-${seg_ind + 1}`,
            passenger: av_passengers,
          };
        });

        return {
          from_airport: leg_elm.options[0].departure.airport_code,
          to_airport:
            leg_elm.options[leg_elm.options.length - 1].arrival.airport_code,
          segments,
        };
      });

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
          flight_api_name: TRIPJACK_API,
          airline: flight_code,
          refundable: Boolean(flight_elm.totalPriceList[0].fd.ADULT?.rT),
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
          domestic: true,
        });
      } else if (route_type === ROUTE_TYPE.FROM_DAC) {
        //from dac
        partial_payment = await this.Model.PartialPaymentRuleModel(
          this.trx
        ).getPartialPaymentCondition({
          flight_api_name: TRIPJACK_API,
          airline: flight_code,
          from_dac: true,
          refundable: Boolean(flight_elm.totalPriceList[0].fd.ADULT?.rT),
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
        });
      } else if (route_type === ROUTE_TYPE.TO_DAC) {
        //to dac
        partial_payment = await this.Model.PartialPaymentRuleModel(
          this.trx
        ).getPartialPaymentCondition({
          flight_api_name: TRIPJACK_API,
          airline: flight_code,
          to_dac: true,
          refundable: Boolean(flight_elm.totalPriceList[0].fd.ADULT?.rT),
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
        });
      } else {
        //soto
        partial_payment = await this.Model.PartialPaymentRuleModel(
          this.trx
        ).getPartialPaymentCondition({
          flight_api_name: TRIPJACK_API,
          airline: flight_code,
          refundable: Boolean(flight_elm.totalPriceList[0].fd.ADULT?.rT),
          travel_date:
            reqBody.OriginDestinationInformation[0].DepartureDateTime,
          soto: true,
        });
      }

      formattedResponse.push({
        api_search_id: flight_elm.totalPriceList[0].id,
        booking_block,
        flight_id: uuidv4(),
        journey_type: reqBody.JourneyType,
        api: TRIPJACK_API,
        partial_payment,
        is_domestic_flight: route_type === ROUTE_TYPE.DOMESTIC,
        fare,
        leg_description: [],
        refundable: Boolean(flight_elm.totalPriceList[0].fd.ADULT?.rT),
        carrier_code: flight_code,
        carrier_name: career.name,
        carrier_logo: career.logo,
        ticket_last_date: ticketLastDateTimeSplitted[0] || '',
        ticket_last_time: ticketLastDateTimeSplitted[1] || '',
        flights,
        passengers,
        availability,
      });
    }

    return formattedResponse;
  }

  public async FlightSearchService({
    booking_block,
    reqBody,
    dynamic_fare_supplier_id,
  }: {
    reqBody: IFlightSearchReqBody;
    booking_block: boolean;
    dynamic_fare_supplier_id: number;
  }) {
    const route_type = this.flightSupport.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });

    const flightRequestBody = await this.FlightSearchReqBodyFormatter(
      reqBody,
      dynamic_fare_supplier_id,
      route_type
    );

    const response: ITripjackFlightSearchResBody | null =
      await this.request.postRequest(
        TripjackApiEndpoints.FLIGHT_SEARCH_ENDPOINT,
        flightRequestBody
      );

    if (!response) {
      return [];
    }

    const combinedData = this.combineTripInfos(response.searchResult.tripInfos);
    if (!combinedData.length) {
      return [];
    }

    const result = await this.flightSearchResFormatter({
      booking_block,
      dynamic_fare_supplier_id,
      reqBody,
      response: combinedData,
      route_type,
    });
    return result;
  }
  /////==================FLIGHT SEARCH (END)=========================///////

  /////==================FLIGHT REVALIDATE (START)=========================///////

  public async FlightRevalidateService({
    booking_block,
    reqBody,
    api_search_id,
    flight_id,
    dynamic_fare_supplier_id,
  }: {
    reqBody: IFlightSearchReqBody;
    booking_block: boolean;
    api_search_id: string;
    flight_id: string;
    dynamic_fare_supplier_id: number;
  }) {
    const revalidateReqBody = this.FlightRevalidateReqFormatter(api_search_id);
    const response: ITripjackFlightRevalidateResBody | null =
      await this.request.postRequest(
        TripjackApiEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
        revalidateReqBody
      );
    if (!response) {
      throw new CustomError('The flight is not available', 404);
    }
    const formatted_response = await this.FlightRevalidateResFormatter({
      dynamic_fare_supplier_id,
      booking_block,
      response,
      reqBody,
      flight_id,
      api_search_id,
    });
    return formatted_response;
  }

  private FlightRevalidateReqFormatter(api_search_id: string) {
    const priceIds = api_search_id.split(',');
    return {
      priceIds,
    } as ITripjackFlightRevalidateReqBody;
  }

  private async FlightRevalidateResFormatter({
    booking_block,
    response,
    reqBody,
    flight_id,
    dynamic_fare_supplier_id,
  }: {
    booking_block: boolean;
    response: ITripjackFlightRevalidateResBody;
    reqBody: IFlightSearchReqBody;
    flight_id: string;
    api_search_id: string;
    dynamic_fare_supplier_id: number;
  }) {
    const commonModel = this.Model.commonModel(this.trx);
    const api_currency = await this.Model.CurrencyModel(
      this.trx
    ).getApiWiseCurrencyByName(TRIPJACK_API, 'FLIGHT');

    const route_type = this.flightSupport.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });

    const paxInfo = reqBody.PassengerTypeQuantity.reduce(
      (acc, { Code, Quantity }) => {
        if (Code.startsWith('A')) acc.ADULT += Quantity;
        else if (Code.startsWith('C')) acc.CHILD += Quantity;
        else if (Code.startsWith('I')) acc.INFANT += Quantity;
        return acc;
      },
      { ADULT: 0, CHILD: 0, INFANT: 0 }
    );

    const flights: IFormattedFlight[] = [];
    const availability: IFlightAvailability[] = [];
    const passengers: {
      type: string;
      number: number;
      fare: {
        base_fare: number;
        tax: number;
        total_fare: number;
      };
    }[] = [];

    const fare = {
      base_fare: 0,
      total_tax: 0,
      ait: 0,
      discount: 0,
      payable: 0,
      vendor_price: {},
    };

    let pax_count = 0;

    reqBody.PassengerTypeQuantity.map((reqPax) => {
      pax_count += reqPax.Quantity;
    });

    const flight_code = response.tripInfos[0].sI[0].fD.aI.code;
    const career = await commonModel.getAirlines(flight_code);
    const refundable = Boolean(
      response.tripInfos[0].totalPriceList[0].fd.ADULT?.rT
    );
    const price_changed = Boolean(
      response.alerts?.find((elm) => elm.type === 'FAREALERT')
    );


    await Promise.all(
      response.tripInfos.map(async (flight_elm, flight_ind) => {
        const flight_segments = flight_elm.sI;
        let elapsed_time = 0;
        const av_segment: IFlightDataAvailabilitySegment[] = [];

        const options: IFormattedFlightOption[] = await Promise.all(
          flight_segments.map(async (segment_elem, seg_ind) => {
            const passengerTypes: {
              key: keyof typeof paxInfo;
              label: string;
            }[] = [
                { key: 'ADULT', label: 'ADT' },
                { key: 'CHILD', label: 'CHD' },
                { key: 'INFANT', label: 'INF' },
              ];

            const av_passengers = passengerTypes
              .filter((pt) => paxInfo[pt.key] > 0)
              .map((pt) => {
                const fd = flight_elm.totalPriceList[0].fd[pt.key];
                const checkedBaggage = fd?.bI?.iB || '-';
                const cabinBaggage = fd?.bI?.cB || '-';

                return {
                  type: pt.label,
                  count: paxInfo[pt.key],
                  meal_type: undefined,
                  meal_code: undefined,
                  cabin_code: '',
                  cabin_type: fd?.cc || '',
                  booking_code: fd?.cB || '',
                  available_seat: fd?.sR ?? undefined,
                  available_break: undefined,
                  baggage_info: `Checked: ${checkedBaggage}, Cabin: ${cabinBaggage}`,
                };
              });

            av_segment.push({
              name: `Segment-${seg_ind + 1}`,
              passenger: av_passengers,
            });

            const marketing_airline = await commonModel.getAirlines(
              segment_elem.fD.aI.code
            );
            const operating_airline = marketing_airline;
            elapsed_time += Number(segment_elem.duration);

            const [depDate, depTime] = segment_elem.dt.split('T');
            const [arrDate, arrTime] = segment_elem.at.split('T');

            const dAirport = await commonModel.getAirport(segment_elem.da.code);
            const AAirport = await commonModel.getAirport(segment_elem.aa.code);
            const DCity = await commonModel.getCity(segment_elem.da.cityCode);
            const ACity = await commonModel.getCity(segment_elem.aa.cityCode);

            //SSR
            const meal: any[] = [];
            const baggage: any[] = [];
            if (segment_elem.ssrInfo) {
              if (segment_elem.ssrInfo.MEAL && segment_elem.ssrInfo.MEAL.length) {
                for (const meal_ssr of segment_elem.ssrInfo.MEAL) {
                  meal.push({
                    code: meal_ssr.code,
                    amount: Number(meal_ssr.amount) * api_currency,
                    equivalent_amount: Number(meal_ssr.amount),
                    desc: meal_ssr.desc
                  });
                }
              }
              if (segment_elem.ssrInfo.BAGGAGE && segment_elem.ssrInfo.BAGGAGE.length) {
                for (const baggage_ssr of segment_elem.ssrInfo.BAGGAGE) {
                  baggage.push({
                    code: baggage_ssr.code,
                    amount: Number(baggage_ssr.amount) * api_currency,
                    equivalent_amount: Number(baggage_ssr.amount),
                    desc: baggage_ssr.desc
                  });
                }
              }
            }

            return {
              id: Number(segment_elem.id),
              elapsedTime: Number(segment_elem.duration),
              segmentGroup: segment_elem.sN,
              departure: {
                airport_code: segment_elem.da.code,
                airport: dAirport,
                city: DCity,
                city_code: segment_elem.da.cityCode,
                country: dAirport.country,
                terminal: segment_elem.da.terminal,
                date: depDate,
                time: depTime,
              },
              arrival: {
                airport_code: segment_elem.aa.code,
                airport: AAirport,
                city: ACity,
                city_code: segment_elem.aa.cityCode,
                country: AAirport.country,
                terminal: segment_elem.aa.terminal,
                date: arrDate,
                time: arrTime,
              },
              carrier: {
                carrier_marketing_code: segment_elem.fD.aI.code,
                carrier_marketing_airline: marketing_airline.name,
                carrier_marketing_logo: marketing_airline.logo,
                carrier_marketing_flight_number: segment_elem.fD.fN,
                carrier_operating_code: segment_elem.fD.aI.code,
                carrier_operating_airline: operating_airline.name,
                carrier_operating_logo: operating_airline.logo,
                carrier_operating_flight_number: segment_elem.fD.fN,
                carrier_aircraft_code: '',
                carrier_aircraft_name: '',
              },
              ssr: {
                meal,
                baggage
              }
            };
          })
        );



        flights.push({
          id: flight_ind + 1,
          stoppage: options.length - 1,
          elapsed_time,
          layover_time: new CommonFlightUtils().getNewLayoverTime(options),
          options
        });



        const fareTypes: { key: keyof typeof paxInfo; type: string }[] = [
          { key: 'ADULT', type: 'ADT' },
          { key: 'CHILD', type: 'CHD' },
          { key: 'INFANT', type: 'INFANT' },
        ];

        fareTypes
          .filter(({ key }) => paxInfo[key] > 0)
          .forEach(({ key, type }) => {
            const fareData =
              (flight_elm.totalPriceList[0].fd[key]?.fC as {
                BF?: number;
                TAF?: number;
                TF?: number;
                NF?: number;
              }) || {};

            const count = paxInfo[key];
            const baseFare = Number(fareData.BF ?? 0) * api_currency;
            const tax = Number(fareData.TAF ?? 0) * api_currency;
            const totalFare = Number(fareData.TF ?? 0) * api_currency;

            const existingPassenger = passengers.find(
              (pass_elm) => pass_elm.type === type
            );

            if (existingPassenger) {
              existingPassenger.fare.base_fare += baseFare;
              existingPassenger.fare.tax += tax;
              existingPassenger.fare.total_fare += totalFare;
            } else {
              passengers.push({
                type,
                number: count,
                fare: {
                  base_fare: baseFare,
                  tax: tax,
                  total_fare: totalFare,
                },
              });
            }
          });

        availability.push({
          from_airport: options[0].departure.airport_code,
          to_airport: options[options.length - 1].arrival.airport_code,
          segments: av_segment,
        });
      })
    );

    // Fare Calculation
    // fare.base_fare +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.ADULT?.fC.BF || 0) *
    //   paxInfo.ADULT;
    // fare.base_fare +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.CHILD?.fC.BF || 0) *
    //   paxInfo.CHILD;
    // fare.base_fare +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.INFANT?.fC.BF || 0) *
    //   paxInfo.INFANT;
    // fare.total_tax +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.ADULT?.fC.TAF || 0) *
    //   paxInfo.ADULT;
    // fare.total_tax +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.CHILD?.fC.TAF || 0) *
    //   paxInfo.CHILD;
    // fare.total_tax +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.INFANT?.fC.TAF || 0) *
    //   paxInfo.INFANT;

    // fare.payable +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.ADULT?.fC.NF || 0) *
    //   paxInfo.ADULT;
    // fare.payable +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.CHILD?.fC.NF || 0) *
    //   paxInfo.CHILD;
    // fare.payable +=
    //   Number(response.tripInfos[0].totalPriceList[0].fd.INFANT?.fC.NF || 0) *
    //   paxInfo.INFANT;


    fare.base_fare = Number(response.totalPriceInfo.totalFareDetail.fC.BF);
    fare.total_tax = Number(response.totalPriceInfo.totalFareDetail.fC.TAF);
    fare.payable = Number(response.totalPriceInfo.totalFareDetail.fC.NF);
    fare.ait = Math.round(((fare.base_fare + fare.total_tax) / 100) * 0.3);
    fare.vendor_price = {
      base_fare: response.totalPriceInfo.totalFareDetail.fC.BF,
      tax: response.totalPriceInfo.totalFareDetail.fC.TAF,
      charge: 0,
      discount: 0,
      gross_fare: response.totalPriceInfo.totalFareDetail.fC.TF,
      net_fare: response.totalPriceInfo.totalFareDetail.fC.TF,
    };
    //currency conversion
    fare.base_fare *= api_currency;
    fare.total_tax *= api_currency;
    fare.payable *= api_currency;
    fare.ait *= api_currency;

    let total_segments = 0;
    flights.map((elm) => {
      elm.options.map((elm2) => {
        total_segments++;
      });
    });

    //calculate tax markup
    //tax fare
    const tax_fare = Object.entries(response.tripInfos[0].totalPriceList[0].fd).map(([paxType, paxInfo]) => {
      const afC = paxInfo.afC?.TAF || {}; // The breakdown of taxes

      // Transform afC into the same format: [{ code, amount }]
      const taxes = Object.entries(afC).map(([code, amount]) => ({
        code,
        amount
      }));

      return taxes;
    });

    let { tax_markup, tax_commission } = await this.flightSupport.calculateFlightTaxMarkup({
      dynamic_fare_supplier_id,
      tax: tax_fare,
      route_type,
      airline: flight_code,
    });
    tax_commission = tax_commission * api_currency;
    tax_markup = tax_markup * api_currency;

    //calculate system markup
    const { markup, commission, pax_markup } = await new CommonFlightSupport(
      this.trx
    ).calculateFlightMarkup({
      dynamic_fare_supplier_id,
      airline: flight_code,
      base_fare: fare.base_fare,
      total_segments: total_segments,
      flight_class: new CommonFlightUtils().getClassFromId(
        reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin
      ),
      route_type,
    });
    const total_pax_markup = pax_markup * pax_count;

    fare.base_fare += markup;
    fare.base_fare += total_pax_markup;
    fare.base_fare += tax_markup;
    fare.discount += commission;
    fare.discount += tax_commission;

    fare.payable =
      Number((Number(fare.base_fare) +
        fare.total_tax +
        fare.ait -
        Number(fare.discount)).toFixed(2));

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
        flight_api_name: TRIPJACK_API,
        airline: flight_code,
        refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
        domestic: true,
      });
    } else if (route_type === ROUTE_TYPE.FROM_DAC) {
      //from dac
      partial_payment = await this.Model.PartialPaymentRuleModel(
        this.trx
      ).getPartialPaymentCondition({
        flight_api_name: TRIPJACK_API,
        airline: flight_code,
        from_dac: true,
        refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
      });
    } else if (route_type === ROUTE_TYPE.TO_DAC) {
      //to dac
      partial_payment = await this.Model.PartialPaymentRuleModel(
        this.trx
      ).getPartialPaymentCondition({
        flight_api_name: TRIPJACK_API,
        airline: flight_code,
        to_dac: true,
        refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
      });
    } else {
      //soto
      partial_payment = await this.Model.PartialPaymentRuleModel(
        this.trx
      ).getPartialPaymentCondition({
        flight_api_name: TRIPJACK_API,
        airline: flight_code,
        refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
        soto: true,
      });
    }

    const newPaxes = passengers.map((exPax) => {
      const per_pax_markup = ((markup + tax_markup) / pax_count) * Number(exPax.number);

      const total_pax_markup = pax_markup * Number(exPax.number);

      const paxBaseFare = per_pax_markup + total_pax_markup;
      return {
        type: exPax.type,
        number: exPax.number,
        fare: {
          base_fare: Number((exPax.fare.base_fare + per_pax_markup).toFixed(2)),
          tax: exPax.fare.tax,
          total_fare: Number((paxBaseFare + exPax.fare.base_fare + exPax.fare.tax).toFixed(2)),
        },
      };
    });

    return {
      flight_id,
      api_search_id: response.bookingId,
      booking_block,
      price_changed,
      leg_description: [],
      partial_payment,
      direct_ticket_issue: response.conditions.isBA === false ? true : false,
      domestic_flight: route_type === ROUTE_TYPE.DOMESTIC,
      journey_type: reqBody.JourneyType,
      api: TRIPJACK_API,
      fare,
      refundable,
      carrier_code: flight_code,
      carrier_name: career.name,
      carrier_logo: career.logo,
      ticket_last_date: '',
      ticket_last_time: '',
      flights,
      passengers: newPaxes,
      availability,
    } as unknown as IFormattedFlightItinerary;
  }

  /////==================FLIGHT REVALIDATE (END)=========================///////

  /////==================FARE RULES (START)=========================///////

  private FlightFareRulesReqFormatter(api_search_id: string) {
    return {
      id: api_search_id,
      flowType: 'SEARCH',
    };
  }

  public async FareRulesService({ api_search_id }: { api_search_id: string }) {
    const reqBody = this.FlightFareRulesReqFormatter(api_search_id);
    const response = await this.request.postRequest(
      TripjackApiEndpoints.FARE_RULES_ENDPOINT,
      reqBody
    );
    if (!response) {
      return false;
    }
    const formatterRes = this.FareRulesResFormatter(response);
    return formatterRes;
  }

  private FareRulesResFormatter(data: any) {
    const fareRuleKey = Object.keys(data?.fareRule ?? {})[0];
    const rule = data?.fareRule?.[fareRuleKey];

    // Format 1: Contains miscInfo
    if (Array.isArray(rule?.miscInfo)) {
      return rule.miscInfo
        .map((rtf: string) => {
          return rtf
            .replace(/\\par(?:\r\n)?/g, '<br>')
            .replace(/\\[a-z]+\d* ?/g, '')
            .replace(/{|}/g, '')
            .replace(/[\r\n]+/g, '');
        })
        .join('<br><br>');
    }

    // Format 2 and 3: Contains tfr
    if (rule?.tfr && typeof rule.tfr === 'object') {
      let paragraph = '';
      for (const [category, policies] of Object.entries(rule.tfr)) {
        paragraph += `<b>${category?.replace(/_/g, ' ')}</b><br>`;
        if (Array.isArray(policies)) {
          for (const policy of policies) {
            const lines: string[] = [];
            if (policy?.pp) lines.push(`When: ${policy.pp}`);
            if (policy?.policyInfo) lines.push(`Policy: ${policy.policyInfo}`);
            if (policy?.amount != null)
              lines.push(`Penalty Amount: ${policy.amount}`);
            if (policy?.additionalFee != null)
              lines.push(`Additional Fee: ${policy.additionalFee}`);
            if (policy?.fcs && typeof policy.fcs === 'object') {
              const fcsDetails = Object.entries(policy.fcs)
                .map(([key, val]) => `${key}: ${val}`)
                .join(', ');
              lines.push(`Fare Components: ${fcsDetails}`);
            }
            paragraph += lines.join('<br>') + '<br><br>';
          }
        }
      }
      return paragraph.trim();
    }

    return false;
  }


  /////==================FARE RULES (END)=========================///////

  /////================FLIGHT BOOKING (START)====================//////////////
  public async FlightBookingService({
    booking_payload,
    revalidate_data,
    direct_issue,
    ssr
  }: {
    booking_payload: IFlightBookingRequestBody;
    revalidate_data: IFormattedFlightItinerary;
    direct_issue: boolean;
    ssr?: {
      passenger_key: number;
      segment_id: string;
      code: string;
      type: "meal" | "baggage";
    }[];
  }) {
    const reqBody = await this.FlightBookingReqFormatter({
      booking_payload,
      revalidate_data,
      direct_issue,
      ssr
    });
    const response = await this.request.postRequest(
      TripjackApiEndpoints.FLIGHT_BOOKING_ENDPOINT,
      reqBody
    );
    if (!response || !response?.status?.success === true) {
      return false;
    }
    return true;
  }

  private async FlightBookingReqFormatter({
    booking_payload,
    revalidate_data,
    direct_issue,
    ssr
  }: {
    booking_payload: IFlightBookingRequestBody;
    revalidate_data: IFormattedFlightItinerary;
    direct_issue: boolean;
    ssr?: {
      passenger_key: number;
      segment_id: string;
      code: string;
      type: "meal" | "baggage";
    }[];
  }) {
    const travellerInfo: ITripjackFlightBookingTravelerPayload[] =
      await Promise.all(
        booking_payload.passengers.map(async (passenger) => {
          let additional_info = undefined;
          if (passenger.passport_number) {
            const nationality: {
              id: number;
              name: string;
              iso: string;
              iso3: string;
            }[] = await this.Model.commonModel(this.trx).getAllCountry({
              id: Number(passenger.nationality),
            });
            additional_info = {
              dob: passenger.date_of_birth,
              pNat: nationality[0].iso,
              pNum: passenger.passport_number,
              eD: passenger.passport_expiry_date,
              pid: passenger.passport_issuing_date
            };
          }

          const passengerSsrs = ssr?.filter(
            (ssr_elm) => String(ssr_elm.passenger_key) === String(passenger.key)
          ) || [];
          let ssrBaggageInfos: { key: string; code: string }[] = [];
          let ssrMealInfos: { key: string; code: string }[] = [];
          if (passengerSsrs.length) {
            passengerSsrs.map((elm) => {
              if (elm.type === 'baggage') {
                ssrBaggageInfos.push({
                  key: elm.segment_id,
                  code: elm.code
                });
              } else if (elm.type === 'meal') {
                ssrMealInfos.push({
                  key: elm.segment_id,
                  code: elm.code
                });
              }
            })
          }

          return {
            ti: this.getTravelerTitle({
              reference: passenger.reference,
              type: passenger.type,
              gender: passenger.gender,
            }),
            fN: passenger.first_name,
            lN: passenger.last_name,
            pt: this.getTravelerType(passenger.type),
            additional_info,
            ssrBaggageInfos,
            ssrMealInfos
          };
        })
      );

    let amount = Number(revalidate_data.fare.vendor_price?.net_fare);
    if (direct_issue) {
      if (ssr && ssr.length) {
        ssr.forEach((ssr_elm) => {
          revalidate_data.flights.forEach((flight) => {
            flight.options.forEach((option) => {
              if (option.id === ssr_elm.segment_id) {
                if (ssr_elm.type === 'meal') {
                  if (option.ssr?.meal && option.ssr?.meal.length) {
                    option.ssr.meal.forEach((meal) => {
                      if (meal.code === ssr_elm.code) {
                        amount += Number(meal.equivalent_amount || 0);
                      }
                    });
                  }
                } else if (ssr_elm.type === 'baggage') {
                  if (option.ssr?.baggage && option.ssr?.baggage.length) {
                    option.ssr.baggage.forEach((baggage) => {
                      if (baggage.code === ssr_elm.code) {
                        amount += Number(baggage.equivalent_amount || 0);
                      }
                    });
                  }
                }
              }
            });
          });
        });
      }
    }

    return {
      bookingId: revalidate_data.api_search_id,
      paymentInfos: direct_issue
        ? [
          {
            amount: amount,
          },
        ]
        : undefined,
      travellerInfo,
      deliveryInfo: {
        emails: [PROJECT_EMAIL_API_1],
        contacts: [booking_payload.passengers[0].contact_number],
      },
    } as ITripjackFlightBookIssuePayload;
  }
  /////================FLIGHT BOOKING (END)====================//////////////

  /////=========TICKET ISSUE (START)============//////////////////
  public async TicketIssueService({
    api_booking_ref,
    vendor_total_price,
  }: {
    api_booking_ref: string;
    vendor_total_price: number;
  }) {
    //phase 1 - confirm fare
    const confirm_fare_response = await this.request.postRequest(
      TripjackApiEndpoints.CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT,
      {
        bookingId: api_booking_ref,
      }
    );
    if (
      !confirm_fare_response ||
      !confirm_fare_response?.status?.success === true
    ) {
      await this.Model.errorLogsModel().insert({
        level: ERROR_LEVEL_WARNING,
        message: 'Error from tripjack while ticket issue',
        url: TripjackApiEndpoints.CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT,
        http_method: 'POST',
        metadata: {
          api: TRIPJACK_API,
          endpoint: TripjackApiEndpoints.CONFIRM_FARE_BEFORE_TICKETING_ENDPOINT,
          payload: {
            bookingId: api_booking_ref,
          },
          response: confirm_fare_response,
        },
      });
      return {
        success: false,
        message: "Fare is not available for this booking. Please contact with the support team for more details!",
        code: this.StatusCode.HTTP_BAD_REQUEST,
      };
    }

    //phase 2 - ticket issue
    const ticket_issue_response = await this.request.postRequest(
      TripjackApiEndpoints.TICKET_ISSUE_ENDPOINT,
      {
        bookingId: api_booking_ref,
        paymentInfos: [
          {
            amount: vendor_total_price,
          },
        ],
      }
    );
    if (
      !ticket_issue_response ||
      !ticket_issue_response?.status?.success === true
    ) {
      await this.Model.errorLogsModel().insert({
        level: ERROR_LEVEL_WARNING,
        message: 'Error from tripjack while ticket issue',
        url: TripjackApiEndpoints.TICKET_ISSUE_ENDPOINT,
        http_method: 'POST',
        metadata: {
          api: TRIPJACK_API,
          endpoint: TripjackApiEndpoints.TICKET_ISSUE_ENDPOINT,
          payload: {
            bookingId: api_booking_ref,
            paymentInfos: [
              {
                amount: vendor_total_price,
              },
            ],
          },
          response: ticket_issue_response,
        },
      });
      return {
        success: false,
        message: "Ticket cannot be issued now. Please contact with the support team for more details!",
        code: this.StatusCode.HTTP_BAD_REQUEST,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Ticket has been issued',
    };
  }
  /////=========TICKET ISSUE (END)============//////////////////

  //////=========RETRIEVE BOOKING(START)==============//////////////
  public async RetrieveBookingService(api_booking_ref: string) {
    const response: ITripjackRetrieveBookingDetailsRes | null =
      await this.request.postRequest(
        TripjackApiEndpoints.RETRIEVE_BOOKING_ENDPOINT,
        {
          bookingId: api_booking_ref,
        }
      );

    if (!response) {
      throw new CustomError(
        'No booking has been found with this ID',
        this.StatusCode.HTTP_NOT_FOUND
      );
    }

    let gds_pnr = undefined;
    let airline_pnr = undefined;
    let ticket_numbers: string[] = [];
    let gross_fare = response.order.amount;

    const travellers = response.itemInfos.AIR.travellerInfos;

    if (travellers && travellers.length > 0) {
      const firstTraveller = travellers[0];

      // Get first gds_pnr if exists
      if (firstTraveller.gdsPnrs) {
        const gdsPnrValues = Object.values(firstTraveller.gdsPnrs);
        if (gdsPnrValues.length > 0) {
          gds_pnr = gdsPnrValues[0];
        }
      }

      // Get unique airline_pnr values
      if (firstTraveller.pnrDetails) {
        const pnrValues = Object.values(firstTraveller.pnrDetails);
        const uniquePnrValues = [...new Set(pnrValues)];
        airline_pnr = uniquePnrValues.join(',');
      }

      // Push first ticket number from each traveller
      travellers.forEach((traveller) => {
        if (traveller.ticketNumberDetails) {
          const ticketValues = Object.values(traveller.ticketNumberDetails);
          if (ticketValues.length > 0) {
            ticket_numbers.push(ticketValues[0]);
          }
        }
      });
    }

    if (!gds_pnr && airline_pnr) {
      gds_pnr = airline_pnr;
    }

    let status = FLIGHT_BOOKING_CONFIRMED;
    if (response.order.status.toUpperCase() === "SUCCESS") {
      status = FLIGHT_TICKET_ISSUE;
    } else if (response.order.status.toUpperCase() === "ON_HOLD") {
      status = FLIGHT_BOOKING_ON_HOLD;
    } else if (response.order.status.toUpperCase() === "CANCELLED") {
      status = FLIGHT_BOOKING_CANCELLED;
    }



    return {
      gds_pnr,
      airline_pnr,
      ticket_numbers,
      gross_fare,
      status
    };
  }

  public async pnrShareService(api_booking_ref: string, dynamic_fare_supplier_id: number) {
    const response: ITripjackRetrieveBookingDetailsRes | null =
      await this.request.postRequest(
        TripjackApiEndpoints.RETRIEVE_BOOKING_ENDPOINT,
        {
          bookingId: api_booking_ref,
        }
      );

    if (!response) {
      throw new CustomError(
        'No booking has been found with this ID',
        this.StatusCode.HTTP_NOT_FOUND
      );
    }

    const commonModel = this.Model.commonModel(this.trx);

    const airports: string[] = [];
    let total_segments = 0;
    const leg_description = response?.itemInfos?.AIR?.tripInfos.map((item) => {
      const firstAirport = item.sI[0].da.code;
      const lastAirport = item.sI[item.sI.length - 1].aa.code;
      total_segments += item.sI.length;
      airports.push(firstAirport);
      airports.push(lastAirport);
      return {
        departureLocation: firstAirport,
        arrivalLocation: lastAirport,
        departureDate: item.sI[0].dt,
      };
    });

    const route_type = this.flightSupport.routeTypeFinder({
      airportsPayload: airports,
    });

    const airline_code = response?.itemInfos?.AIR?.tripInfos[0]?.sI[0]?.fD?.aI?.code;



    //fare
    const api_currency = await this.Model.CurrencyModel(
      this.trx
    ).getApiWiseCurrencyByName(TRIPJACK_API, 'FLIGHT');
    const { markup, commission, pax_markup } =
      await this.flightSupport.calculateFlightMarkup({
        dynamic_fare_supplier_id,
        airline: airline_code,
        flight_class: response?.itemInfos?.AIR?.travellerInfos[0]?.fd?.cc,
        base_fare: Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.BF) * api_currency,
        total_segments,
        route_type,
      });

    const ait = Math.round(
      ((Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.TF) * api_currency) / 100) * 0.3
    );
    const fare = {
      base_fare:
        (Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.BF) * api_currency) + markup + pax_markup,
      total_tax: (Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.TAF) * api_currency),
      ait,
      discount: commission,
      payable:
        (Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.TF) * api_currency) +
        markup +
        ait +
        pax_markup -
        commission,
      vendor_price: {
        base_fare: Number(
          response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.BF
        ),
        tax: Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.TAF),
        charge: 0,
        discount: 0,
        gross_fare: Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.TF),
        net_fare: Number(response?.itemInfos?.AIR?.totalPriceInfo.totalFareDetail?.fC?.NF),
      },
    };

    const flights = await Promise.all(
      response?.itemInfos?.AIR?.tripInfos.map(async (journey, journeyIndex) => {
        const flightGroup = journey.sI;

        const options = await Promise.all(
          flightGroup.map(async (flight, index) => {
            // Using the direct data from payload — so no DB call unless you need it
            // But I’ll keep your `commonModel` usage if you still want live DB data
            const dAirport = await commonModel.getAirportDetails(flight.da.code);
            const aAirport = await commonModel.getAirportDetails(flight.aa.code);

            return {
              id: index + 1,
              elapsedTime: flight.duration,
              stopCount: flight.stops,
              total_miles_flown: null, // Not present in this payload
              departure: {
                airport_code: flight.da.code,
                city_code: flight.da.cityCode,
                airport: dAirport.airport_name,
                city: dAirport.city_name,
                country: dAirport.country,
                terminal: flight.da.terminal || null,
                time: flight.dt.split("T")[1],
                date: flight.dt.split("T")[0],
              },
              arrival: {
                airport_code: flight.aa.code,
                city_code: flight.aa.cityCode,
                airport: aAirport.airport_name,
                city: aAirport.city_name,
                country: aAirport.country,
                terminal: flight.aa.terminal || null,
                time: flight.at.split("T")[1],
                date: flight.at.split("T")[0],
              },
              carrier: {
                carrier_marketing_code: flight.fD.aI.code,
                carrier_marketing_airline: flight.fD.aI.name,
                carrier_marketing_logo: "",
                carrier_marketing_flight_number: String(flight.fD.fN),
                carrier_operating_code: flight.fD.aI.code,
                carrier_operating_airline: flight.fD.aI.name,
                carrier_operating_logo: "",
                carrier_operating_flight_number: String(flight.fD.fN),
                carrier_aircraft_code: flight.fD.eT,
                carrier_aircraft_name: "",
              },
            };
          })
        );

        return {
          id: journeyIndex + 1,
          stoppage: options.length - 1,
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
                return Math.floor(layover / 60000);
              })
              : [0],
          options,
        };
      })
    );

    const availability = response?.itemInfos.AIR.tripInfos.map((journey) => {
      return {
        from_airport: journey.sI[0].da.code,
        to_airport: journey.sI[journey.sI.length - 1].aa.code,
        segments: journey.sI.map((segment, index) => {
          const traveler = response?.itemInfos.AIR.travellerInfos[0];
          const routeKey = `${segment.da.code}-${segment.aa.code}`;

          const baggage = traveler.fd?.bI?.iB || "0KG";

          return {
            name: `Segment-${index + 1}`,
            passenger: [
              {
                type: traveler.pt, // e.g., ADULT
                count: 1,
                cabin_code: traveler.fd?.cc,
                cabin_type: traveler.fd?.cB, // e.g., 'T'
                booking_code: traveler.fd?.fB, // e.g., 'TU2YXRDC'
                available_seat: null,
                available_break: true,
                baggage_info: baggage,
              },
            ],
          };
        }),
      };
    });

    //passengers fare
    const travelerTypeCounts: Record<string, number> = {};
    response?.itemInfos.AIR.travellerInfos.forEach((traveler) => {
      let type = traveler.pt;

      if (type.toUpperCase().startsWith("C")) {
        type = "CHILD";
      }

      if (!travelerTypeCounts[type]) {
        travelerTypeCounts[type] = 0;
      }
      travelerTypeCounts[type]++;
    });

    const passengers = [];

    for (const [type, number] of Object.entries(travelerTypeCounts)) {
      const fareMatchType = type;

      const fare = response?.itemInfos.AIR.travellerInfos.find(
        (traveler) => traveler.pt === fareMatchType
      );

      if (fare) {
        const subtotal = fare.fd.fC.BF; // base fare
        const tax = Number(fare.fd.fC.TF) - Number(fare.fd.fC.BF);
        const total = fare.fd.fC.TF;

        passengers.push({
          type,
          number,
          fare: {
            base_fare: Number(subtotal),
            tax,
            total_fare: total,
          },
        });
      }
    }

    let journey_type = "3"; // default MULTICITY

    const journeys = response?.itemInfos.AIR.tripInfos;

    if (journeys.length === 1) {
      journey_type = "1"; // ONEWAY
    } else if (
      journeys.length === 2 &&
      journeys[0].sI[journeys[0].sI.length - 1].aa.code === journeys[1].sI[0].da.code &&
      journeys[0].sI[0].da.code === journeys[1].sI[journeys[1].sI.length - 1].aa.code
    ) {
      journey_type = "2"; // RETURN
    }

    //pnr
    let gds_pnr = "N/A";
    let airline_pnr = "N/A";

    if (response.itemInfos.AIR.travellerInfos && response.itemInfos.AIR.travellerInfos.length > 0) {
      const firstTraveller = response.itemInfos.AIR.travellerInfos[0];

      // Get first gds_pnr if exists
      if (firstTraveller.gdsPnrs) {
        const gdsPnrValues = Object.values(firstTraveller.gdsPnrs);
        if (gdsPnrValues.length > 0) {
          gds_pnr = gdsPnrValues[0];
        }
      }

      // Get unique airline_pnr values
      if (firstTraveller.pnrDetails) {
        const pnrValues = Object.values(firstTraveller.pnrDetails);
        const uniquePnrValues = [...new Set(pnrValues)];
        airline_pnr = uniquePnrValues.join(',');
      }
    }

    if (!gds_pnr && airline_pnr) {
      gds_pnr = airline_pnr;
    }

    let status = FLIGHT_BOOKING_CONFIRMED;
    if (response.order.status.toUpperCase() === "SUCCESS") {
      status = FLIGHT_TICKET_ISSUE;
    } else if (response.order.status.toUpperCase() === "ON_HOLD") {
      status = FLIGHT_BOOKING_ON_HOLD;
    } else if (response.order.status.toUpperCase() === "CANCELLED") {
      status = FLIGHT_BOOKING_CANCELLED;
    }

    const passenger_data = await Promise.all(
      response?.itemInfos.AIR.travellerInfos.map(async (traveler, ind) => {
        const givenName = traveler.fN;
        const reference = traveler.ti;

        const date_of_birth = traveler.dob;
        const gender = reference?.toLowerCase() === "mr" ? "Male" : "Female";

        const passport_number = traveler.pNum;
        const passport_expiry_date = traveler.eD;
        const nationality = traveler.pNat;
        const issuing_country = traveler.pNat;

        const issuing_country_data = await commonModel.getCountryByIso({
          iso3: issuing_country,
        });
        const nationality_data = await commonModel.getCountryByIso({
          iso3: nationality,
        });

        // ✅ FIX: map type correctly
        let passengerType: "ADT" | "CHD" | "INF";
        switch (traveler.pt.toUpperCase()) {
          case "ADULT":
            passengerType = "ADT";
            break;
          case "CHILD":
            passengerType = "CHD";
            break;
          case "INFANT":
            passengerType = "INF";
            break;
          default:
            passengerType = "ADT"; // fallback
        }

        return {
          key: String(ind),
          type: passengerType, // ✅ corrected type
          reference: reference as "Mr" | "Mrs" | "Ms" | "Miss" | "MSTR",
          first_name: givenName,
          last_name: traveler.lN,
          phone: "",
          date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
          gender: gender as "Male" | "Female",
          email: "",
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
        price_changed: false,
        partial_payment: {
          partial_payment: false,
          payment_percentage: 100,
          travel_date_from_now: 0,
        },
        direct_ticket_issue: false,
        booking_block: false,
        domestic_flight: false,
        journey_type,
        api: TRIPJACK_API,
        fare,
        refundable: Boolean(response?.itemInfos?.AIR?.travellerInfos?.[0]?.fd?.rT),
        carrier_code: "",
        carrier_name: "",
        carrier_logo: "",
        ticket_last_date: "",
        ticket_last_time: "",
        flights,
        passengers,
        availability,
        leg_description,
      } as unknown as IFormattedFlightItinerary,
      gds_pnr,
      airline_pnr,
      last_time: null,
      status,
      passenger_data,
    };



  }
  //////=========RETRIEVE BOOKING(END)==============//////////////

  /////////==========CANCEL BOOKING(START)==============///////////
  public async CancelBookingService(
    api_booking_ref: string,
    airline_pnr: string
  ) {
    const pnrs = airline_pnr.split(',');
    const response = await this.request.postRequest(
      TripjackApiEndpoints.CANCEL_BOOKING_ENDPOINT,
      {
        bookingId: api_booking_ref,
        pnrs,
      }
    );

    if (!response || !response?.status?.success === true) {
      throw new CustomError(
        'Booking cannot be cancelled now. Please contact with the support team for more details!',
        this.StatusCode.HTTP_BAD_REQUEST
      );
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Booking has been cancelled',
    };
  }
  /////////==========CANCEL BOOKING(END)==============///////////

  /////////utils/////////////
  private combineFareDetails(
    fare1?: IFareDetails,
    fare2?: IFareDetails
  ): IFareDetails | undefined {
    if (!fare1 && !fare2) return undefined;
    if (!fare1) return fare2;
    if (!fare2) return fare1;

    return {
      ...fare1,
      fC: {
        NF: (fare1.fC?.NF ?? 0) + (fare2.fC?.NF ?? 0),
        BF: (fare1.fC?.BF ?? 0) + (fare2.fC?.BF ?? 0),
        TAF: (fare1.fC?.TAF ?? 0) + (fare2.fC?.TAF ?? 0),
        TF: (fare1.fC?.TF ?? 0) + (fare2.fC?.TF ?? 0),
      },
      afC: {
        TAF: {
          YQ: (fare1.afC?.TAF?.YQ ?? 0) + (fare2.afC?.TAF?.YQ ?? 0),
          YR: (fare1.afC?.TAF?.YR ?? 0) + (fare2.afC?.TAF?.YR ?? 0),
          OT: (fare1.afC?.TAF?.OT ?? 0) + (fare2.afC?.TAF?.OT ?? 0),
        },
      },
      sR: Math.min(fare1.sR ?? Infinity, fare2.sR ?? Infinity),
      bI: {
        iB: fare1.bI?.iB || fare2.bI?.iB,
        cB: fare1.bI?.cB || fare2.bI?.cB,
      },
      rT: 1,
      cc: fare1.cc,
      cB: fare1.cB,
      fB: fare1.fB,
    };
  }

  private combineDynamicLegs(
    tripInfos: ITripjackFlightSearchResBody['searchResult']['tripInfos'],
    dynamicKeys: string[]
  ): ITripjackFlightSearchResults[] {
    const allLegFlights = dynamicKeys.map((k) => tripInfos[k] || []);

    const combinations: ITripjackFlightSearchResults[] = [];

    const buildCombination = (
      level: number,
      currentSegments: IFlightSegmentInfo[],
      currentPrices: ITripjackFlightResTotalPriceList[],
      lastArrival?: string
    ) => {
      if (level === allLegFlights.length) {
        combinations.push({
          sI: currentSegments,
          totalPriceList: currentPrices,
          airFlowType: 'SEARCH',
        });
        return;
      }

      for (const flight of allLegFlights[level]) {
        const firstSegment = flight.sI[0];
        if (
          lastArrival &&
          new Date(firstSegment.dt).getTime() <= new Date(lastArrival).getTime()
        ) {
          continue; // skip invalid (departure before last arrival)
        }

        const lastSeg = flight.sI[flight.sI.length - 1];
        const updatedSegments = [...currentSegments, ...flight.sI];
        const combinedPrices = this.combinePriceLists(
          currentPrices,
          flight.totalPriceList
        );

        buildCombination(
          level + 1,
          updatedSegments,
          combinedPrices,
          lastSeg.at
        );
      }
    };

    for (const flight of allLegFlights[0]) {
      const lastSeg = flight.sI[flight.sI.length - 1];
      buildCombination(
        1,
        [...flight.sI],
        [...flight.totalPriceList],
        lastSeg.at
      );
    }

    return combinations.slice(0, 10); // Limit for testing
  }

  // Helper to combine totalPriceList arrays
  private combinePriceLists(
    prices1: ITripjackFlightResTotalPriceList[],
    prices2: ITripjackFlightResTotalPriceList[]
  ): ITripjackFlightResTotalPriceList[] {
    const result: ITripjackFlightResTotalPriceList[] = [];

    for (const p1 of prices1) {
      for (const p2 of prices2) {
        if (!p1.fd || !p2.fd) continue;

        result.push({
          ...p1,
          fd: {
            ADULT: this.combineFareDetails(p1.fd.ADULT, p2.fd.ADULT),
            CHILD: this.combineFareDetails(p1.fd.CHILD, p2.fd.CHILD),
            INFANT: this.combineFareDetails(p1.fd.INFANT, p2.fd.INFANT),
          },
          fareIdentifier: `${p1.fareIdentifier}+${p2.fareIdentifier}`,
          id: `${p1.id},${p2.id}`,
        });
      }
    }

    return result;
  }

  //get traveler title
  private getTravelerTitle({
    reference,
    type,
    gender,
  }: {
    reference: 'Mr' | 'Ms' | 'Mrs' | 'Miss' | 'MSTR';
    type:
    | 'ADT'
    | 'C02'
    | 'C03'
    | 'C04'
    | 'C05'
    | 'C06'
    | 'C07'
    | 'C08'
    | 'C09'
    | 'C10'
    | 'C11'
    | 'CHD'
    | 'INF';
    gender: 'Male' | 'Female';
  }): 'Mr' | 'Mrs' | 'Ms' | 'Master' {
    if (type === 'ADT') {
      return reference as 'Mr' | 'Mrs' | 'Ms';
    } else {
      if (gender === 'Male') {
        return 'Master';
      } else {
        return 'Ms';
      }
    }
  }

  //get traveler type
  private getTravelerType(type: string): 'ADULT' | 'INFANT' | 'CHILD' {
    if (type === 'ADT') {
      return 'ADULT';
    } else if (type === 'INF') {
      return 'INFANT';
    } else {
      return 'CHILD';
    }
  }
}
