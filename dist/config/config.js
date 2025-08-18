"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Parsing the env file.
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
// Loading process.env as  ENV interface
const getConfig = () => {
    return {
        PORT: process.env.PORT ? Number(process.env.PORT) : 9005,
        APP_ENV: process.env.APP_ENV ? process.env.APP_ENV : "DEV",
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        JWT_SECRET_ADMIN: process.env.JWT_SECRET_ADMIN,
        JWT_SECRET_USER: process.env.JWT_SECRET_USER,
        JWT_SECRET_AGENT: process.env.JWT_SECRET_AGENT,
        EMAIL_SEND_EMAIL_ID: process.env.EMAIL_SEND_EMAIL_ID,
        EMAIL_SEND_PASSWORD: process.env.EMAIL_SEND_PASSWORD,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
        AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
        AWS_S3_SECRET_KEY: process.env.AWS_S3_SECRET_KEY,
        SSL_URL: process.env.SSL_URL,
        SSL_STORE_ID: process.env.SSL_STORE_ID,
        SSL_STORE_PASSWORD: process.env.SSL_STORE_PASSWORD,
        SABRE_PASSWORD: process.env.SABRE_PASSWORD,
        SABRE_AUTH_TOKEN: process.env.SABRE_AUTH_TOKEN,
        SABRE_URL: process.env.SABRE_URL,
        SABRE_USERNAME: process.env.SABRE_USERNAME,
        SABRE_LNIATA_CODE: process.env.SABRE_LNIATA_CODE,
        VERTEIL_URL: process.env.VERTEIL_URL,
        VERTEIL_USERNAME: process.env.VERTEIL_USERNAME,
        VERTEIL_PASSWORD: process.env.VERTEIL_PASSWORD,
        VERTEIL_OFFICEID: process.env.VERTEIL_OFFICEID,
        TRIPJACK_URL: process.env.TRIPJACK_URL,
        TRIPJACK_API_KEY: process.env.TRIPJACK_API_KEY,
        TRAVELPORT_REST_TOKEN_URL: process.env.TRAVELPORT_REST_TOKEN_URL,
        TRAVELPORT_REST_URL: process.env.TRAVELPORT_REST_URL,
        TRAVELPORT_REST_USERNAME: process.env.TRAVELPORT_REST_USERNAME,
        TRAVELPORT_REST_PASSWORD: process.env.TRAVELPORT_REST_PASSWORD,
        TRAVELPORT_REST_CLIENT_ID: process.env.TRAVELPORT_REST_CLIENT_ID,
        TRAVELPORT_REST_CLIENT_SECRET: process.env.TRAVELPORT_REST_CLIENT_SECRET,
        TRAVELPORT_REST_ACCESS_GROUP: process.env.TRAVELPORT_REST_ACCESS_GROUP,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        BRAC_SECRET_KEY: process.env.BRAC_SECRET_KEY,
        BRAC_VALIDATION_SECRET_KEY: process.env.BRAC_VALIDATION_SECRET_KEY,
        BRAC_HOST_URL: process.env.BRAC_HOST_URL,
        BRAC_MERCHANT_ID: process.env.BRAC_MERCHANT_ID,
        BRAC_KEY_ID: process.env.BRAC_KEY_ID,
        BKASH_APP_SECRET: process.env.BKASH_APP_SECRET,
        BKASH_APP_KEY: process.env.BKASH_APP_KEY,
        BKASH_USERNAME: process.env.BKASH_USERNAME,
        BKASH_PASSWORD: process.env.BKASH_PASSWORD,
        BKASH_BASE_URL: process.env.BKASH_BASE_URL,
        MERCHANT_ASSOCIATION_INFO: process.env.MERCHANT_ASSOCIATION_INFO
    };
};
const getSanitzedConfig = (config) => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in .env`);
        }
    }
    return config;
};
exports.default = getSanitzedConfig(getConfig());
