"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailOtpTemplate = void 0;
const constants_1 = require("../miscellaneous/constants");
const sendEmailOtpTemplate = (otp, otpFor) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${constants_1.PROJECT_NAME} - OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color:rgb(255, 255, 255); font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
    <!-- Main Table Container -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F5F5; padding: 20px;">
        <tr>
            <td align="center" style="padding: 10px;">
                <!-- Content Container -->
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header Section -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #FFFFFF; border-bottom: 1px solid #eee;">
                            <img
                              src=${constants_1.PROJECT_LOGO}
                              alt=${constants_1.PROJECT_NAME}
                              style="width: 150px; border-radius: 50%;"
                            />
                        </td>
                    </tr>
                    <!-- Content Section -->
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: bold;">
                                Verification Code
                            </h1>
                            <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 24px;">
                                Please use the verification code below to ${otpFor}.
                            </p>
                            <!-- OTP Code Box -->
                            <div style="background-color: #F8F9FA; border-radius: 6px; padding: 20px; margin: 30px 0; text-align: center;">
                                <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #2C3E50; letter-spacing: 4px;">
                                    ${otp}
                                </span>
                            </div>
                            <p style="margin: 0 0 20px; color: #DC3545; font-size: 14px;">
                                ⏰ This code will expire in 3 minutes
                            </p>
                            <p style="margin: 30px 0 0; color: #555555; font-size: 16px; line-height: 24px;">
                                Thanks,<br/>
                                <strong>${constants_1.PROJECT_NAME}</strong>
                            </p>
                        </td>
                    </tr>
                    
                </table>
                <!-- Footer Note -->
                <table role="presentation" width="100%" style="max-width: 600px;">
                    <tr>
                        <td style="padding: 20px; text-align: center; color: #999999; font-size: 12px;">
                            This is an automated message, please do not reply.
                        </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 10px 30px 30px;">
                        <p style="font-size: 12px; color: #c0c0c0;">© ${new Date().getFullYear()} ${constants_1.PROJECT_NAME}. All rights reserved.</p>
                      </td>
                   </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};
exports.sendEmailOtpTemplate = sendEmailOtpTemplate;
