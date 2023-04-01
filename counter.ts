import { DB } from "./db.ts";

async function get(): Promise<number | null> {
  const count = await DB.get("chintaiAkiyaCount");
  return count ?? null;
}

// TODO: DB レイヤーでの成功・失敗をハンドリングする
async function set(value: number): Promise<boolean> {
  await DB.set("chintaiAkiyaCount", value);
  return true;
}

export const Counter = {
  get,
  set,
};

// for debug
import { delay } from "https://deno.land/std@0.182.0/async/delay.ts";
if (import.meta.main) {
  const count = await Counter.get();
  console.log({ count });

  // with side effect
  const ok = await Counter.set(count !== null ? count + 1 : 0);
  console.log({ ok });
  await delay(10000);

  const count2 = await Counter.get();
  console.log({ count2 });
}
