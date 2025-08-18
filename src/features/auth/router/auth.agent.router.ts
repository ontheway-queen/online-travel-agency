import AbstractRouter from "../../../abstract/abstract.router";
import AuthChecker from "../../../middleware/authChecker/authChecker";
import { B2bRegistrationRequestController } from "../../agent/controllers/agentRegistrationRequest.controller";
import AgentAuthController from "../controller/auth.agent.controller";

class AgentAuthRouter extends AbstractRouter {
  private AgentAuthController = new AgentAuthController();
  private authChecker = new AuthChecker();
  private registrationRequestController =
    new B2bRegistrationRequestController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //login
    this.router.route("/login").post(this.AgentAuthController.login);

    //verify otp
    this.router.route("/verify-otp").post(this.AgentAuthController.verifyOTP);

    //resend otp
    this.router.route("/resend-otp").post(this.AgentAuthController.resendOTP);

    //forget password
    this.router
      .route("/forget-password")
      .post(this.AgentAuthController.forgetPassword);

    // b2b registration request
    this.router.route("/registration-request").post(
      this.uploader.cloudUploadRaw(
        this.fileFolders.AGENT_FILES
      ),
      this.registrationRequestController.createB2bRegistrationRequest
    );

    // verify registration request
    this.router.route("/verify-registration-request").post(
      this.registrationRequestController.verifyRegistrationRequest
    );
  }
}

export default AgentAuthRouter;
