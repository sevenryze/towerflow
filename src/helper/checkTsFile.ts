export function checkTsFile(filePath: string) {
  return /(^.?|\.[^d]|[^.]d|[^.][^d])\.tsx?$/.test(filePath);
}
