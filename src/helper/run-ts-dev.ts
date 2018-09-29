import { TowerflowType } from "../../bin";
import { Debug } from "./debugger";
import { generateTempTsconfigFile } from "./generate-temp-tsconfig-file";
import { parsePath } from "./parse-path";
import { tsWatch } from "./run-ts-watch";
import { watchAndcleanGeneratedFiles } from "./watch-and-clean-generated-files";

const debug = Debug(__filename);

export function runTsDev(
  appPath: string,
  appType: TowerflowType,
  ownPath: string
) {
  const tsconfigPath = parsePath(
    ownPath,
    `template/${appType}/config/tsconfig.json`
  );

  let actualUseTsconfigPath = tsconfigPath;

  debug(`Read tsconfig.json content: ${tsconfigPath}`);
  const tsconfigJson = require(tsconfigPath);

  debug(`Watch the orphon tsc generated files`);
  watchAndcleanGeneratedFiles(appPath, tsconfigJson, true);

  debug(`Generate tsconfig-tmp.json for workaround`);
  const tmpTsconfigPath = generateTempTsconfigFile(
    tsconfigJson,
    appPath,
    ownPath
  );

  // Comment this line if we don't want to use temp tsconfig.json.
  actualUseTsconfigPath = tmpTsconfigPath;

  debug(`Start ts watch files...`);
  tsWatch(actualUseTsconfigPath);
}
