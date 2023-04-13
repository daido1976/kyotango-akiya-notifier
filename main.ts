import { AkiyaFetcher } from "./akiya-fetcher.ts";
import { DB } from "./db.ts";
import { DENO_ENV } from "./env.ts";
import { Akiya } from "./types.ts";
import { exitOnFailure, exitOnSuccess, getArrayChanges } from "./utils.ts";
import { Notifier } from "./notifier.ts";
import { getOrThrow } from "./result.ts";

async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の情報取得
  const akiyas = getOrThrow(await AkiyaFetcher.fetchAkiyasBy("chintai"), () =>
    exitOnFailure("Failed to retrieve akiyas. Exiting the process.")
  );
  console.log(`The current count of akiya is ${akiyas.length}`);

  // 2. 現在の空き家の slugs から前回の slugs を引いて差があるか判定
  const prevAkiyasResult = await DB.get("chintaiAkiyas");
  if (!prevAkiyasResult.success || !prevAkiyasResult.value) {
    console.warn(
      "Failed to retrieve previous akiyas. After setting current akiyas, Exit the process."
    );
    // TODO: コンビネータ使う
    const result = await DB.set("chintaiAkiyas", akiyas);
    if (result.success) {
      exitOnSuccess("Succeeded to update DB. Please run again later.");
    } else {
      exitOnFailure("Failed to update DB.");
    }
  }
  const prevAkiyas = prevAkiyasResult.value;

  const slugsFrom = (akiyas: Akiya[]) => akiyas.map((a) => a.slug);
  const akiyaSlugsChanges = getArrayChanges(
    slugsFrom(prevAkiyas),
    slugsFrom(akiyas)
  );
  console.log({ akiyaSlugsChanges });

  const isAkiyasIncreased = akiyaSlugsChanges.added.length > 0;
  const addedAkiyas = akiyas.filter((a) =>
    akiyaSlugsChanges.added.includes(a.slug)
  );

  // 3. 新規の空き家があれば DB（Gist）に保存 & LINE ボットで通知
  if (!isAkiyasIncreased) {
    exitOnSuccess("No need for notification as akiyas has not increased.");
  }

  // NOTE: 同じ物件を一度取り下げてからアップし直す場合もあるので、以下の条件で DB を更新する（削除された空き家の情報もそのまま残るということだが、数が少ないので許容する）
  // - 空き家が増えた時のみ DB を更新する
  // - 過去に一度も追加されていない空き家のみ追加する
  getOrThrow(
    await DB.set("chintaiAkiyas", [...addedAkiyas, ...prevAkiyas]),
    () => exitOnFailure("Failed to update DB.")
  );

  getOrThrow(await Notifier.notifyToBot(akiyas.length, addedAkiyas), () =>
    exitOnFailure("LINE bot notification failed.")
  );

  console.log("LINE bot notification succeeded.");
}

if (import.meta.main) {
  console.log(`DENO_ENV is "${DENO_ENV}"`);
  await main();
}
