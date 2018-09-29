import path from "path";
import { runWebpackDevServer } from "../../helper/run-wds";
import { TowerflowType } from "../../../bin";

const appPath = path.resolve(__dirname, "../../../template/web-app");

async function main() {
  runWebpackDevServer(
    appPath,
    "appName",
    TowerflowType.webLib,
    "ownPath",
    path.resolve(appPath, "dist")
  );
}

main();
