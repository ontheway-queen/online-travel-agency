import AbstractController from '../../../abstract/abstract.controller';
import { UmrahPackageService } from '../services/admin.umrahpackage.service';
import { Request, Response } from 'express';
import { UmrahPackageValidator } from '../utils/validators/admin.umrahpackage.validator';

export class UmrahPackageController extends AbstractController {
  private umrahPackageService = new UmrahPackageService();
  private validators = new UmrahPackageValidator();

  constructor() {
    super();
  }

  public createUmrahPackage = this.asyncWrapper.wrap(
    {
      bodySchema: this.validators.createUmrahPackageBodyValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.umrahPackageService.createUmrahPackage(req);
      res.status(Number(code)).json(data);
    }
  );

  public getAllUmrahPackage = this.asyncWrapper.wrap(
    {
      querySchema: this.validators.getAllUmrahPackageQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.umrahPackageService.getAllUmrahPackage(req);
      res.status(Number(code)).json(data);
    }
  );

  public getSingleUmrahPackage = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.umrahPackageService.getSingleUmrahPackage(req);
      res.status(Number(code)).json(data);
    }
  );

  public updateUmrahPackage = this.asyncWrapper.wrap(
    {
      bodySchema: this.validators.updateUmrahPackageBodyValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.umrahPackageService.updateUmrahPackage(req);
      res.status(Number(code)).json(data);
    }
  );

  public getIncludeExcludeItems = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.umrahPackageService.getIncludeExcludeItems(req);
      res.status(code).json(data);
    }
  );

  public createDetailDescription = this.asyncWrapper.wrap(
    {
      bodySchema: this.validators.createDetailDescriptionBodyValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.umrahPackageService.createDetailDescription(req);
      res.status(code).json(data);
    }
  );

  
}
