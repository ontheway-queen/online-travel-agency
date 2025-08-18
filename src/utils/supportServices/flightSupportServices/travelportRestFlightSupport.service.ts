import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import AbstractServices from '../../../abstract/abstract.service';


import CustomError from '../../../utils/lib/customError';
import { IGetAirlinesPreferenceQuery } from '../../interfaces/dynamicFareRulesModelInterface/airlinesPreferenceModel.interface';
import CommonFlightUtils from '../../lib/flightLib/commonFlightUtils';
import TravelportRESTRequest from '../../lib/flightLib/travelportRestRequest';
import { ROUTE_TYPE, TRAVELPORT_REST_API } from '../../miscellaneous/flightMiscellaneous/flightConstants';
import TravelportApiEndPoints from '../../miscellaneous/flightMiscellaneous/travelportApiEndpoints';
import { IFlightBookingPassengerReqBody } from '../../supportTypes/flightBookingTypes/commonFlightBookingTypes';
import { IFlightAvailability, IFlightSearchReqBody, IFormattedFlightOption, IFormattedPassenger } from '../../supportTypes/flightSupportTypes/commonFlightTypes';
import { IBookingCancel, ICatalogProductOfferingSelection, IFlightBookingTraveler, IFlightSearchProductBrandOptions, IOfferListResponse, IOfferQueryBuildFromCatalogProductOfferings, IPassengerCriteria, ISearchCriteriaFlight, ITravelportFlightSearchBody, ITravelportFlightSearchResponse } from '../../supportTypes/flightSupportTypes/travelportRestFlightTypes';
import { CommonFlightSupport } from './commonFlightSupport.service';

export default class TravelportRestFlightService extends AbstractServices {
    private trx: Knex.Transaction;
    private request = new TravelportRESTRequest();
    private flightSupport: CommonFlightSupport;
    constructor(trx: Knex.Transaction) {
        super();
        this.trx = trx;
        this.flightSupport = new CommonFlightSupport(trx);
    }


    ////////////==================FLIGHT SEARCH (START)=========================///////////
    // Flight Search Request formatter
    private async FlightSearchReqFormatter(
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

console.log({airlineCodeObjects});
        // const commissionModel = this.Model.apiAirlinesCommissionModel(this.trx);
        // const cappingAirlines: { Code: string }[] = await commissionModel.getAPIActiveAirlines(set_flight_api_id);
        // const preferredAirlines: string[] = [];
        // if (cappingAirlines.length) {
        //     cappingAirlines.map((elem) => {
        //         preferredAirlines.push(elem.Code);
        //     })
        // }
        const SearchCriteriaFlight: ISearchCriteriaFlight[] = [];
        const PassengerCriteria: IPassengerCriteria[] = [];

        //origin destination mapping
        body.OriginDestinationInformation.map((elem) => {
            SearchCriteriaFlight.push({
                departureDate: elem.DepartureDateTime.split("T")[0],
                From: {
                    value: elem.OriginLocation.LocationCode
                },
                To: {
                    value: elem.DestinationLocation.LocationCode
                }
            })
        })
        //passenger mapping
        body.PassengerTypeQuantity.map((elem) => {
            if (elem.Code === "ADT" || elem.Code === "INF") {
                PassengerCriteria.push({
                    number: elem.Quantity,
                    passengerTypeCode: elem.Code
                });
            }
            else {
                PassengerCriteria.push({
                    number: elem.Quantity,
                    passengerTypeCode: "CHD"
                });
            }
        })

        return {
            "CatalogProductOfferingsQueryRequest": {
                "CatalogProductOfferingsRequest": {
                    "@type": "CatalogProductOfferingsRequestAir",
                    // "maxNumberOfUpsellsToReturn": 2,
                    "offersPerPage": 200,
                    "contentSourceList": [
                        "GDS"
                    ],
                    PassengerCriteria,
                    SearchCriteriaFlight,
                    "SearchModifiersAir": {
                        "@type": 'SearchModifiersAir',
                        CabinPreference: [
                            {
                                "@type": "CabinPreference",
                                preferenceType: "Permitted",
                                cabins: [
                                    body.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin === "1" ? "Economy" : body.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin === "2" ? "PremiumEconomy" : body.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin === "3" ? "Business" : "First"
                                ]
                            }
                        ],
                        ...(airlineCodeObjects?.length
                            ? {
                                CarrierPreference: [
                                    {
                                        preferenceType: "Permitted",
                                        carriers: airlineCodeObjects
                                    }
                                ]
                            }
                            : {})
                    }
                }
            }
        } as ITravelportFlightSearchBody;
    }

    // Flight search service
    public async FlightSearchService({
        booking_block,
        reqBody,
        dynamic_fare_supplier_id,
    }: {
        reqBody: IFlightSearchReqBody;
        dynamic_fare_supplier_id: number;
        booking_block: boolean;
    }) {
        const route_type = this.flightSupport.routeTypeFinder({
            originDest: reqBody.OriginDestinationInformation,
        });
        const flightRequestBody = await this.FlightSearchReqFormatter(
            reqBody,
            dynamic_fare_supplier_id,
            route_type
        );
        const response = await this.request.postRequest(
            TravelportApiEndPoints.FLIGHT_SEARCH_ENDPOINT,
            flightRequestBody
        );
        // return response
        if (!response) {
            return [];
        }

        const result = await this.FlightSearchResFormatter({
            dynamic_fare_supplier_id,
            booking_block,
            data: response,
            reqBody,
            route_type
        });

        return result;
    }

    private async FlightSearchResFormatter({
        dynamic_fare_supplier_id,
        booking_block,
        data,
        reqBody,
        route_type
    }: {
        data: ITravelportFlightSearchResponse;
        reqBody: IFlightSearchReqBody;
        dynamic_fare_supplier_id: number;
        route_type: 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' | 'SOTO';
        booking_block: boolean;
    }) {
        const commonModel = this.Model.commonModel(this.trx);
        const api_currency = await this.Model.CurrencyModel(
            this.trx
        ).getApiWiseCurrencyByName(TRAVELPORT_REST_API, 'FLIGHT');

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

        const airports: string[] = [];
        const flights: any[] = [];

        const OriginDest =
            reqBody.OriginDestinationInformation;

        OriginDest.forEach((item) => {
            airports.push(item.OriginLocation.LocationCode);
            airports.push(item.DestinationLocation.LocationCode);
        });


        let pax_count = 0;

        reqBody.PassengerTypeQuantity.map((reqPax) => {
            pax_count += reqPax.Quantity;
        });

        //iterate all the catalogProductOffering where sequence is 1
        await Promise.all(data.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.map(async (item1) => {
            if (item1.sequence == 1) {
                //iterate all the productBrandOptions
                await Promise.all(item1.ProductBrandOptions.map(async (item2, ind) => {
                    //get validating airline of the flight
                    const airline = data.CatalogProductOfferingsResponse.ReferenceList
                        .find((item) => item["@type"] === "ReferenceListTermsAndConditions")?.TermsAndConditions?.find((elem) => elem.id === item2.ProductBrandOffering[0].TermsAndConditions.termsAndConditionsRef)?.ValidatingAirline[0].ValidatingAirline;
                    const airline_details = await commonModel.getAirlines(airline || '');

                    //if block airline then continue
                    if (blockedAirlines.find((ba) => ba.Code === airline)) {
                        return;
                    }

                    const flight_result = [];
                    let finalCom = 0;
                    let finalComType = '';
                    let finalComMode = '';
                    const fare = {
                        base_fare: 0,
                        total_tax: 0,
                        ait: 0,
                        discount: 0,
                        payable: 0,
                        vendor_price: {}
                    };
                    let vendor_base_fare = 0;
                    let vendor_charge = 0;

                    let passengers: IFormattedPassenger[] = [];

                    const availability: IFlightAvailability[] = [];

                    const api_key_ref = [];

                    //total flights will be equal to the length of originDestination (oneway, route trip, multi city)
                    for (let k = 0; k < reqBody.OriginDestinationInformation.length; k++) {
                        //get segments of a single flight journey
                        const options: IFormattedFlightOption[] = [];
                        let iterable_item: IFlightSearchProductBrandOptions | undefined = item2;
                        let current_product_offering: any = item1;
                        //find the relatable flight for the non-first flight
                        if (k > 0) {
                            current_product_offering = data.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering.find((cata_item) => {
                                const sequenceMatches = cata_item.sequence === k + 1;
                                const combinabilityCodeMatches = cata_item.ProductBrandOptions.some((brand_item) => {
                                    return brand_item.ProductBrandOffering[0]?.CombinabilityCode[0] === item2.ProductBrandOffering[0].CombinabilityCode[0];
                                });
                                return sequenceMatches && combinabilityCodeMatches;
                            });

                            iterable_item = current_product_offering?.ProductBrandOptions[0];
                        }
                        let elapsed_time = 0;
                        if (iterable_item) {
                            const currentPrice = iterable_item.ProductBrandOffering[0].BestCombinablePrice;
                            //update the fare
                            fare.base_fare += currentPrice.Base;
                            fare.total_tax += currentPrice.TotalTaxes;
                            fare.base_fare += currentPrice.TotalFees;
                            vendor_base_fare += currentPrice.Base;
                            vendor_charge += currentPrice.TotalFees;

                            // Update passengers price for the current item
                            const currentPassengers = iterable_item.ProductBrandOffering[0].BestCombinablePrice.PriceBreakdown.map((price_elem) => {
                                return {
                                    type: price_elem.requestedPassengerType,
                                    number: price_elem.quantity,
                                    fare: {
                                        total_fare: price_elem.Amount.Total,
                                        base_fare: price_elem.Amount.Base,
                                        tax: price_elem.Amount.Taxes.TotalTaxes,
                                    },
                                };
                            });

                            // Aggregate passenger prices
                            currentPassengers.forEach((currentPassenger) => {
                                const existingPassenger = passengers.find((p) => p.type === currentPassenger.type);
                                if (existingPassenger) {
                                    existingPassenger.fare.total_fare += currentPassenger.fare.total_fare;
                                    existingPassenger.fare.base_fare += currentPassenger.fare.base_fare;
                                    existingPassenger.fare.tax += currentPassenger.fare.tax;
                                } else {
                                    passengers.push(currentPassenger);
                                }
                            });

                            // Add baggage and segment details
                            const product_ref = data.CatalogProductOfferingsResponse.ReferenceList
                                .find(item => item["@type"] === "ReferenceListProduct")
                                ?.Product?.find(prodElem => prodElem.id === iterable_item.ProductBrandOffering[0].Product[0].productRef);

                            const availability_segments: any = [];
                            product_ref?.FlightSegment.forEach((segment, ind) => {
                                const availability_passenger: any = [];
                                product_ref?.PassengerFlight.forEach((passenger_elem) => {
                                    const terms_ref = data.CatalogProductOfferingsResponse.ReferenceList
                                        .find(item => item["@type"] === "ReferenceListTermsAndConditions")
                                        ?.TermsAndConditions?.find(prodElem => prodElem.id === iterable_item.ProductBrandOffering[0].TermsAndConditions.termsAndConditionsRef);

                                    const first_check_bag = terms_ref?.BaggageAllowance.find((bag_elm) =>
                                        bag_elm.passengerTypeCodes.includes(passenger_elem.passengerTypeCode) &&
                                        bag_elm.SegmentSequenceList.includes(ind + 1) &&
                                        bag_elm.baggageType === "FirstCheckedBag"
                                    )?.BaggageItem[0];

                                    const first_check_bag_data = first_check_bag?.Measurement
                                        ? { count: first_check_bag.Measurement[0].value, unit: first_check_bag.Measurement[0].unit === "Kilograms" ? "KG" : "pieces" }
                                        : this.extractKgInfo(first_check_bag?.Text || "");

                                    const carry_on_bag = terms_ref?.BaggageAllowance.find((bag_elm) =>
                                        bag_elm.passengerTypeCodes.includes(passenger_elem.passengerTypeCode) &&
                                        bag_elm.SegmentSequenceList.includes(ind + 1) &&
                                        bag_elm.baggageType === "CarryOn"
                                    )?.BaggageItem[0];

                                    const carry_on_bag_data = carry_on_bag?.Measurement
                                        ? { count: carry_on_bag.Measurement[0].value, unit: carry_on_bag.Measurement[0].unit === "Kilograms" ? "KG" : "pieces" }
                                        : this.extractKgInfo(carry_on_bag?.Text || "");

                                    availability_passenger.push({
                                        type: passenger_elem.passengerTypeCode,
                                        count: passenger_elem.passengerQuantity,
                                        available_seat: product_ref.Quantity,
                                        booking_code: passenger_elem.FlightProduct.find((flight_prod_elm) =>
                                            flight_prod_elm.segmentSequence.includes(ind + 1)
                                        )?.classOfService,
                                        cabin_code: CommonFlightUtils.getCabinByName(passenger_elem.FlightProduct.find((flight_prod_elm) =>
                                            flight_prod_elm.segmentSequence.includes(ind + 1)
                                        )?.cabin || "")?.code,
                                        cabin_type: passenger_elem.FlightProduct.find((flight_prod_elm) =>
                                            flight_prod_elm.segmentSequence.includes(ind + 1)
                                        )?.cabin,
                                        baggage_info: `Checked: ${first_check_bag_data.count}${first_check_bag_data.unit}, Cabin: ${carry_on_bag_data.count}${carry_on_bag_data.unit}`
                                    });
                                });

                                availability_segments.push({
                                    name: `Segment-${ind + 1}`,
                                    passenger: availability_passenger,
                                });
                            });

                            availability.push({
                                from_airport: reqBody.OriginDestinationInformation[k].OriginLocation.LocationCode,
                                to_airport: reqBody.OriginDestinationInformation[k].DestinationLocation.LocationCode,
                                segments: availability_segments,
                            });

                            //iterate the segments
                            await Promise.all(iterable_item?.flightRefs?.map(async (flight_ref, ind) => {
                                const flight_details = data?.CatalogProductOfferingsResponse?.ReferenceList
                                    ?.find((item) => item["@type"] === "ReferenceListFlight")?.Flight?.find((elem) => elem.id === flight_ref);

                                if (flight_details) {
                                    const dAirport = await commonModel.getAirportDetails(flight_details.Departure.location);
                                    const AAirport = await commonModel.getAirportDetails(flight_details.Arrival.location);
                                    const marketing_airline = await commonModel.getAirlines(
                                        flight_details.carrier
                                    );
                                    let operating_airline = marketing_airline;
                                    if (flight_details.operatingCarrier) {
                                        operating_airline = await commonModel.getAirlines(
                                            flight_details.operatingCarrier
                                        );
                                    }
                                    const product_details = data.CatalogProductOfferingsResponse.ReferenceList
                                        .find((item) => item["@type"] === "ReferenceListProduct")?.Product?.find((elem) => elem.id === item2.ProductBrandOffering[0].Product[0].productRef)?.PassengerFlight[0].FlightProduct.find((flight_elem) => {
                                            flight_elem.segmentSequence.find((sequence) => sequence === ind + 1);
                                        });

                                    elapsed_time = elapsed_time + this.convertDurationToMinutes(flight_details.duration);

                                    options.push({
                                        id: ind + 1,
                                        elapsedTime: this.convertDurationToMinutes(flight_details.duration),
                                        departure: {
                                            airport_code: flight_details.Departure.location,
                                            airport: dAirport.airport_name,
                                            city: dAirport.city_name,
                                            city_code: dAirport.city_code,
                                            country: dAirport.country,
                                            terminal: flight_details.Departure.terminal,
                                            date: flight_details.Departure.date,
                                            time: flight_details.Departure.time
                                        },
                                        arrival: {
                                            airport_code: flight_details.Arrival.location,
                                            airport: AAirport.airport_name,
                                            city: AAirport.city_name,
                                            city_code: AAirport.city_code,
                                            country: AAirport.country,
                                            terminal: flight_details.Arrival.terminal,
                                            date: flight_details.Arrival.date,
                                            time: flight_details.Arrival.time
                                        },
                                        carrier: {
                                            carrier_marketing_code: flight_details.carrier,
                                            carrier_marketing_airline: marketing_airline.name,
                                            carrier_marketing_logo: marketing_airline.logo,
                                            carrier_marketing_flight_number: String(flight_details.number),
                                            carrier_operating_code: flight_details.operatingCarrier || flight_details.carrier,
                                            carrier_operating_airline: operating_airline.name,
                                            carrier_operating_logo: operating_airline.logo,
                                            carrier_operating_flight_number: String(flight_details.operatingCarrierNumber || flight_details.number),
                                            // cabin_class: product_details?.cabin,
                                            // booking_class: product_details?.classOfService,
                                            carrier_aircraft_code: "",
                                            carrier_aircraft_name: ""
                                        }
                                    });
                                }
                            }));
                        }

                        flight_result.push({
                            id: ind + 1,
                            elapsed_time,
                            layover_time: new CommonFlightUtils().getNewLayoverTime(
                                options
                            ),
                            stoppage: options.length - 1,
                            options
                        });

                        api_key_ref.push({ option: current_product_offering.id, product: iterable_item?.ProductBrandOffering[0].Product[0].productRef });
                    }

                    fare.vendor_price = {
                        base_fare: vendor_base_fare,
                        tax: fare.total_tax,
                        charge: vendor_charge,
                        discount: 0,
                        gross_fare: fare.base_fare + fare.total_tax,
                        net_fare: vendor_base_fare + fare.total_tax + vendor_charge
                    }

                    fare.ait = Math.round(((fare.base_fare + fare.total_tax) / 100) * 0.3);
                    fare.base_fare *= api_currency;
                    fare.total_tax *= api_currency;
                    fare.ait *= api_currency;

                    //calculate system markup
                    const { markup, commission, pax_markup } = await new CommonFlightSupport(
                        this.trx
                    ).calculateFlightMarkup({
                        dynamic_fare_supplier_id,
                        airline: String(airline),
                        base_fare: fare.base_fare,
                        total_segments: flight_result.flatMap(elm => elm.options).length,
                        flight_class: new CommonFlightUtils().getClassFromId(
                            reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin
                        ),
                        route_type,
                    });

                    const total_pax_markup = pax_markup * pax_count;
                    fare.base_fare += markup;
                    fare.base_fare += total_pax_markup;
                    fare.discount += commission;
                    fare.payable =
                        Number((Number(fare.base_fare) +
                            fare.total_tax +
                            fare.ait -
                            Number(fare.discount)).toFixed(2));

                    passengers.map((elm) => {
                        const per_pax_markup = (markup / pax_count) * Number(elm.number);
                        const total_pax_markup = pax_markup * Number(elm.number);
                        const base_fare = ((Number(elm.fare.base_fare) * api_currency) + per_pax_markup + total_pax_markup).toFixed(2);
                        const tax = (Number(elm.fare.tax) * api_currency).toFixed(2);
                        return {
                            type: elm.type,
                            number: elm.number,
                            fare: {
                                base_fare: base_fare,
                                tax: tax,
                                total_fare: Number(base_fare) + Number(tax)
                            }
                        }
                    });

                    //refundable
                    const refundable = data.CatalogProductOfferingsResponse.ReferenceList
                        .find(item => item["@type"] === "ReferenceListBrand")
                        ?.Brand?.find(brandElem => brandElem.id === item2.ProductBrandOffering[0].Brand?.BrandRef)
                        ?.BrandAttribute?.find(attr => attr.classification === "Refund")
                        ?.inclusion === "Included" ||
                        data.CatalogProductOfferingsResponse.ReferenceList
                            .find(item => item["@type"] === "ReferenceListBrand")
                            ?.Brand?.find(brandElem => brandElem.id === item2.ProductBrandOffering[0].Brand?.BrandRef)
                            ?.BrandAttribute?.find(attr => attr.classification === "Refund")
                            ?.inclusion === "Chargeable";


                    flights.push({
                        api_search_id: data.CatalogProductOfferingsResponse.CatalogProductOfferings.Identifier.value + "?" + JSON.stringify(api_key_ref),
                        booking_block,
                        flight_id: uuidv4(),
                        journey_type: reqBody.JourneyType,
                        api: TRAVELPORT_REST_API,
                        fare,
                        leg_description: [],
                        refundable,
                        carrier_code: airline,
                        carrier_name: airline_details?.name,
                        carrier_logo: airline_details?.logo,
                        ticket_last_date: "",
                        ticket_last_time: "",
                        flights: flight_result,
                        passengers,
                        availability
                    })
                }));
            }
        }));


        return flights;
    }

    ///==================FLIGHT SEARCH (END)=========================///






    //////////==================FLIGHT REVALIDATE (START)=========================///////////
    //flight revalidate
    public async FlightRevalidateService({
        api_search_id,
        dynamic_fare_supplier_id,
        booking_block,
        reqBody,
        flight_id
    }: {
        api_search_id: string;
        dynamic_fare_supplier_id: number;
        booking_block: boolean;
        reqBody: IFlightSearchReqBody;
        flight_id: string;
    }) {
        const revalidate_req_body = await this.RevalidateFlightReqFormatter(api_search_id);
        // return revalidate_req_body
        const response = await this.request.postRequest(
            TravelportApiEndPoints.FLIGHT_REVALIDATE_ENDPOINT,
            revalidate_req_body
        );
        if (!response) {
            throw new CustomError('Flight not available', 404);
        }
        //   return response
        if (!response?.OfferListResponse?.OfferID) {
            throw new CustomError(
                'Flight not available',
                404
            );
        }

        const data = await this.RevalidateFlightResFormatter({
            dynamic_fare_supplier_id,
            booking_block,
            reqBody,
            data: response,
            flight_id,
            api_search_id
        });
        return data;
    }

    // Revalidate Flight Request Formatter
    private async RevalidateFlightReqFormatter(
        api_search_id: string
    ) {
        const identifier = api_search_id.split("?")[0];
        const offer = api_search_id.split("?")[1];
        const offer_obj = JSON.parse(offer);
        const CatalogProductOfferingSelection: ICatalogProductOfferingSelection[] = [];
        offer_obj.map((elem: { option: string, product: string }) => {
            CatalogProductOfferingSelection.push({
                CatalogProductOfferingIdentifier: {
                    Identifier: {
                        value: elem.option
                    }
                },
                ProductIdentifier: [
                    {
                        Identifier: {
                            value: elem.product
                        }
                    }
                ]
            })
        })
        return {
            OfferQueryBuildFromCatalogProductOfferings: {
                BuildFromCatalogProductOfferingsRequest: {
                    "@type": "BuildFromCatalogProductOfferingsRequestAir",
                    validateInventoryInd: true,
                    CatalogProductOfferingsIdentifier: {
                        Identifier: {
                            value: identifier
                        }
                    },
                    CatalogProductOfferingSelection
                }
            }
        } as IOfferQueryBuildFromCatalogProductOfferings
    }

    // Revalidate Response formatter
    private async RevalidateFlightResFormatter({
        dynamic_fare_supplier_id,
        booking_block,
        data,
        reqBody,
        flight_id,
        api_search_id
    }: {
        data: IOfferListResponse;
        reqBody: IFlightSearchReqBody;
        dynamic_fare_supplier_id: number;
        booking_block: boolean;
        flight_id: string;
        api_search_id: string;
    }) {
        const commonModel = this.Model.commonModel(this.trx);
        const api_currency = await this.Model.CurrencyModel(
            this.trx
        ).getApiWiseCurrencyByName(TRAVELPORT_REST_API, 'FLIGHT');

        const route_type = this.flightSupport.routeTypeFinder({
            originDest: reqBody.OriginDestinationInformation,
        });
        const commissionModel = this.Model.apiAirlinesCommissionModel(this.trx);
        const routeConfigModel = this.Model.flightRouteConfigModel(this.trx);
        const airports: string[] = [];

        const OriginDest =
            reqBody.OriginDestinationInformation;

        OriginDest.forEach((item) => {
            airports.push(item.OriginLocation.LocationCode);
            airports.push(item.DestinationLocation.LocationCode);
        });

        // let finalCom = 0;
        // let finalComType = '';
        // let finalComMode = '';

        // // routes commission check
        // const routeComCheck = await routeConfigModel.getSetRoutesCommission(
        //     {
        //         status: true,
        //         departure: airports[0],
        //         arrival: airports[1],
        //         commission_set_id,
        //     },
        //     false
        // );

        const validating_carrier = data.OfferListResponse.OfferID[0].TermsAndConditionsFull[0].ValidatingAirline[0].ValidatingAirline;
        const airline_details = await commonModel.getAirlines(validating_carrier);
        // // Set commission if route commission is available
        // if (routeComCheck.data.length) {
        //     if (routeComCheck.data.length > 1) {
        //         const routeComFoundOfAirline = routeComCheck.data.find(
        //             (item) => item.airline === validating_carrier
        //         );
        //         if (routeComFoundOfAirline) {
        //             const { commission, com_type, com_mode } = routeComFoundOfAirline;
        //             finalCom = commission;
        //             finalComMode = com_mode;
        //             finalComType = com_type;
        //         }
        //     } else {
        //         const { commission, com_type, com_mode, airline } =
        //             routeComCheck.data[0];

        //         if (!airline || airline === validating_carrier) {
        //             finalCom = commission;
        //             finalComMode = com_mode;
        //             finalComType = com_type;
        //         }
        //     }
        // }

        // // Set commission if route commission is not available and airlines commission is available
        // if (!finalCom && !finalComType && !finalComMode) {
        //     //airline commission
        //     const comCheck = await commissionModel.getAPIAirlinesCommission(
        //         {
        //             airline: validating_carrier,
        //             status: true,
        //             set_flight_api_id,
        //             limit: '1',
        //         },
        //         false
        //     );

        //     // Set Amount
        //     if (comCheck.data.length) {
        //         const {
        //             com_domestic,
        //             com_from_dac,
        //             com_to_dac,
        //             com_soto,
        //             com_type,
        //             com_mode,
        //         } = comCheck.data[0];

        //         let allBdAirport = true;
        //         let existBdAirport = false;

        //         for (const airport of airports) {
        //             if (BD_AIRPORT.includes(airport)) {
        //                 if (!existBdAirport) {
        //                     existBdAirport = true;
        //                 }
        //             } else {
        //                 allBdAirport = false;
        //             }
        //         }

        //         if (allBdAirport) {
        //             // Domestic
        //             finalCom = com_domestic;
        //             finalComMode = com_mode;
        //             finalComType = com_type;
        //         } else if (BD_AIRPORT.includes(airports[0])) {
        //             // From Dhaka
        //             finalCom = com_from_dac;
        //             finalComMode = com_mode;
        //             finalComType = com_type;
        //         } else if (existBdAirport) {
        //             // To Dhaka
        //             finalCom = com_to_dac;
        //             finalComMode = com_mode;
        //             finalComType = com_type;
        //         } else {
        //             // Soto
        //             finalCom = com_soto;
        //             finalComMode = com_mode;
        //             finalComType = com_type;
        //         }
        //     }
        // }


        // fare.total_price += data.OfferListResponse.OfferID[0].Price.TotalPrice;
        // fare.payable = fare.total_price + fare.convenience_fee - fare.discount;

        //flights
        const flights = await Promise.all(data.OfferListResponse.OfferID[0].Product.map(async (product_elem, ind) => {
            let elapsed_time = 0;
            const options = await Promise.all(product_elem.FlightSegment.map(async (segment_elem, ind) => {
                const dAirport = await commonModel.getAirportDetails(segment_elem.Flight.Departure.location);
                const AAirport = await commonModel.getAirportDetails(segment_elem.Flight.Arrival.location);
                const marketing_airline = await commonModel.getAirlines(
                    segment_elem.Flight.carrier
                );
                let operating_airline = marketing_airline;
                if (segment_elem.Flight.operatingCarrier && segment_elem.Flight.operatingCarrier !== segment_elem.Flight.carrier) {
                    operating_airline = await commonModel.getAirlines(
                        segment_elem.Flight.operatingCarrier
                    );
                }
                const product_details = product_elem.PassengerFlight[0].FlightProduct.find((flight_elem) => {
                    flight_elem.segmentSequence.find((sequence) => sequence === ind + 1);
                });
                elapsed_time += Number(this.convertDurationToMinutes(segment_elem.Flight.duration))
                return {
                    id: ind + 1,
                    elapsedTime: this.convertDurationToMinutes(segment_elem.Flight.duration),
                    departure: {
                        airport_code: segment_elem.Flight.Departure.location,
                        airport: dAirport.airport_name,
                        city: dAirport.city_name,
                        city_code: dAirport.city_code,
                        country: dAirport.country,
                        terminal: segment_elem.Flight.Departure.terminal || "",
                        date: segment_elem.Flight.Departure.date,
                        time: segment_elem.Flight.Departure.time
                    },
                    arrival: {
                        airport_code: segment_elem.Flight.Arrival.location,
                        airport: AAirport.airport_name,
                        city: AAirport.city_name,
                        city_code: AAirport.city_code,
                        country: AAirport.country,
                        terminal: segment_elem.Flight.Arrival.terminal || "",
                        date: segment_elem.Flight.Arrival.date,
                        time: segment_elem.Flight.Arrival.time
                    },
                    carrier: {
                        carrier_marketing_code: segment_elem.Flight.carrier,
                        carrier_marketing_airline: marketing_airline.name,
                        carrier_marketing_logo: marketing_airline.logo,
                        carrier_marketing_flight_number: String(segment_elem.Flight.number),
                        carrier_operating_code: segment_elem.Flight.operatingCarrier || segment_elem.Flight.carrier,
                        carrier_operating_airline: operating_airline.name,
                        carrier_operating_logo: operating_airline.logo,
                        carrier_operating_flight_number: String(segment_elem.Flight.operatingCarrierNumber || segment_elem.Flight.number),
                        carrier_aircraft_code: "",
                        carrier_aircraft_name: ""
                    }
                }
            }));
            return {
                id: ind + 1,
                elapsed_time,
                layover_time: new CommonFlightUtils().getNewLayoverTime(
                    options
                ),
                stoppage: options.length - 1,
                options
            }
        }));
        //refundable
        const refundable = data.OfferListResponse.ReferenceList
            .find(item => item["@type"] === "ReferenceListBrand")
            ?.Brand?.find(brandElem => brandElem.id === data.OfferListResponse.OfferID[0].Product[0].PassengerFlight[0].FlightProduct[0].Brand.BrandRef)
            ?.BrandAttribute?.find(attr => attr.classification === "Refund")
            ?.inclusion === "Included" ||
            data.OfferListResponse.ReferenceList
                .find(item => item["@type"] === "ReferenceListBrand")
                ?.Brand?.find(brandElem => brandElem.id === data.OfferListResponse.OfferID[0].Product[0].PassengerFlight[0].FlightProduct[0].Brand.BrandRef)
                ?.BrandAttribute?.find(attr => attr.classification === "Refund")
                ?.inclusion === "Chargeable";

        //passenger
        const passengers = data.OfferListResponse.OfferID[0].Price.PriceBreakdown.map((price_elem) => {
            return {
                type: price_elem.requestedPassengerType,
                number: price_elem.quantity,
                fare: {
                    total_fare: price_elem.Amount.Total,
                    base_fare: price_elem.Amount.Base,
                    tax: price_elem.Amount.Taxes.TotalTaxes
                }
            }
        });
        //availability
        const availability = reqBody.OriginDestinationInformation.map((originDes_elem, ind) => {
            const segments = data.OfferListResponse.OfferID[0].Product[ind].FlightSegment.map((flightSeg_elem, ind2) => {
                const passenger = reqBody.PassengerTypeQuantity.map((passenger_elem) => {
                    const baggage_details = data.OfferListResponse.OfferID[0].TermsAndConditionsFull[0].BaggageAllowance.filter((baggage_elem) =>
                        baggage_elem.ProductRef.find((prod_ref) => prod_ref === data.OfferListResponse.OfferID[0].Product[ind].id) &&
                        baggage_elem.SegmentSequenceList.some((segm_elem) => segm_elem == (ind2 + 1)) &&
                        baggage_elem.passengerTypeCodes.find((pass_elem) => pass_elem[0] == passenger_elem.Code[0])
                    );
                    const first_check_bag = baggage_details?.find((bag_elm) =>
                        bag_elm.passengerTypeCodes.some((code) => code[0] === passenger_elem.Code[0]) &&
                        bag_elm.SegmentSequenceList.includes(ind2 + 1) &&
                        bag_elm.baggageType === "FirstCheckedBag"
                    )?.BaggageItem?.[0];

                    const first_check_bag_data = first_check_bag?.Measurement
                        ? { count: first_check_bag.Measurement[0].value, unit: first_check_bag.Measurement[0].unit === "Kilograms" ? "KG" : "pieces" }
                        : this.extractKgInfo(first_check_bag?.Text || "");

                    const carry_on_bag = baggage_details.find((bag_elm) =>
                        bag_elm.passengerTypeCodes.some((code) => code[0] === passenger_elem.Code[0]) &&
                        bag_elm.SegmentSequenceList.includes(ind2 + 1) &&
                        bag_elm.baggageType === "CarryOn"
                    )?.BaggageItem?.[0];

                    const carry_on_bag_data = carry_on_bag?.Measurement
                        ? { count: carry_on_bag.Measurement[0].value, unit: carry_on_bag.Measurement[0].unit === "Kilograms" ? "KG" : "pieces" }
                        : this.extractKgInfo(carry_on_bag?.Text || "");

                    const booking_ref = data.OfferListResponse.OfferID[0].Product[ind].PassengerFlight.find((passenger_item) =>
                        passenger_item.passengerTypeCode[0] == passenger_elem.Code[0] &&
                        passenger_item.FlightProduct.find((elm) =>
                            elm.segmentSequence.find((segm) => segm === ind2 + 1)
                        )
                    )?.FlightProduct.find((elm) =>
                        elm.segmentSequence.find((segm) => segm === ind2 + 1)
                    );

                    return {
                        type: passenger_elem.Code,
                        count: passenger_elem.Quantity,
                        available_seat: "",
                        booking_code: booking_ref?.classOfService,
                        cabin_code: new CommonFlightUtils().getCabinCodeForRevalidate(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin),
                        cabin_type: booking_ref?.cabin,
                        baggage_info: `Checked: ${first_check_bag_data.count}${first_check_bag_data.unit}, Cabin: ${carry_on_bag_data.count}${carry_on_bag_data.unit}`
                    }
                });
                return {
                    name: `Segment-${ind2 + 1}`,
                    passenger
                }
            });

            return {
                from_airport: originDes_elem.OriginLocation.LocationCode,
                to_airport: originDes_elem.DestinationLocation.LocationCode,
                segments
            }
        });

        //calculate price
        const fare = {
            base_fare: 0,
            total_tax: 0,
            ait: 0,
            discount: 0,
            payable: 0,
            vendor_price: {
                base_fare: data.OfferListResponse.OfferID[0].Price.Base,
                tax: data.OfferListResponse.OfferID[0].Price.TotalTaxes,
                charge: data.OfferListResponse.OfferID[0].Price.TotalFees,
                discount: 0,
                gross_fare: Number(data.OfferListResponse.OfferID[0].Price.Base) + Number(data.OfferListResponse.OfferID[0].Price.TotalTaxes),
                net_fare: data.OfferListResponse.OfferID[0].Price.TotalPrice
            }
        };
        fare.base_fare += data.OfferListResponse.OfferID[0].Price.Base;
        fare.total_tax += data.OfferListResponse.OfferID[0].Price.TotalTaxes;
        fare.base_fare += data.OfferListResponse.OfferID[0].Price.TotalFees;

        fare.ait = Math.round(((fare.base_fare + fare.total_tax) / 100) * 0.3);
        //currency conversion
        fare.base_fare *= api_currency;
        fare.total_tax *= api_currency;
        fare.payable *= api_currency;
        fare.ait *= api_currency;
        //calculate system markup
        const { markup, commission, pax_markup } = await new CommonFlightSupport(
            this.trx
        ).calculateFlightMarkup({
            dynamic_fare_supplier_id,
            airline: validating_carrier,
            base_fare: fare.base_fare,
            total_segments: flights.flatMap(elm => elm.options).length,
            flight_class: new CommonFlightUtils().getClassFromId(
                reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin
            ),
            route_type,
        });

        let pax_count = 0;

        reqBody.PassengerTypeQuantity.map((reqPax) => {
            pax_count += reqPax.Quantity;
        });

        const total_pax_markup = pax_markup * pax_count;
        fare.base_fare += markup;
        fare.base_fare += total_pax_markup;
        fare.discount += commission;

        fare.payable =
            Number((Number(fare.base_fare) +
                fare.total_tax +
                fare.ait -
                Number(fare.discount)).toFixed(2));

        passengers.map((elm) => {
            const per_pax_markup = (markup / pax_count) * Number(elm.number);
            const total_pax_markup = pax_markup * Number(elm.number);
            const base_fare = ((Number(elm.fare.base_fare) * api_currency) + per_pax_markup + total_pax_markup).toFixed(2);
            const tax = (Number(elm.fare.tax) * api_currency).toFixed(2);
            return {
                type: elm.type,
                number: elm.number,
                fare: {
                    base_fare: base_fare,
                    tax: tax,
                    total_fare: Number(base_fare) + Number(tax)
                }
            }
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
                flight_api_name: TRAVELPORT_REST_API,
                airline: validating_carrier,
                refundable,
                travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                domestic: true,
            });
        } else if (route_type === ROUTE_TYPE.FROM_DAC) {
            //from dac
            partial_payment = await this.Model.PartialPaymentRuleModel(
                this.trx
            ).getPartialPaymentCondition({
                flight_api_name: TRAVELPORT_REST_API,
                airline: validating_carrier,
                from_dac: true,
                refundable,
                travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
            });
        } else if (route_type === ROUTE_TYPE.TO_DAC) {
            //to dac
            partial_payment = await this.Model.PartialPaymentRuleModel(
                this.trx
            ).getPartialPaymentCondition({
                flight_api_name: TRAVELPORT_REST_API,
                airline: validating_carrier,
                to_dac: true,
                refundable,
                travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
            });
        } else {
            //soto
            partial_payment = await this.Model.PartialPaymentRuleModel(
                this.trx
            ).getPartialPaymentCondition({
                flight_api_name: TRAVELPORT_REST_API,
                airline: validating_carrier,
                refundable,
                travel_date: reqBody.OriginDestinationInformation[0].DepartureDateTime,
                soto: true,
            });
        }

        return {
            api_search_id,
            booking_block,
            flight_id,
            price_changed: false,
            journey_type: reqBody.JourneyType,
            api: TRAVELPORT_REST_API,
            direct_ticket_issue: false,
            domestic_flight: route_type === ROUTE_TYPE.DOMESTIC,
            partial_payment,
            fare,
            leg_description: [],
            refundable,
            carrier_code: validating_carrier,
            carrier_name: airline_details?.name,
            carrier_logo: airline_details?.logo,
            ticket_last_date: "",
            ticket_last_time: "",
            flights,
            passengers,
            availability
        }
    }
    ///==================FLIGHT REVALIDATE (END)=========================///





    /////==============FLIGHT BOOKING (START) ========================/////////
    //request body for workbench creation
    private CreateWorkbenchRequestBodyFormatter() {
        return {
            ReservationID: {
                "@type": "ReservationID"
            }
        }
    }

    //request body for traveler add
    private async AddTravelerRequestBodyFormatter({
        index,
        data
    }: {
        index: number,
        data: IFlightBookingPassengerReqBody
    }): Promise<IFlightBookingTraveler> {
        let issuing_country: { id: number, name: string, iso: string, iso3: string }[] = [];
        if (data.issuing_country) {
            issuing_country = await this.Model.commonModel().getAllCountry({ id: Number(data.issuing_country) });
        }
        let nationality: { id: number, name: string, iso: string, iso3: string }[] = issuing_country;
        if (data.nationality && data.nationality !== data.issuing_country) {
            nationality = await this.Model.commonModel().getAllCountry({ id: Number(data.nationality) });
        }
        return {
            Traveler: {
                "@type": "Traveler",
                birthDate: data.date_of_birth,
                gender: data.gender as "Male" | "Female",
                passengerTypeCode: data.type.startsWith("A") ? "ADT" : data.type.startsWith("C") ? "CNN" : "INF",
                id: `trav_${index}`,
                PersonName: {
                    "@type": "PersonNameDetail",
                    Prefix: data.reference,
                    Given: data.first_name,
                    Surname: data.last_name

                },
                Telephone: data.contact_number ?
                    [
                        {
                            "@type": "Telephone",
                            phoneNumber: data.contact_number,
                            role: "Home"
                        }
                    ]
                    :
                    undefined,
                Email: data.contact_email ?
                    [
                        {
                            value: data.contact_email
                        }
                    ]
                    :
                    undefined,
                TravelDocument: data.passport_number ?
                    [
                        {
                            "@type": "TravelDocumentDetail",
                            docNumber: data.passport_number,
                            docType: "Passport",
                            expireDate: data.passport_expiry_date,
                            issueCountry: issuing_country[0].iso3,
                            birthDate: data.date_of_birth,
                            birthCountry: nationality[0].iso3,
                            Gender: data.gender as "Male" | "Female",
                            PersonName: {
                                "@type": "PersonName",
                                Prefix: data.reference,
                                Given: data.first_name,
                                Surname: data.last_name
                            }
                        }
                    ]
                    :
                    undefined
            }
        }
    }

    //flight booking service
    public async FlightBookingService({
        api_search_id,
        traveler
    }: {
        api_search_id: any;
        traveler: IFlightBookingPassengerReqBody[];
    }) {
        return await this.db.transaction(async (trx) => {
            //create workbench for booking
            const workbench_body = this.CreateWorkbenchRequestBodyFormatter();
            const create_workbench = await this.request.postRequest(
                TravelportApiEndPoints.CREATE_WORKBENCH_ENDPOINT,
                workbench_body
            );
            if (!create_workbench) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "An issue occurred while creating workbench"
                }
            }
            console.log("workbench created");
            const workbench_identifier = create_workbench?.ReservationResponse?.Reservation?.Identifier?.value;

            //add offer
            const offer_body = await this.RevalidateFlightReqFormatter(api_search_id);
            // return offer_body
            const offer_res = await this.request.postRequest(
                TravelportApiEndPoints.ADD_OFFER_PREFIX_ENDPOINT + `/${workbench_identifier}` + TravelportApiEndPoints.ADD_OFFER_POSTFIX_ENDPOINT,
                offer_body
            );
            // return {code:200,offer_res}
            if (!offer_res) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "An issue occurred while generating the offer for flight"
                }
            }
            console.log("offer created");

            //add traveler
            let adult_ind = 1, child_ind = 1, inf_ind = 1;
            for (let i = 0; i < traveler.length; i++) {
                const index = traveler[i].type.startsWith("A") ? adult_ind++
                    : traveler[i].type.startsWith("C") ? child_ind++
                        : inf_ind++;

                const traveler_body = await this.AddTravelerRequestBodyFormatter({ index, data: traveler[i] });
                const traveler_res = await this.request.postRequest(
                    TravelportApiEndPoints.ADD_TRAVELER_PREFIX_ENDPOINT + `/${workbench_identifier}` + TravelportApiEndPoints.ADD_TRAVELER_POSTFIX_ENDPOINT,
                    traveler_body
                );
                if (!traveler_res) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: `An issue occurred while adding passenger no ${i + 1}`
                    }
                }
            }
            console.log("traveler created");

            //commit workbench
            const commit_res = await this.request.postRequest(
                TravelportApiEndPoints.COMMIT_WORKBENCH_ENDPOINT + `/${workbench_identifier}`,
                undefined
            );
            if (!commit_res) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "An issue occurred while committing the booking"
                }
            }
            console.log("commit done");
            if (commit_res?.ReservationResponse?.Reservation?.Receipt?.[0]?.Confirmation?.Locator?.value) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "This flight has been booked",
                    pnr: commit_res.ReservationResponse.Reservation.Receipt[0].Confirmation.Locator.value,
                    airline_pnr: commit_res.ReservationResponse.Reservation.Receipt?.[1]?.Confirmation?.Locator?.value,
                    ticket_issue_last_time: commit_res.ReservationResponse.Reservation.Offer?.[0]?.TermsAndConditionsFull?.find(
                        (t: { PaymentTimeLimit: any; }) => t.PaymentTimeLimit
                    )?.PaymentTimeLimit
                }
            } else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: "Cannot book the flight now"
                }
            }

        });
    }
    /////==============FLIGHT BOOKING (END) ========================/////////

























    ///==================TICKET ISSUE (START)=========================///


    ///==================TICKET ISSUE (END)=========================///










    /////////==================BOOKING CANCEL (START)=========================//////////
    public async BookingCancelService({
        pnr
    }: {
        pnr: string
    }
    ) {
        //call reservation cancel api
        const cancel_res: IBookingCancel = await this.request.nodeJSRequestModule(
            TravelportApiEndPoints.CANCEL_BOOKING_PREFIX_ENDPOINT + `/${pnr}` + TravelportApiEndPoints.CANCEL_BOOKING_POSTFIX_ENDPOINT,
            undefined,
            'POST'
        );

        if (!cancel_res || cancel_res?.ReceiptListResponse?.Result?.Error) {
            return {
                success: false,
                code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                message: "An error occurred while cancelling the booking",
                error: cancel_res?.ReceiptListResponse?.Result?.Error
            }
        }

        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: "Booking has been cancelled successfully"
        }
    }


    ///==================BOOKING CANCEL (END)=========================///





    /////////==================UTILS (START)=========================//////////
    //convert PT%H%M format time to minute
    private convertDurationToMinutes(duration: string) {
        const hoursMatch = duration.match(/(\d+)H/); // Extract hours
        const minutesMatch = duration.match(/(\d+)M/); // Extract minutes

        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

        return (hours * 60) + minutes;
    }

    //convert baggage info in kg
    private extractKgInfo(text: string) {
        const match = text.match(/(\d+)\s*KG/i); // Regex to find weight in KG
        if (match) {
            return {
                count: parseInt(match[1], 10),
                unit: "KG"
            };
        } else {
            // No KG information found
            return {
                count: 0,
                unit: "KG"
            };
        }
    }

    ///==================UTILS (END)=========================///

}
