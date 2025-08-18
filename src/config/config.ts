import dotenv from "dotenv";
import path from "path";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Env types
interface ENV {
  PORT: number | undefined;
  APP_ENV: string | undefined;
  DB_NAME: string | undefined;
  DB_PASS: string | undefined;
  DB_USER: string | undefined;
  DB_PORT: string | undefined;
  DB_HOST: string | undefined;
  JWT_SECRET_ADMIN: string | undefined;
  JWT_SECRET_USER: string | undefined;
  JWT_SECRET_AGENT: string | undefined;
  EMAIL_SEND_EMAIL_ID: string | undefined;
  EMAIL_SEND_PASSWORD: string | undefined;
  GOOGLE_CLIENT_SECRET: string | undefined;
  GOOGLE_CLIENT_ID: string | undefined;
  AWS_S3_BUCKET: string | undefined;
  AWS_S3_ACCESS_KEY: string | undefined;
  AWS_S3_SECRET_KEY: string | undefined;
  SSL_URL: string | undefined;
  SSL_STORE_ID: string | undefined;
  SSL_STORE_PASSWORD: string | undefined;
  SABRE_PASSWORD: string | undefined;
  SABRE_AUTH_TOKEN: string | undefined;
  SABRE_URL: string | undefined;
  SABRE_USERNAME: string | undefined;
  SABRE_LNIATA_CODE: string | undefined;
  VERTEIL_URL: string | undefined;
  VERTEIL_USERNAME: string | undefined;
  VERTEIL_PASSWORD: string | undefined;
  VERTEIL_OFFICEID: string | undefined;
  TRIPJACK_URL: string | undefined;
  TRIPJACK_API_KEY: string | undefined;
  TRAVELPORT_REST_TOKEN_URL: string | undefined;
  TRAVELPORT_REST_URL: string | undefined;
  TRAVELPORT_REST_USERNAME: string | undefined;
  TRAVELPORT_REST_PASSWORD: string | undefined;
  TRAVELPORT_REST_CLIENT_ID: string | undefined;
  TRAVELPORT_REST_CLIENT_SECRET: string | undefined;
  TRAVELPORT_REST_ACCESS_GROUP: string | undefined;
  GOOGLE_API_KEY: string | undefined;

  BRAC_SECRET_KEY: string | undefined;
  BRAC_VALIDATION_SECRET_KEY: string | undefined;
  BRAC_HOST_URL: string | undefined;
  BRAC_MERCHANT_ID: string | undefined;
  BRAC_KEY_ID: string | undefined;

  BKASH_USERNAME: string | undefined;
  BKASH_PASSWORD: string | undefined;
  BKASH_APP_SECRET: string | undefined;
  BKASH_APP_KEY: string | undefined;
  BKASH_BASE_URL: string | undefined;
  MERCHANT_ASSOCIATION_INFO: string | undefined;
}

// Config types
interface Config {
  PORT: number;
  APP_ENV: string;
  DB_NAME: string;
  DB_PASS: string;
  DB_USER: string;
  DB_PORT: string;
  DB_HOST: string;
  JWT_SECRET_ADMIN: string;
  JWT_SECRET_USER: string;
  JWT_SECRET_AGENT: string;
  EMAIL_SEND_EMAIL_ID: string;
  EMAIL_SEND_PASSWORD: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  AWS_S3_BUCKET: string;
  AWS_S3_ACCESS_KEY: string;
  AWS_S3_SECRET_KEY: string;
  SSL_URL: string;
  SSL_STORE_ID: string;
  SSL_STORE_PASSWORD: string;
  SABRE_AUTH_TOKEN: string;
  SABRE_PASSWORD: string;
  SABRE_URL: string;
  SABRE_USERNAME: string;
  SABRE_LNIATA_CODE: string;
  VERTEIL_URL: string;
  VERTEIL_USERNAME: string;
  VERTEIL_PASSWORD: string;
  VERTEIL_OFFICEID: string;
  TRIPJACK_URL: string;
  TRIPJACK_API_KEY: string;
  TRAVELPORT_REST_TOKEN_URL: string;
  TRAVELPORT_REST_URL: string;
  TRAVELPORT_REST_USERNAME: string;
  TRAVELPORT_REST_PASSWORD: string;
  TRAVELPORT_REST_CLIENT_ID: string;
  TRAVELPORT_REST_CLIENT_SECRET: string;
  TRAVELPORT_REST_ACCESS_GROUP: string;
  GOOGLE_API_KEY: string;
  BRAC_SECRET_KEY: string;
  BRAC_VALIDATION_SECRET_KEY: string;
  BRAC_HOST_URL: string;
  BRAC_MERCHANT_ID: string;
  BRAC_KEY_ID: string;

  BKASH_USERNAME: string;
  BKASH_PASSWORD: string;
  BKASH_APP_SECRET: string;
  BKASH_APP_KEY: string;
  BKASH_BASE_URL: string;
  MERCHANT_ASSOCIATION_INFO: string;
}

// Loading process.env as  ENV interface
const getConfig = (): ENV => {
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

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env`);
    }
  }
  return config as Config;
};

export default getSanitzedConfig(getConfig());
