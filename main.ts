import { AkiyaFetcher } from "./akiya-fetcher.ts";
import { DB } from "./db.ts";
import { DENO_ENV } from "./env.ts";
import { Akiya } from "./types.ts";
import { getArrayChanges } from "./utils.ts";
import { Notifier } from "./notifier.ts";

async function main() {
  // 1. 京丹後市の空き家バンクから空き家（賃貸のみ）の情報取得
  const akiyas = await unwrapOrExit(
    () => AkiyaFetcher.fetchAkiyasBy("chintai"),
    "Failed to retrieve akiyas. Exiting the process."
  );
  console.log(`The current count of akiya is ${akiyas.length}`);

  // 2. 現在の空き家の slugs から前回の slugs を引いて差があるか判定
  // TODO: ここを unwrapOrExit とかでいい感じに書けるようにする
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

  const isAkiyasIncreased = akiyaSlugsChanges.added.length > 0;
  const addedAkiyas = akiyas.filter((a) =>
    akiyaSlugsChanges.added.includes(a.slug)
  );

  // 3. 新規の空き家があれば DB（Gist）に保存 & LINE ボットで通知
  if (!isAkiyasIncreased) {
    console.log("No need for notification as akiyas has not increased.");
    exit();
  }

  // NOTE: 同じ物件を一度取り下げてからアップし直す場合もあるので、以下の条件で DB を更新する（削除された空き家の情報もそのまま残るということだが、数が少ないので許容する）
  // 1. 空き家が増えた時のみ DB を更新する
  // 2. 過去に一度も追加されていない空き家のみ追加する
  await unwrapOrExit(
    () => DB.set("chintaiAkiyas", [...addedAkiyas, ...prevAkiyas]),
    "Failed to update DB."
  );

  await unwrapOrExit(
    () => Notifier.notifyToBot(akiyas.length, addedAkiyas),
    "LINE bot notification failed."
  );

  console.log("LINE bot notification succeeded.");
}

async function unwrapOrExit<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<NonNullable<Awaited<T>>> {
  const result = await operation();
  if (!result) {
    console.error(errorMessage);
    exit(1);
  }
  return result;
}

function exit(code = 0): never {
  Deno.exit(code);
}

if (import.meta.main) {
  console.log(`DENO_ENV is "${DENO_ENV}"`);
  await main();
}
