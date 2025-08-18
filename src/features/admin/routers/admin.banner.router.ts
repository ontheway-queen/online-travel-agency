import AbstractRouter from "../../../abstract/abstract.router";
import { AdminBannerController } from "../controllers/admin.banner.controller";

export class AdminBannerRouter extends AbstractRouter {
  private bannerController;
  constructor() {
    super();
    this.bannerController = new AdminBannerController();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.COMMON_FILES),
        this.bannerController.uploadBanner
      )
      .get(this.bannerController.getBannerImage);

    this.router.route("/:id").patch(this.bannerController.updateImageStatus);
  }
}
