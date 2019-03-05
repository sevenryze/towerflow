import chalk from "chalk";
import { clearConsole } from "../helper/clear-console";
import { Debug } from "../helper/debugger";
import { BuildType, TowerflowType } from "../interface";
import { createWebpackCompiler } from "./create-webpack-compiler";
import { createWebpackDevServer } from "./create-webpack-dev-server";
import { getWebpackConfig } from "./get-webpack-config";
import { getWebpackDevServerConfig } from "./get-webpack-dev-server-config";

const debug = Debug(__filename);

export function runWebpack(options: {
  appPath: string;
  appType: TowerflowType;
  buildType: BuildType;
  distPath: string;
  ownPath: string;
  indexPath: string;
  publicDirPath: string;
  port?: number;
}) {
  const { appPath, ownPath, buildType, port = 8080 } = options;

  debug(`Check if on interactive TTY`);
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Gnerate webpack config file`);
  const webpackConfig = getWebpackConfig(options);

  debug(`Create webpack compiler.`);
  const compiler = createWebpackCompiler({
    config: webpackConfig
  });

  if (buildType === BuildType.dev) {
    debug(`Get webpack-dev-server config file`);
    const webpackDevServerConfig = getWebpackDevServerConfig({
      appPath,
      ownPath,
      port
    });

    debug(`Create webpack dev server with configured webpack instance`);
    const devServer = createWebpackDevServer(compiler, webpackDevServerConfig!);

    debug(`Launch WebpackDevServer`);
    devServer.listen(port, "0.0.0.0", err => {
      if (err) {
        return console.log(err);
      }
      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan("Starting the development server...\n"));
    });

    ["SIGINT", "SIGTERM"].forEach(sig => {
      process.on(sig as any, () => {
        debug(`Webpack-dev-server is going to be closed`);

        devServer.close(() => {
          debug(`Webpack-dev-server closed successfully`);

          process.exit(1);
        });
      });
    });
  } else {
    debug(`Start to build web production version`);
    compiler.run((error, stats) => {
      debug(`Complete build web production version`);

      if (error) {
        console.log(error);
      }
    });
  }
}
