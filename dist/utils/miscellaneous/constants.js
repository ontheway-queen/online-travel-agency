"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_LEVEL_INFO = exports.ERROR_LEVEL_DEBUG = exports.BTOC_PAYMENT_TYPE = exports.COM_SET_B2C = exports.COM_MODE_DECREASE = exports.COM_MODE_INCREASE = exports.COM_TYPE_FLAT = exports.COM_TYPE_PER = exports.CUSTOM_API = exports.SABRE_API = exports.TOUR_PACKAGE_HIGHLIGHT_SERVICE = exports.TOUR_PACKAGE_EXCLUDE_SERVICE = exports.TOUR_PACKAGE_INCLUDE_SERVICE = exports.SABRE_FLIGHT_ITINS = exports.BKASH_PERCENTAGE = exports.BRAC_PERCENTAGE = exports.SSL_PERCENTAGE = exports.CREDIT_LOAD = exports.ADMIN_URL = exports.BTOB_URL = exports.CLIENT_URL = exports.SERVER_URL = exports.priorityAirports = exports.BD_AIRPORT = exports.FLIGHT_COMMISSION = exports.DATA_LIMIT = exports.OTP_FOR = exports.OTP_EMAIL_SUBJECT = exports.SABRE_TOKEN_ENV = exports.PROJECT_ADDRESS = exports.PROJECT_IMAGE_URL = exports.PROJECT_NUMBER = exports.PROJECT_EMAIL_STATIC = exports.PROJECT_EMAIL_ACCOUNT_1 = exports.PROJECT_EMAIL_OTHERS_1 = exports.PROJECT_EMAIL_API_1 = exports.PROJECT_LOGO = exports.PROJECT_NAME = exports.PROJECT_CODE = exports.OTP_TYPE_TRANSACTION_VERIFY = exports.OTP_TYPE_ADMIN_TRANSACTION = exports.OTP_TYPE_VERIFY_ADMIN = exports.OTP_TYPE_AGENT_REGISTRATION = exports.OTP_TYPE_ADMIN_2FA = exports.OTP_TYPE_AGENT_2FA = exports.OTP_TYPE_FORGET_AGENT = exports.OTP_TYPE_FORGET_ADMIN = exports.OTP_TYPE_VERIFY_USER = exports.OTP_TYPE_FORGET_USER = exports.origin = void 0;
exports.commonFakeNames = exports.FLIGHT_FARE_RESPONSE = exports.REGISTRATION_REQUEST_STATE = exports.booking_support_status = exports.PANEL_TYPE = exports.SOURCE_ADMIN = exports.SOURCE_EXTERNAL = exports.SOURCE_B2C = exports.SOURCE_SUB_AGENT = exports.SOURCE_AGENT = exports.SUPPORT_TICKET_TYPES = exports.LOAN_TYPE = exports.NOTIFICATION_TYPE_B2B_DEPOSIT_REQUEST = exports.NOTIFICATION_TYPE_B2C_BANK_TRANSFER = exports.NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT = exports.NOTIFICATION_TYPE_B2B_BOOKING_SUPPORT = exports.NOTIFICATION_TYPE_B2C_TOUR_BOOKING = exports.NOTIFICATION_TYPE_B2B_TOUR_BOOKING = exports.NOTIFICATION_TYPE_B2C_VISA_APPLICATION = exports.NOTIFICATION_TYPE_B2B_VISA_APPLICATION = exports.NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING = exports.NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING = exports.PARTIAL_PAYMENT_DUE_CLEAR_BEFORE = exports.PARTIAL_PAYMENT_PERCENTAGE = exports.PARTIAL_PAYMENT_DEPARTURE_TIME_MINIMUM__DIFF = exports.REISSUE_STAFF_STATUS_ASSIGNED = exports.REISSUE_STAFF_STATUS_NOT_ASSIGNED = exports.REISSUE_STATUS_EXPIRED = exports.REISSUE_STATUS_REJECTED = exports.REISSUE_STATUS_APPROVED = exports.REISSUE_STATUS_PROCESSING = exports.REISSUE_STATUS_PENDING = exports.LAST_ENTRY_TYPE_REISSUE = exports.REFUND_STAFF_STATUS_ASSIGNED = exports.REFUND_STAFF_STATUS_NOT_ASSIGNED = exports.REFUND_STATUS_EXPIRED = exports.REFUND_STATUS_REJECTED = exports.REFUND_STATUS_APPROVED = exports.REFUND_STATUS_PROCESSING = exports.REFUND_STATUS_PENDING = exports.LAST_ENTRY_TYPE_REFUND = exports.TRAVELER_TYPE_PASSENGERS = exports.TRAVELER_TYPE_TRAVELERS = exports.INVOICE_TYPE_TOUR = exports.INVOICE_TYPE_UMRAH = exports.INVOICE_TYPE_VISA = exports.INVOICE_TYPE_FLIGHT = exports.ERROR_LEVEL_CRITICAL = exports.ERROR_LEVEL_ERROR = exports.ERROR_LEVEL_WARNING = void 0;
exports.BOOKING_STATUS = exports.B2b_CALLBACK_URL = exports.CALLBACK_URL = exports.AGENT_RECHARGE_PAGE = exports.BKASH_FAILED_PAGE = exports.BKASH_CANCEL_PAGE = exports.BKASH_SUCCESS_PAGE = void 0;
const config_1 = __importDefault(require("../../config/config"));
exports.origin = [
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:5173",
    "http://10.10.220.67:5173",
    "http://10.10.220.67:5174",
    "http://10.10.220.67:5175",
    "http://10.10.220.67:3000",
    "http://10.10.220.28:5174",
    "http://10.10.220.28:5173",
    "http://10.10.220.28:3000",
    "http://10.10.220.66:3000",
    "http://10.10.220.66:3001",
    "http://10.10.220.66:3002",
    "http://10.10.220.66:5173",
    "http://10.10.220.66:5174",
    "http://10.10.220.66:5175",
    "http://10.10.220.66:5173",
    "http://10.10.220.31:3000",
    "http://10.10.220.31:5173",
    "https://main.d3qc4072a435i6.amplifyapp.com", //b2c
    "https://www.main.d3qc4072a435i6.amplifyapp.com",
    "https://main.d75ettt1vxqyw.amplifyapp.com", //b2b
    "https://www.main.d75ettt1vxqyw.amplifyapp.com",
    "https://main.d3etdp965ayxk3.amplifyapp.com", //admin
    "https://www.main.d3etdp965ayxk3.amplifyapp.com",
    "https://cloudtrips.com",
    "https://www.cloudtrips.com",
    "https://b2b.cloudtrips.com",
    "https://www.b2b.cloudtrips.com",
    "https://admin.cloudtrips.com",
    "https://www.admin.cloudtrips.com"
];
// OTP types constants
exports.OTP_TYPE_FORGET_USER = 'reset_user';
exports.OTP_TYPE_VERIFY_USER = 'verify_user';
exports.OTP_TYPE_FORGET_ADMIN = 'reset_admin';
exports.OTP_TYPE_FORGET_AGENT = 'reset_agent';
exports.OTP_TYPE_AGENT_2FA = 'agent_2FA';
exports.OTP_TYPE_ADMIN_2FA = 'admin_2FA';
exports.OTP_TYPE_AGENT_REGISTRATION = 'verify_agent';
exports.OTP_TYPE_VERIFY_ADMIN = 'verify_admin';
exports.OTP_TYPE_ADMIN_TRANSACTION = 'admin_transaction';
exports.OTP_TYPE_TRANSACTION_VERIFY = 'transaction_verify';
//Project Info
exports.PROJECT_CODE = 'CLDT';
exports.PROJECT_NAME = 'online travel agency';
exports.PROJECT_LOGO = 'https://m360-trabill.s3.ap-south-1.amazonaws.com/cloud-trips-storage/logo-files/1754302997831-99708835.jpeg';
//send API related mail
exports.PROJECT_EMAIL_API_1 = config_1.default.APP_ENV === 'DEV' ? 'mahin.m360ict@gmail.com' : 'support@cloudtrips.com';
//send mails which are not related to API and Accounts
exports.PROJECT_EMAIL_OTHERS_1 = config_1.default.APP_ENV === 'DEV' ? 'shakeeb.m360ict@gmail.com' : 'support@cloudtrips.com';
//send mails related to accounts
exports.PROJECT_EMAIL_ACCOUNT_1 = config_1.default.APP_ENV === 'DEV' ? 'jasim.m360ict@gmail.com' : 'support@cloudtrips.com';
// Static mail address to show in the email template
exports.PROJECT_EMAIL_STATIC = 'support@cloudtrips.com';
//static phone number to show in the email template
exports.PROJECT_NUMBER = '8809610102010 ';
exports.PROJECT_IMAGE_URL = 'https://m360-trabill.s3.ap-south-1.amazonaws.com/cloud-trips-storage';
exports.PROJECT_ADDRESS = 'SW(G) 8, Gulshan Avenue, Gulshan-1';
// Sabre token env ID
exports.SABRE_TOKEN_ENV = 'sabre_token';
// Email subject
exports.OTP_EMAIL_SUBJECT = 'Your One Time Password For Verification';
// OTP for
exports.OTP_FOR = 'verification';
// Default data get limit
exports.DATA_LIMIT = 100;
// Flight commission
exports.FLIGHT_COMMISSION = 'flight_commission';
// BD Airport
exports.BD_AIRPORT = ['DAC', 'CGP', 'ZYL', 'CXB', 'JSR', 'BZL', 'RJH', 'SPD', 'IRD'];
exports.priorityAirports = [
    'DAC',
    'CGP',
    'ZYL',
    'CXB',
    'SPD',
    'RJH',
    'JSR',
    'BZL',
    'JED',
    'MCT',
    'DOH',
    'RUH',
    'DXB',
    'KUL',
    'DMM',
    'SIN',
    'SHJ',
    'MED',
    'BKK',
    'KTM',
    'AUH',
    'KWI',
    'LHR',
    'MAA',
    'CAN',
    'JFK',
    'AHB',
    'CMB',
    'DEL',
    'CCU',
    'MLE',
    'IXA',
    'BOM',
];
exports.SERVER_URL = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.21:1812/api/v1'
    : 'https://cloud-trip-server.m360ictapi.com/api/v1';
exports.CLIENT_URL = config_1.default.APP_ENV === 'DEV' ? 'http://10.10.220.28:3000' : 'https://cloudtrips.com';
exports.BTOB_URL = config_1.default.APP_ENV === 'DEV' ? 'http://10.10.220.28:5174' : 'https://b2b.cloudtrips.com';
exports.ADMIN_URL = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:5174'
    : 'https://admin.cloudtrips.com';
//ssl type
exports.CREDIT_LOAD = 'creditLoad';
exports.SSL_PERCENTAGE = 2.5;
// payment gateway percentage
exports.BRAC_PERCENTAGE = 1.5;
exports.BKASH_PERCENTAGE = 1.5;
// SABRE Request Static Data
exports.SABRE_FLIGHT_ITINS = '200ITINS';
//tour package services type
exports.TOUR_PACKAGE_INCLUDE_SERVICE = 'include';
exports.TOUR_PACKAGE_EXCLUDE_SERVICE = 'exclude';
exports.TOUR_PACKAGE_HIGHLIGHT_SERVICE = 'highlight';
// API Name Const
exports.SABRE_API = 'SABRE';
exports.CUSTOM_API = 'CUSTOM';
// airlines commission const
exports.COM_TYPE_PER = 'PER';
exports.COM_TYPE_FLAT = 'FLAT';
exports.COM_MODE_INCREASE = 'INCREASE';
exports.COM_MODE_DECREASE = 'DECREASE';
//commission set const
exports.COM_SET_B2C = 'B2C';
exports.BTOC_PAYMENT_TYPE = 'BtoCPayment';
//error logs level
exports.ERROR_LEVEL_DEBUG = 'DEBUG';
exports.ERROR_LEVEL_INFO = 'INFO';
exports.ERROR_LEVEL_WARNING = 'WARNING';
exports.ERROR_LEVEL_ERROR = 'ERROR';
exports.ERROR_LEVEL_CRITICAL = 'CRITICAL';
//b2c invoice type
exports.INVOICE_TYPE_FLIGHT = 'flight';
exports.INVOICE_TYPE_VISA = 'visa';
exports.INVOICE_TYPE_UMRAH = 'umrah';
exports.INVOICE_TYPE_TOUR = 'tour';
exports.TRAVELER_TYPE_TRAVELERS = 'Travelers';
exports.TRAVELER_TYPE_PASSENGERS = 'Passengers';
exports.LAST_ENTRY_TYPE_REFUND = 'refund_request';
exports.REFUND_STATUS_PENDING = 'Pending';
exports.REFUND_STATUS_PROCESSING = 'Processing';
exports.REFUND_STATUS_APPROVED = 'Approved';
exports.REFUND_STATUS_REJECTED = 'Rejected';
exports.REFUND_STATUS_EXPIRED = 'Expired';
exports.REFUND_STAFF_STATUS_NOT_ASSIGNED = 'Not Assigned';
exports.REFUND_STAFF_STATUS_ASSIGNED = 'Assigned';
exports.LAST_ENTRY_TYPE_REISSUE = 'reissue_request';
exports.REISSUE_STATUS_PENDING = 'Pending';
exports.REISSUE_STATUS_PROCESSING = 'Processing';
exports.REISSUE_STATUS_APPROVED = 'Approved';
exports.REISSUE_STATUS_REJECTED = 'Rejected';
exports.REISSUE_STATUS_EXPIRED = 'Expired';
exports.REISSUE_STAFF_STATUS_NOT_ASSIGNED = 'Not Assigned';
exports.REISSUE_STAFF_STATUS_ASSIGNED = 'Assigned';
//b2b partial payment
exports.PARTIAL_PAYMENT_DEPARTURE_TIME_MINIMUM__DIFF = 10; //10 days before departure date
exports.PARTIAL_PAYMENT_PERCENTAGE = 0.3; //30% of the ticket price
exports.PARTIAL_PAYMENT_DUE_CLEAR_BEFORE = 3; //3 days before departure date
//admin notification ref type
exports.NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING = 'b2b_flight_booking';
exports.NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING = 'b2c_flight_booking';
exports.NOTIFICATION_TYPE_B2B_VISA_APPLICATION = 'b2b_visa_application';
exports.NOTIFICATION_TYPE_B2C_VISA_APPLICATION = 'b2c_visa_application';
exports.NOTIFICATION_TYPE_B2B_TOUR_BOOKING = 'b2b_tour_booking';
exports.NOTIFICATION_TYPE_B2C_TOUR_BOOKING = 'b2c_tour_booking';
exports.NOTIFICATION_TYPE_B2B_BOOKING_SUPPORT = 'b2b_booking_support';
exports.NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT = 'b2c_booking_support';
exports.NOTIFICATION_TYPE_B2C_BANK_TRANSFER = 'b2c_bank_transfer';
exports.NOTIFICATION_TYPE_B2B_DEPOSIT_REQUEST = 'b2b_deposit_request';
//loan type
exports.LOAN_TYPE = {
    loan: 'Loan',
    repayment: 'Repayment',
};
//support ticket
exports.SUPPORT_TICKET_TYPES = {
    flight: 'flight',
    visa: 'visa',
    tour: 'tour',
    umrah: 'umrah',
    hotel: 'hotel',
    other: 'other',
};
//panel source
exports.SOURCE_AGENT = 'AGENT';
exports.SOURCE_SUB_AGENT = 'SUB AGENT';
exports.SOURCE_B2C = 'B2C';
exports.SOURCE_EXTERNAL = 'EXTERNAL';
exports.SOURCE_ADMIN = 'ADMIN';
exports.PANEL_TYPE = {
    B2B: 'b2b',
    b2c: 'b2c',
    admin: 'admin',
};
//booking support status
exports.booking_support_status = {
    pending: 'pending',
    adjusted: 'adjusted',
    closed: 'closed',
    rejected: 'rejected',
    processing: 'processing',
};
// registration request state
exports.REGISTRATION_REQUEST_STATE = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
//flight fare response
exports.FLIGHT_FARE_RESPONSE = "Cancellation:<br/>Refund Amount = Paid Amount - Airline Cancellation Fee<br/>Re-issue:<br/>Re-issue Fee = Airline Fee + Fare Difference<br/>Validity:<br/>Re-issue or refund is subject to the original fare rules and route restrictions.<br/>*The airline's fee is indicative and per person. Fare rules are subject to airline policies and may vary.";
//some common fake names
exports.commonFakeNames = [
    // Classic placeholders
    'john doe',
    'jane doe',
    'john smith',
    'test user',
    'demo user',
    'fake user',
    'guest user',
    'anonymous user',
    'unknown user',
    // Single-word or repetitive names
    'test',
    'user',
    'admin',
    'guest',
    'demo',
    'fake',
    'anonymous',
    'unknown',
    'temp',
    'placeholder',
    'dummy',
    'sample',
    'example',
    'invalid',
    'null',
    'void',
    // Keyboard-mashed or nonsense names
    'asdf',
    'qwerty',
    'zxcv',
    'aaaa bbbb',
    'abc abc',
    'xyz xyz',
    'asdfgh',
    'lkjh',
    'mnbvc',
    'poiu',
    // Tech-related or system-like names
    'root',
    'system',
    'server',
    'localhost',
    'api',
    'prod',
    'staging',
    'backend',
    // Offensive or joke names (often used in fraud attempts)
    'hacker',
    'scammer',
    'fraud',
    'spam',
    'phish',
    'virus',
    'malware',
    'bot',
    'robot',
    'script',
    // Movie/celebrity names (sometimes used fraudulently)
    'james bond',
    'bruce wayne',
    'tony stark',
    'peter parker',
    'harry potter',
    'luke skywalker',
    'elon musk',
    'bill gates',
    'steve jobs',
    'john wick',
];
// Bkash payment pages
exports.BKASH_SUCCESS_PAGE = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:3000/payment-success'
    : 'https://cloudtrips.com/payment-success';
exports.BKASH_CANCEL_PAGE = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:3000/paymentCancel'
    : 'https://cloudtrips.com/paymentCancel';
exports.BKASH_FAILED_PAGE = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:3000/paymentFail'
    : 'https://cloudtrips.com/paymentFail';
exports.AGENT_RECHARGE_PAGE = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.66:5174/payment/top_up'
    : 'https://b2b.cloudtrips.com/payment/top_up';
exports.CALLBACK_URL = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.21:1811/api/v1/payment/b2c/bkash-callback-url'
    : 'https://cloud-trip-server.m360ictapi.com/api/v1/payment/b2c/bkash-callback-url';
exports.B2b_CALLBACK_URL = config_1.default.APP_ENV === 'DEV'
    ? 'http://10.10.220.21:1811/api/v1/payment/b2b/bkash-callback-url'
    : 'https://cloud-trip-server.m360ictapi.com/api/v1/payment/b2b/bkash-callback-url';
exports.BOOKING_STATUS = {
    BOOKED: 'booked',
};
