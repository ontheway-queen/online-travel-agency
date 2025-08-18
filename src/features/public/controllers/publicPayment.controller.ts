import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import PublicPaymentService from "../services/publicPayment.service";
import PublicCommonBkashService from "../services/publicBkash.service";
import PublicSSLService from "../services/publicSSL.service";

class PublicPaymentController extends AbstractController {
  private PaymentService = new PublicPaymentService();
  private BkashService = new PublicCommonBkashService();
  private sslService = new PublicSSLService();

  constructor() {
    super();
  }
  //payment failed
  public paymentFailed = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.PaymentService.paymentFailed(req);
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );

  //payment success
  public paymentSuccess = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const result = await this.PaymentService.paymentSuccess(req);

      if (result) {
        const { code, ...rest } = result;
        if (req.body.isApp) {
          res.status(code).json(rest);
        } else if (rest.redirect_url) {
          res.status(code).redirect(rest.redirect_url);
        } else {
          res.status(code).json(rest);
        }
      } else {
        res.status(500).json({
          success: false,
          message: "An unexpected error occurred.",
        });
      }
    }
  );

  // payment cancelled
  public paymentCancelled = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.PaymentService.paymentCancelled(req);
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );

  //brac bank payment confirm
  public b2cBracBankPaymentConfirm = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.PaymentService.b2cBracBankPaymentConfirm(req);
      if (req.body.is_app) {
        res.status(code).json(rest);
      } else if (rest.redirect_url) {
        res.status(code).redirect(String(rest.redirect_url));
      } else {
        res.status(code).json(rest);
      }
    }
  );

  //brac bank payment cancel
  public bracBankPaymentCancel = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.PaymentService.b2cBracBankPaymentCancel(req);
      res.status(code).redirect(rest.redirect_url);
    }
  );

  //payment success
  public btobBracPaymentSuccess = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.PaymentService.btobBracPaymentSuccess(req);

      console.log(rest.redirect_url, "redirect_url");
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );

  //payment cancelled
  public btobBracPaymentCancelled = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.PaymentService.btobBracPaymentCancelled(req);
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );

  //payment failed
  public btobBracPaymentFailed = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.PaymentService.btobBracPaymentFailed(
        req
      );
      if (rest.redirect_url) {
        res.status(code).redirect(rest.redirect_url);
      } else {
        res.status(code).json(rest);
      }
    }
  );

  // BKASH CALL BACK URL
  public b2cBkashCallbackUrl = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.BkashService.B2cBkashCallbackUrl(req, res);
    }
  );

  // creadit load callback url
  public B2bBkashCallbackUrl = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.BkashService.B2bBkashCallbackUrl(req, res);
    }
  );

  // get single payments link
  public getSinglePaymentLink = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.PaymentService.getSinglePaymentLink(
        req
      );

      res.status(code).json(rest);
    }
  );

  // b2b ssl success
  public b2bSslSuccess = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.sslService.b2bPaymentSuccess(req);
      if (data.redirect_url) {
        res.status(data.code).redirect(data.redirect_url);
      } else {
        res.status(data.code).json(data);
      }
    }
  );

  // b2b ssl failed
  public b2bSslFailed = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.sslService.b2bPaymentFailed(req);
      if (data.redirect_url) {
        res.status(data.code).redirect(data.redirect_url);
      } else {
        res.status(data.code).json(data);
      }
    }
  );

  // b2b ssl cancelled
  public b2bSslCancelled = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.sslService.b2bPaymentCancelled(req);
      if (data.redirect_url) {
        res.status(data.code).redirect(data.redirect_url);
      } else {
        res.status(data.code).json(data);
      }
    }
  );

  // b2c ssl success
  public b2cSslSuccess = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.sslService.b2cPaymentSuccess(req);
      if (data.redirect_url) {
        res.status(data.code).redirect(data.redirect_url);
      } else {
        res.status(data.code).json(data);
      }
    }
  );

  // b2c ssl failed
  public b2cSslFailed = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.sslService.b2cPaymentFailed(req);
      if (data.redirect_url) {
        res.status(data.code).redirect(data.redirect_url);
      } else {
        res.status(data.code).json(data);
      }
    }
  );

  // b2c ssl cancelled
  public b2cSslCancelled = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { ...data } = await this.sslService.b2cPaymentCancelled(req);
      if (data.redirect_url) {
        res.status(data.code).redirect(data.redirect_url);
      } else {
        res.status(data.code).json(data);
      }
    }
  );
}

export default PublicPaymentController;
