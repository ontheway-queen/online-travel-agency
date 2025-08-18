import {PROJECT_LOGO, PROJECT_NAME, BTOB_URL,PROJECT_EMAIL_API_1,PROJECT_NUMBER} from '../miscellaneous/constants';
export const newAgencyAccount = (email: string, password: string) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${PROJECT_NAME} B2B</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
        <div style="background-color: #ececec; padding: 20px; text-align: center;">
            <img src=${PROJECT_LOGO}
                 alt="logo" 
                 style="display: block; width: 80px; margin-bottom: 10px; margin-left: auto; margin-right: auto;">
            <h1 style="margin: 0; font-size: 24px; color: #202020;">Welcome to ${PROJECT_NAME} B2B!</h1>
        </div>
        <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Your agency account has been created successfully. You can now access your account using the following credentials:</p>

            <!-- Credentials Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Email</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${email}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 10px; background-color: #f2f2f2; text-align: left;">Password</th>
                    <td style="border: 1px solid #ddd; padding: 10px;">${password}</td>
                </tr>
            </table>

            <p style="font-size: 16px; color: #333; margin-top: 20px;">Please click the button below to log in to your account:</p>

            <div style="text-align: center; margin: 20px 0;">
                <a href="${BTOB_URL}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Log In</a>
            </div>

            <p style="font-size: 12px; color: #8b8888;">If you have any questions or need assistance,
                <br>
                please don't hesitate to contact our support team.</p>
        </div>
        <div style="background-color: #f2f2f2; padding: 20px; text-align: center; font-size: 14px; color: #555;">
            <p style="margin: 0;">If you have any questions, feel free to contact us at <a href=${PROJECT_EMAIL_API_1} style="color: #0085D4; text-decoration: none;">${PROJECT_NUMBER}</a>.</p>
            <p style="margin: 5px 0;">&copy; 2024 ${PROJECT_NAME}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

  `;
};

export const AgencyRegistrationRequestApprovedTemplate = (
  email: string,
  password: string
) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${PROJECT_NAME} B2B</title>
        <style>
          /* Reset default styles */
          body, p {
            margin: 0;
            padding: 0;
          }
          /* Container */
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          /* Header */
          .header {
            background-color: #007BFF;
            padding: 20px;
            text-align: center;
            color: #fff;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .header h1 {
            font-size: 24px;
            margin: 0;
          }
          /* Content */
          .content {
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .content p {
            margin: 10px 0;
          }
          /* Button */
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #28a745;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
          }
          .button:hover {
            background-color: #218838;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your B2B Registration Request is Approved!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Congratulations! Your agency's registration request has been approved. You can now access your account using the following credentials:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>For security purposes, we recommend resetting your password immediately after your first login.</p>
            <p>Please click the button below to log in to your account:</p>
            <p style="text-align: center;"><a class="button" href="${BTOB_URL}" target="_blank">Log In</a></p>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br/>The ${PROJECT_NAME} B2B Team</p>
          </div>
        </div>
      </body>
    </html>`;
};

export const AgencyRegistrationRequestRejectedTemplate = () => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${PROJECT_NAME} B2B</title>
        <style>
          /* Reset default styles */
          body, p {
            margin: 0;
            padding: 0;
          }
          /* Container */
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          /* Header */
          .header {
            background-color: #dc3545;
            padding: 20px;
            text-align: center;
            color: #fff;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .header h1 {
            font-size: 24px;
            margin: 0;
          }
          /* Content */
          .content {
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .content p {
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your B2B Registration Request is Rejected</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We regret to inform you that your B2B registration request has been rejected. This decision was made based on our internal review process.</p>
            <p>If you believe this was a mistake or have any questions regarding your registration, please contact our support team for further assistance.</p>
            <p>We appreciate your understanding.</p>
            <p>Best regards,<br/>The ${PROJECT_NAME} B2B Team</p>
            <p style="text-align: center;"><a class="button" href="${BTOB_URL}" target="_blank">VISIT WEBSITE</a></p>
          </div>
        </div>
      </body>
    </html>`;
};
