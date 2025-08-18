import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import PublicCommonService from '../services/publicCommon.service';

class PublicCommonController extends AbstractController {
  private commonService = new PublicCommonService();

  constructor() {
    super();
  }
  //get all country
  public getAllCountry = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllCountry(req);
      res.status(code).json(data);
    }
  );

  //get all city
  public getAllCity = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllCity(req);
      res.status(code).json(data);
    }
  );

  //get all airport
  public getAllAirport = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.airportFilterSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllAirport(req);
      res.status(code).json(data);
    }
  );

  //airlines list
  public getAllAirlines = this.asyncWrapper.wrap(
    { querySchema: this.commonValidator.airlineFilterSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllAirlines(req);
      res.status(code).json(data);
    }
  );

  //get all visa country list
  public getAllVisaCountryList = this.asyncWrapper.wrap(
    { querySchema: this.commonValidator.visaListSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllVisaCountryList(
        req
      );
      res.status(code).json(data);
    }
  );

  //visa list
  public getAllVisaList = this.asyncWrapper.wrap(
    { querySchema: this.commonValidator.visaListSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllVisaList(req);
      res.status(code).json(data);
    }
  );

  //get all visa Type
  public getAllVisaType = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllVisaType(req);
      res.status(code).json(data);
    }
  );

  //single visa
  public getSingleVisa = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getSingleVisa(req);
      res.status(code).json(data);
    }
  );


  //get article list
  public getArticleList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getArticleList(req);
      res.status(code).json(data);
    }
  );

  //get single article
  public getSingleArticle = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getSingleArticle(req);
      res.status(code).json(data);
    }
  );

  //get all offer list
  public getAllOfferList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getAllOffer(req);
      res.status(code).json(data);
    }
  );

  //get single article
  public getSingleOffer = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getSingleOffer(req);
      res.status(code).json(data);
      // res.send("working");
    }
  );

  public getAciveOnlyBannerImage = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.commonService.getActiveOnlyBannerImage(req);
      res.status(Number(code)).json(data);
    }
  );



  // //Customize Tour Package Booking Controller
  // public customizeTourPackageBooking = this.asyncWrapper.wrap(
  //   {
  //     bodySchema: this.tourPackageValidators.customizePackageBookingBodySchema,
  //     paramSchema: this.tourPackageValidators.PackageBookingParamSchema,
  //   },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } =
  //       await this.commonService.customizeTourPackageBooking(req);
  //     res.status(code).json(data);
  //   }
  // );

  // //Customize Umrah Package Booking Controller
  // public customizeUmrahPackageBooking = this.asyncWrapper.wrap(
  //   {
  //     bodySchema: this.umrahPackageValidators.customizePackageBookingBodySchema,
  //     paramSchema: this.umrahPackageValidators.PackageBookingParamSchema,
  //   },
  //   async (req: Request, res: Response) => {
  //     const { code, ...data } =
  //       await this.commonService.customizeUmrahPackageBooking(req);
  //     res.status(code).json(data);
  //   }
  // );


  //get b2c data for corporate travel
  public getB2CDataForCorporatePackagePage = this.asyncWrapper.wrap(
    null,
    async (_: Request, res: Response) => {
      const { code, ...data } =
        await this.commonService.getB2CDataForCorporatePackagePage();
      res.status(code).json(data);
    }
  );

  //get detail description
  public getDetailDescription = this.asyncWrapper.wrap(
    null,
    async (_: Request, res: Response) => {
      const { code, ...data } = await this.commonService.getDetailDescription();
      res.status(code).json(data);
    }
  );

  //get all announcement
  public getAllAnnouncementList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.commonService.getAllAnnouncementList(req);
      res.status(code).json(data);
    }
  );

  public uploadLogo = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.commonService.uploadLogo(req);
      res.status(code).json(data);
    }
  );

  //test
  public test = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const data =
        await this.commonService.test();
      res.status(200).json(data);
    }
  );
}

export default PublicCommonController;
