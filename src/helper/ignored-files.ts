import path from "path";
import escape from "escape-string-regexp";

export function ignoredFiles(appSrcPath: string) {
  return new RegExp(
    `^(?!${escape(
      path.normalize(appSrcPath + "/").replace(/[\\]+/g, "/")
    )}).+/node_modules/`,
    "g"
  );
}
