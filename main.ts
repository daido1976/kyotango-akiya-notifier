import { AkiyaFetcher } from "./internal/akiya-fetcher.ts";
import { DB, toSchemaKey } from "./internal/db.ts";
import { DENO_ENV } from "./internal/env.ts";
import { Notifier } from "./internal/notifier.ts";
import { AkiyaKind, isAkiyaKind, toSlugs } from "./internal/Akiya.ts";
import { getOrThrow, fold } from "./internal/lib/result.ts";
import {
  exitOnFailure,
  exitOnSuccess,
  getArrayChanges,
} from "./internal/lib/utils.ts";
import { parseArgs } from "./internal/deps.ts";

async function main(kind: AkiyaKind) {
  // 1. 京丹後市の空き家バンクから賃貸 or 売買の空き家の情報取得
  const akiyas = getOrThrow(await AkiyaFetcher.fetchAkiyasBy(kind), () =>
    exitOnFailure("Failed to retrieve akiyas. Exiting the process.")
  );
  console.log(`The current count of akiya is ${akiyas.length}`);

  // 2. 現在の空き家の slugs から前回の slugs を引いて差があるか判定
  const prevAkiyasResult = await DB.get(toSchemaKey(kind));
  if (!prevAkiyasResult.success || !prevAkiyasResult.value) {
    console.warn(
      "Failed to retrieve previous akiyas. After setting current akiyas, Exit the process."
    );
    return fold(
      await DB.set(toSchemaKey(kind), akiyas),
      () => exitOnSuccess("Succeeded to update DB. Please run again later."),
      () => exitOnFailure("Failed to update DB.")
    );
  }
  const prevAkiyas = prevAkiyasResult.value;

  const akiyaSlugsChanges = getArrayChanges(
    toSlugs(prevAkiyas),
    toSlugs(akiyas)
  );
  console.log({ akiyaSlugsChanges });
  if (!akiyaSlugsChanges.isAdded) {
    exitOnSuccess("No need for notification as akiyas has not increased.");
  }

  // 3. 新規の空き家があれば DB（Gist）に保存 & LINE ボットで通知
  const addedAkiyas = akiyas.filter((a) =>
    akiyaSlugsChanges.added.includes(a.slug)
  );

  // NOTE: 同じ物件を一度取り下げてからアップし直す場合もあるので、以下の条件で DB を更新する（削除された空き家の情報もそのまま残るということだが、数が少ないので許容する）
  // - 空き家が増えた時のみ DB を更新する
  // - 過去に一度も追加されていない空き家のみ追加する
  fold(
    await DB.set(toSchemaKey(kind), [...addedAkiyas, ...prevAkiyas]),
    () => console.log("Succeeded to update DB."),
    () => exitOnFailure("Failed to update DB.")
  );

  fold(
    await Notifier.notifyToBot(akiyas.length, addedAkiyas, kind),
    () => console.log("LINE bot notification succeeded."),
    () => exitOnFailure("LINE bot notification failed.")
  );

  exitOnSuccess("All processes have completed successfully.");
}

if (import.meta.main) {
  // e.g. deno run -A main.ts --kind=chintai
  // e.g. deno run -A main.ts --kind=baibai
  const { kind } = parseArgs(Deno.args);
  if (!isAkiyaKind(kind)) {
    exitOnFailure(`Invalid AkiyaKind: ${kind}`);
  }
  console.log(`DENO_ENV is "${DENO_ENV}"`);
  console.log(`AkiyaKind is "${kind}"`);
  await main(kind);
}
