export const BookingSupportTemplate = (payload: {
    supportType: string;
    bookingId: string;
    createdBy: string;
    createdAt: string;
    messages: {
      sender: string;
      sentAt: string;
      content: string;
    }[];
  }) => {
  
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Support Booking Details</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
            <tr>
                <td style="padding: 20px;">
                    <!-- Header Information -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                        <tr>
                            <td width="100" style="color: #666666; font-size: 14px; padding: 5px 0;">Booking ID</td>
                            <td style="font-size: 14px; padding: 5px 0;">${payload.bookingId}</td>
                        </tr>
                        <tr>
                            <td width="100" style="color: #666666; font-size: 14px; padding: 5px 0;">Support Type</td>
                            <td style="font-size: 14px; padding: 5px 0;">${payload.supportType}</td>
                        </tr>
                        <tr>
                            <td width="100" style="color: #666666; font-size: 14px; padding: 5px 0;">Created By</td>
                            <td style="font-size: 14px; padding: 5px 0;">${payload.createdBy}</td>
                        </tr>
                        <tr>
                            <td width="100" style="color: #666666; font-size: 14px; padding: 5px 0;">Created At</td>
                            <td style="font-size: 14px; padding: 5px 0;">${payload.createdAt}</td>
                        </tr>
                    </table>
    
                    <!-- Message Section -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9f9f9;">
                        <tr>
                            <td style="padding: 12px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                    <tr>
                                        <td style="color: #666666; font-size: 14px;">
                                            Sender: ${payload.messages[0].sender}
                                            <span style="color: #666666; font-size: 14px; margin-left: 20px;">Sent: ${payload.messages[0].sentAt}</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 12px 12px 12px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #eeeeee;">
                                    <tr>
                                        <td style="padding: 12px; font-size: 14px;">
                                            ${payload.messages[0].content}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
  };
  