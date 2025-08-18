import { Knex } from 'knex';
import { DateTime, Duration } from 'luxon';
import AbstractServices from '../../../abstract/abstract.service';
import { getRedis, setRedis } from '../../../app/redis';
import CustomError from '../../lib/customError';
import FlightUtils from '../../lib/flightLib/commonFlightUtils';
import VerteilRequests from '../../lib/flightLib/verteilRequest';
import { BD_AIRPORT, ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
import {
  FLIGHT_TICKET_ISSUE,
  ROUTE_TYPE,
  VERTEIL_API,
} from '../../miscellaneous/flightMiscellaneous/flightConstants';
import VerteilAPIEndpoints from '../../miscellaneous/flightMiscellaneous/verteilApiEndpoints';
import {
  IFlightAvailability,
  IFlightDataAvailabilityPassenger,
  IFlightDataAvailabilitySegment,
  IFlightSearchReqBody,
  IFormattedArrival,
  IFormattedCarrier,
  IFormattedDeparture,
  IFormattedFlight,
  IFormattedFlightItinerary,
  IFormattedFlightOption,
} from '../../supportTypes/flightSupportTypes/commonFlightTypes';
import * as Interfaces from '../../supportTypes/flightSupportTypes/verteilFlightTypes';
import { VerteilFlightUtils } from '../../lib/flightLib/verteilFlightUtils';
import { IFlightBookingPassengerReqBody } from '../../supportTypes/flightBookingTypes/commonFlightBookingTypes';
import { CommonFlightSupport } from './commonFlightSupport.service';
import CommonFlightUtils from '../../lib/flightLib/commonFlightUtils';
import { IGetAirlinesPreferenceQuery } from '../../interfaces/dynamicFareRulesModelInterface/airlinesPreferenceModel.interface';
import Lib from '../../lib/lib';

export default class VerteilFlightService extends AbstractServices {
  private request = new VerteilRequests();
  private trx: Knex.Transaction;
  private flightSupport: CommonFlightSupport;
  private flightUtils = new FlightUtils();

  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
    this.flightSupport = new CommonFlightSupport(trx);
  }

  private applyDecimal(amount: number, decimals: number = 0): number {
    return amount / Math.pow(10, decimals);
  }

  // Flight Search (start)//
  private flightSearchRequestFormatter(
    body: IFlightSearchReqBody,
    dealCodes?: any[]
  ): Interfaces.IVerteilFlightSearchRQ {
    const CTC = body.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin;

    let deal_code = undefined;
    if (dealCodes?.length) {
      deal_code = dealCodes.map((item) => item.deal_code).join(',');
    }

    return {
      Party: deal_code ? { Sender: { CorporateSender: { CorporateCode: deal_code } } } : undefined,
      Preference: {
        CabinPreferences: {
          CabinType: [
            {
              PrefLevel: {
                PrefLevelCode: 'Preferred',
              },
              Code: CTC === '4' ? 'F' : CTC === '3' ? 'C' : CTC === '2' ? 'W' : 'Y', // Economy-Y PremiumEconomy-W BusinessClass-C FirstClass-F
            },
          ],
        },
        FarePreferences: {
          Types: {
            Type: [
              {
                Code: 'PUBL',
              },
              {
                Code: 'PVT',
              },
            ],
          },
        },
      },
      ResponseParameters: {
        SortOrder: [
          {
            Order: 'ASCENDING',
            Parameter: 'PRICE',
          },
        ],
        ShopResultPreference: 'BEST',
        ResultsLimit: { value: 100 },
      },
      Travelers: {
        Traveler: body.PassengerTypeQuantity.flatMap((item) =>
          Array.from({ length: item.Quantity }, () =>
            item.Code === 'ADT'
              ? { AnonymousTraveler: [{ PTC: { value: 'ADT' } }] }
              : item.Code === 'INF'
                ? { AnonymousTraveler: [{ PTC: { value: 'INF' } }] }
                : {
                  AnonymousTraveler: [{ PTC: { value: 'CHD' }, Age: { Value: { value: 11 } } }],
                }
          )
        ),
      },
      //   EnableGDS: false, // Can be removed or should be set as false always
      CoreQuery: {
        OriginDestinations: {
          OriginDestination: body.OriginDestinationInformation.map((leg) => ({
            Departure: {
              AirportCode: {
                value: leg.OriginLocation.LocationCode,
              },
              Date: leg.DepartureDateTime.split('T')[0],
            },
            Arrival: {
              AirportCode: {
                value: leg.DestinationLocation.LocationCode,
              },
            },
            OriginDestinationKey: `LEG-${leg.RPH}`,
          })),
        },
      },
    };
  }

  // Flight search service
  public async FlightSearchService({
    booking_block,
    reqBody,
    search_id,
    dynamic_fare_supplier_id,
  }: {
    reqBody: IFlightSearchReqBody;
    booking_block: boolean;
    search_id: string;
    dynamic_fare_supplier_id: number;
  }) {
    const route_type = this.flightSupport.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });

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

    //preferred airlines
    const cappingAirlines: { Code: string }[] = await AirlinesPrefModel.getAirlinePrefCodes(
      prefAirlinesQuery
    );

    const PreferredAirlines: string[] = cappingAirlines.map((elm) => elm.Code);

    let finalAirlineCodes: string[] = [];

    if (reqBody.airline_code?.length) {
      const reqAirlineCodes = reqBody.airline_code.map((elm) => elm.Code);

      if (PreferredAirlines.length) {
        // Take common values between preferred and requested airlines
        finalAirlineCodes = reqAirlineCodes.filter((code) => PreferredAirlines.includes(code));
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

    // Convert to comma-separated string
    const airlineCodesCsv = finalAirlineCodes.join(',');
    //deal code
    const dealCodes = await this.Model.DealCodeModel(this.trx).getAll({
      api: VERTEIL_API,
      status: true,
    });

    const AirShoppingRQ = this.flightSearchRequestFormatter(
      reqBody,
      dealCodes.data.length ? dealCodes.data : undefined
    );

    // console.log('AirShoppingRQ', JSON.stringify(AirShoppingRQ, null, 2));

    const AirShoppingRS = await this.request.postRequest(
      VerteilAPIEndpoints.FLIGHT_SEARCH_ENDPOINT,
      AirShoppingRQ,
      airlineCodesCsv ? { headers: { ThirdpartyId: airlineCodesCsv } } : undefined
    );
    // const AirShoppingRS = await this.request.postRequest<
    //     Interfaces.IVerteilFlightSearchRQ,
    //     Interfaces.IVerteilFlightSearchRS
    // >("AirShopping", AirShoppingRQ);

    if (!AirShoppingRS) {
      return [];
    }

    // console.log('AirShoppingRS', JSON.stringify(AirShoppingRS, null, 2));

    const hasAtLeastOneOffer =
      AirShoppingRS.OffersGroup?.AirlineOffers[0]?.AirlineOffer?.length > 0;

    if (AirShoppingRS.Errors && !hasAtLeastOneOffer) return [];
    if (!hasAtLeastOneOffer) {
      return [];
    }

    const result = await this.FlightSearchResFormatter({
      data: AirShoppingRS,
      reqBody: reqBody,
      booking_block,
      dynamic_fare_supplier_id,
      route_type,
    });

    {
      const flightPriceRQs = await new VerteilFlightUtils().PrepareMetaDataForFlightPrice(
        reqBody,
        result,
        AirShoppingRS,
        AirShoppingRQ
      );

      setRedis(`VerteilFlightPriceRQs-${search_id}`, flightPriceRQs, 900);
    }

    return result;
  }

  private async FlightSearchResFormatter({
    dynamic_fare_supplier_id,
    booking_block,
    data,
    reqBody,
    route_type,
  }: {
    data: Interfaces.IVerteilFlightSearchRS;
    reqBody: IFlightSearchReqBody;
    dynamic_fare_supplier_id: number;
    booking_block: boolean;
    route_type: 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' | 'SOTO';
  }): Promise<IFormattedFlightItinerary[]> {
    const commonModel = this.Model.commonModel(this.trx);
    const AirlinesPreferenceModel = this.Model.AirlinesPreferenceModel(this.trx);
    const api_currency = await this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(
      VERTEIL_API,
      'FLIGHT'
    );

    // convert any Child aged value to CHD
    reqBody.PassengerTypeQuantity.forEach((PTQ) => {
      if (PTQ.Code.startsWith('C')) PTQ.Code = 'CHD';
    });

    const leg_description = reqBody.OriginDestinationInformation.map((OrDeInfo) => {
      return {
        departureDate: OrDeInfo.DepartureDateTime,
        departureLocation: OrDeInfo.OriginLocation.LocationCode,
        arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
      };
    });

    const getBlockedAirlinesPayload: IGetAirlinesPreferenceQuery = {
      dynamic_fare_supplier_id,
      pref_type: 'BLOCKED',
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

    const blockedAirlines: { Code: string }[] = await AirlinesPreferenceModel.getAirlinePrefCodes(
      getBlockedAirlinesPayload
    );

    const FormattedResponseList = [];

    for (const Offer of data.OffersGroup.AirlineOffers[0].AirlineOffer) {
      try {
        const airlineCode = Offer.OfferID.Owner;

        if (blockedAirlines.find((ba) => ba.Code === airlineCode)) {
          continue;
        }

        const airlineInfo = await commonModel.getAirlines(airlineCode);

        //=== Flights Construction ===//
        const Associations = Offer.PricedOffer.Associations;
        const FormattedFlights = await Promise.all(
          Associations.map(async (Association) => {
            const priceClassRef = Association.PriceClass.PriceClassReference;

            const SegmentRefs = Association.ApplicableFlight.FlightSegmentReference;

            //=== Options array construction ===//
            const FormattedFlightOptions = await Promise.all(
              SegmentRefs.map(async (segRef) => {
                const FlightSegment = data.DataLists.FlightSegmentList.FlightSegment.find(
                  (item) => item.SegmentKey === segRef.ref
                );
                if (!FlightSegment)
                  throw new Error(
                    `Fatal: Verteil API FlightSegment with key "${segRef.ref}" not found.`
                  );

                const dAirport = await commonModel.getAirportDetails(
                  FlightSegment.Departure.AirportCode.value
                );
                const aAirport = await commonModel.getAirportDetails(
                  FlightSegment.Arrival.AirportCode.value
                );
                const marketing_airline = await commonModel.getAirlines(
                  FlightSegment.MarketingCarrier.AirlineID.value
                );
                const operating_airline = await commonModel.getAirlines(
                  FlightSegment.OperatingCarrier?.AirlineID?.value || ''
                );
                const aircraft = await commonModel.getAircraft(
                  FlightSegment.Equipment?.AircraftCode?.value || ''
                );

                const departure: IFormattedDeparture = {
                  airport_code: FlightSegment.Departure.AirportCode.value,
                  airport: dAirport.airport_name,
                  city: dAirport.city_name,
                  city_code: dAirport.city_code,
                  country: dAirport.country,
                  terminal: FlightSegment.Departure.Terminal?.Name || '',
                  time:
                    FlightSegment.Departure.Time +
                    ':00' +
                    `${dAirport.time_zone
                      ? DateTime.now().setZone(dAirport.time_zone).toFormat('ZZ')
                      : ''
                    }`, // HH:MM -> HH:MM:00
                  date: FlightSegment.Departure.Date.slice(0, 10), // YYYY-MM-DDT00-00-00.000 -> YYYY-MM-DD
                };

                const arrival: IFormattedArrival = {
                  date_adjustment: FlightSegment.Arrival.ChangeOfDay,
                  airport_code: FlightSegment.Arrival.AirportCode.value,
                  airport: aAirport.airport_name,
                  city: aAirport.city_name,
                  city_code: aAirport.city_code,
                  country: aAirport.country,
                  terminal: FlightSegment.Arrival.Terminal?.Name || '',
                  time:
                    FlightSegment.Arrival.Time +
                    ':00' +
                    `${aAirport.time_zone
                      ? DateTime.now().setZone(aAirport.time_zone).toFormat('ZZ')
                      : ''
                    }`, // HH:MM -> HH:MM:00
                  date: FlightSegment.Arrival.Date.slice(0, 10), // YYYY-MM-DDT00-00-00.000 -> YYYY-MM-DD
                };

                const carrier: IFormattedCarrier = {
                  carrier_marketing_code: FlightSegment.MarketingCarrier.AirlineID.value,
                  carrier_marketing_airline: marketing_airline.name,
                  carrier_marketing_logo: marketing_airline.logo,
                  carrier_marketing_flight_number:
                    FlightSegment.MarketingCarrier.FlightNumber.value,
                  carrier_operating_code: FlightSegment.OperatingCarrier?.AirlineID?.value || '',
                  carrier_operating_airline: operating_airline.name,
                  carrier_operating_logo: operating_airline.logo,
                  carrier_operating_flight_number: '',
                  carrier_aircraft_code: aircraft.code,
                  carrier_aircraft_name: aircraft.name,
                };

                let elapsed_time: number;
                {
                  const SegmentDuration = FlightSegment.FlightDetail?.FlightDuration.Value;
                  if (SegmentDuration) {
                    elapsed_time = Duration.fromISO(SegmentDuration).as('minutes');
                  } else {
                    const dDt = DateTime.fromISO(departure.date + 'T' + departure.time);
                    const aDt = DateTime.fromISO(arrival.date + 'T' + arrival.time);
                    elapsed_time = aDt.diff(dDt, 'minutes').minutes;
                  }
                }

                const FormattedFlightOption: IFormattedFlightOption = {
                  id: segRef.ref,
                  elapsedTime: elapsed_time,
                  departure,
                  arrival,
                  carrier,
                };

                return FormattedFlightOption;
              })
            );
            const targetSegmentRefs = SegmentRefs.map((seg) => seg.ref)
              .sort()
              .join(',');

            const FLightInfo = data.DataLists.FlightList?.Flight.find((item) => {
              const flightKeyMatch =
                item.FlightKey === Association.ApplicableFlight.FlightReferences.value[0];
              const segmentValues = item.SegmentReferences?.value ?? [];
              const segmentMatch =
                segmentValues.length === SegmentRefs.length &&
                segmentValues.sort().join(',') === targetSegmentRefs;

              return flightKeyMatch && segmentMatch;
            });

            if (!FLightInfo)
              throw new Error(
                `Fatal: Verteil API FLightInfo with key "${Association.ApplicableFlight.FlightReferences.value[0]}" not found.`
              );

            let flightElapsedTime: number | undefined = undefined;
            if (FLightInfo?.Journey) {
              const FlightDuration = FLightInfo.Journey.Time;
              flightElapsedTime = Duration.fromISO(FlightDuration).as('minutes');
            }

            // const PriceClassInfo =
            //     data.DataLists.PriceClassList?.PriceClass.find(
            //         (PC) => PC.ObjectKey === priceClassRef
            //     );

            const FormattedFlight: IFormattedFlight = {
              id: FLightInfo?.FlightKey,
              elapsed_time: flightElapsedTime,
              stoppage: FormattedFlightOptions.length - 1,
              // price_class_code: PriceClassInfo?.Code,
              // price_class_name: PriceClassInfo?.Name,
              layover_time: new FlightUtils().getNewLayoverTime(FormattedFlightOptions),
              options: FormattedFlightOptions,
            };

            return FormattedFlight;
          })
        );

        //=== Availability Construction ===//
        const FormattedAvailability = Associations.map(
          // Flight LEG
          (Association, AssociationIndex) => {
            const originDestRef = Association.ApplicableFlight.OriginDestinationReferences[0];
            const OriginDestination = data.DataLists.OriginDestinationList.OriginDestination.find(
              (od) => od.OriginDestinationKey === originDestRef
            );

            if (!OriginDestination)
              throw new Error(
                `Fatal: Verteil API OriginDestination with key "${originDestRef}" not found.`
              );

            const from_airport = OriginDestination.DepartureCode.value;
            const to_airport = OriginDestination.ArrivalCode.value;

            const SegmentRefs = Association.ApplicableFlight.FlightSegmentReference; // Segments for this LEG

            const FormattedSegments = SegmentRefs.map(
              // Single Segment
              (Segment, SegmentIndex) => {
                // Passenger Types for this Segment
                const FormattedPassengers = Offer.PricedOffer.OfferPrice.map(
                  // Single Passenger Type
                  (OfferPrice) => {
                    const travelerRef =
                      OfferPrice.RequestedDate.Associations[0].AssociatedTraveler
                        .TravelerReferences[0];
                    const TravelerInfo =
                      data.DataLists.AnonymousTravelerList?.AnonymousTraveler.find(
                        (tr) => tr.ObjectKey === travelerRef
                      );

                    if (!TravelerInfo)
                      throw new Error(
                        `Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`
                      );

                    let baggage_count: number | null = null;
                    let baggage_unit: string | null = null;

                    const OfferPriceSegment =
                      OfferPrice.RequestedDate.Associations[AssociationIndex]?.ApplicableFlight
                        .FlightSegmentReference[SegmentIndex];

                    if (OfferPriceSegment && OfferPriceSegment.BagDetailAssociation) {
                      const CarryOnReferences = // this is hand baggage
                        OfferPriceSegment.BagDetailAssociation.CarryOnReferences;
                      const CheckedBagReferences =
                        OfferPriceSegment.BagDetailAssociation.CheckedBagReferences;

                      if (CheckedBagReferences) {
                        const filteredBagAllowance =
                          data.DataLists.CheckedBagAllowanceList?.CheckedBagAllowance.filter(
                            (item) => CheckedBagReferences.includes(item.ListKey)
                          );

                        if (filteredBagAllowance) {
                          const firstBaggage = filteredBagAllowance[0];
                          if (
                            firstBaggage &&
                            firstBaggage.PieceAllowance &&
                            firstBaggage.PieceAllowance.length
                          ) {
                            if (firstBaggage.WeightAllowance) {
                              const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                              baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                              baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                            } else {
                              baggage_unit = 'pieces';
                              baggage_count = firstBaggage.PieceAllowance[0].TotalQuantity;
                            }
                          } else {
                            if (firstBaggage.WeightAllowance) {
                              const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                              baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                              baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                            } else {
                              baggage_unit = 'pieces';
                              baggage_count = 0;
                            }
                          }
                        }
                      }
                    }

                    const FormattedPassenger: IFlightDataAvailabilityPassenger = {
                      type: TravelerInfo.PTC.value,
                      count:
                        reqBody.PassengerTypeQuantity.find(
                          (PTQ) => PTQ.Code === TravelerInfo.PTC.value
                        )?.Quantity || 0,
                      cabin_code: Segment.ClassOfService.MarketingName.CabinDesignator,
                      cabin_type: Segment.ClassOfService.MarketingName.value,
                      booking_code: Segment.ClassOfService.Code?.value,
                      available_seat: Segment.ClassOfService.Code?.SeatsLeft,
                      meal_code: undefined,
                      meal_type: undefined,
                      available_break: undefined,
                      available_fare_break: undefined,
                      baggage_info: `${baggage_count} ${baggage_unit}`,
                    };

                    return FormattedPassenger;
                  }
                );

                const FormattedSegment: IFlightDataAvailabilitySegment = {
                  name: `Segment-${SegmentIndex + 1}`,
                  passenger: FormattedPassengers,
                };

                return FormattedSegment;
              }
            );

            const Availability: IFlightAvailability = {
              from_airport,
              to_airport,
              segments: FormattedSegments,
            };

            return Availability;
          }
        );

        //=== Passengers Fare Construction ==//
        let totalBaseFare = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        let pax_count = 0;
        let totalConFee = 0;
        let total_amount = 0;

        let tax_fare: { code: string, amount: number }[][] = [];

        reqBody.PassengerTypeQuantity.forEach((reqPax) => {
          pax_count += reqPax.Quantity;
        });

        const FormattedPassengers = Offer.PricedOffer.OfferPrice.map((OfferPrice) => {
          const travelerRef =
            OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences[0];
          const TravelerInfo = data.DataLists.AnonymousTravelerList?.AnonymousTraveler.find(
            (tr) => tr.ObjectKey === travelerRef
          );

          if (!TravelerInfo)
            throw new Error(`Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`);

          const paxCount = reqBody.PassengerTypeQuantity.filter(
            (PTQ) => PTQ.Code[0] === TravelerInfo.PTC.value[0]
          ).reduce((sum, PTQ) => sum + PTQ.Quantity, 0);
          const PriceDetail = OfferPrice.RequestedDate.PriceDetail;
          const baseFare = PriceDetail.BaseAmount.value;
          const tax = PriceDetail.Taxes?.Total.value || 0;
          const surcharge =
            PriceDetail.Surcharges?.Surcharge.reduce((sum, item) => {
              return sum + (item.Total?.value ?? 0);
            }, 0) || 0;
          const discount =
            PriceDetail.Discount?.reduce((sum, item) => {
              return sum + (item.DiscountAmount?.value ?? 0);
            }, 0) || 0;

          totalBaseFare += baseFare * paxCount * api_currency;
          totalTax += tax * paxCount * api_currency;
          totalConFee += surcharge * paxCount * api_currency;
          totalTax += totalConFee * api_currency;
          totalDiscount += discount * paxCount * api_currency;
          total_amount +=
            PriceDetail.TotalAmount.SimpleCurrencyPrice.value * paxCount * api_currency;

          const taxBreakdown = PriceDetail.Taxes?.Breakdown?.Tax || [];
          const taxes = taxBreakdown.map(tax => ({
            code: tax.TaxCode,
            amount: Number(tax.Amount?.value) || 0
          }));

          tax_fare.push(taxes);

          const FormattedPassenger = {
            type: TravelerInfo?.PTC.value,
            number: paxCount,
            fare: {
              base_fare: Number(PriceDetail.BaseAmount.value) * api_currency,
              tax: Number(PriceDetail.Taxes?.Total.value || 0) * api_currency,
              total_fare: Number(PriceDetail.TotalAmount.SimpleCurrencyPrice.value) * api_currency,
            },
          };

          return FormattedPassenger;
        });

        const ait = Math.round(((Number(totalBaseFare) + Number(totalTax)) / 100) * 0.3);

        const new_fare = {
          base_fare: totalBaseFare,
          total_tax: totalTax,
          ait: ait,
          discount: totalDiscount,
          payable: 0,
          vendor_price: {
            base_fare: totalBaseFare,
            tax: totalTax,
            charge: totalConFee,
            discount: totalDiscount,
            gross_fare: total_amount + totalDiscount,
            net_fare: total_amount,
          },
        };
        let total_segments = 0;
        FormattedFlights.map((elm) => {
          elm.options.map((elm2) => {
            total_segments++;
          });
        });

        //calculate tax fare
        let { tax_markup, tax_commission } = await this.flightSupport.calculateFlightTaxMarkup({
          dynamic_fare_supplier_id,
          tax: tax_fare,
          route_type,
          airline: airlineCode,
        });
        tax_commission = tax_commission * api_currency;
        tax_markup = tax_markup * api_currency;


        const { markup, commission, pax_markup } = await this.flightSupport.calculateFlightMarkup({
          dynamic_fare_supplier_id,
          airline: airlineCode,
          flight_class: this.flightUtils.getClassFromId(
            reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin
          ),
          base_fare: new_fare.base_fare,
          total_segments,
          route_type,
        });

        const total_pax_markup = pax_count * pax_markup;

        new_fare.base_fare += markup + total_pax_markup;
        new_fare.base_fare += tax_markup;
        new_fare.discount += commission;
        new_fare.discount += tax_commission;
        new_fare.payable = Number(
          (
            Number(new_fare.base_fare) +
            Number(new_fare.total_tax) +
            Number(new_fare.ait) -
            Number(new_fare.discount)
          ).toFixed(2)
        );

        const newFormattedPax = FormattedPassengers.map((newPax) => {
          const per_pax_markup = ((markup + tax_markup) / pax_count) * newPax.number + pax_markup * newPax.number;
          return {
            type: newPax.type,
            number: newPax.number,
            fare: {
              base_fare: newPax.fare.base_fare + per_pax_markup,
              tax: newPax.fare.tax,
              total_fare: newPax.fare.total_fare + per_pax_markup,
            },
          };
        });

        // ticket last date
        const [ticket_last_date, ticket_last_time] = new FlightUtils().utcToLocalDateTime(
          `${Offer.TimeLimits?.OfferExpiration.DateTime}Z`
        );

        // refundable or not
        let refundable;
        {
          const PenaltyRefs = [
            ...new Set(
              Offer.PricedOffer.OfferPrice.map((OP) =>
                OP.FareDetail.FareComponent.map((FC) => FC.FareRules?.Penalty.refs)
              )
                .flat(10)
                .filter((PR) => PR !== undefined)
            ),
          ];
          // const PenaltyRefs =
          //   Offer.PricedOffer.OfferPrice[0].FareDetail.FareComponent[0]
          //     .FareRules?.Penalty.refs;
          const Penalty = data.DataLists.PenaltyList?.Penalty;

          if (PenaltyRefs?.length && Penalty) {
            const matched = Penalty.filter(
              (item) => PenaltyRefs.includes(item.ObjectKey) && item.RefundableInd !== undefined
            );

            if (matched.length > 0) {
              refundable = matched.every((p) => p.RefundableInd === true);
            } else {
              refundable = false;
            }
          }
        }

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
            flight_api_name: VERTEIL_API,
            airline: airlineCode,
            refundable: Boolean(refundable),
            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
            domestic: true,
          });
        } else if (route_type === ROUTE_TYPE.FROM_DAC) {
          //from dac
          partial_payment = await this.Model.PartialPaymentRuleModel(
            this.trx
          ).getPartialPaymentCondition({
            flight_api_name: VERTEIL_API,
            airline: airlineCode,
            from_dac: true,
            refundable: Boolean(refundable),
            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
          });
        } else if (route_type === ROUTE_TYPE.TO_DAC) {
          //to dac
          partial_payment = await this.Model.PartialPaymentRuleModel(
            this.trx
          ).getPartialPaymentCondition({
            flight_api_name: VERTEIL_API,
            airline: airlineCode,
            to_dac: true,
            refundable: Boolean(refundable),
            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
          });
        } else {
          //soto
          partial_payment = await this.Model.PartialPaymentRuleModel(
            this.trx
          ).getPartialPaymentCondition({
            flight_api_name: VERTEIL_API,
            airline: airlineCode,
            refundable: Boolean(refundable),
            travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
            soto: true,
          });
        }

        // Policies
        // const fare_rules = await this.ConstructDynamicFareRules({
        //   Offer,
        //   DataLists: data.DataLists,
        //   MetaData: data.Metadata,
        // });

        const FormattedResponse: IFormattedFlightItinerary = {
          journey_type: reqBody.JourneyType,
          flight_id: crypto.randomUUID(),
          api_search_id: Offer.OfferID.value,
          booking_block,
          api: VERTEIL_API,
          partial_payment,
          price_changed: false,
          direct_ticket_issue: false,
          refundable: Boolean(refundable),
          domestic_flight: route_type === ROUTE_TYPE.DOMESTIC,
          carrier_code: airlineCode,
          carrier_name: airlineInfo.name,
          carrier_logo: airlineInfo.logo,
          ticket_last_date,
          ticket_last_time,
          fare: new_fare,
          leg_description,
          flights: FormattedFlights,
          passengers: newFormattedPax,
          availability: FormattedAvailability,
          // dynamic_fare_rules: fare_rules,
        };

        FormattedResponseList.push(FormattedResponse);
      } catch (error: any) {
        console.warn(
          'An error occurred while formatting a Verteil Offer. This offer will be omitted from final response. ErrorMessage: ' +
          error.message
        );
        continue;
      }
    }

    return FormattedResponseList;
  }

  private async ConstructDynamicFareRules({
    Offer,
    DataLists,
    MetaData,
  }: {
    Offer: Interfaces.IAirlineOffer;
    DataLists: Interfaces.IDataLists;
    MetaData: Interfaces.IMetaData;
  }) {
    const policyObject = Offer.PricedOffer.OfferPrice.map((OfferPrice) => {
      const paxRef =
        OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences[0];
      const PaxTypeCode = DataLists.AnonymousTravelerList?.AnonymousTraveler.find(
        (AT) => AT.ObjectKey === paxRef
      )?.PTC.value;

      const OD = Offer.PricedOffer.Associations.map((Association) => {
        let route = '';
        const ODRef = Association.ApplicableFlight.OriginDestinationReferences?.[0];

        const ODInfo = DataLists.OriginDestinationList.OriginDestination.find(
          (od) => od.OriginDestinationKey === ODRef
        );

        if (ODInfo) route = ODInfo.DepartureCode.value + '-' + ODInfo.ArrivalCode.value;

        const ODSegmentsRef = Association.ApplicableFlight.FlightSegmentReference.map(
          (Seg) => Seg.ref
        );

        const ODPenaltyRefs = OfferPrice.FareDetail.FareComponent.filter((FC) =>
          ODSegmentsRef.includes(FC.SegmentReference.value)
        )
          .map((FC) => FC.FareRules?.Penalty.refs)
          .filter((value) => value !== undefined)
          .flat(2);

        const ODPenalties =
          DataLists.PenaltyList?.Penalty.filter((P) => ODPenaltyRefs.includes(P.ObjectKey)) || [];

        const ChangeFeePenalties = ODPenalties.filter((ODP) => ODP.ChangeFeeInd !== undefined);

        const CancelFeePenalties = ODPenalties.filter((ODP) => ODP.CancelFeeInd !== undefined);

        let changeAllowed = true;
        let noChangeFee = true;
        let changeFeeCurrencyCode: string = '';
        const changeFeeMinValueList: number[] = [];
        const changeFeeMaxValueList: number[] = [];

        let noCancelFee = true;
        let cancelFeeCurrencyCode: string = '';
        const cancelFeeMinValueList: number[] = [];
        const cancelFeeMaxValueList: number[] = [];

        ChangeFeePenalties.forEach((CFP) => {
          if (CFP.ChangeAllowedInd !== true) changeAllowed = false;
          if (CFP.ChangeFeeInd !== false) noChangeFee = false;
          const ChangeDetails = CFP.Details.Detail.filter((Detail) => Detail.Type === 'Change');
          for (const detail of ChangeDetails) {
            const Amounts = detail.Amounts?.Amount;
            if (Amounts) {
              for (const Amount of Amounts) {
                if (Amount.CurrencyAmountValue == undefined) continue;
                changeFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                const decimalKey = Offer.OfferID.Owner + '-' + changeFeeCurrencyCode;

                const decimal =
                  MetaData.Other.OtherMetadata?.[0]?.CurrencyMetadatas?.CurrencyMetadata.find(
                    (CM) => CM.MetadataKey === decimalKey
                  )?.Decimals;

                if (Amount.AmountApplication === 'MIN')
                  changeFeeMinValueList.push(
                    this.applyDecimal(Amount.CurrencyAmountValue.value, decimal)
                  );
                else if (Amount.AmountApplication === 'MAX')
                  changeFeeMaxValueList.push(
                    this.applyDecimal(Amount.CurrencyAmountValue.value, decimal)
                  );
              }
            }
          }
        });

        CancelFeePenalties.forEach((CFP) => {
          if (CFP.CancelFeeInd !== false) noCancelFee = false;
          const ChangeDetails = CFP.Details.Detail.filter((Detail) => Detail.Type === 'Cancel');
          for (const detail of ChangeDetails) {
            const Amounts = detail.Amounts?.Amount;
            if (Amounts) {
              for (const Amount of Amounts) {
                if (Amount.CurrencyAmountValue == undefined) continue;
                cancelFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                const decimalKey = Offer.OfferID.Owner + '-' + cancelFeeCurrencyCode;

                const decimal =
                  MetaData.Other.OtherMetadata?.[0]?.CurrencyMetadatas?.CurrencyMetadata.find(
                    (CM) => CM.MetadataKey === decimalKey
                  )?.Decimals;

                if (Amount.AmountApplication === 'MIN')
                  cancelFeeMinValueList.push(
                    this.applyDecimal(Amount.CurrencyAmountValue.value, decimal)
                  );
                else if (Amount.AmountApplication === 'MAX')
                  cancelFeeMaxValueList.push(
                    this.applyDecimal(Amount.CurrencyAmountValue.value, decimal)
                  );
              }
            }
          }
        });

        const minimumChangePenalty = Math.min(...changeFeeMinValueList);
        const maximumChangePenalty = Math.max(...changeFeeMaxValueList);

        const minimumCancelPenalty = Math.min(...cancelFeeMinValueList);
        const maximumCancelPenalty = Math.max(...cancelFeeMaxValueList);

        return {
          route,
          changeAllowed,
          noChangeFee,
          noCancelFee,
          changeFeeCurrencyCode,
          minimumChangePenalty,
          maximumChangePenalty,
          cancelFeeCurrencyCode,
          minimumCancelPenalty,
          maximumCancelPenalty,
        };
      });

      return {
        PTC: PaxTypeCode,
        OD,
      };
    });

    const safeValue = (val: any) => {
      if (val === null || val === undefined || !isFinite(val)) return '-';
      return val;
    };

    let html = `
    <style>
      table.compact-table {
        font-size: 12px;
        border-collapse: collapse;
        width: 100%;
      }
      table.compact-table th, table.compact-table td {
        border: 1px solid #ccc;
        padding: 4px 6px;
        text-align: center;
      }
      table.compact-table th {
        background-color: #f2f2f2;
        white-space: nowrap;
      }
    </style>

    <table class="compact-table">
      <caption>Fare Rules (Change/Cancel Fees)</caption>
      <thead>
        <tr>
          <th>PTC</th>
          <th>Route</th>
          <th title="Change Allowed Or Not?">Change Allowed</th>
          <th title="Change Fee Currency">Change Cur</th>
          <th title="Minimum Change Penalty">Min CP</th>
          <th title="Maximum Change Penalty">Max CP</th>
          <th title="Cancel Fee Currency">Cancel Cur</th>
          <th title="Minimum Cancel Penalty">Min XP</th>
          <th title="Maximum Cancel Penalty">Max XP</th>
        </tr>
      </thead>
      <tbody>
  `;

    for (const ptc of policyObject) {
      for (const od of ptc.OD) {
        html += `
        <tr>
          <td>${ptc.PTC}</td>
          <td>${od.route}</td>
          <td>${od.changeAllowed ? 'Yes' : 'No'}</td>
          <td>${od.changeFeeCurrencyCode || '-'}</td>
          <td>${safeValue(od.minimumChangePenalty)}</td>
          <td>${safeValue(od.maximumChangePenalty)}</td>
          <td>${od.cancelFeeCurrencyCode || '-'}</td>
          <td>${safeValue(od.minimumCancelPenalty)}</td>
          <td>${safeValue(od.maximumCancelPenalty)}</td>
        </tr>
      `;
      }
    }

    html += `
      </tbody>
    </table>
  `;

    return Lib.minifyHTML(html);
  }

  // Flight Search (end)//

  // Flight Revalidate (start)//
  public async FlightRevalidateService({
    search_id,
    reqBody,
    oldData,
    dynamic_fare_supplier_id,
  }: {
    search_id: string;
    reqBody: IFlightSearchReqBody;
    oldData: Readonly<IFormattedFlightItinerary>;
    dynamic_fare_supplier_id: number;
  }) {
    let FlightPriceRQ: Interfaces.IVerteilFlightPriceRQ | null;
    FlightPriceRQ = await getRedis(`VerteilFlightPriceRQ-${search_id}-${oldData.flight_id}`);

    if (FlightPriceRQ === null) {
      const flightPriceRQs = await getRedis(`VerteilFlightPriceRQs-${search_id}`);

      `VerteilFlightPriceRQs`;

      FlightPriceRQ =
        flightPriceRQs?.find((RQs: { flight_id: string }) => RQs.flight_id === oldData.flight_id)
          ?.flightPriceRQ || null;
    }

    if (!FlightPriceRQ) throw new Error(this.ResMsg.HTTP_NOT_FOUND);

    const FlightPriceRS = await this.request.postRequest(
      VerteilAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
      FlightPriceRQ,
      { headers: { ThirdpartyId: FlightPriceRQ.ShoppingResponseID.Owner } }
    );

    if (!FlightPriceRS) throw new CustomError('This flight is not available ', 404);

    if (FlightPriceRS.Errors) throw new CustomError('This flight is not available ', 404);

    const route_type = this.flightSupport.routeTypeFinder({
      originDest: reqBody.OriginDestinationInformation,
    });

    const newData = await this.FlightRevalidateResFormatter({
      reqBody,
      oldData,
      response: FlightPriceRS,
      dynamic_fare_supplier_id,
      route_type,
    });

    // Post Revalidate Works
    {
      // 1. Prepare metadata for next revalidate request
      const FlightPriceRQ = await new VerteilFlightUtils().PrepareMetaDataFlightPricePlus(
        oldData,
        reqBody,
        FlightPriceRS
      );
      setRedis(
        `VerteilFlightPriceRQ-${search_id}-${newData.flight_id}`,
        FlightPriceRQ.flightPriceRQ,
        900
      );

      // 2. Prepare metadata for flight booking request
      const OrderCreateRQ = await new VerteilFlightUtils().PrepareMetaDataForOrderCreate(
        FlightPriceRS
      );
      setRedis(`VerteilOrderCreateRQ-${search_id}-${newData.flight_id}`, OrderCreateRQ, 900);

      setRedis(`FlightRevalidateRS-${search_id}-${newData.flight_id}`, newData, 900);
    }

    return [newData];
  }

  private async FlightRevalidateResFormatter({
    reqBody,
    oldData,
    dynamic_fare_supplier_id,
    response,
    route_type,
  }: {
    reqBody: IFlightSearchReqBody;
    oldData: Readonly<IFormattedFlightItinerary>;
    dynamic_fare_supplier_id: number;
    response: Interfaces.IVerteilFlightPriceRS;
    route_type: 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' | 'SOTO';
  }) {
    const api_currency = await this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(
      VERTEIL_API,
      'FLIGHT'
    );

    const newData = JSON.parse(JSON.stringify(oldData)) as IFormattedFlightItinerary;

    const PricedFlightOffer = response.PricedFlightOffers.PricedFlightOffer;
    const DataLists = response.DataLists;

    //=== Availability Check ===//
    {
      const Associations = PricedFlightOffer[0].OfferPrice[0].RequestedDate.Associations;
      const FormattedAvailability = Associations.map(
        // Flight LEG
        (Association, AssociationIndex) => {
          const originDestRef = Association.ApplicableFlight.OriginDestinationReferences?.[0];
          const OriginDestination = response.DataLists.OriginDestinationList.OriginDestination.find(
            (od) => od.OriginDestinationKey === originDestRef
          );

          if (!OriginDestination)
            throw new Error(
              `Fatal: Verteil API OriginDestination with key "${originDestRef}" not found.`
            );

          const from_airport = OriginDestination.DepartureCode.value;
          const to_airport = OriginDestination.ArrivalCode.value;

          const SegmentRefs = Association.ApplicableFlight.FlightSegmentReference; // Segments for this LEG

          if (!SegmentRefs) throw new Error(`Fatal: Verteil API SegmentRefs Segment not found.`);

          const FormattedSegments = SegmentRefs.map(
            // Single Segment
            (Segment, SegmentIndex) => {
              // Passenger Types for this Segment
              const FormattedPassengers = PricedFlightOffer[0].OfferPrice.map(
                // Single Passenger Type
                (OfferPrice) => {
                  const travelerRef =
                    OfferPrice.RequestedDate.Associations[0].AssociatedTraveler
                      .TravelerReferences[0];
                  const TravelerInfo = DataLists.AnonymousTravelerList?.AnonymousTraveler.find(
                    (tr) => tr.ObjectKey === travelerRef
                  );

                  if (!TravelerInfo)
                    throw new Error(
                      `Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`
                    );

                  let baggage_count: number | null = null;
                  let baggage_unit: string | null = null;

                  const OfferPriceSegment =
                    OfferPrice.RequestedDate.Associations[AssociationIndex]?.ApplicableFlight
                      .FlightSegmentReference![SegmentIndex];

                  if (OfferPriceSegment && OfferPriceSegment.BagDetailAssociation) {
                    const CheckedBagReferences =
                      OfferPriceSegment.BagDetailAssociation.CheckedBagReferences;
                    if (CheckedBagReferences) {
                      const filteredBagAllowance =
                        DataLists.CheckedBagAllowanceList?.CheckedBagAllowance.filter((item) =>
                          CheckedBagReferences.includes(item.ListKey)
                        );

                      if (filteredBagAllowance) {
                        const firstBaggage = filteredBagAllowance[0];
                        if (
                          firstBaggage &&
                          firstBaggage.PieceAllowance &&
                          firstBaggage.PieceAllowance.length
                        ) {
                          if (firstBaggage.WeightAllowance) {
                            const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                            baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                            baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                          } else {
                            baggage_unit = 'pieces';
                            baggage_count = firstBaggage.PieceAllowance[0].TotalQuantity;
                          }
                        } else {
                          if (firstBaggage.WeightAllowance) {
                            const UOM = firstBaggage.WeightAllowance.MaximumWeight[0].UOM;
                            baggage_unit = UOM === 'Kilogram' ? 'KG' : UOM;
                            baggage_count = firstBaggage.WeightAllowance.MaximumWeight[0].Value;
                          } else {
                            baggage_unit = 'pieces';
                            baggage_count = 0;
                          }
                        }
                      }
                    }
                  }

                  const FormattedPassenger: IFlightDataAvailabilityPassenger = {
                    type: TravelerInfo.PTC.value,
                    count:
                      reqBody.PassengerTypeQuantity.find(
                        (PTQ) => PTQ.Code === TravelerInfo.PTC.value
                      )?.Quantity || 0,
                    cabin_code: OfferPriceSegment.ClassOfService.MarketingName?.CabinDesignator,
                    cabin_type: OfferPriceSegment.ClassOfService.MarketingName?.value,
                    booking_code: OfferPriceSegment.ClassOfService.Code?.value,
                    available_seat: Association.AssociatedService?.SeatAssignment?.length,
                    meal_code: undefined,
                    meal_type: undefined,
                    available_break: undefined,
                    available_fare_break: undefined,
                    baggage_info: `${baggage_count} ${baggage_unit}`,
                  };

                  return FormattedPassenger;
                }
              );

              const FormattedSegment: IFlightDataAvailabilitySegment = {
                name: `Segment-${SegmentIndex + 1}`,
                passenger: FormattedPassengers,
              };

              return FormattedSegment;
            }
          );

          const Availability: IFlightAvailability = {
            from_airport,
            to_airport,
            segments: FormattedSegments,
          };

          return Availability;
        }
      );

      newData.availability = FormattedAvailability;
    }

    //=== Passengers & Fare Check ==//
    {
      let totalBaseFare = 0;
      let totalTax = 0;
      let totalConFee = 0;
      let totalDiscount = 0;
      let total_amount = 0;
      let totalProviderTotal = 0;
      let pax_count = 0;

      let tax_fare: { code: string, amount: number }[][] = [];

      reqBody.PassengerTypeQuantity.forEach((reqPax) => {
        pax_count += reqPax.Quantity;
      });

      const FormattedPassengers = PricedFlightOffer[0].OfferPrice.map((OfferPrice) => {
        const travelerRef =
          OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences[0];
        const TravelerInfo = response.DataLists.AnonymousTravelerList?.AnonymousTraveler.find(
          (tr) => tr.ObjectKey === travelerRef
        );

        if (!TravelerInfo)
          throw new Error(`Fatal: Verteil API TravelerInfo with key "${travelerRef}" not found.`);

        const paxCount =
          OfferPrice.RequestedDate.Associations[0].AssociatedTraveler.TravelerReferences.length;

        const PriceDetail = OfferPrice.RequestedDate.PriceDetail;
        const baseFare = PriceDetail.BaseAmount.value;
        const tax = PriceDetail.Taxes?.Total.value || 0;
        const surcharge =
          PriceDetail.Surcharges?.Surcharge.reduce((sum, item) => {
            return sum + (item.Total?.value ?? 0);
          }, 0) || 0;
        const discount =
          PriceDetail.Discount?.reduce((sum, item) => {
            return sum + (item.DiscountAmount?.value ?? 0);
          }, 0) || 0;

        totalBaseFare += baseFare * paxCount * api_currency;
        totalTax += tax * paxCount * api_currency;
        totalConFee += surcharge * paxCount * api_currency;
        totalTax += totalConFee;
        totalDiscount += discount * paxCount * api_currency;
        total_amount += PriceDetail.TotalAmount.SimpleCurrencyPrice.value * paxCount;

        const taxBreakdown = PriceDetail.Taxes?.Breakdown?.Tax || [];
        const taxes = taxBreakdown.map(tax => ({
          code: tax.TaxCode,
          amount: Number(tax.Amount?.value) || 0
        }));

        tax_fare.push(taxes);

        const FormattedPassenger = {
          type: TravelerInfo?.PTC.value,
          number: paxCount,
          fare: {
            total_fare: Number(PriceDetail.TotalAmount.SimpleCurrencyPrice.value) * api_currency,
            tax: Number(PriceDetail.Taxes?.Total.value || 0) * api_currency,
            base_fare: Number(PriceDetail.BaseAmount.value) * api_currency,
          },
        };

        return FormattedPassenger;
      });

      const vendor_price = {
        base_fare: totalBaseFare,
        tax: totalTax,
        charge: totalConFee,
        discount: totalDiscount,
        gross_fare: total_amount + totalDiscount,
        net_fare: total_amount,
      };

      const ait = Math.round(((Number(totalBaseFare) + Number(totalTax)) / 100) * 0.3);

      const new_fare = {
        base_fare: totalBaseFare,
        total_tax: totalTax,
        ait,
        discount: totalDiscount,
        payable: totalBaseFare + totalTax + ait - totalDiscount,
        vendor_price: vendor_price,
        tax_fare
      };

      let total_segments = 0;
      newData.flights.map((elm) => {
        elm.options.map((elm2) => {
          total_segments++;
        });
      });

      new_fare.tax_fare = tax_fare;

      //calculate tax fare
      let { tax_markup, tax_commission } = await this.flightSupport.calculateFlightTaxMarkup({
        dynamic_fare_supplier_id,
        tax: tax_fare,
        route_type,
        airline: newData.carrier_code,
      });
      tax_commission = tax_commission * api_currency;
      tax_markup = tax_markup * api_currency;

      const { markup, commission, pax_markup } = await new CommonFlightSupport(
        this.trx
      ).calculateFlightMarkup({
        dynamic_fare_supplier_id,
        airline: newData.carrier_code,
        flight_class: new CommonFlightUtils().getClassFromId(
          reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin
        ),
        base_fare: new_fare.base_fare,
        total_segments,
        route_type,
      });

      const total_pax_markup = pax_count * pax_markup;

      new_fare.base_fare += markup + total_pax_markup;
      new_fare.base_fare += tax_markup;
      new_fare.discount += commission;
      new_fare.discount += tax_commission;

      new_fare.payable = Number(
        (
          Number(new_fare.base_fare) +
          Number(new_fare.total_tax) +
          Number(new_fare.ait) -
          Number(new_fare.discount)
        ).toFixed(2)
      );
      newData.fare = new_fare;

      newData.passengers = FormattedPassengers.map((newPax) => {
        const per_pax_markup = ((markup + tax_markup) / pax_count) * newPax.number + pax_markup * newPax.number;
        return {
          type: newPax.type,
          number: newPax.number,
          fare: {
            base_fare: Number((newPax.fare.base_fare + per_pax_markup).toFixed(2)),
            tax: newPax.fare.tax,
            total_fare: Number((newPax.fare.total_fare + per_pax_markup).toFixed(2)),
          },
        };
      });
    }

    //=== Last Time Check ==//
    {
      const TimeLimits = PricedFlightOffer[0].TimeLimits;
      if (TimeLimits) {
        const [ticket_last_date, ticket_last_time] = new FlightUtils().utcToLocalDateTime(
          TimeLimits.Payment.DateTime + 'Z'
        );

        if (oldData.ticket_last_date !== ticket_last_date)
          newData.ticket_last_date = ticket_last_date;
        if (oldData.ticket_last_time !== ticket_last_time)
          newData.ticket_last_time = ticket_last_time;
      }
    }

    //=== Refundable Check ==//
    {
      let refundable = false;
      const PenaltyRefs = [
        ...new Set(
          PricedFlightOffer[0].OfferPrice.map((OP) =>
            OP.FareDetail?.FareComponent.map((FC) => FC.FareRules?.Penalty.refs)
          )
            .flat(10)
            .filter((PR) => PR !== undefined)
        ),
      ];
      // const PenaltyRefs =
      //   response.PricedFlightOffers.PricedFlightOffer[0].OfferPrice[0]
      //     .FareDetail?.FareComponent[0].FareRules?.Penalty.refs;
      const Penalty = response.DataLists.PenaltyList?.Penalty;

      if (PenaltyRefs && Penalty) {
        const matched = Penalty.filter(
          (item) => PenaltyRefs.includes(item.ObjectKey) && item.RefundableInd !== undefined
        );

        if (matched.length > 0) {
          refundable = matched.every((p) => p.RefundableInd === true);
        }
      }

      if (oldData.refundable !== refundable) newData.refundable = refundable;
    }

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
        flight_api_name: VERTEIL_API,
        airline: newData.carrier_code,
        refundable: newData.refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
        domestic: true,
      });
    } else if (route_type === ROUTE_TYPE.FROM_DAC) {
      //from dac
      partial_payment = await this.Model.PartialPaymentRuleModel(
        this.trx
      ).getPartialPaymentCondition({
        flight_api_name: VERTEIL_API,
        airline: newData.carrier_code,
        refundable: newData.refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
        domestic: false,
      });
    } else if (route_type === ROUTE_TYPE.TO_DAC) {
      //to dac
      partial_payment = await this.Model.PartialPaymentRuleModel(
        this.trx
      ).getPartialPaymentCondition({
        flight_api_name: VERTEIL_API,
        airline: newData.carrier_code,
        to_dac: true,
        refundable: newData.refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
      });
    } else {
      //soto
      partial_payment = await this.Model.PartialPaymentRuleModel(
        this.trx
      ).getPartialPaymentCondition({
        flight_api_name: VERTEIL_API,
        airline: newData.carrier_code,
        refundable: newData.refundable,
        travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
        soto: true,
      });
    }

    newData.partial_payment = partial_payment;
    // console.log({old: oldData.fare.payable});
    newData.price_changed = !(oldData.fare.payable === newData.fare.payable);

    // Policies
    {
      const policyObject = PricedFlightOffer[0].OfferPrice.map((OfferPrice) => {
        const paxRef =
          OfferPrice.RequestedDate.Associations[0].AssociatedTraveler
            .TravelerReferences[0];
        const PaxTypeCode =
          DataLists.AnonymousTravelerList?.AnonymousTraveler.find(
            (AT) => AT.ObjectKey === paxRef
          )?.PTC.value;

        const OD = OfferPrice.RequestedDate.Associations.map((Association) => {
          let route = "";
          const ODRef =
            Association.ApplicableFlight.OriginDestinationReferences?.[0];

          const ODInfo = DataLists.OriginDestinationList.OriginDestination.find(
            (od) => od.OriginDestinationKey === ODRef
          );

          if (ODInfo)
            route = ODInfo.DepartureCode.value + "-" + ODInfo.ArrivalCode.value;

          const ODSegmentsRef =
            Association.ApplicableFlight.FlightSegmentReference?.map(
              (Seg) => Seg.ref
            ).filter((item) => item !== undefined) || [];

          const ODPenaltyRefs = OfferPrice.FareDetail?.FareComponent.filter(
            (FC) => FC.refs.some((ref) => ODSegmentsRef.includes(ref))
            // (FC) => ODSegmentsRef.includes(FC.refs[0])
          )
            .map((FC) => FC.FareRules?.Penalty.refs)
            .filter((value) => value !== undefined)
            .flat(2);

          const ODPenalties =
            DataLists.PenaltyList?.Penalty.filter((P) =>
              ODPenaltyRefs?.includes(P.ObjectKey)
            ) || [];

          const ChangeFeePenalties = ODPenalties.filter(
            (ODP) => ODP.ChangeFeeInd !== undefined
          );

          const CancelFeePenalties = ODPenalties.filter(
            (ODP) => ODP.CancelFeeInd !== undefined
          );

          let changeAllowed = true;
          let noChangeFee = true;
          let changeFeeCurrencyCode: string = "";
          const changeFeeMinValueList: number[] = [];
          const changeFeeMaxValueList: number[] = [];

          let noCancelFee = true;
          let cancelFeeCurrencyCode: string = "";
          const cancelFeeMinValueList: number[] = [];
          const cancelFeeMaxValueList: number[] = [];

          ChangeFeePenalties.forEach((CFP) => {
            if (CFP.ChangeAllowedInd !== true) changeAllowed = false;
            if (CFP.ChangeFeeInd !== false) noChangeFee = false;
            const ChangeDetails = CFP.Details.Detail.filter(
              (Detail) => Detail.Type === "Change"
            );
            for (const detail of ChangeDetails) {
              const Amounts = detail.Amounts?.Amount;
              if (Amounts) {
                for (const Amount of Amounts) {
                  if (Amount.CurrencyAmountValue == undefined) continue;
                  changeFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                  const decimalKey =
                    // PricedFlightOffer[0].OfferID.Owner +
                    // "-" +
                    changeFeeCurrencyCode;

                  const decimal =
                    response.Metadata?.Other?.OtherMetadata?.[0]?.CurrencyMetadatas?.CurrencyMetadata.find(
                      (CM) => CM.MetadataKey === decimalKey
                    )?.Decimals;

                  if (Amount.AmountApplication === "MIN")
                    changeFeeMinValueList.push(
                      this.applyDecimal(
                        Amount.CurrencyAmountValue.value,
                        decimal
                      )
                    );
                  else if (Amount.AmountApplication === "MAX")
                    changeFeeMaxValueList.push(
                      this.applyDecimal(
                        Amount.CurrencyAmountValue.value,
                        decimal
                      )
                    );
                }
              }
            }
          });

          CancelFeePenalties.forEach((CFP) => {
            if (CFP.CancelFeeInd !== false) noCancelFee = false;
            const ChangeDetails = CFP.Details.Detail.filter(
              (Detail) => Detail.Type === "Cancel"
            );
            for (const detail of ChangeDetails) {
              const Amounts = detail.Amounts?.Amount;
              if (Amounts) {
                for (const Amount of Amounts) {
                  if (Amount.CurrencyAmountValue == undefined) continue;
                  cancelFeeCurrencyCode = Amount.CurrencyAmountValue.Code;
                  const decimalKey =
                    // PricedFlightOffer[0].OfferID.Owner +
                    // "-" +
                    cancelFeeCurrencyCode;

                  const decimal =
                    response.Metadata?.Other?.OtherMetadata?.[0]?.CurrencyMetadatas?.CurrencyMetadata.find(
                      (CM) => CM.MetadataKey === decimalKey
                    )?.Decimals;

                  if (Amount.AmountApplication === "MIN")
                    cancelFeeMinValueList.push(
                      this.applyDecimal(
                        Amount.CurrencyAmountValue.value,
                        decimal
                      )
                    );
                  else if (Amount.AmountApplication === "MAX")
                    cancelFeeMaxValueList.push(
                      this.applyDecimal(
                        Amount.CurrencyAmountValue.value,
                        decimal
                      )
                    );
                }
              }
            }
          });

          const minimumChangePenalty = Math.min(...changeFeeMinValueList);
          const maximumChangePenalty = Math.max(...changeFeeMaxValueList);

          const minimumCancelPenalty = Math.min(...cancelFeeMinValueList);
          const maximumCancelPenalty = Math.max(...cancelFeeMaxValueList);

          return {
            route,
            changeAllowed,
            noChangeFee,
            noCancelFee,
            changeFeeCurrencyCode,
            minimumChangePenalty,
            maximumChangePenalty,
            cancelFeeCurrencyCode,
            minimumCancelPenalty,
            maximumCancelPenalty,
          };
        });

        return {
          PTC: PaxTypeCode,
          OD,
        };
      });

      const safeValue = (val: any) => {
        if (val === null || val === undefined || !isFinite(val)) return "-";
        return val;
      };

      let html = `
    <style>
      table.compact-table {
        font-size: 12px;
        border-collapse: collapse;
        width: 100%;
      }
      table.compact-table th, table.compact-table td {
        border: 1px solid #ccc;
        padding: 4px 6px;
        text-align: center;
      }
      table.compact-table th {
        background-color: #f2f2f2;
        white-space: nowrap;
      }
    </style>

    <table class="compact-table">
      <caption>Fare Rules (Change/Cancel Fees)</caption>
      <thead>
        <tr>
          <th>PTC</th>
          <th>Route</th>
          <th title="Change Allowed Or Not?">Change Allowed</th>
          <th title="Change Fee Currency">Change Cur</th>
          <th title="Minimum Change Penalty">Min CP</th>
          <th title="Maximum Change Penalty">Max CP</th>
          <th title="Change Allowed Or Not?">Refund Allowed</th>
          <th title="Cancel Fee Currency">Cancel Cur</th>
          <th title="Minimum Cancel Penalty">Min XP</th>
          <th title="Maximum Cancel Penalty">Max XP</th>
        </tr>
      </thead>
      <tbody>
  `;

      for (const ptc of policyObject) {
        for (const od of ptc.OD) {
          html += `
        <tr>
          <td>${ptc.PTC}</td>
          <td>${od.route}</td>
          <td>${od.changeAllowed ? "Yes" : "No"}</td>
          <td>${od.changeFeeCurrencyCode || "-"}</td>
          <td>${safeValue(od.minimumChangePenalty)}</td>
          <td>${safeValue(od.maximumChangePenalty)}</td>
          <td>${od.noCancelFee ? "Full" : "None/Partial"}</td>
          <td>${od.cancelFeeCurrencyCode || "-"}</td>
          <td>${safeValue(od.minimumCancelPenalty)}</td>
          <td>${safeValue(od.maximumCancelPenalty)}</td>
        </tr>
      `;
        }
      }

      html += `
        </tbody>
        </table>
      `;
      newData.fare_rules = Lib.minifyHTML(html);
    }

    return newData;
  }

  // Flight Revalidate (end)//

  // Flight Booking (start)//
  public orderCreateRequestFormatter({
    OrderCreateRQ,
    passengers,
    countries,
  }: // primeFlow,
    {
      OrderCreateRQ: Interfaces.IVerteilOrderCreateRQ;
      passengers: Array<IFlightBookingPassengerReqBody>;
      countries: Array<{ id: number; iso: string }>;
      // primeFlow?: {
      //   Amount: { Code: string; value: number };
      //   Method: { Cash: { CashInd: boolean } };
      // };
    }): Interfaces.IVerteilOrderCreateRQ {
    let infAssociationAdtIndex = 0;
    const priority: Record<string, number> = { ADT: 1, CHD: 2, INF: 3 };

    const incompletePax = OrderCreateRQ.Query.Passengers.Passenger;
    incompletePax.sort((a, b) => priority[a.PTC.value] - priority[b.PTC.value]);

    // Reorder passengers array to match incompletePax
    {
      // Step 1: Sort by type in ADT, CHD, INF order
      passengers.sort((a, b) => priority[a.type] - priority[b.type]);

      // Step 2: Reorder ADT so that the one with contact info appears first
      const adults = passengers.filter((p) => p.type === 'ADT');
      const children = passengers.filter((p) => p.type === 'CHD');
      const infants = passengers.filter((p) => p.type === 'INF');

      const primaryAdultIndex = adults.findIndex((p) => p.contact_number && p.contact_email);
      if (primaryAdultIndex > 0) {
        // Move the primary adult to the first position
        const primaryAdult = adults.splice(primaryAdultIndex, 1)[0];
        adults.unshift(primaryAdult);
        passengers = [...adults, ...children, ...infants];
      }
    }

    const completedPax = incompletePax.map((iPax, iPaxInd) => {
      let FormattedPassenger: Record<string, any> = {};
      const passenger = passengers[iPaxInd];
      const paxType = iPax.PTC.value;

      // Provide contact only for the first adult passenger node
      if (iPaxInd === 0) {
        FormattedPassenger.Contacts = {
          Contact: [
            {
              PhoneContact: {
                Number: [
                  {
                    CountryCode: '+880',
                    value: passenger.contact_number?.slice(-10)!,
                  },
                ],
              },
              EmailContact: { Address: { value: passenger.contact_email! } },
              AddressContact: { Street: ['Bangladesh'], PostalCode: '1000' },
            },
          ],
        };
      }

      // Only for INFANT
      if (paxType === 'INF') {
        FormattedPassenger.Measurements = {
          Height: {
            UOM: 'Centimeter',
            value: 75,
          },
          Weight: {
            UOM: 'Kilogram',
            value: 10,
          },
        };

        FormattedPassenger.PassengerAssociation = incompletePax[infAssociationAdtIndex].ObjectKey;
        infAssociationAdtIndex++;
      }

      // Passport detail
      FormattedPassenger.PassengerIDInfo = {
        PassengerDocument: [
          {
            ID: passenger.passport_number!,
            Type: 'PT',
            CountryOfIssuance:
              countries.find((cn) => cn.id == passenger.issuing_country)?.iso || 'BD',
            CountryOfResidence: countries.find((cn) => cn.id == passenger.nationality)?.iso || 'BD',
            DateOfIssue: passenger.passport_issue_date,
            DateOfExpiration: passenger.passport_expiry_date,
          },
        ],
      };

      // Gender detail
      FormattedPassenger.Gender = { value: passenger.gender };

      // Age detail
      FormattedPassenger.Age = {
        BirthDate: { value: passenger.date_of_birth },
      };

      // Name detail
      const getTitle = (paxType: string, paxGender: string, paxTitle: string) => {
        if (paxType === 'ADT') {
          if (paxGender === 'Female') {
            return paxTitle === 'Mrs' ? 'Mrs' : 'Ms';
          }
          return 'Mr'; // Male adults default to Mr
        } else if (paxType === 'CHD' || paxType === 'INF') {
          return paxGender === 'Female' ? 'Miss' : 'Mstr';
        }
        return ''; // Default case
      };
      FormattedPassenger.Name = {
        Given: [{ value: passenger.first_name }],
        Surname: { value: passenger.last_name },
        Title: getTitle(paxType, passenger.gender, passenger.reference),
      };

      // ObjectKey and PTC has been set at PrepareMetaDataForOrderCreate phase
      FormattedPassenger.ObjectKey = iPax.ObjectKey;
      FormattedPassenger.PTC = iPax.PTC;

      // add _ref to original passenger data for saving
      passenger._ref = iPax.ObjectKey;

      return FormattedPassenger;
    });

    // @ts-ignore
    OrderCreateRQ.Query.Passengers.Passenger = completedPax;

    // Append Payment Method for instant purchase
    // if (primeFlow !== undefined) {
    //   OrderCreateRQ.Query.Payments = {
    //     Payment: [
    //       {
    //         Amount: primeFlow.Amount,
    //         Method: primeFlow.Method,
    //       },
    //     ],
    //   };
    // }
    // {
    //   OrderCreateRQ.Query.Payments = {
    //     Payment: [
    //       {
    //         Amount: { Code: "INR", value: 259614 },
    //         Method: { Cash: { CashInd: true } },
    //       },
    //     ],
    //   };
    // }

    return OrderCreateRQ;
  }

  // Flight book
  public async FlightBookService({
    search_id,
    flight_id,
    passengers,
  }: {
    search_id: string;
    flight_id: string;
    passengers: IFlightBookingPassengerReqBody[];
  }) {
    const preOrderCreateRQ = await getRedis(`VerteilOrderCreateRQ-${search_id}-${flight_id}`);

    if (!preOrderCreateRQ)
      throw new CustomError(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);

    const passengerCountryIds: number[] = [
      ...new Set(
        passengers
          .map((pax) => [pax.issuing_country, pax.nationality])
          .flat()
          .filter((value): value is number => value !== undefined) // Type guard
      ),
    ];
    const countries = await this.Model.commonModel().getAllCountry({
      id: passengerCountryIds,
    });

    const OrderCreateRQ = this.orderCreateRequestFormatter({
      OrderCreateRQ: preOrderCreateRQ,
      passengers,
      countries,
    });

    const OrderCreateRS = await this.request.postRequest(
      VerteilAPIEndpoints.FLIGHT_BOOK_ENDPOINT,
      OrderCreateRQ,
      {
        headers: {
          ThirdpartyId: OrderCreateRQ.Query.OrderItems.ShoppingResponse.Owner,
        },
      }
    );

    if (!OrderCreateRS)
      throw new CustomError('Please contact support team with flight information', 500);

    if (OrderCreateRS.Errors)
      throw new CustomError('Please contact support team with flight information', 500);

    const Order = OrderCreateRS.Response?.Order[0];

    let paymentTimeLimit = Order?.TimeLimits
      ? new Date(Order.TimeLimits.PaymentTimeLimit.DateTime)
        .toLocaleString('sv-SE', { hour12: false })
        .replace('T', ' ')
      : '';

    if (paymentTimeLimit === '' && Order?.OrderItems?.OrderItem[0].TimeLimits) {
      let timeLimit = Order.OrderItems.OrderItem[0].TimeLimits.PaymentTimeLimit?.Timestamp;
      if (!timeLimit)
        timeLimit = Order.OrderItems.OrderItem[0].TimeLimits.PriceGuaranteeTimeLimits?.Timestamp;
      if (timeLimit)
        paymentTimeLimit = new Date(timeLimit)
          .toLocaleString('sv-SE', { hour12: false })
          .replace('T', ' ');
    }

    return {
      success: true,
      pnr: Order?.OrderID.value || '',
      paymentTimeLimit,
      apiBookingId: Order?.BookingReferences.BookingReference?.[0].ID || '',
    };
  }

  // Flight Booking (end)//

  // Get Booking (start)//
  private orderRetrieveRequestFormatter(
    pnr: string,
    airlineCode: string
  ): Interfaces.IVerteilOrderRetrieveRQ {
    return {
      Query: {
        Filters: {
          OrderID: {
            Owner: airlineCode,
            value: pnr,
            Channel: 'NDC',
          },
        },
      },
    };
  }

  // Order Retrieve
  public async OrderRetrieveService({
    pnr,
    airlineCode,
    passengers,
  }: {
    pnr: string;
    airlineCode: string;
    passengers: Array<IFlightBookingPassengerReqBody>;
  }) {
    try {
      const OrderRetrieveRQ = this.orderRetrieveRequestFormatter(pnr, airlineCode);

      const OrderRetrieveRS = await this.request.postRequest(
        VerteilAPIEndpoints.GET_BOOKING_ENDPOINT,
        OrderRetrieveRQ,
        {
          headers: {
            ThirdpartyId: airlineCode,
          },
        }
      );

      if (!OrderRetrieveRS) throw new CustomError('No information has been found', 404);

      if (OrderRetrieveRS.Errors)
        throw new Error(
          'No information has been found' +
          OrderRetrieveRS?.Errors?.Error.map((Er: { value: string }) => Er.value + ' ')
        );

      if (OrderRetrieveRS.Response === undefined)
        throw new CustomError('This flight is not available ', 404);

      const Order = OrderRetrieveRS.Response.Order[0];
      const DataLists = OrderRetrieveRS.Response.DataLists;

      let paymentTimeLimit = Order?.TimeLimits
        ? new Date(Order.TimeLimits.PaymentTimeLimit.DateTime)
          .toLocaleString('sv-SE', { hour12: false })
          .replace('T', ' ')
        : '';

      if (paymentTimeLimit === '' && Order?.OrderItems?.OrderItem[0].TimeLimits) {
        let timeLimit = Order.OrderItems.OrderItem[0].TimeLimits.PaymentTimeLimit?.Timestamp;
        if (!timeLimit)
          timeLimit = Order.OrderItems.OrderItem[0].TimeLimits.PriceGuaranteeTimeLimits?.Timestamp;
        if (timeLimit)
          paymentTimeLimit = new Date(timeLimit)
            .toLocaleString('sv-SE', { hour12: false })
            .replace('T', ' ');
      }

      // Ticket Details
      let flightTickets: Array<{
        number: string;
        status: string;
        originalTicketData: any;
      }> = [];

      const TicketDocInfo = OrderRetrieveRS.Response.TicketDocInfos?.TicketDocInfo;

      if (TicketDocInfo) {
        flightTickets = passengers.map((Pax) => {
          const passportID = Pax.passport_number?.toUpperCase()!;

          const paxRef = OrderRetrieveRS.Response?.Passengers.Passenger.find(
            (VerteilPax: { PassengerIDInfo: { PassengerDocument: { ID: string }[] } }) =>
              VerteilPax.PassengerIDInfo.PassengerDocument[0].ID.toUpperCase() === passportID
          )?.ObjectKey;

          const TicketInfo = TicketDocInfo.find(
            (TDI: { PassengerReference: any[] }) => TDI.PassengerReference[0] === paxRef
          );
          const TicketDocument = TicketInfo?.TicketDocument?.[0];
          return {
            number: TicketDocument?.TicketDocNbr || '',
            status: 'ISSUED',
            originalTicketData: TicketInfo,
          };
        });
      }

      // Baggage Details
      let BaggagePerPTC: Array<{
        PTC: string;
        baggageDesc: string;
      }>;
      {
        const Passenger = OrderRetrieveRS.Response.Passengers.Passenger;
        const PTCs = Array.from(new Map(Passenger.map((p: { PTC: any }) => [p.PTC, p])).values());

        BaggagePerPTC = PTCs.map((PTC: any) => {
          const serviceRefs = Order.OrderItems?.OrderItem.find(
            (OI: {
              BaggageItem: undefined;
              Associations: {
                Passengers: { PassengerReferences: string | any[] };
              };
            }) =>
              OI.BaggageItem !== undefined &&
              OI.Associations?.Passengers.PassengerReferences.includes(PTC.ObjectKey)
          )?.BaggageItem?.refs;

          if (!serviceRefs) return { PTC: PTC.PTC.value, baggageDesc: 'N/A' };

          const Service = DataLists.ServiceList?.Service.filter((S: { ObjectKey: any }) =>
            serviceRefs.includes(S.ObjectKey)
          )?.filter((S: { refs: undefined }) => S.refs !== undefined);

          if (!Service) return { PTC: PTC.PTC.value, baggageDesc: 'N/A' };

          const ServiceRefs = Service.map((S: { refs: any }) => S.refs).flat();

          let CheckedBagDescription = '';
          let CarryBagDescription = '';

          const CarryOnAllowanceList = DataLists.CarryOnAllowanceList?.CarryOnAllowance.filter(
            (COA: { ListKey: any }) => ServiceRefs.includes(COA.ListKey)
          );

          const CheckedBagAllowanceList =
            DataLists.CheckedBagAllowanceList?.CheckedBagAllowance.filter((CBA: { ListKey: any }) =>
              ServiceRefs.includes(CBA.ListKey)
            );

          if (CarryOnAllowanceList && CarryOnAllowanceList.length) {
            const Allowance = CarryOnAllowanceList[0];
            if (Allowance.PieceAllowance) {
              const count = Allowance.PieceAllowance[0].TotalQuantity;
              CarryBagDescription = `${count} PC${count > 1 ? 's' : ''} `;
            }
            if (Allowance.WeightAllowance) {
              const count = Allowance.WeightAllowance.MaximumWeight[0].Value;
              const unit = Allowance.WeightAllowance.MaximumWeight[0].UOM;
              CarryBagDescription += ` ${count} ${unit}`;
            }
          }

          if (CheckedBagAllowanceList && CheckedBagAllowanceList.length) {
            const Allowance = CheckedBagAllowanceList[0];
            if (Allowance.PieceAllowance) {
              const count = Allowance.PieceAllowance[0].TotalQuantity;
              CheckedBagDescription = `${count} PC${count > 1 ? 's' : ''} `;
            }
            if (Allowance.WeightAllowance) {
              const count = Allowance.WeightAllowance.MaximumWeight[0].Value;
              const unit = Allowance.WeightAllowance.MaximumWeight[0].UOM;
              CheckedBagDescription += ` ${count} ${unit}`;
            }
          }

          return {
            PTC: PTC.PTC.value,
            baggageDesc: `Checked: ${CheckedBagDescription.length ? CheckedBagDescription : 'N/A'
              } \nHand: ${CarryBagDescription.length ? CarryBagDescription : 'N/A'}`,
          };
        });
      }

      return {
        success: true,
        pnr_code: Order?.OrderID.value || pnr,
        paymentTimeLimit,
        flightTickets,
        baggageDescription: BaggagePerPTC,
      };
    } catch (error) {
      return {
        success: false,
        error: { code: 500, message: (error as Error).message },
      };
    }
  }

  // Get Booking (end)//

  // Ticket issue (start)//
  public async TicketIssueService({
    pnr,
    airlineCode,
    oldFare,
    passengers,
  }: {
    pnr: string;
    airlineCode: string;
    oldFare: { vendor_total: number };
    passengers: Array<IFlightBookingPassengerReqBody>;
  }): Promise<Interfaces.IFormattedTicketIssueRes> {
    let errorCode: number | undefined;
    try {
      //phase 1 - order reshop
      const { OrderReshopRS, OrderReshopRQ } = await this.OrderReshop({ pnr, airlineCode });
      {
        if (!OrderReshopRS || OrderReshopRS.error || !OrderReshopRS.response) {
          await this.Model.errorLogsModel().insert({
            level: ERROR_LEVEL_WARNING,
            message: 'Error from verteil while ticket issue',
            url: VerteilAPIEndpoints.ORDER_RESHOP_HEADER_ENDPOINT,
            http_method: 'POST',
            metadata: {
              api: VERTEIL_API,
              endpoint: VerteilAPIEndpoints.ORDER_RESHOP_HEADER_ENDPOINT,
              payload: OrderReshopRQ,
              response: OrderReshopRS,
            },
          });
          return {
            success: false,
            message: 'Cannot issue the booking ',
            code: this.StatusCode.HTTP_BAD_REQUEST,
          };
        }

        // const curTotalPrice = new VerteilFlightUtils().calculatePriceFromNanos(
        //   OrderReshopRS.response.repriceResult.totalPrice.totalAmount
        // );

        // const priceHasChanged =
        //   // OrderReshopRS.response.repriceResult.noPriceChangeInd !== true ||
        //   // OrderReshopRS.response.repriceResult.repricedOffers !== undefined ||
        //   oldFare.vendor_total !== curTotalPrice;

        // if (priceHasChanged) {
        //   return {
        //     success: false,
        //     code: this.StatusCode.HTTP_CONFLICT,
        //     message:
        //       'Price has been changed. Please review & confirm the new prices.',
        //     error: {
        //       priceChangeInd: true,
        //       priceChangeAmount: curTotalPrice - oldFare.vendor_total,
        //     },
        //   };
        // }
      }

      //phase 2 - order change
      const { OrderChangeRS, OrderChangeRQ } = await this.AcceptRepricedOffer({
        pnr,
        airlineCode,
        OrderReshopRS,
      });
      {
        if (!OrderChangeRS || OrderChangeRS.Errors || !OrderChangeRS.Response) {
          await this.Model.errorLogsModel().insert({
            level: ERROR_LEVEL_WARNING,
            message: 'Error from verteil while ticket issue',
            url: VerteilAPIEndpoints.ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT,
            http_method: 'POST',
            metadata: {
              api: VERTEIL_API,
              endpoint: VerteilAPIEndpoints.ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT,
              payload: OrderChangeRQ,
              response: OrderChangeRS,
            },
          });
          return {
            success: false,
            message: 'Cannot issue the booking ',
            code: this.StatusCode.HTTP_BAD_REQUEST,
          };
        }
      }

      let flightTickets: string[] = [];

      const TicketDocInfo = OrderChangeRS.Response.TicketDocInfos?.TicketDocInfo;

      if (TicketDocInfo) {
        flightTickets = passengers.map((Pax) => {
          const passportID = Pax.passport_number?.toUpperCase()!;

          const paxRef = OrderChangeRS.Response?.Passengers.Passenger.find(
            (VerteilPax: { PassengerIDInfo: { PassengerDocument: { ID: string }[] } }) =>
              VerteilPax.PassengerIDInfo.PassengerDocument[0].ID.toUpperCase() === passportID
          )?.ObjectKey;

          const TicketInfo = TicketDocInfo.find(
            (TDI: { PassengerReference: any[] }) => TDI.PassengerReference[0] === paxRef
          );
          const TicketDocument = TicketInfo?.TicketDocument?.[0];

          return TicketDocument?.TicketDocNbr || '';
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Ticket has been issued',
        data: flightTickets,
        ticket_status: FLIGHT_TICKET_ISSUE,
      };
    } catch (error) {
      console.warn(`Verteil TicketIssue Error: ` + (error as any).message);
      return {
        success: false,
        message: (error as any).message,
        code: errorCode || this.StatusCode.HTTP_BAD_REQUEST,
      };
    }
  }

  // Order Reshop Request Formatter
  private orderReshopRequestFormatter(
    pnr: string,
    airlineCode: string
  ): Interfaces.IVerteilOrderReshopRQ {
    return {
      ownerCode: airlineCode,
      orderId: pnr,
      channel: 'NDC',
    };
  }

  // Order Reshop
  private async OrderReshop({ pnr, airlineCode }: { pnr: string; airlineCode: string }) {
    const OrderReshopRQ = this.orderReshopRequestFormatter(pnr, airlineCode);

    const OrderReshopRS = await this.request.postRequest(
      VerteilAPIEndpoints.ORDER_RESHOP_ENDPOINT,
      OrderReshopRQ,
      {
        headers: {
          service: VerteilAPIEndpoints.ORDER_RESHOP_HEADER_ENDPOINT,
          ThirdpartyId: airlineCode,
          Resource: 'Reprice.V3',
        },
      }
    );

    return { OrderReshopRS, OrderReshopRQ };
  }

  // Order Accept Request Formatter
  private acceptRepricedOrderRequestFormatter({
    pnr,
    airlineCode,
    amount,
    dataMap,
    augmentations,
  }: {
    pnr: string;
    airlineCode: string;
    amount?: { currencyCode: string; units?: string; nanos?: number };
    dataMap: any;
    augmentations: any;
  }): Interfaces.IVerteilOrderChangeRQ {
    return {
      ownerCode: airlineCode,
      orderId: pnr,
      channel: 'NDC',
      acceptRepricedOrder: {
        paymentFunctions: [
          {
            paymentProcessingDetails: {
              typeCode: 'CA',
              amount,
            },
          },
        ],
        dataMap,
        augmentations,
      },
    };
  }

  // Accept Repriced Offer
  private async AcceptRepricedOffer({
    pnr,
    airlineCode,
    OrderReshopRS,
  }: {
    pnr: string;
    airlineCode: string;
    OrderReshopRS: Interfaces.IVerteilOrderReshopRS;
  }) {
    const OrderChangeRQ = this.acceptRepricedOrderRequestFormatter({
      pnr,
      airlineCode,
      dataMap: OrderReshopRS.response?.dataMap,
      augmentations: OrderReshopRS.response?.augmentations,
      amount: OrderReshopRS.response?.repriceResult.totalPrice.totalAmount,
    });

    const OrderChangeRS = await this.request.postRequest(
      VerteilAPIEndpoints.ACCEPT_REPRICE_OFFER_ENDPOINT,
      OrderChangeRQ,
      {
        headers: {
          service: VerteilAPIEndpoints.ACCEPT_REPRICE_OFFER_HEADER_ENDPOINT,
          ThirdpartyId: airlineCode,
          Resource: 'AcceptRepricedOrder.V3',
        },
      }
    );

    return { OrderChangeRS, OrderChangeRQ };
  }

  // Ticket issue (end)//

  // Booking Cancel (start)//
  public orderCancelRequestFormatter(
    pnr: string,
    airlineCode: string
  ): Interfaces.IVerteilOrderCancelRQ {
    return {
      Query: { OrderID: [{ Channel: 'NDC', Owner: airlineCode, value: pnr }] },
    };
  }

  // Order cancel
  public async OrderCancelService({ pnr, airlineCode }: { pnr: string; airlineCode: string }) {
    try {
      const OrderCancelRQ = this.orderCancelRequestFormatter(pnr, airlineCode);

      const OrderCancelRS = await this.request.postRequest(
        VerteilAPIEndpoints.BOOKING_CANCEL_ENDPOINT,
        OrderCancelRQ,
        {
          headers: {
            ThirdpartyId: airlineCode,
            Resource: 'Unpaid',
          },
        }
      );

      if (!OrderCancelRS) throw new CustomError('Cannot cancel the booking ', 400);

      if (OrderCancelRS.Errors)
        throw new Error(
          OrderCancelRS.Errors.Error.map((Er: { value: string }) => Er.value + ' ').join(',')
        );

      if (OrderCancelRS.Response === undefined) throw new Error('No_Response Error');

      if (OrderCancelRS.Success === undefined) throw new Error('Unknown Error.');

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Booking has been cancelled',
      };
    } catch (error) {
      throw new CustomError('Cannot cancel the booking ', 400);
    }
  }

  // Booking Cancel (end)//
}
