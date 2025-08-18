import { Request, Response } from "express";
import AbstractController from "../../../../abstract/abstract.controller";
import AdminAgentFlightService from "../../services/adminAgentServices/adminAgentFlight.service";
import { AdminAgentFlightValidator } from "../../utils/validators/adminAgentValidators/adminAgentFlight.validator";

export default class AdminAgentFlightController extends AbstractController {
  private services = new AdminAgentFlightService();
  private validator = new AdminAgentFlightValidator();
  constructor() {
    super();
  }

  // flight booking cancel
  public flightBookingCancel = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.flightBookingCancel(req);
      res.status(code).json(rest);
    }
  );

  // get booking list
  public getBookingList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getBookingList(req);
      res.status(code).json(rest);
    }
  );

  // get booking single
  public getBookingSingle = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getBookingSingle(req);
      res.status(code).json(rest);
    }
  );

  // ticket issue
  public ticketIssue = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.ticketIssue(req);
      res.status(code).json(rest);
    }
  );

  // reminder to issue ticket
  public reminderBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.reminderBooking(req);
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
      const { code, ...rest } = await this.services.updateBooking(req);
      res.status(code).json(rest);
    }
  );

  //get pending ticket issuance list
  public getPendingTicketIssuance = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getPendingTicketIssuance(
        req
      );
      res.status(code).json(rest);
    }
  );
  //update pending ticket issuance
  public updateTicketIssuance = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updatePendingTicketIssuance,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateTicketIssuance(req);
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
      const { code, ...rest } = await this.services.updateBlockedBooking(req);
      res.status(code).json(rest);
    }
  );

  //pnr share
  public pnrShare = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.pnrShare,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.pnrShare(req);
      res.status(code).json(rest);
    }
  );

  // get pnr details
  public getPnrDetails = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.PnrDetails,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getPnrDetails(req);
      res.status(code).json(rest);
    }
  );

  //Manual booking
  public manualBooking = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.manualBookingSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.manualBooking(req);
      res.status(code).json(rest);
    }
  );

  //refetch
  public fetchDataFromAPI = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.fetchDataFromAPI(req);
      res.status(code).json(rest);
    }
  );

  //refetch
  public editBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.editBookingInfo,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.editBooking(req);
      res.status(code).json(rest);
    }
  );

  //send mail
  public sendBookingMail = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.sendBookingMail(req);
      res.status(code).json(rest);
    }
  );
}
