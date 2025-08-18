import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import TourPackageBookingValidatorBTOC from '../../b2c/utils/validators/tourPackage.validator';
import TourPackageBookingBTOBService from '../services/tourpackageBookingBTOB.service';

export class tourPackageBookingBTOController extends AbstractController {
  private service = new TourPackageBookingBTOBService();
  private validator = new TourPackageBookingValidatorBTOC();

  //create tour package booking
  public createTourPackageBooking = this.asyncWrapper.wrap(
    { bodySchema: this.validator.tourPackageBooking },

    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createTourPackageBooking(
        req
      );
      res.status(code).json(rest);
    }
  );


  //get my booking history
  public getMyBookingHistory = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getMyBookingHistory(req);
      res.status(code).json(rest);
    }
  );


  //get single booking history
  public getSingleBookingInfo = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator('id') },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleBookingInfo(req);
      res.status(code).json(rest);
    }
  );
}
