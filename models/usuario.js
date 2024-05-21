import { poolClient } from "../database/conexion.js"

export const usuarioModel = {
  
  limpiarUsuario: async (idUsuario) => {
    const query = {
      name: "limpiar-usuario",
      text: "DELETE FROM usuario WHERE idUsuario=$1",
      values: [idUsuario]
    }
    
    const result = await poolClient.query(query);
    return result.rows[0]
  },
  validateEnterpriseEmail: async (email) => {
    const query = {
      name: "validar-miembro-empresa",
      text: "SELECT * FROM usuario WHERE email=$1 AND (rol='admin' OR rol='empleado')",
      values: [email]
    }
    
    const result = await poolClient.query(query);
    return result.rows[0];
  },
  findByEmailOrUserName: async (userInfo) => {
    const query = {
      name: "obtener-usuario",
      text: "SELECT * FROM usuario WHERE nombre_usuario=$1 OR email=$2",
      values: [userInfo.nombreUsuario, userInfo.email]
    }
    
    const result = await poolClient.query(query);
    return result.rows[0]
  },

  findById: async (idusuario) => {
    const query = {
      name: "obtener-usuario-id",
      text: "SELECT * FROM usuario WHERE idusuario=$1",
      values: [idusuario]
    }
    
    const result = await poolClient.query(query);
    return result.rows[0]
  },
  
  findByIdCodigo: async (idcodigo) => {
    const query = {
      name: "obtener-usuario-codigo",
      text: "SELECT * FROM usuario AS u JOIN codigo_verificacion AS c ON c.idusuario=u.idusuario WHERE c.idcodigo=$1",
      values: [idcodigo]
    }
  
    const result = await poolClient.query(query);
    return result.rows[0]
  },
  
  registrar: async ( userInfo ) => {
    const query = {
      name: "registrar-cliente",
      text: "INSERT INTO usuario (nombres, apellidos, clave, nombre_usuario, email, fecha_nac) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      values: [
        userInfo.nombres,
        userInfo.apellidos,
        userInfo.clave,
        userInfo.nombreUsuario,
        userInfo.email,
        userInfo.fecha_nac
      ]
    }
  
    const result = await poolClient.query(query);
    return result.rows[0]
  },
  actualizarRol: async ( rol, idusuario ) => {
    const query = {
      name: "actualizar-rol",
      text: "UPDATE usuario SET rol=$1 WHERE idusuario=$2",
      values: [
        rol,
        idusuario
      ]
    }
  
    const result = await poolClient.query(query);
    return result.rows[0]
  },
  confirmar: async (idUsuario) => {
    const query = {
      name: "confirmar-usuario",
      text: "UPDATE usuario SET confirmado=true WHERE idusuario=$1 RETURNING *",
      values: [idUsuario]
    }
  
    const result = await poolClient.query(query);
    return result.rows[0]
  },
  getUsersByRole: async (rol) => {
    const query = {
      name: "obtener-usuarios-rol",
      text: "SELECT email,nombre_usuario,nombres,apellidos, idusuario FROM usuario WHERE rol=$1",
      values: [rol]
    }
  
    const result = await poolClient.query(query);
    return result.rows
  }
}
