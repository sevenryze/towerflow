import { removeSync } from "fs-extra";
import klawSync from "klaw-sync";
import { checkTsFile } from "./checkTsFile";
import { Debug } from "./debugger";

const debug = Debug(__filename);

export function cleanSrcFolder(folderPath: string[]) {
  const invalidFilePaths = new Set<string>();

  folderPath.forEach(path => {
    klawSync(path, {
      nodir: true,
      filter: info => {
        return !checkTsFile(info.path);
      }
    }).forEach(info => {
      invalidFilePaths.add(info.path);
    });
  });

  invalidFilePaths.forEach(filePath => {
    debug(`Delete file: ${filePath}`);
    removeSync(filePath);
  });
}


