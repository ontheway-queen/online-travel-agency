import { PROJECT_LOGO } from "../miscellaneous/constants"

export const invoiceTemplate = (payload: {
  name: string;
  invoiceNumber: string;
  bookingType: string;
  date: string;
  totalTravelers: number;
  totalAmount: number;
  JType: string;
  logo?: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff;">
    <div style="max-width: 500px; margin: 20px auto;  background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border:1px solid rgb(221, 219, 219)">
        <!-- Header -->
        <div style="background-color: #ECECEC; padding: 20px; text-align: center;">
            <img src=${
              payload.logo || PROJECT_LOGO
            } alt="Logo" style="display: block; width: 80px; margin: 0 auto 15px;">
            <h1 style="font-size: 22px; color: #333; margin: 0;">Invoice</h1>
        </div>

        <!-- Invoice Details -->
        <div style="padding: 20px;">
            <p style="margin: 0; font-size: 16px; color: #333;">Dear <strong>${
              payload.name
            }</strong>,</p>
            <p style="margin: 10px 0 20px; font-size: 14px; color: #555;">Here are the details of your booking:</p>

            <!-- Dynamic Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <tr>
                    <th style="padding: 12px; background-color: #f8f9fa; color: #555; text-align: left; border-bottom: 2px solid #0085D4;">Details</th>
                    <th style="padding: 12px; background-color: #f8f9fa; color: #555; text-align: right; border-bottom: 2px solid #0085D4;">Information</th>
                </tr>
                 <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">Invoice Number</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">${
                      payload.invoiceNumber
                    }</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">Type</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">${
                      payload.bookingType
                    }</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">Date</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">${
                      payload.date
                    }</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">Total ${
                      payload.JType
                    }</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">${
                      payload.totalTravelers
                    }</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">Total Amount</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333;">${
                      payload.totalAmount
                    }</td>
                </tr>
            </table>
        </div>

</body>
</html>
        `;
};

export const template_onInvoiceDueClear_send_to_agent = (payload: {
  title: string;
  amount: number;
  clearanceTime: string;
  remarks: string;
  agency_name: string;
  logo?: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${payload.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <tr>
                    <td style="text-align: center; padding-bottom: 20px;">
                        <img src="${
                          payload.logo || PROJECT_LOGO
                        }" alt="Agency Logo" style="max-width: 150px;">
                        <h2 style="margin: 10px 0; color: #333;">${
                          payload.agency_name
                        }</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Invoice Due Amount:</strong> ${payload.amount} BDT
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Clearance Time:</strong> ${payload.clearanceTime}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Remarks:</strong> ${payload.remarks}
                    </td>
                </tr>
                <tr>
                    <td style="color: green; font-weight: bold; padding-top: 10px">
                        Your Invoice Due Has Been Cleared!
                    </td>
                </tr>
            </table>
        </body>
    </html>
    `;
};

export const template_onInvoiceDueClear_send_to_admin = (payload: {
  title: string;
  amount: number;
  clearanceTime: string;
  remarks: string;
  agency_name: string;
  logo?: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${payload.title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <tr>
                    <td style="text-align: center; padding-bottom: 20px;">
                        <img src="${
                          payload.logo || PROJECT_LOGO
                        }" alt="Agency Logo" style="max-width: 150px;">
                        <h2 style="margin: 10px 0; color: #333;">${
                          payload.agency_name
                        }</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Invoice Due Amount:</strong> ${payload.amount} BDT
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Clearance Time:</strong> ${payload.clearanceTime}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Remarks:</strong> ${payload.remarks}
                    </td>
                </tr>
                <tr>
                    <td style="color: green; font-weight: bold; padding-top: 10px">
                        Agent Has Cleared This Invoice Due!
                    </td>
                </tr>
            </table>
        </body>
    </html>
    `;
};
