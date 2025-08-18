import AbstractRouter from "../../../abstract/abstract.router";
import UserAuthController from "../controller/auth.user.controller";

class UserAuthRouter extends AbstractRouter {
  private UserAuthController = new UserAuthController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //register
    this.router
      .route("/registration")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.USER_FILES),
        this.UserAuthController.registration
      );
    this.router.route('/registration-verify').post(this.UserAuthController.verifyRegistrationRequest);

    // Google login route
    this.router
      .route("/google-login")
      .post(this.UserAuthController.loginWithGoogle);

    // Google login route
    this.router
      .route("/facebook-login")
      .post(this.UserAuthController.loginWithFB);

    //login
    this.router.route("/login").post(this.UserAuthController.login);

    //forget password
    this.router
      .route("/forget-password")
      .post(this.UserAuthController.forgetPassword);
  }
}

export default UserAuthRouter;
