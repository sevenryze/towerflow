import crossSpawn from "cross-spawn";
import { TowerflowType } from "../../bin";
import { Debug } from "./debugger";
import { parsePath } from "./parse-path";

const debug = Debug(__filename);

export function runTsLint(options: {
  appPath: string;
  ownPath: string;
  appType: TowerflowType;
}) {
  const tslintConfigPath = parsePath(
    options.ownPath,
    `/template/${options.appType}/config/tslint.json`
  );

  const tmpTsConfigPath = parsePath(options.ownPath, "/tmp/tsconfig.json");

  debug(
    `Call tslint with tslint.json: ${tslintConfigPath}, tsconfig.json: ${tmpTsConfigPath}`
  );
  let { status } = crossSpawn.sync(
    "npx",
    ["tslint", "-c", tslintConfigPath, "-p", tmpTsConfigPath],
    {
      cwd: options.ownPath,
      stdio: "inherit"
    }
  );

  return {
    hasError: status === 2
  };
}
