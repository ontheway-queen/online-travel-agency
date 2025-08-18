import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import TourPackageBookingValidatorBTOC from "../../b2c/utils/validators/tourPackage.validator";
import { AdminUmrahPackageBookingService } from "../services/adminUmrahPackageBooking.service";
import { UmrahPackageValidator } from "../utils/validators/admin.umrahpackage.validator";

export class AdminUmrahPackageBookingController extends AbstractController {
  private services = new AdminUmrahPackageBookingService();
  private validator = new UmrahPackageValidator();
  private btoCValidator = new TourPackageBookingValidatorBTOC();
  constructor() {
    super();
  }

  // get all tour package booking list
  public getAllUmrahPackageBooking = this.asyncWrapper.wrap(
    { querySchema: this.validator.umrahPackageBookingFilterQueryValidator },
    // null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAllUmrahPackageBooking(
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
  public getSingleUmrahPackageBookingInfo = this.asyncWrapper.wrap(
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
  public updateUmrahPackage = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.umrahPackageBookingUpdate
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateUmrahPackage(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // get all tour package booking list b2b
  // public getAllUmrahPackageBookingB2B = this.asyncWrapper.wrap(
  //   // { querySchema: this.validator.tourPackageBookingFilterQueryValidator },
  //   null,
  //   async (req: Request, res: Response) => {
  //     const { code, ...rest } = await this.services.getAllTourPackageBookingB2B(
  //       req
  //     );

  //     if (rest.success) {
  //       res.status(code).json(rest);
  //     } else {
  //       this.error(rest.message, code);
  //     }
  //   }
  // );

  //get single tour package booking info b2b
  // public getSingleBookingInfoB2B = this.asyncWrapper.wrap(
  //   { paramSchema: this.commonValidator.singleParamStringValidator("id") },
  //   async (req: Request, res: Response) => {
  //     const { code, ...rest } = await this.services.getSingleBookingInfoB2B(
  //       req
  //     );
  //     if (rest.success) {
  //       res.status(code).json(rest);
  //     } else {
  //       this.error(rest.message, code);
  //     }
  //   }
  // );
  //update tour package booking b2b
  // public updateUmrahPackageB2B = this.asyncWrapper.wrap(
  //   {
  //     paramSchema: this.commonValidator.singleParamValidator,
  //     bodySchema: this.btoCValidator.tourPackageBookingUpdate,
  //   },
  //   async (req: Request, res: Response) => {
  //     const { code, ...rest } = await this.services.updateTourPackageB2B(req);

  //     if (rest.success) {
  //       res.status(code).json(rest);
  //     } else {
  //       this.error(rest.message, code);
  //     }
  //   }
  // );
}
