export function checkCompilerGeneratedFile(filePath: string) {
  return /\.d\.ts$|\.js$|\.map$/.test(filePath);
}
