import config from '../../config/config';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { cabinCode, mealData } from '../miscellaneous/staticData';
import fs from 'fs';
import path from 'path';
import { Attachment } from 'nodemailer/lib/mailer';
import { Request } from 'express';
import { IFlightAvailability } from '../supportTypes/flightSupportTypes/commonFlightTypes';
import { PROJECT_NAME } from '../miscellaneous/constants';
class Lib {
  // make hashed password
  public static async hashPass(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // verify password
  public static async compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // create token
  public static createToken(creds: object, secret: string, maxAge: number | string) {
    return jwt.sign(creds, secret, { expiresIn: maxAge } as SignOptions);
  }

  // verify token
  public static verifyToken(token: string, secret: string) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // generate random Number
  public static otpGenNumber(length: number) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    let otp = '';

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);

      otp += numbers[randomNumber];
    }

    return otp;
  }

  // send email by nodemailer
  public static async sendEmail(
    email: string | string[],
    emailSub: string,
    emailBody: string,
    attachments?: Attachment[]
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // use STARTTLS
        requireTLS: true, // ensure TLS is used
        auth: {
          user: config.EMAIL_SEND_EMAIL_ID.trim(),
          pass: config.EMAIL_SEND_PASSWORD.trim(),
        },
      });

      const toEmails = Array.isArray(email) ? email.join(',') : email;

      const info = await transporter.sendMail({
        from: `${PROJECT_NAME} <${config.EMAIL_SEND_EMAIL_ID.trim()}>`,
        to: toEmails,
        subject: emailSub,
        html: emailBody,
        attachments: attachments || undefined,
      });

      console.log('Message send: %s', info);

      return true;
    } catch (err: any) {
      console.log({ err });
      return false;
    }
  }

  // compare object
  public static compareObj(a: any, b: any) {
    return JSON.stringify(a) == JSON.stringify(b);
  }

  // get meal by code
  public static getMeal(code: string) {
    return mealData.find((item) => item.code === code);
  }

  // get cabin by code
  public static getCabin(code: string) {
    return cabinCode.find((item) => item.code === code);
  }

  // get time value
  public static getTimeValue(timeString: string) {
    // Extract hours, minutes, and seconds
    let [time, timeZone] = timeString.split('+');
    if (!timeZone) {
      [time, timeZone] = timeString.split('-');
    }
    let [hours, minutes, seconds] = time.split(':');

    // Convert to milliseconds since midnight
    let timeValue =
      (parseInt(hours, 10) * 60 * 60 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10)) * 1000;

    // Adjust for time zone
    if (timeZone) {
      let [tzHours, tzMinutes] = timeZone.split(':');
      let timeZoneOffset = (parseInt(tzHours, 10) * 60 + parseInt(tzMinutes, 10)) * 60 * 1000;
      timeValue -= timeZoneOffset;
    }

    return timeValue;
  }

  //get total amount after adding percentage (SSL)
  public static getPaymentAmount(storeAmount: number, percentage: number) {
    return storeAmount / (1 - percentage / 100);
  }

  // Write file
  public static writeJsonFile(name: string, data: any) {
    const reqFilePath = path.join(`json/${name}.json`);

    fs.writeFile(reqFilePath, JSON.stringify(data, null, 4), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('JSON data has been written to', reqFilePath);
      }
    });
    // Write response in json data file======================
  }

  //convert time to locale string
  public static convertToLocaleString(time: any) {
    const completeTimeString = `1970-01-01T${time}`;

    // Parse the date and format it
    const date: any = new Date(completeTimeString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  }

  //get formatted date
  public static getFormattedDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return { year, month, day };
  }

  //remove country code from phone number
  public static removeCountryCodeFromPhoneNumber(phone_number: string) {
    if (phone_number.startsWith('0') && phone_number.length === 11) {
      return phone_number.slice(1); // Remove the first '0'
    } else if (phone_number.startsWith('+880')) {
      return phone_number.slice(4); // Remove the '+880'
    } else if (phone_number.startsWith('880')) {
      return phone_number.slice(3); // Remove the '880'
    } else {
      return phone_number; // Return the whole phone number if none of the conditions are met
    }
  }

  public static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? hours + ' hour' + (hours > 1 ? 's' : '') : ''} ${mins > 0 ? mins + ' minute' + (mins > 1 ? 's' : '') : ''
      }`.trim();
  }

  //get route of flight
  public static getRouteOfFlight(
    leg_description: { departureLocation: string; arrivalLocation: string }[]
  ) {
    let route;
    route = leg_description.map((item: any) => {
      return item.departureLocation;
    });
    route = route.join('-') + '-' + leg_description[leg_description.length - 1].arrivalLocation;
    return route;
  }

  //get journey dates of flight
  public static getJourneyDatesOfFlight(leg_description: { departureDate: string }[]) {
    let journey_date;
    journey_date = leg_description.map((item) => {
      return item.departureDate;
    });
    journey_date = journey_date.join(',');
    return journey_date;
  }

  //get booking code of flight
  public static getBookingCodeOfFlight(availability: IFlightAvailability[]) {
    return (
      availability?.flatMap((avElem) =>
        avElem?.segments?.map((segElem) => ({
          booking_code: segElem?.passenger[0]?.booking_code,
          cabin_type: segElem?.passenger[0]?.cabin_type,
        }))
      ) || []
    );
  }

  //get flight class
  public static getFlightClass(
    booking_code: { cabin_type?: string; booking_code?: string }[],
    booking_code_index: number,
    availability: IFlightAvailability
  ) {
    return (
      `${booking_code?.[booking_code_index]?.cabin_type}(${booking_code?.[booking_code_index]?.booking_code})` ||
      `${availability.segments[0].passenger[0].cabin_type}(${availability.segments[0].passenger[0].booking_code})`
    );
  }

  //generate audit trail message and type
  public static generateAuditMessage(req: Request) {
    const { method, originalUrl, body, params } = req;

    const endpoint = originalUrl.split('/').filter(Boolean).pop() || '';
    if (endpoint === 'notification') {
      return { success: false, message: '', type: '' };
    }

    const id = params?.id || body?.id || '';

    // Clean up path and extract relevant segments
    const cleanPath = originalUrl.split('?')[0];
    const basePath = cleanPath.replace(/^\/api\/v1\/(admin|btob)\//, '');
    const segments = basePath.split('/').filter(Boolean);

    // Build formatted entity
    const formattedEntity = segments
      .filter((seg) => isNaN(Number(seg)))
      .map((segment) =>
        segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      )
      .join(' ');

    const formatBody = (data: any): string => {
      return Object.entries(data || {})
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}: ${JSON.stringify(value)}`;
          } else {
            return `${key}: "${value}"`;
          }
        })
        .join(', ');
    };

    let message = '';
    let type = method;

    const isBookingSupport = /booking-(support|service)/.test(originalUrl);

    switch (method) {
      case 'POST':
        type = 'CREATE';
        if (endpoint === 'login') {
          message = `Logged in with email: "${body.email}".`;
          type = 'LOGIN';
        } else if (endpoint === 'change-password') {
          message = `Password has been reset.`;
          type = 'PASSWORD CHANGE';
        } else if (isBookingSupport && id) {
          message = `New message has been created for ${formattedEntity} (${id}) with information - ${formatBody(
            body
          )}.`;
        } else if (formattedEntity.startsWith('Multi Api Flight Booking')) {
          message = `Flight has been booked`;
        } else if (formattedEntity.startsWith('Multi Api Flight Ticket Issue')) {
          message = `Ticket has been issued for booking id ${id}`;
        } else if (/payment\/invoice/.test(cleanPath) && id) {
          message = `Due has been cleared for invoice ${id}`;
        } else {
          message = `${formattedEntity} has been created with information - ${formatBody(body)}.`;
        }
        break;

      case 'PUT':
      case 'PATCH':
        type = 'UPDATE';
        message = `${formattedEntity} (${id}) has been updated with information - ${formatBody(
          body
        )}.`;
        break;

      case 'DELETE':
        if (formattedEntity.startsWith('Multi Api Flight Booking')) {
          message = `Flight has been cancelled for booking id ${id}`;
        } else {
          message = `${formattedEntity} (${id}) has been deleted.`;
        }
        break;

      default:
        message = `${method} request made to ${originalUrl}`;
        break;
    }

    return { success: true, message, type };
  }

  //get adjusted amount from the payment gateways
  public static calculateAdjustedAmount(
    totalAmount: number,
    percentage: number,
    operation: 'add' | 'subtract'
  ) {
    return operation === 'add'
      ? Math.round(totalAmount * (1 + percentage / 100))
      : Math.round(totalAmount / (1 + percentage / 100));
  }

  // generate alpha numeric code
  public static generateAlphaNumericCode(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  public static generateRandomPassword(length: number) {
    const letters = `abc+[]{}|;depqrstuvwxyzABCDEFGH!@#$%^&*()_:',.<>?/IJKLMNOPQRSTUVWXYZ01234fghijklmno56789`;
    let randomNums = '';
    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * letters.length);
      randomNums += letters[randomNumber];
    }
    return randomNums;
  }

  public static generateUsername(full_name: string) {
    const newName = full_name.split(' ').join('_');
    return newName.toLowerCase();
  }

  public static formatAMPM(date: Date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 -> 12

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  }

  public static lastTimeFormat(message: string | null | undefined): string {
    if (!message || typeof message !== 'string') return String(message);

    const months: Record<string, string> = {
      JAN: 'January',
      FEB: 'February',
      MAR: 'March',
      APR: 'April',
      MAY: 'May',
      JUN: 'June',
      JUL: 'July',
      AUG: 'August',
      SEP: 'September',
      OCT: 'October',
      NOV: 'November',
      DEC: 'December',
    };

    try {
      // Format 1
      const format1 = /TO AC BY (\d{2})([A-Z]{3}) (\d{4}) (\w{3}) TIME ZONE OTHERWISE WILL BE XLD/i;

      // Format 2
      const format2 = /TTL FOR AUTO CANX FIXED FOR (\d{2})([A-Z]{3})(\d{2}) AT (\d{4}) (\w{3})/i;

      // Format 3
      const format3 =
        /ADV TKT NBR TO CX BY (\d{2})([A-Z]{3}) (\d{4}) (\w{3}) OR SUBJECT TO CANCEL/i;

      // Format 4: ISO 8601 with Z
      const isoWithZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

      // Format 5: ISO 8601 without Z
      const isoWithoutZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

      let match;

      if ((match = message.match(format1))) {
        const [, day, monthCode, time, tz] = match;
        const hours = time.slice(0, 2);
        const minutes = time.slice(2);
        const month = months[monthCode.toUpperCase()] || monthCode;
        return `Ticket must be accepted by ${day} ${month} at ${hours}:${minutes} (${tz} time zone), otherwise it will be cancelled.`;
      }

      if ((match = message.match(format2))) {
        const [, day, monthCode, year, time, tz] = match;
        const hours = time.slice(0, 2);
        const minutes = time.slice(2);
        const month = months[monthCode.toUpperCase()] || monthCode;
        return `Auto-cancellation time limit is fixed for ${day} ${month} 20${year} at ${hours}:${minutes} (${tz} time zone).`;
      }

      if ((match = message.match(format3))) {
        const [, day, monthCode, time, tz] = match;
        const hours = time.slice(0, 2);
        const minutes = time.slice(2);
        const month = months[monthCode.toUpperCase()] || monthCode;
        return `Advance ticket number must be cancelled by ${day} ${month} at ${hours}:${minutes} (${tz} time zone), or it will be subject to cancellation.`;
      }

      if (isoWithZ.test(message)) {
        const date = new Date(message);
        if (isNaN(date.getTime())) return message;
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', {
          month: 'long',
          timeZone: 'UTC',
        });
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `Ticket deadline is ${day} ${month} ${year} at ${hours}:${minutes} (UTC time zone).`;
      }

      if (isoWithoutZ.test(message)) {
        const date = new Date(message); // treated as local time
        if (isNaN(date.getTime())) return message;
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `Ticket deadline is ${day} ${month} ${year} at ${hours}:${minutes} (local time zone).`;
      }

      return message; // no match
    } catch {
      return message; // in case of error
    }
  }

  // minify html
  public static minifyHTML = (html: string) => {
    return html
      .replace(/\n/g, '') // Remove newlines
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim();
  };
}
export default Lib;
