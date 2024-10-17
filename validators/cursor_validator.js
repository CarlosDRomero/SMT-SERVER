import { header } from "express-validator"
import { is_base64 } from "./custom/index.js"

export const cursorRequestValidator = [
  header("pagination.cursor").optional().custom(is_base64),
  header("pagination.cursorsetup.orderby", "Must be an array").optional().isArray(),
  header("pagination.cursorSetup.pagesize", "Invalid pagination size").isInt({ min: 1 }).optional()
]