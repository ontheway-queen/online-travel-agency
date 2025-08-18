"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankTransferSuccessTemplate = void 0;
const constants_1 = require("../miscellaneous/constants");
const bankTransferSuccessTemplate = (payload) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Verification Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: #ececec; color: #333333; text-align: center; padding: 20px;">
            <img src=${constants_1.PROJECT_LOGO} 
                 alt="online travel agency" 
                 style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
            <h1 style="margin: 0; font-size: 24px;">Payment Verified and Approved</h1>
        </div>
        <div style="padding: 20px; color: #333333;">
            <h2 style="margin-top: 0; font-size: 20px; color: #4CAF50;">Your Payment Has Been Verified</h2>
            <p>Dear ${payload.name},</p>
            <p>We are pleased to inform you that your manual bank transfer has been successfully verified and approved. Below are the payment details:</p>
            <ul style="padding-left: 20px; margin: 0; line-height: 1.6;">
                <li><strong>Payment Method:</strong> Manual Bank Transfer</li>
                <li><strong>Reference Number:</strong> ${payload.referenceNumber}</li>
                <li><strong>Transfer Date:</strong> ${payload.transferDate}</li>
                <li><strong>Amount:</strong> ${payload.amount}</li>
               
            </ul>
            <p>Your payment has been confirmed and your order is now being processed. If you have any questions or require further assistance, please do not hesitate to contact us.</p>
            <p>Best regards,</p>
            <p><strong>${constants_1.PROJECT_NAME}</strong></p>
        </div>
        <div style="text-align: center; padding: 15px; background: #f4f4f4; color: #777777; font-size: 12px;">
            <p>Need Help? <a href="tel:${constants_1.PROJECT_NUMBER}" style="color: #0085D4; text-decoration: none;">${constants_1.PROJECT_NUMBER}</a></p>
             <p style="margin: 5px 0;">Visit our website at <a href=${constants_1.CLIENT_URL} target="_blank" style="color: #0085D4; text-decoration: none;">${constants_1.CLIENT_URL}</a>.</p>
        </div>
    </div>
</body>
</html>
    `;
};
exports.bankTransferSuccessTemplate = bankTransferSuccessTemplate;
