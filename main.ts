import { fetchAkiyaCount } from "./akiya-fetcher.ts";
import { notifyToBot } from "./notifier.ts";

async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の件数取得
  const akiyaCount = await fetchAkiyaCount();
  if (!akiyaCount) {
    console.error("Failed to retrieve akiya count. Exiting the process.");
    exit(1);
  }

  // 2. 件数をgistに保存 & 前回の件数と比較して増えてるか判定
  // TODO: 実装する

  // 3. 増えてたらLINEボットで通知
  const ok = await notifyToBot(akiyaCount);
  if (!ok) {
    console.error("LINE bot notification failed.");
    exit(1);
  }

  console.log("LINE bot notification succeeded.");
}

function exit(code = 0): never {
  Deno.exit(code);
}

if (import.meta.main) {
  await main();
}
