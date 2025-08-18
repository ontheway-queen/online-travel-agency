import { NextFunction, Request, Response } from 'express';
import multerS3 from 'multer-s3';
import multer from 'multer';
import path from 'path';
import { allowAllFileTypes, allowImageFileTypes, rootFileFolder } from './uploaderConstants';
import config from '../../config/config';
import CustomError from '../../utils/lib/customError';
import CommonAbstractStorage from '../../abstract/abstract.storage';

class Uploader extends CommonAbstractStorage {
  constructor() {
    super();
  }

  // cloud upload raw
  public cloudUploadRaw(folder: string, types: string[] = allowAllFileTypes) {
    return (req: Request, res: Response, next: NextFunction): void => {
      req.upFiles = [];
      const upload = multer({
        storage: multerS3({
          acl: 'public-read',
          s3: this.s3Client,
          bucket: config.AWS_S3_BUCKET,
          metadata: function (_req, file, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
            const fileWithFolder =
              folder +
              '/' +
              Date.now() +
              '-' +
              Math.round(Math.random() * 1e9) +
              path.extname(file.originalname);

            file.filename = fileWithFolder;
            req.upFiles.push(fileWithFolder);
            cb(null, `${rootFileFolder}/${fileWithFolder}`);
          },
        }),
        fileFilter: function (_req, file, cb) {
          // Check allowed extensions
          if (types.includes(file.mimetype)) {
            cb(null, true); // no errors
          } else {
            cb(
              new Error(
                'File mimetype is not allowed' + ' for ' + file.fieldname
              )
            );
          }
        },
      });

      upload.any()(req, res, (err) => {
        console.log(req.files);
        if (err) {
          next(new CustomError(err.message, 500));
        } else {
          next();
        }
      });
    };
  }

  public getFileBase64(types: string[] = allowImageFileTypes) {
    return (req: Request, res: Response, next: NextFunction): void => {
      req.upFileBase64 = {};

      const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: function (_req, file, cb) {
          const fileExtension = file.originalname.split('.').pop();
          if (fileExtension && types.includes(fileExtension.toLowerCase())) {
            cb(null, true);
          } else {
            cb(
              new Error(
                `File with ".${fileExtension}" extension is not allowed`
              )
            );
          }
        },
        // Increase file limit if needed
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB
      });

      upload.any()(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err.message);
          return next(new CustomError(err.message, 400));
        }

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          console.log('No files received.');
          return next();
        }

        // Remove the single file restriction
        // if (files && files.length > 1) {
        //     return next(
        //         new CustomError('Only one file should be processed.', 400)
        //     );
        // }

        files.forEach((file) => {
          const base64Data = file.buffer.toString('base64');
          if (req.upFileBase64) {
            // Handle multiple files with the same fieldname
            if (file.fieldname in req.upFileBase64) {
              // If fieldname already exists, convert to array or push to existing array
              if (Array.isArray(req.upFileBase64[file.fieldname])) {
                (req.upFileBase64[file.fieldname] as unknown as string[]).push(
                  `data:image/jpeg;base64,${base64Data}`
                );
              } else {
                req.upFileBase64[file.fieldname] = [
                  req.upFileBase64[file.fieldname] as string,
                  `data:image/jpeg;base64,${base64Data}`
                ];
              }
            } else {
              req.upFileBase64[file.fieldname] = `data:image/jpeg;base64,${base64Data}`;
            }
          }
        });

        console.log('Files processed for Base64 conversion.');
        console.log('Base64 Data Keys:', Object.keys(req.upFileBase64));
        next();
      });
    };
  }
}
export default Uploader;
