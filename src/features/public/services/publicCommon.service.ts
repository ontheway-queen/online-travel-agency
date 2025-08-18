import { Request } from 'express';
import qs from 'qs';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import Lib from '../../../utils/lib/lib';
import {
  BD_AIRPORT,
  COM_MODE_INCREASE,
  COM_TYPE_PER,
  ERROR_LEVEL_CRITICAL,
  NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
  PROJECT_EMAIL_API_1,

  PROJECT_IMAGE_URL,
  PROJECT_NAME,
  SABRE_API,
  SABRE_TOKEN_ENV
} from '../../../utils/miscellaneous/constants';
// import { GET_TOKEN_ENDPOINT } from "../../../utils/miscellaneous/sabreApiEndpoints";
import axios from 'axios';
import { Knex } from 'knex';
import { IArticleFilterQuery } from '../../../utils/interfaces/article/articleInterface';
import { TRAVELPORT_REST_API, TRAVELPORT_REST_TOKEN_ENV, VERTEIL_API, VERTEIL_TOKEN_ENV } from '../../../utils/miscellaneous/flightMiscellaneous/flightConstants';
import SabreAPIEndpoints from '../../../utils/miscellaneous/flightMiscellaneous/sabreApiEndpoints';
import VerteilAPIEndpoints from '../../../utils/miscellaneous/flightMiscellaneous/verteilApiEndpoints';
import { partialPaymentDueEmailTemplate } from '../../../utils/templates/partialPaymentDueEmailTemplate';
import { AdminNotificationSubService } from '../../admin/services/subServices/adminNotificationSubService';
import { IAirlineFilterQuery, IAirportFilterQuery, IVisaFilterQuery } from '../../public/utils/types/commonTypes';
// const soap = require('soap');

class PublicCommonService extends AbstractServices {
  private trx?: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  // Get Sebre token
  public async getSabreToken() {
    try {
      return await this.db.transaction(async (trx) => {
        const data = qs.stringify({
          grant_type: 'password',
          username: config.SABRE_USERNAME,
          password: config.SABRE_PASSWORD,
        });

        const axiosConfig = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${config.SABRE_URL}/${SabreAPIEndpoints.GET_TOKEN_ENDPOINT}`,
          headers: {
            Authorization: `Basic ${config.SABRE_AUTH_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: data,
        };
        const response = await axios.request({
          ...axiosConfig,
          validateStatus: () => true,
        });
        if (response.status !== 200) {
          await this.Model.errorLogsModel(trx).insert({
            level: ERROR_LEVEL_CRITICAL,
            message: `Error from Sabre authentication`,
            url: axiosConfig.url,
            http_method: 'POST',
            metadata: {
              api: SABRE_API,
              endpoint: axiosConfig.url,
              payload: {
                grant_type: 'password',
                username: config.SABRE_USERNAME,
                password: config.SABRE_PASSWORD,
              },
              response: response.data,
            }
          });
        } else {
          const authModel = this.Model.commonModel(trx);
          await authModel.updateEnv(SABRE_TOKEN_ENV, response.data.access_token);
        }
      });
    } catch (err) {
      console.error("Transaction error:", err);
    }
  }

  //get verteil token
  public async getVerteilToken() {
    try {
      return await this.db.transaction(async (trx) => {
        const axiosConfig = {
          method: 'post',
          url: `${config.VERTEIL_URL}${VerteilAPIEndpoints.GET_TOKEN_ENDPOINT}`,
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${config.VERTEIL_USERNAME}:${config.VERTEIL_PASSWORD}`
            ).toString("base64")}`,
          },
          maxBodyLength: Infinity,
          validateStatus: () => true,
        };

        const response = await axios.request(axiosConfig);

        console.log({ response });
        if (response.status !== 200) {
          await this.Model.errorLogsModel(trx).insert({
            level: ERROR_LEVEL_CRITICAL,
            message: `Error from Verteil authentication`,
            url: axiosConfig.url,
            http_method: 'POST',
            metadata: {
              api: VERTEIL_API,
              endpoint: axiosConfig.url,
              payload: {
                username: config.VERTEIL_USERNAME,
                password: config.VERTEIL_PASSWORD,
              },
              response: response.data,
            }
          });
        } else {
          const authModel = this.Model.commonModel(trx);
          await authModel.updateEnv(VERTEIL_TOKEN_ENV, response.data.access_token);
        }
      });
    } catch (err) {
      console.error("Verteil Token Error:", err);
    }
  }

  // Get travelport rest api token
  public async getTravelportRestToken() {
    try {
      return await this.db.transaction(async (trx) => {
        let data = qs.stringify({
          grant_type: "password",
          username: config.TRAVELPORT_REST_USERNAME,
          password: config.TRAVELPORT_REST_PASSWORD,
          client_id: config.TRAVELPORT_REST_CLIENT_ID,
          client_secret: config.TRAVELPORT_REST_CLIENT_SECRET,
          scope: "openid",
        });

        let axiosConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${config.TRAVELPORT_REST_TOKEN_URL}`,
          data: data,
          validateStatus: () => true,
        };

        const response = await axios.request(axiosConfig);
        if (response.status !== 200) {
          await this.Model.errorLogsModel(trx).insert({
            level: ERROR_LEVEL_CRITICAL,
            message: `Error from Travelport Rest API authentication`,
            url: axiosConfig.url,
            http_method: 'POST',
            metadata: {
              api: TRAVELPORT_REST_API,
              endpoint: axiosConfig.url,
              payload: {
                grant_type: "password",
                username: config.TRAVELPORT_REST_USERNAME,
                password: config.TRAVELPORT_REST_PASSWORD,
                client_id: config.TRAVELPORT_REST_CLIENT_ID,
                client_secret: config.TRAVELPORT_REST_CLIENT_SECRET,
                scope: "openid",
              },
              response: response.data,
            }
          });
        } else {
          const authModel = this.Model.commonModel(trx);
          await authModel.updateEnv(TRAVELPORT_REST_TOKEN_ENV, response.data.access_token);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  //get all country
  public async getAllCountry(req: Request) {
    const { name } = req.query as { name?: string };
    const model = this.Model.commonModel();
    const country_list = await model.getAllCountry({ name });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: country_list,
    };
  }

  //get all city
  public async getAllCity(req: Request) {
    const { city_id } = req.query;
    const country_id = req.query.country_id as unknown as number;
    const limit = req.query.limit as unknown as number;
    const skip = req.query.skip as unknown as number;
    const name = req.query.name as string;
    const model = this.Model.commonModel();
    const city_list = await model.getAllCity({
      country_id,
      limit,
      skip,
      name,
      city_id: city_id ? parseInt(city_id as string) : 0,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: city_list,
    };
  }

  //get all airport
  public async getAllAirport(req: Request) {
    const { country_id, name, limit, skip } = req.query as IAirportFilterQuery;
    const model = this.Model.commonModel();
    const get_airport = await model.getAllAirport(
      { country_id, name, limit, skip },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: get_airport.total,
      data: get_airport.data,
    };
  }

  //get all airlines
  public async getAllAirlines(req: Request) {
    const { code, name, limit, skip } = req.query as IAirlineFilterQuery;
    const model = this.Model.commonModel();
    const get_airlines = await model.getAllAirline(
      { code, name, limit, skip },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: get_airlines.total,
      data: get_airlines.data,
    };
  }

  //get all visa list
  public async getAllVisaCountryList(req: Request) {
    let { limit, skip } = req.query as IVisaFilterQuery;
    const model = this.Model.VisaModel();
    const data = await model.getAllVisaCountryList({
      status: true,
      limit,
      skip,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get all visa list
  public async getAllVisaList(req: Request) {
    let { country_id, limit, skip, visa_type } = req.query as IVisaFilterQuery;
    const model = this.Model.VisaModel();
    const data = await model.get(
      { country_id, status: true, limit, skip, visa_type },
      true
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get all visa Type
  public async getAllVisaType(req: Request) {
    const model = this.Model.VisaModel();
    const data = await model.getAllVisaType();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data,
    };
  }
  //get single visa
  public async getSingleVisa(req: Request) {
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const data = await model.single(Number(id), true);
    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    } else {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: data[0],
      };
    }
  }

  //get article list
  public async getArticleList(req: Request) {
    const { title, status, limit, skip, deleted } =
      req.query as IArticleFilterQuery;

    const data = await this.Model.articleModel().getArticleList({
      title,
      status,
      limit,
      skip,
      deleted,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single article
  public async getSingleArticle(req: Request) {
    const article_slug = req.params.slug;

    const data = await this.Model.articleModel().getSingleArticle({
      slug: article_slug,
    });

    if (!data.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data[0],
    };
  }

  //get all offer
  public async getAllOffer(req: Request) {
    const { limit, skip, status, name } = req.query;
    const data = await this.Model.promotionModel().getOfferList({
      limit: Number(limit),
      skip: Number(skip),
      status: '1',
      name: name as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single offer
  public async getSingleOffer(req: Request) {
    const data = await this.Model.promotionModel().getSingleOffer({
      slug: req.params.slug,
    });

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }

  // Get Active Only Banner Images
  public async getActiveOnlyBannerImage(req: Request) {
    const getActiveImages =
      await this.Model.adminModel().getActiveBannerImage();
    if (!getActiveImages)
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: getActiveImages,
    };
  }



  // get all b2c data for corporate travel page
  public async getB2CDataForCorporatePackagePage() {
    const model = this.Model.corporateTravelModel();
    const tourPackage = await model.getDataForCorporatePackagePage();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: tourPackage,
    };
  }

  // get umrah page details
  public async getDetailDescription() {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.umrahPackageModel(trx);

      const data = await model.getDetailDescription();

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: data[0],
      };
    });
  }

  //get all announcement list
  public async getAllAnnouncementList(req: Request) {
    const { type } = req.query as unknown as {
      type: 'B2B' | 'B2C'
    }
    const data = await this.Model.announcementModel().getAllAnnouncementBar({
      isActive: true,
      currentDate: new Date(),
      type: type || 'B2C',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data || [],
    };
  }


  //update admin
  public async updateAdmin(payload: { socket_id: string }, user_id: number) {
    try {
      await this.db('user_admin')
        .withSchema(this.schema.ADMIN_SCHEMA)
        .update(payload)
        .where({ id: user_id });
    } catch (err) {
      console.log(err);
    }
  }

  //update btob user
  public async updateB2B(payload: { socket_id: string }, user_id: number) {
    try {
      await this.db('btob_user')
        .withSchema(this.schema.AGENT_SCHEMA)
        .update(payload)
        .where({ id: user_id });
    } catch (err) {
      console.log(err);
    }
  }

  //send email for the due of partial payments
  public async sendEmailForPartialPaymentDue() {
    return await this.db.transaction(async (trx) => {
      console.log("partial payment running");
      const model = this.Model.btobPaymentModel(trx);
      const data = await model.getPartialPaymentDueInvoices();
      if (data.length) {
        for (let elem of data) {
          //send to agency
          await Lib.sendEmail(
            elem.agency_email,
            `Last day of payment for the booking id ${elem.booking_ref} | ${PROJECT_NAME}`,
            partialPaymentDueEmailTemplate({
              booking_id: elem.booking_ref,
              agency_address: elem.agency_address,
              agency_email: elem.agency_email,
              agency_name: elem.agency_name,
              agency_phone: elem.agency_phone,
              agency_photo: `${PROJECT_IMAGE_URL}/${elem.agency_logo}`,
              departure_date: elem.departure_date,
              departure_time: elem.departure_time,
              due: elem.due,
              pnr: elem.pnr_code,
              route: elem.route,
              total_price: elem.payable_amount,
              type: 'agency'
            })
          );

          //send to admin
          await Lib.sendEmail(
            [PROJECT_EMAIL_API_1],
            `Last day of payment for the booking id ${elem.booking_ref} | B2B | ${PROJECT_NAME}`,
            partialPaymentDueEmailTemplate({
              booking_id: elem.booking_ref,
              agency_address: elem.agency_address,
              agency_email: elem.agency_email,
              agency_name: elem.agency_name,
              agency_phone: elem.agency_phone,
              agency_photo: `${PROJECT_IMAGE_URL}/${elem.agency_logo}`,
              departure_date: elem.departure_date,
              departure_time: elem.departure_time,
              due: elem.due,
              pnr: elem.pnr_code,
              route: elem.route,
              total_price: elem.payable_amount,
              type: 'admin'
            })
          );

          const adminNotificationSubModule = new AdminNotificationSubService(trx);
          await adminNotificationSubModule.insertNotification({
            ref_id: elem.id,
            type: NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
            message: `Last day of payment for the B2B booking - ${elem.booking_ref}`
          });
        }
      }
    })
  }

  //get discount and convenience fee for flight
  public async getFlightMarkUp({
    commission_set_id,
    set_flight_api_id,
    carrier,
    airports,
    base_fare
  }:
    {
      commission_set_id: number,
      set_flight_api_id: number,
      carrier: string,
      airports: string[],
      base_fare: number
    }) {
    const commissionModel = this.Model.apiAirlinesCommissionModel(this.trx);
    const routeConfigModel = this.Model.flightRouteConfigModel(this.trx);
    let convenience_fee = 0;
    let discount = 0;
    let finalCom = 0;
    let finalComType = '';
    let finalComMode = '';
    // routes commission check
    const routeComCheck = await routeConfigModel.getSetRoutesCommission(
      {
        status: true,
        departure: airports[0],
        arrival: airports[1],
        commission_set_id,
      },
      false
    );
    // Set commission if route commission is available
    if (routeComCheck.data.length) {
      if (routeComCheck.data.length > 1) {
        const routeComFoundOfAirline = routeComCheck.data.find(
          (item) => item.airline === carrier
        );
        if (routeComFoundOfAirline) {
          const { commission, com_type, com_mode } = routeComFoundOfAirline;
          finalCom = commission;
          finalComMode = com_mode;
          finalComType = com_type;
        }
      } else {
        const { commission, com_type, com_mode, airline } =
          routeComCheck.data[0];

        if (!airline || airline === carrier) {
          finalCom = commission;
          finalComMode = com_mode;
          finalComType = com_type;
        }
      }
    }

    // Set commission if route commission is not available and airlines commission is available
    if (!finalCom && !finalComType && !finalComMode) {
      //airline commission
      const comCheck = await commissionModel.getAPIAirlinesCommission(
        {
          airline: carrier,
          status: true,
          set_flight_api_id,
          limit: '1',
        },
        false
      );

      // Set Amount
      if (comCheck.data.length) {
        const {
          com_domestic,
          com_from_dac,
          com_to_dac,
          com_soto,
          com_type,
          com_mode,
        } = comCheck.data[0];

        let allBdAirport = true;
        let existBdAirport = false;

        for (const airport of airports) {
          if (BD_AIRPORT.includes(airport)) {
            if (!existBdAirport) {
              existBdAirport = true;
            }
          } else {
            allBdAirport = false;
          }
        }

        if (allBdAirport) {
          // Domestic
          finalCom = com_domestic;
          finalComMode = com_mode;
          finalComType = com_type;
        } else if (BD_AIRPORT.includes(airports[0])) {
          // From Dhaka
          finalCom = com_from_dac;
          finalComMode = com_mode;
          finalComType = com_type;
        } else if (existBdAirport) {
          // To Dhaka
          finalCom = com_to_dac;
          finalComMode = com_mode;
          finalComType = com_type;
        } else {
          // Soto
          finalCom = com_soto;
          finalComMode = com_mode;
          finalComType = com_type;
        }
      }
    }

    // Set Commission to fare
    if (finalCom && finalComMode && finalComType) {
      if (finalComType === COM_TYPE_PER) {
        const comAmount =
          (Number(base_fare) * Number(finalCom)) / 100;

        if (finalComMode === COM_MODE_INCREASE) {
          convenience_fee += Number(comAmount);
        } else {
          discount += Number(comAmount);
        }
      } else {
        if (finalComMode === COM_MODE_INCREASE) {
          convenience_fee += Number(finalCom);
        } else {
          discount += Number(finalCom);
        }
      }
    }

    return { convenience_fee, discount };
  }

  //upload logo
  public async uploadLogo(req: Request) {
    const files = req.files as Express.Multer.File[];
    if (!files.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      }
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: files[0].filename
    }
  }

  private generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

  public async test() {
//   try {
//     const endpoint = 'https://tstws2.ttinteractive.com/Zenith/TTI.PublicApi.Services/SoapSaleEngineService.svc/secure';
//     const soapAction = 'http://tempuri.org/ISaleEngineService/SearchFlights';
// const soapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
// <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
//   <s:Header>
//     <Action s:mustUnderstand="1" xmlns="http://schemas.microsoft.com/ws/2005/05/addressing/none">http://tempuri.org/ISaleEngineService/SearchFlights</Action>
//   </s:Header>
//   <s:Body>
//     <SearchFlights xmlns="http://tempuri.org/">
//       <request xmlns:d4p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Messages" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
//         <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
//         <d4p1:RequestInfo xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects">
//           <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
//           <d5p1:AuthenticationKey>${process.env.AUTH_KEY || '_JEAAAAMfq8GMRhP0D8csiaFHRuGVJdQNGKa6CN4sHx_RAjjZVn4chAgRxJaYZPyFiRL39n_Ew_U_U'}</d5p1:AuthenticationKey>
//           <d5p1:CultureName>en-GB</d5p1:CultureName>
//           <d5p1:EchoToken>${this.generateGuid()}</d5p1:EchoToken>
//         </d4p1:RequestInfo>
//         <d4p1:AvailabilitySettings xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
//           <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
//           <d5p1:CabinClassCode i:nil="true"/>
//           <d5p1:IncludeSegmentStops>false</d5p1:IncludeSegmentStops>
//           <d5p1:MaxConnectionCount>8</d5p1:MaxConnectionCount>
//           <d5p1:RealAvailability>false</d5p1:RealAvailability>
//         </d4p1:AvailabilitySettings>
//         <d4p1:FareDisplaySettings xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Pricing">
//           <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
//           <d5p1:ECouponBookCodes/>
//           <d5p1:FareLevels i:nil="true"/>
//           <d5p1:FareVisibilityCode i:nil="true"/>
//           <d5p1:FarebasisCodes xmlns:d6p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays"/>
//           <d5p1:ManualCombination>false</d5p1:ManualCombination>
//           <d5p1:PromoCode i:nil="true"/>
//           <d5p1:ShowWebClasses>true</d5p1:ShowWebClasses>
//           <d5p1:WebClassesCodes xmlns:d6p1="http://schemas.microsoft.com/2003/10/Serialization/Arrays"/>
//           <d5p1:RewardSearch>false</d5p1:RewardSearch>
//           <d5p1:SaleCurrencyCode>BDT</d5p1:SaleCurrencyCode>
//         </d4p1:FareDisplaySettings>
//         <d4p1:OriginDestinations xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
//           <d5p1:OriginDestination>
//             <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
//             <d5p1:DestinationCode>CXB</d5p1:DestinationCode>
//             <d5p1:OriginCode>DAC</d5p1:OriginCode>
//             <d5p1:TargetDate>2025-07-30T00:00:00+06:00</d5p1:TargetDate>
//           </d5p1:OriginDestination>
//         </d4p1:OriginDestinations>
//         <d4p1:Passengers xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
//           <d5p1:Passenger>
//             <Extensions i:nil="true" xmlns="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures"/>
//             <d5p1:NameElement i:nil="true"/>
//             <d5p1:PassengerQuantity>1</d5p1:PassengerQuantity>
//             <d5p1:PassengerTypeCode>AD</d5p1:PassengerTypeCode>
//             <d5p1:Ref>P_0</d5p1:Ref>
//             <d5p1:RefClient i:nil="true"/>
//           </d5p1:Passenger>
//         </d4p1:Passengers>
//       </request>
//     </SearchFlights>
//   </s:Body>
// </s:Envelope>`;

// // Minimal SOAP request body for testing
// const minimalSoapRequestBody = `<?xml version="1.0" encoding="utf-8"?>
// <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
//   <s:Header>
//     <Action s:mustUnderstand="1" xmlns="http://schemas.microsoft.com/ws/2005/05/addressing/none">http://tempuri.org/ISaleEngineService/SearchFlights</Action>
//   </s:Header>
//   <s:Body>
//     <SearchFlights xmlns="http://tempuri.org/">
//       <request xmlns:d4p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Messages" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
//         <d4p1:RequestInfo xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects">
//           <d5p1:AuthenticationKey>${process.env.AUTH_KEY || '_JEAAAAMfq8GMRhP0D8csiaFHRuGVJdQNGKa6CN4sHx_RAjjZVn4chAgRxJaYZPyFiRL39n_Ew_U_U'}</d5p1:AuthenticationKey>
//           <d5p1:CultureName>en-GB</d5p1:CultureName>
//           <d5p1:EchoToken>${this.generateGuid()}</d5p1:EchoToken>
//         </d4p1:RequestInfo>
//         <d4p1:OriginDestinations xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
//           <d5p1:OriginDestination>
//             <d5p1:DestinationCode>CXB</d5p1:DestinationCode>
//             <d5p1:OriginCode>DAC</d5p1:OriginCode>
//             <d5p1:TargetDate>2025-07-30T00:00:00+06:00</d5p1:TargetDate>
//           </d5p1:OriginDestination>
//         </d4p1:OriginDestinations>
//         <d4p1:Passengers xmlns:d5p1="http://schemas.datacontract.org/2004/07/TTI.PublicApi.Signatures.Objects.Inventory">
//           <d5p1:Passenger>
//             <d5p1:PassengerQuantity>1</d5p1:PassengerQuantity>
//             <d5p1:PassengerTypeCode>AD</d5p1:PassengerTypeCode>
//             <d5p1:Ref>P_0</d5p1:Ref>
//           </d5p1:Passenger>
//         </d4p1:Passengers>
//       </request>
//     </SearchFlights>
//   </s:Body>
// </s:Envelope>`;
//     const response = await axios.post(endpoint, soapRequestBody, {
//       headers: {
//         'Content-Type': 'text/xml; charset=utf-8',
//         'SOAPAction': soapAction,
//         'Accept': 'text/xml'
//       },
//     });

//     // Log the response
//     console.log('Response Status:', response.status);
//     console.log('Response Data:', response.data);

//     // Optionally, parse the XML response to extract flight details
//     // You can use a library like 'xml2js' to parse the XML
//   } catch (error:any) {
//     if (error.response) {
//       // Handle SOAP faults or HTTP errors
//       console.error('Error Status:', error.response.status);
//       console.error('Error Response:', error.response.data);
//     } else {
//       console.error('Error:', error.message);
//     }
//   }

}

}
export default PublicCommonService;
