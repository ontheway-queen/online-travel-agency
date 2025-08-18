import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";

export class TrackingService extends AbstractServices {
  private model;
  constructor() {
    super();
    this.model = this.Model.TrackingModel();
  }

  public async createTracking(req: Request) {
    const { tracking_name, status, tracking_id_1,tracking_id_2 } = req.body;
    const tracking = await this.model.createTraking({
      tracking_name,
      status,
      tracking_id_1,
      tracking_id_2
    });
    if (!tracking)
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  

  public async updateTracking(req: Request) {
    const { id, tracking_name, status, tracking_id_1,tracking_id_2 } = req.body;
    const tracking = await this.model.updateTracking(
      {
        tracking_name,
        status,
        tracking_id_1,
        tracking_id_2,
      },
      id
    );
    if (!tracking)
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async getSingleTracking(req: Request) {
    const { id } = req.params as unknown as { id: number };

    const singleTracking = await this.model.getSingleTracking(id);

    // console.log(singleTracking)

    if (!singleTracking.length)
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data:singleTracking
    };
  }
}
