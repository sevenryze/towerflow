import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";

export function createWebpackDevServer(
  compiler: webpack.Compiler,
  serverConfig: WebpackDevServer.Configuration
) {
  // WebpackDevServer.addDevServerEntrypoints()

  const devServer = new WebpackDevServer(compiler, serverConfig);

  return devServer;
}
