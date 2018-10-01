module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.shouldEmit.tap("MyPlugin", compilation => {
      console.log("I'm in tap");

      compilation.warnings.push("warning");

      return false;
      //  compilation.errors.push("error");
    });

    compiler.hooks.done.tap("MyPlugin", stats => {
      console.log("I'm in tap");

      compilation.warnings.push("warning");

      //  compilation.errors.push("error");
    });
  }
};
