import CleanWebpackPlugin from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";
import { BuildType, TowerflowType } from "../interface";

const debug = Debug(__filename);

export function getWebpackConfig(options: {
  appPath: string;
  appName: string;
  appType: TowerflowType;
  ownPath: string;
  distPath: string;
  indexPath: string;
  binPath?: string;
  publicDirPath?: string;
  type: BuildType;
}): webpack.Configuration {
  const {
    appPath,
    appType,
    ownPath,
    publicDirPath,
    indexPath,
    distPath,
    type,
    binPath
  } = options;

  debug(
    `Get the appPath: ${appPath}, distPath: ${distPath}, isWebCase: ${matchWebCase(
      appType,
      type
    )}`
  );

  const config: webpack.Configuration = {
    mode: type === BuildType.dev ? "development" : "production",

    context: path.join(appPath),
    externals: matchWebCase(appType, type) ? undefined : [nodeExternals()],
    target: matchWebCase(appType, type) ? "web" : "node",
    node: false,

    output: {
      // This path must be platform specific!
      path: path.join(distPath),

      pathinfo: type === BuildType.dev,

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
                  ownPath,
                  `template/${appType}/config/tslint.json`
                )
              }
            }
          ]
        },

        {
          test: /\.tsx?$/,
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
      // TODO: Clarify how to use this plugin and watchOptions.
      new webpack.WatchIgnorePlugin([
        /\.js$/,
        /\.js.map$/,
        /\.d\.ts$/,
        /\.d\.ts\.map$/
      ]),

      new CleanWebpackPlugin(
        [path.join(appPath, "dist"), path.join(appPath, "dist-declarations")],
        {
          root: path.join(appPath)
        }
      )
    ],

    /*   devtool: matchWebCase(appType, type)
      ? "cheap-eval-source-map"
      : "source-map", */

    // Opt out the sourcemap function for production
    // as the minified version sourcemap is not matched with origin source.
    devtool: type === BuildType.dev ? "source-map" : false,

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

  if (matchWebCase(appType, type)) {
    config.entry = {
      main: `${indexPath}`
    };

    config.output!.filename = "js/bundle.js";
    config.output!.chunkFilename = "js/[name].chunk.js";

    // tsx loaders
    config.module!.rules[1].use = [
      {
        loader: "babel-loader",
        options: {
          babelrc: false,
          plugins: ["react-hot-loader/babel"]
        }
      }
    ].concat(config.module!.rules[1].use as any);

    config.plugins!.push(
      ...[
        new HtmlWebpackPlugin({
          filename: "index.html",
          template: `${publicDirPath}/index.html`,
          favicon: `${publicDirPath}/favicon.ico`
        }),

        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin()
      ]
    );
  } else {
    config.entry =
      appType === TowerflowType.nodeApp
        ? {
            bin: path.join(binPath!),
            index: path.join(indexPath)
          }
        : {
            index: path.join(indexPath)
          };

    config.output!.filename = "[name].js";
    config.output!.libraryTarget = "commonjs2";

    config.plugins!.push(
      ...[
        new webpack.BannerPlugin({
          banner: "#!/usr/bin/env node",
          raw: true,
          entryOnly: true
        })
      ]
    );
  }

  return config;
}

function matchWebCase(appType: TowerflowType, buildType: BuildType) {
  return (
    appType === TowerflowType.webApp ||
    (appType === TowerflowType.webLib && buildType === BuildType.dev)
  );
}

interface TSLoaderError {
  code: number;
  severity: string;
  content: string;
  file: string;
  line: number;
  character: number;
  context: string;
  [index: string]: any;
}
