import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compila un archivo EJS con los datos proporcionados y devuelve el HTML resultante.
 *
 * @param templateName Nombre del archivo EJS (sin la extensión .ejs).
 * @param data Objeto con los datos que se pasarán al template EJS.
 * @returns {Promise<string>} Una promesa que resuelve con el HTML resultante.
 */

const compileEJSTemplate = async (
  templateName: string,
  data: object
): Promise<string> => {
  const templatePath = path.join(__dirname, `/ejs/${templateName}.ejs`);

  try {
    const html = await ejs.renderFile(templatePath, data);
    return html;
  } catch (err) {
    throw new Error(
      `Error al renderizar el template EJS (${templateName}): ${err}`
    );
  }
};

export default compileEJSTemplate;