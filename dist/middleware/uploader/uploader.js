"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_s3_1 = __importDefault(require("multer-s3"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uploaderConstants_1 = require("./uploaderConstants");
const config_1 = __importDefault(require("../../config/config"));
const customError_1 = __importDefault(require("../../utils/lib/customError"));
const abstract_storage_1 = __importDefault(require("../../abstract/abstract.storage"));
class Uploader extends abstract_storage_1.default {
    constructor() {
        super();
    }
    // cloud upload raw
    cloudUploadRaw(folder, types = uploaderConstants_1.allowAllFileTypes) {
        return (req, res, next) => {
            req.upFiles = [];
            const upload = (0, multer_1.default)({
                storage: (0, multer_s3_1.default)({
                    acl: 'public-read',
                    s3: this.s3Client,
                    bucket: config_1.default.AWS_S3_BUCKET,
                    metadata: function (_req, file, cb) {
                        cb(null, { fieldName: file.fieldname });
                    },
                    key: function (req, file, cb) {
                        const fileWithFolder = folder +
                            '/' +
                            Date.now() +
                            '-' +
                            Math.round(Math.random() * 1e9) +
                            path_1.default.extname(file.originalname);
                        file.filename = fileWithFolder;
                        req.upFiles.push(fileWithFolder);
                        cb(null, `${uploaderConstants_1.rootFileFolder}/${fileWithFolder}`);
                    },
                }),
                fileFilter: function (_req, file, cb) {
                    // Check allowed extensions
                    if (types.includes(file.mimetype)) {
                        cb(null, true); // no errors
                    }
                    else {
                        cb(new Error('File mimetype is not allowed' + ' for ' + file.fieldname));
                    }
                },
            });
            upload.any()(req, res, (err) => {
                console.log(req.files);
                if (err) {
                    next(new customError_1.default(err.message, 500));
                }
                else {
                    next();
                }
            });
        };
    }
    getFileBase64(types = uploaderConstants_1.allowImageFileTypes) {
        return (req, res, next) => {
            req.upFileBase64 = {};
            const upload = (0, multer_1.default)({
                storage: multer_1.default.memoryStorage(),
                fileFilter: function (_req, file, cb) {
                    const fileExtension = file.originalname.split('.').pop();
                    if (fileExtension && types.includes(fileExtension.toLowerCase())) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error(`File with ".${fileExtension}" extension is not allowed`));
                    }
                },
                // Increase file limit if needed
                limits: { fileSize: 10 * 1024 * 1024 } // 10MB
            });
            upload.any()(req, res, (err) => {
                if (err) {
                    console.error('Multer error:', err.message);
                    return next(new customError_1.default(err.message, 400));
                }
                const files = req.files;
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
                                req.upFileBase64[file.fieldname].push(`data:image/jpeg;base64,${base64Data}`);
                            }
                            else {
                                req.upFileBase64[file.fieldname] = [
                                    req.upFileBase64[file.fieldname],
                                    `data:image/jpeg;base64,${base64Data}`
                                ];
                            }
                        }
                        else {
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
exports.default = Uploader;
