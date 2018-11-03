import chalk from "chalk";
import fsExtra from "fs-extra";
import os from "os";
import { TowerflowType } from "../interface";
import { Debug } from "./debugger";
import { installDeps } from "./install-deps";
import { parsePath } from "./parse-path";

const debug = Debug(__filename);

export function initAppFolder(options: {
  appType: TowerflowType;
  appPath: string;
  ownPath: string;
  isBypassNpm: boolean;
  preDefinedPackageJson: object;
  useCnpm: boolean;
}) {
  const {
    useCnpm,
    appPath,
    appType,
    ownPath,
    preDefinedPackageJson,
    isBypassNpm
  } = options;

  debug(`Copy template files to app folder`);
  const templatePath = parsePath(ownPath, "template", appType);
  debug(`templateDir: ${templatePath}`);

  if (fsExtra.existsSync(templatePath)) {
    try {
      fsExtra.copySync(templatePath, appPath, {
        filter: src => {
          if (checkBypassFiles(appType, src)) {
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
      parsePath(appPath, "gitignore"),
      parsePath(appPath, ".gitignore")
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === "EEXIST") {
      const data = fsExtra.readFileSync(parsePath(appPath, "gitignore"));
      fsExtra.appendFileSync(parsePath(appPath, ".gitignore"), data);
      fsExtra.unlinkSync(parsePath(appPath, "gitignore"));
    } else {
      throw err;
    }
  }

  debug(`Create package.json`);
  const tempPkgPath = parsePath(templatePath, "tmp-package.json");
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
  tempPkgJson = Object.assign({}, preDefinedPackageJson, tempPkgJson);
  debug(`Finally package.json: ${JSON.stringify(tempPkgJson, null, 2)}`);

  debug(`Write to app folder`);
  fsExtra.writeFileSync(
    parsePath(appPath, "package.json"),
    JSON.stringify(tempPkgJson, null, 2) + os.EOL
  );

  debug(`Change CWD to app path`);
  process.chdir(appPath);
  debug(`CWD: ${process.cwd()}`);

  console.log("Installing packages. This might take a couple of minutes.");
  console.log(
    `Installing deps: ${
      dependencies.length === 0
        ? chalk.red("no-deps")
        : dependencies.map(dep => chalk.cyan(dep) + " ")
    }`
  );
  console.log(
    `Installing devDeps: ${
      devDependencies.length === 0
        ? chalk.red("no-deps")
        : devDependencies.map(dep => chalk.cyan(dep) + " ").join(" ")
    }`
  );
  console.log();

  if (!isBypassNpm) {
    debug(`Begin to install deps and dev-deps`);
    try {
      installDeps(dependencies, devDependencies, useCnpm, false);
    } catch (error) {
      console.error(error);
      return;
    }
  } else {
    console.log(`npm install has been bypassed, continue to process`);
  }
}

function checkBypassFiles(appType: TowerflowType, src: string) {
  return new RegExp(`template\/${appType}\/config|tmp-package.json$`).test(
    parsePath(src)
  );
}
