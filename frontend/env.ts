const DEBUG = false

const BACKEND_DEV = "http://localhost:4000"

const FRONTEND_DEV = "http://localhost:3000"
const FRONTEND_PROD = process.env.NEXT_PUBLIC_FRONTEND

/* GOOGLE */
const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_KEY

// saber si estoy en produccion
const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === "production";

const URL_BACKEND = BACKEND_DEV;
const URL_FRONTEND = isProd ? FRONTEND_PROD : FRONTEND_DEV;


console.log({
    isProd,
    DEBUG,
    URL_BACKEND,
    URL_FRONTEND,
    RECAPTCHA_KEY
})
export {
    isProd,
    DEBUG,
    URL_BACKEND,
    URL_FRONTEND,
    RECAPTCHA_KEY
};