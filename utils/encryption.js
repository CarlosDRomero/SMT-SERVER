import bcrypt from "bcrypt"

//Valor que se quiere comparar
export const Encrypt = {
  toHash: async (value) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(value, salt)
  },
  /**
  * @param value Este es el valor puro que queremos comprobar.
  * @param hash Este es el valor encriptado al que vamos a comparar el argumento value.
  * @example
  *
  */
  compareHash: async (value, hash) => {
    return await bcrypt.compare(value, hash);
  }
}

