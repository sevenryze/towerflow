import chokidar from "chokidar";
import fsExtra from "fs-extra";
import { Debug } from "./debugger";
import { parsePath } from "./parse-path";
import path from "path";

const debug = Debug(__filename);

export function watchAndcleanGeneratedFiles(
  appPath: string,
  tsconfigPath: string
) {
  debug(`Read tsconfig.json from: ${tsconfigPath}`);
  const tsconfigJson = require(tsconfigPath);

  const watchPaths: string[] = [];
  tsconfigJson.include.map((dir: string) => {
    dir !== "typings" &&
      watchPaths.push(parsePath(appPath, dir) + "/**/*.tsx?");
  });

  debug(`Create watcher with watch path: ${watchPaths}`);
  const watcher = chokidar.watch(watchPaths, {
    ignored: "**/*.d.ts"
  });

  watcher.on("unlink", (filePath: string) => {
    debug(`Find .ts removed: ${filePath}`);

    const generatedFileSuffix = [".d.ts", ".d.ts.map", ".js", ".js.map"];
    generatedFileSuffix.map(suffix => {
      // TODO: Do not use as this is under concern.
      const fileBasename = path.basename(filePath);
      const delFileBasename = fileBasename.replace(/\.tsx?$/, suffix);
      const delFile = parsePath(appPath, "dist");

      debug(`Delete file: ${delFile}`);
      fsExtra.removeSync(delFile);
    });
  });

  process.on("exit", code => {
    debug(`process exit with code: ${code}`);

    debug(`clean chokidar watcher`);
    watcher && watcher.close();
  });
}
