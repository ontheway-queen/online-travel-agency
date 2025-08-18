"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template_onLoanRequest_send_to_admin = exports.template_onLoanRepayment_send_to_admin = exports.template_onLoanRepayment_send_to_agency = exports.template_onLoanGiven_send_to_admin = exports.template_onLoanGiven_send_to_agency = void 0;
const constants_1 = require("../miscellaneous/constants");
const template_onLoanGiven_send_to_agency = (payload) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${payload.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <img src="${payload.logo || constants_1.PROJECT_LOGO}" alt="Agency Logo" style="max-width: 150px;" />
              <h2 style="margin: 10px 0; color: #333;">${payload.agency_name}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #333;">
              <strong>Loan Amount:</strong> ${payload.amount} BDT
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #333;">
              <strong>Date:</strong> ${payload.date}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #333;">
              <strong>Remarks:</strong> ${payload.remarks}
            </td>
          </tr>
          <tr>
            <td style="color: green; font-weight: bold; padding-top: 10px;">
              A new loan has been added to your account.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
exports.template_onLoanGiven_send_to_agency = template_onLoanGiven_send_to_agency;
const template_onLoanGiven_send_to_admin = (payload) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${payload.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <table style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 0 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <img src="${payload.logo || constants_1.PROJECT_LOGO}" alt="Agency Logo" style="max-width: 140px;" />
              <h2 style="margin: 12px 0; color: #222;">Loan Issued Notification</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #444;">
              A new loan has been issued to the following agency:
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Agency Name:</strong> ${payload.agency_name}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Loan Amount:</strong> ${payload.amount} BDT
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Date:</strong> ${payload.date}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Remarks:</strong> ${payload.remarks}
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px; font-size: 15px; color: #666;">
              Please review the transaction in the admin dashboard.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
exports.template_onLoanGiven_send_to_admin = template_onLoanGiven_send_to_admin;
const template_onLoanRepayment_send_to_agency = (payload) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${payload.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <img src="${payload.logo || constants_1.PROJECT_LOGO}" alt="Agency Logo" style="max-width: 150px;" />
              <h2 style="margin: 10px 0; color: #333;">${payload.agency_name}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #333;">
              <strong>Repayment Amount:</strong> ${payload.amount} BDT
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #333;">
              <strong>Repayment Date:</strong> ${payload.repaymentDate}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #333;">
              <strong>Remarks:</strong> ${payload.remarks}
            </td>
          </tr>
          <tr>
            <td style="color: green; font-weight: bold; padding-top: 10px;">
              Thank you for your repayment!
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
exports.template_onLoanRepayment_send_to_agency = template_onLoanRepayment_send_to_agency;
const template_onLoanRepayment_send_to_admin = (payload) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${payload.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <img src="${payload.logo || constants_1.PROJECT_LOGO}" alt="Agency Logo" style="max-width: 150px;" />
              <h2 style="margin: 10px 0; color: #333;">${payload.agency_name}</h2>
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; color: #333; padding: 10px 0;">
              <strong>Repayment Amount:</strong> ${payload.amount} BDT
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; color: #333; padding: 10px 0;">
              <strong>Repayment Date:</strong> ${payload.repaymentDate}
            </td>
          </tr>
          <tr>
            <td style="font-size: 16px; color: #333; padding: 10px 0;">
              <strong>Remarks:</strong> ${payload.remarks}
            </td>
          </tr>
          <tr>
            <td style="color: green; font-weight: bold; padding-top: 10px;">
              The agency has repaid a loan. Please review the transaction.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
exports.template_onLoanRepayment_send_to_admin = template_onLoanRepayment_send_to_admin;
const template_onLoanRequest_send_to_admin = (payload) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${payload.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <table style="max-width: 600px; width: 100%; background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 0 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <img src="${payload.logo || constants_1.PROJECT_LOGO}" alt="Agency Logo" style="max-width: 140px;" />
              <h2 style="margin: 12px 0; color: #222;">Loan Request Notification</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 16px; color: #444;">
              A new loan request has been submitted by the following agency:
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Agency Name:</strong> ${payload.agency_name}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Requested Amount:</strong> ${payload.amount} BDT
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Date:</strong> ${payload.date}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #333;">
              <strong>Remarks:</strong> ${payload.remarks}
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <a href="${payload.admin_url}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 15px;">
                Open Admin Panel
              </a>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};
exports.template_onLoanRequest_send_to_admin = template_onLoanRequest_send_to_admin;
