import { Request, Response, NextFunction } from 'express';
import ManageFile from '../../utils/lib/manageFile';
import CustomError from '../../utils/lib/customError';
import Models from '../../models/rootModel';

interface ICustomError {
  success: boolean;
  message: string;
  level?: string;
}

class ErrorHandler {
  private customError: ICustomError;
  private manageFile: ManageFile;

  constructor() {
    this.customError = {
      success: false,
      message: 'Internal server error!',
      level: 'ERROR'
    };

    this.manageFile = new ManageFile();
  }

  /**
   * handleErrors
   */
  public handleErrors = async (
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    // // file removing starts
    const files = req.upFiles || [];

    if (files.length) {
      await this.manageFile.deleteFromCloud(files);
    }

    const errorDetails = {
      message: err.message,
      route: req.originalUrl,
      method: req.method,
      stack: err.stack,
      user_id: req.user?.id || req.agency?.id || req.admin?.id,
      source: req.agency ? "B2B" as "B2B" : req.admin ? "ADMIN" as "ADMIN" : "B2C" as "B2C"
    };

    console.log(err, 'custom error');
    try {
      if (err.status == 500 || !err.status) {
        await new Models().errorLogsModel().insert({ level: err.level || "ERROR", message: errorDetails.message || "Internal Server Error", stack_trace: errorDetails.stack, source: errorDetails.source, user_id: errorDetails.user_id, url: errorDetails.route, http_method: errorDetails.method, metadata: err.metadata });
      }
    } catch (err: any) {
      console.log({ err });
    }
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message.split("-")[0] });
  };
}

export default ErrorHandler;
