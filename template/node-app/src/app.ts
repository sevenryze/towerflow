import path from "path";

export function hello() {
  console.log(`开始新的旅程`);

  const a = path.resolve(__dirname, "app");

  console.log(a);
}

async function app() {
  for await (const data of []) {
  }
}
