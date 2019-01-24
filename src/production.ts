import chalk from "chalk";
import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";
import { parsePath } from "./helper/parse-path";
import { BuildType, TowerflowType } from "./interface";
import { runTsc } from "./tsc/run-tsc";
import { runWebpack } from "./webpack/run-webpack";

const debug = Debug(__filename);

export async function production(options: {
  appPath: string;
  appType: TowerflowType;
  ownPath: string;
}) {
  const { ownPath, appPath, appType } = options;

  debug(`Check if required files exists`);
  if (!checkRequiredFiles(appPath)) {
    process.exit(1);
  }

  switch (options.appType) {
    case TowerflowType.webApp:
      runWebpack({
        appPath,
        appType,
        buildType: BuildType.production,
        distPath: parsePath(options.appPath, "dist"),
        ownPath,
        indexPath: `${options.appPath}/src/index.tsx`,
        publicDirPath: `${options.appPath}/public`
      });
      break;

    case TowerflowType.nodeApp:
    case TowerflowType.nodeLib:
    case TowerflowType.webLib:
      runTsc({
        appPath,
        appType,
        ownPath,
        type: BuildType.production
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
