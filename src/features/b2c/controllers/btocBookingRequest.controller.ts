import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import MultiAPIFlightValidator from '../utils/validators/b2cFlight.validator';
import BookingRequestService from '../services/btocBookingRequest.servcie';

export default class BookingRequestController extends AbstractController {
  private services = new BookingRequestService();
  private validator = new MultiAPIFlightValidator();
  constructor() {
    super();
  }

  // flight booking req
  public flightBookingRequest = this.asyncWrapper.wrap(
    { bodySchema: this.validator.flightBookingSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.flightBookingRequest(req);
      res.status(code).json(rest);
    }
  );

  // get flight booking req
  public getBookingReqList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getBookingReqList(req);
      res.status(code).json(rest);
    }
  );

  // get flight booking req
  public getBookingReqSingle = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getBookingReqSingle(req);
      res.status(code).json(rest);
    }
  );

}
