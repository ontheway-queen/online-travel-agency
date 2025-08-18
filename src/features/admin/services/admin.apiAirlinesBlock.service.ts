import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export class AdminApiAirlinesBlockService extends AbstractServices {
  constructor() {
    super();
  }

  //create
  public async create(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const model = this.Model.apiAirlinesBlockModel(trx);
      const body = req.body;
      const exists = await model.checkEntryExists(
        body.airline,
        body.set_flight_api_id
      );
      if (exists) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            "One or more airlines already have an entry for this flight API ID",
        };
      }
      const insertData = body.airline.map((airline: string) => ({
        airline,
        set_flight_api_id: body.set_flight_api_id,
        created_by: id,
        issue_block: body.issue_block,
        booking_block: body.booking_block,
      }));

      const res = await model.insert(insertData);
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //get all
  public async get(req: Request) {
    const { id } = req.params;
    const model = this.Model.apiAirlinesBlockModel();
    const query = req.query;
    const data = await model.get({ ...query, set_flight_api_id: Number(id) });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //update
  public async update(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const model = this.Model.apiAirlinesBlockModel(trx);
      const body = req.body;
      body.updated_at = new Date();
      body.updated_by = id;
      const { id: block_id } = req.params;
      await model.update(body, Number(block_id));

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  //delete
  public async delete(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const model = this.Model.apiAirlinesBlockModel(trx);
      const { id: block_id } = req.params;
      await model.delete(Number(block_id));
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
