import config from '../../config/config';

export const origin: string[] = [
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
  "https://main.d3qc4072a435i6.amplifyapp.com",//b2c
  "https://www.main.d3qc4072a435i6.amplifyapp.com",
  "https://main.d75ettt1vxqyw.amplifyapp.com",//b2b
  "https://www.main.d75ettt1vxqyw.amplifyapp.com",
  "https://main.d3etdp965ayxk3.amplifyapp.com",//admin
  "https://www.main.d3etdp965ayxk3.amplifyapp.com",
  "https://cloudtrips.com",
  "https://www.cloudtrips.com",
  "https://b2b.cloudtrips.com",
  "https://www.b2b.cloudtrips.com",
  "https://admin.cloudtrips.com",
  "https://www.admin.cloudtrips.com"
];

// OTP types constants
export const OTP_TYPE_FORGET_USER = 'reset_user';
export const OTP_TYPE_VERIFY_USER = 'verify_user';
export const OTP_TYPE_FORGET_ADMIN = 'reset_admin';
export const OTP_TYPE_FORGET_AGENT = 'reset_agent';
export const OTP_TYPE_AGENT_2FA = 'agent_2FA';
export const OTP_TYPE_ADMIN_2FA = 'admin_2FA';
export const OTP_TYPE_AGENT_REGISTRATION = 'verify_agent';
export const OTP_TYPE_VERIFY_ADMIN = 'verify_admin';
export const OTP_TYPE_ADMIN_TRANSACTION = 'admin_transaction';
export const OTP_TYPE_TRANSACTION_VERIFY = 'transaction_verify';

//Project Info
export const PROJECT_CODE = 'CLDT';
export const PROJECT_NAME = 'online travel agency';
export const PROJECT_LOGO =
  'https://m360-trabill.s3.ap-south-1.amazonaws.com/cloud-trips-storage/logo-files/1754302997831-99708835.jpeg';
//send API related mail
export const PROJECT_EMAIL_API_1 =
  config.APP_ENV === 'DEV' ? 'mahin.m360ict@gmail.com' : 'support@cloudtrips.com';

//send mails which are not related to API and Accounts
export const PROJECT_EMAIL_OTHERS_1 =
  config.APP_ENV === 'DEV' ? 'shakeeb.m360ict@gmail.com' : 'support@cloudtrips.com';

//send mails related to accounts
export const PROJECT_EMAIL_ACCOUNT_1 =
  config.APP_ENV === 'DEV' ? 'jasim.m360ict@gmail.com' : 'support@cloudtrips.com';

// Static mail address to show in the email template
export const PROJECT_EMAIL_STATIC = 'support@cloudtrips.com';
//static phone number to show in the email template
export const PROJECT_NUMBER = '8809610102010 ';
export const PROJECT_IMAGE_URL =
  'https://m360-trabill.s3.ap-south-1.amazonaws.com/cloud-trips-storage';
export const PROJECT_ADDRESS =
  'SW(G) 8, Gulshan Avenue, Gulshan-1';

// Sabre token env ID
export const SABRE_TOKEN_ENV = 'sabre_token';

// Email subject
export const OTP_EMAIL_SUBJECT = 'Your One Time Password For Verification';

// OTP for
export const OTP_FOR = 'verification';

// Default data get limit
export const DATA_LIMIT = 100;

// Flight commission
export const FLIGHT_COMMISSION = 'flight_commission';

// BD Airport
export const BD_AIRPORT = ['DAC', 'CGP', 'ZYL', 'CXB', 'JSR', 'BZL', 'RJH', 'SPD', 'IRD'];

export const priorityAirports = [
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

export const SERVER_URL =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.21:1812/api/v1'
    : 'https://cloud-trip-server.m360ictapi.com/api/v1';

export const CLIENT_URL =
  config.APP_ENV === 'DEV' ? 'http://10.10.220.28:3000' : 'https://cloudtrips.com';

export const BTOB_URL =
  config.APP_ENV === 'DEV' ? 'http://10.10.220.28:5174' : 'https://b2b.cloudtrips.com';

export const ADMIN_URL =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:5174'
    : 'https://admin.cloudtrips.com';

//ssl type
export const CREDIT_LOAD = 'creditLoad';
export const SSL_PERCENTAGE = 2.5;

// payment gateway percentage
export const BRAC_PERCENTAGE = 1.5;
export const BKASH_PERCENTAGE = 1.5;

// SABRE Request Static Data
export const SABRE_FLIGHT_ITINS = '200ITINS';

//tour package services type
export const TOUR_PACKAGE_INCLUDE_SERVICE = 'include';
export const TOUR_PACKAGE_EXCLUDE_SERVICE = 'exclude';
export const TOUR_PACKAGE_HIGHLIGHT_SERVICE = 'highlight';

// API Name Const
export const SABRE_API = 'SABRE';
export const CUSTOM_API = 'CUSTOM';

// airlines commission const
export const COM_TYPE_PER = 'PER';
export const COM_TYPE_FLAT = 'FLAT';
export const COM_MODE_INCREASE = 'INCREASE';
export const COM_MODE_DECREASE = 'DECREASE';

//commission set const
export const COM_SET_B2C = 'B2C';

export const BTOC_PAYMENT_TYPE = 'BtoCPayment';

//error logs level
export const ERROR_LEVEL_DEBUG = 'DEBUG';
export const ERROR_LEVEL_INFO = 'INFO';
export const ERROR_LEVEL_WARNING = 'WARNING';
export const ERROR_LEVEL_ERROR = 'ERROR';
export const ERROR_LEVEL_CRITICAL = 'CRITICAL';

//b2c invoice type
export const INVOICE_TYPE_FLIGHT = 'flight';
export const INVOICE_TYPE_VISA = 'visa';
export const INVOICE_TYPE_UMRAH = 'umrah';
export const INVOICE_TYPE_TOUR = 'tour';
export const TRAVELER_TYPE_TRAVELERS = 'Travelers';
export const TRAVELER_TYPE_PASSENGERS = 'Passengers';

export const LAST_ENTRY_TYPE_REFUND = 'refund_request';
export const REFUND_STATUS_PENDING = 'Pending';
export const REFUND_STATUS_PROCESSING = 'Processing';
export const REFUND_STATUS_APPROVED = 'Approved';
export const REFUND_STATUS_REJECTED = 'Rejected';
export const REFUND_STATUS_EXPIRED = 'Expired';
export const REFUND_STAFF_STATUS_NOT_ASSIGNED = 'Not Assigned';
export const REFUND_STAFF_STATUS_ASSIGNED = 'Assigned';

export const LAST_ENTRY_TYPE_REISSUE = 'reissue_request';
export const REISSUE_STATUS_PENDING = 'Pending';
export const REISSUE_STATUS_PROCESSING = 'Processing';
export const REISSUE_STATUS_APPROVED = 'Approved';
export const REISSUE_STATUS_REJECTED = 'Rejected';
export const REISSUE_STATUS_EXPIRED = 'Expired';
export const REISSUE_STAFF_STATUS_NOT_ASSIGNED = 'Not Assigned';
export const REISSUE_STAFF_STATUS_ASSIGNED = 'Assigned';

//b2b partial payment
export const PARTIAL_PAYMENT_DEPARTURE_TIME_MINIMUM__DIFF = 10; //10 days before departure date
export const PARTIAL_PAYMENT_PERCENTAGE = 0.3; //30% of the ticket price
export const PARTIAL_PAYMENT_DUE_CLEAR_BEFORE = 3; //3 days before departure date

//admin notification ref type
export const NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING = 'b2b_flight_booking';
export const NOTIFICATION_TYPE_B2C_FLIGHT_BOOKING = 'b2c_flight_booking';
export const NOTIFICATION_TYPE_B2B_VISA_APPLICATION = 'b2b_visa_application';
export const NOTIFICATION_TYPE_B2C_VISA_APPLICATION = 'b2c_visa_application';
export const NOTIFICATION_TYPE_B2B_TOUR_BOOKING = 'b2b_tour_booking';
export const NOTIFICATION_TYPE_B2C_TOUR_BOOKING = 'b2c_tour_booking';
export const NOTIFICATION_TYPE_B2B_BOOKING_SUPPORT = 'b2b_booking_support';
export const NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT = 'b2c_booking_support';
export const NOTIFICATION_TYPE_B2C_BANK_TRANSFER = 'b2c_bank_transfer';
export const NOTIFICATION_TYPE_B2B_DEPOSIT_REQUEST = 'b2b_deposit_request';

//loan type
export const LOAN_TYPE = {
  loan: 'Loan',
  repayment: 'Repayment',
} as const;

//support ticket
export const SUPPORT_TICKET_TYPES = {
  flight: 'flight',
  visa: 'visa',
  tour: 'tour',
  umrah: 'umrah',
  hotel: 'hotel',
  other: 'other',
};

//panel source
export const SOURCE_AGENT = 'AGENT' as const;
export const SOURCE_SUB_AGENT = 'SUB AGENT' as const;
export const SOURCE_B2C = 'B2C' as const;
export const SOURCE_EXTERNAL = 'EXTERNAL' as const;
export const SOURCE_ADMIN = 'ADMIN' as const;

export const PANEL_TYPE = {
  B2B: 'b2b',
  b2c: 'b2c',
  admin: 'admin',
};

//booking support status
export const booking_support_status = {
  pending: 'pending',
  adjusted: 'adjusted',
  closed: 'closed',
  rejected: 'rejected',
  processing: 'processing',
};

// registration request state
export const REGISTRATION_REQUEST_STATE = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

//flight fare response
export const FLIGHT_FARE_RESPONSE =
  "Cancellation:<br/>Refund Amount = Paid Amount - Airline Cancellation Fee<br/>Re-issue:<br/>Re-issue Fee = Airline Fee + Fare Difference<br/>Validity:<br/>Re-issue or refund is subject to the original fare rules and route restrictions.<br/>*The airline's fee is indicative and per person. Fare rules are subject to airline policies and may vary.";

//some common fake names
export const commonFakeNames = [
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
export const BKASH_SUCCESS_PAGE =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:3000/payment-success'
    : 'https://cloudtrips.com/payment-success';
export const BKASH_CANCEL_PAGE =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:3000/paymentCancel'
    : 'https://cloudtrips.com/paymentCancel';
export const BKASH_FAILED_PAGE =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.28:3000/paymentFail'
    : 'https://cloudtrips.com/paymentFail';
export const AGENT_RECHARGE_PAGE =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.66:5174/payment/top_up'
    : 'https://b2b.cloudtrips.com/payment/top_up';

export const CALLBACK_URL =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.21:1811/api/v1/payment/b2c/bkash-callback-url'
    : 'https://cloud-trip-server.m360ictapi.com/api/v1/payment/b2c/bkash-callback-url';

export const B2b_CALLBACK_URL =
  config.APP_ENV === 'DEV'
    ? 'http://10.10.220.21:1811/api/v1/payment/b2b/bkash-callback-url'
    : 'https://cloud-trip-server.m360ictapi.com/api/v1/payment/b2b/bkash-callback-url';

export const BOOKING_STATUS = {
  BOOKED: 'booked',
};
