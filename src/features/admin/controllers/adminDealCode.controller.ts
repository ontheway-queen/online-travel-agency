import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { AdminDealCodeService } from "../services/adminDealCode.service";
import { AdminDealCodeValidator } from "../utils/validators/adminDealCode.validator";

export class AdminDealCodeController extends AbstractController {
  private service = new AdminDealCodeService();
  private validator = new AdminDealCodeValidator();

  public create = this.asyncWrapper.wrap(
    { bodySchema: this.validator.create },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.create(req);
      res.status(code).json(data);
    }
  );

  public getAll = this.asyncWrapper.wrap(
    { querySchema: this.validator.get },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAll(req);
      res.status(code).json(data);
    }
  );

  public update = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.update,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.update(req);
      res.status(code).json(data);
    }
  );

  public delete = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.delete(req);
      res.status(code).json(data);
    }
  );
}
