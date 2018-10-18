import webpack from "webpack";
import { Debug } from "../helper/debugger";

const debug = Debug(__filename);

export default class TowerflowPlugin {
  constructor(private options: { stage: "dev" | "prod" }) {
    debug(`Get options: ${JSON.stringify(options)}`);
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.shouldEmit.tap("TowerflowPlugin", compilation => {
      compilation.warnings.push("warning");

      // compilation.errors.push("error");
      // We will only emit unmodified source for dev stage.
      return this.options.stage === "dev";
    });

    // To provide our own error and warning messages.
    compiler.hooks.done.tap("TowerflowPlugin", stats => {
      // stats.compilation;

      // console.log(`source: ${stats.compilation.modules}`);

      if (stats.hasErrors || stats.hasWarnings) {
       // console.log(stats.compilation.errors);
       // console.log(stats.compilation.warnings);
      } else {
        console.log("Success build!");
      }

      //  compilation.errors.push("error");
    });
  }
}
