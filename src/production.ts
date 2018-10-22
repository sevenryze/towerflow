import chalk from "chalk";
import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";
import { parsePath } from "./helper/parse-path";
import { BuildType, TowerflowType } from "./interface";
import { runTsc } from "./tsc/run-tsc";
import { runWebpack } from "./webpack/run-webpack";

const debug = Debug(__filename);

export async function production(options: {
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
      runWebpack({
        type: BuildType.production,
        appName,
        appPath,
        ownPath,
        appType,
        distPath: parsePath(options.appPath, "dist"),
        publicDirPath: `${options.appPath}/public`,
        indexPath: `${options.appPath}/src/index.tsx`
      });
      break;

    case TowerflowType.nodeApp:
    case TowerflowType.nodeLib:
    case TowerflowType.webLib:
      runTsc({
        type: BuildType.production,
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
