import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";
import { TowerflowType } from "./interface";
import { runJest } from "./jest/run-jest";

const debug = Debug(__filename);

export async function test(options: {
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

  runJest(options);
}
