import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import SpecialOfferService from "../services/specialOffer.service";
import SpecialOfferValidator from "../utils/validators/specialOffer.validator";


class SpecialOfferController extends AbstractController {
  private service = new SpecialOfferService();
  private validator = new SpecialOfferValidator();

  constructor() {
    super();
  }

  // create special offer
  public createSpecialOffer = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createSpecialOffer },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createSpecialOffer(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  //  get all special offers
  public getSpecialOffers = this.asyncWrapper.wrap(
    { querySchema: this.validator.getSpecialOfferQuery },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSpecialOffers(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // update special offers
  public updateSpecialOffer = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateSpecialOffer,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateSpecialOffer(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // get single special offer
  public getSingleSpecialOffer = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleSpecialOffer(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // delete signle special offer
  public deleteSingleSpecialOffer = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.deleteSingleSpecialOffer(
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
export default SpecialOfferController;
