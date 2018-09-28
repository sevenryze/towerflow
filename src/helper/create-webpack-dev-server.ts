import WebpackDevServer from "webpack-dev-server";
import webpack from "webpack";

export function createWebpackDevServer(
  compiler: webpack.Compiler,
  serverConfig: WebpackDevServer.Configuration
) {
  // WebpackDevServer.addDevServerEntrypoints()

  const devServer = new WebpackDevServer(compiler, serverConfig);

  return devServer;
}
