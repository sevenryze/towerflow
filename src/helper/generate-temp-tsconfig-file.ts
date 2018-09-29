import fsExtra from "fs-extra";
import os from "os";
import path from "path";
import { normalPath } from "./normal-path";

export function generateTempTsconfigFile(
  tsconfigJson: {
    include: string[];
    exclude: string[];
  },
  appPath: string,
  ownPath: string
) {
  tsconfigJson.include = tsconfigJson.include.map((item: string) =>
    normalPath(`${appPath}/${item}`)
  );
  tsconfigJson.exclude = tsconfigJson.exclude.map((item: string) =>
    normalPath(`${appPath}/${item}`)
  );

  const tmpTsconfigPath = normalPath(path.join(ownPath, "tmp/tsconfig.json"));

  fsExtra.ensureFileSync(tmpTsconfigPath);
  fsExtra.writeFileSync(
    tmpTsconfigPath,
    JSON.stringify(tsconfigJson, null, 2) + os.EOL
  );

  return tmpTsconfigPath;
}
