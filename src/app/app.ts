import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { Server } from "http";
import RootRouter from "./router";
import { origin } from "../utils/miscellaneous/constants";
import CustomError from "../utils/lib/customError";
import { SocketServer, io } from "./socket";
import ErrorHandler from "../middleware/errorHandler/errorHandler";
import cron from "node-cron";
import PublicCommonService from "../features/public/services/publicCommon.service";
import PublicCommonBkashService from "../features/public/services/publicBkash.service";

class App {
  public app: Application = express();
  private server: Server;
  private port: number;
  private origin: string[] = origin;

  constructor(port: number) {
    this.server = SocketServer(this.app);
    this.port = port;
    this.initMiddleware();
    this.initRouters();
    this.socket();
    this.runCron();
    this.notFoundRouter();
    this.errorHandle();
    this.disableXPoweredBy();
  }

  // Run cron jobs
  private async runCron() {
    const services = new PublicCommonService();

    // Run every 3 days at 12:00 AM
    cron.schedule("0 0 */3 * *", async () => {
      await services.getSabreToken();
    });

    // Run every day at 12:01 AM
    cron.schedule("1 0 * * *", async () => {
      await services.sendEmailForPartialPaymentDue();
    });
  }

  //start server
  public async startServer() {
    const services = new PublicCommonService();
    await services.getSabreToken();

    // await services.getTravelportRestToken();
    this.server.listen(this.port, () => {
      console.log(
        `online travel agency server has started successfully at port: ${this.port}...🚀`
      );
    });
  }

  //init middleware
  private initMiddleware() {
    this.app.use(express.json({ limit: "2mb" }));
    this.app.use(express.urlencoded({ limit: "2mb", extended: true }));
    this.app.use(morgan("dev"));
    this.app.use(cors({ origin: this.origin, credentials: true }));
  }

  // socket connection
  private socket() {
    io.use((socket, next) => {
      if (!socket.handshake.auth?.id) {
        next(new Error("Provide id into auth."));
      } else {
        next();
      }
    });

    io.on("connection", async (socket) => {
      const { id, type } = socket.handshake.auth;
      console.log(socket.id, "-", id, "-", type, " is connected ⚡");

      //update socket_id
      if (type === "admin") {
        await new PublicCommonService().updateAdmin(
          { socket_id: socket.id },
          id
        );
      } else if (type === "Agent") {
        await new PublicCommonService().updateB2B({ socket_id: socket.id }, id);
      }

      socket.on("disconnect", async (event) => {
        console.log(socket.id, "-", id, "-", type, " disconnected...");
        socket.disconnect();
      });
    });
  }

  // init routers
  private initRouters() {
    this.app.get("/", (_req: Request, res: Response) => {
      res.send(`online travel agency OTA server is running successfully...🚀`);
    });
    this.app.get("/api", (_req: Request, res: Response) => {
      res.send(`online travel agency OTA API is active...🚀`);
    });
    this.app.use("/api/v1", new RootRouter().v1Router);
  }

  // not found router
  private notFoundRouter() {
    this.app.use("*", (_req: Request, _res: Response, next: NextFunction) => {
      next(new CustomError("Cannot found the route", 404));
    });
  }

  // error handler
  private errorHandle() {
    this.app.use(new ErrorHandler().handleErrors);
  }

  //disable x-powered-by
  private disableXPoweredBy() {
    this.app.disable("x-powered-by");
  }
}

export default App;
