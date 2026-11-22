const isProduction = process.env.NODE_ENV === "production";

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
};

const ONE_DAY = 24 * 60 * 60 * 1000;

// Must match ACCESS_TOKEN_EXPIRY (1d)
export const accessTokenCookieOptions = {
  ...baseOptions,
  maxAge: 1 * ONE_DAY,
};

// Must match REFRESH_TOKEN_EXPIRY (10d)
export const refreshTokenCookieOptions = {
  ...baseOptions,
  maxAge: 10 * ONE_DAY,
};

// Clearing a cookie must use the same options it was set with (without maxAge)
export const clearCookieOptions = baseOptions;
