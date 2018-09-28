#!/usr/bin/env node

import chalk from "chalk";
import commander from "commander";
import Debug from "debug";
import path from "path";
import { init as webAppInit } from "../src/web-app/init";
import { start as webAppStart } from "../src/web-app/start";
import { init as nodeAppInit } from "../src/node-app/init";
import { start as nodeAppStart } from "../src/node-app/start";
import ownPkg from "../package.json";

const debug = Debug("towerflow:cli");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
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
  .action((name: string, cmdOptions: { force: boolean; template: string }) => {
    debug(
      `Init command, app name: ${name}, force: ${cmdOptions.force}, template: ${
        cmdOptions.template
      }`
    );

    let fatherRoot;
    let appRoot;
    fatherRoot = path.resolve(process.cwd());
    appRoot = path.join(fatherRoot, name);

    debug(`appRoot: ${appRoot}, fatherRoot: ${fatherRoot}`);

    switch (cmdOptions.template) {
      case TowerflowType.webApp:
        webAppInit(appRoot, name, fatherRoot);
        break;
      case TowerflowType.webLib:
        break;
      case TowerflowType.nodeApp:
        nodeAppInit(appRoot, name, fatherRoot);
        break;
      case TowerflowType.nodeLib:
        break;
      default:
        console.log(`The template argument gets Unknown type.`);
    }
  });

commander
  .command("start")
  .description("Start to develop this project.")
  .action(() => {
    debug(`We call the start command.`);

    const appPath = process.cwd();
    const appPkg = require(path.join(appPath, "package.json"));
    const appName = appPkg.name;
    const appType = appPkg["towerflow-type"];
    const ownName = ownPkg.name;
    const ownPath = path.join(appPath, "node_modules", ownName);

    switch (appType) {
      case TowerflowType.webApp:
        webAppStart(appPath, appName, ownPath);
        break;
      case TowerflowType.webLib:
        break;
      case TowerflowType.nodeApp:
        nodeAppStart(appPath, appName, ownPath);
        break;
      case TowerflowType.nodeLib:
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
