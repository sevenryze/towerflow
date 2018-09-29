export function matchCompilerGeneratedFile(filePath: string) {
  return /\.d\.ts$|\.js$|\.map$/.test(filePath);
}
