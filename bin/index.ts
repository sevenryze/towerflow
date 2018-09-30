#!/usr/bin/env node

import chalk from "chalk";
import commander from "commander";
import { build } from "../src/build";
import { Debug } from "../src/helper/debugger";
import { parsePath } from "../src/helper/parse-path";
import { init } from "../src/init";
import { configFiles } from "../src/config-files";
import { start } from "../src/start";
import { matchTowerflowTypes } from "../src/helper/match-towerflow-types";

const debug = Debug(__filename);

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

process.on("SIGINT", signal => {
  console.log(`Towerflow get ${signal}, bye!`);
  process.exit(1);
});

export const enum TowerflowType {
  webApp = "web-app",
  webLib = "web-lib",
  nodeApp = "node-app",
  nodeLib = "node-lib"
}

const ownPkg = require("../package.json");
commander
  .name(ownPkg.name)
  .description(chalk.cyan("The workflow used by The Tower Edu Inc."))
  .version(ownPkg.version, "-v, --version")
  .usage(chalk.greenBright("[global-options] <command> [command-options]"));

commander
  .command("init <name>")
  .description("Initialize the project: [name] with the specific template.")
  .option("--template [template]", "The template should we use to manipulate.")
  .option(
    "--force",
    "Force delete and re-init the target directory. " +
      chalk.redBright("USE WITH HEART")
  )
  .option("--bypass-npm", "Bypass the npm install step.")
  .action(
    (
      name: string,
      cmdOptions: {
        force: boolean;
        template: TowerflowType;
        bypassNpm: boolean;
      } = {
        force: false,
        template: TowerflowType.webLib,
        bypassNpm: true
      }
    ) => {
      debug(`Init command, app name: ${name}`);

      const {
        bypassNpm: isBypassNpm,
        template: appType,
        force: isForce
      } = cmdOptions;
      if (!matchTowerflowTypes(appType)) {
        console.error(`Not support the template: ${appType}, exit.`);
        process.exit(1);
      }

      const fatherPath = parsePath(process.cwd());
      const appPath = parsePath(fatherPath, name);
      const ownPath = parsePath(__dirname, "..");
      const appName = name;

      debug(
        `appPath: ${appPath}, fatherPath: ${fatherPath}, ownPath: ${ownPath}`
      );

      const preDefinedPackageJson = Object.assign(
        {},
        {
          name: appName
        },
        ["node-app"].includes(appType) && {
          bin: {
            [appName]: "bin/index.js"
          }
        }
      );
      debug(
        `preDefinedPackageJson: ${JSON.stringify(
          preDefinedPackageJson,
          null,
          2
        )}`
      );

      init({
        appPath,
        appName,
        fatherPath,
        ownPath,
        appType,
        preDefinedPackageJson,
        isBypassNpm,
        isForce
      });
    }
  );

commander
  .command("start")
  .description("Start to develop this project.")
  .action(() => {
    const appPath = process.cwd();
    const appPkgJson = require(parsePath(appPath, "package.json"));
    const appName = appPkgJson.name;
    const appType = appPkgJson.towerflow.type;
    const ownPath = parsePath(__dirname, "..");

    debug(
      `Start command. appPath: ${appPath}, appType: ${appType}, ownPath: ${ownPath}`
    );

    start({ appPath, appName, ownPath, appType });
  });

commander
  .command("build")
  .description("Build the optimised version for publish.")
  .action(() => {
    debug(`We call the build command.`);

    const appPath = process.cwd();
    const appPkgJson = require(parsePath(appPath, "package.json"));
    const appName = appPkgJson.name;
    const appType = appPkgJson.towerflow.type;
    const ownName = ownPkg.name;
    const ownPath = parsePath(__dirname, "../");

    switch (appType) {
      case TowerflowType.webApp:
        // TODO: Make this one.

        break;
      case TowerflowType.webLib:
      case TowerflowType.nodeApp:
      case TowerflowType.nodeLib:
        build({
          appPath,
          ownPath,
          appName,
          appType
        });

        break;
      default:
        console.log(`The template argument gets Unknown type.`);
    }
  });

commander
  .command("config-files")
  .description(
    `Generate assistant files like tsconfig.json, tslint.json and jest.config.js. Note that changing these files ${chalk.redBright(
      "DO NOT"
    )} affect workflow.`
  )
  .option("--generate", "Generate config files for IDE assistant.")
  .option("--remove", "Delete those config files.")
  .action((options: { generate: boolean; remove: boolean }) => {
    debug(`We call the config-files command.`);

    debug(
      `config-files command, generate: ${options.generate}, remove: ${
        options.remove
      }`
    );

    const appPath = process.cwd();
    const appPkgJson = require(parsePath(appPath, "package.json"));
    const appType = appPkgJson.towerflow.type;
    const ownPath = parsePath(__dirname, "../");

    configFiles({
      appPath,
      appType,
      ownPath,
      isGenerate: options.generate,
      isRemove: options.remove
    });
  });

commander
  .command("test")
  .description("Run the test suits.")
  .option("--env <env>", "The environment on which the test suits run.")
  .action(() => {
    debug(`We call the test command.`);
  });

commander.parse(process.argv);
