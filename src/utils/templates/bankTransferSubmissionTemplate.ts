import { PROJECT_LOGO,CLIENT_URL } from "../miscellaneous/constants"
export const bankTransferSubmissionTemplate = () => {
  return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Verification</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; margin: 0; padding: 0;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background-color: #F4F4F9; padding: 20px; text-align: center;">
                            <img src=${PROJECT_LOGO} 
                                alt="online travel agency" 
                                style="display: block; width: 80px; margin: 0 auto 10px;">
                            <h1 style="margin: 0; font-size: 24px; color: #333;">Wait For Payment Verification</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; text-align: center; color: #333;">
                            <p style="margin: 0; line-height: 1.6;">
                                Thank you for submitting your payment details. We have received your<br>
                                <span style="font-weight: bold; color: #141414;">manual bank transfer</span> request.
                            </p>
                            <p style="margin: 15px 0 0; line-height: 1.6;">
                                Our team is currently reviewing your payment details. This process may take some time. Please wait for our confirmation email.
                            </p>
                            <p style="margin: 15px 0 0; line-height: 1.6;">
                                If you have any questions, feel free to contact us.
                            </p>
                        </td>
                    </tr>
                    <tr>
                         <td style="background-color: #F4F4F9; padding: 10px; text-align: center; font-size: 12px; color: #888;">
                            <p style="margin: 0;">&copy; 2024 online travel agency. All rights reserved.</p>
                            <p style="margin: 5px 0;">Visit our website at 
                                <a href=${CLIENT_URL} target="_blank" style="color: #0085D4; text-decoration: none;">${CLIENT_URL}</a>.
                            </p>
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
