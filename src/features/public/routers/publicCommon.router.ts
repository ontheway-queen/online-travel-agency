import AbstractRouter from '../../../abstract/abstract.router';
import PublicCommonController from '../controllers/publicCommon.controller';
class PublicCommonRouter extends AbstractRouter {
  private Controller = new PublicCommonController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //get country
    this.router.get('/country', this.Controller.getAllCountry);

    //get city
    this.router.get('/city', this.Controller.getAllCity);

    //get airport
    this.router.route('/airport').get(this.Controller.getAllAirport);

    //get airlines
    this.router.route('/airlines').get(this.Controller.getAllAirlines);

    //get all visa list
    this.router
      .route('/visa-country')
      .get(this.Controller.getAllVisaCountryList);

    //get all visa list
    this.router.route('/visa').get(this.Controller.getAllVisaList);

    //get single visa
    this.router.route('/visa/:id').get(this.Controller.getSingleVisa);

    //get all visa type
    this.router.route('/visa-type').get(this.Controller.getAllVisaType);

    // get all article
    this.router.route('/article').get(this.Controller.getArticleList);

    // get single article
    this.router.route('/article/:slug').get(this.Controller.getSingleArticle);

    // get all article
    this.router.route('/offer').get(this.Controller.getAllOfferList);

    // get single article
    this.router.route('/offer/:slug').get(this.Controller.getSingleOffer);

    // get active banner Image
    this.router.route('/banner').get(this.Controller.getAciveOnlyBannerImage);

    // Get Corporate travel page data
    this.router
      .route('/tour-package/corporate-travel')
      .get(this.Controller.getB2CDataForCorporatePackagePage);

    this.router
      .route('/umrah-package/detail-description')
      .get(this.Controller.getDetailDescription);

    this.router
      .route('/announcement')
      .get(this.Controller.getAllAnnouncementList);

    this.router.route('/upload-logo').post(this.uploader.cloudUploadRaw(this.fileFolders.LOGO_FILES), this.Controller.uploadLogo);

    this.router.route('/test').get(this.Controller.test);
  }
}

export default PublicCommonRouter;
