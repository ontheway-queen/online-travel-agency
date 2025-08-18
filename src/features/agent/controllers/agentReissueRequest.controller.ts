import AbstractController from "../../../abstract/abstract.controller";
import { B2BReissueRequestService } from "../services/b2bReissueRequest.service";
import { B2BReissueRequestValidator } from "../utils/validators/B2BReissueRequest.validator";
import { Request, Response } from 'express';

export class B2BReissueRequestController extends AbstractController {
    private service = new B2BReissueRequestService();
    private validator = new B2BReissueRequestValidator();
    constructor() {
        super();
    }

    public createB2bRegistrationRequest = this.asyncWrapper.wrap(
        { bodySchema: this.validator.CreateReissueRequestSchema },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.createReissueRequest(
                req
            );
            res.status(code).json(rest);
        }
    );

    public getReissueList = this.asyncWrapper.wrap(
        null,
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getReissueList(
                req
            );
            res.status(code).json(rest);
        }
    );

    public getSingleReissue = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamValidator },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getSingleReissue(
                req
            );
            res.status(code).json(rest);
        }
    );

    public updateReissueRequest = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamValidator },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updateReissueRequest(
                req
            );
            res.status(code).json(rest);
        }
    );
}