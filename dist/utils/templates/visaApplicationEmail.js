"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template_onCreateVisaApp_sent_to_admin = exports.template_onCreateVisaApp_sent_to_agent = exports.visaApplicationEmail = void 0;
const constants_1 = require("../miscellaneous/constants");
const visaApplicationEmail = (payload) => {
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
            <h1 style="margin: 0; font-size: 24px; color: #333;">Visa Application Confirmation</h1>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${payload.name}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Thank you for choosing our service. Below are the details of your visa application:</p>

            <!-- Table with Visa Application Details -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Visa Type</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.visaType} Visa</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Destination Country</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.destination}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Number of Travelers</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.numOfTravellers}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Application ID</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.applicationId}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${payload.price} BDT</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>

      `;
};
exports.visaApplicationEmail = visaApplicationEmail;
const template_onCreateVisaApp_sent_to_agent = (payload) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Visa Application Created</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #ececec; padding: 20px; text-align: center">
                    <!-- Image added here -->
                    <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">Visa Application Confirmation</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Dear <strong>${payload.name}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Thank you for choosing our service. Your visa application has been created. Please review the details of your application.</p>

                    <!-- Table with Visa Application Details -->
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Visa Mode</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.visaMode}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Destination Country</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.destination}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Number of Travelers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.numOfTravellers}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Application ID</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.applicationId}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.price} BDT</td>
                        </tr>
                    </table>
                </div>
            </div>
        </body>
    </html>
      `;
};
exports.template_onCreateVisaApp_sent_to_agent = template_onCreateVisaApp_sent_to_agent;
const template_onCreateVisaApp_sent_to_admin = (payload) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Visa Application</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #ececec; padding: 20px; text-align: center">
                    <!-- Image added here -->
                    <img src="${payload.logo || constants_1.PROJECT_LOGO}"
                        alt="online travel agency"
                        style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
                    <h1 style="margin: 0; font-size: 24px; color: #333;">New Visa Application</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">A new visa application has been received.</p>

                    <!-- Table with Visa Application Details -->
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Visa Mode</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.visaMode}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Destination Country</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.destination}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Number of Travelers</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.numOfTravellers}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Application ID</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.applicationId}</td>
                        </tr>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Price</th>
                            <td style="border: 1px solid #ddd; padding: 10px;">${payload.price} BDT</td>
                        </tr>
                    </table>
                </div>
            </div>
        </body>
    </html>
      `;
};
exports.template_onCreateVisaApp_sent_to_admin = template_onCreateVisaApp_sent_to_admin;
