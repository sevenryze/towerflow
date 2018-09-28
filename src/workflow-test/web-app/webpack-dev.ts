import path from "path";
import { runWebpackDevServer } from "../../web-app/run-wds";

const appPath = path.resolve(__dirname, "../../../template/web-app");

async function main() {
  runWebpackDevServer(
    appPath,
    "appName",
    "ownPath",
    path.resolve(appPath, "dist")
  );
}

main();
