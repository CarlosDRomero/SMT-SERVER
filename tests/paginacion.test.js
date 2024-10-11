import supertest from "supertest"
import app from "../app.js"
import { poolClient } from "../database/conexion.js"
import { limpiarTablas } from "./test_helper.js"
import { productoController } from "../controllers/producto.js"
import { applyCursorPagination, parseCursorOrderingFieldsDirections } from "../utils.js"

const api = supertest(app)

beforeAll(async () => {
  await limpiarTablas()
}, 5000)

describe("Pagination tests",() => {
  test("Full pagination is equal to the full query", async () => {

    const cursorsetup = {
      orderby: {
        disponibilidad: -1
      }
    }
    const fullQuery = applyCursorPagination({ text: "SELECT * FROM producto", values: [] }, {
      fields: parseCursorOrderingFieldsDirections(cursorsetup.orderby, productoController.orderValidFields)
    }, productoController.pageCursorSchema)
    fullQuery.text = fullQuery.text.split("LIMIT")[0]
    console.log(fullQuery)
    const rawFullResults = (await poolClient.query(fullQuery)).rows
    const fullResults = rawFullResults.map(r => JSON.parse(JSON.stringify(r)))

    let results = []
    let cursor = null;
    let newBatch ;
    do{
      let res;
      if (!cursor) res = await api.get("/productos/inventario").set("pagination",JSON.stringify({
        cursorsetup
      }))
      else res = await api.get("/productos/inventario").set("pagination",JSON.stringify({
        cursor
      }))
    
      cursor = res.body.nextPageCursor
      newBatch = res.body.data
      results = results.concat(newBatch)
      // console.log(cursor)
    }while (newBatch.length > 0 );

  

    expect(fullResults).toHaveLength(results.length)

    expect(fullResults).toEqual(results)
  }, 100000)

  test("Full pagination is equal to the full query without a setup", async () => {

    const cursorsetup = {
      // orderby: {
      //   disponibilidad: -1
      // }
    }
    const fullQuery = applyCursorPagination({ text: "SELECT * FROM producto", values: [] }, {
      fields: parseCursorOrderingFieldsDirections(cursorsetup.orderby, productoController.orderValidFields)
    }, productoController.pageCursorSchema)
    fullQuery.text = fullQuery.text.split("LIMIT")[0]
    console.log(fullQuery)
    const rawFullResults = (await poolClient.query(fullQuery)).rows
    const fullResults = rawFullResults.map(r => JSON.parse(JSON.stringify(r)))

    let results = []
    let cursor = null;
    let newBatch ;
    do{
      let res;
      if (!cursor) res = await api.get("/productos/inventario").set("pagination",JSON.stringify({
        cursorsetup
      }))
      else res = await api.get("/productos/inventario").set("pagination",JSON.stringify({
        cursor
      }))
    
      cursor = res.body.nextPageCursor
      newBatch = res.body.data
      results = results.concat(newBatch)
      // console.log(cursor)
    }while (newBatch.length > 0 );

  

    expect(fullResults).toHaveLength(results.length)

    expect(fullResults).toEqual(results)
  }, 100000)

  test("Invalid values in cursorSetup directions returns a 400 error", async () => {
    await api.get("/productos/inventario").set("pagination",JSON.stringify({
      cursor: 10
    })).expect(400)

    let cursorsetup = {
      orderby: {
        disponibilidad: 2
      }
    }
    await api.get("/productos/inventario").set("pagination",JSON.stringify({
      cursorsetup
    })).expect(400)

    cursorsetup = {
      orderby: {
        disponibilidad: -2
      }
    }
    await api.get("/productos/inventario").set("pagination",JSON.stringify({
      cursorsetup
    })).expect(400)

    cursorsetup = {
      orderby: {
        disponibilidad: "ASC"
      },
      pagesize: 30
    }
    await api.get("/productos/inventario").set("pagination",JSON.stringify({
      cursorsetup
    })).expect(400)

    cursorsetup = {
      orderby: {
        precio: 1
      },
      pagesize: -1
    }
    await api.get("/productos/inventario").set("pagination",JSON.stringify({
      cursorsetup
    })).expect(400)

    
  }, 5000)
})

