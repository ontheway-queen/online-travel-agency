import axios from 'axios';
import config from '../../../config/config';
import Models from '../../../models/rootModel';
import { VERTEIL_API, VERTEIL_TOKEN_ENV } from '../../miscellaneous/flightMiscellaneous/flightConstants';
import { ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
const BASE_URL = config.VERTEIL_URL;

export default class VerteilRequests {

    // post request
    public async postRequest(
        endpoint: string,
        requestData: any,
        options?: {
            headers?: Record<string, string>;
        }
    ) {
        try {
            const apiUrl = BASE_URL + "/entrygate/rest/request:" + endpoint;
            const authModel = new Models().commonModel();

            const token = await authModel.getEnv(VERTEIL_TOKEN_ENV);
            let headers: any = { ...options?.headers };


            // const response = await axios.post(apiUrl, requestData, { headers });
            const response = await axios.request({
                method: 'post',
                url: apiUrl,
                maxBodyLength: Infinity,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    "Accept-Encoding": "gzip",
                    officeId: config.VERTEIL_OFFICEID,
                    service: endpoint.charAt(0).toUpperCase() + endpoint.slice(1),
                    ...headers,
                },
                data: requestData,
                validateStatus: () => true,
            });

            if (response.status !== 200 || response.data?.VdcErrors || (response.data?.Errors && !response?.data?.OffersGroup?.AirlineOffers?.[0]?.AirlineOffer)) {
                await new Models().errorLogsModel().insert({
                    level: ERROR_LEVEL_WARNING,
                    message: `Error from Verteil`,
                    url: apiUrl,
                    http_method: 'POST',
                    metadata: {
                        api: VERTEIL_API,
                        endpoint: apiUrl,
                        payload: requestData,
                        response: response.data,
                    }
                });
                if (response.status !== 200 || response.data?.VdcErrors) {

                    return false;
                }
            }
            // console.log("response again", response);
            return response.data;

        } catch (error: any) {
            // console.log(error.response);
            return false;
        }
    }
}
