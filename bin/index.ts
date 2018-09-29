#!/usr/bin/env node

import chalk from "chalk";
import commander from "commander";
import path from "path";
import { init } from "../src/init";
import { start } from "../src/start";
import { build } from "../src/build";
import { Debug } from "../src/helper/debugger";

const debug = Debug(__filename);

const ownPkg = require("../package.json");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

process.on("SIGINT", signal => {
  console.log(`Towerflow get SIGINT, bye!`);
  process.exit(1);
});

export enum TowerflowType {
  webApp = "web-app",
  webLib = "web-lib",
  nodeApp = "node-app",
  nodeLib = "node-lib"
}

commander
  .name(ownPkg.name)
  .description(chalk.cyan("The workflow used by The Tower Edu Inc."))
  .version(ownPkg.version, "-v, --version")
  .usage(chalk.greenBright("[global-options] <command> [command-options]"));

commander
  .command("init <name>")
  .description("Initialize the project: [name] with the specific template.")
  .option("--template [template]", "The template should we use to manipulate.")
  .option("--force", "Force delete and re-init the target directory.")
  .option("--bypass-npm", "Bypass the npm install step")
  .action(
    (
      name: string,
      cmdOptions: {
        force: boolean;
        template: TowerflowType;
        bypassNpm: boolean;
      }
    ) => {
      debug(
        `Init command, app name: ${name}, template: ${
          cmdOptions.template
        }, force: ${cmdOptions.force}, bypassNpm: ${cmdOptions.bypassNpm}`
      );

      const fatherRoot = path.resolve(process.cwd());
      const appRoot = path.join(fatherRoot, name);
      const ownPath = path.join(__dirname, "../");
      const appType = cmdOptions.template;

      debug(
        `appRoot: ${appRoot}, fatherRoot: ${fatherRoot}, ownPath: ${ownPath}`
      );

      const preDefinedPackageJson = Object.assign(
        {},
        {
          name: name
        },
        ["node-app", "node-lib"].includes(appType) && {
          bin: {
            [name]: "index.js"
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
        appPath: appRoot,
        appName: name,
        fatherPath: fatherRoot,
        ownPath: ownPath,
        appType: cmdOptions.template,
        preDefinedPackageJson,
        isBypassNpm: cmdOptions.bypassNpm
      });
    }
  );

commander
  .command("start")
  .description("Start to develop this project.")
  .action(() => {
    debug(`We call the start command.`);

    const appPath = process.cwd();
    const appPkgJson = require(path.join(appPath, "package.json"));
    const appName = appPkgJson.name;
    const appType = appPkgJson.towerflow.type;
    const ownName = ownPkg.name;
    const ownPath = path.join(__dirname, "../");

    switch (appType) {
      case TowerflowType.webApp:
        start({ appPath, appName, ownPath, appType });
        break;
      case TowerflowType.webLib:
        start({ appPath, appName, ownPath, appType });
        break;
      case TowerflowType.nodeApp:
        start({ appPath, appName, ownPath, appType });
        break;
      case TowerflowType.nodeLib:
        start({ appPath, appName, ownPath, appType });
        break;
      default:
        console.log(`The template argument gets Unknown type.`);
    }
  });

commander
  .command("build")
  .description("Build the optimised version for publish.")
  .action(() => {
    debug(`We call the build command.`);

    const appPath = process.cwd();
    const appPkgJson = require(path.join(appPath, "package.json"));
    const appName = appPkgJson.name;
    const appType = appPkgJson.towerflow.type;
    const ownName = ownPkg.name;
    const ownPath = path.join(__dirname, "../");

    switch (appType) {
      case TowerflowType.webApp:
        break;
      case TowerflowType.webLib:
        build({
          appPath,
          ownPath,
          appName,
          appType
        });
        break;
      case TowerflowType.nodeApp:
        break;
      case TowerflowType.nodeLib:
        break;
      default:
        console.log(`The template argument gets Unknown type.`);
    }
  });

commander
  .command("publish")
  .description("Publish this project.")
  .action(() => {
    debug(`We call the publish command.`);
  });

commander
  .command("test")
  .description("Run the test suits.")
  .option("--env <env>", "The environment on which the test suits run.")
  .action(() => {
    debug(`We call the test command.`);
  });

commander.parse(process.argv);
