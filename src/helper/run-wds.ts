import chalk from "chalk";
import webpackDevServer from "webpack-dev-server";
import { TowerflowType } from "../../bin";
import { getWebpackConfig } from "./get-webpack-config";
import { clearConsole } from "./clear-console";
import { createWebpackCompiler } from "./create-webpack-compiler";
import { createWebpackDevServer } from "./create-webpack-dev-server";
import { Debug } from "./debugger";
import { getWebpackDevServerConfig } from "./get-wds-config";

const debug = Debug(__filename);

export function runWebpackDevServer(
  appPath: string,
  appName: string,
  appType: TowerflowType,
  ownPath: string,
  distPath: string,
  publicDirPath: string;
) {
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Gnerate webpack config file`);
  const webpackConfig = getWebpackConfig(
    appPath,
    appName,
    appType,
    ownPath,
    distPath
  );

  debug(`Get webpack-dev-server config file`);
  const webpackDevServerConfig = getWebpackDevServerConfig(appPath);

  debug(`Add wds entry scripts`);
  webpackDevServer.addDevServerEntrypoints(
    webpackConfig,
    webpackDevServerConfig
  );

  debug(`Create a webpack compiler that is configured with custom messages.`);
  const compiler = createWebpackCompiler(webpackConfig, appName);

  debug(`Create webpack dev server with configed webpack instance`);
  const devServer = createWebpackDevServer(compiler, webpackDevServerConfig);

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

  ["SIGINT", "SIGTERM"].forEach(function(sig) {
    process.on(sig as any, function() {
      devServer.close();
      debug(`Webpack-dev-server is going to be closed`);
      process.exit();
    });
  });
}

