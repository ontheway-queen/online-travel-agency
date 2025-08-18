import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { AdminCurrencyService } from "../services/adminCurrency.service";
import { AdminCurrencyValidator } from "../utils/adminCurrency.validator";

export class AdminCurrencyController extends AbstractController {
    private service = new AdminCurrencyService();
    private validator = new AdminCurrencyValidator();


    public getApiList = this.asyncWrapper.wrap(
        {querySchema: this.validator.getApiListFilter},
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getApiList(req);
            res.status(code).json(data);
        }
    );

    public createApiWiseCurrency = this.asyncWrapper.wrap(
        { bodySchema: this.validator.createApiWiseCurrency },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.createApiWiseCurrency(req);
            res.status(code).json(data);
        }
    );

    public getApiWiseCurrency = this.asyncWrapper.wrap(
        null,
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getApiWiseCurrency(req);
            res.status(code).json(data);
        }
    );


    public updateApiWiseCurrency = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.updateApiWiseCurrency
        },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.updateApiWiseCurrency(req);
            res.status(code).json(data);
        }
    );

    public deleteApiWiseCurrency = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamValidator,
        },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.deleteApiWiseCurrency(req);
            res.status(code).json(data);
        }
    );
}
