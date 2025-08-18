import { PROJECT_LOGO } from '../miscellaneous/constants';
export const paymentSuccessTemplate = (payload: {
  name: string;
  paymentMethod: string;
  invoiceId: string | number;
  amount: number;
  gatewayCharge: number;
  paymentTime: string;
  transactionId: string;
  paymentType: string;
  paymentUsing: string;
  email: string;
  phone_number: string;
  details: string;
  logo?: string;
}) => {
  const getPaymentUsingLabel = (method: string): string => {
    switch (payload.paymentMethod.toUpperCase()) {
        case 'CARD':
        return 'Card Number';
        case 'BKASH':
        return 'Bkash Mobile Number';
        case 'NAGAD':
        return 'Nagad Mobile Number';
        case 'ROCKET':
        return 'Rocket Mobile Number';
        default:
        return 'Payment Identifier';
    }
  };
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Payment Successful</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #e0f7e9; padding: 20px; text-align: center;">
                <img src="${payload.logo || PROJECT_LOGO}" 
                     alt="Company Logo" 
                     style="display: block; width: 80px; margin: 0 auto 10px;" />
                <h1 style="margin: 0; font-size: 22px; color: #2e7d32;">Payment Successful</h1>
            </div>
            <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">Dear <strong>${payload.name}</strong>,</p>
                <p style="font-size: 16px; color: #333;">
                    Your payment has been received successfully. Here are the payment details:
                </p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Invoice ID</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.invoiceId}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Payment Method</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentMethod}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Payment Type</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentType}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">${getPaymentUsingLabel(payload.paymentMethod)}</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentUsing || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Amount (Excl. Charges)</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">৳ ${payload.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Gateway Charge (${payload.gatewayCharge}%)</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">৳ ${(payload.amount * payload.gatewayCharge / 100).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Transaction ID</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.transactionId}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Payment Time</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentTime}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Email</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.email}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Contact Number</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.phone_number}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Details</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.details}</td>
                    </tr>
                </table>

                <p style="margin-top: 20px; font-size: 14px; color: #555;">
                    If you have any questions regarding this payment, please contact our support team.
                </p>

                <p style="font-size: 14px; color: #555;">Thank you for choosing us!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};


export const agentTopUpSuccessTemplate = (payload: {
  agencyName: string;
  paymentMethod: string;
  amount: number;
  gatewayCharge: number;
  paymentTime: string;
  transactionId: string;
  paymentType: string;
  paymentUsing: string;
  logo?: string;
}) => {

  const getPaymentUsingLabel = (method: string): string => {
    switch (payload.paymentMethod.toUpperCase()) {
      case 'CARD':
        return 'Card Number';
      case 'BKASH':
        return 'Bkash Mobile Number';
      case 'NAGAD':
        return 'Nagad Mobile Number';
      case 'ROCKET':
        return 'Rocket Mobile Number';
      default:
        return 'Payment Identifier';
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Top-Up Successful</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #e0f7e9; padding: 20px; text-align: center;">
                <img src="${payload.logo || PROJECT_LOGO}" 
                     alt="Company Logo" 
                     style="display: block; width: 80px; margin: 0 auto 10px;" />
                <h1 style="margin: 0; font-size: 22px; color: #2e7d32;">Top-Up Successful</h1>
            </div>
            <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">Dear <strong>${payload.agencyName}</strong>,</p>
                <p style="font-size: 16px; color: #333;">
                    Your balance top-up has been completed successfully. Below are the details:
                </p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Payment Method</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentMethod}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Payment Type</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentType}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">${getPaymentUsingLabel(payload.paymentMethod)}</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentUsing || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Amount (Excl. Charges)</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">৳ ${payload.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Gateway Charge (${payload.gatewayCharge}%)</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">৳ ${(payload.amount * payload.gatewayCharge / 100).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Transaction ID</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.transactionId}</td>
                    </tr>
                    <tr>
                        <th style="text-align: left; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">Payment Time</th>
                        <td style="padding: 10px; border: 1px solid #ddd;">${payload.paymentTime}</td>
                    </tr>
                </table>

                <p style="margin-top: 20px; font-size: 14px; color: #555;">
                    If you have any questions about this top-up, please contact our support team.
                </p>

                <p style="font-size: 14px; color: #555;">Thank you for working with us!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

