import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import adminFlightBookingService from "../services/flightBooking.service";
import { AdminB2CFlightValidator } from "../utils/validators/adminB2CValidators/adminB2CFlight.validator";
class adminFlightBookingController extends AbstractController {
  private service = new adminFlightBookingService();
  private validator = new AdminB2CFlightValidator();

  constructor() {
    super();
  }

  // get all flight booking
  public getAllFlightBooking = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllFlightBooking(req);

      res.status(code).json(rest);
    }
  );

  // get single flight booking
  public getSingleFlightBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleFlightBooking(req);

      res.status(code).json(rest);
    }
  );

  // issue ticket
  public issueTicket = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.ticketIssue(req);
      res.status(code).json(rest);
    }
  );

  // cancel flight booking
  public cancelFlightBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.cancelFlightBooking(req);

      res.status(code).json(rest);
    }
  );

  // update blocked booking controller
  public updateBlockedBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateBlockedBookingValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateBlockedBooking(req);
      res.status(code).json(rest);
    }
  );

  //update booking
  public updateBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateBooking,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateBooking(req);
      res.status(code).json(rest);
    }
  );


  //refetch
  public fetchDataFromAPI = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.fetchDataFromAPI(req);
      res.status(code).json(rest);
    }
  );

  //edit booking info
  public editBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.editBookingInfo
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.editBooking(req);
      res.status(code).json(rest);
    }
  );

  //send mail
  public sendBookingMail = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.sendBookingMail(req);
      res.status(code).json(rest);
    }
  );


  //Manual booking
  public manualBooking = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.manualBookingSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.manualBooking(req);
      res.status(code).json(rest);
    }
  );

  // get pnr details
  public getPnrDetails = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.PnrDetails,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getPnrDetails(req);
      res.status(code).json(rest);
    }
  );

}
export default adminFlightBookingController;
