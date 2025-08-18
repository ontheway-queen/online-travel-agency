import {
  PROJECT_LOGO,
  PROJECT_NAME,
  PROJECT_EMAIL_STATIC,
  PROJECT_NUMBER,
  PROJECT_ADDRESS,
} from "../miscellaneous/constants"
export const flightBookingDetailsPDFTemplate = (payload: {
  agency?: {
    email: string;
    phone: string;
    address: string;
    photo: string;
    name: string;
  };
  bookingDate: string;
  bookingId: string;
  bookingStatus: string;
  pnr: string;
  airlinePnr: string;
  route: string;
  totalPassenger: number;
  journeyType: string;
  travelSegments: {
    flightNo: string;
    airline: string;
    origin: string;
    destination: string;
    class: string;
    baggage: string;
    departureTime: string;
    arrivalTime: string;
  }[];
  travelers: {
    type: string;
    reference: string;
    name: string;
    dob: string;
    gender: string;
    phone: string;
  }[];
  fareDetails: {
    ticketPrice: string;
    baseFare: string;
    discount: string;
    totalTax: string;
    payableAmount: string;
  };
}) => {
  const {
    bookingDate,
    bookingId,
    bookingStatus,
    pnr,
    route,
    totalPassenger,
    travelSegments,
    travelers,
    fareDetails,
  } = payload;

  const travelSegmentsRows = travelSegments
    .map(
      (segment) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${
          segment.airline
        } (${segment.flightNo})</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${
          segment.origin
        }</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${
          segment.destination
        }</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${segment.class}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${
          segment.baggage
        }</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
          segment.departureTime
        )
          .toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(",", "")}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
          segment.arrivalTime
        )
          .toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(",", "")}</td>
      </tr>
    `
    )
    .join("");

  const travelersRows = travelers
    .map(
      (traveler) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.type}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${
          traveler.reference
        }</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${traveler.dob}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${
          traveler.gender
        }</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${
          traveler.phone || "---"
        }</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Flight Ticket</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
        <div style="border: 1px solid #ddd; border-radius: 4px; padding: 20px; max-width: 800px; margin: 0 auto;">
            <!-- Header Section -->
            <div style="display: flex; margin-bottom: 30px; border-bottom: 1px solid #e0e0e0;">
                <div style="width: 100px; height: 100px; background-color: #007bff;">
                    <img src="${
                      payload.agency?.photo || PROJECT_LOGO
                    }" alt="Project Logo" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <div style="flex-grow: 1; text-align: right;">
                    <h2 style="margin: 0; font-size: 18px;">${
                      payload.agency?.name || PROJECT_NAME
                    }</h2>
                    <p style="margin: 5px 0; color: #666;">${
                      payload.agency?.phone || PROJECT_NUMBER
                    }</p>
                    <p style="margin: 5px 0; color: #666;">${
                      payload.agency?.email || PROJECT_EMAIL_STATIC
                    }</p>
                    <p style="margin: 5px 0; color: #666;">${
                      payload.agency?.address || PROJECT_ADDRESS
                    }</p>
                </div>
            </div>

            <!-- Booking Header -->
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; padding: 15px 0; ">
                <div style="flex: 1;">
                    <div style="margin-bottom: 8px;">
                        <span style="color: #444; font-size: 14px;">Booking ID :</span>
                        <span style="margin-left: 8px; font-size: 14px;">${
                          payload.bookingId
                        }</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #444; font-size: 14px;">Journey :</span>
                        <span style="margin-left: 8px; font-size: 14px;">${
                          payload.journeyType
                        }</span>
                    </div>
                    <div>
                        <span style="color: #444; font-size: 14px;">Issue Date :</span>
                        <span style="margin-left: 8px; font-size: 14px;">${
                          payload.bookingDate
                        }</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="display: inline-block; padding: 4px 12px; background-color: #f5f5f5; border-radius: 4px; margin-bottom: 12px;">
                        <span style="font-size: 14px; color: #444;">E-Booking</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #444; font-size: 14px;">GDS PNR :</span>
                        <span style="margin-left: 8px; font-size: 14px; color: #ff5722;">${
                          payload.pnr
                        }</span>
                    </div>
                    <div>
                        <span style="color: #444; font-size: 14px;">Airline PNR :</span>
                        <span style="margin-left: 8px; font-size: 14px; color: #ff5722;">${
                          payload.airlinePnr
                        }</span>
                    </div>
                </div>
            </div>

            <!-- Travel Segments -->
            <table style="width: 100%; border-radius: 8px; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Flight</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Origin</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Destination</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Class</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Baggage</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Departure Time</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Arrival Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${travelSegmentsRows}
                </tbody>
            </table>

            <!-- Traveler Details -->
            <h3 style="margin: 20px 0; font-size: 16px;">Traveler Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Type</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Reference</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Name</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Date of Birth</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Gender</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Phone</th>
                    </tr>
                </thead>
                <tbody>
                    ${travelersRows}
                </tbody>
            </table>

            <!-- Fare Details -->
            
            <div style="margin-top: 30px;">
              <p style="font-size: 16px; margin-bottom: 15px;">Fare Details:</p>
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 8px; background-color: #fff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                <div style="display: grid; grid-template-columns: 1fr auto;">
                  <!-- Labels -->
                  <div style="">
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Base Fare
                    </p>
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Tax
                    </p>
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Ticket Price
                    </p>
                    <p style="font-size: 14px;  margin: 8px 0; display: flex; align-items: center;">
                      <span style="width: 8px; height: 8px; background-color: #e3f2fd; border-radius: 50%; margin-right: 8px;"></span>
                      Discount
                    </p>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e0e0e0;">
                      <p style="font-size: 14px; font-weight: 600; margin: 8px 0; display: flex; align-items: center;">
                        <span style="width: 8px; height: 8px; background-color: #007bff; border-radius: 50%; margin-right: 8px;"></span>
                        Payable Amount
                      </p>
                    </div>
                  </div>
                  
                  <!-- Values -->
                  <div style="text-align: right;">
                    <p style="font-size: 14px; margin: 8px 0;">${
                      fareDetails.baseFare
                    }</p>
                    <p style="font-size: 14px; margin: 8px 0;">${
                      fareDetails.totalTax
                    }</p>
                    <p style="font-size: 14px;  margin: 8px 0;">${
                      fareDetails.ticketPrice
                    }</p>
                    <p style="font-size: 14px;  margin: 8px 0;">${
                      fareDetails.discount
                    }</p>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e0e0e0;">
                      <p style="font-size: 16px; font-weight: 600; margin: 8px 0;">${
                        fareDetails.payableAmount
                      }</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
    </body>
    </html>
  `;
};


export const send_booking_mail = (name: string, booking_id: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Flight Booking Details</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff; padding: 20px;">
          <p style="font-size: 16px; color: #333;">Dear ${name},</p>
          <p style="font-size: 16px; color: #333;">
            This is your flight booking <strong>${booking_id}</strong> details.
          </p>
        </div>
      </body>
    </html>
  `;
};

