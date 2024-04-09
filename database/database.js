import pg from 'pg'
import { env } from "../environment.js"
const {Pool, Client} = pg

export const pool = new Pool({
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_NAME,
    password: env.DB_PASS,
    port: 5432,
  })
   

