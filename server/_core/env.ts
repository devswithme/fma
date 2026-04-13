/** Dotenv may include trailing `;` from lines like `KEY=value;` — strip so URLs stay valid. */
function envString(value: string | undefined): string {
  if (value === undefined || value === "") return "";
  return value.trim().replace(/;+\s*$/, "");
}

export const ENV = {
  appId: envString(process.env.VITE_APP_ID),
  cookieSecret: envString(process.env.JWT_SECRET),
  databaseUrl: envString(process.env.DATABASE_URL),
  /** Digits only. Grants admin role when used with phone login. */
  staticAdminPhone: envString(process.env.STATIC_ADMIN_PHONE) || "6512345678",
  ownerOpenId: envString(process.env.OWNER_OPEN_ID),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: envString(process.env.BUILT_IN_FORGE_API_URL),
  forgeApiKey: envString(process.env.BUILT_IN_FORGE_API_KEY),
};
