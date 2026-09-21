const isStrongPassword = (password: string): boolean => {
  // La contraseña debe tener una longitud mínima de 8 y máxima de 16 caracteres
  if (password.length < 8 || password.length > 16) return false;

  // Debe contener al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) return false;

  // Debe contener al menos una letra minúscula
  if (!/[a-z]/.test(password)) return false;

  // Debe contener al menos un dígito
  if (!/\d/.test(password)) return false;

  // Debe contener al menos un símbolo (carácter que no sea letra ni dígito)
  if (!/[^A-Za-z0-9]/.test(password)) return false;

  // No debe contener espacios
  if (/\s/.test(password)) return false;

  return true;
}
/* Expresiones regulares */
const quitarAcentos = (cadena: string): string => {
  const acentos: { [key: string]: string } = {
    á: "a",
    é: "e",
    í: "i",
    ó: "o",
    ú: "u",
    Á: "A",
    É: "E",
    Í: "I",
    Ó: "O",
    Ú: "U",
    ñ: "n",
    Ñ: "N",
    ü: "u",
    Ü: "U",
      };
  return cadena
    .split("")
    .map((letra) => acentos[letra] || letra)
    .join("")
    .toString();
};

const regexUrl = (url: string): string => {
  const newUrl = quitarAcentos(url.toLowerCase())
    .replace(/[^\w\s]/gi, "")
    .toString()
    //@ts-ignore
    .replaceAll(" ", "-");
  return newUrl;
};

// Función para validar el correo electrónico
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export { quitarAcentos, regexUrl, isValidEmail, isStrongPassword };
