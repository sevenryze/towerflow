import ts from "typescript";
import { Debug } from "../helper/debugger";

const debug = Debug(__filename);

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
};

export function tsWatch(configPath: string) {
  const tsconfig = ts.findConfigFile(
    configPath,
    ts.sys.fileExists,
    "tsconfig.json"
  );
  if (!tsconfig) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  // TypeScript can use several different program creation "strategies":
  //  * ts.createEmitAndSemanticDiagnosticsBuilderProgram,
  //  * ts.createSemanticDiagnosticsBuilderProgram
  //  * ts.createAbstractBuilder
  // The first two produce "builder programs". These use an incremental strategy
  // to only re-check and emit files whose contents may have changed, or whose
  // dependencies may have changes which may impact change the result of prior
  // type-check and emit.
  // The last uses an ordinary program which does a full type check after every
  // change.
  // Between `createEmitAndSemanticDiagnosticsBuilderProgram` and
  // `createSemanticDiagnosticsBuilderProgram`, the only difference is emit.
  // For pure type-checking scenarios, or when another tool/process handles emit,
  // using `createSemanticDiagnosticsBuilderProgram` may be more desirable.
  //const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  // Note that there is another overload for `createWatchCompilerHost` that takes
  // a set of root files.
  const host = ts.createWatchCompilerHost(
    tsconfig,
    {},
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged
  );

  // You can technically override any given hook on the host, though you probably
  // don't need to.
  // Note that we're assuming `origCreateProgram` and `origPostProgramCreate`
  // doesn't use `this` at all.
  /*   const origCreateProgram = host.createProgram;
  host.createProgram = (rootNames, options, host, oldProgram) => {
    debug(`rootNames: ${rootNames}`);

    return origCreateProgram(rootNames, options, host, oldProgram);
  };

  const origPostProgramCreate = host.afterProgramCreate;
  host.afterProgramCreate = program => {
    //console.log("** We finished making the program! **");
    origPostProgramCreate!(program);
  };

  const origOnWatchStatusChange = host.onWatchStatusChange;
  host.onWatchStatusChange = (diagnostic, newLine, options) => {
    debug(``);

    origOnWatchStatusChange!(diagnostic, newLine, options);
  };

  const origWatchFile = host.watchFile;
  host.watchFile = (path, callback, pollingInterval) => {
    return origWatchFile(
      path,
      (fileName: string, eventKind: ts.FileWatcherEventKind) => {
        debug(`filename: ${fileName}, eventKind: ${eventKind}`);
        callback(fileName, eventKind);
      },
      pollingInterval
    );
  }; */

  // `createWatchProgram` creates an initial program, watches files, and updates
  // the program over time.
  ts.createWatchProgram(host);
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  console.log(
    "Error",
    diagnostic.code,
    ":",
    ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      formatHost.getNewLine()
    )
  );
}

/**
 * Prints a diagnostic every time the watch status changes.
 * This is mainly for messages like "Starting compilation" or "Compilation completed".
 */
function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  let message = ts.formatDiagnostic(diagnostic, formatHost);
  console.log(`Towerflow ${message}`);
}
