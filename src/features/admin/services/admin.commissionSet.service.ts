import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
  ICreateCommissionSetReqBody,
  IPrePayloadSetCommission,
  ISetSingleCommissionPayload,
  IUpdateCommissionSetReqBody,
} from "../utils/types/admin.commissionSet.interface";
import CustomError from "../../../utils/lib/customError";
import { IInsertAPIAirlinesCommission } from "../../../utils/interfaces/common/commissionAirlinesRoutesInterface";

export class AdminCommissionSetService extends AbstractServices {
  constructor() {
    super();
  }

  // Create Commission set
  public async createCommissionSet(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const { api, name } = req.body as ICreateCommissionSetReqBody;
      const commissionSetModel = this.Model.commissionSetModel(trx);

      const apiAirlinesCommissionModel =
        this.Model.apiAirlinesCommissionModel(trx);

      const checkName = await commissionSetModel.getCommissionSet({
        exact_name: name,
      });

      if (checkName.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Name already exist!",
        };
      }

      const newCommissionSet = await commissionSetModel.createCommissionSet({
        created_by: id,
        name,
      });

      const PrePayload: IPrePayloadSetCommission[] = [];

      for (const item of api) {
        const { api_id, airlines, ...rest } = item;
        const checkExisting = PrePayload.find(
          (singlePayload) => singlePayload.api_id === api_id
        );
        const commissions: ISetSingleCommissionPayload[] = [];
        if (checkExisting) {
          airlines.forEach((airline) => {
            commissions.push({ airline, ...rest });
          });
          checkExisting.commissions = [
            ...checkExisting.commissions,
            ...commissions,
          ];
        } else {
          airlines.forEach((airline) => {
            commissions.push({ airline, ...rest });
          });
          PrePayload.push({
            api_id,
            set_id: newCommissionSet[0].id,
            commissions,
          });
        }
      }

      for (const item of PrePayload) {
        const { api_id, set_id, commissions } = item;

        const checkApi = await apiAirlinesCommissionModel.getFlightAPI({
          id: api_id,
        });

        if (!checkApi.length) {
          throw new CustomError(
            `Invalid api id: ${api_id}`,
            this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
          );
        }

        const newSetFlightApi = await commissionSetModel.createSetFlightAPI({
          api_id,
          set_id,
        });

        const airlinesCommissionPayload: IInsertAPIAirlinesCommission[] =
          commissions.map((commission) => {
            return {
              ...commission,
              set_flight_api_id: newSetFlightApi[0].id,
              created_by: id,
            };
          });

        await apiAirlinesCommissionModel.insertAPIAirlinesCommission(
          airlinesCommissionPayload
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  // Get commission set
  public async getCommissionSet(req: Request) {
    const query = req.query;
    const commissionSetModel = this.Model.commissionSetModel();

    const data = await commissionSetModel.getCommissionSet(query);

    return {
      success: true,
      data,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // Get single commission set
  public async getSingleCommissionSet(req: Request) {
    const { id } = req.params;

    const commissionSetModel = this.Model.commissionSetModel();

    const commissionSetData = await commissionSetModel.getSingleCommissionSet(
      Number(id)
    );

    if (!commissionSetData.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const setFlightAPIData = await commissionSetModel.getSetFlightAPI({
      set_id: Number(id),
    });

    return {
      success: true,
      data: {
        id: commissionSetData[0].id,
        name: commissionSetData[0].name,
        status: commissionSetData[0].status,
        api: setFlightAPIData,
      },
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // Update Set commission
  public async updateCommissionSet(req: Request) {
    return this.db.transaction(async (trx) => {
      const { name, add, update } = req.body as IUpdateCommissionSetReqBody;
      const { id } = req.params;
      const commissionSetModel = this.Model.commissionSetModel(trx);

      const checkComSet = await commissionSetModel.getSingleCommissionSet(
        Number(id)
      );

      if (!checkComSet.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (name) {
        await commissionSetModel.updateCommissionSet({ name }, Number(id));
      }

      if (add) {
        for (const item of add) {
          const checkSetFlightApi = await commissionSetModel.getSetFlightAPI({
            set_id: Number(id),
            api_id: item,
          });

          if (checkSetFlightApi.length) {
            throw new CustomError(
              `Api id ${item} already exist with this set`,
              this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
            );
          }

          await commissionSetModel.createSetFlightAPI({
            api_id: item,
            set_id: Number(id),
          });
        }
      }

      if (update) {
        for (const item of update) {
          const { id, status } = item;
          await commissionSetModel.updateSetFlightAPI({ status }, id);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  //upsert btoc commission
  public async upsertBtoCCommission(req: Request) {
    const model = this.Model.commissionSetModel();
    const { commission_set_id } = req.body;
    await model.upsertBtoCCommission({ commission_set_id });
    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get btoc commission
  public async getBtoCCommission(req: Request) {
    const model = this.Model.commissionSetModel();
    const data = await model.getBtoCCommission();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data,
    };
  }
}
