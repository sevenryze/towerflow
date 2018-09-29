import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import { TowerflowType } from "../../bin";
import { Debug } from "./debugger";
import { parsePath } from "./parse-path";

const debug = Debug(__filename);

export function getWebpackConfig(options: {
  appPath: string;
  appName: string;
  appType: TowerflowType;
  ownPath: string;
  distPath: string;
  appEntryPath: string;
  publicDirPath: string;
}): webpack.Configuration {
  return {
    mode: "development",

    entry: {
      main: `${options.appEntryPath}`
    },

    output: {
      path: options.distPath,

      pathinfo: true,
      // This does not produce a real file. It's just the virtual path that is
      // served by WebpackDevServer in development. This is the JS bundle
      // containing code from all our entry points, and the Webpack runtime.
      filename: "js/bundle.js",
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: "js/[name].chunk.js",

      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info =>
        parsePath(info.absoluteResourcePath)
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
                configFile: parsePath(
                  options.ownPath,
                  `template/${options.appType}/config/tslint.json`
                )
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
                configFile: parsePath(
                  options.ownPath,
                  `template/${options.appType}/config/tsconfig.json`
                ),
                context: options.appPath, // 必须提供app项目的目录，参见ts-loader说明
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
                    "Towerflow pack " +
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
        template: `${options.publicDirPath}/index.html`,
        favicon: `${options.publicDirPath}/favicon.ico`
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

    devtool: "cheap-eval-source-map",

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
