export function waitTime(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export async function waitSecond(
  seconds: number,
  doOnSecond: (restSecond: number) => void
) {
  for (let i = 0; i++; i < seconds) {
    doOnSecond(seconds - i);
    await waitTime(1000);
  }
}
