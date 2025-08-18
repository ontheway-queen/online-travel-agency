import axios from 'axios';
import config from '../../../config/config';
import request from 'request';
import Models from '../../../models/rootModel';
import { TRAVELPORT_REST_API, TRAVELPORT_REST_TOKEN_ENV } from '../../miscellaneous/flightMiscellaneous/flightConstants';
import { ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
const BASE_URL = config.TRAVELPORT_REST_URL;

export default class TravelportRestRequest {
    // get request (axios)
    public async getRequest(endpoint: string) {
        try {
            const authModel = new Models().commonModel();

            const token = await authModel.getEnv(TRAVELPORT_REST_TOKEN_ENV);
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                XAUTH_TRAVELPORT_ACCESSGROUP: config.TRAVELPORT_REST_ACCESS_GROUP,
            };

            const apiUrl = BASE_URL + endpoint;

            const response = await axios.get(apiUrl, { headers });

            const data = response.data;

            return { code: response.status, data };
        } catch (error: any) {
            console.error('Error calling API:', error.response.status);
            return { code: error.response.status, data: [] };
        }
    }

    // post request (axios)
    public async postRequest(endpoint: string, requestData: any) {
        try {
            const apiUrl = BASE_URL + endpoint;
            const authModel = new Models().commonModel();

            const token = await authModel.getEnv(TRAVELPORT_REST_TOKEN_ENV);
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                XAUTH_TRAVELPORT_ACCESSGROUP: config.TRAVELPORT_REST_ACCESS_GROUP,
            };

            //   const response = await axios.post(apiUrl, requestData, { headers });
            const response = await axios.request({
                method: 'post',
                url: apiUrl,
                headers,
                data: requestData,
                validateStatus: () => true
            });
            if (response.status !== 200) {
                await new Models().errorLogsModel().insert({
                    level: ERROR_LEVEL_WARNING,
                    message: `Error from Travelport`,
                    url: apiUrl,
                    http_method: 'POST',
                    metadata: {
                        api: TRAVELPORT_REST_API,
                        endpoint: apiUrl,
                        payload: requestData,
                        response: response.data,
                    }
                });
                return false;
            }
            return response.data;
        } catch (error: any) {
            console.log(error.response);
            return false;
        }
    }

    //REQUEST
    public async nodeJSRequestModule(
        endpoint: string,
        requestData: any,
        method: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH'
    ) {
        const authModel = new Models().commonModel();
        const token = await authModel.getEnv(TRAVELPORT_REST_TOKEN_ENV);
        const apiUrl = BASE_URL + endpoint;

        var options = {
            method: method,
            url: apiUrl,
            headers: {
                XAUTH_TRAVELPORT_ACCESSGROUP: config.TRAVELPORT_REST_ACCESS_GROUP,
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
        };
        return new Promise<any>((resolve, reject) => {
            request(options, (error, response, body) => {
                if (error) {
                    reject(false);
                } else {
                    try {
                        const jsonResponse: [] = JSON.parse(body);
                        resolve(jsonResponse);
                    } catch (parseError) {
                        console.error('JSON Parsing Error:', parseError);
                        resolve(false);
                    }
                }
            });
        });
    }
}
