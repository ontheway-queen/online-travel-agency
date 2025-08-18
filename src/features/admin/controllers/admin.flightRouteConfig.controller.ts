import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminFlightRouteConfigService } from '../services/admin.flightRouteConfig.service';
import AdminFlightRouteConfigValidator from '../utils/validators/admin.fightRouteConfig.validator';

export class AdminFlightRouteConfigController extends AbstractController {
  private services = new AdminFlightRouteConfigService();
  private validators = new AdminFlightRouteConfigValidator();
  constructor() {
    super();
  }

  // Create routes commission controller
  public createRoutesCommission = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validators.createRoutesCommissionSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createRoutesCommission(req);
      res.status(code).json(rest);
    }
  );

  // Get routes commission controller
  public getRoutesCommission = this.asyncWrapper.wrap(
    { querySchema: this.validators.getRoutesCommissionSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getRoutesCommission(req);
      res.status(code).json(rest);
    }
  );

  // Update routes commission controller
  public updateRoutesCommission = this.asyncWrapper.wrap(
    {
      bodySchema: this.validators.updateRoutesCommissionSchema,
      paramSchema: this.validators.updateDeleteRoutesCommissionParamsSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateRoutesCommission(req);
      res.status(code).json(rest);
    }
  );

  // Delete routes commission controller
  public deleteRoutesCommission = this.asyncWrapper.wrap(
    { paramSchema: this.validators.updateDeleteRoutesCommissionParamsSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.deleteRoutesCommission(req);
      res.status(code).json(rest);
    }
  );

  // Create routes block controller
  public createRoutesBlock = this.asyncWrapper.wrap(
    { bodySchema: this.validators.createRoutesBlockSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.insertBlockRoute(req);
      res.status(code).json(rest);
    }
  );

  // Get routes block controller
  public getRoutesBlock = this.asyncWrapper.wrap(
    { querySchema: this.validators.getRoutesBlockSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getBlockRoutes(req);
      res.status(code).json(rest);
    }
  );

  // Update routes block controller
  public updateRoutesBlock = this.asyncWrapper.wrap(
    {
      bodySchema: this.validators.updateRoutesBlockSchema,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateBlockRoutes(req);
      res.status(code).json(rest);
    }
  );

  // Delete routes block controller
  public deleteRoutesBlock = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.deleteBlockRoutes(req);
      res.status(code).json(rest);
    }
  );
}
