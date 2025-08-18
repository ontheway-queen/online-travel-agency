"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.email_template_to_send_notification = void 0;
const constants_1 = require("../miscellaneous/constants");
const email_template_to_send_notification = (payload) => {
    const detailsRows = Object.entries(payload.details)
        .map(([key, value]) => `
      <tr>
        <td style="padding: 6px 10px; font-weight: bold; text-transform: capitalize; color: #333;">${key.replace(/_/g, ' ')}:</td>
        <td style="padding: 6px 10px; color: #555;">${value}</td>
      </tr>`)
        .join("");
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${payload.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table style="max-width: 650px; width: 100%; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.08); padding: 20px;">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <img src="${payload.logo || constants_1.PROJECT_LOGO}" alt="Logo" style="max-width: 130px;" />
              <h2 style="margin: 10px 0; color: #222;">${payload.title}</h2>
            </td>
          </tr>
          <tr>
            <td>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                ${detailsRows}
              </table>
            </td>
          </tr>
          ${payload.note
        ? `<tr><td style="padding-top: 16px; color: #777; font-size: 14px;">Note: ${payload.note}</td></tr>`
        : ""}
        </table>
      </body>
    </html>
  `;
};
exports.email_template_to_send_notification = email_template_to_send_notification;
