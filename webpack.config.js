const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const TowerflowPlugin = require("./src/webpack-plugin/towerflow").default;
const DeclarationBundlePlugin = require("./src/webpack-plugin/declaration-bundle-plugin")
  .DeclarationBundlePlugin;

module.exports = {
  mode: "development",

  entry: {
    /* "bin/index": path.join(__dirname, "bin/index.ts"),
    "src/start": path.join(__dirname, "src/start.ts") */
    "bin-test/test": path.join(__dirname, "bin-test/test.ts"),
    "bin-test/test-2": path.join(__dirname, "bin-test/test-2.ts")
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
    noParse: function(filePath) {
      return /.tsx?$/.test(filePath);
    },

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

    new TowerflowPlugin({
      stage: "dev"
    }),

    new DeclarationBundlePlugin({
      moduleName: "myModule",
      outDir: "outdir"
    })
  ],

  devtool: "nosources-source-map",

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
