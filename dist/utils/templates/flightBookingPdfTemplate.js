"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightBookingDetailsPDFTemplate = void 0;
const constants_1 = require("../miscellaneous/constants");
const flightBookingDetailsPDFTemplate = (payload) => {
    var _a, _b, _c, _d;
    const { tripDetails, reservationCodes, flights } = payload;
    return `<!DOCTYPE html>
<html>
<head>
    <title>Flight Itinerary</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 20px; color: #333;">
    <div style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee;">
            <img src=${((_a = payload.agency_data) === null || _a === void 0 ? void 0 : _a.logo) || constants_1.PROJECT_LOGO} alt="online travel agency" style="width: 50px; height: 50px; margin-right: 15px;">
            <div>
                <div style="font-size: 24px; font-weight: bold; color: #2c3e50;">${((_b = payload.agency_data) === null || _b === void 0 ? void 0 : _b.agency_name) || constants_1.PROJECT_NAME}</div>
                <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">
                    <div>Email: ${((_c = payload.agency_data) === null || _c === void 0 ? void 0 : _c.agency_email) || constants_1.PROJECT_EMAIL_STATIC}</div>
                    <div>Phone: ${((_d = payload.agency_data) === null || _d === void 0 ? void 0 : _d.agency_phone) || constants_1.PROJECT_NUMBER}</div>
                </div>
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            <span style="font-size: 18px; font-weight: bold;">
                ${tripDetails.startDate} ▸ ${tripDetails.endDate} TRIP TO ${tripDetails.destination.toUpperCase()}
            </span>
        </div>


        <div style="margin-bottom: 20px;">
            <div>RESERVATION CODE: ${reservationCodes.reservationCode}</div>
        </div>

        ${flights.map(flight => `
        <div style="border: 1px solid #ccc; margin-bottom: 30px; padding: 15px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <span style="font-size: 24px;">✈</span>
                <span style="margin-left: 10px; font-weight: bold;">DEPARTURE: ${flight.departure.time}</span>
                <span style="font-size: 12px; margin-left: 10px; color: #666;">Please verify flight times prior to departure</span>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f5f5f5;">
                    <td style="padding: 15px; width: 33%;">
                        <div style="font-weight: bold;">${flight.airline}</div>
                        <div>${flight.flightNumber}</div>
                        <div style="margin-top: 10px;">Duration:</div>
                        <div>${flight.duration}</div>
                        <div style="margin-top: 10px;">Cabin:</div>
                        <div>${flight.cabin}</div>
                    </td>
                    <td style="padding: 15px; width: 33%;">
                        <div style="font-weight: bold;">${flight.departure.code}</div>
                        <div>${flight.departure.city}</div>
                        <div style="margin-top: 10px;">Departing At:</div>
                        <div style="font-weight: bold;">${flight.departure.time}</div>
                        <div style="margin-top: 10px;">Terminal:</div>
                        <div>${flight.departure.terminal || "---"}</div>
                    </td>
                    <td style="padding: 15px; width: 33%;">
                        <div style="font-weight: bold;">▸ ${flight.arrival.code}</div>
                        <div>${flight.arrival.city}</div>
                        <div style="margin-top: 10px;">Arriving At:</div>
                        <div style="font-weight: bold;">${flight.arrival.time}</div>
                        <div style="margin-top: 10px;">Terminal:</div>
                        <div>${flight.arrival.terminal || "---"}</div>
                    </td>
                </tr>
            </table>

            <div style="margin-top: 15px; font-size: 14px;">
                <div>Aircraft: ${flight.aircraft}</div>
                <div>Baggage: ${flight.baggage.checked}</div>
            </div>
        </div>
        `).join('')}


        <div style="margin-top: 30px; border: 1px solid #ccc; padding: 15px;">
            <h2 style="font-size: 18px; margin-bottom: 15px;">Traveler Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ccc;">Name</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ccc;">Type</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ccc;">Gender</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ccc;">Date of Birth</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ccc;">Passport Number</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ccc;">Passport Expiry Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${payload.travelers.map(traveler => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc;">${traveler.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc;">${traveler.type}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc;">${traveler.gender}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc;">${traveler.date_of_birth}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc;">${traveler.passport_number || "N/A"}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc;">${traveler.passport_expiry_date || "N/A"}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
};
exports.flightBookingDetailsPDFTemplate = flightBookingDetailsPDFTemplate;
