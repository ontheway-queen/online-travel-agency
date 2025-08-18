import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminAirlinesPreferenceValidator } from '../utils/validators/adminAirlinesPreference.validator';
import { AdminAirlinesPreferenceService } from '../services/adminAirlinesPreference.service';

export default class AdminAirlinesPreferenceController extends AbstractController {
  private service = new AdminAirlinesPreferenceService();
  private validator = new AdminAirlinesPreferenceValidator();

  constructor() {
    super();
  }

  public createAirlinePreference = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAirlinePref,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAirlinePreference(req);
      res.status(code).json(data);
    }
  );

  public getAirlinesPreferences = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getAirlinePref,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAirlinesPreferences(req);
      res.status(code).json(data);
    }
  );

  public updateAirlinePreference = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateAirlinePref,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAirlinePreference(req);
      res.status(code).json(data);
    }
  );

  public deleteAirlinePreference = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteAirlinePreference(req);
      res.status(code).json(data);
    }
  );
}
