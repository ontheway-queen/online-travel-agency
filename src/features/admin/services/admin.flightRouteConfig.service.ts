import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { IInsertSetRoutesCommissionPayload } from '../../../utils/interfaces/common/commissionAirlinesRoutesInterface';

export class AdminFlightRouteConfigService extends AbstractServices {
  constructor() {
    super();
  }

  // Create routes commission
  public async createRoutesCommission(req: Request) {
    const { routes } = req.body as {
      routes: {
        departure: string;
        arrival: string;
        airline?: string; // optional
        commission: number;
        com_type: 'PER' | 'FLAT'; // PER, FLAT
        com_mode: 'INCREASE' | 'DECREASE'; // INCREASE, DECREASE
        one_way: boolean;
        round_trip: boolean;
      }[];
    };
    const { id: commission_set_id } = req.params;
    const flightConfigModel = this.Model.flightRouteConfigModel();
    const commissionSetModel = this.Model.commissionSetModel();

    const checkSetCommission = await commissionSetModel.getSingleCommissionSet(
      Number(commission_set_id)
    );

    if (!checkSetCommission.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const payload: IInsertSetRoutesCommissionPayload[] = routes.map((item) => {
      return {
        ...item,
        commission_set_id: Number(commission_set_id),
      };
    });

    await flightConfigModel.insertSetRoutesCommission(payload);

    return {
      status: true,
      message: this.ResMsg.HTTP_SUCCESSFUL,
      code: this.StatusCode.HTTP_SUCCESSFUL,
    };
  }

  // Get routes commission
  public async getRoutesCommission(req: Request) {
    const query = req.query;
    const { id: commission_set_id } = req.params;
    const flightConfigModel = this.Model.flightRouteConfigModel();

    const { data, total } = await flightConfigModel.getSetRoutesCommission({
      ...query,
      commission_set_id: Number(commission_set_id),
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  // Update routes commission
  public async updateRoutesCommission(req: Request) {
    const body = req.body;
    const { commission_set_id, id } = req.params;
    const flightConfigModel = this.Model.flightRouteConfigModel();
    await flightConfigModel.updateSetRoutesCommission(
      body,
      Number(id),
      Number(commission_set_id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // Delete routes commission
  public async deleteRoutesCommission(req: Request) {
    const { commission_set_id, id } = req.params;
    const flightConfigModel = this.Model.flightRouteConfigModel();
    await flightConfigModel.deleteSetRoutesCommission(
      Number(id),
      Number(commission_set_id)
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // Insert block route
  public async insertBlockRoute(req: Request) {
    const { routes } = req.body;
    const flightConfigModel = this.Model.flightRouteConfigModel();

    await flightConfigModel.insertBlockRoute(routes);

    return {
      status: true,
      message: this.ResMsg.HTTP_SUCCESSFUL,
      code: this.StatusCode.HTTP_SUCCESSFUL,
    };
  }

  // Get block routes
  public async getBlockRoutes(req: Request) {
    const query = req.query;
    const flightConfigModel = this.Model.flightRouteConfigModel();

    const { data, total } = await flightConfigModel.getBlockRoute(query);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  // Update block routes
  public async updateBlockRoutes(req: Request) {
    const { id } = req.params;
    const body = req.body;
    const flightConfigModel = this.Model.flightRouteConfigModel();
    await flightConfigModel.updateBlockRoute(body, Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // Delete block routes
  public async deleteBlockRoutes(req: Request) {
    const { id } = req.params;
    const flightConfigModel = this.Model.flightRouteConfigModel();
    await flightConfigModel.deleteBlockRoute(Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
