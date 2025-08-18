"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template_onCancelFlightBooking_send_to_admin = exports.template_onCancelFlightBooking_send_to_agent = exports.template_onCancelFlightBooking_send_to_user = void 0;
const constants_1 = require("../miscellaneous/constants");
const template_onCancelFlightBooking_send_to_user = (payload) => {
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
                    <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Flight Booking Cancelled</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Booking details:</p>

                  
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.journey_type}</td>
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
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">PNR</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.pnr}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.payable_amount} BDT</td>
                        </tr>
                    </table>

                    <p style="font-size: 16px; color: red;">This booking has been cancelled. <br/> Please contact administration for any query.</p>
                </div>
            </div>
        </body>
    </html>
    `;
};
exports.template_onCancelFlightBooking_send_to_user = template_onCancelFlightBooking_send_to_user;
const template_onCancelFlightBooking_send_to_agent = (payload) => {
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
                    <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Flight Booking Cancelled</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Booking details:</p>

                 
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.journey_type}</td>
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
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">PNR</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.pnr}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.payable_amount} BDT</td>
                        </tr>
                    </table>

                    <p style="font-size: 16px; color: red;">This booking has been cancelled. <br/> Please contact administration for any query.</p>
                </div>
            </div>
        </body>
    </html>
    `;
};
exports.template_onCancelFlightBooking_send_to_agent = template_onCancelFlightBooking_send_to_agent;
const template_onCancelFlightBooking_send_to_admin = (payload) => {
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
                      <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                          alt="online travel agency"
                          style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                      <h1 style="margin: 0; font-size: 24px; color: #333;">Flight Booking Cancelled</h1>
                  </div>
                  <div style="padding: 20px;">
                      <p style="font-size: 16px; color: #333;">Booking details:</p>

                     
                      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                    
                          <tr>
                              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                              <td style="border: 1px solid #ddd; padding: 10px;">${payload.journey_type}</td>
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
                              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">PNR</th>
                              <td style="border: 1px solid #ddd; padding: 10px;">${payload.pnr}</td>
                          </tr>
                          <tr>
                              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                              <td style="border: 1px solid #ddd; padding: 10px;">${payload.payable_amount} BDT</td>
                          </tr>
                      </table>

                      <p style="font-size: 16px; color: red;">This booking has been cancelled by the agent.</p>
                  </div>
              </div>
          </body>
      </html>
      `;
};
exports.template_onCancelFlightBooking_send_to_admin = template_onCancelFlightBooking_send_to_admin;
