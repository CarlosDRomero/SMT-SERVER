import "dotenv/config"

const NODE_ENV = process.env.NODE_ENV.trim()
export const env = {

  PORT:    process.env.PORT,
  DB_USER: NODE_ENV !== "test" ? process.env.DB_USER : process.env.TEST_DB_USER,
  DB_NAME: NODE_ENV !== "test" ? process.env.DB_NAME : process.env.TEST_DB_NAME,
  DB_PASS: NODE_ENV !== "test" ? process.env.DB_PASS : process.env.TEST_DB_PASS,
  DB_HOST: NODE_ENV !== "test" ? process.env.DB_HOST : process.env.TEST_DB_HOST,
  DB_PORT: NODE_ENV !== "test" ? process.env.DB_PORT : process.env.TEST_DB_PORT,
}