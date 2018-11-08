import CleanWebpackPlugin from "clean-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HappyPack from "happypack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { Debug } from "../helper/debugger";
import { parsePath } from "../helper/parse-path";
import { BuildType, TowerflowType } from "../interface";
import { generateTempTsconfig } from "../tsc/generate-temp-tsconfig";

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

  debug(`Generate temp tsconfig.json for workaround`);
  const tsconfigPath = parsePath(
    ownPath,
    `template/${appType}/config/tsconfig.json`
  );
  const tmpTsconfigPath = generateTempTsconfig(tsconfigPath, appPath, ownPath);
  debug(
    `tsconfig path: ${tsconfigPath}, temp tsconfig path: ${tmpTsconfigPath}`
  );

  const config: webpack.Configuration = {
    mode: buildType === BuildType.dev ? "development" : "production",

    optimization:
      buildType === BuildType.production
        ? {
            minimizer: [
              new TerserPlugin({
                extractComments: true
              })
            ]
          }
        : undefined,

    context: path.join(appPath),

    // For support browser debug usage
    node: {
      __filename: true,
      __dirname: true
    },

    entry: [`${indexPath}`],

    output: {
      // This path must be platform specific!
      path: path.join(distPath),

      // necessary for HMR to know where to load the hot update chunks
      // publicPath: "/static/",

      filename: "js/[name].js",

      chunkFilename: "js/[name].chunk.js"

      // FIXME: It's a very hacky way to deal with webpack sourcemaps.
      /*  
        devtoolModuleFilenameTemplate: info => {
        let result = parsePath(info.absoluteResourcePath);
        result = `file:///${result}`;

        debug(`Modify the source field of soourcemap to: ${result}`);

        return result;
      } */
    },

    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", "*"]
    },

    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          exclude: /node_modules/,
          use: "happypack/loader"
        },

        {
          test: /\.(jpg|png|gif|svg|gltf)$/,
          exclude: /node_modules/,
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
      }),

      new ForkTsCheckerWebpackPlugin({
        // For use overlay on webpack-dev-server
        async: false,
        tslint: parsePath(ownPath, `template/${appType}/config/tslint.json`),
        tsconfig: path.normalize(tmpTsconfigPath),
        checkSyntacticErrors: true,
        watch: ["src", "typings", "lib", "human-test"]
      }),

      new HappyPack({
        threads: 4,
        loaders: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              babelrc: false,
              presets: (buildType === BuildType.dev
                ? []
                : [
                    [
                      "@babel/preset-env",
                      // or whatever your project requires
                      // See https://github.com/browserslist/browserslist#full-list
                      {
                        targets: "last 2 versions",
                        useBuiltIns: "usage"
                      }
                    ]
                  ]
              ).concat(["@babel/preset-react", "@babel/preset-typescript"]),
              plugins: [
                "@babel/plugin-syntax-dynamic-import",
                // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
                // ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                "react-hot-loader/babel"
              ]
            }
          }
        ]
      })
    ],

    // Opt out the sourcemap function for production
    // as the minified version sourcemap is not matched with origin source.
    devtool: buildType === BuildType.dev ? "source-map" : false,

    watchOptions: {
      ignored: [
        "**/*.js",
        "**/*.js.map",
        "**/*.d.ts",
        "**/*.d.ts.map",
        "**/node_modules/**"
      ]
    }
  };

  if (buildType === BuildType.dev) {
    (config.entry as string[]).unshift(
      // WebpackDevServer host and port, the port should be the port your webpack-dev-server listen
      "webpack-dev-server/client?http://0.0.0.0:8080",

      // "only" prevents reload on syntax errors
      "webpack/hot/only-dev-server"
    );

    config.plugins!.push(new webpack.HotModuleReplacementPlugin());
  }

  return config;
}
