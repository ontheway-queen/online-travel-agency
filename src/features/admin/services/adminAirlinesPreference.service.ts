import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import CustomError from '../../../utils/lib/customError';
import { ICreateAirlinesPreferencePayload } from '../../../utils/interfaces/dynamicFareRulesModelInterface/airlinesPreferenceModel.interface';

export class AdminAirlinesPreferenceService extends AbstractServices {
  constructor() {
    super();
  }

  public async createAirlinePreference(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.AirlinesPreferenceModel(trx);
      const { body } = req.body as {
        body: {
          airlines_code: 'MU,CA';
          dynamic_fare_supplier_id: 1;
          preference_type: 'PREFERRED' | 'BLOCKED';
          from_dac: true;
          to_dac: true;
          domestic: true;
          soto: true;
        }[];
      };

      const payload: ICreateAirlinesPreferencePayload[] = [];

      for (const elm of body) {
        const airlineCodes = elm.airlines_code
          .split(',')
          .map((code: string) => code.trim().toUpperCase());

        for (const code of airlineCodes) {
          const check_duplicate = await model.getAirlinesPreferences({
            dynamic_fare_supplier_id: elm.dynamic_fare_supplier_id,
            airlines_code: code,
          });

          if (check_duplicate.length) {
            throw new CustomError(
              `Airline (${code}) already exists for this set`,
              this.StatusCode.HTTP_CONFLICT
            );
          } else {
            payload.push({
              airlines_code: code,
              domestic: elm.domestic,
              dynamic_fare_supplier_id: elm.dynamic_fare_supplier_id,
              from_dac: elm.from_dac,
              to_dac: elm.to_dac,
              preference_type: elm.preference_type,
              soto: elm.soto,
            });
          }
        }
      }

      await model.createAirlinePreference(payload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Airline preference created',
      };
    });
  }

  public async getAirlinesPreferences(req: Request) {
    const { dynamic_fare_supplier_id, pref_type, filter, status } =
      req.query as {
        dynamic_fare_supplier_id: string;
        pref_type?: string;
        status?: string;
        filter?: string;
      };

    const model = this.Model.AirlinesPreferenceModel();
    const data = await model.getAirlinesPreferences({
      dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
      pref_type,
      status: Boolean(status),
      filter,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateAirlinePreference(req: Request) {
    const model = this.Model.AirlinesPreferenceModel();
    const { id } = req.params;
    const body = req.body as {
      status?: boolean;
      preference_type?: 'PREFERRED' | 'BLOCKED';
      from_dac?: boolean;
      to_dac?: boolean;
      domestic?: boolean;
      soto?: boolean;
    };
    const existing = await model.getAirlinePreferenceById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.updateAirlinePreference(Number(id), body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Airline preference updated',
    };
  }

  public async deleteAirlinePreference(req: Request) {
    const model = this.Model.AirlinesPreferenceModel();
    const { id } = req.params;
    const existing = await model.getAirlinePreferenceById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.deleteAirlinePreference(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Airline preference deleted',
    };
  }
}
