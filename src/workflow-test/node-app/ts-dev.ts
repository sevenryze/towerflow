import path from "path";
import { runTsDev } from "../../helper/run-ts-dev";

const appPath = path.resolve(__dirname, "../../../node-app");

process.on("SIGINT", signal => {
  console.log(`Towerflow get SIGINT, bye!`);
  process.exit(1);
});

async function main() {
  runTsDev(appPath, "", path.resolve(__dirname, "../../../"), "");
}

main();
