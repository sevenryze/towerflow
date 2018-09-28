#!/usr/bin/env node

import chalk from "chalk";
import commander from "commander";
import Debug from "debug";
import path from "path";
import { init } from "../src/init";
import { start as nodeAppStart } from "../src/start";
import { start as webAppStart } from "../src/web-app/start";

const debug = Debug("towerflow:cli");

const ownPkg = require("../package.json");

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
  .option("--only-template", "Only build the template")
  .action(
    (
      name: string,
      cmdOptions: { force: boolean; template: string; onlyTemplate: boolean }
    ) => {
      debug(
        `Init command, app name: ${name}, force: ${
          cmdOptions.force
        }, template: ${cmdOptions.template}`
      );

      const fatherRoot = path.resolve(process.cwd());
      const appRoot = path.join(fatherRoot, name);
      const ownPath = path.join(__dirname, "../");

      debug(
        `appRoot: ${appRoot}, fatherRoot: ${fatherRoot}, ownPath: ${ownPath}`
      );

      switch (cmdOptions.template) {
        case TowerflowType.webApp:
          init({
            appPath: appRoot,
            appName: name,
            fatherPath: fatherRoot,
            ownPath: ownPath,
            appType: TowerflowType.webApp,
            appDeps: [
              "react",
              "@types/react",
              "react-dom",
              "@types/react-dom",
              "styled-components",
              "@types/styled-components"
            ],
            appDevDeps: ["towerflow"],
            preDefinedPackageJson: {
              name: name,
              version: "0.1.0",
              private: true,
              scripts: {
                start: "towerflow start",
                build: "towerflow build",
                test: "towerflow test --env=jsdom",
                publish: "towerflow publish"
              },
              towerflow: {
                type: TowerflowType.webApp
              }
            }
          });

          break;
        case TowerflowType.webLib:
          init({
            appPath: appRoot,
            appName: name,
            fatherPath: fatherRoot,
            ownPath: ownPath,

            appType: TowerflowType.webLib,
            appDeps: [],
            appDevDeps: [
              "towerflow",
              "react",
              "@types/react",
              "react-dom",
              "@types/react-dom",
              "styled-components",
              "@types/styled-components"
            ],
            preDefinedPackageJson: {
              name: name,
              version: "0.1.0",
              private: true,
              files: ["src/component/", "!src/component/**/*.ts", "typings/"],
              scripts: {
                start: "towerflow start",
                build: "towerflow build",
                test: "towerflow test --env=jsdom",
                publish: "towerflow publish"
              },
              towerflow: {
                type: TowerflowType.webLib
              }
            }
          });

          break;
        case TowerflowType.nodeApp:
          init({
            appPath: appRoot,
            appName: name,
            fatherPath: fatherRoot,
            ownPath: ownPath,
            appType: TowerflowType.nodeApp,
            appDeps: [],
            appDevDeps: cmdOptions.onlyTemplate ? [] : ["towerflow"],
            preDefinedPackageJson: {
              name: name,
              version: "0.1.0",
              private: true,
              bin: {
                [name]: "index.js"
              },
              files: [
                "bin/",
                "!bin/**/*.ts",
                "src/",
                "!src/**/*.ts",
                "typings/"
              ],
              scripts: {
                start: "towerflow start",
                build: "towerflow build",
                test: "towerflow test --env=jsdom",
                publish: "towerflow publish"
              },
              towerflow: {
                type: TowerflowType.nodeApp
              }
            }
          });

          break;
        case TowerflowType.nodeLib:
          init({
            appPath: appRoot,
            appName: name,
            fatherPath: fatherRoot,
            ownPath: ownPath,
            appType: TowerflowType.nodeLib,
            appDeps: [],
            appDevDeps: ["towerflow"],
            preDefinedPackageJson: {
              name: name,
              version: "0.1.0",
              private: true,
              files: ["src/", "!src/**/*.ts", "typings/"],
              scripts: {
                start: "towerflow start",
                build: "towerflow build",
                test: "towerflow test --env=jsdom",
                publish: "towerflow publish"
              },
              towerflow: {
                type: TowerflowType.nodeLib
              }
            }
          });
          break;
        default:
          console.log(
            `The template argument gets Unknown type, valid type: Fuck you! dummy suck loser, you gonna typing everything wrong?`
          );
      }
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
