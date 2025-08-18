"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template_onTicketStatusChange = exports.template_pdf_flightBookingDetails = exports.template_onTicketInProcess = exports.template_onTicketIssueReminder = exports.template_onTicketIssue = void 0;
const constants_1 = require("../miscellaneous/constants");
const flightConstants_1 = require("../miscellaneous/flightMiscellaneous/flightConstants");
const template_onTicketIssue = (payload) => {
    var _a;
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flight Details</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #ececec; padding: 20px; text-align: center">
                    <!-- Image added here -->
                    <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Ticket Has Been Issued</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Details:</p>

                    <!-- Table with Visa Application Details -->
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Ticket Numbers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${(_a = payload.ticket_numbers) === null || _a === void 0 ? void 0 : _a.join(", ")}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.journey_type} </td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Route</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.route}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Number of Travelers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.total_passenger}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Travel Date</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.travel_date.toDateString()}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Total Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.payable_amount} BDT</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Due Amount</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.due_amount} BDT</td>
                        </tr>
                    </table>
                    <p style="font-size: 16px; color: green;">This booking has been ticketed.</p>
                </div>
            </div>
        </body>
    </html>
    `;
};
exports.template_onTicketIssue = template_onTicketIssue;
const template_onTicketIssueReminder = (payload) => {
    var _a, _b, _c;
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Flight Ticket Reminder</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #fff3cd; padding: 20px; text-align: center; border-bottom: 1px solid #ffeeba;">
                    <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;" />
                    <h1 style="margin: 0; font-size: 24px; color: #856404;">Reminder: Ticket Not Yet Issued</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #856404;">Please issue the ticket as soon as possible. Details below:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Ticket Numbers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${((_a = payload.ticket_numbers) === null || _a === void 0 ? void 0 : _a.join(", ")) || "N/A"}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.journey_type || "N/A"}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Route</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.route || "N/A"}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Number of Travelers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.total_passenger || "N/A"}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Travel Date</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.travel_date ? payload.travel_date.toDateString() : "N/A"}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Total Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${(_b = payload.payable_amount) !== null && _b !== void 0 ? _b : "N/A"} BDT</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Due Amount</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${(_c = payload.due_amount) !== null && _c !== void 0 ? _c : "N/A"} BDT</td>
                        </tr>
                        ${payload.last_issue_time ? `
                            <tr>
                              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">
                                Last Issue Time Details
                              </th>
                              <td style="border: 1px solid #ddd; padding: 10px;">
                                ${payload.last_issue_time}
                              </td>
                            </tr>
                          ` : ''}
                    </table>
                    <p style="font-size: 16px; color: #856404; margin-top: 20px; font-weight: bold;">
                      This booking is pending ticket issuance. Please take action urgently.
                    </p>
                </div>
            </div>
        </body>
    </html>
  `;
};
exports.template_onTicketIssueReminder = template_onTicketIssueReminder;
const template_onTicketInProcess = (payload) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket Processing</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #ececec; padding: 20px; text-align: center">
                    <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Your Ticket is Being Processed</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Your ticket is currently being processed. Below are the details of your booking:</p>

                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.journey_type} </td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Route</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.route}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Number of Travelers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.total_passenger}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Travel Date</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.travel_date.toDateString()}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Total Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.payable_amount} BDT</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Due Amount</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.due_amount} BDT</td>
                        </tr>
                    </table>

                    <p style="font-size: 16px; color: #ff9800;">Your ticket is currently being processed. We will notify you once it has been issued.</p>
                </div>
            </div>
        </body>
    </html>
    `;
};
exports.template_onTicketInProcess = template_onTicketInProcess;
const template_pdf_flightBookingDetails = (payload) => {
    var _a, _b, _c, _d, _e;
    const { bookingDate, bookingId, bookingStatus, pnr, route, totalPassenger, travelSegments, travelers, fareDetails, } = payload;
    const travelSegmentsRows = travelSegments
        .map((segment) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${segment.airline} (${segment.flightNo})</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${segment.origin}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${segment.destination}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${segment.class}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${segment.departureDate.toDateString()}, ${segment.departureTime.split("+")[0]}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${segment.arrivalDate.toDateString()}, ${segment.arrivalTime.split("+")[0]}</td>
      </tr>
    `)
        .join("");
    const travelersRows = travelers
        .map((traveler) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.type}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.reference}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.dob.toDateString()}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.gender}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.phone || "---"}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.ticketNumber || "---"}</td>
      </tr>
    `)
        .join("");
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Flight Ticket</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
        <div style="border: 1px solid #ddd; border-radius: 4px; padding: 20px; max-width: 900px; margin: 0 auto;">
            <!-- Header Section -->
            <div style="display: flex; margin-bottom: 30px; border-bottom: 1px solid #e0e0e0;">
                <div style="width: 100px; height: 100px; background-color: #007bff;">
                    <img src="${((_a = payload.agency) === null || _a === void 0 ? void 0 : _a.photo) || constants_1.PROJECT_LOGO}" alt="Project Logo" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <div style="flex-grow: 1; text-align: right;">
                    <h2 style="margin: 0; font-size: 18px;">${((_b = payload.agency) === null || _b === void 0 ? void 0 : _b.name) || constants_1.PROJECT_NAME}</h2>
                    <p style="margin: 5px 0; color: #666;">${((_c = payload.agency) === null || _c === void 0 ? void 0 : _c.phone) || constants_1.PROJECT_NUMBER}</p>
                    <p style="margin: 5px 0; color: #666;">${((_d = payload.agency) === null || _d === void 0 ? void 0 : _d.email) || constants_1.PROJECT_EMAIL_STATIC}</p>
                    <p style="margin: 5px 0; color: #666;">${((_e = payload.agency) === null || _e === void 0 ? void 0 : _e.address) || constants_1.PROJECT_ADDRESS}</p>
                </div>
            </div>

            <!-- Booking Header -->
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; padding: 15px 0; ">
                <div style="flex: 1;">
                    <div style="margin-bottom: 8px;">
                        <span style="color: #444; font-size: 14px;">Booking ID :</span>
                        <span style="margin-left: 8px; font-size: 14px;">${payload.bookingId}</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #444; font-size: 14px;">Journey :</span>
                        <span style="margin-left: 8px; font-size: 14px;">${payload.journeyType}</span>
                    </div>
                    <div>
                        <span style="color: #444; font-size: 14px;">Issue Date :</span>
                        <span style="margin-left: 8px; font-size: 14px;">${payload.bookingDate}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="display: inline-block; padding: 4px 12px; background-color: #f5f5f5; border-radius: 4px; margin-bottom: 12px;">
                        <span style="font-size: 14px; color: #444;"></span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #444; font-size: 14px;">GDS PNR :</span>
                        <span style="margin-left: 8px; font-size: 14px; color: #ff5722;">${payload.pnr}</span>
                    </div>
                    <div>
                        <span style="color: #444; font-size: 14px;">Airline PNR :</span>
                        <span style="margin-left: 8px; font-size: 14px; color: #ff5722;">${payload.airlinePnr}</span>
                    </div>
                </div>
            </div>

            <!-- Travel Segments -->
            <table style="width: 100%; border-radius: 8px; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Flight</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Origin</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Destination</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Class</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Departure Time</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Arrival Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${travelSegmentsRows}
                </tbody>
            </table>

            <!-- Traveler Details -->
            <h3 style="margin: 20px 0; font-size: 16px;">Traveler Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Type</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Reference</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Name</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Date of Birth</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Gender</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Phone</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Ticket Number</th>
                    </tr>
                </thead>
                <tbody>
                    ${travelersRows}
                </tbody>
            </table>

            <!-- Fare Details -->

            
        </div>
    </body>
    </html>
  `;
};
exports.template_pdf_flightBookingDetails = template_pdf_flightBookingDetails;
const template_onTicketStatusChange = (payload) => {
    var _a;
    const { status } = payload;
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flight Booking</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #ececec; padding: 20px; text-align: center">
                    <!-- Image added here -->
                    <img src="${payload.logo
        ? constants_1.PROJECT_IMAGE_URL + "/" + payload.logo
        : constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Ticket Has Been ${status.toUpperCase()}</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Details:</p>

                    <!-- Table with Visa Application Details -->
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Ticket Numbers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${(_a = payload.ticket_numbers) === null || _a === void 0 ? void 0 : _a.join(", ")}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.journey_type} </td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Route</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.route}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Number of Travelers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.total_passenger}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.payable_amount} BDT</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.due_amount} BDT</td>
                        </tr>
                    </table>
                    <p style="font-size: 16px; color: ${[flightConstants_1.FLIGHT_TICKET_ISSUE, flightConstants_1.FLIGHT_BOOKING_REFUNDED].includes(status)
        ? "green"
        : "red"};">This booking has been ${status}.</p>
                </div>
            </div>
        </body>
    </html>
    `;
};
exports.template_onTicketStatusChange = template_onTicketStatusChange;
/**
 *
    <div style="margin-top: 30px;">
              <p style="font-size: 16px; margin-bottom: 15px;">Fare Details:</p>
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 8px; background-color: #fff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <div style="display: grid; grid-template-columns: 1fr auto;">
                  <!-- Labels -->
                  <div style="">
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Base Fare
                    </p>
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Tax
                    </p>
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Ticket Price
                    </p>
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Discount
                    </p>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e0e0e0;">
                      <p style="font-size: 14px; font-weight: 600; margin: 8px 0; display: flex; align-items: center;">
                        <span style="width: 8px; height: 8px; background-color: #007bff; border-radius: 50%; margin-right: 8px;"></span>
                        Payable Amount
                      </p>
                    </div>
                  </div>

                  <!-- Values -->
                  <div style="text-align: right;">
                    <p style="font-size: 14px; margin: 8px 0;">${
                      fareDetails.baseFare
                    }</p>
                    <p style="font-size: 14px; margin: 8px 0;">${
                      fareDetails.totalTax
                    }</p>
                    <p style="font-size: 14px;  margin: 8px 0;">${
                      fareDetails.ticketPrice
                    }</p>
                    <p style="font-size: 14px;  margin: 8px 0;">${
                      fareDetails.discount
                    }</p>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e0e0e0;">
                      <p style="font-size: 16px; font-weight: 600; margin: 8px 0;">${
                        fareDetails.payableAmount
                      }</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
 */
