import { AkiyaFetcher } from "./akiya-fetcher.ts";
import { DB } from "./db.ts";
import { DENO_ENV } from "./env.ts";
import { Akiya } from "./types.ts";
import { getArrayChanges } from "./utils.ts";

async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の情報取得
  const akiyas = await AkiyaFetcher.fetchAkiyasBy("chintai");
  if (!akiyas) {
    console.error("Failed to retrieve akiyas. Exiting the process.");
    exit(1);
  }
  console.log(`The current count of akiya is ${akiyas.length}`);

  // 2. 現在の slugs から前回の slugs を引いて差があるか判定 & 差があれば DB（Gist）に保存
  const prevAkiyas = await DB.get("chintaiAkiyas");
  if (!prevAkiyas) {
    console.warn(
      "Failed to retrieve previous akiyas. After setting current akiyas, Exit the process."
    );
    const ok = await DB.set("chintaiAkiyas", akiyas);
    if (ok) {
      console.log("Succeeded to update DB. Please run again later.");
      exit();
    } else {
      console.error("Failed to update DB.");
      exit(1);
    }
  }

  const slugsFrom = (akiyas: Akiya[]) => akiyas.map((a) => a.slug);
  const akiyaSlugsChanges = getArrayChanges(
    slugsFrom(prevAkiyas),
    slugsFrom(akiyas)
  );
  console.log({ akiyaSlugsChanges });

  const shouldNotify = akiyaSlugsChanges.added.length > 0;
  const isAkiyasChanged = akiyaSlugsChanges.changed;

  if (isAkiyasChanged) {
    const ok = await DB.set("chintaiAkiyas", akiyas);
    if (!ok) {
      console.error("Failed to update DB.");
      exit(1);
    }
  }

  // 3. 増えてたら LINE ボットで通知
  if (!shouldNotify) {
    console.log("No need for notification as akiyas has not increased.");
    exit();
  }

  // TODO: 実装したらコメントアウト外す
  // const ok = await Notifier.notifyToBot(addedAkiyas);
  // if (!ok) {
  //   console.error("LINE bot notification failed.");
  //   exit(1);
  // }

  console.log("LINE bot notification succeeded.");
}

function exit(code = 0): never {
  Deno.exit(code);
}

if (import.meta.main) {
  console.log(`DENO_ENV is "${DENO_ENV}"`);
  await main();
}
