import axios from 'axios';
import config from '../../../config/config';
import Models from '../../../models/rootModel';
import { ERROR_LEVEL_DEBUG, ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
import { TRIPJACK_API } from '../../miscellaneous/flightMiscellaneous/flightConstants';
const BASE_URL = config.TRIPJACK_URL;
const API_KEY = config.TRIPJACK_API_KEY;

export default class TripjackRequests {
    // get request
    public async getRequest(endpoint: string) {
        try {
            const headers = {
                'apikey': API_KEY,
                'Content-Type': 'application/json',
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

    // post request
    public async postRequest(endpoint: string, requestData: any) {
        try {
            const headers = {
                'apikey': API_KEY,
                'Content-Type': 'application/json',
            };

            const apiUrl = BASE_URL + endpoint;

            const response = await axios.request({
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
            console.log({ response: response.data.errors })
            console.log({ req: requestData })
            if (response.status !== 200 || response.data.errors) {
                await new Models().errorLogsModel().insert({
                    level: ERROR_LEVEL_WARNING,
                    message: `Error from Tripjack`,
                    url: apiUrl,
                    http_method: 'POST',
                    metadata: {
                        api: TRIPJACK_API,
                        endpoint: apiUrl,
                        payload: requestData,
                        response: response.data,
                    }
                });
                return false;
            }
            // console.log("response again", response);
            return response.data;

        } catch (error: any) {
            // console.log(error.response);
            return false;
        }
    }
}
