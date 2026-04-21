import { SignJWT, jwtVerify } from "jose";
import type { Username, JwtClaims } from "@cards/shared";

const ALG = "HS256";
const EXPIRES_SEC = 60 * 60 * 24 * 30;

export interface Jwt {
  issue(username: Username): Promise<{ token: string; expiresAt: number }>;
  verify(token: string): Promise<JwtClaims>;
}

export function createJwt(secret: string): Jwt {
  const key = new TextEncoder().encode(secret);
  return {
    async issue(username) {
      const now = Math.floor(Date.now() / 1000);
      const exp = now + EXPIRES_SEC;
      const token = await new SignJWT({})
        .setProtectedHeader({ alg: ALG })
        .setSubject(username)
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .sign(key);
      return { token, expiresAt: exp * 1000 };
    },
    async verify(token) {
      const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
      return { sub: payload.sub as string, iat: payload.iat!, exp: payload.exp! };
    },
  };
}
