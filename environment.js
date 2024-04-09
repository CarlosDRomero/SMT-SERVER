import dotenv from "dotenv/config"


export const env = {
  PORT: process.env.PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PASS: process.env.DB_PASS,
  DB_HOST: process.env.DB_HOST,
}