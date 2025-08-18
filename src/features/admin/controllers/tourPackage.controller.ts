import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { TourPackageValidator } from "../utils/validators/tourPackage.validator";
import { TourPackageService } from "../services/adminTourPackage.service";
import TourPackageRequestBToCValidator from "../../b2c/utils/validators/tourPackageRequestBToC.validator";

export class TourPackageController extends AbstractController {
  private services = new TourPackageService();
  private validator = new TourPackageValidator();
  private tourPackageRequestValidator = new TourPackageRequestBToCValidator();
  constructor() {
    super();
  }

  // create new tour package controller
  public createTourPackage = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createTourPackageSchemaV2 },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createTourPackageV2(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
  // get all tour packages
  public getAllTourPackage = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAllTourPackage(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
  // get single tour package
  public getSingleTourPackage = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleTourPackage(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  //update single tour package
  public updateTourPackage = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateTourPackageSchemaV2,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateTourPackageV2(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
  //delete single tour package
  public deleteSingleTourPackage = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.deleteTourPackage(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  //  get tour package requests
  public getTourPackageRequest = this.asyncWrapper.wrap(
    { bodySchema: this.tourPackageRequestValidator.getTourPackageRequest },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getTourPackageRequest(req);
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // update tour package request
  public updateTourPackageRequest = this.asyncWrapper.wrap(
    { bodySchema: this.tourPackageRequestValidator.updateTourPackageRequest },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateTourPackageRequest(
        req
      );
      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
}
