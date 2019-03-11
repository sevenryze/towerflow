import webpackDevServer from "webpack-dev-server";
import { Debug } from "../helper/debugger";

const debug = Debug(__filename);

export function getWebpackDevServerConfig(options: {
  appPath: string;
  ownPath: string;
  port: number;
}): webpackDevServer.Configuration {
  const { appPath, ownPath, port } = options;

  debug(`Get appPath: ${appPath}, ownPath: ${ownPath}`);

  return {
    compress: false,

    overlay: true,

    hotOnly: true,

    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: "none",

    watchContentBase: false,

    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
    quiet: true,

    host: "0.0.0.0",
    port,

    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true
    }
  };
}
