import bcrypt from "bcrypt"

export const Encrypt = {
  encryptPassword: async (password) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  },

  comparePassword: async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword);
  }
}
