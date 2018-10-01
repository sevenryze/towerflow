import chalk from "chalk";
import { TowerflowType } from "../bin";
import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";
import { parsePath } from "./helper/parse-path";
import { runTsDev } from "./tsc/run-ts-dev";
import { runWebpackDevServer } from "./webpack/run-webpack-dev-server";

const debug = Debug(__filename);

export async function start(options: {
  appPath: string;
  appName: string;
  ownPath: string;
  appType: TowerflowType;
}) {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = "development";
  process.env.NODE_ENV = "development";

  debug(`Check required files exists`);
  // TODO: Warn and crash if required files are missing
  if (!checkRequiredFiles()) {
    process.exit(1);
  }

  switch (options.appType) {
    case TowerflowType.webApp:
    case TowerflowType.webLib:
      debug(`Run webpack-dev-server`);

      runWebpackDevServer(
        options.appPath,
        options.appName,
        options.appType,
        options.ownPath,
        parsePath(options.appPath, "dist"),
        options.appType === TowerflowType.webApp
          ? `${options.appPath}/public`
          : `${options.appPath}/human-test/public`,
        options.appType === TowerflowType.webApp
          ? `${options.appPath}/src/index.tsx`
          : `${options.appPath}/human-test/index.tsx`
      );
      break;

    case TowerflowType.nodeApp:
    case TowerflowType.nodeLib:
      debug(`Run ts watch server`);

      runTsDev(options.appPath, options.appType, options.ownPath);
      break;
    default:
      console.log(
        `The template argument gets Unknown type, valid type: ${chalk.green(
          "Fuck you! dummy suck loser, you gonna typing everything wrong?"
        )}`
      );
      process.exit(1);
  }
}
