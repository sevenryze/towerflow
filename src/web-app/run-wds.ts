import chalk from "chalk";
import Debug from "debug";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from "webpack";
import webpackDevServer from "webpack-dev-server";
import { clearConsole } from "../helper/clear-console";
import { createWebpackCompiler } from "../helper/create-webpack-compiler";
import { createWebpackDevServer } from "../helper/create-webpack-dev-server";

const debug = Debug("towerflow:prepare-webpack");

export function runWebpackDevServer(
  appPath: string,
  appName: string,
  ownPath: string,
  distPath: string
) {
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Gnerate webpack config file`);
  const webpackConfig = getWebpackConfig(appPath, appName, ownPath, distPath);

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

function getWebpackConfig(
  appPath: string,
  appName: string,
  ownPath: string,
  distPath: string
): webpack.Configuration {
  return {
    mode: "development",

    entry: {
      main: `${appPath}/src/index.tsx`
    },

    output: {
      path: distPath,

      pathinfo: true,
      // This does not produce a real file. It's just the virtual path that is
      // served by WebpackDevServer in development. This is the JS bundle
      // containing code from all our entry points, and the Webpack runtime.
      filename: "js/bundle.js",
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: "js/[name].chunk.js",

      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info =>
        path.resolve(info.absoluteResourcePath).replace(/\\/g, "/")
    },

    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", "*"]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          enforce: "pre",
          use: [
            {
              loader: "tslint-loader",
              options: {
                configFile: path.resolve(__dirname, "config/tslint.json")
              }
            }
          ]
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                babelrc: false,
                plugins: ["react-hot-loader/babel"]
              }
            },
            {
              loader: "ts-loader",
              options: {
                configFile: path.resolve(__dirname, "config/tsconfig.json"),
                context: appPath, // 必须提供app项目的目录，参见ts-loader说明
                errorFormatter: (
                  error: {
                    code: number;
                    severity: string;
                    content: string;
                    file: string;
                    line: number;
                    character: number;
                    context: string;
                    [index: string]: any;
                  },
                  colors: any
                ) => {
                  const messageColor =
                    error.severity === "warning"
                      ? colors.bold.yellow
                      : colors.bold.red;
                  return (
                    "Does not compute.... " +
                    messageColor(
                      Object.keys(error).map(key => `${key}: ${error[key]}`)
                    )
                  );
                }
              }
            }
          ]
        },
        {
          test: /\.(jpg|png|gif|svg|gltf)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                name: "media/[name]-[hash:5].[ext]",
                limit: 4096
              }
            }
          ]
        },
        {
          // 在运行时，将vendor css添加道link tag中
          test: /\.css$/,
          use: [
            {
              loader: "style-loader/url",
              options: {
                sourceMap: true
              }
            },
            {
              loader: "file-loader",
              options: {
                name: "vendor/[name].[ext]"
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: `${appPath}/public/index.html`,
        favicon: `${appPath}/public/favicon.ico`
      }),

      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("development")
      }),

      new webpack.WatchIgnorePlugin([
        /\.js$/,
        /\.js.map$/,
        /\.d\.ts$/,
        /\.d\.ts\.map$/
      ]),

      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin()
    ],

    devtool: "inline-source-map",

    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: {
      // hints: false
    },

    watchOptions: {
      ignored: [
        //   "**/*.js",
        "**/*.js.map",
        "**/*.d.ts",
        "**/*.d.ts.map",
        "node_modules"
      ]
    }
  };
}

const host = process.env.HOST || "0.0.0.0";

function getWebpackDevServerConfig(
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
    quiet: false,

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
