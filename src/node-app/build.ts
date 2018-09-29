import chokidar from "chokidar";
import fsExtra from "fs-extra";
import path from "path";
import { TowerflowType } from "../../bin";
import { tsCompile } from "../helper/run-ts-compile";
import { Debug } from "../helper/debugger";

const debug = Debug(__filename);

export function buildNodeApp(options: { appPath: string; ownPath: string }) {
  process.on("exit", code => {
    debug(`process exit, do clean works`);
  });

  debug(`Clean the lib folder to prepare a clean build root`);

  const tsconfigPath = path
    .join(
      options.ownPath,
      `template/${TowerflowType.webLib}/config/tsconfig.json`
    )
    .replace(/\\/g, "/");
  const tsconfigJson = require(tsconfigPath);

  debug(`Watch the orphon tsc generated files`);
  const watchFiles: string[] = [];
  tsconfigJson.include.map((dir: string) => {
    watchFiles.push(
      (path.resolve(options.appPath, dir) + "/**/*.ts").replace(/\\/g, "/")
    );
  });

  const watcher = chokidar.watch(watchFiles, {
    ignored: "**/*.d.ts"
  });

  watcher.on("add", (filePath: string) => {
    debug(`.ts removed: ${path.relative(options.appPath, filePath)}`);

    debug(`Start to delete tsc generated files.`);
    const generatedFileSuffix = [".d.ts", ".d.ts.map", ".js", ".js.map"];

    generatedFileSuffix.map(suffix => {
      const delFile = filePath.replace(/\.ts$/g, suffix);

      debug(`Delete file: ${path.relative(options.appPath, delFile)}`);
      fsExtra.removeSync(delFile);
    });
  });

  watcher.close();

  debug(`Start single pase ts compile`);
  tsCompile(tsconfigPath, options.appPath);
}
