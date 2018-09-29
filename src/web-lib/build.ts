import path from "path";
import { TowerflowType, ErrorCode } from "../../bin";
import { Debug } from "../helper/debugger";
import { tsCompile } from "../helper/ts-compile";
import { watchAndcleanGeneratedFiles } from "../helper/watch-and-clean-generated-files";
import { normalPath } from "../helper/normal-path";
import { runTsLint } from "../helper/run-tslint";

const debug = Debug(__filename);

export async function buildWebLib(options: {
  appPath: string;
  ownPath: string;
  appType: TowerflowType;
}) {
  const tsconfigPath = normalPath(
    path.join(
      options.ownPath,
      `template/${options.appType}/config/tsconfig.json`
    )
  );

  const tsconfigJson = require(tsconfigPath);

  debug(`Clean the src folder`);
  await watchAndcleanGeneratedFiles(options.appPath, tsconfigJson, false);

  debug(`Start single pase ts compile`);
  let { hasError } = await tsCompile(tsconfigPath, options.appPath);
  if (hasError) {
    debug(`tsc cannot makes your code pass, clean src folder`);
    await watchAndcleanGeneratedFiles(options.appPath, tsconfigJson, false);
    return;
  }

  debug(`Start tslint`);
  hasError = runTsLint(options).hasError;
  if (hasError) {
    debug(`tslint cannot makes your code pass, clean src folder`);
    await watchAndcleanGeneratedFiles(options.appPath, tsconfigJson, false);
    return;
  }
}
