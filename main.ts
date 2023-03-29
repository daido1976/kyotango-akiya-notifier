import { fetchAkiyaCount } from "./akiya-fetcher.ts";

async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の件数取得
  const akiyaCount = await fetchAkiyaCount();
  if (!akiyaCount) {
    console.error("空き家の件数が取得できなかったので処理を終了します。");
    return;
  }
  console.log({ akiyaCount });

  // 2. 件数をgistに保存 & 前回の件数と比較して増えてるか判定
  // 3. 増えてたらLINEボット or LINE Notify APIで通知
}

if (import.meta.main) {
  await main();
}
