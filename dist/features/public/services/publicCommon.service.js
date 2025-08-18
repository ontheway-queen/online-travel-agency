"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
// import { GET_TOKEN_ENDPOINT } from "../../../utils/miscellaneous/sabreApiEndpoints";
const axios_1 = __importDefault(require("axios"));
const flightConstants_1 = require("../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const sabreApiEndpoints_1 = __importDefault(require("../../../utils/miscellaneous/flightMiscellaneous/sabreApiEndpoints"));
const verteilApiEndpoints_1 = __importDefault(require("../../../utils/miscellaneous/flightMiscellaneous/verteilApiEndpoints"));
const partialPaymentDueEmailTemplate_1 = require("../../../utils/templates/partialPaymentDueEmailTemplate");
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
// const soap = require('soap');
class PublicCommonService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    // Get Sebre token
    getSabreToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const data = qs_1.default.stringify({
                        grant_type: 'password',
                        username: config_1.default.SABRE_USERNAME,
                        password: config_1.default.SABRE_PASSWORD,
                    });
                    const axiosConfig = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: `${config_1.default.SABRE_URL}/${sabreApiEndpoints_1.default.GET_TOKEN_ENDPOINT}`,
                        headers: {
                            Authorization: `Basic ${config_1.default.SABRE_AUTH_TOKEN}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        data: data,
                    };
                    const response = yield axios_1.default.request(Object.assign(Object.assign({}, axiosConfig), { validateStatus: () => true }));
                    if (response.status !== 200) {
                        yield this.Model.errorLogsModel(trx).insert({
                            level: constants_1.ERROR_LEVEL_CRITICAL,
                            message: `Error from Sabre authentication`,
                            url: axiosConfig.url,
                            http_method: 'POST',
                            metadata: {
                                api: constants_1.SABRE_API,
                                endpoint: axiosConfig.url,
                                payload: {
                                    grant_type: 'password',
                                    username: config_1.default.SABRE_USERNAME,
                                    password: config_1.default.SABRE_PASSWORD,
                                },
                                response: response.data,
                            }
                        });
                    }
                    else {
                        const authModel = this.Model.commonModel(trx);
                        yield authModel.updateEnv(constants_1.SABRE_TOKEN_ENV, response.data.access_token);
                    }
                }));
            }
            catch (err) {
                console.error("Transaction error:", err);
            }
        });
    }
    //get verteil token
    getVerteilToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const axiosConfig = {
                        method: 'post',
                        url: `${config_1.default.VERTEIL_URL}${verteilApiEndpoints_1.default.GET_TOKEN_ENDPOINT}`,
                        headers: {
                            Authorization: `Basic ${Buffer.from(`${config_1.default.VERTEIL_USERNAME}:${config_1.default.VERTEIL_PASSWORD}`).toString("base64")}`,
                        },
                        maxBodyLength: Infinity,
                        validateStatus: () => true,
                    };
                    const response = yield axios_1.default.request(axiosConfig);
                    console.log({ response });
                    if (response.status !== 200) {
                        yield this.Model.errorLogsModel(trx).insert({
                            level: constants_1.ERROR_LEVEL_CRITICAL,
                            message: `Error from Verteil authentication`,
                            url: axiosConfig.url,
                            http_method: 'POST',
                            metadata: {
                                api: flightConstants_1.VERTEIL_API,
                                endpoint: axiosConfig.url,
                                payload: {
                                    username: config_1.default.VERTEIL_USERNAME,
                                    password: config_1.default.VERTEIL_PASSWORD,
                                },
                                response: response.data,
                            }
                        });
                    }
                    else {
                        const authModel = this.Model.commonModel(trx);
                        yield authModel.updateEnv(flightConstants_1.VERTEIL_TOKEN_ENV, response.data.access_token);
                    }
                }));
            }
            catch (err) {
                console.error("Verteil Token Error:", err);
            }
        });
    }
    // Get travelport rest api token
    getTravelportRestToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    let data = qs_1.default.stringify({
                        grant_type: "password",
                        username: config_1.default.TRAVELPORT_REST_USERNAME,
                        password: config_1.default.TRAVELPORT_REST_PASSWORD,
                        client_id: config_1.default.TRAVELPORT_REST_CLIENT_ID,
                        client_secret: config_1.default.TRAVELPORT_REST_CLIENT_SECRET,
                        scope: "openid",
                    });
                    let axiosConfig = {
                        method: "post",
                        maxBodyLength: Infinity,
                        url: `${config_1.default.TRAVELPORT_REST_TOKEN_URL}`,
                        data: data,
                        validateStatus: () => true,
                    };
                    const response = yield axios_1.default.request(axiosConfig);
                    if (response.status !== 200) {
                        yield this.Model.errorLogsModel(trx).insert({
                            level: constants_1.ERROR_LEVEL_CRITICAL,
                            message: `Error from Travelport Rest API authentication`,
                            url: axiosConfig.url,
                            http_method: 'POST',
                            metadata: {
                                api: flightConstants_1.TRAVELPORT_REST_API,
                                endpoint: axiosConfig.url,
                                payload: {
                                    grant_type: "password",
                                    username: config_1.default.TRAVELPORT_REST_USERNAME,
                                    password: config_1.default.TRAVELPORT_REST_PASSWORD,
                                    client_id: config_1.default.TRAVELPORT_REST_CLIENT_ID,
                                    client_secret: config_1.default.TRAVELPORT_REST_CLIENT_SECRET,
                                    scope: "openid",
                                },
                                response: response.data,
                            }
                        });
                    }
                    else {
                        const authModel = this.Model.commonModel(trx);
                        yield authModel.updateEnv(flightConstants_1.TRAVELPORT_REST_TOKEN_ENV, response.data.access_token);
                    }
                }));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    //get all country
    getAllCountry(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.query;
            const model = this.Model.commonModel();
            const country_list = yield model.getAllCountry({ name });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: country_list,
            };
        });
    }
    //get all city
    getAllCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { city_id } = req.query;
            const country_id = req.query.country_id;
            const limit = req.query.limit;
            const skip = req.query.skip;
            const name = req.query.name;
            const model = this.Model.commonModel();
            const city_list = yield model.getAllCity({
                country_id,
                limit,
                skip,
                name,
                city_id: city_id ? parseInt(city_id) : 0,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: city_list,
            };
        });
    }
    //get all airport
    getAllAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { country_id, name, limit, skip } = req.query;
            const model = this.Model.commonModel();
            const get_airport = yield model.getAllAirport({ country_id, name, limit, skip }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: get_airport.total,
                data: get_airport.data,
            };
        });
    }
    //get all airlines
    getAllAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code, name, limit, skip } = req.query;
            const model = this.Model.commonModel();
            const get_airlines = yield model.getAllAirline({ code, name, limit, skip }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: get_airlines.total,
                data: get_airlines.data,
            };
        });
    }
    //get all visa list
    getAllVisaCountryList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let { limit, skip } = req.query;
            const model = this.Model.VisaModel();
            const data = yield model.getAllVisaCountryList({
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
        });
    }
    //get all visa list
    getAllVisaList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let { country_id, limit, skip, visa_type } = req.query;
            const model = this.Model.VisaModel();
            const data = yield model.get({ country_id, status: true, limit, skip, visa_type }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get all visa Type
    getAllVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.VisaModel();
            const data = yield model.getAllVisaType();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data,
            };
        });
    }
    //get single visa
    getSingleVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.single(Number(id), true);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            else {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data[0],
                };
            }
        });
    }
    //get article list
    getArticleList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, status, limit, skip, deleted } = req.query;
            const data = yield this.Model.articleModel().getArticleList({
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
        });
    }
    //get single article
    getSingleArticle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const article_slug = req.params.slug;
            const data = yield this.Model.articleModel().getSingleArticle({
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
        });
    }
    //get all offer
    getAllOffer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status, name } = req.query;
            const data = yield this.Model.promotionModel().getOfferList({
                limit: Number(limit),
                skip: Number(skip),
                status: '1',
                name: name,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single offer
    getSingleOffer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.Model.promotionModel().getSingleOffer({
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
        });
    }
    // Get Active Only Banner Images
    getActiveOnlyBannerImage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const getActiveImages = yield this.Model.adminModel().getActiveBannerImage();
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
        });
    }
    // get all b2c data for corporate travel page
    getB2CDataForCorporatePackagePage() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.corporateTravelModel();
            const tourPackage = yield model.getDataForCorporatePackagePage();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: tourPackage,
            };
        });
    }
    // get umrah page details
    getDetailDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.umrahPackageModel(trx);
                const data = yield model.getDetailDescription();
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: data[0],
                };
            }));
        });
    }
    //get all announcement list
    getAllAnnouncementList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type } = req.query;
            const data = yield this.Model.announcementModel().getAllAnnouncementBar({
                isActive: true,
                currentDate: new Date(),
                type: type || 'B2C',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data || [],
            };
        });
    }
    //update admin
    updateAdmin(payload, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db('user_admin')
                    .withSchema(this.schema.ADMIN_SCHEMA)
                    .update(payload)
                    .where({ id: user_id });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    //update btob user
    updateB2B(payload, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db('btob_user')
                    .withSchema(this.schema.AGENT_SCHEMA)
                    .update(payload)
                    .where({ id: user_id });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    //send email for the due of partial payments
    sendEmailForPartialPaymentDue() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                console.log("partial payment running");
                const model = this.Model.btobPaymentModel(trx);
                const data = yield model.getPartialPaymentDueInvoices();
                if (data.length) {
                    for (let elem of data) {
                        //send to agency
                        yield lib_1.default.sendEmail(elem.agency_email, `Last day of payment for the booking id ${elem.booking_ref} | ${constants_1.PROJECT_NAME}`, (0, partialPaymentDueEmailTemplate_1.partialPaymentDueEmailTemplate)({
                            booking_id: elem.booking_ref,
                            agency_address: elem.agency_address,
                            agency_email: elem.agency_email,
                            agency_name: elem.agency_name,
                            agency_phone: elem.agency_phone,
                            agency_photo: `${constants_1.PROJECT_IMAGE_URL}/${elem.agency_logo}`,
                            departure_date: elem.departure_date,
                            departure_time: elem.departure_time,
                            due: elem.due,
                            pnr: elem.pnr_code,
                            route: elem.route,
                            total_price: elem.payable_amount,
                            type: 'agency'
                        }));
                        //send to admin
                        yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Last day of payment for the booking id ${elem.booking_ref} | B2B | ${constants_1.PROJECT_NAME}`, (0, partialPaymentDueEmailTemplate_1.partialPaymentDueEmailTemplate)({
                            booking_id: elem.booking_ref,
                            agency_address: elem.agency_address,
                            agency_email: elem.agency_email,
                            agency_name: elem.agency_name,
                            agency_phone: elem.agency_phone,
                            agency_photo: `${constants_1.PROJECT_IMAGE_URL}/${elem.agency_logo}`,
                            departure_date: elem.departure_date,
                            departure_time: elem.departure_time,
                            due: elem.due,
                            pnr: elem.pnr_code,
                            route: elem.route,
                            total_price: elem.payable_amount,
                            type: 'admin'
                        }));
                        const adminNotificationSubModule = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                        yield adminNotificationSubModule.insertNotification({
                            ref_id: elem.id,
                            type: constants_1.NOTIFICATION_TYPE_B2B_FLIGHT_BOOKING,
                            message: `Last day of payment for the B2B booking - ${elem.booking_ref}`
                        });
                    }
                }
            }));
        });
    }
    //get discount and convenience fee for flight
    getFlightMarkUp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ commission_set_id, set_flight_api_id, carrier, airports, base_fare }) {
            const commissionModel = this.Model.apiAirlinesCommissionModel(this.trx);
            const routeConfigModel = this.Model.flightRouteConfigModel(this.trx);
            let convenience_fee = 0;
            let discount = 0;
            let finalCom = 0;
            let finalComType = '';
            let finalComMode = '';
            // routes commission check
            const routeComCheck = yield routeConfigModel.getSetRoutesCommission({
                status: true,
                departure: airports[0],
                arrival: airports[1],
                commission_set_id,
            }, false);
            // Set commission if route commission is available
            if (routeComCheck.data.length) {
                if (routeComCheck.data.length > 1) {
                    const routeComFoundOfAirline = routeComCheck.data.find((item) => item.airline === carrier);
                    if (routeComFoundOfAirline) {
                        const { commission, com_type, com_mode } = routeComFoundOfAirline;
                        finalCom = commission;
                        finalComMode = com_mode;
                        finalComType = com_type;
                    }
                }
                else {
                    const { commission, com_type, com_mode, airline } = routeComCheck.data[0];
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
                const comCheck = yield commissionModel.getAPIAirlinesCommission({
                    airline: carrier,
                    status: true,
                    set_flight_api_id,
                    limit: '1',
                }, false);
                // Set Amount
                if (comCheck.data.length) {
                    const { com_domestic, com_from_dac, com_to_dac, com_soto, com_type, com_mode, } = comCheck.data[0];
                    let allBdAirport = true;
                    let existBdAirport = false;
                    for (const airport of airports) {
                        if (constants_1.BD_AIRPORT.includes(airport)) {
                            if (!existBdAirport) {
                                existBdAirport = true;
                            }
                        }
                        else {
                            allBdAirport = false;
                        }
                    }
                    if (allBdAirport) {
                        // Domestic
                        finalCom = com_domestic;
                        finalComMode = com_mode;
                        finalComType = com_type;
                    }
                    else if (constants_1.BD_AIRPORT.includes(airports[0])) {
                        // From Dhaka
                        finalCom = com_from_dac;
                        finalComMode = com_mode;
                        finalComType = com_type;
                    }
                    else if (existBdAirport) {
                        // To Dhaka
                        finalCom = com_to_dac;
                        finalComMode = com_mode;
                        finalComType = com_type;
                    }
                    else {
                        // Soto
                        finalCom = com_soto;
                        finalComMode = com_mode;
                        finalComType = com_type;
                    }
                }
            }
            // Set Commission to fare
            if (finalCom && finalComMode && finalComType) {
                if (finalComType === constants_1.COM_TYPE_PER) {
                    const comAmount = (Number(base_fare) * Number(finalCom)) / 100;
                    if (finalComMode === constants_1.COM_MODE_INCREASE) {
                        convenience_fee += Number(comAmount);
                    }
                    else {
                        discount += Number(comAmount);
                    }
                }
                else {
                    if (finalComMode === constants_1.COM_MODE_INCREASE) {
                        convenience_fee += Number(finalCom);
                    }
                    else {
                        discount += Number(finalCom);
                    }
                }
            }
            return { convenience_fee, discount };
        });
    }
    //upload logo
    uploadLogo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = req.files;
            if (!files.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: files[0].filename
            };
        });
    }
    generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.default = PublicCommonService;
