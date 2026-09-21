import updateTsconfig from "./updateTsconfig.js";
import upVersion from "./upVersion.js";
import eliminarDependencias from "./eliminarDependencias.js";
import moveReadmeToLib from "./moveReadme.js";
{ moveReadmeToLib, moveReadmeBackToRoot }

(async () => {
  await moveReadmeToLib();
  updateTsconfig();
  upVersion();
  eliminarDependencias();
  await moveReadmeBackToRoot();
})();
