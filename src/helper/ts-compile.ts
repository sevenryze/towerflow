import ts from "typescript";

export function tsCompile(tsconfigPath: string, appPath: string) {
  const parsedConfigJson = ts.parseJsonConfigFileContent(
    require(tsconfigPath),
    ts.sys,
    appPath
  );

  let program = ts.createProgram(
    parsedConfigJson.fileNames,
    parsedConfigJson.options
  );

  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
      );
    }
  });
}
