import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import TourPackageBookingValidatorBTOC from "../utils/validators/tourPackage.validator";
import TourPackageBookingBTOCService from "../services/tourpackageBookingBTOC.service";

export class tourPackageBookingBTOController extends AbstractController {
  private service = new TourPackageBookingBTOCService();
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
    {},
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getMyBookingHistory(req);
      res.status(code).json(rest);
    }
  );
  
  //get single booking history
  public getSingleBookingInfo = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleBookingInfo(req);
      res.status(code).json(rest);
    }
  );
}
