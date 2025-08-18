import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import TourPackageBTOCService from '../services/tourpackageBTOC.service';
import { TourPackageValidator } from '../../admin/utils/validators/tourPackage.validator';
export class tourPackageBTOController extends AbstractController {
  private service = new TourPackageBTOCService();
  private validator = new TourPackageValidator();
  //get all btoc tour package
  public tourPackageList = this.asyncWrapper.wrap(
    null,

    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.tourPackageList(req);
      res.status(code).json(rest);
    }
  );

  //get single btoc tour package
  public singleTourPackage = this.asyncWrapper.wrap(
    { querySchema: this.validator.tourPackageFilterQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleTourPackage(req);
      res.status(code).json(rest);
    }
  );

  //get city name
  public getCityName = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getCityName(req);
      res.status(code).json(data);
    }
  );

  //get country name
  public getCountryName = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getCountryName(req);
      res.status(code).json(data);
    }
  );
}
