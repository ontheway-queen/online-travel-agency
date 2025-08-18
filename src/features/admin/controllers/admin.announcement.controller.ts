import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { AdminAnnouncementService } from "../services/admin.announcement.service";
import { AdminAnnouncementValidator } from "../utils/validators/admin.announcement.validator";

export class AdminAnnouncementController extends AbstractController {
  private service = new AdminAnnouncementService();
  private validator = new AdminAnnouncementValidator();

  // get all announcement
  public getAllAnnouncement = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAnnouncement(req);
      res.status(code).json(data);
    }
  );

  // create announcement
  public createAnnouncement = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAnnouncementSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAnnouncement(req);
      res.status(code).json(data);
    }
  );

  // get single announcement
  public getSingleAnnouncement = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleAnnoucement(req);
      res.status(code).json(data);
    }
  );

  //update announcement
  public updateAnnouncement = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateAnnouncementSchema,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAnnouncement(req);
      res.status(code).json(data);
    }
  );

  //delete announcement
  public deleteAnnouncement = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAnnouncement(req);
      res.status(code).json(data);
    }
  );
}
