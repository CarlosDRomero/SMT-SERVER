import supertest from "supertest"
import app from "../app"
import { limpiarTablas } from "./test_helper"
import { pool } from "../database/conexion"
import { tokens } from "../services/tokens"

app.removeAllListeners()
const api = supertest(app)

beforeAll(async () => {
  await limpiarTablas();
})

describe("Listas para el formulario", () => {
  test("Al pedir los departamentos se trae una lista que contiene 33 (Contando a Bogotá D.C.)", async () => {
    const res = await api.get("/domicilio/listadepartamentos").expect(200);
    expect(res.body, `Parece que se obtuvieron ${res.body.length}`).toHaveLength(33);

  })
  test("Al pedir los municipios del departamento 5 por el body, en una propiedad llamada: c_departamento trae una lista que contiene 125 elementos", async () => {
    const res = await api.get("/domicilio/listamunicipios/5").send({ c_departamento: 5 }).expect(200);
    expect(res.body, `Parece que se obtuvieron ${res.body.length}`).toHaveLength(125);
  })
  test("Al pedir los municipios de un departamento cuyo codigo no existe, por el body, en una propiedad llamada: c_departamento, se obtiene una lista vacia", async () => {
    const res = await api.get("/domicilio/listamunicipios/1").send({ c_departamento: 1 }).expect(200);
    expect(res.body, `Parece que se obtuvieron ${res.body.length}`).toHaveLength(0);
  })
  test("Al pedir los municipios del departamento 5 por parametros trae una lista que contiene 125 elementos", async () => {
    const res = await api.get("/domicilio/listamunicipios/5").expect(200);
    expect(res.body, `Parece que se obtuvieron ${res.body.length}`).toHaveLength(125);
  })
  test("Al pedir los municipios de un departamento cuyo codigo no existe, por parametros, se obtiene una lista vacia", async () => {
    const res = await api.get("/domicilio/listamunicipios/1").expect(200);
    expect(res.body, `Parece que se obtuvieron ${res.body.length}`).toHaveLength(0);

  })
})

describe("CRUD de direcciones", () => {
  beforeAll(async () => {
    console.log("Registrando usuario de testeo");
    await api.post("/auth/register").send({
      nombres: "Test",
      apellidos: "Test Man",
      clave: "test",
      email: "testing@tests.test.t.com",
      fecha_nac: "2003-06-06"
    })
    await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing@tests.test.t.com'")

    await api.post("/auth/register").send({
      nombres: "Test",
      apellidos: "Test O=ther",
      clave: "test",
      email: "testing2@tests.test.t.com",
      fecha_nac: "2003-06-06"
    })
    await pool.query("UPDATE usuario SET confirmado=true WHERE email='testing2@tests.test.t.com'")

    console.log("Registrando usuario admin");
    await api.post("/auth/register").send({
      nombres: "Admin",
      apellidos: "Admin Man",
      clave: "admin",
      email: "admin@tests.test.t.com",
      fecha_nac: "2003-06-06"
    })
    await pool.query("UPDATE usuario SET confirmado=true, rol='admin' WHERE email='admin@tests.test.t.com'")
  })

  test("Un usuario puede agregar una o mas direcciones haciendo un POST a la ruta /domicilio/direcciones", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
    const usuario = tokens.verifyToken(jwt.body.token);
    const nuevaDireccion = {
      c_departamento: "5",
      c_municipio: "5.001",
      barrio: "Comuna 5",
      cadena_direccion: "Calle 13 #11-23, Sur???"
    }
    await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token).expect(201);
    const { rows: direccion } = await pool.query(`SELECT * FROM direccion WHERE idusuario=${usuario.idusuario}`);
    expect(direccion[0].barrio).toEqual("Comuna 5");
    expect(direccion[0].predeterminada, "La primera direccion se deberia crear como predeterminada automaticamente").toBe(true);
    expect(direccion).toHaveLength(1);
    
    await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token).expect(201);
    const { rows: direccion2 } = await pool.query(`SELECT * FROM direccion WHERE idusuario=${usuario.idusuario}`);
    expect(direccion2).toHaveLength(2);
    expect(direccion2[1].predeterminada, "Si hay alguna direccion predeterminada las demas no deberian serlo").toBe(false);
  });
  test("Un usuario puede obtener sus direcciones haciendo un GET a la ruta /domicilio/direcciones", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
    const usuario = tokens.verifyToken(jwt.body.token);
    const res = await api.get("/domicilio/direcciones").set("authorization", jwt.body.token).expect(200);

    expect(res.body, `Este usuario deberia tener 2 direcciones pero se obtuvieron ${res.body.length}`).toHaveLength(2)

    res.body.forEach(d => expect(d.idusuario, "Esto solo deberia traer las direcciones que le pertenecen al usuario de la peticion").toEqual(usuario.idusuario));
    
  });
  test("Un usuario deberá poder modificar una de sus direcciones haciendo un PUT en la ruta parametrizada /domicilio/direcciones/:id", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
    const nuevaDireccion = {
      c_departamento: "97",
      c_municipio: "97.001",
      barrio: "Comuna 5",
      cadena_direccion: "Calle 13 #11-23, Sur???"
    }
    const usuario = tokens.verifyToken(jwt.body.token);
    const { rows: direccionesb } = await pool.query(`SELECT * FROM direccion WHERE idusuario=${usuario.idusuario}`);
    const res = await api.get(`/domicilio/direcciones/${direccionesb[0].iddireccion}`).send(nuevaDireccion).set("authorization", jwt.body.token).expect(204);

    expect(res.body.c_dane_departamento, "Se deberia devolver la nueva direccion en la respuesta para esta peticion, para que el frontend la pueda actualizar, lo puede hacer con un RETUNING * al final de la consulta UPDATE")
      .toBe("97")
    expect(res.body.c_dane_municipio, "Se deberia devolver la nueva direccion en la respuesta para esta peticion, para que el frontend la pueda actualizar, lo puede hacer con un RETUNING * al final de la consulta UPDATE")
      .toBe("97.001")

    const q = await pool.query(`SELECT * FROM direccion WHERE idusuario=${usuario.idusuario} AND c_dane_municipio=97.001`);

    expect(q.rows.length, "Puede ser que lo devuelva pero en la base de datos no se haya actualizado?").toBeGreaterThan(0)
    
  });
  test("Un usuario deberia poder borrar una de sus direcciones haciendo un DELETE a la ruta parametrizada /domicilio/direcciones/:id", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
    
    const usuario = tokens.verifyToken(jwt.body.token);
    const { rows: direccionesb } = await pool.query(`SELECT * FROM direccion WHERE idusuario=${usuario.idusuario}`);
    await api.delete(`/domicilio/direcciones/${direccionesb[0].iddireccion}`).set("authorization", jwt.body.token).expect(204);
    
    const { rows: direccionesa } = await pool.query(`SELECT * FROM direccion WHERE idusuario=${usuario.idusuario}`);

    expect(direccionesa).toHaveLength(direccionesb.length - 1);
  });
  test("Un usuario no deberia poder eliminar o modificar la direccion de otro con un DELETE o PUT a la ruta parametrizada /domicilio/direcciones/:id", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing2@tests.test.t.com" }).expect(200);
    const { rows: direccionesb } = await pool.query("SELECT * FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");
    const nuevaDireccion = {
      c_departamento: "97",
      c_municipio: "97.001",
      barrio: "Comuna 5",
      cadena_direccion: "CAMBIO MALICIOSO"
    }
    await api.put(`/domicilio/direcciones/${rows[0].iddireccion}`).send(nuevaDireccion).set("authorization", jwt.body.token).expect(403);
    const cambio = await pool.query("SELECT * FROM direccion WHERE cadena_direccion='CAMBIO MALICIOSO'");
    expect(cambio.rows, "Se devolvio 401 pero aun asi hizo el cambio quien no debia").toHaveLength(0)
    await api.delete(`/domicilio/direcciones/${rows[0].iddireccion}`).set("authorization", jwt.body.token).expect(403);
    
    const { rows: direccionesa } = await pool.query("SELECT * FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");

    expect(direccionesa).toHaveLength(direccionesb.length);
  });

  test("Solo admin deberia poder obtener las direcciones de un usuario haciendo un GET a la ruta parametrizada con la id de dicho usuario /domicilio/direcciones/:id", async () => {
    const jwtadmin = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);
    const jwtusuario = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
    const { rows } = await pool.query("SELECT u.idusuario FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");
    
    let res = await api.get(`/domicilio/direcciones/${rows[0].idusuario}`).set("authorization", jwtadmin.body.token).expect(200);

    expect(res.body, `Este usuario deberia tener 2 direcciones pero se obtuvieron ${res.body.length}`).toHaveLength(2)

    res = await api.get(`/domicilio/direcciones/${rows[0].idusuario}`).set("authorization", jwtusuario.body.token).expect(403);

    expect(res.body.error).toBeDefined()
  });
  //TODO:IMPORTANTE > TESTS PARA QUE SOLO UN ADMIN PUEDA MODIFICAR LAS DIRECCIONES DE UN USUARIO
})
