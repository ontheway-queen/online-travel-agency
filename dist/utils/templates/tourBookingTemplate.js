"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourBookingTemplate = void 0;
const constants_1 = require("../miscellaneous/constants");
const tourBookingTemplate = (payload) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visa Application Details</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
        <div style="background-color: #ececec; padding: 20px; text-align: center">
            <!-- Image added here -->
            <img src=${payload.logo || constants_1.PROJECT_LOGO}
                 alt="online travel agency" 
                 style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
            <h1 style="margin: 0; font-size: 24px; color: #202020;">Tour Booking Confirmation</h1>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${payload.name}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Thank you for choosing our service. Below are the details of your visa application:</p>

            <!-- Table with Visa Application Details -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Tour Type</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.tourType}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">City</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.city}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Adult Travelers</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.adult_travelers}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Child Travelers</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.child_travelers}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Travel Date</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.travelDate}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Total Amount</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.totalAmount} BDT</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>

    `;
};
exports.tourBookingTemplate = tourBookingTemplate;
