import chalk from "chalk";
import fsExtra from "fs-extra";
import os from "os";
import path from "path";
import { TowerflowType } from "../../bin";
import { Debug } from "./debugger";
import { normalPath } from "./normal-path";
import { installDeps } from "./install-deps";

const debug = Debug(__filename);

export function initAppFolder(options: {
  ownPath: string;
  appType: TowerflowType;
  appPath: string;
  preDefinedPackageJson: object;
  isBypassNpm: boolean;
}) {
  debug(`Copy template files to app folder`);
  const templatePath = path.join(options.ownPath, "template", options.appType);
  debug(`templateDir: ${templatePath}`);

  if (fsExtra.existsSync(templatePath)) {
    try {
      fsExtra.copySync(templatePath, options.appPath, {
        filter: src => {
          if (checkBypassFiles(options.appType, src)) {
            debug(`Bypass copy template file: ${src}`);
            return false;
          }

          return true;
        }
      });
    } catch (error) {
      console.log(error);
      return;
    }
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templatePath)}`
    );
    return;
  }

  debug(`Rename gitignore to .gitignore`);
  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  try {
    fsExtra.moveSync(
      path.join(options.appPath, "gitignore"),
      path.join(options.appPath, ".gitignore")
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === "EEXIST") {
      const data = fsExtra.readFileSync(
        path.join(options.appPath, "gitignore")
      );
      fsExtra.appendFileSync(path.join(options.appPath, ".gitignore"), data);
      fsExtra.unlinkSync(path.join(options.appPath, "gitignore"));
    } else {
      throw err;
    }
  }

  debug(`Create package.json`);
  const tempPkgPath = path.join(templatePath, "package.json");
  let tempPkgJson = require(tempPkgPath);

  debug(`Get dependencies from template package.json`);
  const dependencies: string[] = [];
  const devDependencies: string[] = [];
  Object.keys(tempPkgJson.dependencies).map(dep => {
    dependencies.push(dep);
  });
  Object.keys(tempPkgJson.devDependencies).map(dep => {
    devDependencies.push(dep);
  });
  debug(`dependencies: ${dependencies}, devDependencies: ${devDependencies}`);

  delete tempPkgJson.dependencies;
  delete tempPkgJson.devDependencies;
  tempPkgJson = Object.assign({}, options.preDefinedPackageJson, tempPkgJson);
  debug(`Finally package.json: ${JSON.stringify(tempPkgJson, null, 2)}`);

  debug(`Write to app folder`);
  fsExtra.writeFileSync(
    path.join(options.appPath, "package.json"),
    JSON.stringify(tempPkgJson, null, 2) + os.EOL
  );

  debug(`Change CWD to app path`);
  process.chdir(options.appPath);
  debug(`CWD: ${process.cwd()}`);

  console.log("Installing packages. This might take a couple of minutes.");
  console.log(
    `Installing deps: ${
      dependencies.length === 0
        ? chalk.red("no-deps")
        : dependencies.map(dep => chalk.cyan(dep) + " ")
    } and devDeps: ${devDependencies.map(dep => chalk.cyan(dep) + " ")}`
  );
  console.log();

  if (!options.isBypassNpm) {
    debug(`Begin to install deps and dev-deps`);
    try {
      installDeps(dependencies, devDependencies, false);
    } catch (error) {
      console.log(error);
      return;
    }
  } else {
    debug(`npm instal bypassed, continue to process`);
  }
}

function checkBypassFiles(appType: TowerflowType, src: string) {
  return new RegExp(`template\/${appType}\/config|package.json$`).test(
    normalPath(src)
  );
}
