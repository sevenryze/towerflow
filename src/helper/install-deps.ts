import crossSpawn from "cross-spawn";
import { Debug } from "./debugger";

const debug = Debug(__filename);

export function installDeps(
  dependencies: string[],
  devDependencies: string[],
  verbose: boolean
) {
  if (dependencies.length > 0) {
    const args = ["install", "--save", "--loglevel", "error"].concat(
      dependencies
    );

    if (verbose) {
      args.push("--verbose");
    }

    debug(`Depndencies install args: ${args}`);
    install(args);
  }

  if (devDependencies.length > 0) {
    const args = ["install", "-D", "--save", "--loglevel", "error"].concat(
      devDependencies
    );

    if (verbose) {
      args.push("--verbose");
    }

    debug(`devDepndencies install args: ${args}`);
    install(args);
  }
}

function install(npmArgs: string[]) {
  const { status } = crossSpawn.sync("npm", npmArgs, { stdio: "inherit" });
  if (status !== 0) {
    throw {
      command: `npm ${npmArgs.join(" ")}`
    };
  }
}
