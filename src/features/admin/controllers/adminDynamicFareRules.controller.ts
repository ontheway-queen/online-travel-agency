import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminDynamicFareRulesValidator } from '../utils/validators/adminDynamicFareRules.validator';
import AdminDynamicFareRulesService from '../services/adminDynamicFareRules.service';

class AdminDynamicFareRulesController extends AbstractController {
  private service = new AdminDynamicFareRulesService();
  private validator = new AdminDynamicFareRulesValidator();

  constructor() {
    super();
  }

  public createSet = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSet },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSet(req);
      res.status(code).json(data);
    }
  );

  public getSets = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSets(req);
      res.status(code).json(data);
    }
  );

  public updateSet = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSet,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSet(req);
      res.status(code).json(data);
    }
  );

  public deleteSet = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSet(req);
      res.status(code).json(data);
    }
  );

  public cloneSet = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.cloneSet
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.cloneSet(req);
      res.status(code).json(data);
    }
  );

  public getSupplierList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSupplierList(req);
      res.status(code).json(data);
    }
  );

  public createSupplier = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSupplier },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSupplier(req);
      res.status(code).json(data);
    }
  );

  public getSuppliers = this.asyncWrapper.wrap(
    { querySchema: this.validator.getSupplier },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSuppliers(req);
      res.status(code).json(data);
    }
  );

  public updateSupplier = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSupplier,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSupplier(req);
      res.status(code).json(data);
    }
  );

  public deleteSupplier = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSupplier(req);
      res.status(code).json(data);
    }
  );

  public createSupplierAirlinesFare = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createSupplierAirlinesFare,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSupplierAirlinesFare(
        req
      );
      res.status(code).json(data);
    }
  );

  public getSupplierAirlinesFares = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getSupplierAirlinesFare,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSupplierAirlinesFares(
        req
      );
      res.status(code).json(data);
    }
  );

  public updateSupplierAirlinesFare = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSupplierAirlinesFare,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateSupplierAirlinesFare(
        req
      );
      res.status(code).json(data);
    }
  );

  public deleteSupplierAirlinesFare = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteSupplierAirlinesFare(
        req
      );
      res.status(code).json(data);
    }
  );

  public createFareTax = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createFareTax,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createFareTax(req);
      res.status(code).json(data);
    }
  );

  public getFareTaxes = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getFareTax,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFareTaxes(req);
      res.status(code).json(data);
    }
  );

  public updateFareTax = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateFareTax,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateFareTax(req);
      res.status(code).json(data);
    }
  );

  public deleteFareTax = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteFareTax(req);
      res.status(code).json(data);
    }
  );

  // upsert btoc set Commission
  public upsertBtoCCommission = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.upsertBtoCSetSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.upsertBtoCCommission(req);
      res.status(code).json(data);
    }
  );

  // get btoc set Commission
  public getBtoCCommission = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getBtoCCommission(req);
      res.status(code).json(data);
    }
  );
}

export default AdminDynamicFareRulesController;
