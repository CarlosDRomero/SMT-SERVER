import { header } from "express-validator"
import { is_base64 } from "./custom/index.js"

export const cursorRequestValidator = [
  header("paging.cursor").optional().custom(is_base64),
  header("paging.cursorsetup.orderby.*", "Invalid ordering value").isInt({ min: -1, max: 1 }),
  header("paging.cursorSetup.pagesize", "Invalid paging size").isInt({ min: 0 }).optional()
]