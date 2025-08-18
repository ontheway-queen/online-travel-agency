import { PROJECT_LOGO,PROJECT_NUMBER } from "../miscellaneous/constants"
export const flightBookTemplate = (payload: {
  bookingId: number | string;
  airline: string;
  segments: {
    departure: string;
    arrival: string;
    airline: string;
    cabin: string;
  }[];
  numberOfPassengers: number;
  route: string;
  journeyType: string;
  totalAmount: number;
  name: string;
  pnr: string;
  logo?: string;
}) => {
  const segmentRows = payload.segments
    .map((segment, index) => {
      return `
          <tr>
              <th colspan="2" style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: center;">Segment - ${
                index + 1
              }</th>
          </tr>
          <tr>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Departure</th>
              <td style="border: 1px solid #ddd; padding: 10px;">${
                segment.departure
              }</td>
          </tr>
          <tr>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Arrival</th>
              <td style="border: 1px solid #ddd; padding: 10px;">${
                segment.arrival
              }</td>
          </tr>
          <tr>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Airline</th>
              <td style="border: 1px solid #ddd; padding: 10px;">${
                segment.airline
              }</td>
          </tr>
          <tr>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Cabin</th>
              <td style="border: 1px solid #ddd; padding: 10px;">${
                segment.cabin
              }</td>
          </tr>
        `;
    })
    .join("");

  return `
      <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Flight Booking Confirmation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
          <div style="background-color: #ececec; padding: 20px; text-align: center">
              <img src=${payload.logo || PROJECT_LOGO} 
                   alt="online travel agency" 
                   style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
              <h1 style="margin: 0; font-size: 24px; color: #202020;">Flight Booking Confirmation</h1>
          </div>
          <div style="padding: 20px;">
              <p style="font-size: 16px; color: #333;">Dear <strong>${
                payload.name
              }</strong>,</p>
              <p style="font-size: 16px; color: #333;">Thank you for booking your flight with us. Below are the details of your flight:</p>
  
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Booking ID</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${
                        payload.bookingId
                      }</td>
                  </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Journey Type</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${
                        payload.journeyType
                      }</td>
                  </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Route</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${
                        payload.route
                      }</td>
                  </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Total Passengers</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${
                        payload.numberOfPassengers
                      }</td>
                  </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Total Amount</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${
                        payload.totalAmount
                      }</td>
                  </tr>
                  ${segmentRows}
              </table>
          </div>
      </div>
  </body>
  </html>
    `;
};