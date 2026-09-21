import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lista blanca de archivos a sincronizar desde global a frontend y backend
 */
export const WHITELIST = [
    'enums.ts',
    "prismaTypes.ts",
    "customTypes.ts",
    "typesArchivesPermitted.ts",
    "chunkSizeByStrategy.ts"
];

/**
 * Directorios destino donde sincronizar los archivos
 */
export const DESTINATIONS = ['frontend', 'backend'];

/**
 * Sincroniza los archivos de la lista blanca desde global a los módulos
 * @param {string} rootDir - Ruta a la raíz del proyecto (donde están global, frontend y backend)
 */
export const syncGlobalFiles = (rootDir = path.dirname(__dirname)) => {
    const globalDir = path.join(rootDir, 'global');

    console.log(`📦 Iniciando sincronización de archivos desde ${globalDir}...`);

    WHITELIST.forEach((file) => {
        const sourcePath = path.join(globalDir, file);

        // Verificar que el archivo existe en global
        if (!fs.existsSync(sourcePath)) {
            console.warn(`⚠️  Archivo no encontrado: ${file}`);
            return;
        }

        // Leer el contenido del archivo
        const content = fs.readFileSync(sourcePath, 'utf8');

        // Copiar a cada destino
        DESTINATIONS.forEach((dest) => {
            const destBaseDir = path.join(rootDir, dest);

            // Para frontend usa la ruta directa, para backend usa src/global
            const destGlobalDir = dest === 'frontend'
                ? path.join(destBaseDir, 'global')
                : path.join(destBaseDir, 'src', 'global');

            const destPath = path.join(destGlobalDir, file);

            // Verificar que el directorio destino existe
            if (!fs.existsSync(destBaseDir)) {
                console.warn(`⚠️  Directorio no encontrado: ${dest}`);
                return;
            }

            // Crear la carpeta global si no existe
            if (!fs.existsSync(destGlobalDir)) {
                fs.mkdirSync(destGlobalDir, { recursive: true });
            }

            try {
                fs.writeFileSync(destPath, content, 'utf8');
                console.log(`✅ ${file} → ${dest}/global/`);
            } catch (error) {
                console.error(`❌ Error al copiar ${file} a ${dest}/global/: ${error.message}`);
            }
        });
    });

    console.log('✨ Sincronización completada');
};

// Ejecutar si se llama directamente desde la línea de comandos
if (process.argv[1] === __filename) {
    syncGlobalFiles();
}