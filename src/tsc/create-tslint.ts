import crossSpawn from "cross-spawn";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";
import { TowerflowType } from "../interface";

const debug = Debug(__filename);

export function runTsLint(options: {
  appPath: string;
  ownPath: string;
  appType: TowerflowType;
  tsconfigPath: string;
}) {
  const { appPath, ownPath, appType, tsconfigPath } = options;

  const tslintConfigPath = parsePath(
    ownPath,
    `/template/${appType}/config/tslint.json`
  );

  debug(
    `Call tslint with tslint.json: ${tslintConfigPath}, tsconfig.json: ${tsconfigPath}`
  );
  const { status } = crossSpawn.sync(
    "npx",
    ["tslint", "-c", tslintConfigPath, "-p", tsconfigPath],
    {
      cwd: options.appPath,
      stdio: "inherit"
    }
  );

  return status;
}
