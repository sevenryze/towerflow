import path from "path";
import { runTsDev } from "../../node-app/run-ts-dev";

const appPath = path.resolve(__dirname, "../../../node-app");

async function main() {
  runTsDev(appPath, "", path.resolve(__dirname, "../../../"), "");
}

main();
