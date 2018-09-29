export function normalPath(path: string) {
  // Convert windows `\` like path delimiter to normal `/` one.
  return path.replace(/\\/g, "/");
}
