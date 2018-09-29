import chokidar from "chokidar";
import fsExtra from "fs-extra";
import { TowerflowType } from "../../bin";
import { cleanSrcFolder } from "./clean-src-folder";
import { Debug } from "./debugger";
import { parsePath } from "./parse-path";

const debug = Debug(__filename);

export function watchAndcleanGeneratedFiles(
  appPath: string,
  tsconfigPath: string,
  appType: TowerflowType
) {
  debug(`Read tsconfig.json from: ${tsconfigPath}`);
  const tsconfigJson = require(tsconfigPath);

  const watchPaths: string[] = [];
  tsconfigJson.include.map((dir: string) => {
    dir !== "typings" && watchPaths.push(parsePath(appPath, dir) + "/**/*.ts");
  });

  debug(`Create watcher with watch path: ${watchPaths}`);
  const watcher = chokidar.watch(watchPaths, {
    ignored: "**/*.d.ts"
  });

  watcher.on("unlink", (filePath: string) => {
    debug(`Find .ts removed: ${filePath}`);

    const generatedFileSuffix = [".d.ts", ".d.ts.map", ".js", ".js.map"];
    generatedFileSuffix.map(suffix => {
      const delFile = filePath.replace(/\.tsx?$/, suffix);

      debug(`Delete file: ${delFile}`);
      fsExtra.removeSync(delFile);
    });
  });

  process.on("exit", code => {
    debug(`process exit with code: ${code}`);

    debug(`clean src folder`);
    cleanSrcFolder(appPath, appType);

    debug(`clean chokidar watcher`);
    watcher && watcher.close();
  });
}
