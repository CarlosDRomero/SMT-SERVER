import supertest from "supertest"
import app from "../app"
import { limpiarTablas } from "./test_helper"
import { poolClient } from "../database/conexion"
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

  test("Un usuario puede agregar una o mas direcciones haciendo un POST a la ruta /domicilio/direcciones", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
    const usuario = tokens.verifyToken(jwt.body.token);
    const nuevaDireccion = {
      c_dane_departamento: "5",
      c_dane_municipio: "5.001",
      barrio: "Comuna 5",
      cadena_direccion: "Calle 13 #11-23, Sur???"
    }
    await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token).expect(201);
    const { rows: direccion } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
    expect(direccion[0].barrio).toEqual("Comuna 5");
    expect(direccion[0].predeterminada, "La primera direccion se deberia crear como predeterminada automaticamente").toBe(true);
    expect(direccion).toHaveLength(1);
    
    await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token).expect(201);
    const { rows: direccion2 } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
    console.log("DIRECCIONES CReADAS: ", direccion2)
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
      c_dane_departamento: "97",
      c_dane_municipio: "97.001",
      barrio: "Comuna 5",
      cadena_direccion: "Calle 13 #11-23, Sur???"
    }
    const usuario = tokens.verifyToken(jwt.body.token);
    const { rows: direccionesb } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
    
    const res = await api.put(`/domicilio/direcciones/${direccionesb[0].iddireccion}`).send(nuevaDireccion).set("authorization", jwt.body.token).expect(201);
    
    expect(res.body.c_dane_departamento, "Se deberia devolver la nueva direccion en la respuesta para esta peticion, para que el frontend la pueda actualizar, lo puede hacer con un RETUNING * al final de la consulta UPDATE")
      .toBe("97")
    expect(res.body.c_dane_municipio, "Se deberia devolver la nueva direccion en la respuesta para esta peticion, para que el frontend la pueda actualizar, lo puede hacer con un RETUNING * al final de la consulta UPDATE")
      .toBe("97.001")

    const q = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}' AND c_dane_municipio='97.001'`);

    expect(q.rows.length, "Puede ser que lo devuelva pero en la base de datos no se haya actualizado?").toBeGreaterThan(0)
    
  });
  test("Un usuario deberia poder borrar una de sus direcciones haciendo un DELETE a la ruta parametrizada /domicilio/direcciones/:id", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
    
    const usuario = tokens.verifyToken(jwt.body.token);
    const { rows: direccionesb } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
    await api.delete(`/domicilio/direcciones/${direccionesb[0].iddireccion}`).set("authorization", jwt.body.token).expect(204);
    
    
    const { rows: direccionesa } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);

    expect(direccionesa).toHaveLength(direccionesb.length - 1);
  });
  test("Un usuario no deberia poder eliminar o modificar la direccion de otro con un DELETE o PUT a la ruta parametrizada /domicilio/direcciones/:id", async () => {
    const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing2@tests.test.t.com" }).expect(200);
    const { rows: direccionesb } = await poolClient.query("SELECT * FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");
    const nuevaDireccion = {
      c_dane_departamento: "97",
      c_dane_municipio: "97.001",
      barrio: "Comuna 5",
      cadena_direccion: "CAMBIO MALICIOSO"
    }

    await api.put(`/domicilio/direcciones/${direccionesb[0].iddireccion}`).send(nuevaDireccion).set("authorization", jwt.body.token).expect(403);
    const cambio = await poolClient.query("SELECT * FROM direccion WHERE cadena_direccion='CAMBIO MALICIOSO'");
    
    expect(cambio.rows, "Se devolvio 401 pero aun asi hizo el cambio quien no debia").toHaveLength(0)
    await api.delete(`/domicilio/direcciones/${direccionesb[0].iddireccion}`).set("authorization", jwt.body.token).expect(403);
    
    const { rows: direccionesa } = await poolClient.query("SELECT * FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");

    expect(direccionesa).toHaveLength(direccionesb.length);
  });
  describe("Subrutas para administradores /domicilio/*/administrar/:idusuario", () => {
    beforeEach(async () => {
      await poolClient.query("DELETE FROM direccion;");
      const jwt = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" });
      const nuevaDireccion = {
        c_dane_departamento: "5",
        c_dane_municipio: "5.001",
        barrio: "Comuna 5",
        cadena_direccion: "Calle 13 #11-23, Sur???"
      }
      await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token);
      await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token);
      await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token);
      await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token);
      await api.post("/domicilio/direcciones").send(nuevaDireccion).set("authorization", jwt.body.token);
    })
    test("Solo admin deberia poder obtener las direcciones de un usuario haciendo un GET a la ruta parametrizada con la id de dicho usuario /domicilio/direcciones/administrar/:idusuario", async () => {
      const jwtadmin = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);
      const jwtusuario = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
      const { rows } = await poolClient.query("SELECT u.idusuario FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");

      let res = await api.get(`/domicilio/direcciones/administrar/${rows[0].idusuario}`).set("authorization", jwtadmin.body.token).expect(200);
  
      expect(res.body, `Este usuario deberia tener 2 direcciones pero se obtuvieron ${res.body.length}`).toHaveLength(5)
  
      res = await api.get(`/domicilio/direcciones/administrar/${rows[0].idusuario}`).set("authorization", jwtusuario.body.token).expect(403);
      console.log("res: ", res.body)
      expect(res.body.error).toBeDefined()
    });
    test("Solo admin deberia poder crear una direccion de un usuario haciendo un POST a la ruta parametrizada con la id de dicho usuario /domicilio/direcciones/administrar/:idusuario", async () => {
      await poolClient.query("DELETE FROM direccion;");
      const jwtadmin = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);
      const jwtusuario = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
      const usuario = tokens.verifyToken(jwtusuario.body.token);
      const nuevaDireccion = {
        c_dane_departamento: "5",
        c_dane_municipio: "5.001",
        barrio: "Comuna 5",
        cadena_direccion: "Calle 13 #11-23, Sur???"
      }
      await api.post(`/domicilio/direcciones/administrar/${usuario.idusuario}`).send(nuevaDireccion).set("authorization", jwtusuario.body.token).expect(403);
      const { rows: direccionUsuario } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
      expect(direccionUsuario[0]).toBeUndefined();

      await api.post(`/domicilio/direcciones/administrar/${usuario.idusuario}`).send(nuevaDireccion).set("authorization", jwtadmin.body.token).expect(201);
      const { rows: direccion } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
      expect(direccion[0].barrio).toEqual("Comuna 5");
      expect(direccion[0].predeterminada, "La primera direccion se deberia crear como predeterminada automaticamente").toBe(true);
      expect(direccion).toHaveLength(1);
    
      await api.post(`/domicilio/direcciones/administrar/${usuario.idusuario}`).send(nuevaDireccion).set("authorization", jwtadmin.body.token).expect(201);
      const { rows: direccion2 } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
      expect(direccion2).toHaveLength(2);
      expect(direccion2[1].predeterminada, "Si hay alguna direccion predeterminada las demas no deberian serlo").toBe(false);
    });
    test("Solo admin deberia poder modificar una direccion de un usuario haciendo un PUT a la ruta parametrizada con la id de dicho usuario /domicilio/direcciones/administrar/:idusuario/:iddireccion", async () => {
      const jwtadmin = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);
      const jwtusuario = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
      const usuario = tokens.verifyToken(jwtusuario.body.token);
      const nuevaDireccion = {
        c_dane_departamento: "97",
        c_dane_municipio: "97.001",
        barrio: "Comuna 5",
        cadena_direccion: "Calle 13 #11-23, Sur???"
      }
      const { rows: direccionesb } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
      let res = await api.put(`/domicilio/direcciones/administrar/${usuario.idusuario}/${direccionesb[0].iddireccion}`).send(nuevaDireccion).set("authorization", jwtadmin.body.token).expect(403);
      expect(res.body.error).toBeDefined()

      const q1 = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}' AND c_dane_municipio='97.001'`);

      expect(q1.rows.length, "Parece que el dueño de la direccion accedio y la pudo modificar desde la ruta de administradores, pero solo los admins deberian poder hacer esto").toBe(0)

      res = await api.put(`/domicilio/direcciones/administrar/${usuario.idusuario}/${direccionesb[0].iddireccion}`).send(nuevaDireccion).set("authorization", jwtadmin.body.token).expect(201);
    
      expect(res.body.c_dane_departamento, "Se deberia devolver la nueva direccion en la respuesta para esta peticion, para que el frontend la pueda actualizar, lo puede hacer con un RETUNING * al final de la consulta UPDATE")
        .toBe("97")
      expect(res.body.c_dane_municipio, "Se deberia devolver la nueva direccion en la respuesta para esta peticion, para que el frontend la pueda actualizar, lo puede hacer con un RETUNING * al final de la consulta UPDATE")
        .toBe("97.001")

      const q = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}' AND c_dane_municipio='97.001'`);

      expect(q.rows.length, "Puede ser que lo devuelva pero en la base de datos no se haya actualizado?").toBeGreaterThan(0)
    
    });
    test("Solo admin deberia poder eliminar una direccion de un usuario haciendo un DELETE a la ruta parametrizada con la id de dicho usuario /domicilio/direcciones/administrar/:idusuario/:iddireccion", async () => {
      const jwtadmin = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);
      const jwtusuario = await api.post("/auth/login").send({ clave: "test", email: "testing@tests.test.t.com" }).expect(200);
      const usuario = tokens.verifyToken(jwtusuario.body.token);
    
      const { rows: direccionesb } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
      await api.delete(`/domicilio/direcciones/administrar/${usuario.idusuario}/${direccionesb[0].iddireccion}`).set("authorization", jwtusuario.body.token).expect(403);

      const { rows: direccionesa1 } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);

      expect(direccionesa1, "Parece que a pesar de todo, sin ser admin se pudo borrar la direccion de otro usuario").toHaveLength(direccionesb.length);

      await api.delete(`/domicilio/direcciones/administrar/${usuario.idusuario}/${direccionesb[0].iddireccion}`).set("authorization", jwtadmin.body.token).expect(204);
    
    
      const { rows: direccionesa2 } = await poolClient.query(`SELECT * FROM direccion WHERE idusuario='${usuario.idusuario}'`);
      expect(direccionesa2).toHaveLength(direccionesb.length - 1);
    });

    test("Un admin no deberia poder eliminar o modificar la direccion de un cliente con un DELETE o PUT si la al usuario al que gestionara no le pertenece la direccion que intenta gestionar a la ruta parametrizada /domicilio/direcciones/administrar/:idusuario/:iddireccion", async () => {
      const jwtadmin = await api.post("/auth/login").send({ clave: "admin", email: "admin@tests.test.t.com" }).expect(200);
      const jwtusuario = await api.post("/auth/login").send({ clave: "test", email: "testing2@tests.test.t.com" }).expect(200);
  
      const usuario = tokens.verifyToken(jwtusuario.body.token);
      const { rows: direccionesb } = await poolClient.query("SELECT * FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");
      const nuevaDireccion = {
        c_dane_departamento: "97",
        c_dane_municipio: "97.001",
        barrio: "Comuna 5",
        cadena_direccion: "CAMBIO MALICIOSO"
      }

      await api.put(`/domicilio/direcciones/administrar/${usuario.idusuario}/${direccionesb[0].iddireccion}`).send(nuevaDireccion).set("authorization", jwtadmin.body.token).expect(403);
      
      const cambio = await poolClient.query("SELECT * FROM direccion WHERE cadena_direccion='CAMBIO MALICIOSO'");
    
      expect(cambio.rows, "Se devolvio 403 pero aun asi hizo el cambio quien no debia").toHaveLength(0)
      await api.delete(`/domicilio/direcciones/${usuario.idusuario}/${direccionesb[0].iddireccion}`).set("authorization", jwtadmin.body.token).expect(403);
    
      const { rows: direccionesa } = await poolClient.query("SELECT * FROM direccion d JOIN usuario u ON u.idusuario=d.idusuario WHERE u.email='testing@tests.test.t.com'");

      expect(direccionesa, "Parece que de todas maneras pudo eliminar la direccion aunque no le pertenecia al usuario que selecciono").toHaveLength(direccionesb.length);
    });
  })
  
  //TODO:IMPORTANTE > TESTS PARA QUE SOLO UN ADMIN PUEDA MODIFICAR LAS DIRECCIONES DE UN USUARIO
})
