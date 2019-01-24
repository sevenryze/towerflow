import path from "path";
import semver from "semver";
import { Debug } from "./debugger";
import { parsePath } from "./parse-path";
import fs from "fs";
import chalk from "chalk";

const debug = Debug(__filename);

export function checkRequiredFiles(appPath: string): boolean {
  const appPkgJson = require(parsePath(appPath, "package.json"));
  const dependencies = {
    ...appPkgJson.dependencies,
    ...appPkgJson.devDependencies
  };
  const nodeModulesPath = path.join(appPath, "node_modules");
  for (let moduleName in dependencies) {
    const expectedVersion = dependencies[moduleName];
    debug(`check dependenices ${moduleName}, expected version: ${expectedVersion}`);

    const modulePath = path.join(nodeModulesPath, moduleName);

    if (!fs.existsSync(modulePath)) {
      console.log(chalk.red(`uninstalled dependency: ${moduleName}`));
      return false;
    }

    const modulePackageJSON = require(parsePath(modulePath, "package.json"));
    const currentVersion = modulePackageJSON.version;

    if (!semver.satisfies(currentVersion, expectedVersion)) {
      console.log(chalk.red(`dependency ${moduleName} have error version，current version: ${currentVersion}, expected version: ${expectedVersion}`));
      return false;
    }
  }

  return true;
}
