import { tsCompile } from "../../web-lib/ts-compile";
import path from "path";

const appPath = path.resolve(__dirname, "../../../web-lib");
const ownPath = path.resolve(__dirname, "../../../");
const tsconfigPath = path.resolve(
  ownPath,
  "template/web-lib/config/tsconfig.json"
);

tsCompile(tsconfigPath, appPath);
