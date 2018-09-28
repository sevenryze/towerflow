import chokidar from "chokidar";
import Debug from "debug";
import fsExtra from "fs-extra";
import os from "os";
import path from "path";
import { tsWatch } from "./ts-watch.js";

const debug = Debug("towerflow:run-ts-dev");

export function runTsDev(
  appPath: string,
  appName: string,
  ownPath: string,
  distPath: string
) {
  // This is workaround for tsconfig cannot resolve rootDir to match context.
  const tsconfigBaseJson = require(`${ownPath}/template/node-app/config/tsconfig-base.json`);
  const tsconfigPath = path
    .join(ownPath, "template/node-app/config/tsconfig.json")
    .replace(/\\/g, "/");

  debug(`Watch the orphon tsc generated files`);
  const watchFiles: string[] = [];
  tsconfigBaseJson.include.map((dir: string) => {
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
  const tsconfig = tsconfigBaseJson;
  tsconfig.include = tsconfigBaseJson.include.map((item: string) =>
    `${appPath}/${item}`.replace(/\\/g, "/")
  );

  debug(`tsconfig.json workaround include: ${tsconfig.include}`);
  fsExtra.writeFileSync(
    tsconfigPath,
    JSON.stringify(tsconfig, null, 2) + os.EOL
  );

  debug(`Start ts watch files...`);
  tsWatch(tsconfigPath);
}
