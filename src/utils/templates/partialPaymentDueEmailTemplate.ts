import { PROJECT_LOGO } from '../miscellaneous/constants';

export const partialPaymentDueEmailTemplate = (payload: {
  booking_id: string;
  route: string;
  total_price: number;
  due: number;
  pnr: string;
  departure_date: string;
  departure_time: string;
  agency_name: string;
  agency_email: string;
  agency_phone: string;
  agency_photo?: string;
  agency_address: string;
  type: 'admin' | 'agency';
}) => {
  const formattedDepartureDate = new Date(payload.departure_date).toDateString();

  const message = payload.type === 'agency'
    ? `<p style="font-size: 16px; color: #d9534f;">Please note that you must complete your payment by today to avoid ticket cancellation.</p>`
    : `<p style="font-size: 16px; color: #d9534f;">The following agency has not yet completed their payment, and today is the last day to pay before ticket cancellation.</p>`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Due Warning</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
          <div style="background-color: #ececec; padding: 20px; text-align: center">
              <img src=${PROJECT_LOGO} 
                   alt="online travel agency" 
                   style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
              <h1 style="margin: 0; font-size: 24px; color: #202020;">Payment Due Warning</h1>
          </div>
          <div style="padding: 20px;">
              ${message}
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Booking ID</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${payload.booking_id}</td>
                  </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Route</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${payload.route}</td>
                  </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">PNR</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${payload.pnr}</td>
                  </tr>
                  <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Departure</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${formattedDepartureDate} ${payload.departure_time}</td>
                </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Total Price</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${payload.total_price}</td>
                  </tr>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Due Amount</th>
                      <td style="border: 1px solid #ddd; padding: 10px;">${payload.due}</td>
                  </tr>
              </table>
              <h2 style="margin-top: 20px; font-size: 18px; color: #333; text-align: center;">Agency Details</h2>
              <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
                  ${payload.agency_photo ? `<img src="${payload.agency_photo}" alt="Agency Photo" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 10px;">` : ''}
                  <p style="margin: 5px 0;"><strong>Name:</strong> ${payload.agency_name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${payload.agency_email}" style="color: #007bff; text-decoration: none;">${payload.agency_email}</a></p>
                  <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${payload.agency_phone}" style="color: #007bff; text-decoration: none;">${payload.agency_phone}</a></p>
                  <p style="margin: 5px 0;"><strong>Address:</strong> ${payload.agency_address}</p>
              </div>
      </div>
  </body>
  </html>
  `;
};
