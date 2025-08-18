import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import B2CFlightService from '../services/b2cFlight.service';
import B2CFlightValidator from '../utils/validators/b2cFlight.validator';

export default class B2CFlightController extends AbstractController {
  private services = new B2CFlightService();
  private validator = new B2CFlightValidator();
  constructor() {
    super();
  }

  // Search flight
  public flightSearch = this.asyncWrapper.wrap(
    { bodySchema: this.validator.flightSearchSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.flightSearch(req);
      res.status(code).json(rest);
    }
  );

  //flight search using sse
  public FlightSearchSSE = this.asyncWrapper.SSEwrap(
    { querySchema: this.validator.flightSearchSSESchema },
    async (req: Request, res: Response) => {
      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Function to send SSE events
      const sendEvent = (event: string, data: any) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        sendEvent('start', { message: 'Flight search has been started.' });
        // Pass `sendEvent` to your service to enable SSE updates
        await this.services.FlightSearchSSE(req, res);

        // Close the SSE connection when the operation completes
        sendEvent('end', { message: 'Flight search completed successfully.' });
        res.end();
      } catch (error) {
        // Handle errors and notify the client
        sendEvent('error', { message: 'An error occurred during flight search.', error });
        res.end();
      }
    }
  );

  // revalidate flight
  public flightRevalidate = this.asyncWrapper.wrap(
    { querySchema: this.validator.flightRevalidateSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.flightRevalidate(req);
      res.status(code).json(rest);
    }
  );

  // get flight fare rules
  public getFlightFareRule = this.asyncWrapper.wrap(
    { querySchema: this.validator.flightRevalidateSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getFlightFareRule(req);
      res.status(code).json(rest);
    }
  );



  // flight booking (with passport and visa file)
  public flightBooking = this.asyncWrapper.wrap(
    { bodySchema: this.validator.pnrCreateSchemaV2 },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.flightBooking(req);
      res.status(code).json(rest);
    }
  );

  // flight booking cancel
  public flightBookingCancel = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.flightBookingCancel(req);
      res.status(code).json(rest);
    }
  );

  //flight booking list
  public getFlightBookingList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getFlightBookingList(req);
      res.status(code).json(rest);
    }
  );

  //flight booking single
  public getSingleFlightBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleFlightBooking(req);
      res.status(code).json(rest);
    }
  );
}
