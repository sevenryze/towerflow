#!/usr/bin/env node

import chalk from "chalk";
import commander from "commander";
import { assistant } from "../src/assistant";
import { Debug } from "../src/helper/debugger";
import { matchTowerflowTypes } from "../src/helper/match-towerflow-types";
import { parsePath } from "../src/helper/parse-path";
import { init } from "../src/init";
import { TowerflowType } from "../src/interface";
import { production } from "../src/production";
import { start } from "../src/start";
import { test } from "../src/test";

const debug = Debug(__filename);

const ownPkg = require("../../package.json");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const ownPath = parsePath(__dirname, "../../");

commander
  .name(ownPkg.name)
  .description(chalk.cyan("The workflow used by The Tower Edu Inc."))
  .version(ownPkg.version, "-v, --version")
  .usage(chalk.greenBright("[global-options] <command> [command-options]"));

commander
  .command("init <name>")
  .description("Initialize the project: [name] with the specific template.")
  .option("--template [template]", "The template should we use to manipulate.")
  .option("--force", "Force delete and re-init the target directory. " + chalk.redBright("USE WITH CAUTION"))
  .option("--bypass-npm", "Bypass the npm install step.")
  .option("--use-cnpm", "Use cnpm as npm install tool.")
  .action(
    (
      name: string,
      cmdOptions: {
        bypassNpm: boolean;
        force: boolean;
        template: TowerflowType;
        useCnpm: boolean;
      } = {
        bypassNpm: false,
        force: false,
        template: TowerflowType.webLib,
        useCnpm: false,
      }
    ) => {
      const { bypassNpm: isBypassNpm, template: appType, force: isForce, useCnpm } = cmdOptions;
      if (!matchTowerflowTypes(appType)) {
        console.error(`Not support this template: ${appType}, exit.`);
        process.exit(1);
      }

      const fatherPath = parsePath(process.cwd());
      const appPath = parsePath(fatherPath, name);
      const appName = name;

      debug(`${chalk.greenBright("Init command")}. appPath: ${appPath}, appType: ${appType}, ownPath: ${ownPath}`);

      const preDefinedPackageJson = Object.assign(
        {
          name: appName,
        },
        [TowerflowType.nodeApp].includes(appType) && {
          bin: {
            [appName]: "dist/bin/index.js",
          },
        }
      );
      debug(`preDefinedPackageJson: ${JSON.stringify(preDefinedPackageJson, null, 2)}`);

      init({
        appName,
        appPath,
        fatherPath,
        ownPath,
        appType,
        preDefinedPackageJson,
        isBypassNpm,
        isForce,
        useCnpm,
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

    debug(`${chalk.greenBright("Start command")}. appPath: ${appPath}, appType: ${appType}, ownPath: ${ownPath}`);

    start({ appPath, ownPath, appType });
  });

commander
  .command("production")
  .description("Build the optimized version for publish.")
  .action(() => {
    const appPath = process.cwd();
    const appPkgJson = require(parsePath(appPath, "package.json"));
    const appName = appPkgJson.name;
    const appType = appPkgJson.towerflow.type;

    debug(`${chalk.greenBright("Production command")}. appPath: ${appPath}, appType: ${appType}, ownPath: ${ownPath}`);

    production({
      appPath,
      ownPath,
      appType,
    });
  });

commander
  .command("assistant")
  .description(`Do the IDE assistant stuff.`)
  .option(
    "--generate-config",
    `Generate config files assistanting for IDE. Note that changing these files ${chalk.redBright(
      "DO NOT"
    )} affect workflow.`
  )
  .option("--remove-config", "Delete these config files.")
  .action((options: { generateConfig: boolean; removeConfig: boolean }) => {
    const appPath = process.cwd();
    const appPkgJson = require(parsePath(appPath, "package.json"));
    const appType = appPkgJson.towerflow.type;

    debug(
      `${chalk.greenBright(
        "Assistant command"
      )}. appPath: ${appPath}, appType: ${appType}, ownPath: ${ownPath}, isGenerate: ${
        options.generateConfig
      }, isRemove: ${options.removeConfig}`
    );

    assistant({
      appPath,
      appType,
      isGenerateConfig: options.generateConfig,
      isRemoveConfig: options.removeConfig,
      ownPath,
    });
  });

commander
  .command("test")
  .description("Run the test suits.")
  .option("--env <env>", "The environment on which the test suits run.")
  .action(() => {
    const appPath = process.cwd();
    const appPkgJson = require(parsePath(appPath, "package.json"));
    const appName = appPkgJson.name;
    const appType = appPkgJson.towerflow.type;

    debug(`${chalk.greenBright("Test command")}. appPath: ${appPath}, appType: ${appType}, ownPath: ${ownPath}`);

    test({
      appName,
      appPath,
      appType,
      ownPath,
    });
  });

commander.parse(process.argv);

if (!commander.args.length) {
  commander.help();
}
