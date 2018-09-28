import chokidar from "chokidar";
import crossSpawn from "cross-spawn";
import Debug from "debug";
import fsExtra from "fs-extra";
import os from "os";
import path from "path";
import tsconfigBase from "./config/tsconfig-base.json";
import { tsWatch } from "./ts-watch.js";

const debug = Debug("towerflow:run-ts-dev");

const tsconfigPath = path
  .resolve(__dirname, "config/tsconfig.json")
  .replace(/\\/g, "/");

export function runTsDev(
  appPath: string,
  appName: string,
  ownPath: string,
  distPath: string
) {
  debug(`Watch the orphon tsc generated files`);
  const watchFiles: string[] = [];
  tsconfigBase.include.map((dir: string) => {
    watchFiles.push(
      (path.resolve(appPath, dir) + "/**/*.ts").replace(/\\/g, "/")
    );
  });

  const watcher = chokidar.watch(watchFiles, {
    ignored: "**/*.d.ts"
  });

  watcher.on("unlink", (filePath: string) => {
    debug(`.ts removed: ${path.relative(appPath, filePath)}`);

    debug(`Start to delete tsc generated files.`);
    const generatedFileSuffix = [".d.ts", ".d.ts.map", ".js", ".js.map"];

    generatedFileSuffix.map(suffix => {
      const delFile = filePath.replace(/\.ts$/g, suffix);

      debug(`Delete file: ${path.relative(appPath, delFile)}`);
      fsExtra.removeSync(delFile);
    });
  });

  debug(`Generate tsconfig.json`);
  const tsconfig = tsconfigBase;
  tsconfig.include = tsconfigBase.include.map((item: string) =>
    `${appPath}/${item}`.replace(/\\/g, "/")
  );
  debug(`include: ${tsconfig.include}`);
  fsExtra.writeFileSync(
    tsconfigPath,
    JSON.stringify(tsconfig, null, 2) + os.EOL
  );

  debug(`Start ts watch files...`);
  tsWatch(tsconfigPath);
}
