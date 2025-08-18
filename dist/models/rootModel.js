"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../app/database");
const administrationModel_1 = __importDefault(require("./adminModel/administrationModel"));
const adminModel_1 = __importDefault(require("./adminModel/adminModel"));
const agencyModel_1 = require("./agencyModel/agencyModel");
const b2bFlightBookingModel_1 = __importDefault(require("./agencyModel/b2bFlightBookingModel"));
const b2bFlightTicketModel_1 = __importDefault(require("./agencyModel/b2bFlightTicketModel"));
const articleModel_1 = __importDefault(require("./articleModel/articleModel"));
const auditTrailModel_1 = require("./auditTrailModel/auditTrailModel");
const BtoBBookingServiceModel_1 = require("./bookingServiceModel/BtoBBookingServiceModel");
const airlinesCommissionModel_1 = require("./commonModel/airlinesCommissionModel");
const commonModel_1 = __importDefault(require("./commonModel/commonModel"));
const btocFlightBookingModel_1 = __importDefault(require("./flightModel/btocFlightBookingModel"));
const flightModel_1 = require("./flightModel/flightModel");
const flightTicketModel_1 = __importDefault(require("./flightModel/flightTicketModel"));
const promotionModel_1 = __importDefault(require("./promotionModel/promotionModel"));
const paymentModel_1 = __importDefault(require("./userModel/paymentModel"));
const travelerModel_1 = __importDefault(require("./userModel/travelerModel"));
const userModel_1 = __importDefault(require("./userModel/userModel"));
const visaModel_1 = require("./visaModel/visaModel");
const bookingRequestModel_1 = require("./bookingModel/bookingRequestModel");
const adminAuditTrailModel_1 = require("./auditTrailModel/adminAuditTrailModel");
const tourPackageModel_1 = require("./tourPackageModel/tourPackageModel");
const trackingModel_1 = require("./trackingModel/trackingModel");
const umrahPackageModel_1 = require("./umrahPackageModel/umrahPackageModel");
const btocUmrahPackageBooking_1 = require("./umrahPackageBookingModel/btocUmrahPackageBooking");
const btobAdministrationModel_1 = __importDefault(require("./btobAdministrationModel/btobAdministrationModel"));
const btob_adminModel_1 = __importDefault(require("./btobAdministrationModel/btob.adminModel"));
const corporateTravelModel_1 = require("./tourPackageModel/corporateTravelModel");
const flightRouteConfigModel_1 = require("./commonModel/flightRouteConfigModel");
const apiAirlinesCommissionModel_1 = require("./commonModel/apiAirlinesCommissionModel");
const apiSetCommissionModel_1 = require("./commonModel/apiSetCommissionModel");
const tourPackageBooking_model_1 = require("./tourPackageModel/tourPackageBooking.model");
const specialOffer_model_1 = __importDefault(require("./specialOffer/specialOffer.model"));
const announcementBar_1 = require("./announcementBarModel/announcementBar");
const manualBankTransferModel_1 = require("./manualBankTransferModel/manualBankTransferModel");
const errorLogsModel_1 = __importDefault(require("./errorLogsModel/errorLogsModel"));
const btocBookingServiceModel_1 = require("./bookingServiceModel/btocBookingServiceModel");
const adminNotificationModel_1 = require("./adminModel/adminNotificationModel");
const b2bPaymentModel_1 = __importDefault(require("./agencyModel/b2bPaymentModel"));
const agentNotificationModel_1 = require("./agencyModel/agentNotificationModel");
const B2bRegistrationRequestModel_1 = require("./agencyModel/B2bRegistrationRequestModel");
const lastServiceEntryModel_1 = require("./commonModel/lastServiceEntryModel");
const apiAirlinesBlockModel_1 = require("./commonModel/apiAirlinesBlockModel");
const b2bRefundModel_1 = require("./refundModel/b2bRefundModel");
const b2bReissueModel_1 = require("./reissueModel/b2bReissueModel");
const searchHistoryModel_1 = require("./searchHistoryModel/searchHistoryModel");
const dealCodeModel_1 = __importDefault(require("./dealCodeModel/dealCodeModel"));
const currencyModel_1 = __importDefault(require("./currencyModel/currencyModel"));
const agencyLoanModel_1 = require("./agencyModel/agencyLoanModel");
const partialPaymentRules_model_1 = __importDefault(require("./partialPaymentRulesModel/partialPaymentRules.model"));
const reportModel_1 = require("./reportModel/reportModel");
const dynamicFareRules_model_1 = __importDefault(require("./dynamicFareRulesModel/dynamicFareRules.model"));
const airlinesPreferance_model_1 = __importDefault(require("./dynamicFareRulesModel/airlinesPreferance.model"));
class Models {
    //booking request models
    btocBookingRequestModel(trx) {
        return new bookingRequestModel_1.BtocBookingRequestModel(trx || database_1.db);
    }
    // common models
    commonModel(trx) {
        return new commonModel_1.default(trx || database_1.db);
    }
    // admin model
    adminModel(trx) {
        return new adminModel_1.default(trx || database_1.db);
    }
    // btob admin model
    btobAdminModel(trx) {
        return new btob_adminModel_1.default(trx || database_1.db);
    }
    //administration model
    administrationModel(trx) {
        return new administrationModel_1.default(trx || database_1.db);
    }
    //administration model
    btobAdministrationModel(trx) {
        return new btobAdministrationModel_1.default(trx || database_1.db);
    }
    //user model
    userModel(trx) {
        return new userModel_1.default(trx || database_1.db);
    }
    //traveler model
    travelerModel(trx) {
        return new travelerModel_1.default(trx || database_1.db);
    }
    //article model
    articleModel(trx) {
        return new articleModel_1.default(trx || database_1.db);
    }
    //promotion model
    promotionModel(trx) {
        return new promotionModel_1.default(trx || database_1.db);
    }
    //airline commission model
    AirlineCommissionModel(trx) {
        return new airlinesCommissionModel_1.AirlineCommissionModel(trx || database_1.db);
    }
    //visa model
    VisaModel(trx) {
        return new visaModel_1.VisaModel(trx || database_1.db);
    }
    //flight model
    flightModel(trx) {
        return new flightModel_1.FlightModel(trx || database_1.db);
    }
    //payment model
    paymentModel(trx) {
        return new paymentModel_1.default(trx || database_1.db);
    }
    //btoc flight booking model
    btocFlightBookingModel(trx) {
        return new btocFlightBookingModel_1.default(trx || database_1.db);
    }
    //flight ticket issue model
    flightTicketIssueModel(trx) {
        return new flightTicketModel_1.default(trx || database_1.db);
    }
    //agency model
    agencyModel(trx) {
        return new agencyModel_1.AgencyModel(trx || database_1.db);
    }
    //B2B Flight booking model
    b2bFlightBookingModel(trx) {
        return new b2bFlightBookingModel_1.default(trx || database_1.db);
    }
    //B2B Ticket issue model
    b2bTicketIssueModel(trx) {
        return new b2bFlightTicketModel_1.default(trx || database_1.db);
    }
    //B2B booking support model
    btobBookingSupportModel(trx) {
        return new BtoBBookingServiceModel_1.BtoBBookingServiceModel(trx || database_1.db);
    }
    //B2C booking support model
    btocBookingSupportModel(trx) {
        return new btocBookingServiceModel_1.BtoCBookingServiceModel(trx || database_1.db);
    }
    //Admin audit model
    adminAuditTrailModel(trx) {
        return new adminAuditTrailModel_1.AdminAuditTrailModel(trx || database_1.db);
    }
    //B2B audit trail model
    btobAuditTrailModel(trx) {
        return new auditTrailModel_1.B2BAuditTrailModel(trx || database_1.db);
    }
    //Tour Package Model
    tourPackageModel(trx) {
        return new tourPackageModel_1.TourPackageModel(trx || database_1.db);
    }
    //Tour Package Booking Model
    tourPackageBookingModel(trx) {
        return new tourPackageBooking_model_1.TourPackageBookingModel(trx || database_1.db);
    }
    //Tracking Model
    TrackingModel(trx) {
        return new trackingModel_1.TrackingModel(trx || database_1.db);
    }
    //Umrah Package Model
    umrahPackageModel(trx) {
        return new umrahPackageModel_1.UmrahPackageModel(trx || database_1.db);
    }
    //Umrah Package Booking Model
    umrahPackageBookinModel(trx) {
        return new btocUmrahPackageBooking_1.BtocUmrahPackageBookingModel(trx || database_1.db);
    }
    //corporate travel
    corporateTravelModel(trx) {
        return new corporateTravelModel_1.CorporateTravelModel(trx || database_1.db);
    }
    //API Airlines commission model
    apiAirlinesCommissionModel(trx) {
        return new apiAirlinesCommissionModel_1.APIAirlineCommissionModel(trx || database_1.db);
    }
    //Flight Routes config model
    flightRouteConfigModel(trx) {
        return new flightRouteConfigModel_1.FlightRoutesConfigModel(trx || database_1.db);
    }
    // Commission set model
    commissionSetModel(trx) {
        return new apiSetCommissionModel_1.ApiSetCommissionModel(trx || database_1.db);
    }
    // speacial offer
    specialOfferModel(trx) {
        return new specialOffer_model_1.default(trx || database_1.db);
    }
    //announcement model
    announcementModel(trx) {
        return new announcementBar_1.AnnouncementBarModel(trx || database_1.db);
    }
    //manual bank transfer model
    manualBankTransferModel(trx) {
        return new manualBankTransferModel_1.ManualBankTransferModel(trx || database_1.db);
    }
    //Error logs model
    errorLogsModel(trx) {
        return new errorLogsModel_1.default(trx || database_1.db);
    }
    //Admin notification model
    adminNotificationModel(trx) {
        return new adminNotificationModel_1.AdminNotificationModel(trx || database_1.db);
    }
    //Agency notification model
    agencyNotificationModel(trx) {
        return new agentNotificationModel_1.AgencyNotificationModel(trx || database_1.db);
    }
    //B2B Payment model
    btobPaymentModel(trx) {
        return new b2bPaymentModel_1.default(trx || database_1.db);
    }
    // B2b registration request model
    b2bRegistrationRequestModel(trx) {
        return new B2bRegistrationRequestModel_1.B2bRegistrationRequestModel(trx || database_1.db);
    }
    // last service entry model
    lastServiceEntryModel(trx) {
        return new lastServiceEntryModel_1.LastServiceEntryModel(trx || database_1.db);
    }
    // api airlines block model
    apiAirlinesBlockModel(trx) {
        return new apiAirlinesBlockModel_1.ApiAirlinesBlockModel(trx || database_1.db);
    }
    //refund request model
    B2BRefundRequestModel(trx) {
        return new b2bRefundModel_1.B2BRefundRequestModel(trx || database_1.db);
    }
    //reissue request model
    B2BReissueRequestModel(trx) {
        return new b2bReissueModel_1.B2BReissueRequestModel(trx || database_1.db);
    }
    //Search History model
    SearchHistoryModel(trx) {
        return new searchHistoryModel_1.SearchHistoryModel(trx || database_1.db);
    }
    //Deal code model
    DealCodeModel(trx) {
        return new dealCodeModel_1.default(trx || database_1.db);
    }
    //Currency Converter model
    CurrencyModel(trx) {
        return new currencyModel_1.default(trx || database_1.db);
    }
    //Loan model
    AgencyLoanModel(trx) {
        return new agencyLoanModel_1.AgencyLoanModel(trx || database_1.db);
    }
    //partial payment rules model
    PartialPaymentRuleModel(trx) {
        return new partialPaymentRules_model_1.default(trx || database_1.db);
    }
    //report Model
    ReportModel(trx) {
        return new reportModel_1.ReportModel(trx || database_1.db);
    }
    //dynamic fare rules
    DynamicFareModel(trx) {
        return new dynamicFareRules_model_1.default(trx || database_1.db);
    }
    //Airlines preference
    AirlinesPreferenceModel(trx) {
        return new airlinesPreferance_model_1.default(trx || database_1.db);
    }
}
exports.default = Models;
