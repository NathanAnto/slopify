export const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.DEV_MODE ? false : true,
    sameSite: process.env.DEV_MODE ? "Lax" : "None",
});