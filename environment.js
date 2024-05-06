import "dotenv/config"

const IS_TEST = process.env.NODE_ENV.trim() === "test"

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  IS_TEST,
  PORT:    process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  DB_USER: !IS_TEST ? process.env.DB_USER : process.env.TEST_DB_USER,
  DB_NAME: !IS_TEST ? process.env.DB_NAME : process.env.TEST_DB_NAME,
  DB_PASS: !IS_TEST ? process.env.DB_PASS : process.env.TEST_DB_PASS,
  DB_HOST: !IS_TEST ? process.env.DB_HOST : process.env.TEST_DB_HOST,
  DB_PORT: !IS_TEST ? process.env.DB_PORT : process.env.TEST_DB_PORT
}