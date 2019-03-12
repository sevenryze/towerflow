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
  const { appPath, appType, ownPath, publicDirPath, indexPath, distPath, buildType } = options;

  debug(`Get the appPath: ${appPath}, distPath: ${distPath}, ownPath: ${ownPath}`);

  const config: webpack.Configuration = {
    mode: buildType === BuildType.dev ? "development" : "production",

    optimization:
      buildType === BuildType.production
        ? {
            minimizer: [
              new TerserPlugin({
                extractComments: true,
              }),
            ],
          }
        : undefined,

    context: path.join(appPath),

    // For support browser debug usage
    node: { __filename: true, __dirname: true },

    entry: (buildType === BuildType.dev
      ? [
          // WebpackDevServer host and port, the port should be the port your webpack-dev-server listen
          "webpack-dev-server/client?http://0.0.0.0:8080",

          // "only" prevents reload on syntax errors
          "webpack/hot/only-dev-server",
        ]
      : []
    ).concat([`${indexPath}`]),

    output: {
      // This path must be platform specific!
      path: path.join(distPath),

      // necessary for HMR to know where to load the hot update chunks
      // publicPath: "/static/",

      filename: "js/[name].js",
      chunkFilename: "js/[name].chunk.js",
    },

    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", "*"],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: parsePath(ownPath, `template/${appType}/config/tsconfig.json`),
                context: appPath,
              },
            },
            {
              loader: "tslint-loader",
              options: {
                configFile: parsePath(ownPath, `template/${appType}/config/tslint.json`),
              },
            },
          ],
        },

        {
          test: /\.(jpg|png|gif|svg|gltf)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "url-loader",
              options: { name: "media/[name]-[hash:5].[ext]", limit: 4096 },
            },
          ],
        },

        {
          // TODO: How to process css files?
          test: /\.css$/,
          use: [
            {
              loader: "style-loader/url",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "file-loader",
              options: {
                name: "vendor/[name].[ext]",
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new CleanWebpackPlugin(),

      new HtmlWebpackPlugin({
        filename: "index.html",
        template: `${publicDirPath}/index.html`,
        favicon: `${publicDirPath}/favicon.ico`,
      }),
    ].concat(buildType === BuildType.dev ? [new webpack.HotModuleReplacementPlugin()] : []),

    // Opt out the sourcemap function for production
    // as the minified version sourcemap is not matched with origin source.
    devtool: buildType === BuildType.dev ? "source-map" : false,

    watchOptions: {
      ignored: ["**/*.js", "**/*.js.map", "**/*.d.ts", "**/*.d.ts.map", "**/node_modules/**"],
    },
  };

  return config;
}
