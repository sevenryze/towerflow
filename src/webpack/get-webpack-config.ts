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
  appType: TowerflowType;
  buildType: BuildType;
  distPath: string;
  indexPath: string;
  ownPath: string;
  publicDirPath: string;
}): webpack.Configuration {
  const {
    appPath,
    appType,
    ownPath,
    publicDirPath,
    indexPath,
    distPath,
    buildType
  } = options;

  debug(
    `Get the appPath: ${appPath}, distPath: ${distPath}, ownPath: ${ownPath}`
  );

  const config: webpack.Configuration = {
    mode: buildType === BuildType.dev ? "development" : "production",

    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: true
        })
      ]
    },

    context: path.join(appPath),

    // For support browser debug usage
    node: {
      __filename: true,
      __dirname: true
    },

    entry: {
      main: `${indexPath}`
    },

    output: {
      // This path must be platform specific!
      path: path.join(distPath),
      filename: "js/bundle.js",
      chunkFilename: "js/[name].chunk.js",

      // FIXME: It's a very hacky way to deal with webpack sourcemaps.
      devtoolModuleFilenameTemplate: info => {
        let result = parsePath(info.absoluteResourcePath);
        result = `file:///${result}`;

        debug(`Modify the source field of soourcemap to: ${result}`);

        return result;
      }
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
      }),

      new HtmlWebpackPlugin({
        filename: "index.html",
        template: `${publicDirPath}/index.html`,
        favicon: `${publicDirPath}/favicon.ico`
      })
    ],

    // Opt out the sourcemap function for production
    // as the minified version sourcemap is not matched with origin source.
    devtool: buildType === BuildType.dev ? "source-map" : false,

    watchOptions: {
      ignored: ["**/*.js", "**/*.js.map", "**/*.d.ts.map", "node_modules"]
    }
  };

  if (buildType === BuildType.dev) {
    config.plugins!.push(
      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin()
    );
  }

  return config;
}
