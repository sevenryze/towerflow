import fsExtra from "fs-extra";
import os from "os";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";

const debug = Debug(__filename);

export function generateTempTsconfig(
  tsconfigPath: string,
  appPath: string,
  ownPath: string
) {
  const tsconfigJson = require(tsconfigPath);

  tsconfigJson.include =
    tsconfigJson.include &&
    tsconfigJson.include.map((item: string) => parsePath(`${appPath}/${item}`));

  tsconfigJson.exclude =
    tsconfigJson.exclude &&
    tsconfigJson.exclude.map((item: string) => parsePath(`${appPath}/${item}`));

  tsconfigJson.compilerOptions.outDir =
    tsconfigJson.compilerOptions.outDir &&
    parsePath(`${appPath}/${tsconfigJson.compilerOptions.outDir}`);

  tsconfigJson.compilerOptions.declarationDir =
    tsconfigJson.compilerOptions.declarationDir &&
    parsePath(`${appPath}/${tsconfigJson.compilerOptions.declarationDir}`);

  tsconfigJson.compilerOptions.rootDir = parsePath(`${appPath}`);

  const tmpTsconfigPath = parsePath(ownPath, "tmp/tsconfig.json");

  fsExtra.ensureFileSync(tmpTsconfigPath);
  fsExtra.writeFileSync(
    tmpTsconfigPath,
    JSON.stringify(tsconfigJson, null, 2) + os.EOL
  );

  debug(`Generate tmp-tsconfig: ${tsconfigJson}`);

  return tmpTsconfigPath;
}