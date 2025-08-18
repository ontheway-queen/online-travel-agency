import {PROJECT_LOGO, PROJECT_NUMBER, CLIENT_URL, BTOB_URL} from '../miscellaneous/constants';
export const registrationTemplate = (payload: { name: string }) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background-color: #f7f9fc; color: #333;">
    <div style="max-width: 450px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 1px solid #e7e9ec;">
        <!-- Header -->
        <div style="background-color: #ECECEC; color: rgb(29, 29, 29); padding: 20px; text-align: center;">
            <img src=${PROJECT_LOGO} alt="Logo" style="width: 120px; margin-bottom: 10px;">
            <h1 style="font-size: 20px; margin: 0;">Welcome to online travel agency!</h1>
        </div>  

        <!-- Content -->
        <div style="padding: 20px;">
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.5;">Hi <strong>${payload.name}</strong>,</p>
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.5;">Thank you for registering with <strong>online travel agency</strong>. We’re excited to have you on board!</p>
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.5;">Please verify your email address to activate your account and unlock all features.</p>
            
            <p style="margin: 15px 0; font-size: 14px; line-height: 1.5;">If you did not sign up for this account, please ignore this email or contact our support team.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5fa; text-align: center; padding: 10px; font-size: 12px; color: #666;">
            <p style="margin: 5px 0;">Need help? Call us at <strong>${PROJECT_NUMBER}</strong>.</p>
             <p style="margin: 5px 0;">Visit our website at <a href=${CLIENT_URL} target="_blank" style="color: #0085D4; text-decoration: none;">${CLIENT_URL}</a>.</p>
            <p style="margin: 5px 0;">&copy; 2025 online travel agency. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};


export const agentRegistrationTemplate = (payload: { name: string }) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Registration</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background-color: #f7f9fc; color: #333;">
    <div style="max-width: 450px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 1px solid #e7e9ec;">
        <!-- Header -->
        <div style="background-color: #ECECEC; color: rgb(29, 29, 29); padding: 20px; text-align: center;">
            <img src=${PROJECT_LOGO} alt="Logo" style="width: 120px; margin-bottom: 10px;">
            <h1 style="font-size: 20px; margin: 0;">Agent Registration Received</h1>
        </div>  

        <!-- Content -->
        <div style="padding: 20px;">
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.5;">Hi <strong>${payload.name}</strong>,</p>
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.5;">Thank you for registering as an agent with <strong>online travel agency</strong>.</p>
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.5;">Your registration has been received and is currently <strong>pending approval</strong> by our admin team.</p>
            <p style="margin: 10px 0; font-size: 14px; line-height: 1.5;">Once approved, you will receive an email confirmation and be able to log in to your account.</p>
            <p style="margin: 15px 0; font-size: 14px; line-height: 1.5;">If you have any questions or require assistance, feel free to contact us.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5fa; text-align: center; padding: 10px; font-size: 12px; color: #666;">
            <p style="margin: 5px 0;">Need help? Call us at <strong>${PROJECT_NUMBER}</strong>.</p>
            <p style="margin: 5px 0;">Visit our website at <a href="" target="_blank" style="color: #0085D4; text-decoration: none;">${BTOB_URL}</a>.</p>
            <p style="margin: 5px 0;">&copy; 2025 online travel agency. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

