import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import UmrahPackageBookingBTOBService from '../services/umrahPackageBookingBTOB.service';
import { BookingUmrahPackageValidator } from '../../b2c/utils/validators/bookingUmrahPackage.validator';

export class UmrahPackageBookingBTOController extends AbstractController {
  private service = new UmrahPackageBookingBTOBService();
  private validator = new BookingUmrahPackageValidator();

  //create tour package booking
  public createUmrahPackageBooking = this.asyncWrapper.wrap(
    { bodySchema: this.validator.umrahPackageBookingBodySchema },

    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createUmrahPackageBooking(
        req
      );
      res.status(code).json(rest);
    }
  );


  //get my booking history
  public getAgencyBookingHistory = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAgencyBookingHistory(req);
      res.status(code).json(rest);
    }
  );


  //get single booking history
  public getSingleBookingInfo = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator('id') },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleBooking(req);
      res.status(code).json(rest);
    }
  );
}
