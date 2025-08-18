import AbstractController from "../../../abstract/abstract.controller";
import { AdminBannerServie } from "../services/admin.banner.service";
import { Request, Response } from "express";

export class AdminBannerController extends AbstractController {
  private bannerService = new AdminBannerServie();

  constructor() {
    super();
  }

  //Upload banner Image
  public uploadBanner = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.bannerService.uploadBannerImage(req);

      res.status(Number(code)).json(data);
    }
  );

  //Get banner Image
  public getBannerImage = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.bannerService.getBannerImage(req);
      res.status(Number(code)).json(data);
    }
  );

  // Update Image
  public updateImageStatus = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const ID = Number(id);

      const { code, ...data } = await this.bannerService.updateImageStatus(
        req,
        ID
      );

      res.status(Number(code)).json(data);
    }
  );
}
