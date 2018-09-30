import { TowerflowType } from "../../bin";
import { Debug } from "../helper/debugger";
import { generateTempTsconfigFile } from "./generate-temp-tsconfig-file";
import { parsePath } from "../helper/parse-path";
import { tsWatch } from "./run-ts-watch";
import { watchAndcleanGeneratedFiles } from "../helper/watch-and-clean-generated-files";

const debug = Debug(__filename);

export function runTsDev(
  appPath: string,
  appType: TowerflowType,
  ownPath: string
) {
  let tsconfigPath = parsePath(
    ownPath,
    `template/${appType}/config/tsconfig.json`
  );

  debug(`Watch the orphon tsc generated files`);
  watchAndcleanGeneratedFiles(appPath, tsconfigPath, appType);

  debug(`Generate temp tsconfig.json for workaround`);
  const tmpTsconfigPath = generateTempTsconfigFile(
    tsconfigPath,
    appPath,
    ownPath
  );

  // Comment this line if we don't want to use temp tsconfig.json.
  tsconfigPath = tmpTsconfigPath;

  debug(`Start ts watch files...`);
  tsWatch(tsconfigPath);
}
