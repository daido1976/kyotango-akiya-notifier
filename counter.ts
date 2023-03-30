// TODO: gist かスプレッドシートに保存するように書き直す

// See. https://countapi.xyz/
async function get(): Promise<number | null> {
  const res = await fetch(
    "https://api.countapi.xyz/get/kyotango-akiya-notifier/chintai"
  );
  const count: { value: number } = await res.json();
  return count.value;
}

async function set(value: number): Promise<boolean> {
  const res = await fetch(
    `https://api.countapi.xyz/set/kyotango-akiya-notifier/chintai?value=${value}`
  );
  const count: { old_value: number; value: number } = await res.json();
  return !!(count.old_value && count.value);
}

export const Counter = {
  get,
  set,
};

// for debug
if (import.meta.main) {
  // Access the following url to initialize.
  // https://api.countapi.xyz/create?namespace=kyotango-akiya-notifier&key=chintai&value=20

  // NOTE: create の時に `enable_reset` を 1(true) にセットしないと set ができない仕様があり使い物にならないかも
  const ok = await Counter.set(19);
  console.log({ ok });

  const count = await Counter.get();
  console.log({ count });
}
