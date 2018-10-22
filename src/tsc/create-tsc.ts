import crossSpawn from "cross-spawn";
import path from "path";
import { Debug } from "../helper/debugger";

const debug = Debug(__filename);

export function createTsc(options: {
  appPath: string;
  tsconfigPath: string;
  isWatch: boolean;
}) {
  const { appPath, tsconfigPath, isWatch } = options;

  const tscArgs = ["tsc", "--project", tsconfigPath];
  isWatch && tscArgs.push("--watch");

  debug(`Tsc args: ${tscArgs}`);
  const child = crossSpawn("npx", tscArgs, {
    cwd: path.normalize(appPath),
    stdio: "inherit"
  });
}
