import AbstractController from '../../../abstract/abstract.controller';
import { TrackingService } from '../services/admin.tracking.service';
import { Request, Response } from 'express';

export class TrackingController extends AbstractController {
  private trackingService = new TrackingService();
  constructor() {
    super();
  }

  // Create Tracking
  public createTracking = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.trackingService.createTracking(req);
      res.status(code).json(data);
    }
  );



  // Update Tracking
  public updateTracking = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.trackingService.updateTracking(req);
      res.status(code).json(data);
    }
  );

  // Get Single Tracking
  public getSingleTracking = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.trackingService.getSingleTracking(
        req
      );
      res.status(code).json(data);
    }
  );
}
