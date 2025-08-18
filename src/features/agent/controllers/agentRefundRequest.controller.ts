import AbstractController from "../../../abstract/abstract.controller";
import { B2BRefundRequestService } from "../services/b2bRefundRequest.service";
import { B2BRefundRequestValidator } from "../utils/validators/B2BRefundRequest.validator";
import { Request, Response } from 'express';

export class B2BRefundRequestController extends AbstractController {
    private service = new B2BRefundRequestService();
    private validator = new B2BRefundRequestValidator();
    constructor() {
        super();
    }

    public createB2bRegistrationRequest = this.asyncWrapper.wrap(
        { bodySchema: this.validator.CreateRefundRequestSchema },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.createRefundRequest(
                req
            );
            res.status(code).json(rest);
        }
    );

    public getRefundList = this.asyncWrapper.wrap(
        null,
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getRefundList(
                req
            );
            res.status(code).json(rest);
        }
    );

    public getSingleRefund = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamValidator },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getSingleRefund(
                req
            );
            res.status(code).json(rest);
        }
    );

    public updateRefundRequest = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamValidator },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updateRefundRequest(
                req
            );
            res.status(code).json(rest);
        }
    );
}