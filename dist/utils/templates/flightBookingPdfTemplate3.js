"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightBookingDetailsPDFTemplate = void 0;
const flightBookingDetailsPDFTemplate = (payload) => {
    return `
      <div style="font-family: Arial, sans-serif; margin: 20px; color: #333;">
        <h1 style="text-align: center; font-size: 24px; margin-bottom: 30px;">Booking Copy</h1>
        
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
          <div style="width: 100px; height: 100px; background: linear-gradient(45deg, #FF0080, #7928CA, #00C6FF); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          </div>
        </div>
    
        <div style="margin-bottom: 20px;">
          <div style="background-color: #F3F4F6; padding: 10px; font-weight: bold; border-radius: 4px;">Passenger Information</div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <th>Name</th><th>Type</th><th>Date of Birth</th><th>Passport Number</th><th>Passport Expiry</th>
            </tr>
            ${payload.passengerInfo
        .map((p) => `
              <tr>
                <td>${p.first_name + " " + p.last_name}</td><td>${p.type}</td><td>${p.date_of_birth}</td><td>${p.passport_number || ""}</td><td>${p.passport_expiry_date || ""}</td>
              </tr>
            `)
        .join("")}
          </table>
        </div>
    
        <div style="margin-bottom: 20px;">
          <div style="background-color: #F3F4F6; padding: 10px; font-weight: bold; border-radius: 4px;">Flight Details</div>
          <div>${payload.flightDetails.origin} → ${payload.flightDetails.destination}</div>
          <div><img src="${payload.flightDetails.airline_logo}" alt="Project Logo" style="width: 100%; height: 100%; object-fit: contain;"> ${payload.flightDetails.airline} | Flight No - ${payload.flightDetails.flight_number} | Aircraft Model - ${payload.flightDetails.aircraft}</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th>Date</th><th>Time</th><th>Flight Info</th><th>Flight Time</th><th>Cabin</th><th>Baggage</th>
            </tr>
            ${payload.flightDetails.segments
        .map((s) => `
              <tr>
                <td>${s.date}</td><td>${s.time}</td><td>${s.flightInfo}</td><td>${s.flightTime || ""}</td><td>${s.cabin}</td><td>${s.baggage}</td>
              </tr>
            `)
        .join("")}
          </table>
        </div>
    
        <div style="margin-bottom: 20px;">
          <div style="background-color: #F3F4F6; padding: 10px; font-weight: bold; border-radius: 4px;">Fare Details</div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <th>Base Fare</th><th>Tax</th><th>AIT/VAT</th><th>Commission</th><th>Person</th><th>Total</th>
            </tr>
            <tr>
              <td>${payload.fareDetails.baseFare}</td><td>${payload.fareDetails.tax}</td><td>${payload.fareDetails.aitVat}</td><td>${payload.fareDetails.commission}</td><td>${payload.fareDetails.person}</td><td>${payload.fareDetails.total}</td>
            </tr>
          </table>
        </div>
      </div>
    `;
};
exports.flightBookingDetailsPDFTemplate = flightBookingDetailsPDFTemplate;
