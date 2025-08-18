import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

export class AdminAnnouncementService extends AbstractServices {
  private model = this.Model.announcementModel();

  constructor() {
    super();
  }

  //get all announcement
  public async getAllAnnouncement(req: Request) {
    const { isActive } = req.query as unknown as { isActive: boolean };
    const announcement = await this.model.getAllAnnouncementBar({ isActive });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: announcement || [],
    };
  }

  //get single announcement
  public async createAnnouncement(req: Request) {
    const payload = req.body;
    await this.model.createAnnouncementBar(payload);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get single announcement
  public async getSingleAnnoucement(req: Request) {
    const { id } = req.params;

    const announcement = await this.model.getSingeAnnouncementBar(Number(id));

    if (!announcement) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: 'No announcement found',
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: announcement,
    };
  }

  //update announcement
  public async updateAnnouncement(req: Request) {
    const { id } = req.params;
    const payload = req.body;

    const announcement = await this.model.getSingeAnnouncementBar(Number(id));
    // console.log(announcement)
    if (!announcement) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: 'No announcement found',
      };
    }
    await this.model.updateAnnouncementBar(payload, Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Announcement updated successfully',
    };
  }

  //delete announcement
  public async deleteAnnouncement(req: Request) {
    const { id } = req.params;

    const announcement = await this.model.getSingeAnnouncementBar(Number(id));

    if (!announcement) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: 'No announcement found to delete',
      };
    }

    await this.model.deleteAnnouncementBar(Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Announcement deleted successfully',
    };
  }
}
