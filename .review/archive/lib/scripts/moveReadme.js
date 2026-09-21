import fs from "fs"
import path from "path"

const moveReadmeToLib = () => {
    const rootReadmePath = "../../README.md"
    const libReadmePath = "./README.md"
    
    try {
        // Check if README.md exists in root
        if (!fs.existsSync(rootReadmePath)) {
            console.log("No se encontró README.md en la raíz del proyecto")
            return false
        }
        
        // Check if README.md already exists in lib
        if (fs.existsSync(libReadmePath)) {
            console.log("README.md ya existe en ./lib, no se moverá")
            return false
        }
        
        // Move README.md from root to lib
        fs.copyFileSync(rootReadmePath, libReadmePath)
        console.log("README.md movido de la raíz a ./lib para publicación npm")
        return true
        
    } catch (error) {
        console.error("Error al mover README.md:", error.message)
        return false
    }
}

const moveReadmeBackToRoot = () => {
    const rootReadmePath = "../../README.md"
    const libReadmePath = "./README.md"
    
    try {
        // Check if README.md exists in lib
        if (!fs.existsSync(libReadmePath)) {
            console.log("No se encontró README.md en ./lib")
            return false
        }
        
        // Check if README.md still exists in root (backup check)
        if (fs.existsSync(rootReadmePath)) {
            console.log("README.md aún existe en la raíz, no se restaurará")
            return false
        }
        
        // Move README.md back from lib to root
        fs.copyFileSync(libReadmePath, rootReadmePath)
        console.log("README.md restaurado de ./lib a la raíz")
        return true
        
    } catch (error) {
        console.error("Error al restaurar README.md:", error.message)
        return false
    }
}

export { moveReadmeToLib, moveReadmeBackToRoot }
export default moveReadmeToLib