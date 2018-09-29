import chalk from "chalk";
import chokidar from "chokidar";
import fsExtra from "fs-extra";
import { Debug } from "./debugger";
import { matchCompilerGeneratedFile } from "./match-compiler-generated-file";
import { matchTsFile } from "./match-ts-file";
import { parsePath } from "./parse-path";

const debug = Debug(__filename);

export function watchAndcleanGeneratedFiles(
  appPath: string,
  tsconfigJson: {
    include: string[];
    exclude: string[];
  },
  isWatch: boolean
) {
  const watchPaths: string[] = [];
  tsconfigJson.include.map((dir: string) => {
    dir !== "typings" && watchPaths.push(parsePath(appPath, dir));
  });

  debug(`Create watcher with watch path: ${watchPaths}`);
  const watcher = chokidar.watch(watchPaths);

  const watchedTsFiles = new Set<string>();
  const watchedOtherFiles = new Set<string>();

  watcher.on("add", (filePath: string) => {
    debug(`watching on ${filePath}`);

    // Match .ts and .tsx, not d.ts
    if (matchTsFile(filePath)) {
      watchedTsFiles.add(filePath);
    } else {
      // Not only have we the generated files, not also the files created by users intentially.
      if (matchCompilerGeneratedFile(filePath)) {
        watchedOtherFiles.add(filePath);
      } else {
        // Not not allow user to create some wired files.
        console.log(
          chalk.red(
            `You have created an illigal file: ${filePath}, we will delete it when you terminate this dev process`
          )
        );
        watchedOtherFiles.add(filePath);
      }
    }
  });

  if (!isWatch) {
    return new Promise((resolve, reject) => {
      watcher.on("ready", () => {
        watchedOtherFiles.forEach(filePath => {
          debug(`delete file: ${filePath}`);
          fsExtra.removeSync(filePath);
        });

        debug(`close chokidar watcher`);
        watcher.close();
        resolve();
      });
    });
  }

  watcher.on("unlink", (filePath: string) => {
    if (!matchTsFile(filePath)) {
      return;
    }

    debug(`Find .ts removed: ${filePath}`);

    const generatedFileSuffix = [".d.ts", ".d.ts.map", ".js", ".js.map"];
    generatedFileSuffix.map(suffix => {
      const delFile = filePath.replace(/\.tsx?$/, suffix);

      debug(`Delete file: ${delFile}`);
      fsExtra.removeSync(delFile);
    });
  });

  process.on("exit", code => {
    debug(`process exit with code: ${code}`);

    debug(`clean src folder`);
    watchedOtherFiles.forEach(filePath => {
      debug(`delete file: ${filePath}`);
      fsExtra.removeSync(filePath);
    });

    debug(`clean chokidar watcher`);
    watcher && watcher.close();
  });
}
