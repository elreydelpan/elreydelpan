import crypto from "node:crypto";
import { env } from "./lib/env";
import { publicQuery } from "./middleware";
import { TRPCError } from "@trpc/server";

const SECRET = env.appSecret || "el-rey-del-pan-dev-secret";
const COOKIE_NAME = "rdp_admin";
const SESSION_HOURS = 12;

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createToken(adminId: number): string {
  const payload = b64url(
    JSON.stringify({ sub: adminId, exp: Date.now() + SESSION_HOURS * 3600 * 1000 })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): number | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.sub !== "number" || typeof data.exp !== "number") return null;
    if (data.exp < Date.now()) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export function readTokenFromReq(req: Request): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE_NAME) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function sessionCookie(token: string): string {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`;
}

export function clearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export const adminQuery = publicQuery.use(async ({ ctx, next }) => {
  const token = readTokenFromReq(ctx.req);
  const adminId = token ? verifyToken(token) : null;
  if (!adminId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sesión inválida o expirada" });
  }
  return next({ ctx: { ...ctx, adminId } });
});
