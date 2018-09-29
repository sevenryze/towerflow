import chalk from "chalk";
import fsExtra from "fs-extra";
import { TowerflowType } from "../bin";
import { Debug } from "./helper/debugger";
import { initAppFolder } from "./helper/init-app-folder";

const debug = Debug(__filename);

/**
 * Call this function to scofflot one app.
 */
export function init(options: {
  appPath: string;
  appName: string;
  fatherPath: string;
  ownPath: string;
  appType: TowerflowType;
  isBypassNpm: boolean;
  preDefinedPackageJson: object;
}) {
  debug(`Enter init script, type: ${options.appType}`);

  debug(`Create app directory`);
  fsExtra.ensureDirSync(options.appName);

  console.log(
    `Creating type: ${options.appType} in ${chalk.green(options.appPath)}.`
  );
  console.log();

  debug(`Initialize the app folder with template`);
  initAppFolder(options);

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
