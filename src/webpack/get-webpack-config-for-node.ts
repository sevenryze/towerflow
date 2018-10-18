import path from "path";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import CleanWebpackPlugin from "clean-webpack-plugin";
import { TowerflowType } from "../../bin";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";

const debug = Debug(__filename);

export function getWebpackConfigForNode(options: {
  appPath: string;
  appName: string;
  appType: TowerflowType;
  ownPath: string;
  distPath: string;
  indexPath: string;
  binPath: string;
}): webpack.Configuration {
  const { appType, ownPath, appPath, indexPath, binPath, distPath } = options;

  debug(`Get the appPath: ${appPath}, distPath: ${distPath}`);

  return {
    mode: "development",

    externals: [nodeExternals()],
    target: "node",
    node: false,

    entry:
      appType === TowerflowType.nodeApp
        ? {
            bin: binPath,
            index: indexPath
          }
        : {
            index: indexPath
          },

    output: {
      // This path must be platform specific!
      path: path.join(distPath),

      pathinfo: true,

      filename: "[name].js",

      libraryTarget: "commonjs2",

      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info =>
        parsePath(info.absoluteResourcePath)
    },

    resolve: {
      extensions: [".ts", "*"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          enforce: "pre",
          use: [
            {
              loader: "tslint-loader",
              options: {
                configFile: parsePath(
                  ownPath,
                  `template/${appType}/config/tslint.json`
                )
              }
            }
          ]
        },
        {
          test: /\.ts$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: parsePath(
                  ownPath,
                  `template/${appType}/config/tsconfig.json`
                ),
                context: appPath, // 必须提供app项目的目录，参见ts-loader说明
                errorFormatter: (error: TSLoaderError, colors: any) => {
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
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("development")
      }),

      new CleanWebpackPlugin([
        path.join(appPath, "dist"),
        path.join(appPath, "dist-declarations")
      ]),

      new webpack.WatchIgnorePlugin([
        /\.js$/,
        /\.js.map$/,
        /\.d\.ts$/,
        /\.d\.ts\.map$/
      ]),

      new webpack.BannerPlugin({
        banner: "#!/usr/bin/env node",
        raw: true,
        entryOnly: true
      })
    ],

    devtool: "source-map",

    watchOptions: {
      ignored: [
        "**/*.js",
        "**/*.js.map",
        "**/*.d.ts",
        "**/*.d.ts.map",
        "node_modules"
      ]
    }
  };
}

type TSLoaderError = {
  code: number;
  severity: string;
  content: string;
  file: string;
  line: number;
  character: number;
  context: string;
  [index: string]: any;
};
