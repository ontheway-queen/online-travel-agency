"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendBookingEmailService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const flightBookingPdfTemplate2_1 = require("../../../utils/templates/flightBookingPdfTemplate2");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const flightBookTemplate_1 = require("../../../utils/templates/flightBookTemplate");
const ticketIssueTemplates_1 = require("../../../utils/templates/ticketIssueTemplates");
const flightBookTemplate2_1 = require("../../../utils/templates/flightBookTemplate2");
const flightTicketIssueTemplateVersion2_1 = require("../../../utils/templates/flightTicketIssueTemplateVersion2");
const config_1 = __importDefault(require("../../../config/config"));
const constants_1 = require("../../miscellaneous/constants");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
class SendBookingEmailService extends abstract_service_1.default {
    //send flight booking email with pdf
    sendFlightBookingEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const generatePdfBuffer = (htmlContent) => __awaiter(this, void 0, void 0, function* () {
                const browser = yield puppeteer_extra_1.default.launch({
                    headless: true,
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--window-size=1920,1080",
                        "--disable-infobars",
                    ],
                    executablePath: config_1.default.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
                });
                const page = yield browser.newPage();
                yield page.setContent(htmlContent);
                const pdfBuffer = yield page.pdf();
                yield browser.close();
                return Buffer.from(pdfBuffer);
            });
            const pdfBuffer = yield generatePdfBuffer((0, flightBookTemplate2_1.flightBookPdfTemplate2)(data.flightBookingPdfData));
            yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Flight Booking Confirmation of Booking ID : ${data.bookingId} | PNR : ${data.flightBookTemplateData.pnr} | ${data.panel}`, (0, flightBookTemplate_1.flightBookTemplate)(data.flightBookTemplateData), [
                {
                    filename: "Flight_Booking_Confirmation.pdf",
                    content: pdfBuffer,
                },
            ]);
            if (data.panel === "B2B") {
                yield lib_1.default.sendEmail(data.email, `Flight Booking Confirmation of Booking ID : ${data.bookingId}`, (0, flightBookTemplate_1.flightBookTemplate)(data.flightBookTemplateData), [
                    {
                        filename: "Flight_Booking_Confirmation.pdf",
                        content: pdfBuffer,
                    },
                ]);
            }
        });
    }
    // ticket issue email with pdf
    sendFlightTicketIssuedEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const generatePdfBuffer = (htmlContent) => __awaiter(this, void 0, void 0, function* () {
                const browser = yield puppeteer_extra_1.default.launch({
                    headless: true,
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--window-size=1920,1080",
                        "--disable-infobars",
                    ],
                    executablePath: config_1.default.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
                });
                const page = yield browser.newPage();
                yield page.setContent(htmlContent);
                const pdfBuffer = yield page.pdf();
                yield browser.close();
                return Buffer.from(pdfBuffer);
            });
            const pdfBuffer = data.panel === "B2C"
                ? yield generatePdfBuffer((0, flightTicketIssueTemplateVersion2_1.flightTicketIssuePdfTemplateB2C)(data.flightBookingPdfData))
                : yield generatePdfBuffer((0, flightTicketIssueTemplateVersion2_1.flightTicketIssuePdfTemplateVersion2)(data.flightBookingPdfData));
            yield lib_1.default.sendEmail(data.email, `Ticket has been issued for Booking ID: ${data.bookingId}`, (0, ticketIssueTemplates_1.template_onTicketIssue)(data.flightBookTemplateData), [
                {
                    filename: "Ticket_copy.pdf",
                    content: pdfBuffer,
                },
            ]);
            yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Ticket has been issued for Booking ID: ${data.bookingId} | PNR : ${data.flightBookingPdfData.pnr}`, (0, ticketIssueTemplates_1.template_onTicketIssue)(data.flightBookTemplateData), [
                {
                    filename: "Ticket_copy.pdf",
                    content: pdfBuffer,
                },
            ]);
        });
    }
    // send reminder
    sendReminderToIssueTicket(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const generatePdfBuffer = (htmlContent) => __awaiter(this, void 0, void 0, function* () {
                const browser = yield puppeteer_extra_1.default.launch({
                    headless: true,
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--window-size=1920,1080",
                        "--disable-infobars",
                    ],
                    executablePath: config_1.default.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
                });
                const page = yield browser.newPage();
                yield page.setContent(htmlContent);
                const pdfBuffer = yield page.pdf();
                yield browser.close();
                return Buffer.from(pdfBuffer);
            });
            const pdfBuffer = data.panel === "B2C"
                ? yield generatePdfBuffer((0, flightTicketIssueTemplateVersion2_1.flightTicketIssuePdfTemplateB2C)(data.flightBookingPdfData))
                : yield generatePdfBuffer((0, flightTicketIssueTemplateVersion2_1.flightTicketIssuePdfTemplateVersion2)(data.flightBookingPdfData));
            // Add last_issue_time_details to template data if last_time exists
            const templateData = Object.assign(Object.assign({}, data.flightBookTemplateData), { last_issue_time: data.last_time
                    ? lib_1.default.lastTimeFormat(data.last_time)
                    : undefined });
            // Compose subject line with last issue time details if available
            const subjectCustomer = `Reminder: Please issue ticket for Booking ID: ${data.bookingId}${data.last_time
                ? ` | Last Issue Time Details: ${lib_1.default.lastTimeFormat(data.last_time)}`
                : ""}`;
            const subjectProject = `Reminder: Ticket issuance pending for Booking ID: ${data.bookingId} | PNR: ${data.flightBookingPdfData.pnr}${data.last_time
                ? ` | Last Issue Time Details: ${lib_1.default.lastTimeFormat(data.last_time)}`
                : ""}`;
            // Send reminder email to the customer
            yield lib_1.default.sendEmail(data.email, subjectCustomer, (0, ticketIssueTemplates_1.template_onTicketIssueReminder)(templateData), [
                {
                    filename: "Ticket_copy.pdf",
                    content: pdfBuffer,
                },
            ]);
            // Send reminder email to project email API addresses
            yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], subjectProject, (0, ticketIssueTemplates_1.template_onTicketIssueReminder)(templateData), [
                {
                    filename: "Ticket_copy.pdf",
                    content: pdfBuffer,
                },
            ]);
        });
    }
    sendFlightDetailsEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const generatePdfBuffer = (htmlContent) => __awaiter(this, void 0, void 0, function* () {
                const browser = yield puppeteer_extra_1.default.launch({
                    headless: true,
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--window-size=1920,1080",
                        "--disable-infobars",
                    ],
                    executablePath: config_1.default.APP_ENV === "DEV" ? undefined : "/usr/bin/chromium-browser",
                });
                const page = yield browser.newPage();
                yield page.setContent(htmlContent);
                const pdfBuffer = yield page.pdf();
                yield browser.close();
                return Buffer.from(pdfBuffer);
            });
            const pdfBuffer = yield generatePdfBuffer((0, flightTicketIssueTemplateVersion2_1.flightTicketIssuePdfTemplateVersion2)(data.flightBookingPdfData));
            yield lib_1.default.sendEmail(data.email, `Ticket status - ${data.status} for Booking ID: ${data.bookingId}`, (0, flightBookingPdfTemplate2_1.send_booking_mail)(data.name, data.bookingId), [
                {
                    filename: "Booking_Copy.pdf",
                    content: pdfBuffer,
                },
            ]);
            yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Ticket status - ${data.status} for Booking ID: ${data.bookingId} | PNR : ${data.pnr}`, (0, flightBookingPdfTemplate2_1.send_booking_mail)(data.name, data.bookingId), [
                {
                    filename: "Booking_Copy.pdf",
                    content: pdfBuffer,
                },
            ]);
        });
    }
}
exports.SendBookingEmailService = SendBookingEmailService;
