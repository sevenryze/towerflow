import chalk from "chalk";
import Debug from "debug";
import fsExtra from "fs-extra";
import os from "os";
import path from "path";
import { TowerflowType } from "../bin";
import { installDeps } from "./helper/install-deps";

const debug = Debug("towerflow:script-init");

/**
 * Call this function to scofflot one app.
 */
export function init(options: {
  appPath: string;
  appName: string;
  fatherPath: string;
  ownPath: string;
  appType: TowerflowType;
  appDeps: string[];
  appDevDeps: string[];
  preDefinedPackageJson: object;
}) {
  debug(`Enter init script, type: ${options.appType}`);

  debug(`Create app directory`);
  fsExtra.ensureDirSync(options.appName);

  console.log(
    `Creating type: ${options.appType} in ${chalk.green(options.appPath)}.`
  );
  console.log();

  debug(`Create package.json`);
  fsExtra.writeFileSync(
    path.join(options.appPath, "package.json"),
    JSON.stringify(options.preDefinedPackageJson, null, 2) + os.EOL
  );

  debug(`Change CWD to app path`);
  process.chdir(options.appPath);

  debug(`cwd: ${process.cwd()}`);
  const dependencies = options.appDeps;
  const devDependencies = options.appDevDeps;

  console.log("Installing packages. This might take a couple of minutes.");
  console.log(
    `Installing deps: ${
      dependencies.length === 0
        ? chalk.red("no-deps")
        : dependencies.map(dep => chalk.cyan(dep) + " ")
    } and devDeps: ${devDependencies.map(dep => chalk.cyan(dep) + " ")}`
  );
  console.log();

  debug(`Begin to install deps and dev-deps`);
  try {
    installDeps(dependencies, devDependencies, false);
  } catch (error) {
    console.log(error);
    return;
  }

  debug(`Copy README.md`);
  fsExtra.existsSync(path.join(options.appPath, "README.md"));

  const templatePath = path.join(options.ownPath, "template", options.appType);

  debug(`Copy template files to app folder, templateDir: ${templatePath}`);
  if (fsExtra.existsSync(templatePath)) {
    try {
      fsExtra.copySync(templatePath, options.appPath, {
        filter: (src, dest) => {
          if (/node-app\/config/.test(src)) {
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

  let displayedCommand = "npm";

  console.log();
  console.log(`Success! Created ${options.appName} at ${options.appPath}`);
  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log("    Starts the development server.");
  console.log();
  console.log(chalk.cyan(`  npm run build`));
  console.log("    Bundles the app into static files for production.");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} test`));
  console.log("    Starts the test runner.");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} run eject`));
  console.log(
    "    Removes this tool and copies build dependencies, configuration files"
  );
  console.log(
    "    and scripts into the app directory. If you do this, you can’t go back!"
  );
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), options.appName);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
  console.log();
  console.log("Happy hacking!");
}
