import { AkiyaFetcher } from "./akiya-fetcher.ts";
import { DB } from "./db.ts";
import { Notifier } from "./notifier.ts";
import { compareCount } from "./utils.ts";

async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の件数取得
  const akiyaCount = await AkiyaFetcher.fetchCountBy("chintai");
  if (!akiyaCount) {
    console.error("Failed to retrieve akiya count. Exiting the process.");
    exit(1);
  }
  console.log(`The current count of akiya is ${akiyaCount}`);

  // 2. 前回の件数と比較して増えてるか判定 & 値が変わっていたら DB（Gist）に保存
  const prevAkiyaCount = (await DB.get("chintaiAkiyaCount")) ?? 0;
  const cmpResult = compareCount(prevAkiyaCount, akiyaCount);
  console.log(`The count of akiya is ${cmpResult}`);

  const shouldNotify = cmpResult === "increased";
  const akiyaCountHasChanged = cmpResult !== "unchanged";

  if (akiyaCountHasChanged) {
    DB.set("chintaiAkiyaCount", akiyaCount);
  }

  // 3. 増えてたら LINE ボットで通知
  if (!shouldNotify) {
    console.log("No need for notification as akiya count has not increased.");
    exit();
  }

  const ok = await Notifier.notifyToBot(akiyaCount);
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
