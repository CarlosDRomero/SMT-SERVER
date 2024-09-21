import supertest from "supertest"
import app from "../app"
import { limpiarTablas } from "./test_helper"
import { poolClient } from "../database/conexion"

app.removeAllListeners()
const api = supertest(app)

beforeAll((done) => {
  setTimeout(async() => {
    await limpiarTablas();
    console.log("Registrando usuario de testeo");
    await api.post("/auth/register").send({
      nombres: "Test",
      apellidos: "Test Man",
      clave: "test",
      email: "testing@tests.test.t.com",
      fecha_nac: "2003-06-06"
    })
    await poolClient.query("UPDATE usuario SET confirmado=true WHERE email='testing@tests.test.t.com'")

    await api.post("/auth/register").send({
      nombres: "Test",
      apellidos: "Test O=ther",
      clave: "test",
      email: "testing2@tests.test.t.com",
      fecha_nac: "2003-06-06"
    })
    await poolClient.query("UPDATE usuario SET confirmado=true WHERE email='testing2@tests.test.t.com'")

    console.log("Registrando usuario admin");
    await api.post("/auth/register").send({
      nombres: "Admin",
      apellidos: "Admin Man",
      clave: "admin",
      email: "admin@tests.test.t.com",
      fecha_nac: "2003-06-06"
    })
    await poolClient.query("UPDATE usuario SET confirmado=true, rol='admin' WHERE email='admin@tests.test.t.com'")
    done()
  },3000)
},10000)

describe("Productos para los clientes", () => {
  let token;
  beforeAll(async () => {
    const res = await api.post("/auth/login").send({ clave: "test",email: "testing@tests.test.t.com" })
    token = res.body.token;
  })
  test("Un GET a la ruta /productos/inventario obtiene los productos existentes en el inventario", async () => {
    const res = await api.get("/productos/inventario").expect(200)
    
    expect(res.body).toHaveLength(7)
    expect(res.body[0].marca).toBeDefined();
    expect(res.body[0].nombre).toBeDefined();
    expect(res.body[0].sku).toBeDefined();
    expect(res.body[0].precio).toBeDefined();
  })
  test("Un GET a la ruta /productos/catalogo obtiene los productos existentes en general", async () => {
    const res = await api.get("/productos/catalogo").expect(200)
    
    expect(res.body).toHaveLength(7)
    expect(res.body[0].marca).toBeDefined();
    expect(res.body[0].nombre).toBeDefined();
    expect(res.body[0].sku).not.toBeDefined();
    expect(res.body[0].precio).not.toBeDefined();
  })
  test("Un GET a la ruta /productos/especificaciones-categoria/:idcategoria obtiene una lista de las categorias posibles", async () => {
    const res = await api.get("/productos/especificaciones-categoria/4").expect(200)
    
    expect(res.body).toHaveLength(4)
    expect(res.body.map(a => a.atributo)).toContain("vram");
    
  })
  test("Un GET a la ruta /productos/catalogo/:idproducto obtiene el producto general con su id de producto", async () => {
    const res = await api.get("/productos/catalogo").expect(200)
  
    const idproducto = res.body[0].idproducto;
    expect(idproducto).toBeDefined();

    const res2 = await api.get(`/productos/catalogo/${idproducto}`).expect(200)
    delete res2.body.especificaciones
    expect(res2.body).toEqual(res.body[0])
    
  })
  test("Un GET a la ruta /productos/inventario/:idproducto obtiene el producto el inventario identificado con su id de producto", async () => {
    const res = await api.get("/productos/inventario").expect(200)
  
    const idproducto = res.body[0].idproducto;
    expect(idproducto).toBeDefined();

    const res2 = await api.get(`/productos/inventario/${idproducto}`).expect(200)
    
    expect(res2.body).toEqual(res.body[0])
    
  })
})
describe("Productos para los admins/empleados",() => {
  let token;
  beforeAll(async () => {
    let res = await api.post("/auth/login").send({ clave: "admin",email: "admin@tests.test.t.com" })
    token = { admin: res.body.token }
    res = await api.post("/auth/login").send({ clave: "test",email: "testing@tests.test.t.com" })
    token = { ...token, cliente:res.body.token }
  })
  test("Solo un admin al hacer un POST a la ruta /productos/catalogo podra crear un nuevo producto", async () => {
    const nuevaInfo = {
      idcategoria: 4,
      marca: "MARCA X",
      nombre: "GPU XD",
      descripcion: "Una gpu mas en el mercado",
      url_imagen: "https://imagen.com",
      especificaciones: [
        { idespec: 13,valor: 4000 },
        { idespec: 14,valor: "230MHz" },
        { idespec: 15,valor: "300W" },
        { idespec: 16,valor: "4GB" }
      ]
    }

    let { body:productosb1 } = await api.get("/productos/catalogo").expect(200)

    await api.post("/productos/catalogo").send(nuevaInfo).set({ authorization: token.cliente }).expect(403)

    let { body:productosa1 } = await api.get("/productos/catalogo").expect(200)
    expect(productosb1).toHaveLength(productosa1.length);
    
    let { body: productosb2 } = await api.get("/productos/catalogo").expect(200)

    await api.post("/productos/catalogo").send(nuevaInfo).set({ authorization: token.admin }).expect(201)
    
    let { body: productosa2 } = await api.get("/productos/catalogo").expect(200)
    expect(productosb2).toHaveLength(productosa2.length - 1);


    

  })

  test("Solo un admin al hacer un PUT a la ruta /productos/catalogo/:idproducto podra crear un nuevo producto", async () => {
    let { body:productosb1 } = await api.get("/productos/catalogo").expect(200)
    const productob1 = productosb1[3]
    const nuevaInfo = {
      idcategoria: 3,
      marca: "MSI",
      nombre: "MSIS",
      descripcion: productob1.descripcion,
      url_imagen: productob1.url_imagen,
      especificaciones: [
        { idespec: 9,valor: "23MHz" },
        { idespec: 10,valor: "8GB" }
      ]
    }
    
    expect(productob1.idproducto).toBeDefined();
    

    await api.put(`/productos/catalogo/${productob1.idproducto}`).send(nuevaInfo).set({ authorization: token.cliente }).expect(403)

    const productoa1 = (await poolClient.query(`SELECT * FROM producto WHERE idproducto='${productob1.idproducto}'`)).rows[0]

    expect(productoa1).toEqual(productob1);
    

    const res = await api.put(`/productos/catalogo/${productob1.idproducto}`).send(nuevaInfo).set({ authorization: token.admin }).expect(201)
    const productoa2 = (await poolClient.query(`SELECT * FROM producto WHERE idproducto='${productob1.idproducto}'`)).rows[0]

    expect(productoa2.marca).toBe("MSI");
    expect(productoa2.nombre).toBe("MSIS");

    expect(productoa2.url_imagen).toEqual(productob1.url_imagen);

  })

  test("Solo un admin al hacer un DELETE a la ruta /productos/catalogo/:idproducto podra eliminar un producto", async () => {
    let { body:productosb1 } = await api.get("/productos/catalogo").expect(200)

    await api.delete("/productos/catalogo/c283e7b6-e291-412d-a25e-ab0b5c40229a").set({ authorization: token.cliente }).expect(403)

    let { body:productosa1 } = await api.get("/productos/catalogo").expect(200)
    expect(productosb1).toHaveLength(productosa1.length);
    
    let { body: productosb2 } = await api.get("/productos/catalogo").expect(200)

    await api.delete("/productos/catalogo/c283e7b6-e291-412d-a25e-ab0b5c40229a").set({ authorization: token.admin }).expect(204)

    let { body: productosa2 } = await api.get("/productos/catalogo").expect(200)
    
    expect(productosa2).toHaveLength(productosb2.length - 1);

  })

  test("Solo un admin al hacer un POST a la ruta /productos/inventario podra crear un nuevo producto", async () => {
    let { body:catalogo } = await api.get("/productos/catalogo").expect(200)
    const productob1 = catalogo[3]
    const nuevaInfo = {
      sku: "XD-1123-SDF",
      disponibilidad: "40", // puede estar mal que sea string?
      precio: "1500000"
    }

    let { body:productosb1 } = await api.get("/productos/inventario").expect(200)

    await api.post(`/productos/inventario/${productob1.idproducto}`).send(nuevaInfo).set({ authorization: token.cliente }).expect(403)

    let { body:productosa1 } = await api.get("/productos/inventario").expect(200)
    expect(productosb1).toHaveLength(productosa1.length);

    await api.post(`/productos/inventario/${productob1.idproducto}`).send(nuevaInfo).set({ authorization: token.admin }).expect(201)

    let { body: productosa2 } = await api.get("/productos/inventario").expect(200)
    expect(productosa1).toHaveLength(productosa2.length - 1);

  })

  test("Solo un admin al hacer un PUT a la ruta /productos/inventario/:idproducto podra crear un nuevo producto", async () => {
    let { body:productosb1 } = await api.get("/productos/inventario").expect(200)
    const productob1 = productosb1[3]
    const nuevaInfo = {
      sku: "NOXD-1123-SDF",
      disponibilidad: "21", // puede estar mal que sea string?
      precio: productob1.precio
    }
    
    expect(productob1.idproducto).toBeDefined();
    
    const res = await api.put(`/productos/inventario/${productob1.idproducto}`).send(nuevaInfo).set({ authorization: token.cliente }).expect(403)
    let { body:productoa1 } = await api.get(`/productos/inventario/${productob1.idproducto}`).expect(200)

    expect(productoa1).toEqual(productob1);
    

    await api.put(`/productos/inventario/${productob1.idproducto}`).send(nuevaInfo).set({ authorization: token.admin }).expect(201)

    let { body:productoa2 } = await api.get(`/productos/inventario/${productob1.idproducto}`).expect(200)

    expect(productoa2.sku).toBe(nuevaInfo.sku);
    expect(productoa2.disponibilidad).toBe(Number(nuevaInfo.disponibilidad));

    expect(productoa2.precio).toEqual(productob1.precio);

  })

  test("Solo un admin al hacer un DELETE a la ruta /productos/inventario/:idproducto podra eliminar un producto", async () => {
    let { body:productosb1 } = await api.get("/productos/inventario").expect(200)
    const productob1 = productosb1[3]

    await api.delete(`/productos/inventario/${productob1.idproducto}`).set({ authorization: token.cliente }).expect(403)

    let { body:productosa1 } = await api.get("/productos/inventario").expect(200)
    expect(productosb1).toHaveLength(productosa1.length);
    
    let { body: productosb2 } = await api.get("/productos/inventario").expect(200)

    await api.delete(`/productos/inventario/${productob1.idproducto}`).set({ authorization: token.admin }).expect(204)

    let { body: productosa2 } = await api.get("/productos/inventario").expect(200)
    
    expect(productosa2).toHaveLength(productosb2.length - 1);

  })
})