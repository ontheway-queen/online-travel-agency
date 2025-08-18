import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";

class SpecialOfferService extends AbstractServices {
  // create special offers
  public async createSpecialOffer(req: Request) {
    return this.db.transaction(async () => {
      const { id } = req.admin;
      const model = this.Model.specialOfferModel();
      const body = req.body;
      const files = (req.files as Express.Multer.File[]) || [];
      body.created_by = id;
  
      // Ensure files array length doesn't exceed 2
      if (files.length > 1) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Only one image or one video file are allowed",
        };
      }
  
      for (const file of files) {
        if (file.fieldname === "photo") {
          // Validate image file
          body["photo"] = file.filename; // Store image filename in the database
        } else if (file.fieldname === "video") {
          // Validate video file
          body["video"] = file.filename; // Store video filename in the database
        } else {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: `Unknown file field name: ${file.fieldname}`,
          };
        }
      }
  
      const res = await model.insertSpecialOffer(body);
  
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: res[0].id,
        },
      };
    });
  }

  public async updateSpecialOffer(req: Request) {
    return this.db.transaction(async () => {
      const { id } = req.params;
      const body = req.body;
      const files = (req.files as Express.Multer.File[]) || [];
      const model = this.Model.specialOfferModel();

      const single_offer = await model.getSingleSpecialOffer({
        id: Number(id),
      });

      if (!single_offer.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (files.length > 1) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "file can not be greater than 1",
        };
      }

      if (files.length === 1) {
        const file = files[0];
        if (file.fieldname === "photo") {
          body["photo"] = file.filename;
        }else if(file.fieldname === "video") {
          body["video"] = file.filename;
        } else {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "unknown file name",
          };
        }
      }

      const res = await model.updateSpecialOffer({ id: Number(id) }, body);

      if (files.length > 0) {
        const file = files[0];
        const photo = single_offer[0].photo;

        if (file.fieldname === "photo" && photo) {
          this.manageFile.deleteFromCloud([photo]);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          id,
        },
      };
    });
  }

  // get all speacial offers
  public async getSpecialOffers(req: Request) {
    const model = this.Model.specialOfferModel();

    const { key, limit, skip, type, status, panel } = req.query as unknown as {
      key?: string;
      limit?: number;
      skip?: number;
      type?: string;
      status?: string;
      panel?: string;
    };

    const { data, total } = await model.getSpecialOffers({
      key,
      limit,
      skip,
      type,
      status,
      panel
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total,
      data,
      
    };
  }

  // get single speacial offer
  public async getSingleSpecialOffer(req: Request) {
    const { id } = req.params;
    const model = this.Model.specialOfferModel();

    const single_offer = await model.getSingleSpecialOffer({ id: Number(id) });

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

  // delete single special offer
  public async deleteSingleSpecialOffer(req: Request) {
    const { id } = req.params;
    const model = this.Model.specialOfferModel();

    const single_offer = await model.getSingleSpecialOffer({ id: Number(id) });

    if (!single_offer.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const res = await model.deleteSingleSpecialOffer({ id: Number(id) });

    if (res.length) {
      if (single_offer[0].photo) {
        this.manageFile.deleteFromCloud([single_offer[0].photo]);
      }
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        id,
      },
    };
  }
}

export default SpecialOfferService;
