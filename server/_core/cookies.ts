import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  // SameSite=None requires Secure=true. Plain HTTP (localhost, raw EC2 IP) must use Lax + Secure=false
  // or browsers drop the cookie. HTTPS (or TLS at ALB with trust proxy) uses None + Secure.
  if (secure) {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    };
  }

  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
  };
}
