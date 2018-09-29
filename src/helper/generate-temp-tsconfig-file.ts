import fsExtra from "fs-extra";
import os from "os";
import { parsePath } from "./parse-path";

export function generateTempTsconfigFile(
  tsconfigJson: {
    include: string[];
    exclude: string[];
  },
  appPath: string,
  ownPath: string
) {
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
