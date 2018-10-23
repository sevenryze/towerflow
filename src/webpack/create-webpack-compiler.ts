import chalk from "chalk";
import webpack from "webpack";
import { clearConsole } from "../helper/clear-console";
import { Debug } from "../helper/debugger";

const debug = Debug(__filename);

let handleCompile: webpack.Compiler.Handler;

// You can safely remove this after ejecting.
// We only use this block for testing of Create React App itself:
const isSmokeTest = process.argv.some(arg => arg.indexOf("--smoke-test") > -1);
if (isSmokeTest) {
  handleCompile = (err: Error, stats: webpack.Stats) => {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}

export function createWebpackCompiler(options: {
  config: webpack.Configuration;
}) {
  const { config } = options;

  debug(`Start to create webpack instance`);
  const isInteractive = process.stdout.isTTY;

  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  let compiler!: webpack.Compiler;
  try {
    compiler = webpack(config, handleCompile) as webpack.Compiler;
  } catch (err) {
    console.log(
      chalk.red("Failed to create webpack instance, exit this process")
    );
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap("invalid", () => {
    if (isInteractive) {
      clearConsole();
    }
    console.log("Compiling...");
  });

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tap("done", (stats: webpack.Stats) => {
    if (isInteractive) {
      clearConsole();
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    // We only construct the warnings and errors for speed.
    // TODO: Find a way to better format messages.
    /*  const messages = formatWebpackMessages(
      stats.toJson({ all: false, warnings: true, errors: true })
    ); */
    const messages = stats.toJson({ all: false, warnings: true, errors: true });

    const isSuccessful = !messages.errors.length && !messages.warnings.length;
    if (isSuccessful) {
      console.log(chalk.green("Compiled successfully!"));
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red("Failed to compile.\n"));
      console.log(messages.errors.join("\n\n"));
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow("Compiled with warnings.\n"));
      console.log(messages.warnings.join("\n\n"));

      console.log(
        "\n\nTo ignore, try to add " +
          chalk.cyan("// tslint:disable-next-line") +
          " to the line before.\n"
      );
    }
  });

  return compiler;
}
