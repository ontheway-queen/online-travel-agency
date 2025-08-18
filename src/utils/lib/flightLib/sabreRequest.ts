import axios from 'axios';
import config from '../../../config/config';
import Models from '../../../models/rootModel';
import { SABRE_API, SABRE_TOKEN_ENV } from '../../miscellaneous/flightMiscellaneous/flightConstants';
import { ERROR_LEVEL_WARNING } from '../../miscellaneous/constants';
const BASE_URL = config.SABRE_URL;

export default class SabreRequests {
  // get request
  public async getRequest(endpoint: string) {
    try {
      const authModel = new Models().commonModel();

      const token = await authModel.getEnv(SABRE_TOKEN_ENV);
      const headers = {
        Authorization: `Bearer ${token}`,
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
      const apiUrl = BASE_URL + endpoint;
      const authModel = new Models().commonModel();

      const token = await authModel.getEnv(SABRE_TOKEN_ENV);
      // console.log(token)
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // const response = await axios.post(apiUrl, requestData, { headers });
      const response = await axios.request({
        method: 'post',
        url: apiUrl,
        headers: headers,
        data: requestData,
        validateStatus: () => true,
      });
      if (response.status !== 200) {
        await new Models().errorLogsModel().insert({
          level: ERROR_LEVEL_WARNING,
          message: `Error from Sabre`,
          url: apiUrl,
          http_method: 'POST',
          metadata: {
            api: SABRE_API,
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
