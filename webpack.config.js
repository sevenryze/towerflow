const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "development",

  externals: [nodeExternals()],
  target: "node",
  node: false,

  entry: {
    bin: path.join(__dirname, "bin/index.ts"),
    index: path.join(__dirname, "src/index.ts")
  },

  output: {
    // This path must be platform specific!
    path: path.join(__dirname, "dist"),

    filename: "[name].js",

    // library: "MyLibrary",
    libraryTarget: "commonjs2",

    devtoolModuleFilenameTemplate: info => {
      return `webpack:///${info.resourcePath}?${info.loaders}`;
    }
  },

  resolve: {
    extensions: [".ts", ".tsx", ".json", "*"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: "pre",
        loader: "tslint-loader",
        options: {
          configFile: path.join(
            __dirname,
            "template/node-app/config/tslint.json"
          )
        }
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          configFile: path.join(
            __dirname,
            "template/node-app/config/tsconfig.json"
          ),
          context: path.join(__dirname), // 必须提供app项目的目录，参见ts-loader说明,
          onlyCompileBundledFiles: true
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin([
      path.join(__dirname, "dist"),
      path.join(__dirname, "dist-declarations")
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
