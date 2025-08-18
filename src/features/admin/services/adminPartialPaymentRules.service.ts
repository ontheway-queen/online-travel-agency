import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";

export class AdminPartialPaymentRuleService extends AbstractServices {

  public async create(req: Request) {
    return await this.db.transaction(async (trx) => {
      const {
        flight_api_id,
        airline,
        from_dac,
        to_dac,
        one_way = true,
        round_trip = true,
        travel_date_from_now,
        payment_percentage,
        domestic,
        soto,
        payment_before,
        note
      } = req.body;
      const { id: user_id } = req.admin;

      const model = this.Model.PartialPaymentRuleModel(trx);



      const res = await model.create({
        flight_api_id,
        airline,
        from_dac,
        to_dac,
        one_way,
        round_trip,
        travel_date_from_now,
        payment_percentage,
        created_by: user_id,
        domestic,
        soto,
        payment_before,
        note
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Partial payment rule has been created",
        data: {
          id: res[0]?.id,
        },
      };
    });
  }

  public async getAll(req: Request) {
    const query = req.query;
    const model = this.Model.PartialPaymentRuleModel();
    const data = await model.getAll(query, true);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  public async update(req: Request) {
    const model = this.Model.PartialPaymentRuleModel();
    const { id } = req.params;
    const body = req.body;

    const rule = await model.getSingle(Number(id));
    if (!rule.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }



    await model.update(body, Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Partial payment rule has been updated",
    };
  }

  public async delete(req: Request) {
    const model = this.Model.PartialPaymentRuleModel();
    const { id } = req.params;

    const rule = await model.getSingle(Number(id));
    if (!rule.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    await model.delete(Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Partial payment rule has been deleted",
    };
  }

  public async getFlightAPIs(req: Request) {
    const model = this.Model.apiAirlinesCommissionModel();
    const flightAPIs = await model.getFlightAPI({});

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: flightAPIs,
    };
  }
}
