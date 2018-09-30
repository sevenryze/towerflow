import webpackDevServer from "webpack-dev-server";

const host = process.env.HOST || "0.0.0.0";

export function getWebpackDevServerConfig(
  appPath: string
): webpackDevServer.Configuration {
  return {
    compress: false,

    // By default files from `contentBase` will not trigger a page reload.
    // watchContentBase: true,

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
    // clientLogLevel: "none",

    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
    quiet: true,

    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebook/create-react-app/issues/293
    // src/node_modules is not ignored to support absolute imports
    // https://github.com/facebook/create-react-app/issues/1065
    /*  watchOptions: {
      ignored: ignoredFiles(`${appPath}/src`)
    }, */

    host: host,
    port: 8080,

    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true
    }
  };
}
