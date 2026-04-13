import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

function isLocalDevHost(req: Request): boolean {
  const host = req.hostname || "";
  if (LOCAL_HOSTS.has(host)) return true;
  if (host === "[::1]") return true;
  if (isIpAddress(host) && (host === "127.0.0.1" || host === "::1"))
    return true;
  return false;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  // SameSite=None requires Secure; on http://localhost secure is false, so browsers drop the cookie.
  // Use Lax for local dev so the session is actually stored and sent to same-origin /api/trpc.
  if (isLocalDevHost(req)) {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    };
  }

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure,
  };
}
