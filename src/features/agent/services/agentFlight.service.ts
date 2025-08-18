import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import AbstractServices from '../../../abstract/abstract.service';
import { db } from '../../../app/database';
import { getRedis, setRedis } from '../../../app/redis';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import {
  ERROR_LEVEL_INFO,
  INVOICE_TYPE_FLIGHT,
  NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
  PROJECT_EMAIL_API_1,

  PROJECT_IMAGE_URL,
  TRAVELER_TYPE_PASSENGERS,
} from '../../../utils/miscellaneous/constants';
import {
  CUSTOM_API,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_FARE_RESPONSE,
  FLIGHT_REVALIDATE_REDIS_KEY,
  FLIGHT_TICKET_ISSUE,
  SABRE_API,
  TRAVELPORT_REST_API,
  TRIPJACK_API,
  VERTEIL_API,
} from '../../../utils/miscellaneous/flightMiscellaneous/flightConstants';
import { CommonFlightSupport } from '../../../utils/supportServices/flightSupportServices/commonFlightSupport.service';
import SabreFlightService from '../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service';
import { SendBookingEmailService } from '../../../utils/supportServices/flightSupportServices/sendBookingMailSupport.service';
import TravelportRestFlightService from "../../../utils/supportServices/flightSupportServices/travelportRestFlightSupport.service";
import TripjackFlightSupportService from "../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service";
import VerteilFlightService from '../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service';
import {
  IFlightSearchReqBody,
  IFormattedFlightItinerary,
} from '../../../utils/supportTypes/flightSupportTypes/commonFlightTypes';
import {
  template_onCancelFlightBooking_send_to_admin,
  template_onCancelFlightBooking_send_to_agent,
} from "../../../utils/templates/flightBookingCancelTemplates";
import { flightBookStatusTemplate } from '../../../utils/templates/flightBookingHoldTemplate';
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import { BtoBFlightBookingSubService } from "./subServices/BtoBFlightBookingSubService";
import { BookingPaymentService } from "./subServices/payment.service";

export default class AgentFlightService extends AbstractServices {
  constructor() {
    super();
  }

  // Flight search
  public async flightSearch(req: Request) {
    return db.transaction(async (trx) => {
      const { agency_id, ref_id, id: user_id } = req.agency;
      const body = req.body as IFlightSearchReqBody;
      const apiAirlinesCommission = this.Model.commissionSetModel(trx);
      const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);
      const dynamicFareModel = this.Model.DynamicFareModel(trx);

      //get commission set id
      const agency_info = await this.Model.agencyModel(trx).getSingleAgency(
        ref_id ? ref_id : agency_id
      );

      if (!agency_info[0].commission_set_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }
      console.log({ commission_id: agency_info[0].commission_set_id });
      // const apiData = await apiAirlinesCommission.getSetFlightAPI({
      //   status: true,
      //   set_id: agency_info[0].commission_set_id,
      // });
      const apiData = await dynamicFareModel.getSuppliers({
        set_id: agency_info[0].commission_set_id,
        status: true,
      });

      console.log({
        apiData,
        agency_info: agency_info[0],
      });

      // Route block codes will be written here. Then Find all the airlines and send with booking block or full block to ResFormatter. if no airlines found just route full block then don't call ResFormatter just return empty array. If just booking block then send empty array to resFormatter of airlines and write booking block to every itins

      const block_routes = await flightRouteConfigModel.getBlockRoute({
        status: true,
        departure: body.OriginDestinationInformation[0].OriginLocation.LocationCode,
        arrival: body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
        one_way: body.JourneyType === '1' || body.JourneyType === '3' ? true : undefined,
        round_trip: body.JourneyType === '2' ? true : undefined,
      });

      //if full block is true then return empty array
      if (block_routes.data[0]?.full_block) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: this.ResMsg.HTTP_OK,
          data: {
            search_id: '',
            journey_type: body.JourneyType,
            leg_descriptions: [],
            total: 0,
            results: [],
          },
        };
      }

      // //test
      // const zenithSoapApiFlightSupport = new ZenithSoapApiFlightSupport();
      // const data = await zenithSoapApiFlightSupport.FlightSearchService({
      //   dynamic_fare_supplier_id: 1,
      //   booking_block: true,
      //   reqBody: body
      // })
      // console.log({ data });
      // return{
      //   code:200,
      //   data
      // };

      //if booking block is true then make the variable true
      let booking_block = false;
      if (block_routes.data[0]?.booking_block) {
        booking_block = true;
      }

      let sabre_set_flight_api_id = 0;
      let verteil_set_flight_api_id = 0;
      let tripjack_set_flight_api_id = 0;
      let travelport_rest_set_flight_api_id = 0;
      console.log({ apiData });
      apiData.forEach((item) => {
        if (item.api === SABRE_API) {
          sabre_set_flight_api_id = item.id;
        }
        if (item.api === VERTEIL_API) {
          verteil_set_flight_api_id = item.id;
        }
        if (item.api === TRIPJACK_API) {
          tripjack_set_flight_api_id = item.id;
        }
        if (item.api === TRAVELPORT_REST_API) {
          travelport_rest_set_flight_api_id = item.id;
        }
      });
      console.log({
        sabre_set_flight_api_id,
        verteil_set_flight_api_id,
        tripjack_set_flight_api_id,
        travelport_rest_set_flight_api_id,
      });

      let sabreData: any[] = [];
      let verteilData: any[] = [];
      let tripjackData: any[] = [];
      let travelportRestData: any[] = [];

      const search_id = uuidv4();

      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        sabreData = await sabreSubService.FlightSearch({
          booking_block,
          reqBody: body,
          dynamic_fare_supplier_id: sabre_set_flight_api_id,
          search_id
        });
      }
      if (verteil_set_flight_api_id) {
        const verteilSubService = new VerteilFlightService(trx);
        verteilData = await verteilSubService.FlightSearchService({
          booking_block,
          reqBody: body,
          dynamic_fare_supplier_id: verteil_set_flight_api_id,
          search_id,
        });
      }
      if (tripjack_set_flight_api_id) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        tripjackData = await tripjackSubService.FlightSearchService({
          booking_block,
          reqBody: body,
          dynamic_fare_supplier_id: tripjack_set_flight_api_id,
        });
      }
      // if (travelport_rest_set_flight_api_id) {
      //   const travelportSubService = new TravelportRestFlightService(trx);
      //   travelportRestData = await travelportSubService.FlightSearchService({
      //     booking_block,
      //     reqBody: body,
      //     dynamic_fare_supplier_id: travelport_rest_set_flight_api_id,
      //   });
      // }

      // Add Leg Description with response data
      const leg_descriptions = body.OriginDestinationInformation.map((OrDeInfo) => {
        return {
          departureDate: OrDeInfo.DepartureDateTime,
          departureLocation: OrDeInfo.OriginLocation.LocationCode,
          arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
        };
      });
      //insert flight search
      await new CommonFlightSupport(trx).insertFlightSearchHistory({
        search_body: body,
        leg_description: leg_descriptions,
        agency_id,
        user_id,
      });
      const results: any[] = [...sabreData, ...verteilData, ...tripjackData, ...travelportRestData];

      // results.sort((a, b) => a.fare.payable - b.fare.payable);

      const responseData = {
        search_id,
        journey_type: body.JourneyType,
        leg_descriptions,
        total: results.length,
        results,
      };

      //save data to redis
      const dataForStore = {
        reqBody: body,
        response: responseData,
      };

      await setRedis(search_id, dataForStore);

      // console.log(responseData);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: responseData,
      };
    });
  }

  //Flight search using Server Sent Events(SSE)
  public async FlightSearchSSE(req: Request, res: Response) {
    return db.transaction(async (trx) => {
      const { agency_id, ref_id, id: user_id } = req.agency;
      const JourneyType = req.query.JourneyType as string;
      const promotion_code = req.query.promotion_code;
      const OriginDestinationInformation = req.query.OriginDestinationInformation as [];
      const PassengerTypeQuantity = req.query.PassengerTypeQuantity as [];
      const airline_code = req.query.airline_code as { Code: string }[];

      const body = {
        JourneyType,
        OriginDestinationInformation,
        PassengerTypeQuantity,
        airline_code,
        promotion_code,
      } as unknown as IFlightSearchReqBody;

      const leg_descriptions = body.OriginDestinationInformation.map((OrDeInfo) => {
        return {
          departureDate: OrDeInfo.DepartureDateTime,
          departureLocation: OrDeInfo.OriginLocation.LocationCode,
          arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
        };
      });

      //insert flight search
      await new CommonFlightSupport(trx).insertFlightSearchHistory({
        search_body: body,
        leg_description: leg_descriptions,
        agency_id,
        user_id,
      });

      const apiAirlinesCommission = this.Model.commissionSetModel(trx);
      const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);
      //get commission set id
      const agency_info = await this.Model.agencyModel(trx).getSingleAgency(
        ref_id ? ref_id : agency_id
      );
      if (!agency_info[0].commission_set_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }
      const commission_set_id = agency_info[0].commission_set_id;
      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      const apiData = await dynamicFareModel.getSuppliers({
        set_id: agency_info[0].commission_set_id,
        status: true,
      });
      const block_routes = await flightRouteConfigModel.getBlockRoute({
        status: true,
        departure: body.OriginDestinationInformation[0].OriginLocation.LocationCode,
        arrival: body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
        one_way: body.JourneyType === '1' || body.JourneyType === '3' ? true : undefined,
        round_trip: body.JourneyType === '2' ? true : undefined,
      });

      // Return empty data if full block is true
      if (block_routes.data[0]?.full_block) {
        res.write(
          `data: ${JSON.stringify({
            search_id: '',
            journey_type: body.JourneyType,
            leg_descriptions: [],
            total: 0,
            results: [],
          })}\n\n`
        );
        return;
      }

      let booking_block = false;
      if (block_routes.data[0]?.booking_block) {
        booking_block = true;
      }

      // Extract API IDs
      let sabre_set_flight_api_id = 0;
      let verteil_set_flight_api_id = 0;
      let tripjack_set_flight_api_id = 0;
      let travelport_rest_set_flight_api_id = 0;
      apiData.forEach((item) => {
        if (item.api === SABRE_API) {
          sabre_set_flight_api_id = item.id;
        }
        if (item.api === VERTEIL_API) {
          verteil_set_flight_api_id = item.id;
        }
        if (item.api === TRIPJACK_API) {
          tripjack_set_flight_api_id = item.id;
        }
        if (item.api === TRAVELPORT_REST_API) {
          travelport_rest_set_flight_api_id = item.id;
        }
      });
      // Generate search ID
      const search_id = uuidv4();

      res.write('event: search_info\n');
      res.write(
        `data: ${JSON.stringify({
          search_id,
          leg_description: leg_descriptions,
        })}\n\n`
      );

      // Initialize Redis storage
      const responseData: {
        search_id: string;
        journey_type: string;
        leg_descriptions: any[];
        total: number;
        results: any[];
      } = {
        search_id,
        journey_type: JourneyType,
        leg_descriptions,
        total: 0,
        results: [],
      };
      await setRedis(search_id, { reqBody: body, response: responseData });

      // res.write('event: flight_results\n');
      const data: any[] = [];
      // Query each API and stream results
      const sendResults = async (apiName: string, fetchResults: () => Promise<any[]>) => {
        const results = await fetchResults();
        // Update results list and Redis
        responseData.results.push(...results);
        responseData.total = responseData.results.length;
        // Stream results to client
        results.forEach((result) => {
          data.push(result);
          res.write(`data: ${JSON.stringify(result)}\n\n`);
        });
        // Update Redis after receiving results
        await setRedis(search_id, { reqBody: body, response: responseData });
      };

      const tasks: Promise<void>[] = [];

      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        tasks.push(
          sendResults('Sabre', async () =>
            sabreSubService.FlightSearch({
              booking_block: booking_block,
              reqBody: JSON.parse(JSON.stringify(body)),
              dynamic_fare_supplier_id: sabre_set_flight_api_id,
              search_id
            })
          )
        );
      }

      if (verteil_set_flight_api_id) {
        const verteilSubService = new VerteilFlightService(trx);
        tasks.push(
          sendResults('Verteil', async () =>
            verteilSubService.FlightSearchService({
              booking_block: booking_block,
              reqBody: JSON.parse(JSON.stringify(body)),
              dynamic_fare_supplier_id: verteil_set_flight_api_id,
              search_id,
            })
          )
        );
      }

      if (tripjack_set_flight_api_id) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        tasks.push(
          sendResults('Tripjack', async () =>
            tripjackSubService.FlightSearchService({
              booking_block,
              reqBody: JSON.parse(JSON.stringify(body)),
              dynamic_fare_supplier_id: tripjack_set_flight_api_id,
            })
          )
        );
      }

      if (travelport_rest_set_flight_api_id) {
        const travelportRestSubService = new TravelportRestFlightService(trx);
        tasks.push(
          sendResults('Travelport_Rest', async () =>
            travelportRestSubService.FlightSearchService({
              booking_block,
              reqBody: JSON.parse(JSON.stringify(body)),
              dynamic_fare_supplier_id: travelport_rest_set_flight_api_id,
            })
          )
        );
      }

      // Run all tasks in parallel
      await Promise.all(tasks);
    });
  }

  //get airline list
  public async getAirlineList(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, ref_id } = req.agency;
      const agency_info = await this.Model.agencyModel(trx).getSingleAgency(
        ref_id ? ref_id : agency_id
      );

      const apiAirlinesCommission = this.Model.commissionSetModel(trx);
      const commissionModel = this.Model.apiAirlinesCommissionModel(trx);

      const apiData = await apiAirlinesCommission.getSetFlightAPI({
        status: true,
        set_id: agency_info[0].commission_set_id,
      });

      let sabre_set_flight_api_id = 0;
      let nztrip_set_flight_api_id = 0;

      apiData.forEach((item) => {
        if (item.api_name === SABRE_API) {
          sabre_set_flight_api_id = item.id;
        }
      });

      const sabreAirlines = await commissionModel.getAPIActiveAirlinesName(sabre_set_flight_api_id);
      const nztripAirlines = await commissionModel.getAPIActiveAirlinesName(
        nztrip_set_flight_api_id
      );

      // Combine and filter unique airlines
      const airlineMap = new Map<string, { Code: string; Name: string }>();

      [sabreAirlines, nztripAirlines].flat().forEach((airline) => {
        airlineMap.set(airline.Code, airline);
      });

      const cappingAirlines = Array.from(airlineMap.values());

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: cappingAirlines || [],
      };
    });
  }

  // Flight Revalidate
  public async flightRevalidate(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, ref_id } = req.agency;
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };
      //get commission set id
      const agency_info = await this.Model.agencyModel(trx).getSingleAgency(
        ref_id ? ref_id : agency_id
      );

      if (!agency_info[0].commission_set_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }
      const data = await this.flightSubRevalidate(
        search_id,
        flight_id,
        agency_info[0].commission_set_id
      );

      // const isDomesticFlight =
      //   data?.flights[0].options[0].arrival.country ===
      //   data?.flights[0].options[0].departure.country
      //     ? true
      //     : false;

      if (data) {
        await setRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
        return {
          success: true,
          message: 'Ticket has been revalidated successfully!',
          data,
          code: this.StatusCode.HTTP_OK,
        };
      }

      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    });
  }

  //Flight sub revalidate
  public async flightSubRevalidate(
    search_id: string,
    flight_id: string,
    commission_set_id: number
  ) {
    return this.db.transaction(async (trx) => {
      //get data from redis using the search id
      const retrievedData = await getRedis(search_id);

      if (!retrievedData) {
        return null;
      }

      const retrieveResponse = retrievedData.response as {
        results: IFormattedFlightItinerary[];
      };

      const foundItem = retrieveResponse.results.find((item) => item.flight_id === flight_id);

      if (!foundItem) {
        return null;
      }

      const dynamicFareModel = this.Model.DynamicFareModel(trx);

      const apiData = await dynamicFareModel.getSuppliers({
        status: true,
        set_id: commission_set_id,
        api_name: foundItem.api,
      });

      let booking_block = foundItem.booking_block;

      if (foundItem.api === SABRE_API) {
        //SABRE REVALIDATE
        const sabreSubService = new SabreFlightService(trx);
        const formattedResBody = await sabreSubService.SabreFlightRevalidate(
          retrievedData.reqBody,
          foundItem,
          apiData[0].id,
          flight_id,
          booking_block,
          search_id
        );
        formattedResBody[0].leg_description = retrievedData.response.leg_descriptions;

        return formattedResBody[0];
      } else if (foundItem.api === VERTEIL_API) {
        const verteilSubService = new VerteilFlightService(trx);
        const formattedResBody = await verteilSubService.FlightRevalidateService({
          search_id: search_id,
          reqBody: retrievedData.reqBody,
          oldData: foundItem,
          dynamic_fare_supplier_id: apiData[0].id,
        });
        return formattedResBody[0];
      } else if (foundItem.api === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        const formattedResBody =
          await tripjackSubService.FlightRevalidateService({
            reqBody: retrievedData.reqBody,
            dynamic_fare_supplier_id: apiData[0].id,
            booking_block,
            api_search_id: foundItem.api_search_id,
            flight_id,
          });
        formattedResBody.leg_description =
          retrievedData.response.leg_descriptions;
        return formattedResBody;
      }
      // else if (foundItem.api === TRAVELPORT_REST_API) {
      //   const travelportSubService = new TravelportRestFlightService(trx);
      //   const formattedResBody =
      //     await travelportSubService.FlightRevalidateService({
      //       reqBody: retrievedData.reqBody,
      //       dynamic_fare_supplier_id: apiData[0].id,
      //       booking_block,
      //       api_search_id: foundItem.api_search_id,
      //       flight_id,
      //     });
      //   formattedResBody.leg_description =
      //     retrievedData.response.leg_descriptions;
      //   return formattedResBody;
      // }
      else {
        return null;
      }
    });
  }

  //get Flight Fare Rule
  public async getFlightFareRule(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };

      //get data from redis using the search id
      const retrievedData = await getRedis(search_id);
      if (!retrievedData) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const retrieveResponse = retrievedData.response as {
        results: IFormattedFlightItinerary[];
      };
      const foundItem = retrieveResponse.results.find((item) => item.flight_id === flight_id);
      if (!foundItem) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      let res: string | false = false;
      if (foundItem.api === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        res = await tripjackSubService.FareRulesService({ api_search_id: foundItem.api_search_id });
      } else if (foundItem.api === VERTEIL_API) {
        // const verteilSubService = new VerteilFlightService(trx);
        // res = await verteilSubService
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: res ? res : FLIGHT_FARE_RESPONSE,
      };
    });
  }

  //Flight booking with passport and visa file
  public async flightBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, name, email, mobile_number, agency_id, ref_id, agency_logo } = req.agency;
      const body = req.body;
      //get commission set id
      const agency_info = await this.Model.agencyModel(trx).getSingleAgency(
        ref_id ? ref_id : agency_id
      );

      if (!agency_info[0].commission_set_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'No commission set has been found for the agency',
        };
      }

      const data = await this.flightSubRevalidate(
        body.search_id,
        body.flight_id,
        agency_info[0].commission_set_id
      );

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      //checking eligibility for booking
      const subServices = new BtoBFlightBookingSubService(trx);
      const checkEligibilityOfBooking = await subServices.checkEligibilityOfBooking({
        booking_block: data.booking_block,
        route: Lib.getRouteOfFlight(data.leg_description),
        departure_date: data.flights[0].options[0].departure.date,
        flight_number: `${data.flights[0].options[0].carrier.carrier_marketing_flight_number}`,
        is_domestic_flight: data.domestic_flight,
        passenger: body.passengers,
      });

      if (!checkEligibilityOfBooking?.success) {
        return checkEligibilityOfBooking;
      }

      if (body.ssr && body.ssr.length) {
        body.ssr.map((elm: { price: number }) => {
          data.fare.payable += Number(elm.price);
        });
      }

      const payable_amount = data.fare.payable;

      if ('direct_ticket_issue' in data && data.direct_ticket_issue === true) {
        const agencyModel = this.Model.agencyModel(trx);

        const agencyBalance = await agencyModel.getTotalBalance(agency_id);
        const checkBalance = await subServices.checkAgencyBalanceForTicketIssue({
          agency_balance: agencyBalance,
          ticket_price: payable_amount,
          payment_type: 'full',
        });
        if (checkBalance.success === false) {
          return checkBalance;
        }
      }

      // //check if the booking is block
      // const directBookingPermission =
      //   await subServices.checkDirectFlightBookingPermission({
      //     commission_set_id: agency_info[0].commission_set_id,
      //     api_name: data.api,
      //     airline: data.carrier_code,
      //   });
      const directBookingPermission = {
        booking_block: false,
      };
      // if (directBookingPermission.success === false) {
      //   return directBookingPermission;
      // }
      //old revalidate data
      const revalidate_data = await getRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${body.flight_id}`);
      let airline_pnr;
      let refundable = data.refundable;
      let status = FLIGHT_BOOKING_CONFIRMED;
      let details = '';
      let api = data.api;
      let gds_pnr = null;
      let api_booking_ref = null;
      let ticket_issue_last_time = null;
      let ticket_numbers: string[] = [];
      let fare_rules: null | string = null;

      if (directBookingPermission.booking_block === false) {
        if (data.api === SABRE_API) {
          const sabreSubService = new SabreFlightService(trx);
          gds_pnr = await sabreSubService.FlightBookingService({
            body,
            user_info: {
              id,
              name: name,
              email,
              phone: mobile_number,
              agency_id,
            },
            revalidate_data: data,
          });

          //get airline pnr, refundable status
          const grnData = await sabreSubService.GRNUpdate({
            pnr: gds_pnr,
          });

          airline_pnr = grnData.airline_pnr;
          refundable = grnData.refundable;
          details = `Flight has been booked using ${SABRE_API}-${config.SABRE_USERNAME.split('-')[1]
            } API`;
          ticket_issue_last_time = grnData.last_time;
          fare_rules = grnData.fare_rules ? grnData.fare_rules : null;
        } else if (data.api === VERTEIL_API) {
          const verteilSubService = new VerteilFlightService(trx);
          const res = await verteilSubService.FlightBookService({
            search_id: body.search_id,
            flight_id: body.flight_id,
            passengers: body.passengers,
          });
          gds_pnr = res.pnr;
          airline_pnr = res.pnr;
          ticket_issue_last_time = res.paymentTimeLimit;
          api_booking_ref = res.apiBookingId;
          details = `Flight has been booked using ${VERTEIL_API} API`;
          fare_rules = data.fare_rules ? data.fare_rules : null;
        } else if (data.api === TRIPJACK_API) {
          const tripjackSubService = new TripjackFlightSupportService(trx);
          const res = await tripjackSubService.FlightBookingService({
            booking_payload: body,
            revalidate_data,
            direct_issue: data.direct_ticket_issue === true ? true : false,
            ssr: body.ssr,
          });
          if (res) {
            const retrieveBooking = await tripjackSubService.RetrieveBookingService(
              revalidate_data.api_search_id
            );
            gds_pnr = retrieveBooking.gds_pnr;
            airline_pnr = retrieveBooking.airline_pnr;
            api_booking_ref = revalidate_data.api_search_id;
            if (!gds_pnr) {
              status = FLIGHT_BOOKING_IN_PROCESS;
            }
            if (data.fare.vendor_price) {
              data.fare.vendor_price.gross_fare = retrieveBooking.gross_fare;
            }
            details = `Flight has been booked using ${TRIPJACK_API} API`;
            ticket_numbers = retrieveBooking.ticket_numbers;
            if ('direct_ticket_issue' in data && data.direct_ticket_issue === true) {
              details += `. Direct ticket issue is enabled from ${TRIPJACK_API} for this booking.`;
            }

            //get data from redis using the search id
            const retrievedData = await getRedis(body.search_id);
            if (!retrievedData) {
              return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.HTTP_NOT_FOUND,
              };
            }

            const retrieveResponse = retrievedData.response as {
              results: IFormattedFlightItinerary[];
            };
            const foundItem = retrieveResponse.results.find(
              (item) => item.flight_id === body.flight_id
            );
            if (!foundItem) {
              return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.HTTP_NOT_FOUND,
              };
            }

            fare_rules = await tripjackSubService.FareRulesService({
              api_search_id: foundItem.api_search_id,
            });
          } else {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: 'Please contact support team with flight information',
            };
          }
        }
        // else if (data.api === TRAVELPORT_REST_API) {
        //   const travelportSubService = new TravelportRestFlightService(trx);
        //   const res = await travelportSubService.FlightBookingService({
        //     api_search_id: data.api_search_id,
        //     traveler: body.passengers,
        //   });
        //   gds_pnr = res.pnr;
        //   airline_pnr = res.pnr;
        //   ticket_issue_last_time = res.ticket_issue_last_time;
        //   details = `Flight has been booked using ${TRAVELPORT_REST_API} API`;
        // }
        else {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.HTTP_BAD_REQUEST,
          };
        }
      } else {
        details = `Booking status - ${FLIGHT_BOOKING_IN_PROCESS}. Booking Block was enabled for this booking.`;
        status = FLIGHT_BOOKING_IN_PROCESS;
        api = CUSTOM_API;
      }

      //insert the revalidate data as info log
      const log_res = await this.Model.errorLogsModel().insert({
        http_method: 'POST',
        level: ERROR_LEVEL_INFO,
        message: 'Flight booking revalidate data',
        url: '/flight/booking',
        user_id: id,
        source: 'B2B',
        metadata: {
          api: data.api,
          request_body: {
            flight_id: body.flight_id,
            search_id: body.search_id,
            api_search_id: data.api_search_id,
          },
          response: data,
        },
      });


      //insert booking data
      const { booking_id, booking_ref } = await subServices.insertFlightBookingData({
        pnr: gds_pnr,
        flight_details: data,
        passengers: body.passengers,
        ssr: body.ssr,
        created_by: id,
        api_booking_ref: api_booking_ref,
        airline_pnr,
        refundable,
        name: name,
        email,
        files: (req.files as Express.Multer.File[]) || [],
        last_time: ticket_issue_last_time,
        agency_id,
        status,
        api,
        details,
        convenience_fee: 0,
        old_revalidate_data: revalidate_data,
        fare_rules,
      });

      //delete the log after successful booking
      await this.Model.errorLogsModel(trx).delete(log_res[0].id);

      //invoice
      const invoiceSubService = new BookingPaymentService(trx);

      const invoice = await invoiceSubService.createInvoice({
        agency_id,
        user_id: id,
        ref_id: booking_id,
        ref_type: INVOICE_TYPE_FLIGHT,
        total_amount: payable_amount,
        due: payable_amount,
        details: `Invoice has been created for flight Id ${booking_ref}`,
        user_name: name,
        email,
        total_travelers: body.passengers.length,
        travelers_type: TRAVELER_TYPE_PASSENGERS,
        bookingId: booking_ref,
        agency_logo
      });

      //money receipt
      if ('direct_ticket_issue' in data && data.direct_ticket_issue === true) {
        //update booking data
        await subServices.updateDataAfterTicketIssue({
          booking_id: booking_id,
          agency_id,
          payable_amount: data.fare.payable,
          booking_ref: booking_ref,
          payment_type: 'full',
          invoice_id: invoice[0].id,
          user_id: id,
          status: ticket_numbers.length ? FLIGHT_TICKET_ISSUE : FLIGHT_BOOKING_ON_HOLD,
          issued_by: 'AGENT',
          ticket_number: ticket_numbers,
        });
      }

      return {
        success: true,
        message: 'Pnr has been created successfully',
        booking_id: booking_id,
        pnr: gds_pnr,
        code: this.StatusCode.HTTP_OK,
      };
    });
  }

  //Flight booking cancel
  public async flightBookingCancel(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: user_id, agency_id, email: user_email, agency_logo } = req.agency;

      const { id: booking_id } = req.params;
      const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      //check booking info
      const checkFlightBooking = await flightBookingModel.getSingleFlightBooking({
        agency_id,
        id: Number(booking_id),
        status: [FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_IN_PROCESS],
      });
      if (!checkFlightBooking.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      let cancelBookingRes: {
        success: boolean;
        code: number;
        message: string;
      } = {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };

      if (checkFlightBooking[0].api === SABRE_API) {
        //sabre
        const sabreSubService = new SabreFlightService(trx);
        await sabreSubService.SabreBookingCancelService({
          pnr: checkFlightBooking[0].pnr_code,
        });
        cancelBookingRes.success = true;
        cancelBookingRes.message = 'Booking has been cancelled successfully';
        cancelBookingRes.code = this.StatusCode.HTTP_OK;
      } else if (checkFlightBooking[0].api === VERTEIL_API) {
        const segmentDetails = await flightBookingModel.getFlightSegment(Number(booking_id));
        const verteilSubService = new VerteilFlightService(trx);
        cancelBookingRes = await verteilSubService.OrderCancelService({
          airlineCode: segmentDetails[0].airline_code,
          pnr: checkFlightBooking[0].pnr_code,
        });
      } else if (checkFlightBooking[0].api === CUSTOM_API) {
        await adminNotificationSubService.insertNotification({
          message: `A request has been submitted to cancel this custom API booking. Booking ID: ${checkFlightBooking[0].booking_ref}`,
          ref_id: Number(booking_id),
          type: NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
        });
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Please contact with the support team to cancel this booking',
        };
      } else if (checkFlightBooking[0].api === TRIPJACK_API) {
        const tripjackSubService = new TripjackFlightSupportService(trx);
        cancelBookingRes = await tripjackSubService.CancelBookingService(
          checkFlightBooking[0].api_booking_ref,
          checkFlightBooking[0].airline_pnr
        );
      }

      //if cancellation is successful, update the booking status
      if (cancelBookingRes.success === true) {
        await flightBookingModel.updateBooking(
          { status: FLIGHT_BOOKING_CANCELLED, cancelled_by: user_id },
          Number(booking_id)
        );
        //delete invoice
        if (checkFlightBooking[0].invoice_id) {
          await this.Model.btobPaymentModel(trx).updateInvoice(
            { status: false },
            checkFlightBooking[0].invoice_id
          );
        }
        //send notification to admin

        await adminNotificationSubService.insertNotification({
          message: `A flight booking has been cancelled from B2B. Booking id ${checkFlightBooking[0].booking_ref}`,
          ref_id: Number(booking_id),
          type: NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
        });

        // send email notification
        await Promise.all([
          Lib.sendEmail(
            [PROJECT_EMAIL_API_1],
            `A ${checkFlightBooking[0].route} flight booking has been cancelled`,
            template_onCancelFlightBooking_send_to_admin({
              pnr:
                checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
                  checkFlightBooking[0].pnr_code?.length > 6
                  ? 'N/A'
                  : String(checkFlightBooking[0].pnr_code),
              journey_type: checkFlightBooking[0].journey_type,
              payable_amount: checkFlightBooking[0].payable_amount,
              route: checkFlightBooking[0].route,
              total_passenger: checkFlightBooking[0].total_passenger,
              logo: PROJECT_IMAGE_URL + '/' + agency_logo,
            })
          ),
          Lib.sendEmail(
            user_email,
            `Your flight booking for ${checkFlightBooking[0].route} has been cancelled`,
            template_onCancelFlightBooking_send_to_agent({
              pnr:
                checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
                  checkFlightBooking[0].pnr_code?.length > 6
                  ? 'N/A'
                  : String(checkFlightBooking[0].pnr_code),
              journey_type: checkFlightBooking[0].journey_type,
              payable_amount: checkFlightBooking[0].payable_amount,
              route: checkFlightBooking[0].route,
              total_passenger: checkFlightBooking[0].total_passenger,
              logo: PROJECT_IMAGE_URL + '/' + agency_logo,
            })
          ),
        ]);
      }

      return cancelBookingRes;
    });
  }

  //get list of booking
  public async getBookingList(req: Request) {
    const { agency_id } = req.agency;
    const query = req.query;
    const model = this.Model.b2bFlightBookingModel();
    const data = await model.getAllFlightBooking({ ...query, agency_id });
    const mappedData = data.data.map((item) => ({
      ...item,
      pnr_code: item.pnr_code,
    }));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: mappedData,
      total: data.total,
    };
  }

  //get single booking
  public async getBookingSingle(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, email: user_email } = req.agency;
      const { id: booking_id } = req.params;
      const model = this.Model.b2bFlightBookingModel(trx);
      const data = await model.getSingleFlightBooking({
        agency_id,
        id: Number(booking_id),
      });
      const segment = await model.getFlightSegment(Number(booking_id));
      const traveler = await model.getFlightBookingTraveler(Number(booking_id));

      if (data[0].pnr_code) {
        await new BtoBFlightBookingSubService(trx).updateFromAPI({
          data,
          booking_id,
          segment,
          traveler,
        });
      }

      const ssr = await model.getFlightBookingSSR(Number(booking_id));
      const fare_rules = await model.getFlightFareRules({ flight_booking_id: Number(booking_id) });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: { ...data[0], segment, traveler, ssr, fare_rules },
      };
    });
  }

  //update booking
  public async updateBooking({
    status,
    booking_id,
    ticket_number,
    last_time,
    airline_pnr,
  }: {
    status: string;
    booking_id: number;
    ticket_number: string[];
    last_time: string | null;
    airline_pnr?: string;
  }) {
    const model = this.Model.b2bFlightBookingModel();
    await model.updateBooking({ status, last_time, airline_pnr }, booking_id);
    if (ticket_number.length) {
      const getTraveler = await model.getFlightBookingTraveler(Number(booking_id));
      for (let i = 0; i < getTraveler.length; i++) {
        await model.updateFlightBookingTraveler(
          { ticket_number: ticket_number?.[i] },
          getTraveler[i].id
        );
      }
    }
  }

  //Ticket Issue
  public async ticketIssue(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: booking_id } = req.params;
      const { agency_id, id: user_id, ref_id } = req.agency;
      const { payment_type } = req.body;
      const flightBookingModel = this.Model.b2bFlightBookingModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      const flightBookingSubService = new BtoBFlightBookingSubService(trx);
      //check booking info
      const [checkFlightBooking, flightSegments, flightTravelers] = await Promise.all([
        flightBookingModel.getSingleFlightBooking({
          id: Number(booking_id),
          status: [FLIGHT_BOOKING_CONFIRMED, FLIGHT_BOOKING_IN_PROCESS],
        }),
        flightBookingModel.getFlightSegment(Number(booking_id)),
        flightBookingModel.getFlightBookingTraveler(Number(booking_id)),
      ]);

      if (!checkFlightBooking.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }
      if (!checkFlightBooking[0].invoice_id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'No invoice has been found for this booking',
        };
      }

      let partial_payment_percentage = 0;

      //check if the payment is eligible for partial payment
      if (payment_type === 'partial') {
        if (checkFlightBooking[0]?.partial_payment?.partial_payment === false) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Partial payment is not allowed for this booking',
          };
        } else {
          if (checkFlightBooking[0].partial_payment?.payment_percentage === null) {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: 'Partial payment percentage for this booking is not yet configured. Please wait while we complete the update.',
            };
          }
          partial_payment_percentage =
            Number(checkFlightBooking[0].partial_payment?.payment_percentage) / 100;
        }
      }

      //check balance
      const agencyBalance = await agencyModel.getTotalBalance(agency_id);
      const checkBalance = await flightBookingSubService.checkAgencyBalanceForTicketIssue({
        agency_balance: agencyBalance,
        ticket_price: checkFlightBooking[0].payable_amount,
        payment_type,
        partial_payment_percentage,
      });
      if (checkBalance.success === false) {
        return checkBalance;
      }
      //ticket issue
      let ticketIssueRes: {
        success: boolean;
        code: number;
        message: string;
        data?: string[];
        ticket_status?: string;
      } = {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
        data: [],
      };
      const getTraveler = await flightBookingModel.getFlightBookingTraveler(Number(booking_id));
      //check ticket issue block
      const checkTicketIssueBlock = await flightBookingSubService.checkTicketIssueBlock({
        agency_id: ref_id || agency_id,
        airline: flightSegments[0].airline_code,
        api: checkFlightBooking[0].api,
      });
      if (!checkTicketIssueBlock) {
        if (checkFlightBooking[0].api === SABRE_API) {
          const travelerSet = new Set(getTraveler.map((elem) => elem.type));
          const unique_traveler = travelerSet.size;
          //sabre
          const sabreSubService = new SabreFlightService(trx);
          ticketIssueRes = await sabreSubService.TicketIssueService({
            pnr: checkFlightBooking[0].pnr_code,
            unique_traveler,
          });
        } else if (checkFlightBooking[0].api === VERTEIL_API) {
          const segmentDetails = await flightBookingModel.getFlightSegment(Number(booking_id));
          const travelerDetails = await flightBookingModel.getFlightBookingTraveler(
            Number(booking_id)
          );
          const verteilSubService = new VerteilFlightService(trx);
          ticketIssueRes = await verteilSubService.TicketIssueService({
            airlineCode: segmentDetails[0].airline_code,
            oldFare: {
              vendor_total: checkFlightBooking[0].vendor_price.net_fare,
            },
            passengers: travelerDetails,
            pnr: checkFlightBooking[0].pnr_code,
          });
        } else if (checkFlightBooking[0].api === TRIPJACK_API) {
          const tripjackSubService = new TripjackFlightSupportService(trx);
          ticketIssueRes = await tripjackSubService.TicketIssueService({
            api_booking_ref: checkFlightBooking[0].api_booking_ref,
            vendor_total_price: checkFlightBooking[0].vendor_price.gross_fare,
          });
          const getBooking = await tripjackSubService.RetrieveBookingService(
            checkFlightBooking[0].api_booking_ref
          );
          ticketIssueRes.data = getBooking.ticket_numbers;
        }
      }
      //if issue is successful, update the booking status and debit the amount
      if (ticketIssueRes.success === true) {
        //update booking data
        await flightBookingSubService.updateDataAfterTicketIssue({
          booking_id: Number(booking_id),
          agency_id,
          payable_amount: checkFlightBooking[0].payable_amount,
          booking_ref: checkFlightBooking[0].booking_ref,
          payment_type,
          invoice_id: checkFlightBooking[0].invoice_id,
          ticket_number: ticketIssueRes.data,
          travelers_info: getTraveler,
          user_id,
          issued_by: 'AGENT',
          status: ticketIssueRes.data?.length === 0 ? FLIGHT_BOOKING_ON_HOLD : FLIGHT_TICKET_ISSUE,
          partial_payment_percentage,
        });

        //send notification to admin
        const adminNotificationSubService = new AdminNotificationSubService(trx);
        await adminNotificationSubService.insertNotification({
          message: `Flight ticket has been issued from B2B. Booking id ${checkFlightBooking[0].booking_ref}`,
          ref_id: Number(booking_id),
          type: NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
        });

        if (ticketIssueRes.data?.length && ticketIssueRes.data?.length > 0) {
          // send email notification
          {
            const due =
              payment_type === 'partial'
                ? Number(
                  (
                    Number(checkFlightBooking[0].payable_amount) -
                    Number(checkFlightBooking[0].payable_amount * partial_payment_percentage)
                  ).toFixed(2)
                )
                : 0;

            const flightBookTemplateData = {
              travel_date: flightSegments[0].departure_date,
              ticket_numbers: ticketIssueRes.data || [],
              journey_type: checkFlightBooking[0].journey_type,
              payable_amount: checkFlightBooking[0].payable_amount,
              route: checkFlightBooking[0].route,
              total_passenger: checkFlightBooking[0].total_passenger,
              due_amount: due,
              logo: `${PROJECT_IMAGE_URL}/${checkFlightBooking[0].agency_logo}`,
            };

            const formatDuration = (minutes: number) => {
              const hrs = Math.floor(minutes / 60);
              const mins = minutes % 60;
              return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''
                }`.trim();
            };

            const flightDetails = flightSegments.map((segment) => ({
              departure: `${segment.origin}`,
              arrival: `${segment.destination}`,
              duration: formatDuration(parseInt(segment.duration, 10)),
              details: {
                class: `CLASS: ${segment.class}`,
                departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
                lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
              },
              airline: {
                name: segment.airline,
                image: `${PROJECT_IMAGE_URL}/${segment.airline_logo}`,
                flight_number: segment.flight_number,
              },
              cabin: segment.class,
              departure_date: Lib.formatAMPM(
                new Date(
                  segment.departure_date.toISOString().split('T')[0] +
                  'T' +
                  segment.departure_time.split('+')[0]
                )
              ),
            }));

            const flightBookingPdfData = {
              date_of_issue: new Date().toISOString().split('T')[0],
              bookingId: checkFlightBooking[0].booking_ref,
              bookingStatus: checkFlightBooking[0].booking_status,
              pnr:
                checkFlightBooking[0].pnr_code?.startsWith('NZB') &&
                  checkFlightBooking[0].pnr_code?.length > 6
                  ? 'N/A'
                  : String(checkFlightBooking[0].pnr_code),
              airlinePnr: checkFlightBooking[0].airline_pnr,
              numberOfPassengers: flightTravelers.length,
              journeyType: checkFlightBooking[0].journey_type,
              segments: flightDetails,
              passengers: flightTravelers.map((traveler, index) => ({
                name:
                  String(traveler.reference).toUpperCase() +
                  ' ' +
                  traveler.first_name +
                  ' ' +
                  traveler.last_name,
                gender: traveler.gender,
                dob: traveler.date_of_birth,
                phone: traveler.contact_number,
                reference: traveler.reference,
                ticket: ticketIssueRes.data ? ticketIssueRes.data[index] : '',
                type: traveler.type,
                passport_number: traveler.passport_number,
                frequent_flyer_number: traveler.frequent_flyer_number,
              })),
              agency: {
                email: checkFlightBooking[0]?.agency_email,
                phone: checkFlightBooking[0]?.agency_phone,
                address: checkFlightBooking[0]?.agency_address,
                photo: `${PROJECT_IMAGE_URL}/${checkFlightBooking[0]?.agency_logo}`,
                name: checkFlightBooking[0]?.agency_name,
              },
              baggage_information: {
                route: checkFlightBooking[0].route,
                check_in: flightSegments
                  .map((segment) => {
                    return `${segment.flight_number} (${segment.airline}) - Baggage info: ${segment.baggage}`;
                  })
                  .join(','),
              },
            };

            const bookingEmailSubService = new SendBookingEmailService();
            //admin
            await Promise.all([
              bookingEmailSubService.sendFlightTicketIssuedEmail({
                flightBookTemplateData,
                flightBookingPdfData,
                bookingId: checkFlightBooking[0]?.booking_ref,
                email: PROJECT_EMAIL_API_1,
              }),
              //agent
              bookingEmailSubService.sendFlightTicketIssuedEmail({
                flightBookTemplateData,
                flightBookingPdfData,
                bookingId: checkFlightBooking[0]?.booking_ref,
                email: checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
              }),
            ]);
          }
        } else {
          //ticket hold
          const formatDuration = (minutes: number) => {
            const hrs = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''
              }`.trim();
          };
          const flightDetails = flightSegments.map((segment) => ({
            departure: `${segment.origin}`,
            arrival: `${segment.destination}`,
            duration: formatDuration(parseInt(segment.duration, 10)),
            details: {
              class: `CLASS: ${segment.class}`,
              departure: `DEPARTS: ${segment.origin.split('(')[0].trim()}`,
              lands_in: `LANDS IN: ${segment.destination.split('(')[0].trim()}`,
            },
            airline: {
              name: segment.airline,
              image: `${PROJECT_IMAGE_URL}/${segment.airline_logo}`,
              flight_number: segment.flight_number as string,
            },
            cabin: segment.class,
            departure_date: Lib.formatAMPM(
              new Date(
                segment.departure_date.toISOString().split('T')[0] +
                'T' +
                segment.departure_time.split('+')[0]
              )
            ),
          }));
          await Lib.sendEmail(
            [PROJECT_EMAIL_API_1],
            `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref} | B2B`,
            flightBookStatusTemplate({
              bookingId: checkFlightBooking[0].booking_ref,
              airline: flightSegments[0].airline,
              segments: flightDetails,
              journeyType: checkFlightBooking[0].journey_type,
              numberOfPassengers: flightTravelers.length,
              route: checkFlightBooking[0].route,
              status: FLIGHT_BOOKING_ON_HOLD,
              name: checkFlightBooking[0].created_by + ' (' + checkFlightBooking[0].agency_name + ')',
            })
          );
          await Lib.sendEmail(
            checkFlightBooking[0].user_email || checkFlightBooking[0].agency_email,
            `Ticket is On Hold for Booking ID: ${checkFlightBooking[0].booking_ref}`,
            flightBookStatusTemplate({
              bookingId: checkFlightBooking[0].booking_ref,
              airline: flightSegments[0].airline,
              segments: flightDetails,
              journeyType: checkFlightBooking[0].journey_type,
              numberOfPassengers: flightTravelers.length,
              route: checkFlightBooking[0].route,
              status: FLIGHT_BOOKING_ON_HOLD,
              name: checkFlightBooking[0].created_by + ' (' + checkFlightBooking[0].agency_name + ')',
            })
          );
        }
      } else {
        return ticketIssueRes;
        // //insert into pending ticket issuance
        // await flightBookingSubService.insertPendingTicketIssue({
        //   booking_id: Number(booking_id),
        //   agency_id,
        //   payable_amount: checkFlightBooking[0].payable_amount,
        //   booking_ref: checkFlightBooking[0].booking_ref,
        //   payment_type,
        //   invoice_id: checkFlightBooking[0].invoice_id,
        //   user_id,
        //   agency_logo: checkFlightBooking[0].agency_logo,
        //   api: checkFlightBooking[0].api,
        //   route: checkFlightBooking[0].route,
        //   departure_date: flightSegments[0].departure_date,
        //   email: checkFlightBooking[0].user_email,
        //   journey_type: checkFlightBooking[0].journey_type,
        //   total_passenger: checkFlightBooking[0].total_passenger,
        //   details: checkTicketIssueBlock
        //     ? 'issue blocked was enabled'
        //     : checkFlightBooking[0].api === CUSTOM_API
        //       ? 'Custom API was enabled'
        //       : `got an error from ${checkFlightBooking[0].api} API`,
        //   partial_payment_percentage,
        // });

        // return {
        //   success: true,
        //   code: this.StatusCode.HTTP_OK,
        //   message: 'Ticket is being processed',
        // };
      }

      return ticketIssueRes;
    });
  }
}
