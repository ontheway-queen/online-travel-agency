import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminConfigService from "../services/admin.config.service";
import AdminConfigValidator from "../utils/validators/admin.config.validator";

class AdminConfigController extends AbstractController {
  private service = new AdminConfigService();
  private AdministrationValidator = new AdminConfigValidator();

  constructor() {
    super();
  }

  //create city
  public createCity = this.asyncWrapper.wrap(
    { bodySchema: this.AdministrationValidator.createCityValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createCity(
        req
      );
      res.status(code).json(data);
    }
  );

  //insert visa type
  public insertVisaType = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertVisaType(
        req
      );
      res.status(code).json(data);
    }
  );

  //get all visa type
  public getAllVisaType = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllVisaType(
        req
      );
      res.status(code).json(data);
    }
  );

  //delete visa type
  public deleteVisaType = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteVisaType(
        req
      );
      res.status(code).json(data);
    }
  );

  //insert visa mode
  public insertVisaMode = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertVisaMode(
        req
      );
      res.status(code).json(data);
    }
  );

  //get all visa mode
  public getAllVisaMode = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllVisaMode(
        req
      );
      res.status(code).json(data);
    }
  );

  //delete visa mode
  public deleteVisaMode = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteVisaMode(
        req
      );
      res.status(code).json(data);
    }
  );

  //get notification
  public getNotification = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getNotification(
        req
      );
      res.status(code).json(data);
    }
  );

  //insert notification seen
  public insertNotificationSeen = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertNotificationSeen(
        req
      );
      res.status(code).json(data);
    }
  );

  //get error logs
  public getErrorLogs = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getErrorLogs(
        req
      );
      res.status(code).json(data);
    }
  );

  //get audit trail
  public getAuditTrail = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAuditTrail(
        req
      );
      res.status(code).json(data);
    }
  );

  //get search history
  public getSearchHistory = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSearchHistory(
        req
      );
      res.status(code).json(data);
    }
  );

  //insert airlines
  public insertAirlines = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.insertAirlines },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertAirlines(req);
      res.status(code).json(data);
    }
  );

  //update airlines
  public updateAirlines = this.asyncWrapper.wrap(
    {
      bodySchema: this.commonValidator.updateAirlines,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAirlines(req);
      res.status(code).json(data);
    }
  );

  //delete airlines
  public deleteAirlines = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAirlines(req);
      res.status(code).json(data);
    }
  );

  //insert airport
  public insertAirport = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.createAirportSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.insertAirport(req);
      res.status(code).json(data);
    }
  );

  //get all airport
  public getAllAirport = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.airportFilterSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAirport(req);
      res.status(code).json(data);
    }
  );

  //update airport
  public updateAirport = this.asyncWrapper.wrap(
    {
      bodySchema: this.commonValidator.updateAirportSchema,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAirport(req);
      res.status(code).json(data);
    }
  );

  //delete airport
  public deleteAirport = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAirport(req);
      res.status(code).json(data);
    }
  );
}

export default AdminConfigController;
