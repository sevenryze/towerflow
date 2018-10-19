import chalk from "chalk";
import webpackDevServer from "webpack-dev-server";
import { TowerflowType } from "../../bin";
import { clearConsole } from "../helper/clear-console";
import { Debug } from "../helper/debugger";
import { createWebpackCompiler } from "./create-webpack-compiler";
import { createWebpackDevServer } from "./create-webpack-dev-server";
import { getWebpackDevServerConfig } from "./get-webpack-dev-server-config";
import { getWebpackConfig } from "./get-webpack-config-for-web";

const debug = Debug(__filename);

export function startWeb(
  appPath: string,
  appName: string,
  appType: TowerflowType,
  ownPath: string,
  distPath: string,
  publicDirPath: string,
  appEntryPath: string
) {
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Gnerate webpack config file`);
  const webpackConfig = getWebpackConfig({
    appName,
    appPath,
    appType,
    distPath,
    ownPath,
    appEntryPath,
    publicDirPath
  });

  debug(`Get webpack-dev-server config file`);
  const webpackDevServerConfig = getWebpackDevServerConfig(appPath);

  debug(`Add wds hot module reload entry scripts`);
  webpackDevServer.addDevServerEntrypoints(
    webpackConfig,
    webpackDevServerConfig
  );

  debug(`Create a webpack compiler that is configured with custom messages.`);
  const compiler = createWebpackCompiler({
    config: webpackConfig,
    appName,
    appType
  });

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

  ["SIGINT", "SIGTERM"].forEach(sig => {
    process.on(sig as any, () => {
      devServer.close();
      debug(`Webpack-dev-server is going to be closed`);
      process.exit();
    });
  });
}
