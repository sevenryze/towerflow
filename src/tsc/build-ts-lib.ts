import { TowerflowType } from "../../bin";
import { cleanSrcFolder } from "../helper/clean-src-folder";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";
import { tsCompile } from "./run-ts-compile";
import { runTsLint } from "./run-tslint";

const debug = Debug(__filename);

export async function buildTsLib(options: {
  appPath: string;
  ownPath: string;
  appType: TowerflowType;
}) {
  const { appPath, ownPath, appType } = options;

  const tsconfigPath = parsePath(
    ownPath,
    `template/${appType}/config/tsconfig.json`
  );

  debug(`Clean the src folders to prepare clean build base`);
  cleanSrcFolder(appPath, appType);

  debug(`Start tslint`);
  let result = runTsLint(options);
  if (result.hasError) {
    debug(`tslint cannot makes your code pass, exit this pass`);
    return;
  }

  debug(`Start single pass ts compile`);
  result = tsCompile(tsconfigPath, appPath);
  if (result.hasError) {
    debug(`tsc cannot makes your code pass, clean src folder`);
    cleanSrcFolder(appPath, appType);
    return;
  }
}
