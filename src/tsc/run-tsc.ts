import { removeSync } from "fs-extra";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";
import { BuildType, TowerflowType } from "../interface";
import { createTsc } from "./create-tsc";
import { runTsLint } from "./create-tslint";
import { generateTempTsconfig } from "./generate-temp-tsconfig";

const debug = Debug(__filename);

export function runTsc(options: {
  type: BuildType;
  appPath: string;
  appType: TowerflowType;
  ownPath: string;
}) {
  const { type, appType, appPath, ownPath } = options;

  debug(`Check if on interactive TTY`);
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  let tsconfigPath = parsePath(
    ownPath,
    `template/${appType}/config/tsconfig.json`
  );
  debug(`Get tsconfigPath: ${tsconfigPath}`);

  debug(`Generate temp tsconfig.json for workaround`);
  const tmpTsconfigPath = generateTempTsconfig(tsconfigPath, appPath, ownPath);

  // Comment this line if we don't want to use temp tsconfig.json.
  tsconfigPath = tmpTsconfigPath;

  console.log(`Clean dist files`);
  removeSync(parsePath(appPath, "dist"));

  if (type === BuildType.production) {
    console.log(`Run the tslint process`);
    const status = runTsLint({
      appPath,
      appType,
      ownPath,
      tsconfigPath
    });

    if (status !== 0) {
      debug(`Tslint check not passed! do not proceed to production build.`);
      process.exit(1);
    }
  }

  console.log(`Start tsc compiling`);
  createTsc({
    appPath,
    tsconfigPath,
    isWatch: type === BuildType.dev
  });
}
