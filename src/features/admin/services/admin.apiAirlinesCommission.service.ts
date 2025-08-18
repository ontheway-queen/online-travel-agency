import e, { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { IUpdateAPIAirlinesCommissionReqBody } from '../utils/types/admin.apiAirlinesCommission.interface';
import { db } from '../../../app/database';
import { IInsertAPIAirlinesCommission } from '../../../utils/interfaces/common/commissionAirlinesRoutesInterface';

export class AdminApiAirlinesCommissionService extends AbstractServices {
  constructor() {
    super();
  }

  // Get API
  public async getAllApi(_req: Request) {
    const apiAirComModel = this.Model.apiAirlinesCommissionModel();

    const data = await apiAirComModel.getFlightAPI({});

    return {
      success: true,
      data,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // Update API Airlines Commission
  public async updateAPIAirlinesCommission(req: Request) {
    return db.transaction(async (trx) => {
      const { id: user_id } = req.admin;
      const { id } = req.params;
      const { api_status, add, remove, update } =
        req.body as IUpdateAPIAirlinesCommissionReqBody;

      const apiAirComModel = this.Model.apiAirlinesCommissionModel(trx);

      if (api_status !== undefined) {
        await apiAirComModel.updateFlightAPI(Number(id), api_status);
      }

      if (add) {
        const addPayload: IInsertAPIAirlinesCommission[] = [];

        for (const addItem of add) {
          const {
            airlines,
            com_domestic,
            com_from_dac,
            com_mode,
            com_soto,
            com_to_dac,
            com_type,
          } = addItem;

          for (const airline of airlines) {
            // Check if the airline already exists
            const existingRecord = await apiAirComModel.getAPIAirlinesCommission({
              airline,
              set_flight_api_id: Number(id),
            });

            // If exists, update the airline
            if (existingRecord.data.length) {
              await apiAirComModel.updateAPIAirlinesCommission(existingRecord.data[0].key, {
                com_domestic,
                com_from_dac,
                com_mode,
                com_soto,
                com_to_dac,
                com_type,
                updated_by: user_id,
              });
            }
            // Else, add the airline
            else {
              addPayload.push({
                set_flight_api_id: Number(id),
                created_by: user_id,
                airline,
                com_domestic,
                com_from_dac,
                com_mode,
                com_soto,
                com_to_dac,
                com_type,
              });
            }
          }
        }

        // Insert the remaining records
        if (addPayload.length) {
          await apiAirComModel.insertAPIAirlinesCommission(addPayload);
        }
      }


      if (update) {
        for (const updateItem of update) {
          const { id, ...restBody } = updateItem;
          await apiAirComModel.updateAPIAirlinesCommission(id, {
            ...restBody,
            updated_by: user_id,
          });
        }
      }

      if (remove) {
        await apiAirComModel.deleteAPIAirlinesCommission(remove);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  // Get API Airlines Commission
  public async getAPIAirlinesCommission(req: Request) {
    const query = req.query;
    const { id } = req.params;

    const apiAirComModel = this.Model.apiAirlinesCommissionModel();

    const { data, total } = await apiAirComModel.getAPIAirlinesCommission({
      ...query,
      set_flight_api_id: Number(id),
    });

    return {
      success: true,
      data,
      total,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
