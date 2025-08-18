import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import AbstractServices from "../../../abstract/abstract.service";
import { db } from "../../../app/database";
import { getRedis, setRedis } from "../../../app/redis";
import config from "../../../config/config";
import Lib from "../../../utils/lib/lib";
import {
  ERROR_LEVEL_INFO,
  FLIGHT_FARE_RESPONSE,
  INVOICE_TYPE_FLIGHT,
  NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING,
  SABRE_API,
  TRAVELER_TYPE_PASSENGERS,
} from "../../../utils/miscellaneous/constants";
import {
  CUSTOM_API,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_REVALIDATE_REDIS_KEY,
  TRIPJACK_API,
  VERTEIL_API,
} from "../../../utils/miscellaneous/flightMiscellaneous/flightConstants";
import { CommonFlightSupport } from "../../../utils/supportServices/flightSupportServices/commonFlightSupport.service";
import SabreFlightService from "../../../utils/supportServices/flightSupportServices/sabreFlightSupport.service";
import VerteilFlightService from "../../../utils/supportServices/flightSupportServices/verteilFlightSupport.service";
import {
  IFlightSearchReqBody,
  IFormattedFlightItinerary,
} from "../../../utils/supportTypes/flightSupportTypes/commonFlightTypes";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import { BtoCFlightBookingSubService } from "./subServices/BtoCFlightBookingSubService";
import { BtoCInvoiceService } from "./subServices/invoice.service";
import TripjackFlightSupportService from "../../../utils/supportServices/flightSupportServices/tripjackFlightSupport.service";
import CustomError from "../../../utils/lib/customError";

export default class B2CFlightService extends AbstractServices {
  constructor() {
    super();
  }

  // Flight search
  public async flightSearch(req: Request) {
    return db.transaction(async (trx) => {
      const body = req.body as IFlightSearchReqBody;
      const apiAirlinesCommission = this.Model.commissionSetModel(trx);
      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);

      //get btoc commission set id
      const commission_set_res = await dynamicFareModel.getB2CCommission();

      if (!commission_set_res.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "No commission set has been set for b2c",
        };
      }

      // const commission_set_id = commission_set_data[0].id;
      const commission_set_id = commission_set_res[0].commission_set_id;

      const apiData = await dynamicFareModel.getSuppliers({
        set_id: commission_set_id,
        status: true,
      });
      // Route block codes will be written here. Then Find all the airlines and send with booking block or full block to ResFormatter. if no airlines found just route full block then don't call ResFormatter just return empty array. If just booking block then send empty array to resFormatter of airlines and write booking block to every itins

      // const block_routes = await flightRouteConfigModel.getBlockRoute({
      //   status: true,
      //   departure:
      //     body.OriginDestinationInformation[0].OriginLocation.LocationCode,
      //   arrival:
      //     body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
      //   one_way:
      //     body.JourneyType === "1" || body.JourneyType === "3"
      //       ? true
      //       : undefined,
      //   round_trip: body.JourneyType === "2" ? true : undefined,
      // });

      // //if full block is true then return empty array
      // if (block_routes.data[0]?.full_block) {
      //   return {
      //     success: true,
      //     code: this.StatusCode.HTTP_OK,
      //     message: this.ResMsg.HTTP_OK,
      //     data: {
      //       search_id: "",
      //       journey_type: body.JourneyType,
      //       leg_descriptions: [],
      //       total: 0,
      //       results: [],
      //     },
      //   };
      // }

      //if booking block is true then make the variable true
      let booking_block = false;
      // if (block_routes.data[0]?.booking_block) {
      //   booking_block = true;
      // }

      let sabre_set_flight_api_id = 0;
      let verteil_set_flight_api_id = 0;
      let tripjack_set_flight_api_id = 0;

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
      });

      const search_id = uuidv4();

      let sabreData: any[] = [];
      let verteilData: any[] = [];
      let tripjackData: any[] = [];

      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        sabreData = await sabreSubService.FlightSearch({
          booking_block: booking_block,
          reqBody: body,
          dynamic_fare_supplier_id: sabre_set_flight_api_id,
          search_id,
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

      // Add Leg Description with response data
      const leg_descriptions = body.OriginDestinationInformation.map(
        (OrDeInfo) => {
          return {
            departureDate: OrDeInfo.DepartureDateTime,
            departureLocation: OrDeInfo.OriginLocation.LocationCode,
            arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
          };
        }
      );

      const results: any[] = [...sabreData, ...verteilData, ...tripjackData];

      const responseData = {
        search_id,
        journey_type: body.JourneyType,
        leg_descriptions,
        total: results.length,
        results: results,
      };

      //save data to redis
      const dataForStore = {
        reqBody: body,
        response: responseData,
      };
      await setRedis(search_id, dataForStore);

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
  
      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      const JourneyType = req.query.JourneyType as string;
      const OriginDestinationInformation = req.query
        .OriginDestinationInformation as [];
      const PassengerTypeQuantity = req.query.PassengerTypeQuantity as [];

      const body = {
        JourneyType,
        OriginDestinationInformation,
        PassengerTypeQuantity,
      } as unknown as IFlightSearchReqBody;

      const leg_descriptions = body.OriginDestinationInformation.map(
        (OrDeInfo) => {
          return {
            departureDate: OrDeInfo.DepartureDateTime,
            departureLocation: OrDeInfo.OriginLocation.LocationCode,
            arrivalLocation: OrDeInfo.DestinationLocation.LocationCode,
          };
        }
      );
      //insert flight search
      await new CommonFlightSupport(trx).insertFlightSearchHistory({
        search_body: body,
        leg_description: leg_descriptions,
      });
      const flightRouteConfigModel = this.Model.flightRouteConfigModel(trx);

      //get btoc commission set id
      const commission_set_res = await dynamicFareModel.getB2CCommission();
      if (!commission_set_res.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "No commission set has been set for b2c",
        };
      }

      // const commission_set_id = commission_set_data[0].id;
      const commission_set_id = commission_set_res[0].commission_set_id;

      const apiData = await dynamicFareModel.getSuppliers({
        set_id: commission_set_id,
        status: true,
      });

      console.log({ apiData, commission_set_id });

      // Route block codes will be written here. Then Find all the airlines and send with booking block or full block to ResFormatter. if no airlines found just route full block then don't call ResFormatter just return empty array. If just booking block then send empty array to resFormatter of airlines and write booking block to every itins
      const block_routes = await flightRouteConfigModel.getBlockRoute({
        status: true,
        departure:
          body.OriginDestinationInformation[0].OriginLocation.LocationCode,
        arrival:
          body.OriginDestinationInformation[0].DestinationLocation.LocationCode,
        one_way:
          body.JourneyType === "1" || body.JourneyType === "3"
            ? true
            : undefined,
        round_trip: body.JourneyType === "2" ? true : undefined,
      });

      // Return empty data if full block is true
      if (block_routes.data[0]?.full_block) {
        res.write(
          `data: ${JSON.stringify({
            search_id: "",
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
      });
      // Generate search ID
      const search_id = uuidv4();

      res.write("event: search_info\n");
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
      const sendResults = async (
        apiName: string,
        fetchResults: () => Promise<any[]>
      ) => {
        const results = await fetchResults();
        // Update results list and Redis
        responseData.results.push(...results);
        responseData.total = responseData.results.length;
        // Stream results to client
        results.forEach((result) => {
          data.push(result);
          res.write(`data: ${JSON.stringify(result)}\n\n`);
        });
        console.log({ reqb: JSON.stringify(body) });
        // Update Redis after receiving results
        await setRedis(search_id, { reqBody: body, response: responseData });
      };
      const tasks: Promise<void>[] = [];

      if (sabre_set_flight_api_id) {
        const sabreSubService = new SabreFlightService(trx);
        tasks.push(
          sendResults("Sabre", async () =>
            sabreSubService.FlightSearch({
              booking_block: booking_block,
              reqBody: JSON.parse(JSON.stringify(body)),
              dynamic_fare_supplier_id: sabre_set_flight_api_id,
              search_id,
            })
          )
        );
      }

      if (verteil_set_flight_api_id) {
        const verteilSubService = new VerteilFlightService(trx);
        tasks.push(
          sendResults("Verteil", async () =>
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
          sendResults("Tripjack", async () =>
            tripjackSubService.FlightSearchService({
              booking_block,
              reqBody: JSON.parse(JSON.stringify(body)),
              dynamic_fare_supplier_id: tripjack_set_flight_api_id,
            })
          )
        );
      }

      // Run all tasks in parallel
      await Promise.all(tasks);
    });
  }

  // Flight Revalidate
  public async flightRevalidate(req: Request) {
    return this.db.transaction(async (trx) => {
      const { flight_id, search_id } = req.query as {
        flight_id: string;
        search_id: string;
      };

      const data = await this.flightSubRevalidate(search_id, flight_id);

      if (data) {
        await setRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${flight_id}`, data);
        return {
          success: true,
          message: "Ticket has been revalidated successfully!",
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
  public async flightSubRevalidate(search_id: string, flight_id: string) {
    return this.db.transaction(async (trx) => {
      //get data from redis using the search id
      const retrievedData = await getRedis(search_id);
      if (!retrievedData) {
        return null;
      }

      const retrieveResponse = retrievedData.response as {
        results: IFormattedFlightItinerary[];
      };

      const foundItem = retrieveResponse.results.find(
        (item) => item.flight_id === flight_id
      );

      // console.log("fount Item",foundItem)
      if (!foundItem) {
        return null;
      }

      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      //get btoc commission set id
      const commission_set_res = await dynamicFareModel.getB2CCommission();

      // const commission_set_id = commission_set_data[0].id;
      const commission_set_id = commission_set_res[0].commission_set_id;

      const apiData = await dynamicFareModel.getSuppliers({
        set_id: commission_set_id,
        status: true,
        api_name: foundItem.api,
      });
      // console.log({apiData});

      let booking_block = foundItem.booking_block;

      if (foundItem.api === SABRE_API) {
        //SABRE REVALIDATE
        const sabreSubService = new SabreFlightService(trx);
        const formattedReqBody = await sabreSubService.SabreFlightRevalidate(
          retrievedData.reqBody,
          foundItem,
          apiData[0].id,
          flight_id,
          booking_block,
          search_id
        );

        formattedReqBody[0].leg_description =
          retrievedData.response.leg_descriptions;
        return formattedReqBody[0];
      } else if (foundItem.api === VERTEIL_API) {
        const verteilSubService = new VerteilFlightService(trx);
        const formattedReqBody =
          await verteilSubService.FlightRevalidateService({
            search_id: search_id,
            reqBody: retrievedData.reqBody,
            oldData: foundItem,
            dynamic_fare_supplier_id: apiData[0].id,
          });
        return formattedReqBody[0];
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
      } else {
        return null;
      }
    });
  }

  //Flight booking with passport and visa file
  public async flightBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, first_name, last_name, email, phone_number } = req.user;
      console.log({ body: req.body });
      const body = req.body;
      const dynamicFareModel = this.Model.DynamicFareModel(trx);
      const data = await this.flightSubRevalidate(
        body.search_id,
        body.flight_id
      );

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      //checking eligibility for booking
      const flightBookingSubService = new BtoCFlightBookingSubService(trx);
      const checkEligibilityOfBooking =
        await flightBookingSubService.checkEligibilityOfBooking({
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

      //get btoc commission set id
      const commission_set_res = await dynamicFareModel.getB2CCommission();

      const commission_set_id = commission_set_res[0].commission_set_id;
      if ("direct_ticket_issue" in data && data.direct_ticket_issue === true) {
        throw new CustomError("This flight cannot be booked", 400);
      }
      // //check if the booking is block
      // const directBookingPermission =
      //   await flightBookingSubService.checkDirectFlightBookingPermission({
      //     commission_set_id: commission_set_id,
      //     api_name: data.api,
      //     airline: data.carrier_code,
      //   });

      // if (directBookingPermission.success === false) {
      //   return directBookingPermission;
      // }
      const directBookingPermission = {
        booking_block: false,
      };

      //old revalidate data
      const revalidate_data = await getRedis(
        `${FLIGHT_REVALIDATE_REDIS_KEY}${body.flight_id}`
      );

      let airline_pnr;
      let refundable = data.refundable;
      let status = FLIGHT_BOOKING_CONFIRMED;
      let details = "";
      let api = data.api;
      let gds_pnr = null;
      let api_booking_ref = null;
      let ticket_issue_last_time = null;

      if (directBookingPermission.booking_block === false) {
        if ("api" in data && data.api === SABRE_API) {
          const sabreSubService = new SabreFlightService(trx);
          gds_pnr = await sabreSubService.FlightBookingService({
            body,
            user_info: { id, name: first_name, email, phone: phone_number },
            revalidate_data: data,
          });
          //get airline pnr, refundable status
          const grnData = await sabreSubService.GRNUpdate({
            pnr: gds_pnr,
          });
          airline_pnr = grnData.airline_pnr;
          refundable = grnData.refundable;
          details = `Flight has been booked using ${SABRE_API}-${
            config.SABRE_USERNAME.split("-")[1]
          } API`;
          ticket_issue_last_time = grnData.last_time;
        } else if ("api" in data && data.api === VERTEIL_API) {
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
        } else if (data.api === TRIPJACK_API) {
          const tripjackSubService = new TripjackFlightSupportService(trx);
          const res = await tripjackSubService.FlightBookingService({
            booking_payload: body,
            revalidate_data,
            direct_issue: false,
            ssr: body.ssr,
          });
          if (res) {
            const retrieveBooking =
              await tripjackSubService.RetrieveBookingService(
                revalidate_data.api_search_id
              );
            gds_pnr = retrieveBooking.gds_pnr;
            if (data.fare.vendor_price) {
              data.fare.vendor_price.gross_fare = retrieveBooking.gross_fare;
            }
            airline_pnr = retrieveBooking.airline_pnr;
            api_booking_ref = revalidate_data.api_search_id;
          }
          details = `Flight has been booked using ${TRIPJACK_API} API`;
        } else {
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
        http_method: "POST",
        level: ERROR_LEVEL_INFO,
        message: "Flight booking revalidate data",
        url: "/flight/booking",
        user_id: id,
        source: "B2C",
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

      if (body.ssr && body.ssr.length) {
        body.ssr.map((elm: { price: number }) => {
          data.fare.payable += elm.price;
        });
      }
      //insert booking data
      const { booking_id, booking_ref } =
        await flightBookingSubService.insertFlightBookingData({
          pnr: gds_pnr,
          flight_details: data,
          passengers: body.passengers,
          user_id: id,
          api_booking_ref: api_booking_ref,
          airline_pnr,
          refundable,
          name: first_name + " " + last_name,
          email,
          files: (req.files as Express.Multer.File[]) || [],
          last_time: ticket_issue_last_time,
          status,
          api,
          details,
          ssr: body.ssr,
          old_revalidate_data: revalidate_data,
          platform: req.get('User-Agent')
        });

      //delete the log after successful booking
      await this.Model.errorLogsModel(trx).delete(log_res[0].id);

      //create invoice and send invoice mail
      const invoiceSubService = new BtoCInvoiceService(trx);
      const invoice = await invoiceSubService.createInvoice({
        user_id: id,
        ref_id: booking_id,
        ref_type: INVOICE_TYPE_FLIGHT,
        total_amount: data.fare.payable,
        due: data.fare.payable,
        details: `Invoice has been created for flight id ${booking_ref}`,
        user_name: first_name + " " + last_name,
        email: email,
        total_travelers: body.passengers.length,
        travelers_type: TRAVELER_TYPE_PASSENGERS,
        bookingId: booking_ref,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        invoice_id: invoice[0].id,
        invoice_number: invoice[0].invoice_number,
        total_amount: data.fare.payable,
        message: "Redirecting to the payment gateway",
      };
    });
  }

  //Flight booking cancel
  public async flightBookingCancel(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: user_id } = req.user;
      const { id: booking_id } = req.params;
      const flightBookingModel = this.Model.btocFlightBookingModel(trx);
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      //check booking info
      const checkFlightBooking =
        await flightBookingModel.getSingleFlightBooking({
          user_id,
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
        cancelBookingRes.message =
          "Flight booking has been cancelled successfully";
      } else if (checkFlightBooking[0].api === VERTEIL_API) {
        const segmentDetails = await flightBookingModel.getFlightSegment(
          Number(booking_id)
        );
        const verteilSubService = new VerteilFlightService(trx);
        cancelBookingRes = await verteilSubService.OrderCancelService({
          airlineCode: segmentDetails[0].airline_code,
          pnr: checkFlightBooking[0].pnr_code,
        });
      } else if (checkFlightBooking[0].api === CUSTOM_API) {
        await adminNotificationSubService.insertNotification({
          message: `A request has been submitted to cancel this custom API booking. Booking ID: ${checkFlightBooking[0].booking_ref}`,
          ref_id: Number(booking_id),
          type: NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING,
        });
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            "Please contact with the support team to cancel this booking",
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
        await this.Model.paymentModel(trx).updateInvoice(
          { status: false },
          checkFlightBooking[0].invoice_id
        );
        //send notification to admin
        await adminNotificationSubService.insertNotification({
          message: `A flight booking has been cancelled from B2C. Booking id ${checkFlightBooking[0].booking_ref}`,
          ref_id: Number(booking_id),
          type: NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING,
        });
      }

      return cancelBookingRes;
    });
  }

  // booking list
  public async getFlightBookingList(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: user_id } = req.user;
      const { limit, skip } = req.query as unknown as {
        limit: number;
        skip: number;
      };
      const flightBookingModel = this.Model.btocFlightBookingModel(trx);
      const bookingList = await flightBookingModel.getFlightBookingList({
        user_id,
        limit,
        skip,
        statusNot: FLIGHT_BOOKING_CONFIRMED
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: bookingList.data,
        total: bookingList.total,
      };
    });
  }

  //single booking info
  public async getSingleFlightBooking(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: user_id, email: user_email } = req.user;
      const { id: booking_id } = req.params;

      const flightBookingModel = this.Model.btocFlightBookingModel(trx);

      const singleBookData = await flightBookingModel.getSingleFlightBooking({
        user_id,
        id: Number(booking_id),
        statusNot: FLIGHT_BOOKING_CONFIRMED,
      });
      const segment = await flightBookingModel.getFlightSegment(
        Number(booking_id)
      );

      const traveler = await flightBookingModel.getFlightTraveler(
        Number(booking_id)
      );

      if (!singleBookData.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (singleBookData[0].pnr_code) {
        //update from api
        await new BtoCFlightBookingSubService(trx).updateFromApi({
          singleBookData,
          booking_id: Number(booking_id),
          traveler,
          segment,
        });
      }

      if (
        singleBookData?.[0]?.pnr_code?.startsWith("NZB") &&
        singleBookData?.[0]?.pnr_code?.length > 6
      ) {
        singleBookData[0].pnr_code = "N/A";
      }

      //get ssr
      const ssr = await flightBookingModel.getFlightBookingSSR(
        Number(booking_id)
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          ...singleBookData[0],
          segment,
          traveler,
          ssr,
        },
      };
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
      const foundItem = retrieveResponse.results.find(
        (item) => item.flight_id === flight_id
      );
      if (!foundItem) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      let res: string | false = false;

      // if (foundItem.api === TRIPJACK_API) {
      //   const tripjackSubService = new TripjackFlightSupportService(trx);
      //   res = await tripjackSubService.FareRulesService({ api_search_id: foundItem.api_search_id });
      // }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: res ? res : FLIGHT_FARE_RESPONSE,
      };
    });
  }

  // //update booking
  // public async updateBooking({
  //   status,
  //   booking_id,
  //   ticket_number,
  //   last_time,
  //   airline_pnr,
  // }: {
  //   status?: string;
  //   booking_id: number;
  //   ticket_number: string[];
  //   last_time: string | null;
  //   airline_pnr?: string | null;
  // }) {
  //   const model = this.Model.btocFlightBookingModel();
  //   await model.updateBooking({ status, last_time, airline_pnr }, booking_id);
  //   if (ticket_number.length) {
  //     const getTraveler = await model.getFlightTraveler(Number(booking_id));
  //     for (let i = 0; i < getTraveler.length; i++) {
  //       await model.updateTravelers(
  //         { ticket_number: ticket_number?.[i] },
  //         getTraveler[i].id
  //       );
  //     }
  //   }
  // }
}
