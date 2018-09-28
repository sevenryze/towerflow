import chokidar from "chokidar";
import Debug from "debug";
import fsExtra from "fs-extra";
import os from "os";
import path from "path";
import { tsWatch } from "./ts-watch";

const debug = Debug("towerflow:run-ts-dev");

export function runTsDev(
  appPath: string,
  appName: string,
  ownPath: string,
  distPath: string
) {
  process.on("exit", code => {
    debug(`process exit, do clean works`);
  });

  process.on("SIGINT", signal => {
    console.log(`Towerflow get SIGINT, bye!`);
    process.exit(0);
  });

  const tsconfigPath = path
    .join(ownPath, "template/node-app/config/tsconfig.json")
    .replace(/\\/g, "/");
  const tsconfigJson = require(tsconfigPath);

  // This is workaround for tsconfig cannot resolve rootDir to match context.
  const tsconfigTmpPath = path
    .join(ownPath, "tmp/tsconfig-tmp.json")
    .replace(/\\/g, "/");

  debug(`Watch the orphon tsc generated files`);
  const watchFiles: string[] = [];
  tsconfigJson.include.map((dir: string) => {
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
  const tsconfig = tsconfigJson;
  tsconfig.include = tsconfigJson.include.map((item: string) =>
    `${appPath}/${item}`.replace(/\\/g, "/")
  );

  debug(`tsconfig.json workaround include: ${tsconfig.include}`);
  fsExtra.ensureFileSync(tsconfigTmpPath);
  fsExtra.writeFileSync(
    tsconfigTmpPath,
    JSON.stringify(tsconfig, null, 2) + os.EOL
  );

  debug(`Start ts watch files...`);
  tsWatch(tsconfigTmpPath);
  //tsWatch(tsconfigPath, appPath);
}
