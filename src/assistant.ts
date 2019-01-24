import chalk from "chalk";
import fsExtra from "fs-extra";
import klawSync from "klaw-sync";
import path from "path";
import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";
import { parsePath } from "./helper/parse-path";
import { TowerflowType } from "./interface";

const debug = Debug(__filename);

export async function assistant(options: {
  appPath: string;
  ownPath: string;
  appType: TowerflowType;
  isGenerateConfig: boolean;
  isRemoveConfig: boolean;
}) {
  const {
    ownPath,
    appPath,
    appType,
    isGenerateConfig,
    isRemoveConfig
  } = options;

  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Check required files exists`);
  // Warn and crash if required files are missing
  if (!checkRequiredFiles(appPath)) {
    process.exit(1);
  }

  const configPath = parsePath(ownPath, "template", appType, "config");
  debug(`configPath: ${configPath}`);

  if (isGenerateConfig) {
    debug(`Copy config files to app folder`);

    if (fsExtra.existsSync(configPath)) {
      try {
        fsExtra.copySync(configPath, appPath);
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      console.error(
        `Could not locate supplied config: ${chalk.green(configPath)}`
      );
      return;
    }
  } else {
    const filenames = new Set<string>();

    klawSync(configPath, {
      nodir: true
    }).forEach(({ path: filePath }) => {
      const filename = path.basename(parsePath(filePath));
      debug(`Get config filename: ${filename}`);

      filenames.add(filename);
    });

    if (isRemoveConfig) {
      debug(`Remove config files from app folder`);

      filenames.forEach(name => {
        const delFile = parsePath(appPath, name);
        debug(`Delete file: ${delFile}`);

        fsExtra.removeSync(delFile);
      });
    } else {
      debug(`Show config files`);

      console.log(`Config files: ${chalk.green([...filenames].join("   "))}`);
    }
  }
}
