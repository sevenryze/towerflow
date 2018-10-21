import webpackDevServer from "webpack-dev-server";
import path from "path";

export function getWebpackDevServerConfig(options: {
  appPath: string;
  ownPath: string;
}): webpackDevServer.Configuration {
  const { appPath, ownPath } = options;

  return {
    compress: false,

    overlay: true,

    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    hotOnly: true,

    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: "none",

    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
    quiet: true,

    host: "0.0.0.0",
    port: 8080,

    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true
    }
  };
}
