import crossSpawn from "cross-spawn";
import path from "path";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";
import { TowerflowType } from "../interface";

const debug = Debug(__filename);

export function runJest(options: {
  appPath: string;
  appType: TowerflowType;
  ownPath: string;
}) {
  const { appType, appPath, ownPath } = options;

  debug(`Check if on interactive TTY`);
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  const jestConfigPath = parsePath(
    ownPath,
    `template/${appType}/config/jest.config.js`
  );

  const jestArgs = [
    "jest",
    "--config",
    jestConfigPath,
    "--rootDir",
    path.join(appPath)
  ];

  debug(`Jest args: ${jestArgs}`);
  const { status } = crossSpawn.sync("npx", jestArgs, {
    stdio: "inherit",
    cwd: appPath
  });
  if (status !== 0) {
    throw {
      command: `jest ${jestArgs.join(" ")}`
    };
  }
}
