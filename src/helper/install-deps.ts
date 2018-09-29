import crossSpawn from "cross-spawn";
import { Debug } from "./debugger";

const debug = Debug(__filename);

export function installDeps(
  dependencies: string[],
  devDependencies: string[],
  verbose: boolean
) {
  let args: string[];

  if (dependencies.length > 0) {
    let args = [
      "install",
      "--save",
      "--save-exact",
      "--loglevel",
      "error"
    ].concat(dependencies);

    if (verbose) {
      args.push("--verbose");
    }

    debug(`Depndencies install args: ${args}`);

    const { status } = crossSpawn.sync("npm", args, { stdio: "inherit" });
    if (status != 0) {
      throw {
        command: `npm ${args.join(" ")}`
      };
    }
  }

  if (devDependencies.length > 0) {
    args = [
      "install",
      "-D",
      "--save",
      "--save-exact",
      "--loglevel",
      "error"
    ].concat(devDependencies);

    if (verbose) {
      args.push("--verbose");
    }

    debug(`devDepndencies install args: ${args}`);

    const { status } = crossSpawn.sync("npm", args, { stdio: "inherit" });
    if (status != 0) {
      throw {
        command: `npm ${args.join(" ")}`
      };
    }
  }
}
