import AbstractController from "../../../abstract/abstract.controller";
import { Request, Response } from 'express';
import { AdminB2BRefundRequestService } from "../services/adminB2BRefundRequest.service";
import { AdminB2BRefundRequestValidator } from "../utils/validators/adminB2BRefundRequest.validator";

export class AdminB2BRefundRequestController extends AbstractController {
    private service = new AdminB2BRefundRequestService();
    private validator = new AdminB2BRefundRequestValidator();
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
        {
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.UpdateRefundRequest
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updateRefundRequest(
                req
            );
            res.status(code).json(rest);
        }
    );
}