import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";

class SpecialOfferBToCService extends AbstractServices {
  // get all speacial offers
  public async getSpecialOffers(req: Request) {
    const model = this.Model.specialOfferModel();

    const { key, limit, skip, type, status } = req.query as unknown as {
      key?: string;
      limit?: number;
      skip?: number;
      type?: string;
      status?: string;
    };

    const { data, total } = await model.getSpecialOffers({
      key,
      limit,
      skip,
      type,
      status: "ACTIVE",
      panel: ["B2B", "ALL"],
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  // get single speacial offer
  public async getSingleSpecialOffer(req: Request) {
    const { id } = req.params;
    const model = this.Model.specialOfferModel();

    const single_offer = await model.getSingleSpecialOffer({ id: Number(id), panel: ["B2B", "ALL"] });

    if (!single_offer.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: single_offer[0],
    };
  }
}

export default SpecialOfferBToCService;
