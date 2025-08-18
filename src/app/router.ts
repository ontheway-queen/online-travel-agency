import { Router } from "express";
import AdminRootRouter from "../features/admin/adminRoot.router";
import AuthRouter from "../features/auth/auth.router";
import AgentRootRouter from "../features/agent/agentRoot.router";
import B2CRootRouter from "../features/b2c/b2cRoot.router";
import PublicRootRouter from "../features/public/publicRoot.router";
import PublicPaymentRouter from "../features/public/routers/publicPayment.router";
import AuthChecker from "../middleware/authChecker/authChecker";

class RootRouter {
  public v1Router = Router();
  private authRouter = new AuthRouter();
  private authChecker = new AuthChecker();

  constructor() {
    this.callV1Router();
  }

  private callV1Router() {
    //publics
    this.v1Router.use("/public", new PublicRootRouter().Router);

    //payment
    this.v1Router.use("/payment", new PublicPaymentRouter().router);

    //auth
    this.v1Router.use("/auth", this.authRouter.AuthRouter);

    //admin
    this.v1Router.use(
      "/admin",
      this.authChecker.adminAuthChecker,
      new AdminRootRouter().Router
    );

    //b2c
    this.v1Router.use("/b2c", new B2CRootRouter().Router);

    //agent
    this.v1Router.use(
      "/agent",
      this.authChecker.b2bAuthChecker,
      new AgentRootRouter().Router
    );
  }
}

export default RootRouter;
