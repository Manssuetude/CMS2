import { createHash } from "node:crypto";
import { resolveUserByEmail } from "@/lib/auth";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export const authRepository = {
  hashPassword,

  async verify(email: string, password: string) {
    const user = await resolveUserByEmail(email);
    if (!user) return null;
    const passwordHash = user.password_hash;
    if (passwordHash && passwordHash !== hashPassword(password)) return null;
    return user;
  },
};
