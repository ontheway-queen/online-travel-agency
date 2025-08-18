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
const constants_1 = require("../../miscellaneous/constants");
const flightConstants_1 = require("../../miscellaneous/flightMiscellaneous/flightConstants");
const BASE_URL = config_1.default.TRIPJACK_URL;
const API_KEY = config_1.default.TRIPJACK_API_KEY;
class TripjackRequests {
    // get request
    getRequest(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const headers = {
                    'apikey': API_KEY,
                    'Content-Type': 'application/json',
                };
                const apiUrl = BASE_URL + endpoint;
                const response = yield axios_1.default.get(apiUrl, { headers });
                const data = response.data;
                return { code: response.status, data };
            }
            catch (error) {
                console.error('Error calling API:', error.response.status);
                return { code: error.response.status, data: [] };
            }
        });
    }
    // post request
    postRequest(endpoint, requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const headers = {
                    'apikey': API_KEY,
                    'Content-Type': 'application/json',
                };
                const apiUrl = BASE_URL + endpoint;
                const response = yield axios_1.default.request({
                    method: 'post',
                    url: apiUrl,
                    headers: headers,
                    data: requestData,
                    validateStatus: () => true,
                });
                // await new Models().errorLogsModel().insert({
                //     level: ERROR_LEVEL_DEBUG,
                //     message: `TRIPJACK RESPONSE`,
                //     url: apiUrl,
                //     http_method: 'POST',
                //     metadata: {
                //         api: TRIPJACK_API,
                //         endpoint: apiUrl,
                //         payload: requestData,
                //         response: response.data,
                //     }
                // });
                console.log({ response: response.data.errors });
                console.log({ req: requestData });
                if (response.status !== 200 || response.data.errors) {
                    yield new rootModel_1.default().errorLogsModel().insert({
                        level: constants_1.ERROR_LEVEL_WARNING,
                        message: `Error from Tripjack`,
                        url: apiUrl,
                        http_method: 'POST',
                        metadata: {
                            api: flightConstants_1.TRIPJACK_API,
                            endpoint: apiUrl,
                            payload: requestData,
                            response: response.data,
                        }
                    });
                    return false;
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
exports.default = TripjackRequests;
