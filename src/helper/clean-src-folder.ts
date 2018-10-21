import { removeSync } from "fs-extra";
import klawSync from "klaw-sync";
import { TowerflowType } from "../interface";
import { Debug } from "./debugger";
import { matchTsFile } from "./match-ts-file";
import { parsePath } from "./parse-path";

const debug = Debug(__filename);

export function cleanSrcFolder(appPath: string, appType: TowerflowType) {
  switch (appType) {
    case TowerflowType.nodeLib:
    case TowerflowType.webLib:
      cleanFolder([`${appPath}/lib`]);
      break;
    case TowerflowType.nodeApp:
      cleanFolder([`${appPath}/src`, `${appPath}/bin`]);
      break;
    default:
      console.log(`Not matched type`);
  }

  debug(`source code folder clean complete`);
}

/**
 * Clean the target folder.
 *
 * @param folderPath The absolute paths to src folders
 */
function cleanFolder(folderPath: string[]) {
  const invalidFilePaths = new Set<string>();

  folderPath.forEach(folderPath => {
    const searchPath = parsePath(folderPath);

    debug(`search path: ${searchPath}`);

    klawSync(searchPath, {
      nodir: true,
      filter: info => {
        return !matchTsFile(info.path);
      }
    }).forEach(info => {
      invalidFilePaths.add(info.path);
    });
  });

  invalidFilePaths.forEach(filePath => {
    debug(`Delete file: ${parsePath(filePath)}`);
    removeSync(filePath);
  });
}
