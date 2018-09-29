import path from "path";

export function parsePath(...paths: string[]) {
  return path.join(...paths).replace(/\\/g, "/");
}
