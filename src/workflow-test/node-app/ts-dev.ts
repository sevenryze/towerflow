import path from "path";
import { runTsDev } from "../../node-app/run-ts-dev";

const appPath = path.resolve(__dirname, "../../../template/node-app");

async function main() {
  runTsDev(appPath, "", "", "");
}

main();
