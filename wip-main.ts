import { AkiyaFetcher } from "./akiya-fetcher.ts";
import { DB } from "./db.ts";
import { DENO_ENV } from "./env.ts";

async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の情報取得
  const akiyas = await AkiyaFetcher.fetchAkiyasBy("chintai");
  if (!akiyas) {
    console.error("Failed to retrieve akiyas. Exiting the process.");
    exit(1);
  }
  console.log(`The current count of akiya is ${akiyas.length}`);

  // 2. 前回の slugs と比較して増えてるか判定 & 増えていたら DB（Gist）に保存
  const ok = await DB.set("chintaiAkiyas", akiyas);
  if (!ok) {
    console.error("Failed to update DB.");
    exit(1);
  }
}

function exit(code = 0): never {
  Deno.exit(code);
}

if (import.meta.main) {
  console.log(`DENO_ENV is "${DENO_ENV}"`);
  await main();
}
