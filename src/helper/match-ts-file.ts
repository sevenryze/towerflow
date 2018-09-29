export function matchTsFile(filePath: string) {
  return /(^.?|\.[^d]|[^.]d|[^.][^d])\.tsx?$/.test(filePath);
}
