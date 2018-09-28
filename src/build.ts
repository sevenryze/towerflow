import Debug from "debug";
import path from "path";
import { checkRequiredFiles } from "./helper/check-required-files";
import { TowerflowType } from "../bin";
import { build as webLibBuild } from "./web-lib/build";

const debug = Debug("towerflow:script-build");

export async function build(options: {
  appPath: string;
  appName: string;
  ownPath: string;
  appType: TowerflowType;
}) {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = "production";
  process.env.NODE_ENV = "production";

  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Check required files exists`);
  // Warn and crash if required files are missing
  if (!checkRequiredFiles()) {
    process.exit(1);
  }

  switch (options.appType) {
    case TowerflowType.webApp:
      debug(`Run webpack-dev-server`);

      break;
    case TowerflowType.webLib:
      debug(`Begin the web lib process`);
      webLibBuild(options);
      break;

    case TowerflowType.nodeApp:
      debug(`Run ts watch server`);

      break;
    case TowerflowType.nodeLib:
      break;
    default:
      console.log(
        `The template argument gets Unknown type, valid type: Fuck you! dummy suck loser, you gonna typing everything wrong?`
      );
  }
}
