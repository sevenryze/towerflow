import crossSpawn from "cross-spawn";
import { Debug } from "./debugger";

const debug = Debug(__filename);

export function installDeps(
  dependencies: string[],
  devDependencies: string[],
  useCnpm: boolean,
  verbose: boolean
) {
  let tool = "npm";
  if (useCnpm) {
    tool = "cnpm";
  }

  if (dependencies.length > 0) {
    const args = ["install", "--save", "--loglevel", "error"].concat(
      dependencies
    );

    if (verbose) {
      args.push("--verbose");
    }

    debug(`Depndencies install args: ${args}`);
    install(args, tool);
  }

  if (devDependencies.length > 0) {
    const args = ["install", "-D", "--save", "--loglevel", "error"].concat(
      devDependencies
    );

    if (verbose) {
      args.push("--verbose");
    }

    debug(`devDepndencies install args: ${args}`);
    install(args, tool);
  }
}

function install(npmArgs: string[], tool: string) {
  const { status } = crossSpawn.sync(tool, npmArgs, { stdio: "inherit" });
  if (status !== 0) {
    throw {
      command: `npm ${npmArgs.join(" ")}`
    };
  }
}
