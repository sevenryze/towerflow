const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MyPlugin = require("./plugin/index");

module.exports = {
  mode: "production",
  target: "node",

  externals: [nodeExternals()],

  node: {
    __dirname: false,
    __filename: true,
    process: false,
    require: false
  },

  entry: {
    /* "bin/index": path.join(__dirname, "bin/index.ts"),
    "src/start": path.join(__dirname, "src/start.ts") */
    "bin/test": path.join(__dirname, "bin/test.ts"),
    "bin/ha": path.join(__dirname, "bin/ha.ts")
  },

  output: {
    // This path must be platform specific!
    path: path.join(__dirname, "dist"),

    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: "[name].js",
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: "[name].chunk.js",

    // library: "MyLibrary",
    libraryTarget: "commonjs2",

    devtoolModuleFilenameTemplate: info => {
      return `webpack:///${info.resourcePath}?${info.loaders}`;
    }
  },

  resolve: {
    extensions: [".ts", ".tsx", "*"]
  },
  module: {
    noParse: function(content) {
      return /.ts$|.json$/.test(content);
    },

    rules: [
      {
        test: /\.tsx?$/,
        enforce: "pre",
        use: [
          {
            loader: "tslint-loader"
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              //configFile: path.join(__dirname, "tsconfig"),
              //context: appPath // 必须提供app项目的目录，参见ts-loader说明
            }
          }
        ]
      },
      {
        test: /\.txt?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "file/[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // "process.env.NODE_ENV": JSON.stringify("development")
    }),

    new CleanWebpackPlugin([path.join(__dirname, "dist")]),

    new MyPlugin()
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
