import {PROJECT_LOGO} from '../miscellaneous/constants';
export const moneyReceiptTemplate = (payload: {
  name: string;
  transactionId: string;
  paymentTime: string;
  amount: number;
  paymentMethod: string;
  invoiceNumber: string;
  paymentGateway: string;
  logo?: string;
}) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Money Receipt</title>
</head>
<body style="font-family: 'Arial', sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
    <div style="max-width: 500px; margin: 20px auto; background-color: #ffffff; border: 1px solid rgb(201, 200, 200); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <!-- Header Section -->
        <div style="background-color: #ECECEC; padding: 20px; text-align: center;">
            <img src=${payload.logo || PROJECT_LOGO} alt="Logo" style="display: block; width: 80px; margin: 0 auto 15px;">
            <h1 style="font-size: 22px; color: #333; margin: 0;">Payment Receipt</h1>
        </div>

        <!-- Content Section -->
        <div style="padding: 20px; color: #333;">
            <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${payload.name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.5;">Thank you for your payment. Below are the details of your transaction:</p>
             <p style="font-size: 14px; line-height: 0.5;">${payload.paymentGateway}</p>


            <!-- Receipt Details Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; border-radius: 6px; overflow: hidden;">
                <tr style="background-color: #f8f8f8;">
                    <th style="padding: 10px 12px; border: 1px solid #ddd; text-align: left; color: #333; background-color: #f8f8f8;">Invoice Number</th>
                    <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: left;">${payload.invoiceNumber}</td>
                </tr>
                <tr>
                    <th style="padding: 10px 12px; border: 1px solid #ddd; text-align: left; color: #333; background-color: #f8f8f8;">Transaction ID</th>
                    <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: left;">${payload.transactionId}</td>
                </tr>
                <tr style="background-color: #f8f8f8;">
                    <th style="padding: 10px 12px; border: 1px solid #ddd; text-align: left; color: #333;">Payment Time</th>
                    <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: left;">${payload.paymentTime}</td>
                </tr>
                <tr>
                    <th style="padding: 10px 12px; border: 1px solid #ddd; text-align: left; color: #333; background-color: #f8f8f8;">Amount Paid</th>
                    <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: left;">${payload.amount} BDT</td>
                </tr>
                <tr style="background-color: #f8f8f8;">
                    <th style="padding: 10px 12px; border: 1px solid #ddd; text-align: left; color: #333;">Payment Method</th>
                    <td style="padding: 10px 12px; border: 1px solid #ddd; text-align: left;">${payload.paymentMethod}</td>
                </tr>
                
            </table>

        </div>
    </div>
</body>
</html>
`;
};
