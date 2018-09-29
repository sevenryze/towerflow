import path from "path";
import { normalPath } from "./normal-path";

export function parsePath(...paths: string[]) {
  return normalPath(path.join(...paths));
}
