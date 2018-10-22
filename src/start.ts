import chalk from "chalk";
import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";
import { parsePath } from "./helper/parse-path";
import { BuildType, TowerflowType } from "./interface";
import { runTsc } from "./tsc/run-tsc";
import { runWebpack } from "./webpack/run-webpack";

const debug = Debug(__filename);

export async function start(options: {
  appName: string;
  appPath: string;
  appType: TowerflowType;
  ownPath: string;
}) {
  const { appName, ownPath, appPath, appType } = options;

  debug(`Check if required files exists`);
  // TODO: Warn and crash if required files are missing
  if (!checkRequiredFiles()) {
    process.exit(1);
  }

  switch (options.appType) {
    case TowerflowType.webApp:
    case TowerflowType.webLib:
      debug(`Run webpack-dev-server for web dev`);

      runWebpack({
        type: BuildType.dev,
        appName,
        appPath,
        ownPath,
        appType,
        distPath: parsePath(options.appPath, "dist"),
        publicDirPath:
          options.appType === TowerflowType.webApp
            ? `${options.appPath}/public`
            : `${options.appPath}/human-test/public`,
        indexPath:
          options.appType === TowerflowType.webApp
            ? `${options.appPath}/src/index.tsx`
            : `${options.appPath}/human-test/index.tsx`
      });
      break;

    case TowerflowType.nodeApp:
    case TowerflowType.nodeLib:
      debug(`Run webpack for node dev`);

      runTsc({
        type: BuildType.dev,
        appPath,
        appType,
        ownPath
      });
      break;
    default:
      console.log(
        `The template argument gets Unknown type, valid type: ${chalk.green(
          "F* you! dummy suck loser, you gonna typing everything wrong?"
        )}`
      );
      process.exit(1);
  }
}
