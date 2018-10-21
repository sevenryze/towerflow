import chalk from "chalk";
import Webpack from "webpack";
import webpackDevServer from "webpack-dev-server";
import { clearConsole } from "../helper/clear-console";
import { Debug } from "../helper/debugger";
import { BuildType, TowerflowType } from "../interface";
import { createWebpackCompiler } from "./create-webpack-compiler";
import { createWebpackDevServer } from "./create-webpack-dev-server";
import { getWebpackConfig } from "./get-webpack-config";
import { getWebpackDevServerConfig } from "./get-webpack-dev-server-config";

const debug = Debug(__filename);

export function runWebpack(options: {
  type: BuildType;
  appPath: string;
  appName: string;
  appType: TowerflowType;
  ownPath: string;
  distPath: string;
  indexPath: string;
  binPath?: string;
  publicDirPath?: string;
}) {
  const { type, appType, appName, appPath } = options;

  debug(`Check if on interactive TTY`);
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Gnerate webpack config file`);
  const webpackConfig = getWebpackConfig(options);

  let webpackDevServerConfig: Webpack.Configuration | undefined;

  if (
    type === BuildType.dev &&
    [TowerflowType.webApp, TowerflowType.webLib].includes(appType)
  ) {
    debug(`Get webpack-dev-server config file`);
    webpackDevServerConfig = getWebpackDevServerConfig(options);

    debug(`Add wds hot module reload entry scripts`);
    webpackDevServer.addDevServerEntrypoints(
      webpackConfig,
      webpackDevServerConfig
    );
  }

  debug(`Create a webpack compiler that is configured with custom messages.`);
  const compiler = createWebpackCompiler({
    config: webpackConfig,
    appName,
    appType
  });

  switch (type) {
    case BuildType.dev:
      if ([TowerflowType.webApp, TowerflowType.webLib].includes(appType)) {
        webDev();
      } else {
        nodeDev();
      }
      break;
    case BuildType.production:
      if ([TowerflowType.webApp].includes(appType)) {
        webProduction();
      } else {
        nodeProduction();
      }
      break;
  }

  function nodeDev() {
    debug(`Start to watch nodejs`);
    const watcher = compiler.watch({}, (error, stats) => {
      if (error) {
        console.log(error);
      }
    });

    ["SIGINT", "SIGTERM"].forEach(sig => {
      process.on(sig as any, () => {
        debug(`The watching webpack is going to be closed`);
        watcher.close(() => {
          debug(`Webpack closed successfully`);

          process.exit(1);
        });
      });
    });
  }

  function nodeProduction() {
    debug(`Start to build nodejs production version`);
    compiler.run((error, stats) => {
      debug(`Complete build node production version`);

      if (error) {
        console.log(error);
      }
    });
  }

  function webDev() {
    debug(`Create webpack dev server with configured webpack instance`);
    const devServer = createWebpackDevServer(compiler, webpackDevServerConfig!);

    debug(`Launch WebpackDevServer`);
    devServer.listen(8080, "0.0.0.0", err => {
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
  }

  function webProduction() {
    debug(`Start to build web production version`);
    compiler.run((error, stats) => {
      debug(`Complete build web production version`);

      if (error) {
        console.log(error);
      }
    });
  }
}
