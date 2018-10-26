const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Happypack = require("happypack");

module.exports = {
  mode: "development",

  context: path.join(__dirname),

  node: {
    __filename: true,
    __dirname: true
  },

  entry: {
    index: [
      // WebpackDevServer host and port, the port should be the port your webpack-dev-server listen
      "webpack-dev-server/client?http://0.0.0.0:8080",
      "webpack/hot/only-dev-server", // "only" prevents reload on syntax errors,
      "./src/index.tsx"
    ]
  },

  output: {
    path: path.join(__dirname, "dist"),

    // necessary for HMR to know where to load the hot update chunks
    // publicPath: "/static/",

    filename: "js/[name].js",
    chunkFilename: "js/[name].chunk.js"
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
    new CleanWebpackPlugin([path.join(__dirname, "dist")]),

    new webpack.HotModuleReplacementPlugin(),

    //new webpack.WatchIgnorePlugin([/\.js$/, /\.js.map$/, /\.d\.ts$/, /\.d\.ts\.map$/]),

    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.join(__dirname, "public/index.html"),
      favicon: path.join(__dirname, `public/favicon.ico`)
    }),

    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.join(__dirname, "tsconfig.json"),
      checkSyntacticErrors: true,
      tslint: path.join(__dirname, "tslint.json"),
      async: false,
      watch: ["src", "typings", "lib", "human-test"]
    }),

    new Happypack({
      threads: 4,
      loaders: [
        {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            babelrc: false,
            presets: (false
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

  devtool: "nosources-source-map",

  watchOptions: {
    ignored: [
      "**/*.js",
      "**/*.js.map",
      "**/*.d.ts",
      "**/*.d.ts.map",
      "**/node_modules/**"
    ]

    // Aggregate all the watch to 2 minutes and trigger by maunal.
    // aggregateTimeout: 2 * 1000
  },

  devServer: {
    host: "localhost",

    port: 8080,
    compress: false,

    overlay: true,

    historyApiFallback: true,
    // respond to 404s with index.html

    hotOnly: true
    // enable HMR on the server
  }
};
