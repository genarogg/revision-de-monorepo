import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REACT_VERSION = "19.3.0";
const NODE_VERSION = "24.13.6";

/**
 * Versiones objetivo de dependencias a mantener sincronizadas en todos
 * los package.json del monorepo. Cada entrada es { "nombreDelPaquete": "version" }.
 *
 * El script solo ACTUALIZA dependencias que ya existen en un package.json;
 * nunca agrega una dependencia nueva a un workspace que no la tenía.
 *
 * Para agregar otra dependencia a sincronizar (ej: react-router-dom),
 * solo hay que sumar otra entrada acá:
 *   { "react-router-dom": "6.28.0" }
 */
export const DEPENDENCY_VERSIONS = [
    { "react": REACT_VERSION },
    { "react-dom": REACT_VERSION },
    { "@types/react": REACT_VERSION },
    { "@types/react-dom": REACT_VERSION },
    { "@types/node": NODE_VERSION },
];

// Carpetas que nunca se recorren buscando package.json
const IGNORED_DIRS = new Set(['node_modules', '.next', '.turbo', 'dist', '.git', '.obsidian']);

// Secciones de un package.json donde puede vivir una dependencia
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

// Carpetas que se eliminan por completo antes de sincronizar, para que un
// lockfile o node_modules corrupto no rompa la reinstalación posterior
const DIRS_TO_DELETE = new Set(['node_modules', '.next', '.turbo', 'dist', '.cache']);

// Lockfiles que se eliminan junto con las carpetas anteriores
const LOCKFILES_TO_DELETE = new Set(['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock']);

/**
 * Recorre el árbol de archivos buscando todos los package.json, ignorando
 * node_modules y carpetas de build.
 * @param {string} dir - Carpeta desde donde empezar a buscar
 * @param {string[]} results - Acumulador interno (uso recursivo)
 */
export function findPackageJsonFiles(dir = rootDir, results = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
            findPackageJsonFiles(path.join(dir, entry.name), results);
        } else if (entry.isFile() && entry.name === 'package.json') {
            results.push(path.join(dir, entry.name));
        }
    }

    return results;
}

/**
 * Extrae el prefijo de rango semver de una versión ("^", "~", ">=", etc.)
 * para preservar el estilo de pineo que ya tenía cada package.json.
 * @param {string} version
 */
function extractPrefix(version) {
    const match = version.match(/^[\^~>=<]*/);
    return match ? match[0] : '';
}

/**
 * Borra una carpeta o archivo con reintentos. maxRetries/retryDelay son
 * opciones nativas de fs.rmSync pensadas justo para EBUSY/EPERM/ENOTEMPTY
 * en Windows, cuando un editor, dev server o antivirus retiene un handle
 * abierto por un instante.
 * @param {string} targetPath
 */
function remove(targetPath) {
    try {
        fs.rmSync(targetPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
        console.log(`🗑️  ${path.relative(rootDir, targetPath)}`);
        return true;
    } catch (error) {
        console.error(`❌ No se pudo borrar ${path.relative(rootDir, targetPath)}: ${error.message}`);
        return false;
    }
}

/**
 * Borra node_modules, carpetas de build y lockfiles en todo el monorepo.
 * Evita el ERR_PNPM_PACKAGE_MANAGER_REMOVE_MODULES_DIR que aparece cuando
 * el lockfile queda en un formato que pnpm ya no reconoce.
 * @param {string} dir
 * @param {{dirs:number, files:number}} stats
 */
export function cleanMonorepo(dir = rootDir, stats = { dirs: 0, files: 0 }) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (error) {
        console.warn(`⚠️  No se pudo leer ${dir}: ${error.message}`);
        return stats;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (DIRS_TO_DELETE.has(entry.name)) {
                if (remove(fullPath)) stats.dirs += 1;
                continue; // no bajar a una carpeta que ya borramos
            }
            if (entry.name === '.git' || entry.name === '.obsidian') continue;
            cleanMonorepo(fullPath, stats);
        } else if (entry.isFile() && LOCKFILES_TO_DELETE.has(entry.name)) {
            if (remove(fullPath)) stats.files += 1;
        }
    }

    return stats;
}

/**
 * Sincroniza las dependencias listadas en `targets` en todos los
 * package.json encontrados bajo `root`, preservando el prefijo de rango
 * (^, ~, exacto) que cada archivo ya tenía para esa dependencia.
 * @param {Array<Record<string,string>>} targets - Ej: DEPENDENCY_VERSIONS
 * @param {string} root - Raíz desde donde buscar package.json
 */
export function syncDependencies(targets = DEPENDENCY_VERSIONS, root = rootDir) {
    const targetMap = Object.fromEntries(
        targets.flatMap((entry) => Object.entries(entry))
    );

    const files = findPackageJsonFiles(root);
    let updatedFiles = 0;
    let updatedFields = 0;

    console.log(`📦 Sincronizando ${Object.keys(targetMap).length} dependencia(s) en ${files.length} package.json...`);

    for (const filePath of files) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(root, filePath).replace(/\\/g, '/');

        let pkg;
        try {
            pkg = JSON.parse(raw);
        } catch (error) {
            console.warn(`⚠️  No se pudo parsear ${relPath}: ${error.message}`);
            continue;
        }

        let content = raw;
        let fileChanged = false;

        for (const [depName, newVersion] of Object.entries(targetMap)) {
            for (const field of DEP_FIELDS) {
                const section = pkg[field];
                if (!section || !(depName in section)) continue;

                const oldVersion = section[depName];
                const prefix = extractPrefix(oldVersion);
                const nextVersion = `${prefix}${newVersion}`;

                if (oldVersion === nextVersion) continue;

                const oldSubstring = `"${depName}": "${oldVersion}"`;
                const newSubstring = `"${depName}": "${nextVersion}"`;

                if (!content.includes(oldSubstring)) {
                    console.warn(`⚠️  ${relPath}: no encontré ${oldSubstring} en el texto (formato distinto al esperado)`);
                    continue;
                }

                content = content.replace(oldSubstring, newSubstring);
                fileChanged = true;
                updatedFields += 1;
                console.log(`✅ ${relPath} [${field}] ${depName}: ${oldVersion} → ${nextVersion}`);
            }
        }

        if (fileChanged) {
            fs.writeFileSync(filePath, content, 'utf8');
            updatedFiles += 1;
        }
    }

    if (updatedFields === 0) {
        console.log('✨ Nada que sincronizar, todas las versiones ya coinciden.');
    } else {
        console.log(`✨ Sincronización completada: ${updatedFields} dependencia(s) en ${updatedFiles} archivo(s).`);
    }

    return { updatedFiles, updatedFields };
}

// Ejecutar si se llama directamente desde la línea de comandos
if (process.argv[1] === __filename) {
    const shouldClean = !process.argv.includes('--no-clean');
    const shouldInstall = process.argv.includes('--install');

    if (shouldClean) {
        console.log('🧹 Limpiando node_modules, builds y lockfiles antes de sincronizar...');
        const { dirs, files } = cleanMonorepo();
        console.log(`✨ Limpieza lista: ${dirs} carpeta(s) y ${files} lockfile(s) eliminados.\n`);
    }

    syncDependencies();

    if (shouldInstall) {
        console.log('\n📦 Corriendo "pnpm install"...');
        execSync('pnpm install', { cwd: rootDir, stdio: 'inherit' });
    } else {
        console.log('\n👉 Corré "pnpm install" para reinstalar (o pasá --install para hacerlo automático).');
    }
}
