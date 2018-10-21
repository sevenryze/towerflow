import chalk from "chalk";
import fsExtra from "fs-extra";
import { Debug } from "./helper/debugger";
import { initAppFolder } from "./helper/init-app-folder";
import { waitSecond } from "./helper/wait-time";
import { TowerflowType } from "./interface";

const debug = Debug(__filename);

/**
 * Call this function to make one app template.
 */
export async function init(options: {
  appName: string;
  appPath: string;
  appType: TowerflowType;
  fatherPath: string;
  ownPath: string;
  isBypassNpm: boolean;
  isForce: boolean;
  preDefinedPackageJson: object;
}) {
  const {
    appName,
    ownPath,
    appType,
    isBypassNpm,
    preDefinedPackageJson,
    appPath,
    isForce,
    fatherPath
  } = options;

  debug(`Check if target app folder exists.`);
  if (fsExtra.existsSync(appPath)) {
    if (isForce) {
      console.log(
        `You will delete the ${appName} folder, I give you ${chalk.redBright(
          "5 seconds to CTRL-C"
        )} this process.`
      );

      await waitSecond(5, restSeconds => {
        console.log(
          `You have ${chalk.green(restSeconds.toString())} rest seconds.`
        );
      });

      console.log(
        `OK, you have awared what you are doing. Now, deleting the ${appName} folder.`
      );

      fsExtra.removeSync(appPath);
    } else {
      console.log(`The ${appName} folder is not empty, exit.`);
      process.exit(1);
    }
  }

  debug(`Create app directory`);
  fsExtra.ensureDirSync(appName);

  console.log(`Creating type: ${appType} in ${chalk.green(appPath)}.`);
  console.log();

  debug(`Initialize the app folder with template`);
  initAppFolder(options);

  let displayedCommand = "npm";

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log("    Starts the development process.");
  console.log();
  console.log(chalk.cyan(`  npm run build`));
  console.log("    Bundles the app into static files.");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} test`));
  console.log("    Starts the test suits.");
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} run config-files`));
  console.log(
    "    Show the using configuration files of this process, additionally, you could use " +
      `${chalk.green("--generate")} or ${chalk.green("--remove")} flag.`
  );
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), appName);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
  console.log();
  console.log("Towerflow hopes you happy hacking!");
}
