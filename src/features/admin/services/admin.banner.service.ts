import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";

export class AdminBannerServie extends AbstractServices {
  private model;
  constructor() {
    super();
    this.model = this.Model.adminModel();
  }

  //upload Banner Images
  public async uploadBannerImage(req: Request) {
    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length == 0) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };
    }
    const length = files?.length;
    for (var i = 0; i < length; i++) {
      const banner_image = files[i]?.filename;
      const uploadedBannerImage = await this.model.uploadBannerImage({
        banner_image: banner_image,
      });
      if (!uploadedBannerImage) return { success: false };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  // Get All The Banner Images
  public async getBannerImage(req: Request) {
    const getAllBannerImage = await this.model.getBannerImage();
    if (!getAllBannerImage)
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: getAllBannerImage,
    };
  }

  // Toggle Image Status
  public async updateImageStatus(req: Request, id: number) {
    const updated = await this.model.updateImageStatus(id);

    if (!updated)
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.STATUS_CANNOT_CHANGE,
      };

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
