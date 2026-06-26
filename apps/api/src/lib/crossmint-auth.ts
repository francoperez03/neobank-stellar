import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env";

const JWKS = createRemoteJWKSet(new URL(env.crossmint.jwksUri));

export interface CrossmintClaims {
  sub: string;
  email?: string;
}

export async function verifyCrossmintJwt(token: string): Promise<CrossmintClaims> {
  const { payload } = await jwtVerify(token, JWKS, {
    audience: env.crossmint.projectId,
  });
  if (!payload.sub) throw new Error("JWT missing sub claim");
  return { sub: payload.sub, email: payload["email"] as string | undefined };
}
