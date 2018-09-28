import Debug from "debug";
import path from "path";
import { checkRequiredFiles } from "./helper/check-required-files";
import { runTsDev } from "./node-app/run-ts-dev";
import { runWebpackDevServer } from "./web-app/run-wds";

const debug = Debug("towerflow:script-start");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

export async function start(appPath: string, appName: string, ownPath: string) {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = "development";
  process.env.NODE_ENV = "development";

  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Check required files exists`);
  // Warn and crash if required files are missing
  if (!checkRequiredFiles()) {
    process.exit(1);
  }

  runTsDev(appPath, appName, ownPath, "");
}
