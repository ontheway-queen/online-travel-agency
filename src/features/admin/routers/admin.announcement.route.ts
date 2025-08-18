import AbstractRouter from "../../../abstract/abstract.router";
import { AdminAnnouncementController } from "../controllers/admin.announcement.controller";

export class AdminAnnouncementRouter extends AbstractRouter {
  private announcementController = new AdminAnnouncementController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      //get all
      .get(this.announcementController.getAllAnnouncement)
      //create announcement
      .post(this.announcementController.createAnnouncement);

    //get single
    this.router
      .route("/:id")
      //get single
      .get(this.announcementController.getSingleAnnouncement)
      //update
      .patch(this.announcementController.updateAnnouncement)
      //delete
      .delete(this.announcementController.deleteAnnouncement);
  }
}
