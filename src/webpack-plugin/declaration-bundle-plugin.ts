import webpack, { compilation } from "webpack";
import { Debug } from "../helper/debugger";
import fsExtra from "fs-extra";
import { parsePath } from "../helper/parse-path";
import path from "path";

const debug = Debug(__filename);

export class DeclarationBundlePlugin {
  constructor(
    private options: {
      outDir: string;
    }
  ) {
    if (!options.outDir) {
      throw new Error(`You should supply an outDir option!`);
    }
  }

  apply(compiler: webpack.Compiler) {
    //when the compiler is ready to emit files
    compiler.hooks.emit.tapAsync(
      "DeclarationBundlerPlugin",
      (compilation, callback) => {
        const { outDir } = this.options;

        //collect all generated declaration files
        //and remove them from the assets that will be emited
        let declarationFiles: { [index: string]: any } = {};
        for (let filename of Object.keys(compilation.assets)) {
          if (matchDelarationFiles(filename)) {
            declarationFiles[filename] = compilation.assets[filename];
            //  delete compilation.assets[filename];
          }
        }

        Object.keys(declarationFiles).forEach(filename => {
          debug(`Get declaration file: ${filename}`);
        });

        const outDirPath = parsePath(compiler.options.output!.path!, outDir);
        debug(`Emit declaration files to: ${outDirPath}`);

        //webpack may continue now
        callback();
      }
    );
  }

  /* 
  apply_test(compiler: webpack.Compiler) {
    //when the compiler is ready to emit files
    compiler.hooks.emit.tapAsync(
      "DeclarationBundlerPlugin",
      (compilation, callback) => {
        //collect all generated declaration files
        //and remove them from the assets that will be emited
        let declarationFiles: { [index: string]: string } = {};
        for (let filename in compilation.assets) {
          if (filename.indexOf(".d.ts") !== -1) {
            declarationFiles[filename] = compilation.assets[filename];
            delete compilation.assets[filename];
          }
        }

        //combine them into one declaration file
        let combinedDeclaration = this.generateCombinedDeclaration(
          declarationFiles
        );

        //and insert that back into the assets
        compilation.assets[this.out] = {
          source: function() {
            return combinedDeclaration;
          },
          size: function() {
            return combinedDeclaration.length;
          }
        };

        //webpack may continue now
        callback();
      }
    );
  }

  private generateCombinedDeclaration(
    declarationFiles: Record<string, string>
  ): string {
    let declarations = "";
    for (let fileName in declarationFiles) {
      let declarationFile = declarationFiles[fileName];
      let data = (declarationFile as any).source();

      let lines = data.split("\n");
      let i = lines.length;

      while (i--) {
        let line = lines[i];

        //exclude empty lines
        let excludeLine: boolean = line == "";

        //exclude export statements
        excludeLine = excludeLine || line.indexOf("export =") !== -1;

        //exclude import statements
        excludeLine = excludeLine || matchImportStatement(line);

        //if defined, check for excluded references
        if (
          !excludeLine &&
          this.excludedReferences &&
          line.indexOf("<reference") !== -1
        ) {
          excludeLine = this.excludedReferences.some(
            reference => line.indexOf(reference) !== -1
          );
        }

        if (excludeLine) {
          lines.splice(i, 1);
        } else {
          if (line.indexOf("declare ") !== -1) {
            lines[i] = line.replace("declare ", "");
          }
          //add tab
          lines[i] = "\t" + lines[i];
        }
      }
      declarations += lines.join("\n") + "\n\n";
    }

    let output =
      "declare module " + this.moduleName + "\n{\n" + declarations + "}";
    return output;
  } */
}

function matchImportStatement(contentLine: string) {
  return /import([ {}a-z0-9A-Z_-]+)from \"/.test(contentLine);
}

function matchDelarationFiles(filename: string) {
  return /\.d\.ts$|\.d\.ts\.map$/.test(filename);
}
