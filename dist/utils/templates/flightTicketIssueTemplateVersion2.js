"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightTicketIssuePdfTemplateB2C = exports.flightTicketIssuePdfTemplateVersion2 = void 0;
const constants_1 = require("../miscellaneous/constants");
const flightTicketIssuePdfTemplateVersion2 = (payload) => {
    var _a, _b, _c, _d, _e;
    const passengerRows = payload.passengers
        .map((passenger) => {
        var _a, _b;
        return `<tr>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${passenger.name}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${(_a = passenger.passport_number) !== null && _a !== void 0 ? _a : 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${(_b = passenger.frequent_flyer_number) !== null && _b !== void 0 ? _b : 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${passenger.ticket ? passenger.ticket : 'N/A'}</td>
      </tr>`;
    })
        .join('');
    const segmentRows = payload.segments
        .map((segment, index) => `<tr>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">
              <div style="text-align: center; margin-bottom: 5px;">
                  <img src="${segment.airline.image}" alt="${segment.airline.name}" style="width: 30px; height: 30px;">
              </div>
              <div style="text-align: center; font-size: 12px;">
                  ${segment.airline.name}<br>
                  <span style="color: #6c757d;">${segment.airline.flight_number}</span>
              </div>
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.departure}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.duration}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.arrival}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.departure_date}</td>
      </tr>`)
        .join('');
    return `<!DOCTYPE html>
<html>
<head>
    <title>Flight Ticket</title>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                <h1 style="margin: 0; font-size: 18px; font-weight: bold;">${((_a = payload === null || payload === void 0 ? void 0 : payload.agency) === null || _a === void 0 ? void 0 : _a.name) || constants_1.PROJECT_NAME}</h1>
                <p style="margin: 5px 0; font-size: 12px;">📞 Ticket support: ${((_b = payload === null || payload === void 0 ? void 0 : payload.agency) === null || _b === void 0 ? void 0 : _b.phone) || constants_1.PROJECT_NUMBER}</p>
                <p style="margin: 5px 0; font-size: 12px;">📞 Customer support: ${((_c = payload === null || payload === void 0 ? void 0 : payload.agency) === null || _c === void 0 ? void 0 : _c.phone) || constants_1.PROJECT_NUMBER}</p>
                <p style="margin: 5px 0; font-size: 12px;">📍 Address: ${((_d = payload === null || payload === void 0 ? void 0 : payload.agency) === null || _d === void 0 ? void 0 : _d.address) || constants_1.PROJECT_ADDRESS}</p>
            </div>
            <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background-color: #007bff; display: flex; justify-content: center; align-items: center;">
                <img src="${((_e = payload === null || payload === void 0 ? void 0 : payload.agency) === null || _e === void 0 ? void 0 : _e.photo) || constants_1.PROJECT_LOGO}" alt="Logo" style="width: 80px; height: 80px; object-fit: contain;">
            </div>
        </div>

        <!-- Passenger Information -->
        <div style="margin-bottom: 20px;">
            <div style="background: #007bff; color: white; padding: 8px; font-weight: bold; font-size: 14px;">
                ✈️ PASSENGER INFORMATION
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr style="background: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">PASSENGER</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">PASSPORT NO.</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">FREQUENT FLYER NUMBER</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">TICKET</th>
                </tr>
                ${passengerRows}
            </table>
        </div>

        <!-- Airline Information -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: #e3f2fd;">
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">AIRLINE PNR</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">DATE OF ISSUE</th>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${payload.airlinePnr}</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${payload.date_of_issue}</td>
            </tr>
        </table>

        <!-- Itinerary Information -->
        <div style="margin-bottom: 20px;">
            <div style="background: #007bff; color: white; padding: 8px; font-weight: bold; font-size: 14px;">
                ✈️ ITINERARY INFORMATION
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr style="background: #e3f2fd;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">FLIGHT</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">FROM</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">DURATION</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">TO</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">Travel Time</th>
                </tr>
                ${segmentRows}
            </table>
        </div>

        <!-- Baggage Information -->
        <div style="page-break-before: always; break-before: page; margin-top: 50px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">🧳 BAGGAGE INFORMATION</h3>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                <p style="margin: 5px 0; font-size: 12px;"><strong>ONWARD</strong></p>
                <p style="margin: 5px 0; font-size: 12px;">Sector: ${payload.baggage_information.route}</p>
                <p style="margin: 5px 0; font-size: 12px;">Check-in: ${payload.baggage_information.check_in}</p>
            </div>
        </div>

        <!-- Important Reminders -->
        <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                <span style="color: #007bff;">📝</span> IMPORTANT REMINDERS
            </h3>
            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6c757d; font-size: 12px;">1</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 13px;">Flight Status</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Before your flight, please check your updated flight status on the airline website or by calling the airline customer support.</p>
                </div>
            </div>
            
    <!-- Online Checkin -->
    <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">2</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Online Checkin</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Airline websites usually have online checkins available which can be availed to.</p>
        </div>
    </div>

    <!-- Bag Drop Counter -->
    <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">3</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Bag Drop Counter</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Please be at the check-in bag Drop counter before closure for document verification & acceptance of check-in baggage.</p>
        </div>
    </div>

    <!-- Government Issued ID card -->
    <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">4</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Government Issued ID card</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Please carry a government issued ID card along with your e-ticket while travelling.</p>
        </div>
    </div>

    <!-- Emergency Exit Row -->
    <div style="display: flex; align-items: start; gap: 15px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">5</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Emergency Exit Row</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Passengers seated on the emergency exit row must comply with safety regulations & requirements.</p>
        </div>
    </div>
        </div>
    </div>
</body>
</html>`;
};
exports.flightTicketIssuePdfTemplateVersion2 = flightTicketIssuePdfTemplateVersion2;
const flightTicketIssuePdfTemplateB2C = (payload) => {
    const passengerRows = payload.passengers
        .map((passenger) => {
        var _a, _b;
        return `<tr>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${passenger.name}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${(_a = passenger.passport_number) !== null && _a !== void 0 ? _a : 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${(_b = passenger.frequent_flyer_number) !== null && _b !== void 0 ? _b : 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${passenger.ticket ? passenger.ticket : 'N/A'}</td>
      </tr>`;
    })
        .join('');
    const segmentRows = payload.segments
        .map((segment, index) => `<tr>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">
              <div style="text-align: center; margin-bottom: 5px;">
                  <img src="${segment.airline.image}" alt="${segment.airline.name}" style="width: 30px; height: 30px;">
              </div>
              <div style="text-align: center; font-size: 12px;">
                  ${segment.airline.name}<br>
                  <span style="color: #6c757d;">${segment.airline.flight_number}</span>
              </div>
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.departure}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.duration}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.arrival}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${segment.departure_date}</td>
      </tr>`)
        .join('');
    return `<!DOCTYPE html>
<html>
<head>
    <title>Flight Ticket</title>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                <h1 style="margin: 0; font-size: 18px; font-weight: bold;">${constants_1.PROJECT_NAME}</h1>
                <p style="margin: 5px 0; font-size: 12px;">📞 Ticket support: ${constants_1.PROJECT_NUMBER}</p>
                <p style="margin: 5px 0; font-size: 12px;">📞 Customer support: ${constants_1.PROJECT_NUMBER}</p>
                <p style="margin: 5px 0; font-size: 12px;">📍 Address: ${constants_1.PROJECT_ADDRESS}</p>
            </div>
            <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background-color: #007bff; display: flex; justify-content: center; align-items: center;">
                <img src="${constants_1.PROJECT_LOGO}" alt="Logo" style="width: 80px; height: 80px; object-fit: contain;">
            </div>
        </div>

        <!-- Passenger Information -->
        <div style="margin-bottom: 20px;">
            <div style="background: #007bff; color: white; padding: 8px; font-weight: bold; font-size: 14px;">
                ✈️ PASSENGER INFORMATION
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr style="background: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">PASSENGER</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">PASSPORT NO.</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">FREQUENT FLYER NUMBER</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">TICKET</th>
                </tr>
                ${passengerRows}
            </table>
        </div>

        <!-- Airline Information -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background: #e3f2fd;">
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">AIRLINE PNR</th>
                <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; font-size: 12px;">DATE OF ISSUE</th>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${payload.airlinePnr}</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">${payload.date_of_issue}</td>
            </tr>
        </table>

        <!-- Itinerary Information -->
        <div style="margin-bottom: 20px;">
            <div style="background: #007bff; color: white; padding: 8px; font-weight: bold; font-size: 14px;">
                ✈️ ITINERARY INFORMATION
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr style="background: #e3f2fd;">
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">FLIGHT</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">FROM</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">DURATION</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">TO</th>
                    <th style="padding: 8px; border: 1px solid #dee2e6; font-size: 12px;">Travel Time</th>
                </tr>
                ${segmentRows}
            </table>
        </div>

        <!-- Baggage Information -->
        <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">🧳 BAGGAGE INFORMATION</h3>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                <p style="margin: 5px 0; font-size: 12px;"><strong>ONWARD</strong></p>
                <p style="margin: 5px 0; font-size: 12px;">Sector: ${payload.baggage_information.route}</p>
                <p style="margin: 5px 0; font-size: 12px;">Check-in: ${payload.baggage_information.check_in}</p>
            </div>
        </div>

        <!-- Important Reminders -->
        <div style="margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                <span style="color: #007bff;">📝</span> IMPORTANT REMINDERS
            </h3>
            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #6c757d; font-size: 12px;">1</span>
                </div>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 13px;">Flight Status</h4>
                    <p style="margin: 0; color: #6c757d; font-size: 12px;">Before your flight, please check your updated flight status on the airline website or by calling the airline customer support.</p>
                </div>
            </div>
            
    <!-- Online Checkin -->
    <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">2</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Online Checkin</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Airline websites usually have online checkins available which can be availed to.</p>
        </div>
    </div>

    <!-- Bag Drop Counter -->
    <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">3</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Bag Drop Counter</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Please be at the check-in bag Drop counter before closure for document verification & acceptance of check-in baggage.</p>
        </div>
    </div>

    <!-- Government Issued ID card -->
    <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">4</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Government Issued ID card</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Please carry a government issued ID card along with your e-ticket while travelling.</p>
        </div>
    </div>

    <!-- Emergency Exit Row -->
    <div style="display: flex; align-items: start; gap: 15px;">
        <div style="width: 24px; height: 24px; background: #e9ecef; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <span style="color: #6c757d; font-size: 12px;">5</span>
        </div>
        <div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px;">Emergency Exit Row</h4>
            <p style="margin: 0; color: #6c757d; font-size: 12px;">Passengers seated on the emergency exit row must comply with safety regulations & requirements.</p>
        </div>
    </div>
        </div>
    </div>
</body>
</html>`;
};
exports.flightTicketIssuePdfTemplateB2C = flightTicketIssuePdfTemplateB2C;
