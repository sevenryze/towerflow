import escape from "escape-string-regexp";
import { parsePath } from "./parse-path";

export function ignoredFiles(appSrcPath: string) {
  return new RegExp(
    `^(?!${escape(parsePath(appSrcPath + "/"))}).+/node_modules/`,
    "g"
  );
}
