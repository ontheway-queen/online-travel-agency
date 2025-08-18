import Joi from "joi";
import {
  CUSTOM_API,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_IN_PROCESS,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_BOOKING_REFUNDED,
  FLIGHT_BOOKING_VOID,
  FLIGHT_TICKET_ISSUE,
  JOURNEY_TYPE_MULTI_CITY,
  JOURNEY_TYPE_ONE_WAY,
  JOURNEY_TYPE_ROUND_TRIP,
  PENDING_TICKET_ISSUANCE_STATUS,
  SABRE_API,
  TRIPJACK_API,
  VERTEIL_API,
} from "../../../../../utils/miscellaneous/flightMiscellaneous/flightConstants";
import { partial } from "lodash";

export class AdminAgentFlightValidator {
  public jsonStringParser = (schema: Joi.Schema) =>
    Joi.alternatives().try(
      schema,
      Joi.string().custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          const { error } = schema.validate(parsed);
          if (error) return helpers.error("any.invalid");
          return parsed;
        } catch {
          return helpers.error("any.invalid");
        }
      })
    );

  //update booking
  public updateBooking = Joi.object({
    status: Joi.string()
      .valid(
        FLIGHT_TICKET_ISSUE,
        FLIGHT_BOOKING_CANCELLED,
        FLIGHT_BOOKING_VOID,
        FLIGHT_BOOKING_REFUNDED,
        FLIGHT_BOOKING_CONFIRMED
      )
      .required(),
    gds_pnr: Joi.string().optional().trim(),
    airline_pnr: Joi.string().trim().when("status", {
      is: FLIGHT_BOOKING_CONFIRMED,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    ticket_issue_last_time: Joi.string().when("status", {
      is: FLIGHT_BOOKING_CONFIRMED,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    deduction_amount: Joi.number().when("status", {
      is: Joi.valid(FLIGHT_BOOKING_REFUNDED, FLIGHT_BOOKING_VOID),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    ticket_numbers: Joi.array()
      .items(
        Joi.object({
          traveler_id: Joi.number().required(),
          ticket_number: Joi.string().required().trim(),
        })
      )
      .min(1)
      .when("status", {
        is: FLIGHT_TICKET_ISSUE,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    payment: Joi.boolean(),
  });

  //update ticket number
  public updatePendingTicketIssuance = Joi.object({
    status: Joi.string().valid("approved", "rejected"),
    ticket_numbers: Joi.array()
      .items(
        Joi.object({
          traveler_id: Joi.number().required(),
          ticket_number: Joi.string().required(),
        })
      )
      .when("status", {
        is: PENDING_TICKET_ISSUANCE_STATUS.APPROVED,
        then: Joi.required(),
      }),
  });

  updateBlockedBookingValidator = Joi.object({
    pnr_code: Joi.string().optional(),
    airline_pnr: Joi.string().optional(),
    last_time: Joi.string().optional(),
    api_booking_ref: Joi.string().optional(),
    status: Joi.string()
      .valid(
        FLIGHT_BOOKING_IN_PROCESS,
        FLIGHT_BOOKING_CONFIRMED,
        FLIGHT_TICKET_ISSUE,
        FLIGHT_BOOKING_CANCELLED,
        FLIGHT_BOOKING_ON_HOLD
      )
      .optional(),
    user_id: Joi.number().optional(),
    ticket_numbers: Joi.array()
      .items(
        Joi.object({
          traveler_id: Joi.number().required(),
          ticket_number: Joi.string().required(),
        })
      )
      .when("status", {
        is: FLIGHT_TICKET_ISSUE,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
  });

  public pnrShare = Joi.object({
    supplier: Joi.string().valid(SABRE_API, TRIPJACK_API).required(),
    pnr: Joi.when("supplier", {
      is: SABRE_API,
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    supplier_booking_ref: Joi.when("supplier", {
      is: TRIPJACK_API,
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    agency_id: Joi.number().required(),
  });

  // get pnr details
  public PnrDetails = Joi.object({
    gds: Joi.string().valid(SABRE_API, TRIPJACK_API).required(),
    pnr: Joi.string().required(),
    agency_id: Joi.number().required(),
  });

  //manual booking

  // Flight schema
  public flightSchema = Joi.object({
    airline_code: Joi.string().allow("").allow(null).required(),
    flight_number: Joi.string().required().allow("").allow(null),
    origin: Joi.string().required().allow("").allow(null),
    destination: Joi.string().required().allow("").allow(null),
    class: Joi.string().optional().allow("").allow(null),
    baggage: Joi.string().required().allow("").allow(null),
    departure_date: Joi.date().required().allow("").allow(null),
    departure_time: Joi.string().required().allow("").allow(null),
    departure_terminal: Joi.string().optional().allow("").allow(null),
    arrival_date: Joi.date().required().allow("").allow(null),
    arrival_time: Joi.string().required().allow("").allow(null),
    arrival_terminal: Joi.string().optional().allow("").allow(null),
    aircraft: Joi.string().optional().allow("").allow(null),
  });

  // Traveler schema
  public travelerSchema = Joi.object({
    key: Joi.string().required(),
    type: Joi.string()
      .valid(
        "ADT",
        "CHD",
        "INF",
        "C02",
        "C03",
        "C04",
        "C05",
        "C06",
        "C07",
        "C08",
        "C09",
        "C10",
        "C11"
      )
      .required().allow("").allow(null),
    reference: Joi.string().valid("Mr", "Mrs", "Ms", "Miss", "MSTR").required().allow("").allow(null),
    first_name: Joi.string().required().allow("").allow(null),
    last_name: Joi.string().required().allow("").allow(null),
    phone: Joi.string().optional().allow("").allow(null),
    email: Joi.string().email().lowercase().trim().optional().allow("").allow(null),
    date_of_birth: Joi.date().optional().allow("").allow(null),
    gender: Joi.string().valid("Male", "Female").required().allow("").allow(null),
    passport_number: Joi.string().optional().allow("").allow(null),
    passport_expiry_date: Joi.date().optional().allow("").allow(null),
    issuing_country: Joi.number().optional().allow("").allow(null),
    nationality: Joi.number().optional().allow("").allow(null),
    frequent_flyer_airline: Joi.string().optional().allow("").allow(null),
    frequent_flyer_number: Joi.string().optional().allow("").allow(null),
    ticket_number: Joi.string().optional().allow("").allow(null),
    visa_file: Joi.string().optional().allow("").allow(null),
    passport_file: Joi.string().optional().allow("").allow(null),
  });

  // Manual Booking Main Schema
  public manualBookingSchema = Joi.object({
    agency_id: Joi.number().required(),
    api: Joi.string()
      .valid(SABRE_API, TRIPJACK_API, VERTEIL_API, CUSTOM_API)
      .required(),
    pnr_code: Joi.string().optional(),
    base_fare: Joi.number().required(),
    total_tax: Joi.number().required(),
    ait: Joi.number().default(0),
    discount: Joi.number().default(0),
    convenience_fee: Joi.number().default(0),
    markup: Joi.number().default(0),
    journey_type: Joi.string()
      .valid(
        JOURNEY_TYPE_ONE_WAY,
        JOURNEY_TYPE_ROUND_TRIP,
        JOURNEY_TYPE_MULTI_CITY
      )
      .required(),
    refundable: Joi.boolean().truthy("true").falsy("false").required(),
    last_time: Joi.string().isoDate().optional().allow(""),
    airline_pnr: Joi.string().required(),
    api_booking_ref: Joi.string().optional().allow(""),

    vendor_price: this.jsonStringParser(
      Joi.object({
        base_fare: Joi.number().required(),
        tax: Joi.number().required(),
        charge: Joi.number(),
        discount: Joi.number(),
      })
    ).optional(),

    leg_description: this.jsonStringParser(
      Joi.array().items(
        Joi.object({
          departureLocation: Joi.string().required(),
          arrivalLocation: Joi.string().required(),
        })
      )
    ).required(),

    flights: this.jsonStringParser(
      Joi.array().items(this.flightSchema.required()).required()
    ).required(),

    travelers: this.jsonStringParser(
      Joi.array().items(this.travelerSchema.required()).required()
    ).required(),

    status: Joi.string()
      .valid(FLIGHT_BOOKING_CONFIRMED, FLIGHT_TICKET_ISSUE)
      .required(),
    payment: Joi.string().valid("full", "partial", "paid").when("status", {
      is: FLIGHT_TICKET_ISSUE,
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    partial_payment_rules: this.jsonStringParser(
      Joi.object({
        payment_percentage: Joi.number().required(),
        payment_last_day: Joi.date().required(),
      })
    ).when("payment", {
      is: "partial",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  });

  //edit booking info
  public editBookingInfo = Joi.object({
    pnr_code: Joi.string().allow(""),
    last_time: Joi.string().allow(""),
    airline_pnr: Joi.string().allow(""),
    partial_payment: Joi.boolean().allow(""),
    payment_percentage: Joi.number().allow(""),
    payment_last_date: Joi.date().allow(""),
    travelers: Joi.array().items({
      id: Joi.number().required(),
      title: Joi.string().valid("Mr", "Mrs", "MSTR", "MS", "Miss"),
      first_name: Joi.string(),
      last_name: Joi.string(),
      date_of_birth: Joi.date(),
      gender: Joi.string().valid("Male", "Female"),
      contact_number: Joi.string(),
      passport_number: Joi.string(),
      ticket_number: Joi.string(),
    }),
    segments: Joi.array().items({
      id: Joi.number(),
      class: Joi.string(),
      baggage: Joi.string(),
      departure_date: Joi.date(),
      departure_time: Joi.string(),
      arrival_date: Joi.date(),
      arrival_time: Joi.string(),
    }),
  });
}
