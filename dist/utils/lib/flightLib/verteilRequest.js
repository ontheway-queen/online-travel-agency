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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config/config"));
const rootModel_1 = __importDefault(require("../../../models/rootModel"));
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
const constants_1 = require("../../miscellaneous/constants");
const BASE_URL = config_1.default.VERTEIL_URL;
class VerteilRequests {
    // post request
    postRequest(endpoint, requestData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                const apiUrl = BASE_URL + "/entrygate/rest/request:" + endpoint;
                const authModel = new rootModel_1.default().commonModel();
                const token = yield authModel.getEnv(flightConstants_1.VERTEIL_TOKEN_ENV);
                let headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
                // const response = await axios.post(apiUrl, requestData, { headers });
                const response = yield axios_1.default.request({
                    method: 'post',
                    url: apiUrl,
                    maxBodyLength: Infinity,
                    headers: Object.assign({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', "Accept-Encoding": "gzip", officeId: config_1.default.VERTEIL_OFFICEID, service: endpoint.charAt(0).toUpperCase() + endpoint.slice(1) }, headers),
                    data: requestData,
                    validateStatus: () => true,
                });
                if (response.status !== 200 || ((_a = response.data) === null || _a === void 0 ? void 0 : _a.VdcErrors) || (((_b = response.data) === null || _b === void 0 ? void 0 : _b.Errors) && !((_f = (_e = (_d = (_c = response === null || response === void 0 ? void 0 : response.data) === null || _c === void 0 ? void 0 : _c.OffersGroup) === null || _d === void 0 ? void 0 : _d.AirlineOffers) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.AirlineOffer))) {
                    yield new rootModel_1.default().errorLogsModel().insert({
                        level: constants_1.ERROR_LEVEL_WARNING,
                        message: `Error from Verteil`,
                        url: apiUrl,
                        http_method: 'POST',
                        metadata: {
                            api: flightConstants_1.VERTEIL_API,
                            endpoint: apiUrl,
                            payload: requestData,
                            response: response.data,
                        }
                    });
                    if (response.status !== 200 || ((_g = response.data) === null || _g === void 0 ? void 0 : _g.VdcErrors)) {
                        return false;
                    }
                }
                // console.log("response again", response);
                return response.data;
            }
            catch (error) {
                // console.log(error.response);
                return false;
            }
        });
    }
}
exports.default = VerteilRequests;
