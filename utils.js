export const multiInsertFactory = (query, dataMatrix, returning = true) => {
  const dataMatrixLM = dataMatrix.length
  for (let i = 0;i < dataMatrixLM ; i++){
    query.text += " ("
    const subDataMatrixLM = dataMatrix[i].length
    for (let j = 0; j < subDataMatrixLM; j++){
      query.values.push(dataMatrix[i][j])
      query.text += `$${query.values.length}`

      if (j < subDataMatrixLM - 1) query.text += ", "
    }
    query.text += ")"
    if (i < dataMatrixLM - 1) query.text += ","
  }

  if (returning) query.text += " RETURNING *";
}

const PAGE_CONDITION_FORMAT = "{{pageCondition}}"
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_DIRECTION = { operator: ">" }

export const parseDirection = (direction) => {
  if (direction === -1) return { order_kw: "DESC", operator: "<" }
  else if (direction === 1) return { order_kw: "ASC", operator: ">" }
  else if (!direction) return DEFAULT_DIRECTION
}

const buildPageCondition = (fieldName, orderDirection, valuePosition, isId = false) => {
  let condition = `${fieldName} ${orderDirection.operator} $${valuePosition}`
  if (!isId)
    return `${condition} OR (${fieldName} = $${valuePosition} AND (${PAGE_CONDITION_FORMAT}))`
  
  return condition
}

const buildPageOrderingRule = (fieldName, orderDirection) => {
  const { order_kw } = orderDirection
  let order_rule = `${fieldName}`
  if (order_kw) order_rule += ` ${order_kw}`
  return order_rule
}

const addQueryData = ({ name, direction = 0 }, last, pagingQueryData, valuesOffset, isId) => {
  const parsedDirection = parseDirection(direction)
  if (last){
    pagingQueryData.pagingValues.push(last)
    pagingQueryData.pagingConditions.push(buildPageCondition(name, parsedDirection, valuesOffset + pagingQueryData.pagingValues.length, isId))
    
  }
  pagingQueryData.pagingOrdering.push(buildPageOrderingRule(name, parsedDirection))
}

const joinPagingWhereConditions = (pagingConditions) => {
  let whereConditions = null
  
  for (const condition of pagingConditions){
    if (!whereConditions) {
      whereConditions = condition
      continue
    }
    if (whereConditions.indexOf(PAGE_CONDITION_FORMAT) === -1) break

    whereConditions = whereConditions.replace(PAGE_CONDITION_FORMAT, condition)
  }
  
  return whereConditions.indexOf(PAGE_CONDITION_FORMAT) === -1 ? whereConditions : ""
}

const joinOrderRules = (pagingOrderRules) => {
  return pagingOrderRules.join(", ")
}

const joinPagingQueryData = ({ pagingConditions, pagingOrdering }) => {
  let query = ""
  
  if (pagingConditions.length > 0){
    const whereConditions = joinPagingWhereConditions(pagingConditions)
    if (whereConditions) query += `WHERE ${whereConditions} `
  }
  
  const orderRules = joinOrderRules(pagingOrdering)
  
  query += `ORDER BY ${orderRules}`

  return query
}

// export const filterValidCursorOrderingFields = (fields,validOrderingFields) => {
//   fields.filter(v =>
//     validOrderingFields.includes(v.name) &&
//     (!v.direction || (
//       v.direction === -1 || v.direction === 1
//     ))
//   )
// }

export const parseCursorOrderingFieldsDirections = (fields, validOrderingFields) => {
  const newFields = []
  if (fields)
    for (const [name, direction] of Object.entries(fields)){
      if (validOrderingFields.includes(name))
        newFields.push({ name , direction })
    }

  return newFields
}

export const encodeCursor = (cursor) => {
  return btoa(JSON.stringify(cursor))
}

export const decodeCursor = (cursor) => {
  return JSON.parse(atob(cursor))
}

export const setCursorLast = (last, cursor, cursorSchema) => {
  if (!cursor.last) cursor.last = {}
  if (cursor.fields?.length)
    for (const field of cursor.fields){
      cursor.last[field.name] = last[field.name]
    }
  cursor.last.tiebreaker = last[cursorSchema.tiebreaker.name]
  cursor.last.id = last[cursorSchema.id.name]
}

export const applyCursorPagination = (baseQuery, cursor, cursorSchema) => {
  const valuesOffset = baseQuery.values?.length || 0
  const pageSize = cursor.pageSize || DEFAULT_PAGE_SIZE
  const pagingQueryData = {
    pagingConditions: [],
    pagingOrdering: [],
    pagingValues: []
  }
  
  if (cursor?.fields?.length){
    for (const field of cursor.fields){
      if (field.name === cursorSchema.tiebreaker.name || field.name === cursorSchema.id.name) continue
      addQueryData(field, cursor.last?.[field.name], pagingQueryData, valuesOffset)
    }
  }
  // cursorSchemea must define a field as the tiebreaker
  addQueryData(cursorSchema.tiebreaker, cursor?.last?.tiebreaker, pagingQueryData, valuesOffset)
  
  addQueryData(cursorSchema.id, cursor?.last?.id, pagingQueryData, valuesOffset, true)
  
  const text = `SELECT * FROM (${baseQuery.text}) ${joinPagingQueryData(pagingQueryData)} LIMIT ${pageSize}`
  const values = baseQuery.values?.length ? [...baseQuery.values,...pagingQueryData.pagingValues] : pagingQueryData.pagingValues
  return { text, values }
}