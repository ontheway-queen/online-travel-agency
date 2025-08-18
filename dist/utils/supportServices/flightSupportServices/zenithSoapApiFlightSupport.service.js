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
exports.ZenithSoapApiFlightSupport = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config/config"));
const zenithSoapApiEndpoints_1 = __importDefault(require("../../miscellaneous/flightMiscellaneous/zenithSoapApiEndpoints"));
const soapJsonConverter_1 = require("../../lib/soapJsonConverter");
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
const commonFlightSupport_service_1 = require("./commonFlightSupport.service");
const commonFlightUtils_1 = __importDefault(require("../../lib/flightLib/commonFlightUtils"));
const { parseStringPromise } = require('xml2js');
class ZenithSoapApiFlightSupport extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    FlightRequestFormatter(reqBody) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // Extract data from JSON
            const { OriginDestinationInformation, PassengerTypeQuantity } = reqBody;
            const cabinClassCode = this.mapCabinCode(((_c = (_b = (_a = OriginDestinationInformation[0]) === null || _a === void 0 ? void 0 : _a.TPA_Extensions) === null || _b === void 0 ? void 0 : _b.CabinPref) === null || _c === void 0 ? void 0 : _c.Cabin) || '1');
            // Generate OriginDestination elements
            const originDestinations = OriginDestinationInformation.map((segment, index) => `
    <d5p1:OriginDestination>
      <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
      <d5p1:DestinationCode>${segment.DestinationLocation.LocationCode}</d5p1:DestinationCode>
      <d5p1:OriginCode>${segment.OriginLocation.LocationCode}</d5p1:OriginCode>
      <d5p1:TargetDate>${segment.DepartureDateTime}+06:00</d5p1:TargetDate>
    </d5p1:OriginDestination>
  `).join('');
            // Generate Passenger elements
            const passengers = PassengerTypeQuantity.map((pax, index) => `
    <d5p1:Passenger>
      <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
      <d5p1:NameElement i:nil="true"/>
      <d5p1:PassengerQuantity>${pax.Quantity}</d5p1:PassengerQuantity>
      <d5p1:PassengerTypeCode>${this.mapPassengerCode(pax.Code)}</d5p1:PassengerTypeCode>
      <d5p1:Ref>P_${index}</d5p1:Ref>
      <d5p1:RefClient i:nil="true"/>
    </d5p1:Passenger>
  `).join('');
            // Construct SOAP XML body
            return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <SearchFlights xmlns="http://tempuri.org/">
      <request xmlns:d4p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Messages" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
        <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
        <d4p1:RequestInfo xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects">
          <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
          <d5p1:AuthenticationKey>${config_1.default.US_BANGLA_API_KEY}</d5p1:AuthenticationKey>
          <d5p1:CultureName>en-GB</d5p1:CultureName>
          <d5p1:EchoToken>${this.generateGuid()}</d5p1:EchoToken>
        </d4p1:RequestInfo>
        <d4p1:AvailabilitySettings xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
          <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
          <d5p1:CabinClassCode>${cabinClassCode}</d5p1:CabinClassCode>
          <d5p1:IncludeSegmentStops>false</d5p1:IncludeSegmentStops>
          <d5p1:MaxConnectionCount>8</d5p1:MaxConnectionCount>
          <d5p1:RealAvailability>false</d5p1:RealAvailability>
        </d4p1:AvailabilitySettings>
        <d4p1:FareDisplaySettings xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Pricing">
          <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
          <d5p1:ECouponBookCodes/>
          <d5p1:FareLevels i:nil="true"/>
          <d5p1:FareVisibilityCode i:nil="true"/>
          <d5p1:FarebasisCodes xmlns:d6p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays"/>
          <d5p1:ManualCombination>false</d5p1:ManualCombination>
          <d5p1:PromoCode i:nil="true"/>
          <d5p1:ShowWebClasses>true</d5p1:ShowWebClasses>
          <d5p1:WebClassesCodes xmlns:d6p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays"/>
          <d5p1:RewardSearch>false</d5p1:RewardSearch>
          <d5p1:SaleCurrencyCode>BDT</d5p1:SaleCurrencyCode>
        </d4p1:FareDisplaySettings>
        <d4p1:OriginDestinations xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
          ${originDestinations}
        </d4p1:OriginDestinations>
        <d4p1:Passengers xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
          ${passengers}
        </d4p1:Passengers>
      </request>
    </SearchFlights>
  </s:Body>
</s:Envelope>`;
        });
    }
    FlightSearchService(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, booking_block, reqBody, }) {
            const requestBody = yield this.FlightRequestFormatter(reqBody);
            // console.log({ requestBody });
            const response = yield axios_1.default.post(config_1.default.ZENITH_URL, requestBody, {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': zenithSoapApiEndpoints_1.default.FLIGHT_SEARCH_HEADERS,
                    'Accept': 'text/xml',
                },
            });
            console.log({ response });
            try {
                const jsonOutput = yield new soapJsonConverter_1.SoapJsonConverter().xmlToJson(response.data);
                return jsonOutput;
                console.log('JSON Output:', JSON.stringify(jsonOutput, null, 2));
                // return jsonOutput;
            }
            catch (error) {
                console.error('Failed to convert XML to JSON:', error);
            }
        });
    }
    FlightSearchResponseFormatter(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dynamic_fare_supplier_id, booking_block, data, reqBody, flight_id, route_type, }) {
            const commonModel = this.Model.commonModel(this.trx);
            const api_currency = yield this.Model.CurrencyModel(this.trx).getApiWiseCurrencyByName(flightConstants_1.US_BANGLA_API, 'FLIGHT');
            let pax_count = 0;
            reqBody.PassengerTypeQuantity.map((reqPax) => {
                pax_count += reqPax.Quantity;
            });
            data["s:Body"].SearchFlightsResponse.SearchFlightsResult["a:FareInfo"]["b:Itineraries"]["b:Itinerary"].map((flight_elm) => __awaiter(this, void 0, void 0, function* () {
                //price modification
                const vendor_price = {
                    base_fare: Number(flight_elm["b:SaleCurrencyAmount"]["b:BaseAmount"]),
                    tax: Number(flight_elm["b:SaleCurrencyAmount"]["b:TaxAmount"]),
                    discount: Number(flight_elm["b:SaleCurrencyAmount"]["b:DiscountAmount"]),
                    charge: 0,
                    gross_fare: Number(flight_elm["b:SaleCurrencyAmount"]["b:TotalAmount"]),
                    net_fare: Number(flight_elm["b:SaleCurrencyAmount"]["b:TotalAmount"])
                };
                const fare = {
                    base_fare: Number(flight_elm["b:SaleCurrencyAmount"]["b:BaseAmount"]),
                    total_tax: Number(flight_elm["b:SaleCurrencyAmount"]["b:TaxAmount"]),
                    ait: 0,
                    discount: Number(flight_elm["b:SaleCurrencyAmount"]["b:DiscountAmount"]),
                    payable: Number(flight_elm["b:SaleCurrencyAmount"]["b:TotalAmount"]),
                    vendor_price,
                    tax_fare: []
                };
                fare.ait = Math.round(((fare.base_fare + fare.total_tax) / 100) * 0.3);
                fare.base_fare *= api_currency;
                fare.total_tax *= api_currency;
                fare.payable *= api_currency;
                fare.ait *= api_currency;
                const { markup, commission, pax_markup } = yield new commonFlightSupport_service_1.CommonFlightSupport(this.trx).calculateFlightMarkup({
                    dynamic_fare_supplier_id,
                    airline: 'BS',
                    base_fare: fare.base_fare,
                    total_segments: flight_elm["b:AirOriginDestinations"]["b:AirOriginDestination"].length,
                    flight_class: new commonFlightUtils_1.default().getClassFromId(reqBody.OriginDestinationInformation[0].TPA_Extensions.CabinPref.Cabin),
                    route_type,
                });
                const flight_ref = flight_elm["b:Ref"];
                const fare_details = data["s:Body"].SearchFlightsResponse.SearchFlightsResult["a:FareInfo"]["b:ETTicketFares"]["b:ETTicketFare"].filter((fare_ref) => fare_ref["b:RefItinerary"] === flight_ref);
                //get tax fares
                let tax_fare = [];
                fare_details === null || fare_details === void 0 ? void 0 : fare_details.map((elm) => {
                    const passenger = data["s:Body"].SearchFlightsResponse.SearchFlightsResult["a:Passengers"]["b:Passenger"]
                        .find((pass_elm) => pass_elm["b:Ref"] === elm["b:RefPassenger"]);
                    if (!passenger) {
                        return;
                    }
                    for (let i = 0; i < passenger["b:PassengerQuantity"]; i++) {
                        const passengerTaxes = [];
                        elm["b:Taxes"]["b:TicketTax"].map((tax_elm) => {
                            passengerTaxes.push({
                                code: tax_elm["b:Code"],
                                amount: tax_elm["b:SaleCurrencyAmount"]
                            });
                        });
                        tax_fare.push(passengerTaxes);
                    }
                });
                fare.tax_fare = tax_fare;
                let { tax_markup, tax_commission } = yield new commonFlightSupport_service_1.CommonFlightSupport(this.trx).calculateFlightTaxMarkup({
                    dynamic_fare_supplier_id,
                    tax: tax_fare,
                    route_type,
                    airline: "BS",
                });
                tax_commission = tax_commission * api_currency;
                tax_markup = tax_markup * api_currency;
                let pax_count = 0;
                reqBody.PassengerTypeQuantity.map((reqPax) => {
                    pax_count += reqPax.Quantity;
                });
                const total_pax_markup = pax_markup * pax_count;
                fare.base_fare += markup;
                fare.base_fare += total_pax_markup;
                fare.base_fare += tax_markup;
                fare.discount += commission;
                fare.discount += tax_commission;
                fare.payable =
                    Number(fare.base_fare) +
                        fare.total_tax +
                        fare.ait -
                        Number(fare.discount);
                const passenger_fare = fare_details === null || fare_details === void 0 ? void 0 : fare_details.map((elm) => {
                    const passenger = data["s:Body"].SearchFlightsResponse.SearchFlightsResult["a:Passengers"]["b:Passenger"]
                        .find((pass_elm) => pass_elm["b:Ref"] === elm["b:RefPassenger"]);
                    if (!passenger) {
                        return;
                    }
                    const per_pax_markup = (markup + tax_markup) / pax_count;
                    const base_fare = (Number(elm["b:SaleCurrencyAmount"]["b:BaseAmount"]) * api_currency) + pax_markup + per_pax_markup;
                    const tax = Number(elm["b:SaleCurrencyAmount"]["b:TaxAmount"]);
                    return {
                        type: passenger["b:PassengerTypeCode"] === "AD" ? "ADT" : passenger["b:PassengerTypeCode"],
                        number: passenger["b:PassengerQuantity"],
                        fare: {
                            tax,
                            base_fare,
                            total_fare: base_fare + tax
                        }
                    };
                });
                //segments
                flight_elm["b:AirOriginDestinations"]["b:AirOriginDestination"].map((leg_elm, ind) => __awaiter(this, void 0, void 0, function* () {
                    const seg_ref = leg_elm["b:AirCoupons"]["b:AirCoupon"]["b:RefSegment"];
                    const segment_info = data["s:Body"].SearchFlightsResponse.SearchFlightsResult["a:Segments"]["b:SegmentOption"].find((seg_elm) => seg_elm["b:Ref"] === seg_ref);
                    if (!segment_info) {
                        return;
                    }
                    const dAirport = yield commonModel.getAirportDetails(segment_info["b:OriginCode"]);
                    const AAirport = yield commonModel.getAirportDetails(segment_info["b:DestinationCode"]);
                    const marketing_airline = yield commonModel.getAirlines(segment_info["b:AirlineDesignator"]);
                    let operating_airline = marketing_airline;
                    if (segment_info["b:AirlineDesignator"] !== segment_info["b:FlightInfo"]["b:OperatingAirlineDesignator"]) {
                        operating_airline = yield commonModel.getAirlines(segment_info["b:FlightInfo"]["b:OperatingAirlineDesignator"]);
                    }
                    return {
                        id: ind,
                        stoppage: 0,
                        elapsed_time: segment_info["b:FlightInfo"]["b:DurationMinutes"],
                        layover_time: [],
                        options: [
                            {
                                id: ind,
                                elapsedTime: segment_info["b:FlightInfo"]["b:DurationMinutes"],
                                stopCount: 0,
                                total_miles_flown: 0,
                                departure: {
                                    airport_code: segment_info["b:OriginCode"],
                                    city_code: segment_info["b:OriginCode"],
                                    airport: dAirport.airport_name,
                                    city: dAirport.city_name,
                                    country: dAirport.country,
                                    terminal: segment_info["b:FlightInfo"]["b:OriginAirportTerminal"],
                                    time: segment_info["b:FlightInfo"]["b:DepartureDate"].split("T")[1],
                                    date: segment_info["b:FlightInfo"]["b:DepartureDate"].split("T")[0]
                                },
                                arrival: {
                                    airport: AAirport.airport_name,
                                    city: AAirport.city_name,
                                    airport_code: segment_info["b:DestinationCode"],
                                    city_code: segment_info["b:DestinationCode"],
                                    country: AAirport.country,
                                    time: segment_info["b:FlightInfo"]["b:ArrivalDate"].split("T")[1],
                                    date: segment_info["b:FlightInfo"]["b:ArrivalDate"].split("T")[0],
                                    terminal: segment_info["b:FlightInfo"]["b:DestinationAirportTerminal"]
                                },
                                carrier: {
                                    carrier_marketing_code: segment_info["b:AirlineDesignator"],
                                    carrier_marketing_airline: marketing_airline.name,
                                    carrier_marketing_logo: marketing_airline.logo,
                                    carrier_marketing_flight_number: segment_info["b:FlightInfo"]["b:FlightNumber"],
                                    carrier_operating_code: segment_info["b:FlightInfo"]["b:OperatingAirlineDesignator"],
                                    carrier_operating_airline: operating_airline.name,
                                    carrier_operating_logo: operating_airline.logo,
                                    carrier_operating_flight_number: segment_info["b:FlightInfo"]["b:OperatingFlightNumber"],
                                    carrier_aircraft_code: segment_info["b:FlightInfo"]["b:EquipmentCode"],
                                    carrier_aircraft_name: segment_info["b:FlightInfo"]["b:EquipmentText"],
                                },
                            }
                        ]
                    };
                }));
                //availability
            }));
        });
    }
    //utils
    mapCabinCode(jsonCabin) {
        const cabinMap = {
            '1': 'Y', // Economy
            '2': 'W', // Premium Economy
            '3': 'C', // Business
            '4': 'F', // First
        };
        return cabinMap[jsonCabin] || 'Y'; // Default to Economy if invalid
    }
    // Function to map JSON passenger code to TTI passenger type code
    mapPassengerCode(jsonCode) {
        if (jsonCode === 'ADT')
            return 'AD';
        if (jsonCode.startsWith('C'))
            return 'CHD';
        return jsonCode; // INF remains INF
    }
    generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    // Function to convert JSON to SOAP XML body
    jsonToSoapRequest(jsonInput) {
    }
}
exports.ZenithSoapApiFlightSupport = ZenithSoapApiFlightSupport;
