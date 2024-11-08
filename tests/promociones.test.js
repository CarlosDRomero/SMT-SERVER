import supertest from "supertest"
import app from "../app.js"
import { poolClient } from "../database/conexion.js"
import { limpiarTablas } from "./test_helper.js"

const api = supertest(app)

beforeAll(async () => {
  await limpiarTablas(["oferta","usuario"])
})


describe("Tests de ofertas", () => {
  beforeAll(async () => {
    await limpiarTablas();
    await api.post("/auth/register").send({
      nombres: "un admin",
      apellidos: "ese admin",
      clave: "admin",
      email: "admin@tests.test.t.com",
      fecha_nac: "2003-06-06"
    })
    await poolClient.query("UPDATE usuario SET confirmado=true, rol='admin' WHERE email='admin@tests.test.t.com'")
  })
  test("No se puede agregar una oferta con campos incorrectos", async () => {
    const { body: { token: jwtadmin } } = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);
    
    // CUANDO EL PORCENTAJE NO ES VALIDO
    await api.post("/productos/ofertas").send({
      porcentaje: 2,
      fecha_inicio: "2023-12-22",
      fecha_fin: "2023/12/25",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idproducto: "f4824701-bb5a-48ab-9f28-8dd4405d35da"
    }).set("authorization", jwtadmin).expect(400);
    await api.post("/productos/ofertas").send({
      porcentaje: 0,
      fecha_inicio: "2023-12-22",
      fecha_fin: "2023/12/25",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idproducto: "f4824701-bb5a-48ab-9f28-8dd4405d35da"
    }).set("authorization", jwtadmin).expect(400);

    // CUANDO LA FECHA FIN ES MENOR A LA FECHA DE INICIO
    await api.post("/productos/ofertas").send({
      porcentaje: 0.12,
      fecha_inicio: "2023-12-28",
      fecha_fin: "2023/12/25",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idproducto: "f4824701-bb5a-48ab-9f28-8dd4405d35da"
    }).set("authorization", jwtadmin).expect(400);

    // CUANDO SE ENVIAN TANTO ID DE CATEGORIA COMO DE PRODUCTO
    await api.post("/productos/ofertas").send({
      porcentaje: 0.12,
      fecha_inicio: "2023-12-22",
      fecha_fin: "2023/12/25",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idproducto: "f4824701-bb5a-48ab-9f28-8dd4405d35da",
      idcategoria: 1
    }).set("authorization", jwtadmin).expect(400);

    // CUANDO SE ENVIAN TANTO ID DE CATEGORIA COMO DE PRODUCTO
    await api.post("/productos/ofertas").send({
      porcentaje: 0.12,
      fecha_inicio: "2023-12-22",
      fecha_fin: "2023/12/25",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      
      idcategoria: 0
    }).set("authorization", jwtadmin).expect(400);

    await api.post("/productos/ofertas").send({
      porcentaje: 0.16,
      fecha_inicio: "2023-12-22",
      fecha_fin: "2023/12/25",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      
      idproducto: "a"
    }).set("authorization", jwtadmin).expect(400);
    
    // CUANDO NO SE PONE NINGUNA ID
    await api.post("/productos/ofertas").send({
      porcentaje: 0.16,
      fecha_inicio: "2023-12-22",
      fecha_fin: "2023/12/25",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
    }).set("authorization", jwtadmin).expect(400);

  })

  test("Se puede crear una oferta por categoria", async () => {
    const { body: { token: jwtadmin } } = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);

    const infoOferta = {
      porcentaje: 0.16,
      fecha_inicio: "2023-12-26",
      fecha_fin: "2023/12/29",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idcategoria: 4
    }
    await api.post("/productos/ofertas").send(infoOferta).set("authorization", jwtadmin).expect(200);
    infoOferta.idcategoria = 5
    await api.post("/productos/ofertas").send(infoOferta).set("authorization", jwtadmin).expect(200);
    infoOferta.idcategoria = 6
    await api.post("/productos/ofertas").send(infoOferta).set("authorization", jwtadmin).expect(200);
    infoOferta.idcategoria = 7
    await api.post("/productos/ofertas").send(infoOferta).set("authorization", jwtadmin).expect(200);
    infoOferta.idcategoria = 17
    await api.post("/productos/ofertas").send(infoOferta).set("authorization", jwtadmin).expect(200);


    let { rows: ofertas } = await poolClient.query({ text:"SELECT * FROM oferta" })
    expect(ofertas).toHaveLength(5)

  })
  test("No se pueden crear ofertas en la misma categoria y que se crucen", async () => {
    const { body: { token: jwtadmin } } = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);

    await api.post("/productos/ofertas").send({
      porcentaje: 0.16,
      fecha_inicio: "2024-12-26",
      fecha_fin: "2024/12/29",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idcategoria: 4
    }).set("authorization", jwtadmin).expect(200);

    await api.post("/productos/ofertas").send({
      porcentaje: 0.16,
      fecha_inicio: "2024-12-28",
      fecha_fin: "2025/01/2",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idcategoria: 4
    }).set("authorization", jwtadmin).expect(409);

    await api.post("/productos/ofertas").send({
      porcentaje: 0.16,
      fecha_inicio: "2024-12-28",
      fecha_fin: "2025/01/2",
      asunto: "Un 12% de descuento en memorias RAM",
      descripcion: "Ofrecemos un 12% de descuento en memorias ram, para que tu equipo funcione con las mejores tecnologías.",
      idcategoria: 5
    }).set("authorization", jwtadmin).expect(200);
  })

  
})