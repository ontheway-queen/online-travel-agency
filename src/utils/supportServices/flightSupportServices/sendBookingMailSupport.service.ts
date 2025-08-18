import AbstractServices from "../../../abstract/abstract.service";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
  flightBookingDetailsPDFTemplate,
  send_booking_mail,
} from "../../../utils/templates/flightBookingPdfTemplate2";
import Lib from "../../../utils/lib/lib";
import { flightBookTemplate } from "../../../utils/templates/flightBookTemplate";
import {
  ITicketIssueEmailTemplate,
  ITicketIssuePDFTemplate,
  template_onTicketIssue,
  template_onTicketIssueReminder,
  template_pdf_flightBookingDetails,
} from "../../../utils/templates/ticketIssueTemplates";
import { flightBookPdfTemplate2 } from "../../../utils/templates/flightBookTemplate2";
import {
  flightTicketIssuePdfTemplateB2C,
  flightTicketIssuePdfTemplateVersion2,
} from "../../../utils/templates/flightTicketIssueTemplateVersion2";
import config from "../../../config/config";
import {
  PROJECT_EMAIL_API_1,

  PROJECT_EMAIL_STATIC,
} from "../../miscellaneous/constants";
puppeteer.use(StealthPlugin());

export class SendBookingEmailService extends AbstractServices {
  //send flight booking email with pdf
  public async sendFlightBookingEmail(data: {
    flightBookTemplateData: {
      bookingId: string | number;
      airline: string;
      segments: any[];
      numberOfPassengers: number;
      route: string;
      journeyType: string;
      totalAmount: number;
      pnr: string;
      name: string;
    };
    flightBookingPdfData: any;
    email: string;
    bookingId: string;
    panel: "B2B" | "B2C";
  }) {
    const generatePdfBuffer = async (htmlContent: string): Promise<Buffer> => {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--window-size=1920,1080",
          "--disable-infobars",
        ],
        executablePath:
          config.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf();
      await browser.close();
      return Buffer.from(pdfBuffer);
    };

    const pdfBuffer = await generatePdfBuffer(
      flightBookPdfTemplate2(data.flightBookingPdfData)
    );

    await Lib.sendEmail(
      [PROJECT_EMAIL_API_1],
      `Flight Booking Confirmation of Booking ID : ${data.bookingId} | PNR : ${data.flightBookTemplateData.pnr} | ${data.panel}`,
      flightBookTemplate(data.flightBookTemplateData),
      [
        {
          filename: "Flight_Booking_Confirmation.pdf",
          content: pdfBuffer,
        },
      ]
    );
    if(data.panel === "B2B"){
      await Lib.sendEmail(
        data.email,
        `Flight Booking Confirmation of Booking ID : ${data.bookingId}`,
        flightBookTemplate(data.flightBookTemplateData),
        [
          {
            filename: "Flight_Booking_Confirmation.pdf",
            content: pdfBuffer,
          },
        ]
      );
    }
  }

  // ticket issue email with pdf
  public async sendFlightTicketIssuedEmail(data: {
    flightBookTemplateData: ITicketIssueEmailTemplate;
    flightBookingPdfData: any;
    email: string;
    bookingId: string | number;
    panel?: "B2B" | "B2C";
  }) {
    const generatePdfBuffer = async (htmlContent: string): Promise<Buffer> => {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--window-size=1920,1080",
          "--disable-infobars",
        ],
        executablePath:
          config.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf();
      await browser.close();
      return Buffer.from(pdfBuffer);
    };

    const pdfBuffer =
      data.panel === "B2C"
        ? await generatePdfBuffer(
            flightTicketIssuePdfTemplateB2C(data.flightBookingPdfData)
          )
        : await generatePdfBuffer(
            flightTicketIssuePdfTemplateVersion2(data.flightBookingPdfData)
          );

    await Lib.sendEmail(
      data.email,
      `Ticket has been issued for Booking ID: ${data.bookingId}`,
      template_onTicketIssue(data.flightBookTemplateData),
      [
        {
          filename: "Ticket_copy.pdf",
          content: pdfBuffer,
        },
      ]
    );

    await Lib.sendEmail(
      [PROJECT_EMAIL_API_1],
      `Ticket has been issued for Booking ID: ${data.bookingId} | PNR : ${data.flightBookingPdfData.pnr}`,
      template_onTicketIssue(data.flightBookTemplateData),
      [
        {
          filename: "Ticket_copy.pdf",
          content: pdfBuffer,
        },
      ]
    );
  }

  // send reminder
  public async sendReminderToIssueTicket(data: {
    flightBookTemplateData: ITicketIssueEmailTemplate;
    flightBookingPdfData: any;
    email: string;
    bookingId: string | number;
    last_time?: string | null;
    panel?: "B2B" | "B2C";
  }) {
    const generatePdfBuffer = async (htmlContent: string): Promise<Buffer> => {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--window-size=1920,1080",
          "--disable-infobars",
        ],
        executablePath:
          config.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf();
      await browser.close();
      return Buffer.from(pdfBuffer);
    };

    const pdfBuffer =
      data.panel === "B2C"
        ? await generatePdfBuffer(
            flightTicketIssuePdfTemplateB2C(data.flightBookingPdfData)
          )
        : await generatePdfBuffer(
            flightTicketIssuePdfTemplateVersion2(data.flightBookingPdfData)
          );

    // Add last_issue_time_details to template data if last_time exists
    const templateData = {
      ...data.flightBookTemplateData,
      last_issue_time: data.last_time
        ? Lib.lastTimeFormat(data.last_time)
        : undefined,
    };

    // Compose subject line with last issue time details if available
    const subjectCustomer = `Reminder: Please issue ticket for Booking ID: ${
      data.bookingId
    }${
      data.last_time
        ? ` | Last Issue Time Details: ${Lib.lastTimeFormat(data.last_time)}`
        : ""
    }`;

    const subjectProject = `Reminder: Ticket issuance pending for Booking ID: ${
      data.bookingId
    } | PNR: ${data.flightBookingPdfData.pnr}${
      data.last_time
        ? ` | Last Issue Time Details: ${Lib.lastTimeFormat(data.last_time)}`
        : ""
    }`;

    // Send reminder email to the customer
    await Lib.sendEmail(
      data.email,
      subjectCustomer,
      template_onTicketIssueReminder(templateData),
      [
        {
          filename: "Ticket_copy.pdf",
          content: pdfBuffer,
        },
      ]
    );

    // Send reminder email to project email API addresses
    await Lib.sendEmail(
      [PROJECT_EMAIL_API_1],
      subjectProject,
      template_onTicketIssueReminder(templateData),
      [
        {
          filename: "Ticket_copy.pdf",
          content: pdfBuffer,
        },
      ]
    );
  }

  public async sendFlightDetailsEmail(data: {
    flightBookingPdfData: any;
    email: string;
    bookingId: string;
    name: string;
    status: string;
    pnr: string;
  }) {
    const generatePdfBuffer = async (htmlContent: string): Promise<Buffer> => {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--window-size=1920,1080",
          "--disable-infobars",
        ],
        executablePath:
          config.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf();
      await browser.close();
      return Buffer.from(pdfBuffer);
    };

    const pdfBuffer = await generatePdfBuffer(
      flightTicketIssuePdfTemplateVersion2(data.flightBookingPdfData)
    );

    await Lib.sendEmail(
      data.email,
      `Ticket status - ${data.status} for Booking ID: ${data.bookingId}`,
      send_booking_mail(data.name, data.bookingId),
      [
        {
          filename: "Booking_Copy.pdf",
          content: pdfBuffer,
        },
      ]
    );

    await Lib.sendEmail(
      [PROJECT_EMAIL_API_1],
      `Ticket status - ${data.status} for Booking ID: ${data.bookingId} | PNR : ${data.pnr}`,
      send_booking_mail(data.name, data.bookingId),
      [
        {
          filename: "Booking_Copy.pdf",
          content: pdfBuffer,
        },
      ]
    );
  }
}
