import { User } from "./user.model.js";
import type { IUser } from "./user.types.js";

export const userRepository = {
  async create(data: IUser) {
    return User.create(data);
  },

  async findByEmail(email: string) {
    return User.findOne({ email }).select("+passwordHash");
  },

  async findById(id: string) {
    return User.findById(id);
  },

  async existsByEmail(email: string) {
    return User.exists({ email });
  },
};
