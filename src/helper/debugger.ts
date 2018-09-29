import debug from "debug";
import path from "path";

export function Debug(filename: string) {
  return debug(`towerflow:${path.basename(filename, ".js")} ---> `);
}
