import bcrypt from "bcrypt"

export const Encrypt = {
  toHash: async (value) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(value, salt)
  },

  compareHash: async (value, hash) => {
    return await bcrypt.compare(value, hash);
  }
}
