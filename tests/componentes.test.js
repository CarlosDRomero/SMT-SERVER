import supertest from "supertest"
import app from "../app"
import { limpiarTablas } from "./test_helper"
import { poolClient } from "../database/conexion"

app.removeAllListeners()
const api = supertest(app)

beforeAll(async () => {
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
})

describe("Componentes para los clientes", () => {
  let token;
  beforeAll(async () => {
    const res = await api.post("/auth/login").send({ clave: "test",email: "testing@tests.test.t.com" })
    token = res.body.token;
  })
  test("Un GET a la ruta /componentes/inventario obtiene los componentes existentes en el inventario", async () => {
    const res = await api.get("/componentes/inventario").expect(200)
    
    expect(res.body).toHaveLength(7)
    expect(res.body[0].marca).toBeDefined();
    expect(res.body[0].nombre).toBeDefined();
    expect(res.body[0].sku).toBeDefined();
    expect(res.body[0].precio).toBeDefined();
  })
  test("Un GET a la ruta /componentes/catalogo obtiene los componentes existentes en general", async () => {
    const res = await api.get("/componentes/catalogo").expect(200)
    
    expect(res.body).toHaveLength(7)
    expect(res.body[0].marca).toBeDefined();
    expect(res.body[0].nombre).toBeDefined();
    expect(res.body[0].sku).not.toBeDefined();
    expect(res.body[0].precio).not.toBeDefined();
  })
  test("Un GET a la ruta /componentes/especificaciones/:idcategoria obtiene una lista de las categorias posibles", async () => {
    const res = await api.get("/componentes/especificaciones/4").expect(200)
    
    expect(res.body).toHaveLength(4)
    expect(res.body.map(a => a.atributo)).toContain("vram");
    
  })
  test("Un GET a la ruta /componentes/catalogo/:idcomponente obtiene el componente general con su id de componente", async () => {
    const res = await api.get("/componentes/catalogo").expect(200)
  
    const idcomponente = res.body[0].idcomponente;
    expect(idcomponente).toBeDefined();

    const res2 = await api.get(`/componentes/catalogo/${idcomponente}`).expect(200)
    delete res2.body.especificaciones
    expect(res2.body).toEqual(res.body[0])
    
  })
  test("Un GET a la ruta /componentes/inventario/:idproducto obtiene el componente el inventario identificado con su id de producto", async () => {
    const res = await api.get("/componentes/inventario").expect(200)
  
    const idproducto = res.body[0].idproducto;
    expect(idproducto).toBeDefined();

    const res2 = await api.get(`/componentes/inventario/${idproducto}`).expect(200)
    
    expect(res2.body).toEqual(res.body[0])
    
  })
})
describe("Componentes para los admins/empleados",() => {
  let token;
  beforeAll(async () => {
    let res = await api.post("/auth/login").send({ clave: "admin",email: "admin@tests.test.t.com" })
    token = { admin: res.body.token }
    res = await api.post("/auth/login").send({ clave: "test",email: "testing@tests.test.t.com" })
    token = { ...token, cliente:res.body.token }
  })
  test("Solo un admin al hacer un POST a la ruta /componentes/catalogo podra crear un nuevo componente", async () => {
    const nuevaInfo = {
      idcategoria: 4,
      marca: "MARCA X",
      nombre: "GPU XD",
      descripcion: "Una gpu mas en el mercado",
      url_imagen: "https://imagen.com",
      especificaciones: [
        { idcat_espec: 13,valor: 4000 },
        { idcat_espec: 14,valor: "230MHz" },
        { idcat_espec: 15,valor: "300W" },
        { idcat_espec: 16,valor: "4GB" }
      ]
    }
    let { body:componentesb1 } = await api.get("/componentes/catalogo").expect(200)

    await api.post("/componentes/catalogo").send(nuevaInfo).set({ authorization: token.cliente }).expect(403)

    let { body:componentesa1 } = await api.get("/componentes/catalogo").expect(200)
    expect(componentesb1).toHaveLength(componentesa1.length);
    
    let { body: componentesb2 } = await api.get("/componentes/catalogo").expect(200)

    const res = await api.post("/componentes/catalogo").send(nuevaInfo).set({ authorization: token.admin }).expect(201)

    let { body: componentesa2 } = await api.get("/componentes/catalogo").expect(200)
    expect(componentesb2).toHaveLength(componentesa2.length - 1);

    

  })

  test("Solo un admin al hacer un PUT a la ruta /componentes/catalogo/:idcomponente podra crear un nuevo componente", async () => {
    let { body:componentesb1 } = await api.get("/componentes/catalogo").expect(200)
    const componenteb1 = componentesb1[3]
    const nuevaInfo = {
      idcategoria: 4,
      marca: "MSI",
      nombre: "MSIS",
      descripcion: componenteb1.descripcion,
      url_imagen: componenteb1.url_imagen
    }
    
    expect(componenteb1.idcomponente).toBeDefined();
    

    const res = await api.put(`/componentes/catalogo/${componenteb1.idcomponente}`).send(nuevaInfo).set({ authorization: token.cliente }).expect(403)

    const componentea1 = (await poolClient.query(`SELECT * FROM componente WHERE idcomponente='${componenteb1.idcomponente}'`)).rows[0]

    expect(componentea1).toEqual(componenteb1);
    

    await api.put(`/componentes/catalogo/${componenteb1.idcomponente}`).send(nuevaInfo).set({ authorization: token.admin }).expect(201)

    const componentea2 = (await poolClient.query(`SELECT * FROM componente WHERE idcomponente='${componenteb1.idcomponente}'`)).rows[0]

    expect(componentea2.marca).toBe("MSI");
    expect(componentea2.nombre).toBe("MSIS");

    expect(componentea2.url_imagen).toEqual(componenteb1.url_imagen);

  })

  test("Solo un admin al hacer un DELETE a la ruta /componentes/catalogo/:idcomponente podra eliminar un componente", async () => {
    let { body:componentesb1 } = await api.get("/componentes/catalogo").expect(200)

    await api.delete("/componentes/catalogo/c283e7b6-e291-412d-a25e-ab0b5c40229a").set({ authorization: token.cliente }).expect(403)

    let { body:componentesa1 } = await api.get("/componentes/catalogo").expect(200)
    expect(componentesb1).toHaveLength(componentesa1.length);
    
    let { body: componentesb2 } = await api.get("/componentes/catalogo").expect(200)

    await api.delete("/componentes/catalogo/c283e7b6-e291-412d-a25e-ab0b5c40229a").set({ authorization: token.admin }).expect(204)

    let { body: componentesa2 } = await api.get("/componentes/catalogo").expect(200)
    
    expect(componentesa2).toHaveLength(componentesb2.length - 1);

  })

  test("Solo un admin al hacer un POST a la ruta /componentes/inventario podra crear un nuevo componente", async () => {
    let { body:componentesb1 } = await api.get("/componentes/catalogo").expect(200)
    const componenteb1 = componentesb1[3]
    const nuevaInfo = {
      idcomponente: componenteb1.idcomponente,
      SKU: "XD-1123-SDF",
      disponibilidad: "40", // puede estar mal que sea string?
      precio: "1500000"
    }


    await api.post("/componentes/inventario").send(nuevaInfo).set({ authorization: token.cliente }).expect(403)

    let { body:componentesa1 } = await api.get("/componentes/catalogo").expect(200)
    expect(componentesb1).toHaveLength(componentesa1.length);

    await api.post("/componentes/inventario").send(nuevaInfo).set({ authorization: token.admin }).expect(201)

    let { body: componentesa2 } = await api.get("/componentes/catalogo").expect(200)
    expect(componentesa1).toHaveLength(componentesa2.length - 1);

  })

  test("Solo un admin al hacer un PUT a la ruta /componentes/inventario/:idproducto podra crear un nuevo componente", async () => {
    let { body:componentesb1 } = await api.get("/componentes/inventario").expect(200)
    const componenteb1 = componentesb1[3]
    const nuevaInfo = {
      SKU: "NOXD-1123-SDF",
      disponibilidad: "21", // puede estar mal que sea string?
      precio: componenteb1.precio
    }
    
    expect(componenteb1.idcomponente).toBeDefined();
    

    const res = await api.put(`/componentes/catalogo/${componenteb1.idcomponente}`).send(nuevaInfo).set({ authorization: token.cliente }).expect(403)

    let { body:componentea1 } = await api.get(`/componentes/inventario/${componenteb1.idcomponente}`).expect(200)

    expect(componentea1).toEqual(componenteb1);
    

    await api.put(`/componentes/inventario/${componenteb1.idcomponente}`).send(nuevaInfo).set({ authorization: token.admin }).expect(201)

    let { body:componentea2 } = await api.get(`/componentes/inventario/${componenteb1.idcomponente}`).expect(200)

    expect(componentea2.SKU).toBe(nuevaInfo.SKU);
    expect(componentea2.disponibilidad).toBe(nuevaInfo.disponibilidad);

    expect(componentea2.precio).toEqual(componenteb1.precio);

  })

  test("Solo un admin al hacer un DELETE a la ruta /componentes/inventario/:idproducto podra eliminar un componente", async () => {
    let { body:componentesb1 } = await api.get("/componentes/inventario").expect(200)
    const componenteb1 = componentesb1[3]

    await api.delete(`/componentes/inventario/${componenteb1.idproducto}`).set({ authorization: token.cliente }).expect(403)

    let { body:componentesa1 } = await api.get("/componentes/inventario").expect(200)
    expect(componentesb1).toHaveLength(componentesa1.length);
    
    let { body: componentesb2 } = await api.get("/componentes/inventario").expect(200)

    await api.delete(`/componentes/inventario/${componenteb1.idproducto}`).set({ authorization: token.admin }).expect(204)

    let { body: componentesa2 } = await api.get("/componentes/inventario").expect(200)
    
    expect(componentesa2).toHaveLength(componentesb2.length - 1);

  })
})