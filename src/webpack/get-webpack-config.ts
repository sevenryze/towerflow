import CleanWebpackPlugin from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
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
  const isWebCase = matchWebCase(appType, type);

  debug(
    `Get the appPath: ${appPath}, distPath: ${distPath}, isWebCase: ${isWebCase}`
  );

  const config: webpack.Configuration = {
    mode: type === BuildType.dev ? "development" : "production",

    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: true
        })
      ]
    },

    context: path.join(appPath),

    output: {
      // This path must be platform specific!
      path: path.join(distPath)
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
                // Fix the no matched files ts error.
                context: appPath,
                onlyCompileBundledFiles: true
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
          // TODO: How to process css files?
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
      new CleanWebpackPlugin([path.join(appPath, "dist")], {
        root: path.join(appPath)
      })
    ],

    // Opt out the sourcemap function for production
    // as the minified version sourcemap is not matched with origin source.
    devtool: type === BuildType.dev ? "source-map" : false,

    watchOptions: {
      ignored: ["**/*.js", "**/*.js.map", "**/*.d.ts.map", "node_modules"]
    }
  };

  if (isWebCase) {
    config.entry = {
      main: `${indexPath}`
    };

    config.output!.filename = "js/bundle.js";
    config.output!.chunkFilename = "js/[name].chunk.js";
    // TODO: It's a very hacky way to deal with webpack sourcemaps.
    config.output!.devtoolModuleFilenameTemplate = info => {
      let result = parsePath(info.absoluteResourcePath);
      result = `file:///${result}`;

      debug(`Get sourcemap source path: ${result}`);

      return result;
    };

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

    config.output!.devtoolModuleFilenameTemplate = info => {
      if (/(^webpack|^external)/.test(info.absoluteResourcePath)) {
        debug(`Return origin path: ${info.absoluteResourcePath}`);
        return info.absoluteResourcePath;
      }

      const result = parsePath(
        path.relative(distPath, info.absoluteResourcePath)
      );
      debug(`Get sourcemap source path: ${result}`);

      return result;
    };

    // Web-lib no need for this.
    if (appType === TowerflowType.nodeLib) {
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
  }

  return config;
}

function matchWebCase(appType: TowerflowType, buildType: BuildType) {
  return (
    appType === TowerflowType.webApp ||
    (appType === TowerflowType.webLib && buildType === BuildType.dev)
  );
}
