import { PROJECT_IMAGE_URL, PROJECT_LOGO } from "../miscellaneous/constants"

export const template_onDepositToAgency_send_to_agent = (payload: {
  type: string;
  amount: number;
  date_time: string;
  remarks: string;
  logo?: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Deposit</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #ececec; padding: 20px; text-align: center">
                    <!-- Image added here -->
                    <img src="${payload.logo || PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Account Has Been ${
                      payload.type === "credit" ? "Credited" : "Debited"
                    }</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Details:</p>

                    <!-- Table with Visa Application Details -->
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Deposit Type</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${
                              payload.type
                            }</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Amount</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${
                              payload.amount
                            } BDT</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Deposit Time</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${
                              payload.date_time
                            }</td>
                        </tr>
                        <tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Remarks</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${
                              payload.remarks
                            }</td>
                        </tr>
                    </table>
                    <p style="font-size: 16px; color: #666;">Please contact administration if you have any query.</p>
                </div>
            </div>
        </body>
    </html>
    `;
};

export const template_onDepositReqInsert_send_to_agent = (payload: {
  title: string;
  bank_name?: number;
  total_amount: number;
  agency_name: string;
  remarks?: string;
  logo?: string;
  payment_date?: string;
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
                        <strong>Bank Name:</strong> ${
                          payload.bank_name || "N/A"
                        }
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Amount:</strong> ${payload.total_amount} BDT
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Remarks:</strong> ${payload.remarks || "N/A"}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Payment Date:</strong> ${
                          payload.payment_date || "N/A"
                        }
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                    Please wait for the confirmation.
                    </td>
                </tr>
            </table>
        </body>
    </html>
    `;
};

export const template_onDepositReqInsert_send_to_admin = (payload: {
  title: string;
  bank_name?: number;
  total_amount: number;
  agency_name: string;
  remarks?: string;
  logo?: string;
  payment_date?: string;
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
                        <strong>Bank Name:</strong> ${
                          payload.bank_name || "N/A"
                        }
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Amount:</strong> ${payload.total_amount} BDT
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Remarks:</strong> ${payload.remarks || "N/A"}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Payment Date:</strong> ${
                          payload.payment_date || "N/A"
                        }
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                    Please confirm the deposit request.
                    </td>
                </tr>
            </table>
        </body>
    </html>
    `;
};

export const template_onDepositReqUpdate_send_to_agent = (payload: {
  title: string;
  bank_name?: number;
  total_amount: number;
  agency_name: string;
  remarks?: string;
  logo?: string;
  payment_date?: string;
  status: string;
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
                          payload.logo
                            ? PROJECT_IMAGE_URL + "/" + payload.logo
                            : PROJECT_LOGO
                        }" alt="Agency Logo" style="max-width: 150px;">
                        <h2 style="margin: 10px 0; color: #333;">${
                          payload.agency_name
                        }</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Bank Name:</strong> ${
                          payload.bank_name || "N/A"
                        }
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Amount:</strong> ${payload.total_amount} BDT
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Remarks:</strong> ${payload.remarks || "N/A"}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: #333;">
                        <strong>Payment Date:</strong> ${
                          payload.payment_date || "N/A"
                        }
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-size: 16px; color: ${
                      payload.status === "approved" ? "green" : "red"
                    };">
                    ${
                      payload.status === "approved"
                        ? "Request Accepted!"
                        : "Request Rejected!"
                    }
                    </td>
                </tr>
            </table>
        </body>
    </html>
    `;
};
