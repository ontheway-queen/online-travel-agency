"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./router"));
const constants_1 = require("../utils/miscellaneous/constants");
const customError_1 = __importDefault(require("../utils/lib/customError"));
const socket_1 = require("./socket");
const errorHandler_1 = __importDefault(require("../middleware/errorHandler/errorHandler"));
const node_cron_1 = __importDefault(require("node-cron"));
const publicCommon_service_1 = __importDefault(require("../features/public/services/publicCommon.service"));
class App {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.origin = constants_1.origin;
        this.server = (0, socket_1.SocketServer)(this.app);
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
    runCron() {
        return __awaiter(this, void 0, void 0, function* () {
            const services = new publicCommon_service_1.default();
            // Run every 3 days at 12:00 AM
            node_cron_1.default.schedule("0 0 */3 * *", () => __awaiter(this, void 0, void 0, function* () {
                yield services.getSabreToken();
            }));
            // Run every day at 12:01 AM
            node_cron_1.default.schedule("1 0 * * *", () => __awaiter(this, void 0, void 0, function* () {
                yield services.sendEmailForPartialPaymentDue();
            }));
        });
    }
    //start server
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const services = new publicCommon_service_1.default();
            yield services.getSabreToken();
            // await services.getTravelportRestToken();
            this.server.listen(this.port, () => {
                console.log(`online travel agency server has started successfully at port: ${this.port}...🚀`);
            });
        });
    }
    //init middleware
    initMiddleware() {
        this.app.use(express_1.default.json({ limit: "2mb" }));
        this.app.use(express_1.default.urlencoded({ limit: "2mb", extended: true }));
        this.app.use((0, morgan_1.default)("dev"));
        this.app.use((0, cors_1.default)({ origin: this.origin, credentials: true }));
    }
    // socket connection
    socket() {
        socket_1.io.use((socket, next) => {
            var _a;
            if (!((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.id)) {
                next(new Error("Provide id into auth."));
            }
            else {
                next();
            }
        });
        socket_1.io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
            const { id, type } = socket.handshake.auth;
            console.log(socket.id, "-", id, "-", type, " is connected ⚡");
            //update socket_id
            if (type === "admin") {
                yield new publicCommon_service_1.default().updateAdmin({ socket_id: socket.id }, id);
            }
            else if (type === "Agent") {
                yield new publicCommon_service_1.default().updateB2B({ socket_id: socket.id }, id);
            }
            socket.on("disconnect", (event) => __awaiter(this, void 0, void 0, function* () {
                console.log(socket.id, "-", id, "-", type, " disconnected...");
                socket.disconnect();
            }));
        }));
    }
    // init routers
    initRouters() {
        this.app.get("/", (_req, res) => {
            res.send(`online travel agency OTA server is running successfully...🚀`);
        });
        this.app.get("/api", (_req, res) => {
            res.send(`online travel agency OTA API is active...🚀`);
        });
        this.app.use("/api/v1", new router_1.default().v1Router);
    }
    // not found router
    notFoundRouter() {
        this.app.use("*", (_req, _res, next) => {
            next(new customError_1.default("Cannot found the route", 404));
        });
    }
    // error handler
    errorHandle() {
        this.app.use(new errorHandler_1.default().handleErrors);
    }
    //disable x-powered-by
    disableXPoweredBy() {
        this.app.disable("x-powered-by");
    }
}
exports.default = App;
