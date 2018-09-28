import chalk from "chalk";
import Debug from "debug";
import fsExtra from "fs-extra";
import os from "os";
import path from "path";
import { installDeps } from "../helper/install-deps";

const debug = Debug("towerflow:frontend-app-init");

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

export async function init(
  appPath: string,
  appName: string,
  fatherPath: string
) {
  debug(`Enter frontend app init script`);

  debug(`Create app dir with app name`);
  fsExtra.ensureDirSync(appName);

  console.log(`Creating a new app in ${chalk.green(appPath)}.`);
  console.log();

  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true
  };
  fsExtra.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  debug(`Change CWD to app path`);
  process.chdir(appPath);

  debug(`cwd: ${process.cwd()}`);
  const packageToInstall = "../../towerflow";
  const allDependencies = ["react", "react-dom"];
  const devDependencies = [packageToInstall];

  console.log("Installing packages. This might take a couple of minutes.");

  console.log(
    `Installing ${chalk.cyan("react")}, ${chalk.cyan(
      "react-dom"
    )}, and ${chalk.cyan(packageToInstall)}...`
  );
  console.log();

  try {
    installDeps(allDependencies, devDependencies, false);
    debug(`Complete install`);
  } catch (error) {
    console.log(error);
    return;
  }

  debug(`Install App deps completed.`);

  const ownPackageName = "towerflow";
  const ownPath = path.join(appPath, "node_modules", ownPackageName);
  const appPkgPath = path.normalize(path.join(appPath, "package.json"));
  const appPackage = require(appPkgPath);

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};

  // Setup the script rules
  appPackage.scripts = {
    start: "towerflow start",
    build: "towerflow build",
    test: "towerflow test --env=jsdom",
    publish: "towerflow publish"
  };

  appPackage["towerflow-type"] = "web-app";

  fsExtra.writeFileSync(
    path.join(appPath, "package.json"),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  const readmeExists = fsExtra.existsSync(path.join(appPath, "README.md"));
  if (readmeExists) {
    fsExtra.renameSync(
      path.join(appPath, "README.md"),
      path.join(appPath, "README.old.md")
    );
  }

  debug(`Copy template files to app folder`);
  // Copy the files for the user
  const templatePath = path.join(ownPath, "template", "web-app");
  //const templatePath = path.join(ownPath, "cjs");

  if (fsExtra.existsSync(templatePath)) {
    try {
      fsExtra.copySync(templatePath, appPath);
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
      path.join(appPath, "gitignore"),
      path.join(appPath, ".gitignore")
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === "EEXIST") {
      const data = fsExtra.readFileSync(path.join(appPath, "gitignore"));
      fsExtra.appendFileSync(path.join(appPath, ".gitignore"), data);
      fsExtra.unlinkSync(path.join(appPath, "gitignore"));
    } else {
      throw err;
    }
  }

  debug(`Display way to cd`);
  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (fatherPath && path.join(fatherPath, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  let displayedCommand = "npm";

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
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
  console.log(chalk.cyan("  cd"), cdpath);
  console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
  if (readmeExists) {
    console.log();
    console.log(
      chalk.yellow(
        "You had a `README.md` file, we renamed it to `README.old.md`"
      )
    );
  }
  console.log();
  console.log("Happy hacking!");
}
