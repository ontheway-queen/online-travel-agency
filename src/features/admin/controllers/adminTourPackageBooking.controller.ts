import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { TourPackageValidator } from "../utils/validators/tourPackage.validator";
import TourPackageBookingValidatorBTOC from "../../b2c/utils/validators/tourPackage.validator";
import { AdminTourPackageBookingService } from "../services/adminTourPackageBooking.service";

export class AdminTourPackageBookingController extends AbstractController {
  private services = new AdminTourPackageBookingService();
  private validator = new TourPackageValidator();
  private btoCValidator = new TourPackageBookingValidatorBTOC();
  constructor() {
    super();
  }

  // get all tour package booking list
  public getAllTourPackageBooking = this.asyncWrapper.wrap(
    { querySchema: this.validator.tourPackageBookingFilterQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAllTourPackageBooking(
        req
      );

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  //get single tour package booking info
  public getSingleTourPackageBookingInfo = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleBookingInfo(req);
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
  //update tour package booking
  public updateTourPackage = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.btoCValidator.tourPackageBookingUpdate,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateTourPackage(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // get all tour package booking list b2b
  public getAllTourPackageBookingB2B = this.asyncWrapper.wrap(
    { querySchema: this.validator.tourPackageBookingFilterQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAllTourPackageBookingB2B(
        req
      );

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  //get single tour package booking info b2b
  public getSingleBookingInfoB2B = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleBookingInfoB2B(
        req
      );
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
  //update tour package booking b2b
  public updateTourPackageB2B = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.btoCValidator.tourPackageBookingUpdateB2B,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateTourPackageB2B(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
}
