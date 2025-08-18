import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { PublicAIService } from '../services/publicAI.service';

class PublicAIController extends AbstractController {
  private service = new PublicAIService();

  constructor() {
    super();
  }

  public getPassportDetails = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPassportDetails(req);
      res.status(code).json(data);
    }
  );

}

export default PublicAIController;
