import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { TourPackageValidator } from '../../admin/utils/validators/tourPackage.validator';
import TourPackageBTOBService from '../services/tourpackageBTOB.service';

export class tourPackageBTOBController extends AbstractController {
  private service = new TourPackageBTOBService();
  private validator = new TourPackageValidator();
  //get all tour package
  public tourPackageList = this.asyncWrapper.wrap(
    null,

    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.tourPackageList(req);
      res.status(code).json(rest);
    }
  );
  //get single tour package
  public singleTourPackage = this.asyncWrapper.wrap(
    { querySchema: this.validator.tourPackageFilterQueryValidator },

    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleTourPackage(req);
      res.status(code).json(rest);
    }
  );
}
