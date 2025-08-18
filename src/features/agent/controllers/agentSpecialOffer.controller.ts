import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import SpecialOfferBToCService from "../services/speciaOfferBToB.service";


class SpecialOfferBToCController extends AbstractController {
  private service = new SpecialOfferBToCService();

  constructor() {
    super();
  }

  //  get all special offers
  public getSpecialOffers = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSpecialOffers(req);

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
}
export default SpecialOfferBToCController;
