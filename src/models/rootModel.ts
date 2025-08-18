import { Knex } from 'knex';
import { db } from '../app/database';
import AdministrationModel from './adminModel/administrationModel';
import AdminModel from './adminModel/adminModel';
import { AgencyModel } from './agencyModel/agencyModel';
import B2BFlightBookingModel from './agencyModel/b2bFlightBookingModel';
import B2BFlightTicketModel from './agencyModel/b2bFlightTicketModel';
import ArticleModel from './articleModel/articleModel';
import { B2BAuditTrailModel } from './auditTrailModel/auditTrailModel';

import { BtoBBookingServiceModel } from './bookingServiceModel/BtoBBookingServiceModel';
import { AirlineCommissionModel } from './commonModel/airlinesCommissionModel';
import CommonModel from './commonModel/commonModel';
import BtocFlightBookingModel from './flightModel/btocFlightBookingModel';
import { FlightModel } from './flightModel/flightModel';
import FlightTicketModel from './flightModel/flightTicketModel';
import PromotionModel from './promotionModel/promotionModel';
import PaymentModel from './userModel/paymentModel';
import TravelerModel from './userModel/travelerModel';
import UserModel from './userModel/userModel';
import { VisaModel } from './visaModel/visaModel';
import { BtocBookingRequestModel } from './bookingModel/bookingRequestModel';
import { AdminAuditTrailModel } from './auditTrailModel/adminAuditTrailModel';
import { TourPackageModel } from './tourPackageModel/tourPackageModel';

import { TrackingModel } from "./trackingModel/trackingModel";
import { UmrahPackageModel } from "./umrahPackageModel/umrahPackageModel";
import { BtocUmrahPackageBookingModel } from "./umrahPackageBookingModel/btocUmrahPackageBooking";
import BtobAdministrationModel from "./btobAdministrationModel/btobAdministrationModel";
import BtobAdminModel from "./btobAdministrationModel/btob.adminModel";
import { CorporateTravelModel } from "./tourPackageModel/corporateTravelModel";
import { FlightRoutesConfigModel } from "./commonModel/flightRouteConfigModel";
import { APIAirlineCommissionModel } from "./commonModel/apiAirlinesCommissionModel";
import { ApiSetCommissionModel } from "./commonModel/apiSetCommissionModel";
import { TourPackageBookingModel } from "./tourPackageModel/tourPackageBooking.model";
import SpecialOfferModel from "./specialOffer/specialOffer.model";
import { AnnouncementBarModel } from "./announcementBarModel/announcementBar";
import { ManualBankTransferModel } from "./manualBankTransferModel/manualBankTransferModel";
import ErrorLogsModel from "./errorLogsModel/errorLogsModel";
import { BtoCBookingServiceModel } from "./bookingServiceModel/btocBookingServiceModel";
import { AdminNotificationModel } from "./adminModel/adminNotificationModel";
import B2BPaymentModel from "./agencyModel/b2bPaymentModel";
import { AgencyNotificationModel } from "./agencyModel/agentNotificationModel";
import { B2bRegistrationRequestModel } from "./agencyModel/B2bRegistrationRequestModel";
import { LastServiceEntryModel } from "./commonModel/lastServiceEntryModel";
import { ApiAirlinesBlockModel } from "./commonModel/apiAirlinesBlockModel";
import { B2BRefundRequestModel } from "./refundModel/b2bRefundModel";
import { B2BReissueRequestModel } from "./reissueModel/b2bReissueModel";
import { SearchHistoryModel } from "./searchHistoryModel/searchHistoryModel";
import DealCodeModel from "./dealCodeModel/dealCodeModel";
import CurrencyModel from "./currencyModel/currencyModel";
import { AgencyLoanModel } from "./agencyModel/agencyLoanModel";
import PartialPaymentRuleModel from "./partialPaymentRulesModel/partialPaymentRules.model";
import { ReportModel } from "./reportModel/reportModel";
import DynamicFareModel from './dynamicFareRulesModel/dynamicFareRules.model';
import AirlinesPreferenceModel from './dynamicFareRulesModel/airlinesPreferance.model';

class Models {
  //booking request models
  public btocBookingRequestModel(trx?: Knex.Transaction) {
    return new BtocBookingRequestModel(trx || db);
  }
  // common models
  public commonModel(trx?: Knex.Transaction) {
    return new CommonModel(trx || db);
  }

  // admin model
  public adminModel(trx?: Knex.Transaction) {
    return new AdminModel(trx || db);
  }

  // btob admin model
  public btobAdminModel(trx?: Knex.Transaction) {
    return new BtobAdminModel(trx || db);
  }

  //administration model
  public administrationModel(trx?: Knex.Transaction) {
    return new AdministrationModel(trx || db);
  }

  //administration model
  public btobAdministrationModel(trx?: Knex.Transaction) {
    return new BtobAdministrationModel(trx || db);
  }

  //user model
  public userModel(trx?: Knex.Transaction) {
    return new UserModel(trx || db);
  }
  //traveler model
  public travelerModel(trx?: Knex.Transaction) {
    return new TravelerModel(trx || db);
  }
  //article model
  public articleModel(trx?: Knex.Transaction) {
    return new ArticleModel(trx || db);
  }

  //promotion model
  public promotionModel(trx?: Knex.Transaction) {
    return new PromotionModel(trx || db);
  }
  //airline commission model
  public AirlineCommissionModel(trx?: Knex.Transaction) {
    return new AirlineCommissionModel(trx || db);
  }
  //visa model
  public VisaModel(trx?: Knex.Transaction) {
    return new VisaModel(trx || db);
  }

  //flight model
  public flightModel(trx?: Knex.Transaction) {
    return new FlightModel(trx || db);
  }
  //payment model
  public paymentModel(trx?: Knex.Transaction) {
    return new PaymentModel(trx || db);
  }

  //btoc flight booking model
  public btocFlightBookingModel(trx?: Knex.Transaction) {
    return new BtocFlightBookingModel(trx || db);
  }
  //flight ticket issue model
  public flightTicketIssueModel(trx?: Knex.Transaction) {
    return new FlightTicketModel(trx || db);
  }
  //agency model
  public agencyModel(trx?: Knex.Transaction) {
    return new AgencyModel(trx || db);
  }
  //B2B Flight booking model
  public b2bFlightBookingModel(trx?: Knex.Transaction) {
    return new B2BFlightBookingModel(trx || db);
  }

  //B2B Ticket issue model
  public b2bTicketIssueModel(trx?: Knex.Transaction) {
    return new B2BFlightTicketModel(trx || db);
  }

  //B2B booking support model
  public btobBookingSupportModel(trx?: Knex.Transaction) {
    return new BtoBBookingServiceModel(trx || db);
  }

  //B2C booking support model
  public btocBookingSupportModel(trx?: Knex.Transaction) {
    return new BtoCBookingServiceModel(trx || db);
  }

  //Admin audit model
  public adminAuditTrailModel(trx?: Knex.Transaction) {
    return new AdminAuditTrailModel(trx || db);
  }
  //B2B audit trail model
  public btobAuditTrailModel(trx?: Knex.Transaction) {
    return new B2BAuditTrailModel(trx || db);
  }

  //Tour Package Model
  public tourPackageModel(trx?: Knex.Transaction) {
    return new TourPackageModel(trx || db);
  }

  //Tour Package Booking Model
  public tourPackageBookingModel(trx?: Knex.Transaction) {
    return new TourPackageBookingModel(trx || db);
  }

  //Tracking Model
  public TrackingModel(trx?: Knex.Transaction) {
    return new TrackingModel(trx || db);
  }

  //Umrah Package Model
  public umrahPackageModel(trx?: Knex.Transaction) {
    return new UmrahPackageModel(trx || db);
  }

  //Umrah Package Booking Model
  public umrahPackageBookinModel(trx?: Knex.Transaction) {
    return new BtocUmrahPackageBookingModel(trx || db);
  }

  //corporate travel
  public corporateTravelModel(trx?: Knex.Transaction) {
    return new CorporateTravelModel(trx || db);
  }

  //API Airlines commission model
  public apiAirlinesCommissionModel(trx?: Knex.Transaction) {
    return new APIAirlineCommissionModel(trx || db);
  }

  //Flight Routes config model
  public flightRouteConfigModel(trx?: Knex.Transaction) {
    return new FlightRoutesConfigModel(trx || db);
  }

  // Commission set model
  public commissionSetModel(trx?: Knex.Transaction) {
    return new ApiSetCommissionModel(trx || db);
  }

  // speacial offer
  public specialOfferModel(trx?: Knex.Transaction) {
    return new SpecialOfferModel(trx || db);
  }

  //announcement model
  public announcementModel(trx?: Knex.Transaction) {
    return new AnnouncementBarModel(trx || db);
  }

  //manual bank transfer model
  public manualBankTransferModel(trx?: Knex.Transaction) {
    return new ManualBankTransferModel(trx || db);
  }

  //Error logs model
  public errorLogsModel(trx?: Knex.Transaction) {
    return new ErrorLogsModel(trx || db);
  }

  //Admin notification model
  public adminNotificationModel(trx?: Knex.Transaction) {
    return new AdminNotificationModel(trx || db);
  }

  //Agency notification model
  public agencyNotificationModel(trx?: Knex.Transaction) {
    return new AgencyNotificationModel(trx || db);
  }

  //B2B Payment model
  public btobPaymentModel(trx?: Knex.Transaction) {
    return new B2BPaymentModel(trx || db);
  }

  // B2b registration request model
  public b2bRegistrationRequestModel(trx?: Knex.Transaction) {
    return new B2bRegistrationRequestModel(trx || db);
  }

  // last service entry model
  public lastServiceEntryModel(trx?: Knex.Transaction) {
    return new LastServiceEntryModel(trx || db);
  }

  // api airlines block model
  public apiAirlinesBlockModel(trx?: Knex.Transaction) {
    return new ApiAirlinesBlockModel(trx || db);
  }

  //refund request model
  public B2BRefundRequestModel(trx?: Knex.Transaction) {
    return new B2BRefundRequestModel(trx || db);
  }

  //reissue request model
  public B2BReissueRequestModel(trx?: Knex.Transaction) {
    return new B2BReissueRequestModel(trx || db);
  }

  //Search History model
  public SearchHistoryModel(trx?: Knex.Transaction) {
    return new SearchHistoryModel(trx || db);
  }

  //Deal code model
  public DealCodeModel(trx?: Knex.Transaction) {
    return new DealCodeModel(trx || db);
  }

  //Currency Converter model
  public CurrencyModel(trx?: Knex.Transaction) {
    return new CurrencyModel(trx || db);
  }

  //Loan model
  public AgencyLoanModel(trx?: Knex.Transaction) {
    return new AgencyLoanModel(trx || db);
  }

  //partial payment rules model
  public PartialPaymentRuleModel(trx?: Knex.Transaction) {
    return new PartialPaymentRuleModel(trx || db);
  }

  //report Model
  public ReportModel(trx?: Knex.Transaction) {
    return new ReportModel(trx || db);

  }
  //dynamic fare rules
  public DynamicFareModel(trx?: Knex.Transaction) {
    return new DynamicFareModel(trx || db);
  }

  //Airlines preference
  public AirlinesPreferenceModel(trx?: Knex.Transaction) {
    return new AirlinesPreferenceModel(trx || db);
  }
}
export default Models;
