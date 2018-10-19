import { TowerflowType } from "../../bin";
import { Debug } from "../helper/debugger";
import { createWebpackCompiler } from "./create-webpack-compiler";
import { getWebpackConfigForNode } from "./get-webpack-config-for-node";

const debug = Debug(__filename);

export function startNode(options: {
  appPath: string;
  appName: string;
  appType: TowerflowType;
  ownPath: string;
  distPath: string;
  indexPath: string;
  binPath: string;
}) {
  const {
    binPath,
    appType,
    appName,
    appPath,
    distPath,
    indexPath,
    ownPath
  } = options;

  debug(`Check if in interactive environment`);
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Gnerate webpack config file`);
  const webpackConfig = getWebpackConfigForNode({
    appPath,
    appName,
    appType,
    ownPath,
    distPath,
    indexPath,
    binPath
  });

  debug(`Create a webpack compiler that is configured with custom messages.`);
  const compiler = createWebpackCompiler({
    config: webpackConfig,
    appName,
    appType
  });

  debug(`Start to build nodejs`);
  compiler.run((error, stats) => {});
}
