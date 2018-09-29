import fsExtra from "fs-extra";
import os from "os";
import { parsePath } from "./parse-path";

export function generateTempTsconfigFile(
  tsconfigPath: string,
  appPath: string,
  ownPath: string
) {
  const tsconfigJson = require(tsconfigPath);

  tsconfigJson.include = tsconfigJson.include.map((item: string) =>
    parsePath(`${appPath}/${item}`)
  );
  tsconfigJson.exclude = tsconfigJson.exclude.map((item: string) =>
    parsePath(`${appPath}/${item}`)
  );

  const tmpTsconfigPath = parsePath(ownPath, "tmp/tsconfig.json");

  fsExtra.ensureFileSync(tmpTsconfigPath);
  fsExtra.writeFileSync(
    tmpTsconfigPath,
    JSON.stringify(tsconfigJson, null, 2) + os.EOL
  );

  return tmpTsconfigPath;
}
